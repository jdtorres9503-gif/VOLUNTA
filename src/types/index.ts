export type UserRole = 'SUPER_ADMIN' | 'ONG_ADMIN' | 'EMPRESA_RSE' | 'VOLUNTEER';

export type OrganizationType = 'ONG' | 'EMPRESA';
export type VerificationStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
export type ProjectStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'COMPLETED' | 'REJECTED';
export type CurrencyCode = 'COP' | 'USD' | 'CLP' | 'BRL';
export type JurisdictionCountry = 'CO' | 'CL' | 'BR';
export type ProfessionalCategory = 'LEGAL' | 'FINANCE' | 'TECH' | 'ESG_CONSULTING' | 'GENERAL';
export type SponsorshipStatus = 'INTENT_REGISTERED' | 'CONTACTED' | 'AGREED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'HOURS_VERIFIED';

// Benchmark additions (Atados & Hacesfalta)
export type VolunteerModality = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
export type VolunteerDedication = 'PUNTUAL' | 'RECURRENTE';

// Benchmark additions (Maat Impact 4 pillars)
export type ProjectCategory = 
  | 'AMBIENTAL' 
  | 'EDUCACION' 
  | 'PRO_BONO_PROFESIONAL' 
  | 'SOCIAL_COMUNITARIO' 
  | 'EMPRENDIMIENTO' 
  | 'SALUD_COMUNIDAD';

export type IsoStandard = 'ISO_26000_RSE' | 'ISO_14001_AMBIENTAL' | 'ISO_9001_CALIDAD' | 'ISO_27001_SEGURIDAD';

export interface VolunteerBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'IMPACTO' | 'HORAS' | 'COMPLIANCE' | 'ESPECIALIDAD';
  unlocked: boolean;
  earnedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  skills?: string[];
  totalVolunteeredHours?: number;
  phone?: string;
  badges?: VolunteerBadge[];
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  nit: string; // Tax ID in Colombia/LatAm
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  country: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  complianceTags: IsoStandard[];
  createdAt: string;
  logoUrl?: string;
}

export interface VolunteerRoleSlot {
  id: string;
  title: string;
  description: string;
  spotsTotal: number;
  spotsFilled: number;
  requiredSkills: string[];
  estimatedHours: number;
  modality?: VolunteerModality;
  dedication?: VolunteerDedication;
  competenciesDeveloped?: string[]; // Voluntare (Soft skills)
  materialsIncluded?: string[]; // Goodera / Hacesfalta (Kits, seguro, etc.)
}

export interface ProjectFundingGoal {
  currency: CurrencyCode;
  targetAmount: number;
  committedAmount: number;
  description: string;
}

export interface ProjectImpactMetrics {
  metricLabel?: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  co2KgMitigated?: number;
  beneficiariesDirect?: number;
  sroiEstimatedRate?: number; // Valor económico por hora generada (~$25 USD / ~$95.000 COP)
  sroiRatio?: number;
  socialValueGenerated?: string;
}

export interface Project {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  city: string;
  country: string;
  isRemote: boolean;
  modality: VolunteerModality; // Atados pattern
  dedication: VolunteerDedication; // Atados / Hacesfalta pattern
  startDate: string;
  endDate: string;
  fundingGoals: ProjectFundingGoal[];
  volunteerRoles: VolunteerRoleSlot[];
  isoStandards: IsoStandard[];
  odsNumber: number; // Objetivos de Desarrollo Sostenible (1-17)
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  imageUrl: string;
  // Goodera / Hacesfalta / Maat Impact additions:
  meetingPoint?: string;
  insuranceProvided: boolean; // Póliza de accidentes voluntariado (Hacesfalta)
  trainingProvided: boolean; // Inducción formativa previa (Hacesfalta)
  corporateTeamCapacity?: number; // Capacidad para escuadrones de empresa (Goodera)
  impactMetrics?: ProjectImpactMetrics; // Trazabilidad ODS / GRI (Maat Impact)
}

export interface SponsorshipIntent {
  id: string;
  projectId: string;
  projectTitle: string;
  ongOrganizationId: string;
  empresaOrganizationId: string;
  empresaName: string;
  amount: number;
  currency: CurrencyCode;
  status: SponsorshipStatus;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  createdAt: string;
}

// Goodera & Benevity Corporate Team Volunteering
export interface CorporateTeamBooking {
  id: string;
  projectId: string;
  projectTitle: string;
  ongOrganizationId: string;
  empresaOrganizationId: string;
  empresaName: string;
  teamSize: number;
  preferredDate: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
  matchingGiftEnabled: boolean; // Benevity "Dollars for Doers"
  matchingGiftPerHour?: number;
  matchingGiftCurrency?: CurrencyCode;
  notes?: string;
  country?: JurisdictionCountry | string;
  createdAt: string;
}

export interface VolunteerApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  ongOrganizationId: string;
  roleSlotId: string;
  roleTitle: string;
  volunteerUserId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  status: ApplicationStatus;
  motivation: string;
  hoursCommitted: number;
  verifiedHours?: number;
  habeasDataAccepted: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  traceId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'ORGANIZATION' | 'PROJECT' | 'SPONSORSHIP' | 'APPLICATION' | 'SECURITY';
  resourceId: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';
  details: Record<string, unknown>;
  ipAddress: string;
}

// Technical Compliance & Pro-Bono Additions
export type DeliverableStatus = 'SUBMITTED' | 'ONG_APPROVED' | 'REJECTED';

