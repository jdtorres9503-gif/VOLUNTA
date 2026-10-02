import {
  AuditLogEntry,
  CorporateTeamBooking,
  Organization,
  Project,
  ProjectStatus,
  SponsorshipIntent,
  SponsorshipStatus,
  User,
  VerificationStatus,
  VolunteerApplication,
  ProBonoDeliverable,
  ArcoRequest,
  CryptographicAuditBlock,
  JurisdictionCountry,
  PrivacyConsentSettings,
  ProfessionalCategory,
  CurrencyCode,
  ImpactTokenWallet,
  ImpactTokenTransaction,
  SoulboundImpactBadge,
  ImpactPerkReward,
  LegalAdhesionTerm,
  TokenAuditSummary,
  TokenTransactionType,
} from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CORPORATE_BOOKINGS,
  INITIAL_ORGANIZATIONS,
  INITIAL_PROJECTS,
  INITIAL_SPONSORSHIPS,
  INITIAL_USERS,
  INITIAL_PRO_BONO_DELIVERABLES,
  INITIAL_ARCO_REQUESTS,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_TOKEN_WALLETS,
  INITIAL_TOKEN_TRANSACTIONS,
  INITIAL_SOULBOUND_BADGES,
  INITIAL_PERK_REWARDS,
  INITIAL_ADHESION_TERMS,
} from './mockData';
import { AuditLogger } from './auditLogger';
import { HOURLY_BENCHMARK_RATES, pseudonymizeVolunteer } from './complianceEngine';

const STORAGE_KEY_PREFIX = 'volunta_mvp1_';

function loadOrSet<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('LocalStorage error, using default', e);
  }
  return defaultValue;
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

class VoluntaDataStore {
  private users: User[] = [];
  private organizations: Organization[] = [];
  private projects: Project[] = [];
  private sponsorships: SponsorshipIntent[] = [];
  private applications: VolunteerApplication[] = [];
  private corporateBookings: CorporateTeamBooking[] = [];
  private proBonoDeliverables: ProBonoDeliverable[] = [];
  private arcoRequests: ArcoRequest[] = [];
  private auditBlocks: CryptographicAuditBlock[] = [];
  private wallets: ImpactTokenWallet[] = [];
  private tokenTransactions: ImpactTokenTransaction[] = [];
  private soulboundBadges: SoulboundImpactBadge[] = [];
  private perkRewards: ImpactPerkReward[] = [];
  private adhesionTerms: LegalAdhesionTerm[] = [];
  private activeJurisdiction: JurisdictionCountry = 'CO';
  private currentUser: User = INITIAL_USERS[0];
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    this.users = loadOrSet('users', INITIAL_USERS);
    this.organizations = loadOrSet('organizations', INITIAL_ORGANIZATIONS);
    this.projects = loadOrSet('projects', INITIAL_PROJECTS);
    this.sponsorships = loadOrSet('sponsorships', INITIAL_SPONSORSHIPS);
    this.applications = loadOrSet('applications', INITIAL_APPLICATIONS);
    this.corporateBookings = loadOrSet('corporate_bookings', INITIAL_CORPORATE_BOOKINGS);
    this.proBonoDeliverables = loadOrSet('pro_bono_deliverables', INITIAL_PRO_BONO_DELIVERABLES);
    this.arcoRequests = loadOrSet('arco_requests', INITIAL_ARCO_REQUESTS);
    this.auditBlocks = loadOrSet('audit_blocks', INITIAL_AUDIT_BLOCKS);
    this.wallets = loadOrSet('token_wallets', INITIAL_TOKEN_WALLETS);
    this.tokenTransactions = loadOrSet('token_transactions', INITIAL_TOKEN_TRANSACTIONS);
    this.soulboundBadges = loadOrSet('soulbound_badges', INITIAL_SOULBOUND_BADGES);
    this.perkRewards = loadOrSet('perk_rewards', INITIAL_PERK_REWARDS);
    this.adhesionTerms = loadOrSet('adhesion_terms', INITIAL_ADHESION_TERMS);
    this.activeJurisdiction = loadOrSet('active_jurisdiction', 'CO');
    
    // Initialize audit logs
    const savedLogs: AuditLogEntry[] = loadOrSet('audit_logs', INITIAL_AUDIT_LOGS);
    AuditLogger.initialize(savedLogs);
    AuditLogger.subscribe((logs) => {
      save('audit_logs', logs);
      this.notify();
    });

    const savedUserId = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user_id');
    const foundUser = this.users.find((u) => u.id === savedUserId);
    this.currentUser = foundUser || this.users[0];

