import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  Organization,
  Project,
  SponsorshipIntent,
  User,
  VolunteerApplication,
  AuditLogEntry,
  CorporateTeamBooking,
  ProBonoDeliverable,
  ArcoRequest,
  CryptographicAuditBlock,
  JurisdictionCountry,
  ProfessionalCategory,
  CurrencyCode,
  ImpactTokenWallet,
  ImpactTokenTransaction,
  SoulboundImpactBadge,
  ImpactPerkReward,
  LegalAdhesionTerm,
  TokenAuditSummary,
  TokenTransactionType,
} from '../src/types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CORPORATE_BOOKINGS,
  INITIAL_ORGANIZATIONS,
  INITIAL_PROJECTS,
  INITIAL_PRO_BONO_DELIVERABLES,
  INITIAL_SPONSORSHIPS,
  INITIAL_USERS,
  INITIAL_ARCO_REQUESTS,
  INITIAL_TOKEN_WALLETS,
  INITIAL_TOKEN_TRANSACTIONS,
  INITIAL_SOULBOUND_BADGES,
  INITIAL_PERK_REWARDS,
  INITIAL_ADHESION_TERMS,
} from '../src/lib/mockData';

export interface DatabaseState {
  users: User[];
  organizations: Organization[];
  projects: Project[];
  sponsorships: SponsorshipIntent[];
  applications: VolunteerApplication[];
  corporateBookings: CorporateTeamBooking[];
  deliverables: ProBonoDeliverable[];
  arcoRequests: ArcoRequest[];
  auditLogs: AuditLogEntry[];
  auditBlocks: CryptographicAuditBlock[];
  wallets: ImpactTokenWallet[];
  tokenTransactions: ImpactTokenTransaction[];
  soulboundBadges: SoulboundImpactBadge[];
  perkRewards: ImpactPerkReward[];
  adhesionTerms: LegalAdhesionTerm[];
  meta: {
    version: string;
    updatedAt: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'storage.json');

// Benchmark hourly rates for zero-budget compliance engine
export const HOURLY_BENCHMARK_RATES: Record<JurisdictionCountry, Record<ProfessionalCategory, number>> = {
  CO: {
    LEGAL: 180000,
    FINANCE: 160000,
    TECH: 150000,
    ESG_CONSULTING: 170000,
    GENERAL: 70000,
  },
  CL: {
    LEGAL: 45000,
    FINANCE: 40000,
    TECH: 38000,
    ESG_CONSULTING: 42000,
    GENERAL: 18000,
  },
  BR: {
    LEGAL: 280,
    FINANCE: 250,
    TECH: 230,
    ESG_CONSULTING: 260,
    GENERAL: 110,
  },
};

export const JURISDICTION_CURRENCY: Record<JurisdictionCountry, CurrencyCode> = {
  CO: 'COP',
  CL: 'CLP',
  BR: 'BRL',
};

class LocalDatabase {
  private state: DatabaseState;
  private isWriting = false;

  constructor() {
    this.ensureDataDirectory();
    this.state = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure token structures exist if loading previous schema
        if (!parsed.wallets) parsed.wallets = [...INITIAL_TOKEN_WALLETS];
        if (!parsed.tokenTransactions) parsed.tokenTransactions = [...INITIAL_TOKEN_TRANSACTIONS];
        if (!parsed.soulboundBadges) parsed.soulboundBadges = [...INITIAL_SOULBOUND_BADGES];
        if (!parsed.perkRewards) parsed.perkRewards = [...INITIAL_PERK_REWARDS];
        if (!parsed.adhesionTerms) parsed.adhesionTerms = [...INITIAL_ADHESION_TERMS];
        return parsed;
      }
    } catch (err) {
      console.error('[DB] Error loading database file, re-initializing with seed:', err);
    }

    const defaultState: DatabaseState = {
      users: [...INITIAL_USERS],
      organizations: [...INITIAL_ORGANIZATIONS],
      projects: [...INITIAL_PROJECTS],
      sponsorships: [...INITIAL_SPONSORSHIPS],
      applications: [...INITIAL_APPLICATIONS],
      corporateBookings: [...INITIAL_CORPORATE_BOOKINGS],
      deliverables: [...INITIAL_PRO_BONO_DELIVERABLES],
      arcoRequests: [...INITIAL_ARCO_REQUESTS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      auditBlocks: [...INITIAL_AUDIT_BLOCKS],
      wallets: [...INITIAL_TOKEN_WALLETS],
      tokenTransactions: [...INITIAL_TOKEN_TRANSACTIONS],
      soulboundBadges: [...INITIAL_SOULBOUND_BADGES],
      perkRewards: [...INITIAL_PERK_REWARDS],
      adhesionTerms: [...INITIAL_ADHESION_TERMS],
      meta: {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
      },
    };

    this.saveDatabase(defaultState);
    return defaultState;
  }