export interface ProBonoDeliverable {
  id: string;
  projectId: string;
  projectTitle: string;
  ongOrganizationId: string;
  empresaOrganizationId?: string;
  volunteerUserId: string;
  volunteerName: string;
  volunteerPseudonym: string; // VOL-CO-*** / VOL-CL-*** / VOL-BR-*** for Privacy by Design
  professionalCategory: ProfessionalCategory;
  title: string;
  description: string;
  evidenceUrl: string;
  hoursWorked: number;
  hourlyBenchmarkRate: number; // in local currency
  currency: CurrencyCode;
  country: JurisdictionCountry;
  economicValuation: number; // hoursWorked * hourlyBenchmarkRate
  status: DeliverableStatus;
  beneficiariesImpacted?: number;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  feedbackFromOng?: string;
  feedbackNotes?: string;
  sha256VerificationHash: string;
}

export type ArcoRightType = 
  | 'ACCESS_KNOW' // Conocer / Acesso (Art. 15 Ley 1581 / Art. 18 LGPD)
  | 'RECTIFICATION' // Actualizar / Retificação
  | 'CANCELLATION_DELETE' // Cancelar / Supressão / Eliminação
  | 'OPPOSITION_PORTABILITY'; // Oposición / Portabilidade

export interface ArcoRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  country: JurisdictionCountry;
  rightType: ArcoRightType;
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  details: string;
  resolutionNotes?: string;
  requestedAt: string;
  resolvedAt?: string;
  legalDeadline: string; // SLA max por ley (CO: 15 días, CL: 2 días, BR: 15 días)
}

export interface PrivacyConsentSettings {
  userId: string;
  country: JurisdictionCountry;
  habeasDataAccepted: boolean;
  proBonoAgreementSigned: boolean;
  anonymizedPublicReporting: boolean;
  gpsTrackingOptIn: boolean;
  imageRightsAuthorized: boolean;
  acceptedTermsVersion: string;
  updatedAt: string;
}

export interface CryptographicAuditBlock {
  blockIndex: number;
  timestamp: string;
  country: JurisdictionCountry;
  eventType: 
    | 'VOLUNTEER_CHECKIN' 
    | 'HOURS_VALIDATED_ONG' 
    | 'ESG_REPORT_DOWNLOADED' 
    | 'ARCO_REQUEST_FILED' 
    | 'SPONSORSHIP_LOCKED'
    | 'TOKEN_MINTED'
    | 'TOKEN_REDEEMED'
    | 'ADHESION_TERM_SIGNED';
  actorPseudonym: string;
  projectId: string;
  payloadHash: string;
  previousBlockHash: string;
  currentBlockHash: string;
  rfc3161TimestampToken: string;
}

// Token & Impact Rewards Models (Proof-of-Impact / VIT)
export type TokenWalletLevel = 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE_ESG';

export interface ImpactTokenWallet {
  id: string;
  userId: string;
  userName: string;
  volunteerPseudonym: string;
  balance: number; // Balance actual de VIT (Volunta Impact Tokens)
  totalMinted: number;
  totalRedeemed: number;
  level: TokenWalletLevel;
  adhesionTermSigned: boolean;
  adhesionTermSignedAt?: string;
  adhesionLegalFramework?: 'LEY_720_COLOMBIA' | 'LEY_20500_CHILE' | 'LEI_9608_BRASIL';
  updatedAt: string;
}

export type TokenTransactionType = 
  | 'MINT_HOURS' 
  | 'MINT_PROBONO' 
  | 'MINT_MILESTONE' 
  | 'REDEEM_PERK' 
  | 'DONATION_MATCH';

export interface ImpactTokenTransaction {
  id: string;
  walletId: string;
  userId: string;
  userName: string;
  type: TokenTransactionType;
  amount: number; // Cantidad de VIT
  projectId?: string;
  projectTitle?: string;
  ongOrganizationId?: string;
  ongName?: string;
  reason: string;
  legalNonRemunerationNotice: string; // Exención laboral y tributaria formal
  sha256ProofHash: string;
  timestamp: string;
}

export interface SoulboundImpactBadge {
  id: string;
  tokenId: string; // Ej: SBT-ODS13-2026-0042
  volunteerUserId: string;
  volunteerPseudonym: string;
  title: string;
  odsNumber: number;
  category: 'CLIMA' | 'EDUCACION' | 'PRO_BONO_LEGAL' | 'PRO_BONO_TECH' | 'SALUD' | 'GOBERNANZA';
  issuedByOngName: string;
  verifiedHours: number;
  economicValuationInKind: number;
  currency: CurrencyCode;
  erc5192NonTransferable: boolean; // Soulbound: intransferible
  sha256CertificateHash: string;
  issuedAt: string;
}

export interface ImpactPerkReward {
  id: string;
  title: string;
  category: 'EDUCACION' | 'SOSTENIBILIDAD' | 'RECONOCIMIENTO' | 'DONACION_MATCH' | 'EXPERIENCIAS';
  tokenCost: number; // Costo en VIT
  sponsorCompanyName: string;
  sponsorOrgId: string;
  description: string;
  taxExemptionStatus: string; // "Beneficio en especie no salarial ni renta gravable"
  availableStock: number;
  iconName: string;
  redemptionInstructions: string;
}

export interface LegalAdhesionTerm {
  id: string;
  userId: string;
  country: JurisdictionCountry;
  lawReference: string; // "Ley 720 de 2001 (Colombia)" | "Ley 20.500 (Chile)" | "Lei 9.608 de 1998 (Brasil)"
  signedAt: string;
  noLaborRelationshipClause: boolean;
  sha256ConsentHash: string;
}

export interface TokenAuditSummary {
  totalCirculatingVIT: number;
  totalMintedVIT: number;
  totalBurnedRedeemedVIT: number;
  totalSoulboundBadgesIssued: number;
  signedAdhesionTermsCount: number;
  laborRecharacterizationRiskScore: 'BAJO_CERO' | 'MEDIO' | 'ALTO';
  corporateDonationPerksValue: number;
}

