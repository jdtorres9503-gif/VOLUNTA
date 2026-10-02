export const PRISMA_SCHEMA_CONTENT = `// Prisma Schema para Volunta MVP1
// PostgreSQL (Neon Database) con Multi-tenancy a nivel de aplicación

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SUPER_ADMIN
  ONG_ADMIN
  EMPRESA_RSE
  VOLUNTEER
}

enum OrganizationType {
  ONG
  EMPRESA
}

enum VerificationStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
}

enum ProjectStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  COMPLETED
  REJECTED
}

enum CurrencyCode {
  COP
  USD
}

enum SponsorshipStatus {
  INTENT_REGISTERED
  CONTACTED
  AGREED
  CANCELLED
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  HOURS_VERIFIED
}

model User {
  id                    String         @id @default(cuid())
  email                 String         @unique
  name                  String
  avatarUrl             String?
  role                  UserRole       @default(VOLUNTEER)
  organizationId        String?
  organization          Organization?  @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  phone                 String?
  skills                String[]       @default([])
  totalVolunteeredHours Int            @default(0)
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  applications          VolunteerApplication[]
  auditLogs             AuditLog[]

  @@index([organizationId])
  @@index([email])
}

model Organization {
  id                 String             @id @default(cuid())
  name               String
  type               OrganizationType
  nit                String             @unique // Identificación tributaria (RUT / NIT)
  description        String
  website            String?
  contactEmail       String
  contactPhone       String
  city               String
  country            String             @default("Colombia")
  verificationStatus VerificationStatus @default(PENDING_VERIFICATION)
  verifiedAt         DateTime?
  verifiedById       String?
  complianceTags     String[]           @default([]) // ISO_14001, ISO_26000, etc.
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  users              User[]
  projects           Project[]
  sponsorshipsGiven  SponsorshipIntent[] @relation("EmpresaSponsorships")
  sponsorshipsReceived SponsorshipIntent[] @relation("OngSponsorships")

  @@index([verificationStatus])
}

model Project {
  id             String         @id @default(cuid())
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  title          String
  summary        String
  description    String         @db.Text
  category       String         // AMBIENTAL, EDUCACION, EMPRENDIMIENTO, COMUNIDAD
  status         ProjectStatus  @default(IN_REVIEW)
  city           String
  country        String         @default("Colombia")
  isRemote       Boolean        @default(false)
  startDate      DateTime
  endDate        DateTime
  odsNumber      Int            // ODS 1-17
  isoStandards   String[]       @default([])
  imageUrl       String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  approvedById   String?
  approvedAt     DateTime?

  fundingGoals   ProjectFundingGoal[]
  volunteerRoles VolunteerRoleSlot[]
  sponsorships   SponsorshipIntent[]
  applications   VolunteerApplication[]

  // INDISPENSABLE PARA MULTI-TENANCY SEGURO:
  @@index([organizationId])
  @@index([status])
}

model ProjectFundingGoal {
  id              String       @id @default(cuid())
  projectId       String
  project         Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  currency        CurrencyCode
  targetAmount    Decimal      @db.Decimal(14, 2)
  committedAmount Decimal      @db.Decimal(14, 2) @default(0)
  description     String

  @@index([projectId])
}

model VolunteerRoleSlot {
  id             String   @id @default(cuid())
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title          String
  description    String
  spotsTotal     Int
  spotsFilled    Int      @default(0)
  requiredSkills String[] @default([])
  estimatedHours Int

  applications   VolunteerApplication[]

  @@index([projectId])
}

model SponsorshipIntent {
  id                    String            @id @default(cuid())
  projectId             String
  project               Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  ongOrganizationId     String
  ongOrganization       Organization      @relation("OngSponsorships", fields: [ongOrganizationId], references: [id])
  empresaOrganizationId String
  empresaOrganization   Organization      @relation("EmpresaSponsorships", fields: [empresaOrganizationId], references: [id])
  
  amount                Decimal           @db.Decimal(14, 2)
  currency              CurrencyCode
  status                SponsorshipStatus @default(INTENT_REGISTERED)
  contactPerson         String
  contactEmail          String
  contactPhone          String
  notes                 String?           @db.Text
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([projectId])
  @@index([ongOrganizationId])
  @@index([empresaOrganizationId])
}

model VolunteerApplication {
  id                 String            @id @default(cuid())
  projectId          String
  project            Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  roleSlotId         String
  roleSlot           VolunteerRoleSlot @relation(fields: [roleSlotId], references: [id], onDelete: Cascade)
  volunteerUserId    String
  volunteer          User              @relation(fields: [volunteerUserId], references: [id], onDelete: Cascade)
  
  status             ApplicationStatus @default(PENDING)
  motivation         String            @db.Text
  hoursCommitted     Int
  verifiedHours      Int?
  habeasDataAccepted Boolean           @default(true) // Cumplimiento Ley 1581
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  @@index([projectId])
  @@index([volunteerUserId])
}

model AuditLog {
  id           String   @id @default(cuid())
  traceId      String   @default(cuid())
  timestamp    DateTime @default(now())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userName     String
  userRole     UserRole
  action       String
  resourceType String
  resourceId   String
  severity     String   @default("INFO")
  details      Json
  ipAddress    String

  @@index([userId])
  @@index([traceId])
  @@index([timestamp])
}
`;

export const FOUNDER_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Crear tu Base de Datos en Neon (PostgreSQL Free Tier)',
    detail: 'Entra a neon.tech y crea un proyecto gratuito llamado "volunta-mvp1". Crea dos ramas (branches): "development" para pruebas y "production" para el lanzamiento real.',
    command: 'DATABASE_URL="postgresql://user:password@ep-cool-branch.us-east-2.aws.neon.tech/neondb?sslmode=require"',
  },
  {
    step: 2,
    title: 'Sincronizar el Esquema con Prisma',
    detail: 'Copia el archivo prisma/schema.prisma y corre el comando de push para crear todas las tablas, índices multi-tenant y enums automáticamente en Neon.',
    command: 'npx prisma db push',
  },
  {
    step: 3,
    title: 'Sembrar datos iniciales (Seed)',
    detail: 'Carga los usuarios iniciales (Super Admin, ONGs, Empresas y Voluntarios) para comenzar a probar de inmediato sin registrar todo a mano.',
    command: 'npx prisma db seed',
  },
  {
    step: 4,
    title: 'Probar el Multi-tenancy contra IDOR',
    detail: 'Cada endpoint en /api/* debe incluir `where: { organizationId: session.user.organizationId }`. Nunca permitir que el cliente envíe el organizationId por body sin validar en sesión.',
    command: 'npm run test:security',
  },
];