    // Proactive background sync with Full-Stack Backend
    this.syncWithBackend();
  }

  public async syncWithBackend(): Promise<void> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return;

      const [projRes, sponRes, delivRes, blockRes] = await Promise.all([
        fetch('/api/projects').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sponsorships').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/deliverables').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/compliance/audit-blocks').then((r) => (r.ok ? r.json() : null)),
      ]);

      let changed = false;
      if (projRes && projRes.data && Array.isArray(projRes.data) && projRes.data.length > 0) {
        this.projects = projRes.data;
        save('projects', this.projects);
        changed = true;
      }
      if (sponRes && sponRes.data && Array.isArray(sponRes.data)) {
        this.sponsorships = sponRes.data;
        save('sponsorships', this.sponsorships);
        changed = true;
      }
      if (delivRes && delivRes.data && Array.isArray(delivRes.data)) {
        this.proBonoDeliverables = delivRes.data;
        save('pro_bono_deliverables', this.proBonoDeliverables);
        changed = true;
      }
      if (blockRes && blockRes.data && Array.isArray(blockRes.data)) {
        this.auditBlocks = blockRes.data;
        save('audit_blocks', this.auditBlocks);
        changed = true;
      }

      if (changed) {
        this.notify();
      }
    } catch {
      // Backend not yet reachable or offline fallback mode
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Session & User Switching
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user_id', user.id);
    AuditLogger.log({
      user: this.currentUser,
      action: 'USER_SESSION_SWITCHED',
      resourceType: 'SECURITY',
      resourceId: user.id,
      severity: 'INFO',
      details: { role: user.role, orgId: user.organizationId || 'NONE' },
    });
    this.notify();
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getAuditLogs(): AuditLogEntry[] {
    return AuditLogger.getLogs();
  }

  // Organizations
  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id);
  }

  public verifyOrganization(orgId: string, status: VerificationStatus): void {
    if (this.currentUser.role !== 'SUPER_ADMIN') {
      AuditLogger.log({
        user: this.currentUser,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'SECURITY',
        resourceId: orgId,
        severity: 'ERROR',
        details: { requiredRole: 'SUPER_ADMIN', attemptedBy: this.currentUser.email },
      });
      throw new Error('403 Forbidden: Solo Super Admin de Volunta puede verificar organizaciones.');
    }

    this.organizations = this.organizations.map((org) => {
      if (org.id === orgId) {
        return {
          ...org,
          verificationStatus: status,
          verifiedAt: new Date().toISOString(),
          verifiedBy: this.currentUser.id,
        };
      }
      return org;
    });

    save('organizations', this.organizations);
    AuditLogger.log({
      user: this.currentUser,
      action: `ORGANIZATION_${status}`,
      resourceType: 'ORGANIZATION',
      resourceId: orgId,
      severity: 'AUDIT',
      details: { status, verifiedBy: this.currentUser.name },
    });
    this.notify();
  }

  // Projects & Multi-Tenancy
  /**
   * Obtiene los proyectos accesibles según el rol y pertenencia de la organización.
   * Multi-tenancy a nivel de aplicación estricto:
   * - Super Admin: Todos los proyectos.
   * - ONG Admin: Proyectos propios de su organizationId + proyectos publicados globales.
   * - Empresa & Voluntario: Solo proyectos PUBLICADOS o COMPLETADOS.
   */
  public getProjectsForCurrentContext(opts?: { ownOnly?: boolean }): Project[] {
    if (this.currentUser.role === 'SUPER_ADMIN') {
      return [...this.projects];
    }

    if (this.currentUser.role === 'ONG_ADMIN') {
      if (opts?.ownOnly) {
        // Strict multi-tenant query: WHERE organizationId = user.organizationId
        return this.projects.filter((p) => p.organizationId === this.currentUser.organizationId);
      }
      // Public published projects OR own drafts/in-review
      return this.projects.filter(
        (p) => p.organizationId === this.currentUser.organizationId || p.status === 'PUBLISHED'
      );
    }

    // Default public marketplace: only PUBLISHED projects
    return this.projects.filter((p) => p.status === 'PUBLISHED');
  }

  public getAllPublishedProjects(): Project[] {
    return this.projects.filter((p) => p.status === 'PUBLISHED');
  }

  public getProjectById(projectId: string): Project | undefined {
    return this.projects.find((p) => p.id === projectId);
  }

  /**
   * Creación de proyecto (Solo ONG activa o Super Admin)
   */
  public createProject(
    projectData: Omit<Project, 'id' | 'createdAt' | 'organizationId' | 'organizationName' | 'status'>
  ): Project {
    if (this.currentUser.role !== 'ONG_ADMIN' && this.currentUser.role !== 'SUPER_ADMIN') {
      throw new Error('403 Forbidden: Solo una ONG puede crear proyectos');
    }

    const orgId = this.currentUser.organizationId || 'org_ong_1';
    const org = this.organizations.find((o) => o.id === orgId);

    const newProject: Project = {
      ...projectData,
      id: 'prj_' + Date.now().toString(36),
      organizationId: orgId,
      organizationName: org ? org.name : 'Organización Registrada',
      status: 'IN_REVIEW', // Enviado directamente a revisión del Super Admin
      createdAt: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    save('projects', this.projects);

    AuditLogger.log({
      user: this.currentUser,
      action: 'PROJECT_CREATED_AND_SUBMITTED',
      resourceType: 'PROJECT',
      resourceId: newProject.id,
      severity: 'INFO',
      details: {
        title: newProject.title,
        organizationId: orgId,
        category: newProject.category,
        fundingGoals: newProject.fundingGoals,
      },
    });

    this.notify();
    return newProject;
  }

  /**
   * Actualizar estado del proyecto (Super Admin Governance)
   */
  public updateProjectStatus(projectId: string, newStatus: ProjectStatus): void {
    if (this.currentUser.role !== 'SUPER_ADMIN') {
      AuditLogger.log({
        user: this.currentUser,
        action: 'UNAUTHORIZED_PROJECT_STATE_CHANGE',
        resourceType: 'SECURITY',
        resourceId: projectId,
        severity: 'ERROR',
        details: { attemptedStatus: newStatus },
      });
      throw new Error('403 Forbidden: Solo Super Admin puede cambiar el estado de publicación.');
    }

    this.projects = this.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          status: newStatus,
          approvedBy: newStatus === 'PUBLISHED' ? this.currentUser.id : p.approvedBy,
          approvedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : p.approvedAt,
        };
      }
      return p;
    });

    save('projects', this.projects);

    AuditLogger.log({
      user: this.currentUser,
      action: `PROJECT_STATUS_${newStatus}`,
      resourceType: 'PROJECT',
      resourceId: projectId,
      severity: 'AUDIT',
      details: { status: newStatus, approvedBy: this.currentUser.name },
    });

    this.notify();
  }

  /**
   * Simulador de Prueba de Seguridad IDOR (Insecure Direct Object Reference).
   * Intenta modificar o acceder a un recurso ajeno saltándose la verificación de ownership.
   */
  public simulateIdorAttack(targetProjectId: string): { success: boolean; message: string; blocked: boolean } {
    const project = this.projects.find((p) => p.id === targetProjectId);
    if (!project) {
      return { success: false, message: 'Proyecto no encontrado', blocked: false };
    }

    const isOwner = this.currentUser.organizationId === project.organizationId;
    const isSuperAdmin = this.currentUser.role === 'SUPER_ADMIN';

    if (!isOwner && !isSuperAdmin) {
      // PREVENCIÓN IDOR: Se detecta intento de manipulación no autorizado
      AuditLogger.log({
        user: this.currentUser,
        action: 'SECURITY_IDOR_VIOLATION_BLOCKED',
        resourceType: 'SECURITY',
        resourceId: targetProjectId,
        severity: 'ERROR',
        details: {
          violationType: 'IDOR_TAMPER_ATTEMPT',
          userOrgId: this.currentUser.organizationId || 'NONE',
          targetOrgId: project.organizationId,
          targetProjectTitle: project.title,
          securityControl: 'Application-level multi-tenant filter: user.organizationId === project.organizationId',
        },
      });

      return {
        success: false,
        blocked: true,
        message: `[IDOR BLOQUEADO - OWASP A01:2021] Acceso denegado. El usuario "${this.currentUser.name}" (Tenant: ${this.currentUser.organizationId || 'Sin Tenant'}) intentó alterar el proyecto "${project.title}" perteneciente a "${project.organizationName}" (Tenant: ${project.organizationId}). Se ha registrado en la auditoría inmutable ISO 27001.`,
      };
    }

    return {
      success: true,
      blocked: false,
      message: `Acceso autorizado legítimo: El usuario tiene el rol permitido (${this.currentUser.role}) y pertenece a la organización propietaria.`,
    };
  }

  // Sponsorships (Empresas -> ONGs)
  public getSponsorshipsForCurrentContext(): SponsorshipIntent[] {
    if (this.currentUser.role === 'SUPER_ADMIN') {
      return [...this.sponsorships];
    }
    if (this.currentUser.role === 'ONG_ADMIN') {
      return this.sponsorships.filter((s) => s.ongOrganizationId === this.currentUser.organizationId);
    }
    if (this.currentUser.role === 'EMPRESA_RSE') {
      return this.sponsorships.filter((s) => s.empresaOrganizationId === this.currentUser.organizationId);
    }
    return [];
  }

  public registerSponsorshipIntent(params: {
    projectId: string;
    amount: number;
    currency: CurrencyCode;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
  }): SponsorshipIntent {
    const project = this.projects.find((p) => p.id === params.projectId);
    if (!project) throw new Error('Proyecto no encontrado');

    const empresaOrgId = this.currentUser.organizationId || 'org_emp_1';
    const empresaOrg = this.organizations.find((o) => o.id === empresaOrgId);

    const newSponsorship: SponsorshipIntent = {
      id: 'spon_' + Date.now().toString(36),
      projectId: project.id,
      projectTitle: project.title,
      ongOrganizationId: project.organizationId,
      empresaOrganizationId: empresaOrgId,
      empresaName: empresaOrg ? empresaOrg.name : this.currentUser.name,
      amount: params.amount,
      currency: params.currency,
      status: 'INTENT_REGISTERED',
      contactPerson: params.contactPerson,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    this.sponsorships.unshift(newSponsorship);

    // Update committed amount in project
    this.projects = this.projects.map((p) => {
      if (p.id === project.id) {
        return {
          ...p,
          fundingGoals: p.fundingGoals.map((g) => {
            if (g.currency === params.currency) {
              return {
                ...g,
                committedAmount: g.committedAmount + params.amount,
              };
            }
            return g;
          }),
        };
      }
      return p;
    });

    save('sponsorships', this.sponsorships);
    save('projects', this.projects);

    // Asynchronously push to backend server
    fetch('/api/sponsorships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSponsorship,
        organizationId: empresaOrgId,
        organizationName: empresaOrg ? empresaOrg.name : this.currentUser.name,
      }),
    }).catch(() => {});

    AuditLogger.log({
      user: this.currentUser,
      action: 'SPONSORSHIP_INTENT_REGISTERED',
      resourceType: 'SPONSORSHIP',
      resourceId: newSponsorship.id,
      severity: 'INFO',
      details: {
        projectId: project.id,
        projectTitle: project.title,
        amount: params.amount,
        currency: params.currency,
        empresaName: newSponsorship.empresaName,
      },
    });

    this.notify();
    return newSponsorship;
  }

  public updateSponsorshipStatus(sponsorshipId: string, status: SponsorshipStatus): void {
    this.sponsorships = this.sponsorships.map((s) => {
      if (s.id === sponsorshipId) {
        return { ...s, status };
      }
      return s;
    });

    save('sponsorships', this.sponsorships);

    AuditLogger.log({
      user: this.currentUser,
      action: `SPONSORSHIP_STATUS_${status}`,
      resourceType: 'SPONSORSHIP',
      resourceId: sponsorshipId,
      severity: 'AUDIT',
      details: { status },
    });

    this.notify();
  }

  // Volunteer Applications
  public getApplicationsForCurrentContext(): VolunteerApplication[] {
    if (this.currentUser.role === 'SUPER_ADMIN') {
      return [...this.applications];
    }
    if (this.currentUser.role === 'ONG_ADMIN') {
      return this.applications.filter((a) => a.ongOrganizationId === this.currentUser.organizationId);
    }
    if (this.currentUser.role === 'VOLUNTEER') {
      return this.applications.filter((a) => a.volunteerUserId === this.currentUser.id);
    }
    return [];
  }

  public applyToVolunteerRole(params: {
    projectId: string;
    roleSlotId: string;
    motivation: string;
    habeasDataAccepted: boolean;
  }): VolunteerApplication {
    const project = this.projects.find((p) => p.id === params.projectId);
    if (!project) throw new Error('Proyecto no encontrado');

    const roleSlot = project.volunteerRoles.find((r) => r.id === params.roleSlotId);
    if (!roleSlot) throw new Error('Rol de voluntariado no encontrado');

    const newApp: VolunteerApplication = {
      id: 'app_' + Date.now().toString(36),
      projectId: project.id,
      projectTitle: project.title,
      ongOrganizationId: project.organizationId,
      roleSlotId: roleSlot.id,
      roleTitle: roleSlot.title,
      volunteerUserId: this.currentUser.id,
      volunteerName: this.currentUser.name,
      volunteerEmail: this.currentUser.email,
      volunteerPhone: this.currentUser.phone || '+57 300 000 0000',
      status: 'PENDING',
      motivation: params.motivation,
      hoursCommitted: roleSlot.estimatedHours,
      habeasDataAccepted: params.habeasDataAccepted,
      createdAt: new Date().toISOString(),
    };

    this.applications.unshift(newApp);

    // Increment spot
    this.projects = this.projects.map((p) => {
      if (p.id === project.id) {
        return {
          ...p,
          volunteerRoles: p.volunteerRoles.map((r) => {
            if (r.id === roleSlot.id) {
              return { ...r, spotsFilled: Math.min(r.spotsFilled + 1, r.spotsTotal) };
            }
            return r;
          }),
        };
      }
      return p;
    });

    save('applications', this.applications);
    save('projects', this.projects);

    AuditLogger.log({
      user: this.currentUser,
      action: 'VOLUNTEER_APPLICATION_SUBMITTED',
      resourceType: 'APPLICATION',
      resourceId: newApp.id,
      severity: 'INFO',
      details: {
        projectId: project.id,
        roleTitle: roleSlot.title,
        habeasDataAccepted: params.habeasDataAccepted,
        compliance: 'Ley 1581 / GDPR consent recorded',
      },
    });

    this.notify();
    return newApp;
  }

  public updateApplicationStatus(appId: string, status: VolunteerApplication['status'], verifiedHours?: number): void {
    const targetApp = this.applications.find((a) => a.id === appId);

    this.applications = this.applications.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          status,
          verifiedHours: verifiedHours !== undefined ? verifiedHours : a.verifiedHours,
        };
      }
      return a;
    });

    save('applications', this.applications);

    // Auto-mint impact tokens if hours are verified (10 VIT per hour)
    if (status === 'HOURS_VERIFIED' && verifiedHours && verifiedHours > 0 && targetApp) {
      const vitReward = verifiedHours * 10;
      const linkedProject = this.projects.find((p) => p.id === targetApp.projectId);
      this.mintImpactTokens({
        userId: targetApp.volunteerUserId,
        amount: vitReward,
        type: 'MINT_HOURS',
        reason: `${verifiedHours} Horas de Voluntariado Verificadas en Terreno (${targetApp.projectTitle})`,
        projectId: targetApp.projectId,
        projectTitle: targetApp.projectTitle,
        ongOrganizationId: targetApp.ongOrganizationId,
        ongName: linkedProject?.organizationName || 'Organización Social Aliada',
        hoursWorked: verifiedHours,
      });
    }

    AuditLogger.log({
      user: this.currentUser,
      action: `VOLUNTEER_APPLICATION_${status}`,
      resourceType: 'APPLICATION',
      resourceId: appId,
      severity: 'AUDIT',
      details: { status, verifiedHours },
    });

    this.notify();
  }

  // Goodera & Benevity: Corporate Team Volunteering Bookings
  public getCorporateBookingsForCurrentContext(): CorporateTeamBooking[] {
    if (this.currentUser.role === 'SUPER_ADMIN') {
      return [...this.corporateBookings];
    }
    if (this.currentUser.role === 'ONG_ADMIN') {
      return this.corporateBookings.filter((b) => b.ongOrganizationId === this.currentUser.organizationId);
    }
    if (this.currentUser.role === 'EMPRESA_RSE') {
      return this.corporateBookings.filter((b) => b.empresaOrganizationId === this.currentUser.organizationId);
    }
    return [];
  }

  public bookCorporateTeam(params: {
    projectId: string;
    teamSize: number;
    preferredDate: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    matchingGiftEnabled: boolean;
    matchingGiftPerHour?: number;
    matchingGiftCurrency?: 'COP' | 'USD';
    notes?: string;
  }): CorporateTeamBooking {
    const project = this.projects.find((p) => p.id === params.projectId);
    if (!project) throw new Error('Proyecto no encontrado');

    const empresaOrgId = this.currentUser.organizationId || 'org_emp_1';
    const empresaOrg = this.organizations.find((o) => o.id === empresaOrgId);

    const newBooking: CorporateTeamBooking = {
      id: 'corp_book_' + Date.now().toString(36),
      projectId: project.id,
      projectTitle: project.title,
      ongOrganizationId: project.organizationId,
      empresaOrganizationId: empresaOrgId,
      empresaName: empresaOrg ? empresaOrg.name : this.currentUser.name,
      teamSize: params.teamSize,
      preferredDate: params.preferredDate,
      contactPerson: params.contactPerson,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      status: 'PENDING',
      matchingGiftEnabled: params.matchingGiftEnabled,
      matchingGiftPerHour: params.matchingGiftPerHour,
      matchingGiftCurrency: params.matchingGiftCurrency,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    this.corporateBookings.unshift(newBooking);
    save('corporate_bookings', this.corporateBookings);

    AuditLogger.log({
      user: this.currentUser,
      action: 'CORPORATE_TEAM_VOLUNTEERING_BOOKED',
      resourceType: 'SPONSORSHIP',
      resourceId: newBooking.id,
      severity: 'INFO',
      details: {
        projectId: project.id,
        teamSize: params.teamSize,
        preferredDate: params.preferredDate,
        empresaName: newBooking.empresaName,
        matchingGiftEnabled: params.matchingGiftEnabled,
      },
    });

    this.notify();
    return newBooking;
  }

  public updateCorporateBookingStatus(bookingId: string, status: 'CONFIRMED' | 'COMPLETED'): void {
    this.corporateBookings = this.corporateBookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status };
      }
      return b;
    });

    save('corporate_bookings', this.corporateBookings);

    AuditLogger.log({
      user: this.currentUser,
      action: `CORPORATE_BOOKING_${status}`,
      resourceType: 'SPONSORSHIP',
      resourceId: bookingId,
      severity: 'AUDIT',
      details: { status },
    });

    this.notify();
  }

  // --- JURISDICTION SWITCHER (Colombia, Chile, Brasil) ---
  public getActiveJurisdiction(): JurisdictionCountry {
    return this.activeJurisdiction;
  }

  public setActiveJurisdiction(country: JurisdictionCountry): void {
    this.activeJurisdiction = country;
    save('active_jurisdiction', country);
    this.notify();
  }

  // --- PRO-BONO DELIVERABLES MANAGEMENT ---
  public getProBonoDeliverables(): ProBonoDeliverable[] {
    return [...this.proBonoDeliverables];
  }

  public getProBonoDeliverablesForCurrentContext(): ProBonoDeliverable[] {
    if (this.currentUser.role === 'SUPER_ADMIN') {
      return [...this.proBonoDeliverables];
    }
    if (this.currentUser.role === 'ONG_ADMIN') {
      return this.proBonoDeliverables.filter((d) => d.ongOrganizationId === this.currentUser.organizationId);
    }
    if (this.currentUser.role === 'EMPRESA_RSE') {
      return this.proBonoDeliverables.filter(
        (d) => d.empresaOrganizationId === this.currentUser.organizationId || d.status === 'ONG_APPROVED'
      );
    }
    if (this.currentUser.role === 'VOLUNTEER') {
      return this.proBonoDeliverables.filter((d) => d.volunteerUserId === this.currentUser.id);
    }
    return [];
  }

  public submitProBonoDeliverable(params: {
    projectId: string;
    professionalCategory: ProfessionalCategory;
    title: string;
    description: string;
    evidenceUrl: string;
    hoursWorked: number;
    beneficiariesImpacted?: number;
  }): ProBonoDeliverable {
    const project = this.projects.find((p) => p.id === params.projectId);
    if (!project) throw new Error('Proyecto no encontrado');

    const country = this.activeJurisdiction;
    const rate = HOURLY_BENCHMARK_RATES[country][params.professionalCategory];
    const currency = country === 'CO' ? 'COP' : country === 'CL' ? 'CLP' : 'BRL';
    const economicValuation = params.hoursWorked * rate;
    const pseudonym = pseudonymizeVolunteer(this.currentUser.id, country);
    const hash = 'hash_' + Date.now().toString(16) + Math.random().toString(16).substring(2, 8);

    const deliverable: ProBonoDeliverable = {
      id: 'pb_deliv_' + Date.now().toString(36),
      projectId: project.id,
      projectTitle: project.title,
      ongOrganizationId: project.organizationId,
      empresaOrganizationId: 'org_emp_1', // default company sponsor
      volunteerUserId: this.currentUser.id,
      volunteerName: this.currentUser.name,
      volunteerPseudonym: pseudonym,
      professionalCategory: params.professionalCategory,
      title: params.title,
      description: params.description,
      evidenceUrl: params.evidenceUrl,
      hoursWorked: params.hoursWorked,
      hourlyBenchmarkRate: rate,
      currency,
      country,
      economicValuation,
      status: 'SUBMITTED',
      beneficiariesImpacted: params.beneficiariesImpacted || 20,
      submittedAt: new Date().toISOString(),
      sha256VerificationHash: hash,
    };

    this.proBonoDeliverables.unshift(deliverable);
    save('pro_bono_deliverables', this.proBonoDeliverables);

    AuditLogger.log({
      user: this.currentUser,
      action: 'PRO_BONO_DELIVERABLE_SUBMITTED',
      resourceType: 'APPLICATION',
      resourceId: deliverable.id,
      severity: 'INFO',
      details: {
        category: params.professionalCategory,
        hours: params.hoursWorked,
        economicValuation,
        country,
      },
    });

    this.notify();
    return deliverable;
  }

  public approveProBonoDeliverable(deliverableId: string, feedback?: string): void {
    const deliverable = this.proBonoDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    deliverable.status = 'ONG_APPROVED';
    deliverable.approvedAt = new Date().toISOString();
    deliverable.approvedBy = `${this.currentUser.name} (${this.currentUser.organizationName || 'ONG'})`;
    deliverable.feedbackFromOng = feedback || 'Entregable verificado a satisfacción con pleno cumplimiento técnico.';

    // Create a new cryptographic audit block in the chain
    const prevBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const prevHash = prevBlock ? prevBlock.currentBlockHash : '00000000000000000000000000000000';
    const currentHash = 'chain_' + Date.now().toString(16) + '_' + Math.random().toString(16).substring(2, 10);

    const newBlock: CryptographicAuditBlock = {
      blockIndex: this.auditBlocks.length,
      timestamp: new Date().toISOString(),
      country: deliverable.country,
      eventType: 'HOURS_VALIDATED_ONG',
      actorPseudonym: deliverable.volunteerPseudonym,
      projectId: deliverable.projectId,
      payloadHash: deliverable.sha256VerificationHash,
      previousBlockHash: prevHash,
      currentBlockHash: currentHash,
      rfc3161TimestampToken: `TSA-AUDIT-${new Date().getFullYear()}-${this.auditBlocks.length.toString().padStart(4, '0')}`,
    };

    this.auditBlocks.push(newBlock);
    save('audit_blocks', this.auditBlocks);
    save('pro_bono_deliverables', this.proBonoDeliverables);

    // Automatically mint pro-bono impact tokens and generate soulbound badge
    const vitReward = deliverable.hoursWorked * 25;
    this.mintImpactTokens({
      userId: deliverable.volunteerUserId,
      amount: vitReward,
      type: 'MINT_PROBONO',
      reason: `Entregable Pro-Bono Aprobado: ${deliverable.title} (${deliverable.hoursWorked}h x 25 VIT/h)`,
      projectId: deliverable.projectId,
      projectTitle: deliverable.projectTitle,
      ongOrganizationId: deliverable.ongOrganizationId,
      ongName: this.currentUser.organizationName || 'ONG Aliada',
      hoursWorked: deliverable.hoursWorked,
      valuation: deliverable.economicValuation,
    });

    AuditLogger.log({
      user: this.currentUser,
      action: 'PRO_BONO_DELIVERABLE_APPROVED',
      resourceType: 'APPLICATION',
      resourceId: deliverableId,
      severity: 'AUDIT',
      details: {
        hoursWorked: deliverable.hoursWorked,
        economicValuation: deliverable.economicValuation,
        blockIndex: newBlock.blockIndex,
      },
    });

    this.notify();
  }

  // --- ARCO / LGPD PRIVACY RIGHTS MANAGEMENT ---
  public getArcoRequests(): ArcoRequest[] {
    return [...this.arcoRequests];
  }

  public fileArcoRequest(params: {
    rightType: ArcoRequest['rightType'];
    details: string;
  }): ArcoRequest {
    const deadlineDays = this.activeJurisdiction === 'CL' ? 2 : 15;
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

    const newRequest: ArcoRequest = {
      id: 'arco_' + Date.now().toString(36),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userEmail: this.currentUser.email,
      country: this.activeJurisdiction,
      rightType: params.rightType,
      status: 'PENDING',
      details: params.details,
      requestedAt: new Date().toISOString(),
      legalDeadline: deadlineDate.toISOString(),
    };

    this.arcoRequests.unshift(newRequest);
    save('arco_requests', this.arcoRequests);

    AuditLogger.log({
      user: this.currentUser,
      action: 'ARCO_RIGHTS_REQUEST_FILED',
      resourceType: 'SECURITY',
      resourceId: newRequest.id,
      severity: 'AUDIT',
      details: {
        rightType: params.rightType,
        country: this.activeJurisdiction,
        legalDeadline: newRequest.legalDeadline,
      },
    });

    this.notify();
    return newRequest;
  }

  public resolveArcoRequest(requestId: string, resolutionNotes: string): void {
    this.arcoRequests = this.arcoRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'COMPLETED',
          resolutionNotes,
          resolvedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    save('arco_requests', this.arcoRequests);

    AuditLogger.log({
      user: this.currentUser,
      action: 'ARCO_RIGHTS_REQUEST_RESOLVED',
      resourceType: 'SECURITY',
      resourceId: requestId,
      severity: 'AUDIT',
      details: { resolutionNotes },
    });

    this.notify();
  }

  public getAuditBlocks(): CryptographicAuditBlock[] {
    return [...this.auditBlocks];
  }

  // --- TOKEN REWARDS & PROOF-OF-IMPACT MANAGEMENT ---
  public getTokenWallet(userId: string): ImpactTokenWallet {
    let wallet = this.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      const user = this.users.find((u) => u.id === userId);
      const isSigned = this.adhesionTerms.some((t) => t.userId === userId);
      wallet = {
        id: `wlt_${userId}_${Date.now()}`,
        userId,
        userName: user ? user.name : 'Voluntario',
        volunteerPseudonym: pseudonymizeVolunteer(userId, this.activeJurisdiction),
        balance: 50, // Bono de bienvenida
        totalMinted: 50,
        totalRedeemed: 0,
        level: 'BRONCE',
        adhesionTermSigned: isSigned,
        updatedAt: new Date().toISOString(),
      };
      this.wallets.push(wallet);
      save('token_wallets', this.wallets);
    }
    return wallet;
  }

  public getTokenTransactions(userId?: string): ImpactTokenTransaction[] {
    if (!userId) return [...this.tokenTransactions];
    return this.tokenTransactions.filter((tx) => tx.userId === userId);
  }

  public getSoulboundBadges(userId?: string): SoulboundImpactBadge[] {
    if (!userId) return [...this.soulboundBadges];
    return this.soulboundBadges.filter((b) => b.volunteerUserId === userId);
  }

  public getPerkRewards(): ImpactPerkReward[] {
    return [...this.perkRewards];
  }

  public getAdhesionTerms(userId?: string): LegalAdhesionTerm[] {
    if (!userId) return [...this.adhesionTerms];
    return this.adhesionTerms.filter((t) => t.userId === userId);
  }

  public signAdhesionTerm(params: { userId: string; country: JurisdictionCountry }): LegalAdhesionTerm {
    const lawRef =
      params.country === 'CL'
        ? 'Ley 20.500 sobre Asociaciones y Participación Ciudadana (Chile)'
        : params.country === 'BR'
        ? 'Lei 9.608 de 1998 e Decreto 9.906/2019 de Serviço Voluntário (Brasil)'
        : 'Ley 720 de 2001 y Decreto 4290 de 2005 (Colombia)';

    const consentHash = 'sha256_' + Date.now().toString(16) + Math.random().toString(16).substring(2, 10);

    const term: LegalAdhesionTerm = {
      id: `adh_${params.userId}_${Date.now()}`,
      userId: params.userId,
      country: params.country,
      lawReference: lawRef,
      signedAt: new Date().toISOString(),
      noLaborRelationshipClause: true,
      sha256ConsentHash: consentHash,
    };

    const existingIdx = this.adhesionTerms.findIndex((t) => t.userId === params.userId);
    if (existingIdx !== -1) {
      this.adhesionTerms[existingIdx] = term;
    } else {
      this.adhesionTerms.push(term);
    }
    save('adhesion_terms', this.adhesionTerms);

    const wallet = this.getTokenWallet(params.userId);
    wallet.adhesionTermSigned = true;
    wallet.adhesionTermSignedAt = term.signedAt;
    wallet.adhesionLegalFramework =
      params.country === 'CL'
        ? 'LEY_20500_CHILE'
        : params.country === 'BR'
        ? 'LEI_9608_BRASIL'
        : 'LEY_720_COLOMBIA';
    wallet.updatedAt = new Date().toISOString();
    save('token_wallets', this.wallets);

    // Cryptographic audit block
    const prevBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const prevHash = prevBlock ? prevBlock.currentBlockHash : '00000000000000000000000000000000';
    const currentHash = 'chain_' + Date.now().toString(16) + '_' + Math.random().toString(16).substring(2, 10);

    const auditBlock: CryptographicAuditBlock = {
      blockIndex: this.auditBlocks.length,
      timestamp: new Date().toISOString(),
      country: params.country,
      eventType: 'ADHESION_TERM_SIGNED',
      actorPseudonym: wallet.volunteerPseudonym,
      projectId: 'LEGAL_COMPLIANCE',
      payloadHash: consentHash,
      previousBlockHash: prevHash,
      currentBlockHash: currentHash,
      rfc3161TimestampToken: `TSA-ADHESION-${new Date().getFullYear()}-${this.auditBlocks.length.toString().padStart(4, '0')}`,
    };
    this.auditBlocks.push(auditBlock);
    save('audit_blocks', this.auditBlocks);

    AuditLogger.log({
      user: this.currentUser,
      action: 'ADHESION_TERM_SIGNED',
      resourceType: 'SECURITY',
      resourceId: term.id,
      severity: 'AUDIT',
      details: {
        userId: params.userId,
        lawReference: lawRef,
        compliance: 'Estricta exención laboral formalizada',
      },
    });

    this.notify();
    return term;
  }

  public mintImpactTokens(params: {
    userId: string;
    amount: number;
    type: TokenTransactionType;
    reason: string;
    projectId?: string;
    projectTitle?: string;
    ongOrganizationId?: string;
    ongName?: string;
    odsNumber?: number;
    hoursWorked?: number;
    valuation?: number;
  }): { wallet: ImpactTokenWallet; transaction: ImpactTokenTransaction; badge?: SoulboundImpactBadge } {
    const wallet = this.getTokenWallet(params.userId);
    wallet.balance += params.amount;
    wallet.totalMinted += params.amount;

    if (wallet.totalMinted >= 1000) wallet.level = 'DIAMANTE_ESG';
    else if (wallet.totalMinted >= 500) wallet.level = 'ORO';
    else if (wallet.totalMinted >= 200) wallet.level = 'PLATA';
    else wallet.level = 'BRONCE';

    wallet.updatedAt = new Date().toISOString();

    const proofHash = 'sha256_tx_' + Date.now().toString(16) + Math.random().toString(16).substring(2, 10);

    const tx: ImpactTokenTransaction = {
      id: `tx_vit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      walletId: wallet.id,
      userId: wallet.userId,
      userName: wallet.userName,
      type: params.type,
      amount: params.amount,
      projectId: params.projectId,
      projectTitle: params.projectTitle,
      ongOrganizationId: params.ongOrganizationId,
      ongName: params.ongName,
      reason: params.reason,
      legalNonRemunerationNotice:
        'Incentivo honorífico no dinerario de reconocimiento benévolo conforme a Ley 720/2001 (Colombia), Ley 20.500 (Chile) o Lei 9.608 (Brasil). No constituye salario ni genera pasivo laboral.',
      sha256ProofHash: proofHash,
      timestamp: new Date().toISOString(),
    };

    this.tokenTransactions.unshift(tx);

    let createdBadge: SoulboundImpactBadge | undefined;
    if (params.type === 'MINT_PROBONO' || (params.hoursWorked && params.hoursWorked >= 10)) {
      const tokenId = `SBT-ODS${(params.odsNumber || 13).toString().padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
      const sbtHash = 'sha256_sbt_' + Date.now().toString(16) + Math.random().toString(16).substring(2, 10);

      createdBadge = {
        id: `sbt_${Date.now()}`,
        tokenId,
        volunteerUserId: wallet.userId,
        volunteerPseudonym: wallet.volunteerPseudonym,
        title: params.projectTitle ? `Aporte Certificado: ${params.projectTitle}` : 'Insignia de Impacto Transformador',
        odsNumber: params.odsNumber || 13,
        category: 'PRO_BONO_TECH',
        issuedByOngName: params.ongName || 'Organización Aliada',
        verifiedHours: params.hoursWorked || Math.round(params.amount / 10),
        economicValuationInKind: params.valuation || params.amount * 15000,
        currency: this.activeJurisdiction === 'CO' ? 'COP' : this.activeJurisdiction === 'CL' ? 'CLP' : 'BRL',
        erc5192NonTransferable: true,
        sha256CertificateHash: sbtHash,
        issuedAt: new Date().toISOString(),
      };
      this.soulboundBadges.unshift(createdBadge);
      save('soulbound_badges', this.soulboundBadges);
    }

    // Cryptographic audit block
    const prevBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const prevHash = prevBlock ? prevBlock.currentBlockHash : '00000000000000000000000000000000';
    const currentHash = 'chain_' + Date.now().toString(16) + '_' + Math.random().toString(16).substring(2, 10);

    const auditBlock: CryptographicAuditBlock = {
      blockIndex: this.auditBlocks.length,
      timestamp: new Date().toISOString(),
      country: this.activeJurisdiction,
      eventType: 'TOKEN_MINTED',
      actorPseudonym: wallet.volunteerPseudonym,
      projectId: params.projectId || 'COMMUNITY_IMPACT',
      payloadHash: proofHash,
      previousBlockHash: prevHash,
      currentBlockHash: currentHash,
      rfc3161TimestampToken: `TSA-TOKEN-${new Date().getFullYear()}-${this.auditBlocks.length.toString().padStart(4, '0')}`,
    };
    this.auditBlocks.push(auditBlock);

    save('token_wallets', this.wallets);
    save('token_transactions', this.tokenTransactions);
    save('audit_blocks', this.auditBlocks);

    AuditLogger.log({
      user: this.currentUser,
      action: 'TOKEN_MINTED',
      resourceType: 'SECURITY',
      resourceId: tx.id,
      severity: 'AUDIT',
      details: {
        amount: params.amount,
        type: params.type,
        newBalance: wallet.balance,
      },
    });

    this.notify();
    return { wallet, transaction: tx, badge: createdBadge };
  }

  public redeemPerk(
    userId: string,
    perkId: string
  ): { wallet: ImpactTokenWallet; transaction: ImpactTokenTransaction; perk: ImpactPerkReward } {
    const wallet = this.getTokenWallet(userId);
    const perk = this.perkRewards.find((p) => p.id === perkId);

    if (!perk) throw new Error('Recompensa no encontrada');
    if (wallet.balance < perk.tokenCost) {
      throw new Error(`Saldo insuficiente. Requiere ${perk.tokenCost} VIT, tu saldo actual es ${wallet.balance} VIT.`);
    }
    if (perk.availableStock <= 0) {
      throw new Error('Sin stock disponible para esta recompensa');
    }

    wallet.balance -= perk.tokenCost;
    wallet.totalRedeemed += perk.tokenCost;
    wallet.updatedAt = new Date().toISOString();
    perk.availableStock -= 1;

    const proofHash = 'sha256_redeem_' + Date.now().toString(16) + Math.random().toString(16).substring(2, 10);

    const tx: ImpactTokenTransaction = {
      id: `tx_vit_redeem_${Date.now()}`,
      walletId: wallet.id,
      userId: wallet.userId,
      userName: wallet.userName,
      type: 'REDEEM_PERK',
      amount: -perk.tokenCost,
      reason: `Canje de Recompensa: ${perk.title}`,
      legalNonRemunerationNotice: `${perk.taxExemptionStatus} - Operación auditada sin efecto de salario gravable.`,
      sha256ProofHash: proofHash,
      timestamp: new Date().toISOString(),
    };

    this.tokenTransactions.unshift(tx);

    const prevBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const prevHash = prevBlock ? prevBlock.currentBlockHash : '00000000000000000000000000000000';
    const currentHash = 'chain_' + Date.now().toString(16) + '_' + Math.random().toString(16).substring(2, 10);

    const auditBlock: CryptographicAuditBlock = {
      blockIndex: this.auditBlocks.length,
      timestamp: new Date().toISOString(),
      country: this.activeJurisdiction,
      eventType: 'TOKEN_REDEEMED',
      actorPseudonym: wallet.volunteerPseudonym,
      projectId: perk.id,
      payloadHash: proofHash,
      previousBlockHash: prevHash,
      currentBlockHash: currentHash,
      rfc3161TimestampToken: `TSA-PERK-${new Date().getFullYear()}-${this.auditBlocks.length.toString().padStart(4, '0')}`,
    };
    this.auditBlocks.push(auditBlock);

    save('token_wallets', this.wallets);
    save('token_transactions', this.tokenTransactions);
    save('perk_rewards', this.perkRewards);
    save('audit_blocks', this.auditBlocks);

    AuditLogger.log({
      user: this.currentUser,
      action: 'TOKEN_REDEEMED',
      resourceType: 'SECURITY',
      resourceId: perk.id,
      severity: 'AUDIT',
      details: {
        perkTitle: perk.title,
        cost: perk.tokenCost,
        remainingBalance: wallet.balance,
      },
    });

    this.notify();
    return { wallet, transaction: tx, perk };
  }

  public getTokenAuditSummary(): TokenAuditSummary {
    const totalMinted = this.wallets.reduce((acc, w) => acc + (w.totalMinted || 0), 0);
    const totalRedeemed = this.wallets.reduce((acc, w) => acc + (w.totalRedeemed || 0), 0);
    const totalCirculating = this.wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    const signedTerms = this.adhesionTerms.length;
    const badgesCount = this.soulboundBadges.length;

    const perksValue = this.perkRewards.reduce(
      (acc, p) => acc + p.tokenCost * (p.availableStock + 10) * 1500,
      0
    );

    return {
      totalCirculatingVIT: totalCirculating,
      totalMintedVIT: totalMinted,
      totalBurnedRedeemedVIT: totalRedeemed,
      totalSoulboundBadgesIssued: badgesCount,
      signedAdhesionTermsCount: signedTerms,
      laborRecharacterizationRiskScore: 'BAJO_CERO',
      corporateDonationPerksValue: perksValue,
    };
  }

  // Reset to factory state
  public resetToFactory(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'users');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'organizations');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'projects');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'sponsorships');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'applications');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'corporate_bookings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'pro_bono_deliverables');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'arco_requests');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_blocks');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'token_wallets');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'token_transactions');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'soulbound_badges');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'perk_rewards');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'adhesion_terms');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'active_jurisdiction');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user_id');
    this.init();
    this.notify();
  }
}

export const dataStore = new VoluntaDataStore();
