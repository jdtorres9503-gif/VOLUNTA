import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Clock,
  CheckCircle2,
  Users,
  Coins,
  ArrowUpRight,
  Sparkles,
  Award,
  AlertCircle,
  FileCheck,
  Building2,
  Calendar,
  ShieldCheck,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { Project, SponsorshipIntent, User, VolunteerApplication, CurrencyCode, IsoStandard, CorporateTeamBooking, JurisdictionCountry, ProBonoDeliverable } from '../types';
import { dataStore } from '../lib/dataStore';
import { formatSingleCurrency, formatMultiCurrencyString, aggregateCurrencyAmounts } from '../lib/currency';
import { ProBonoSubmissionModal } from './ProBonoSubmissionModal';
import { PrivacyRightsModal } from './PrivacyRightsModal';
import { JURISDICTION_INFO } from '../lib/complianceEngine';

interface OngViewProps {
  currentUser: User;
  projects: Project[];
  sponsorships: SponsorshipIntent[];
  applications: VolunteerApplication[];
  onOpenProjectDetail: (project: Project) => void;
}

export const OngView: React.FC<OngViewProps> = ({
  currentUser,
  projects,
  sponsorships,
  applications,
  onOpenProjectDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'SPONSORSHIPS' | 'APPLICATIONS' | 'CORPORATE_TEAMS' | 'PRO_BONO_DELIVERABLES'>('PROJECTS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProBonoModalOpen, setIsProBonoModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Form State for creating project
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Project['category']>('AMBIENTAL');
  const [newCity, setNewCity] = useState('Bogotá D.C.');
  const [newOds, setNewOds] = useState(15);
  const [newTargetAmount, setNewTargetAmount] = useState(15000000);
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>('COP');
  const [newVolunteerTitle, setNewVolunteerTitle] = useState('Voluntario de Campo y Logística');
  const [newVolunteerSpots, setNewVolunteerSpots] = useState(10);
  const [newVolunteerHours, setNewVolunteerHours] = useState(12);
  const [selectedIsoStandards, setSelectedIsoStandards] = useState<IsoStandard[]>(['ISO_14001_AMBIENTAL', 'ISO_26000_RSE']);

  // Benchmark Form fields
  const [newModality, setNewModality] = useState<'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO'>('PRESENCIAL');
  const [newDedication, setNewDedication] = useState<'PUNTUAL' | 'RECURRENTE'>('PUNTUAL');
  const [newInsuranceProvided, setNewInsuranceProvided] = useState(true);
  const [newTrainingProvided, setNewTrainingProvided] = useState(true);
  const [newCorporateTeamCapacity, setNewCorporateTeamCapacity] = useState(25);
  const [newSroiRatio, setNewSroiRatio] = useState(3.5);

  // Strictly filter by organizationId to demonstrate multi-tenancy
  const myProjects = projects.filter((p) => p.organizationId === currentUser.organizationId);
  const mySponsorships = sponsorships.filter((s) => s.ongOrganizationId === currentUser.organizationId);
  const myApplications = applications.filter((a) => a.ongOrganizationId === currentUser.organizationId);
  const myCorporateBookings = dataStore.getCorporateBookingsForCurrentContext();

  // Pro-Bono deliverables awaiting verification or verified
  const proBonoDeliverables = dataStore.getProBonoDeliverables();
  const myDeliverables = proBonoDeliverables.filter(
    (d) => d.ongOrganizationId === currentUser.organizationId || myProjects.some((p) => p.id === d.projectId)
  );

  const handleApproveDeliverable = (deliverableId: string) => {
    dataStore.approveProBonoDeliverable(
      deliverableId,
      'Entregable y horas Pro-Bono validadas a satisfacción por la dirección de la ONG. Conforme a legislación local.'
    );
    setApprovalFeedback('¡Entregable verificado con éxito! Se selló en el Ledger Criptográfico SHA-256, se emitieron tokens VIT honoríficos y la Insignia Soulbound (ERC-5192) al voluntario.');
    setTimeout(() => setApprovalFeedback(null), 5000);
  };

  // Totals for this specific ONG, strictly multi-currency compliant
  const totalReceivedFunds = aggregateCurrencyAmounts(
    mySponsorships.map((s) => ({ amount: s.amount, currency: s.currency }))
  );
  const totalFundsString = formatMultiCurrencyString(totalReceivedFunds);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    try {
      dataStore.createProject({
        title: newTitle,
        summary: newSummary || newTitle,
        description: newDescription,
        category: newCategory,
        city: newCity,
        country: 'Colombia',
        isRemote: newModality === 'VIRTUAL',
        startDate: '2026-11-01',
        endDate: '2027-04-30',
        odsNumber: Number(newOds),
        isoStandards: selectedIsoStandards,
        modality: newModality,
        dedication: newDedication,
        insuranceProvided: newInsuranceProvided,
        trainingProvided: newTrainingProvided,
        corporateTeamCapacity: Number(newCorporateTeamCapacity),
        impactMetrics: {
          sroiRatio: Number(newSroiRatio),
          socialValueGenerated: `Estimado: Retorno social certificado de ${(newTargetAmount * newSroiRatio).toLocaleString()} ${newCurrency}`,
        },
        imageUrl:
          newCategory === 'AMBIENTAL'
            ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
            : newCategory === 'EDUCACION'
            ? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=80',
        fundingGoals: [
          {
            currency: newCurrency,
            targetAmount: Number(newTargetAmount),
            committedAmount: 0,
            description: `Meta de patrocinio para insumos y ejecución del proyecto (${newCurrency})`,
          },
        ],
        volunteerRoles: [
          {
            id: 'slot_' + Date.now().toString(36),
            title: newVolunteerTitle,
            description: 'Participación activa en actividades en comunidad y talleres.',
            spotsTotal: Number(newVolunteerSpots),
            spotsFilled: 0,
            requiredSkills: ['Compromiso social', 'Trabajo en equipo'],
            estimatedHours: Number(newVolunteerHours),
          },
        ],
      });

      setShowCreateModal(false);
      // Reset
      setNewTitle('');
      setNewSummary('');
      setNewDescription('');
      alert('Proyecto creado con éxito. Ha quedado en estado "IN_REVIEW" esperando la revisión del Super Admin de Volunta.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear proyecto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <HeartHandshake className="w-3.5 h-3.5" />
              Portal de Organización Social (ONG)
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {currentUser.organizationName || 'Mi Organización Social'}
            </h1>
            <p className="text-sm text-slate-600">
              Gestión integral de proyectos de impacto, recepción de patrocinios empresariales (RSE) y coordinación de voluntarios individuales y corporativos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Privacidad & ARCO
            </button>
            <button
              onClick={() => setIsProBonoModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              Radicar Entregable Pro-Bono
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publicar Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {approvalFeedback && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{approvalFeedback}</span>
          </div>
        )}

        {/* ONG KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Mis Proyectos Registrados</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{myProjects.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {myProjects.filter((p) => p.status === 'PUBLISHED').length} publicados •{' '}
              {myProjects.filter((p) => p.status === 'IN_REVIEW').length} en revisión
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>Patrocinios Comprometidos</span>
            </div>
            <div className="text-base font-bold text-emerald-950 mt-1 truncate" title={totalFundsString}>
              {totalFundsString}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">
              {mySponsorships.length} convenios formalizados
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-blue-800 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Voluntarios Postulados</span>
            </div>
            <div className="text-2xl font-bold text-blue-950 mt-1">{myApplications.length}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">
              {myApplications.filter((a) => a.status === 'ACCEPTED').length} activos en terreno
            </div>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-purple-800 uppercase flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Entregables Pro-Bono</span>
            </div>
            <div className="text-2xl font-bold text-purple-950 mt-1">{myDeliverables.length}</div>
            <div className="text-[10px] text-purple-700 mt-0.5">
              {myDeliverables.filter((d) => d.status === 'ONG_APPROVED').length} auditados con SHA-256
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'PROJECTS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Mis Proyectos ({myProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('SPONSORSHIPS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'SPONSORSHIPS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Patrocinios de Empresas ({mySponsorships.length})
          </button>
          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'APPLICATIONS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Postulaciones de Voluntarios ({myApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('CORPORATE_TEAMS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'CORPORATE_TEAMS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Jornadas Corporativas ({myCorporateBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('PRO_BONO_DELIVERABLES')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'PRO_BONO_DELIVERABLES'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Entregables Pro-Bono ({myDeliverables.length})
          </button>
        </div>
      </div>

      {/* TAB 1: MY PROJECTS */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-4">
          {myProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-600">
                Aún no tienes proyectos creados para tu organización.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Crear tu primer proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myProjects.map((project) => {
                const isPublished = project.status === 'PUBLISHED';
                const isInReview = project.status === 'IN_REVIEW';

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInReview
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {project.status === 'PUBLISHED'
                            ? 'Publicado & Visible'
                            : project.status === 'IN_REVIEW'
                            ? 'En Revisión por Super Admin'
                            : project.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          ODS #{project.odsNumber}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {project.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">{project.summary}</p>

                      {/* Funding progress */}
                      <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Meta Financiera:</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {project.fundingGoals.map((g) => (
                              <span key={g.currency}>
                                {formatSingleCurrency(g.committedAmount, g.currency)} /{' '}
                                {formatSingleCurrency(g.targetAmount, g.currency)} ({g.currency})
                              </span>
                            ))}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Vacantes Voluntarios:</span>
                          <span className="font-semibold text-slate-800">
                            {project.volunteerRoles.reduce((a, r) => a + r.spotsFilled, 0)} /{' '}
                            {project.volunteerRoles.reduce((a, r) => a + r.spotsTotal, 0)} cupos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        ID: {project.id}
                      </span>
                      <button
                        onClick={() => onOpenProjectDetail(project)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      >
                        Ver Detalle Público
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPONSORSHIPS RECEIVED */}
      {activeTab === 'SPONSORSHIPS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Intenciones de Patrocinio de Empresas (RSE)
              </h2>
              <p className="text-xs text-slate-500">
                Empresas aliadas que han registrado compromiso de patrocinio para tus proyectos.
              </p>
            </div>
          </div>

          {mySponsorships.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Aún no has recibido intenciones de patrocinio. Asegúrate de tener proyectos publicados para que las empresas los descubran.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {mySponsorships.map((spon) => (
                <div key={spon.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{spon.empresaName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          spon.status === 'AGREED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {spon.status === 'AGREED' ? 'Acuerdo Formalizado' : 'Intención Registrada'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Proyecto: <span className="font-semibold text-slate-800">{spon.projectTitle}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Contacto RSE: {spon.contactPerson} • {spon.contactEmail} • {spon.contactPhone}
                    </div>
                    {spon.notes && (
                      <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                        "{spon.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-base font-mono font-bold text-emerald-700">
                      {formatSingleCurrency(spon.amount, spon.currency)} ({spon.currency})
                    </div>
                    {spon.status !== 'AGREED' && (
                      <button
                        onClick={() => dataStore.updateSponsorshipStatus(spon.id, 'AGREED')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                      >
                        Confirmar Acuerdo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VOLUNTEER APPLICATIONS */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Postulaciones de Voluntarios
              </h2>
              <p className="text-xs text-slate-500">
                Acepta candidatos y certifica sus horas de servicio comunitario bajo la norma ISO 26000.
              </p>
            </div>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hay postulaciones de voluntarios pendientes.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myApplications.map((app) => (
                <div key={app.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{app.volunteerName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'HOURS_VERIFIED'
                            ? 'bg-purple-100 text-purple-800'
                            : app.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status === 'HOURS_VERIFIED'
                          ? 'Horas Certificadas'
                          : app.status === 'ACCEPTED'
                          ? 'Aceptado en Terreno'
                          : 'Pendiente de Aprobación'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Rol: <span className="font-semibold text-slate-800">{app.roleTitle}</span> • Proyecto: {app.projectTitle}
                    </div>

                    <div className="text-xs text-slate-500">
                      Email: {app.volunteerEmail} • Tel: {app.volunteerPhone}
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                      Motivación: "{app.motivation}"
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-xs font-semibold text-slate-700">
                      Compromiso: {app.hoursCommitted} horas
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => dataStore.updateApplicationStatus(app.id, 'ACCEPTED')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                        >
                          Aceptar Voluntario
                        </button>
                      )}

                      {app.status === 'ACCEPTED' && (
                        <button
                          onClick={() => dataStore.updateApplicationStatus(app.id, 'HOURS_VERIFIED', app.hoursCommitted)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg cursor-pointer"
                        >
                          Certificar Horas
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CORPORATE TEAM BOOKINGS (Goodera Benchmark) */}
      {activeTab === 'CORPORATE_TEAMS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Jornadas de Voluntariado Corporativo (Team Volunteering)
              </h2>
              <p className="text-xs text-slate-500">
                Solicitudes de empresas aliadas para traer cuadrillas de colaboradores a tus proyectos. Al confirmar, coordinas la logística y el programa "Dollars for Doers".
              </p>
            </div>
          </div>

          {myCorporateBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No tienes solicitudes de jornadas corporativas pendientes para tus proyectos.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myCorporateBookings.map((b) => (
                <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{b.empresaName}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status === 'COMPLETED'
                          ? 'Jornada Realizada'
                          : b.status === 'CONFIRMED'
                          ? 'Confirmada & Coordinando'
                          : 'Pendiente de Confirmación'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium">
                      Proyecto: <span className="font-semibold text-slate-800">{b.projectTitle}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {b.teamSize} colaboradores
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Fecha propuesta: {b.preferredDate}
                      </span>
                      <span>
                        Contacto RSE: {b.contactPerson} ({b.contactEmail} • {b.contactPhone})
                      </span>
                    </div>

                    {b.matchingGiftEnabled && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <Coins className="w-3.5 h-3.5 text-emerald-600" />
                        <strong>Matching Gift Activo:</strong> La empresa donará{' '}
                        {formatSingleCurrency(b.matchingGiftPerHour || 0, b.matchingGiftCurrency || 'COP')} adicionales por hora voluntariada a tu ONG.
                      </div>
                    )}

                    {b.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                        Notas: "{b.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-xs text-slate-500 font-mono">
                      {b.teamSize * 8} hrs estimadas
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            dataStore.updateCorporateBookingStatus(b.id, 'CONFIRMED');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                        >
                          Confirmar Jornada
                        </button>
                      )}

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            dataStore.updateCorporateBookingStatus(b.id, 'COMPLETED');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                        >
                          Marcar Realizada & Emitir Horas
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRO-BONO DELIVERABLES & TECHNICAL COMPLIANCE */}
      {activeTab === 'PRO_BONO_DELIVERABLES' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Validación de Entregables Pro-Bono (ISO 9001 / ISO 27001)
              </h3>
              <p className="text-xs text-slate-500">
                Como ONG beneficiaria, revisa los productos técnicos o profesionales entregados por los voluntarios y certifica su satisfacción para el sellado criptográfico.
              </p>
            </div>

            <button
              onClick={() => setIsProBonoModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Certificar Horas Pro-Bono
            </button>
          </div>

          {myDeliverables.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-xs text-slate-500">
                Aún no hay entregables Pro-Bono radicados para los proyectos de tu organización.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {myDeliverables.map((deliv) => (
                <div
                  key={deliv.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {deliv.volunteerPseudonym}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {deliv.professionalCategory}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            deliv.status === 'ONG_APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {deliv.status === 'ONG_APPROVED' ? 'Aprobado & Sellado SHA-256' : 'Pendiente de Aprobación'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{deliv.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{deliv.description}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Proyecto: <span className="font-semibold text-slate-700">{deliv.projectTitle}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-emerald-700">
                        {formatSingleCurrency(deliv.economicValuation, deliv.currency)}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {deliv.hoursWorked} horas valorizadas
                      </div>
                    </div>
                  </div>

                  {deliv.status === 'ONG_APPROVED' ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Certificado por la ONG el {new Date(deliv.approvedAt || '').toLocaleDateString()}
                      </div>
                      <p className="text-emerald-800 text-[11px] italic">
                        "{deliv.feedbackNotes || 'Entregable aprobado con plena conformidad técnica.'}"
                      </p>
                      <div className="text-[10px] font-mono text-emerald-700 truncate">
                        Hash SHA-256: {deliv.sha256VerificationHash}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Requiere visto bueno de la ONG para cómputo en informe ESG
                      </span>

                      <button
                        onClick={() => handleApproveDeliverable(deliv.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aprobar y Emitir Certificado SHA-256
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Publicar Nuevo Proyecto de Impacto
                </h3>
                <p className="text-xs text-slate-500">
                  Completa los requerimientos financieros y de voluntariado. El proyecto pasará a revisión de Super Admin.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reforestación Comunitaria y Protección de Acuíferos"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría / Causa
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Project['category'])}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                  >
                    <option value="AMBIENTAL">Ambiental & Regeneración (ISO 14001)</option>
                    <option value="EDUCACION">Educación & Habilidades STEM</option>
                    <option value="EMPRENDIMIENTO">Emprendimiento Comunitario</option>
                    <option value="SALUD_COMUNIDAD">Salud y Cohesión Social</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Objetivo ODS (1 al 17)
                  </label>
                  <select
                    value={newOds}
                    onChange={(e) => setNewOds(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                  >
                    <option value={15}>ODS 15 - Vida de ecosistemas terrestres</option>
                    <option value={4}>ODS 4 - Educación de Calidad</option>
                    <option value={6}>ODS 6 - Agua Limpia y Saneamiento</option>
                    <option value={8}>ODS 8 - Trabajo Decente y Crecimiento</option>
                    <option value={13}>ODS 13 - Acción por el Clima</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ubicación Principal (Ciudad / Municipio)
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Detallada del Impacto y Objetivos *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explica qué problema soluciona, a cuántas personas o hectáreas impacta..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              {/* Funding Goal Section */}
              <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Meta Financiera para Patrocinio Corporativo
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Moneda
                    </label>
                    <select
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="COP">COP (Pesos Colombianos)</option>
                      <option value="USD">USD (Dólares)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monto Meta
                    </label>
                    <input
                      type="number"
                      value={newTargetAmount}
                      onChange={(e) => setNewTargetAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Volunteer Slot Section */}
              <div className="bg-blue-50/50 border border-blue-200/70 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Convocatoria de Voluntariado
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título del Rol de Voluntario
                    </label>
                    <input
                      type="text"
                      value={newVolunteerTitle}
                      onChange={(e) => setNewVolunteerTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cupos Totales
                    </label>
                    <input
                      type="number"
                      value={newVolunteerSpots}
                      onChange={(e) => setNewVolunteerSpots(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Benchmark Operational Configurations (Atados, Goodera, Hacesfalta, Maat) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Parámetros Operativos & RSE (Benchmarks Internacionales)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Modalidad (Atados)
                    </label>
                    <select
                      value={newModality}
                      onChange={(e) => setNewModality(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="PRESENCIAL">Presencial en Terreno</option>
                      <option value="VIRTUAL">100% Virtual / Remoto</option>
                      <option value="HIBRIDO">Híbrido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dedicación Requerida
                    </label>
                    <select
                      value={newDedication}
                      onChange={(e) => setNewDedication(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="PUNTUAL">Puntual / Por Jornada</option>
                      <option value="RECURRENTE">Recurrente / Continuo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Capacidad Cuadrilla Corporativa (Goodera)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={newCorporateTeamCapacity}
                      onChange={(e) => setNewCorporateTeamCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ratio Retorno Social SROI Estimado (Maat Impact)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      value={newSroiRatio}
                      onChange={(e) => setNewSroiRatio(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newInsuranceProvided}
                      onChange={(e) => setNewInsuranceProvided(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Incluye Póliza de Seguro de Voluntariado (Hacesfalta)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTrainingProvided}
                      onChange={(e) => setNewTrainingProvided(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Incluye Inducción y Capacitación Previa (Voluntare)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar & Enviar a Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRO-BONO SUBMISSION MODAL */}
      <ProBonoSubmissionModal
        isOpen={isProBonoModalOpen}
        onClose={() => setIsProBonoModalOpen(false)}
        currentUser={currentUser}
        projects={projects}
        onSubmitted={() => {
          setApprovalFeedback('Entregable radicado con éxito. Se encuentra disponible para verificación.');
          setTimeout(() => setApprovalFeedback(null), 4000);
        }}
      />

      {/* PRIVACY & ARCO RIGHTS MODAL */}
      <PrivacyRightsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