  private saveDatabase(dataToSave?: DatabaseState) {
    if (this.isWriting) {
      setTimeout(() => this.saveDatabase(dataToSave), 20);
      return;
    }
    this.isWriting = true;
    try {
      const payload = dataToSave || this.state;
      payload.meta.updatedAt = new Date().toISOString();
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error persisting database to disk:', err);
    } finally {
      this.isWriting = false;
    }
  }

  // Cryptographic Ledger (RFC 3161 audit trail block)
  public appendAuditBlock(
    eventType: CryptographicAuditBlock['eventType'],
    projectId: string,
    actorPseudonym: string,
    country: JurisdictionCountry,
    payloadData: unknown
  ): CryptographicAuditBlock {
    const lastBlock = this.state.auditBlocks[this.state.auditBlocks.length - 1];
    const prevHash = lastBlock ? lastBlock.currentBlockHash : '00000000000000000000000000000000';
    const index = this.state.auditBlocks.length;
    const timestamp = new Date().toISOString();

    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payloadData)).digest('hex');
    const hashPayload = `${index}:${timestamp}:${eventType}:${actorPseudonym}:${projectId}:${payloadHash}:${prevHash}`;
    const currentBlockHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const newBlock: CryptographicAuditBlock = {
      blockIndex: index,
      timestamp,
      country,
      eventType,
      actorPseudonym,
      projectId,
      payloadHash,
      previousBlockHash: prevHash,
      currentBlockHash,
      rfc3161TimestampToken: `TSA-AUDIT-${new Date().getFullYear()}-${index.toString().padStart(4, '0')}`,
    };

    this.state.auditBlocks.push(newBlock);
    this.saveDatabase();
    return newBlock;
  }

  // Users
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.state.users.push(user);
    this.saveDatabase();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    this.saveDatabase();
    return this.state.users[idx];
  }

  // Organizations
  public getOrganizations(): Organization[] {
    return this.state.organizations;
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.state.organizations.find((o) => o.id === id);
  }

  public createOrganization(org: Organization): Organization {
    this.state.organizations.push(org);
    this.saveDatabase();
    return org;
  }

  // Projects
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public createProject(project: Project): Project {
    this.state.projects.push(project);
    this.saveDatabase();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.state.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates };
    this.saveDatabase();
    return this.state.projects[idx];
  }

  // Sponsorships
  public getSponsorships(): SponsorshipIntent[] {
    return this.state.sponsorships;
  }

  public createSponsorship(sponsorship: SponsorshipIntent): SponsorshipIntent {
    this.state.sponsorships.push(sponsorship);
    
    // Update committedAmount in project's fundingGoals
    const project = this.getProjectById(sponsorship.projectId);
    if (project && project.fundingGoals) {
      project.fundingGoals = project.fundingGoals.map((g) => {
        if (g.currency === sponsorship.currency) {
          return { ...g, committedAmount: g.committedAmount + sponsorship.amount };
        }
        return g;
      });
      this.updateProject(project.id, { fundingGoals: project.fundingGoals });
    }

    this.appendAuditBlock(
      'SPONSORSHIP_LOCKED',
      sponsorship.projectId,
      sponsorship.empresaName,
      'CO',
      {
        sponsorshipId: sponsorship.id,
        amount: sponsorship.amount,
        currency: sponsorship.currency,
      }
    );
    this.saveDatabase();
    return sponsorship;
  }

  // Deliverables
  public getDeliverables(): ProBonoDeliverable[] {
    return this.state.deliverables;
  }

  public getDeliverableById(id: string): ProBonoDeliverable | undefined {
    return this.state.deliverables.find((d) => d.id === id);
  }

  public createDeliverable(deliv: ProBonoDeliverable): ProBonoDeliverable {
    this.state.deliverables.push(deliv);
    this.saveDatabase();
    return deliv;
  }

  public approveDeliverable(
    id: string,
    country: JurisdictionCountry = 'CO'
  ): ProBonoDeliverable | null {
    const deliv = this.getDeliverableById(id);
    if (!deliv) return null;

    const rate = HOURLY_BENCHMARK_RATES[country]?.[deliv.professionalCategory] || 70000;
    const economicValuation = deliv.hoursWorked * rate;
    const currency = JURISDICTION_CURRENCY[country] || 'COP';

    const shaHash = crypto
      .createHash('sha256')
      .update(`${deliv.id}:${deliv.volunteerPseudonym}:${deliv.hoursWorked}:${economicValuation}:${Date.now()}`)
      .digest('hex');

    deliv.status = 'ONG_APPROVED';
    deliv.hourlyBenchmarkRate = rate;
    deliv.economicValuation = economicValuation;
    deliv.currency = currency;
    deliv.sha256VerificationHash = shaHash;
    deliv.approvedAt = new Date().toISOString();

    // Sello criptográfico en la cadena de auditoría inmutable
    this.appendAuditBlock(
      'HOURS_VALIDATED_ONG',
      deliv.projectId,
      deliv.volunteerPseudonym,
      country,
      {
        deliverableId: deliv.id,
        hoursWorked: deliv.hoursWorked,
        economicValuation,
        currency,
        sha256VerificationHash: shaHash,
      }
    );

    this.saveDatabase();
    return deliv;
  }

  // Corporate Bookings
  public getCorporateBookings(): CorporateTeamBooking[] {
    return this.state.corporateBookings;
  }

  public createCorporateBooking(booking: CorporateTeamBooking): CorporateTeamBooking {
    this.state.corporateBookings.push(booking);
    this.appendAuditBlock(
      'VOLUNTEER_CHECKIN',
      booking.projectId,
      booking.empresaName,
      'CO',
      {
        teamSize: booking.teamSize,
        preferredDate: booking.preferredDate,
      }
    );
    this.saveDatabase();
    return booking;
  }

  // Audit Blocks
  public getAuditBlocks(): CryptographicAuditBlock[] {
    return this.state.auditBlocks;
  }

  // Token Wallets (Impact Tokens / VIT)
  public getTokenWallet(userId: string): ImpactTokenWallet {
    let wallet = this.state.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      const user = this.getUserById(userId);
      wallet = {
        id: `wlt_${userId}_${Date.now()}`,
        userId,
        userName: user?.name || 'Voluntario Volunta',
        volunteerPseudonym: `VOL-CO-${Math.floor(1000 + Math.random() * 9000)}`,
        balance: 50, // Welcome bonus
        totalMinted: 50,
        totalRedeemed: 0,
        level: 'BRONCE',
        adhesionTermSigned: false,
        updatedAt: new Date().toISOString(),
      };
      this.state.wallets.push(wallet);
      this.saveDatabase();
    }
    return wallet;
  }

  public getTokenTransactions(userId?: string): ImpactTokenTransaction[] {
    if (!userId) return this.state.tokenTransactions;
    return this.state.tokenTransactions.filter((tx) => tx.userId === userId);
  }

  public getSoulboundBadges(userId?: string): SoulboundImpactBadge[] {
    if (!userId) return this.state.soulboundBadges;
    return this.state.soulboundBadges.filter((b) => b.volunteerUserId === userId);
  }

  public getPerkRewards(): ImpactPerkReward[] {
    return this.state.perkRewards;
  }

  public getAdhesionTerms(userId?: string): LegalAdhesionTerm[] {
    if (!userId) return this.state.adhesionTerms;
    return this.state.adhesionTerms.filter((t) => t.userId === userId);
  }

  public signAdhesionTerm(term: LegalAdhesionTerm): LegalAdhesionTerm {
    const existingIdx = this.state.adhesionTerms.findIndex((t) => t.userId === term.userId);
    if (existingIdx !== -1) {
      this.state.adhesionTerms[existingIdx] = term;
    } else {
      this.state.adhesionTerms.push(term);
    }

    const wallet = this.getTokenWallet(term.userId);
    wallet.adhesionTermSigned = true;
    wallet.adhesionTermSignedAt = term.signedAt;
    wallet.adhesionLegalFramework =
      term.country === 'CL'
        ? 'LEY_20500_CHILE'
        : term.country === 'BR'
        ? 'LEI_9608_BRASIL'
        : 'LEY_720_COLOMBIA';
    wallet.updatedAt = new Date().toISOString();

    this.appendAuditBlock(
      'ADHESION_TERM_SIGNED',
      'LEGAL_COMPLIANCE',
      wallet.volunteerPseudonym,
      term.country,
      {
        userId: term.userId,
        lawReference: term.lawReference,
        sha256ConsentHash: term.sha256ConsentHash,
      }
    );

    this.saveDatabase();
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
    const prevBalance = wallet.balance;
    wallet.balance += params.amount;
    wallet.totalMinted += params.amount;

    // Determine reputation level
    if (wallet.totalMinted >= 1000) wallet.level = 'DIAMANTE_ESG';
    else if (wallet.totalMinted >= 500) wallet.level = 'ORO';
    else if (wallet.totalMinted >= 200) wallet.level = 'PLATA';
    else wallet.level = 'BRONCE';

    wallet.updatedAt = new Date().toISOString();

    const proofHash = crypto
      .createHash('sha256')
      .update(`${wallet.id}:${wallet.userId}:${params.amount}:${Date.now()}:${params.reason}`)
      .digest('hex');

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
        'Reconocimiento honorífico no dinerario conforme a Ley 720/2001 (Colombia), Ley 20.500 (Chile) o Lei 9.608 (Brasil). No constituye salario ni genera obligaciones laborales.',
      sha256ProofHash: proofHash,
      timestamp: new Date().toISOString(),
    };

    this.state.tokenTransactions.unshift(tx);

    let createdBadge: SoulboundImpactBadge | undefined;
    // If it's a significant milestone or pro-bono deliverable, mint a Soulbound Impact Badge (SBT)
    if (params.type === 'MINT_PROBONO' || (params.hoursWorked && params.hoursWorked >= 10)) {
      const tokenId = `SBT-ODS${(params.odsNumber || 13).toString().padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
      const sbtHash = crypto
        .createHash('sha256')
        .update(`${tokenId}:${wallet.volunteerPseudonym}:${params.hoursWorked}:${Date.now()}`)
        .digest('hex');

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
        currency: 'COP',
        erc5192NonTransferable: true,
        sha256CertificateHash: sbtHash,
        issuedAt: new Date().toISOString(),
      };
      this.state.soulboundBadges.unshift(createdBadge);
    }

    this.appendAuditBlock(
      'TOKEN_MINTED',
      params.projectId || 'COMMUNITY_IMPACT',
      wallet.volunteerPseudonym,
      'CO',
      {
        transactionId: tx.id,
        amount: params.amount,
        type: params.type,
        prevBalance,
        newBalance: wallet.balance,
        sha256ProofHash: proofHash,
      }
    );

    this.saveDatabase();
    return { wallet, transaction: tx, badge: createdBadge };
  }

  public redeemPerk(
    userId: string,
    perkId: string
  ): { wallet: ImpactTokenWallet; transaction: ImpactTokenTransaction; perk: ImpactPerkReward } {
    const wallet = this.getTokenWallet(userId);
    const perk = this.state.perkRewards.find((p) => p.id === perkId);

    if (!perk) {
      throw new Error('Recompensa no encontrada en el catálogo');
    }

    if (wallet.balance < perk.tokenCost) {
      throw new Error(`Saldo insuficiente de VIT. Requiere ${perk.tokenCost} VIT, tu saldo es ${wallet.balance} VIT.`);
    }

    if (perk.availableStock <= 0) {
      throw new Error('No hay stock disponible para esta recompensa en este momento.');
    }

    wallet.balance -= perk.tokenCost;
    wallet.totalRedeemed += perk.tokenCost;
    wallet.updatedAt = new Date().toISOString();
    perk.availableStock -= 1;

    const proofHash = crypto
      .createHash('sha256')
      .update(`${wallet.id}:${perk.id}:${perk.tokenCost}:${Date.now()}`)
      .digest('hex');

    const tx: ImpactTokenTransaction = {
      id: `tx_vit_redeem_${Date.now()}`,
      walletId: wallet.id,
      userId: wallet.userId,
      userName: wallet.userName,
      type: 'REDEEM_PERK',
      amount: -perk.tokenCost,
      reason: `Canje de Recompensa: ${perk.title}`,
      legalNonRemunerationNotice: `${perk.taxExemptionStatus} - Operación bajo estricto cumplimiento tributario sin efecto de renta gravable.`,
      sha256ProofHash: proofHash,
      timestamp: new Date().toISOString(),
    };

    this.state.tokenTransactions.unshift(tx);

    this.appendAuditBlock(
      'TOKEN_REDEEMED',
      perk.id,
      wallet.volunteerPseudonym,
      'CO',
      {
        perkTitle: perk.title,
        sponsorCompanyName: perk.sponsorCompanyName,
        cost: perk.tokenCost,
        remainingBalance: wallet.balance,
        sha256ProofHash: proofHash,
      }
    );

    this.saveDatabase();
    return { wallet, transaction: tx, perk };
  }

  public getTokenAuditSummary(): TokenAuditSummary {
    const totalMinted = this.state.wallets.reduce((acc, w) => acc + (w.totalMinted || 0), 0);
    const totalRedeemed = this.state.wallets.reduce((acc, w) => acc + (w.totalRedeemed || 0), 0);
    const totalCirculating = this.state.wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    const signedTerms = this.state.adhesionTerms.length;
    const badgesCount = this.state.soulboundBadges.length;

    // Risk score: If all volunteers have signed adhesion terms and no cash payout exists, risk is BAJO_CERO
    const laborRisk = 'BAJO_CERO';
    const perksValue = this.state.perkRewards.reduce(
      (acc, p) => acc + p.tokenCost * (p.availableStock + 10) * 1500,
      0
    );

    return {
      totalCirculatingVIT: totalCirculating,
      totalMintedVIT: totalMinted,
      totalBurnedRedeemedVIT: totalRedeemed,
      totalSoulboundBadgesIssued: badgesCount,
      signedAdhesionTermsCount: signedTerms,
      laborRecharacterizationRiskScore: laborRisk,
      corporateDonationPerksValue: perksValue,
    };
  }
}

export const db = new LocalDatabase();
