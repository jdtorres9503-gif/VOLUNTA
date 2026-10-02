import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  HeartHandshake,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Laptop,
  GraduationCap,
  Filter,
  Coins,
  Gift,
  FileText,
  Lock,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { Project, User, VolunteerApplication, VolunteerRoleSlot, ProBonoDeliverable, ImpactPerkReward } from '../types';
import { dataStore } from '../lib/dataStore';
import { VolunteerDiplomaModal } from './VolunteerDiplomaModal';
import { ProBonoSubmissionModal } from './ProBonoSubmissionModal';
import { PrivacyRightsModal } from './PrivacyRightsModal';
import { LegalAdhesionModal } from './LegalAdhesionModal';
import { PerkRedeemModal } from './PerkRedeemModal';
import { formatSingleCurrency } from '../lib/currency';
import { JURISDICTION_INFO } from '../lib/complianceEngine';

interface VoluntarioViewProps {
  currentUser: User;
  projects: Project[];
  applications: VolunteerApplication[];
  onOpenProjectDetail: (project: Project) => void;
}

export const VoluntarioView: React.FC<VoluntarioViewProps> = ({
  currentUser,
  projects,
  applications,
  onOpenProjectDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_APPLICATIONS' | 'MY_DELIVERABLES' | 'MY_TOKENS' | 'PERKS_MARKETPLACE'>('EXPLORE');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<'ALL' | 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO'>('ALL');
  const [dedicationFilter, setDedicationFilter] = useState<'ALL' | 'PUNTUAL' | 'RECURRENTE'>('ALL');
  const [perkCategoryFilter, setPerkCategoryFilter] = useState<string>('ALL');
  const [isProBonoModalOpen, setIsProBonoModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [selectedPerkForRedeem, setSelectedPerkForRedeem] = useState<ImpactPerkReward | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Application Modal state
  const [selectedSlotForApplication, setSelectedSlotForApplication] = useState<{
    project: Project;
    slot: VolunteerRoleSlot;
  } | null>(null);
  const [motivation, setMotivation] = useState('');
  const [habeasDataAccepted, setHabeasDataAccepted] = useState(true);

  // Diploma modal state
  const [selectedAppForDiploma, setSelectedAppForDiploma] = useState<VolunteerApplication | null>(null);

  // My applications
  const myApplications = applications.filter((a) => a.volunteerUserId === currentUser.id);

  // Pro-Bono Deliverables
  const myDeliverables = dataStore
    .getProBonoDeliverables()
    .filter((d) => d.volunteerUserId === currentUser.id);
  const totalProBonoHours = myDeliverables.reduce((acc, d) => acc + d.hoursWorked, 0);
  const approvedDeliverables = myDeliverables.filter((d) => d.status === 'ONG_APPROVED');

  // Hours calculated
  const verifiedHours = myApplications.reduce((acc, a) => acc + (a.verifiedHours || 0), 0);
  const committedHours = myApplications.reduce((acc, a) => acc + (a.hoursCommitted || 0), 0);

  // Impact Tokens, Badges & Adhesion Terms
  const wallet = dataStore.getTokenWallet(currentUser.id);
  const userTransactions = dataStore.getTokenTransactions(currentUser.id);
  const userBadges = dataStore.getSoulboundBadges(currentUser.id);
  const perks = dataStore.getPerkRewards();
  const adhesionTerms = dataStore.getAdhesionTerms(currentUser.id);
  const isAdhesionSigned = adhesionTerms.length > 0 || wallet.adhesionTermSigned;

  // Published projects only
  const publishedProjects = projects.filter((p) => p.status === 'PUBLISHED');

  const filteredProjects = publishedProjects.filter((p) => {
    if (modalityFilter !== 'ALL' && p.modality && p.modality !== modalityFilter) {
      return false;
    }
    if (dedicationFilter !== 'ALL' && p.dedication && p.dedication !== dedicationFilter) {
      return false;
    }
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.organizationName.toLowerCase().includes(q) ||
      p.volunteerRoles.some((r) => r.title.toLowerCase().includes(q) || r.requiredSkills.some(s => s.toLowerCase().includes(q)))
    );
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForApplication) return;

    if (!habeasDataAccepted) {
      alert('Por favor confirma la autorización de contacto para coordinar la actividad con la organización.');
      return;
    }

    try {
      dataStore.applyToVolunteerRole({
        projectId: selectedSlotForApplication.project.id,
        roleSlotId: selectedSlotForApplication.slot.id,
        motivation: motivation || 'Deseo contribuir activamente a esta causa social con mi tiempo y energía.',
        habeasDataAccepted: true,
      });

      setSelectedSlotForApplication(null);
      setMotivation('');
      alert('¡Postulación enviada exitosamente! La ONG revisará tu perfil y se pondrá en contacto.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al enviar postulación');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <UserCheck className="w-3.5 h-3.5" />
              Pasaporte del Voluntario (Filantropía Social)
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hola, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-600">
              Dona tu talento y tiempo a proyectos de alto impacto ecológico y comunitario con certificación de horas bajo ISO 26000.
            </p>
          </div>

          {/* Volunteer Impact Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Privacidad & ARCO
            </button>
            <button
              onClick={() => setIsProBonoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              Radicar Entregable Pro-Bono
            </button>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center min-w-28">
              <div className="text-[10px] font-semibold text-emerald-800 uppercase flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                Horas Certificadas
              </div>
              <div className="text-xl font-bold text-emerald-950 mt-0.5 font-mono">
                {verifiedHours + totalProBonoHours} hrs
              </div>
              <div className="text-[9px] text-emerald-700">Campo + Pro-Bono</div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center min-w-28">
              <div className="text-[10px] font-semibold text-indigo-800 uppercase flex items-center justify-center gap-1">
                <Coins className="w-3 h-3 text-indigo-600" />
                Billetera VIT
              </div>
              <div className="text-xl font-bold text-indigo-950 mt-0.5 font-mono">
                {wallet.balance} VIT
              </div>
              <div className="text-[9px] text-indigo-700 font-semibold">Nivel {wallet.level}</div>
            </div>

            <button
              onClick={() => setIsLegalModalOpen(true)}
              className={`p-3 rounded-xl border text-center min-w-28 transition-colors cursor-pointer ${
                isAdhesionSigned
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 animate-pulse'
              }`}
              title="Término de adhesión bajo leyes de voluntariado de Colombia, Chile y Brasil"
            >
              <div className="text-[10px] font-semibold uppercase flex items-center justify-center gap-1">
                <FileText className="w-3 h-3" />
                Adhesión Legal
              </div>
              <div className="text-xs font-extrabold mt-0.5">
                {isAdhesionSigned ? '✓ Formalizado' : '⚠️ Firmar Ley'}
              </div>
              <div className="text-[9px] text-slate-500">
                {isAdhesionSigned ? 'No Laboral' : 'Pendiente'}
              </div>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {successToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'EXPLORE'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Explorar Convocatorias ({publishedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_APPLICATIONS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'MY_APPLICATIONS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Mis Voluntariados Activos ({myApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_DELIVERABLES')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'MY_DELIVERABLES'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Mis Entregables Pro-Bono ({myDeliverables.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_TOKENS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'MY_TOKENS'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-indigo-600" />
            Billetera VIT & Insignias ({wallet.balance} VIT)
          </button>
          <button
            onClick={() => setActiveTab('PERKS_MARKETPLACE')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'PERKS_MARKETPLACE'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-600" />
            Catálogo de Recompensas ({perks.length})
          </button>
        </div>
      </div>

      {/* TAB 1: EXPLORE OPPORTUNITIES */}
      {activeTab === 'EXPLORE' && (
        <div className="space-y-4">
          {/* Search bar & Benchmark Filters (Atados / Hacesfalta) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por habilidad, causa o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>Modalidad:</span>
                <select
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white"
                >
                  <option value="ALL">Todas las modalidades</option>
                  <option value="PRESENCIAL">Presencial en Terreno</option>
                  <option value="VIRTUAL">100% Virtual / Remoto</option>
                  <option value="HIBRIDO">Híbrido</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Dedicación:</span>
                <select
                  value={dedicationFilter}
                  onChange={(e) => setDedicationFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white"
                >
                  <option value="ALL">Cualquier dedicación</option>
                  <option value="PUNTUAL">Puntual / Por Jornada</option>
                  <option value="RECURRENTE">Recurrente / Continuo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ODS #{project.odsNumber} • {project.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.city}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {project.modality || 'PRESENCIAL'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {project.title}
                  </h3>

                  <div className="text-xs text-emerald-700 font-semibold">
                    Organizado por {project.organizationName}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{project.summary}</p>

                  {/* Trust badges: Hacesfalta & Voluntare benchmark */}
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    {project.insuranceProvided && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="w-3 h-3" /> Seguro RC voluntariado incluido
                      </span>
                    )}
                    {project.trainingProvided && (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                        <GraduationCap className="w-3 h-3" /> Inducción y capacitación previa
                      </span>
                    )}
                  </div>

                  {/* Available volunteer roles */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800">
                      Roles de Voluntariado Solicitados:
                    </div>

                    {project.volunteerRoles.map((role) => {
                      const hasApplied = myApplications.some(
                        (a) => a.projectId === project.id && a.roleSlotId === role.id
                      );
                      const spotsRemaining = Math.max(0, role.spotsTotal - role.spotsFilled);

                      return (
                        <div
                          key={role.id}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{role.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {role.description}
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                              {role.estimatedHours} hrs
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {role.requiredSkills.map((sk) => (
                              <span
                                key={sk}
                                className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-slate-500 text-[11px]">
                              {spotsRemaining > 0
                                ? `${spotsRemaining} cupos disponibles`
                                : 'Cupos llenos'}
                            </span>

                            {hasApplied ? (
                              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ya te has postulado
                              </span>
                            ) : (
                              <button
                                onClick={() => setSelectedSlotForApplication({ project, slot: role })}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                              >
                                Postularme
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Alineado a ISO 26000 (Responsabilidad Social)
                  </span>
                  <button
                    onClick={() => onOpenProjectDetail(project)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    Ver Proyecto Completo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'MY_APPLICATIONS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mis Participaciones en Voluntariado
              </h2>
              <p className="text-xs text-slate-500">
                Estado de tus postulaciones y horas certificadas para tu hoja de vida.
              </p>
            </div>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No tienes postulaciones activas. Revisa la pestaña de convocatorias para postularte a una causa.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myApplications.map((app) => (
                <div key={app.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{app.projectTitle}</span>
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
                          ? 'Aceptado para Participar'
                          : 'Pendiente de Revisión por ONG'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Rol: <span className="font-semibold text-slate-800">{app.roleTitle}</span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Horas comprometidas: {app.hoursCommitted} hrs •{' '}
                      {app.verifiedHours ? `${app.verifiedHours} hrs verificadas` : 'Sin verificar aún'}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Consentimiento Ley 1581 (Habeas Data): Registrado y protegido
                    </div>
                  </div>

                  <div className="shrink-0">
                    {app.status === 'HOURS_VERIFIED' ? (
                      <button
                        onClick={() => setSelectedAppForDiploma(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        <FileCheck className="w-4 h-4" />
                        Ver / Descargar Diploma ISO 26000
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Constancia disponible al verificar horas
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRO-BONO DELIVERABLES & CERTIFICATES */}
      {activeTab === 'MY_DELIVERABLES' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Mis Aportes Pro-Bono Certificados (ISO 9001 / GRI 404)
              </h3>
              <p className="text-xs text-slate-500">
                Tu talento profesional genera valor social medible. Todos tus entregables aprobados por la ONG quedan sellados criptográficamente para auditorías ESG.
              </p>
            </div>

            <button
              onClick={() => setIsProBonoModalOpen(true)}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Award className="w-3.5 h-3.5" />
              Radicar Nuevo Entregable
            </button>
          </div>

          {myDeliverables.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <Award className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Aún no has registrado entregables Pro-Bono con tu talento profesional.
              </p>
              <button
                onClick={() => setIsProBonoModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Radicar mi primer Entregable Pro-Bono
              </button>
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
                          {deliv.status === 'ONG_APPROVED' ? 'Aprobado & Sellado SHA-256' : 'En Revisión por ONG'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{deliv.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{deliv.description}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Proyecto vinculado: <span className="font-semibold text-slate-700">{deliv.projectTitle}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-emerald-700">
                        {formatSingleCurrency(deliv.economicValuation, deliv.currency)}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {deliv.hoursWorked} horas dedicadas
                      </div>
                    </div>
                  </div>

                  {deliv.status === 'ONG_APPROVED' ? (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Aprobado por la ONG ({new Date(deliv.approvedAt || '').toLocaleDateString()})
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          Valor/Hora: {formatSingleCurrency(deliv.economicValuation / deliv.hoursWorked, deliv.currency)}
                        </span>
                      </div>
                      {deliv.feedbackNotes && (
                        <p className="text-emerald-800 text-[11px] italic">
                          "{deliv.feedbackNotes}"
                        </p>
                      )}
                      <div className="text-[10px] font-mono text-emerald-700 flex items-center justify-between pt-1 border-t border-emerald-200/60">
                        <span className="truncate">Sello Criptográfico: {deliv.sha256VerificationHash}</span>
                        <span className="shrink-0 font-bold ml-2">ISO 27001 Validado</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        La ONG está revisando este entregable. Una vez aprobada la satisfacción técnica, tu constancia quedará sellada con hash SHA-256.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICATION MODAL */}
      {selectedSlotForApplication && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Postularme a Convocatoria
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSlotForApplication.slot.title} en {selectedSlotForApplication.project.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotForApplication(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tu Motivación o Experiencia Relevante *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Cuéntale a la ONG por qué te apasiona esta causa y cómo puedes sumar valor..."
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Horas estimadas del rol:</span>
                  <span className="font-bold text-slate-800">
                    {selectedSlotForApplication.slot.estimatedHours} horas
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tus datos de contacto:</span>
                  <span className="font-mono text-slate-800">{currentUser.email}</span>
                </div>
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  checked={habeasDataAccepted}
                  onChange={(e) => setHabeasDataAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="privacyConsent" className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  Autorizo el tratamiento de mis datos de contacto con la finalidad exclusiva de coordinar las actividades de voluntariado con la organización convocante.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForApplication(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirmar Postulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: IMPACT TOKENS & SOULBOUND BADGES */}
      {activeTab === 'MY_TOKENS' && (
        <div className="space-y-6">
          {/* Main Wallet Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Coins className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Billetera de Impacto Social (VIT)</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white">
                    {wallet.balance}
                  </span>
                  <span className="text-xl font-bold text-indigo-300">VIT Tokens</span>
                </div>
                <p className="text-xs text-slate-300 max-w-md">
                  Incentivos honoríficos no dinerarios por cada hora y entregable verificado. Exentos de impuesto de renta conforme a la legislación de voluntariado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-32">
                  <div className="text-[10px] uppercase font-bold text-indigo-200">Total Acuñado</div>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">+{wallet.totalMinted}</div>
                  <div className="text-[9px] text-slate-300">Histórico de mérito</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-32">
                  <div className="text-[10px] uppercase font-bold text-amber-200">Nivel de Impacto</div>
                  <div className="text-xl font-black font-mono text-amber-300 mt-0.5">{wallet.level}</div>
                  <div className="text-[9px] text-slate-300">Reputación ESG</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-32">
                  <div className="text-[10px] uppercase font-bold text-emerald-200">Canjeados</div>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">-{wallet.totalRedeemed}</div>
                  <div className="text-[9px] text-slate-300">Recompensas activadas</div>
                </div>
              </div>
            </div>

            {/* Legal adhesion banner inside wallet */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {isAdhesionSigned ? (
                    <>
                      <strong>Término de Adhesión Formalizado:</strong> Amparado bajo Ley 720/2001 (CO), Ley 20.500 (CL) o Lei 9.608 (BR).
                    </>
                  ) : (
                    <>
                      <strong className="text-amber-300">Término de Adhesión Pendiente:</strong> Formaliza tu compromiso voluntario sin vínculo laboral.
                    </>
                  )}
                </span>
              </div>

              <button
                onClick={() => setIsLegalModalOpen(true)}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAdhesionSigned ? 'Ver Término Firmado' : 'Firmar Término Ahora'}</span>
              </button>
            </div>
          </div>

          {/* Section: Soulbound Badges (ERC-5192) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Insignias Soulbound de Impacto (ERC-5192 Proof-of-Impact)
                </h3>
                <p className="text-xs text-slate-500">
                  Credenciales digitales permanentes e intransferibles emitidas por las organizaciones aliadas como prueba inmutable de tu contribución.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {userBadges.length} Insignias Emitidas
              </span>
            </div>

            {userBadges.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Aún no tienes insignias Soulbound. Radica y aprueba un entregable pro-bono o cumple 10+ horas para obtener tu primera credencial intransferible.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-white shadow-xs space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                        ODS {badge.odsNumber}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Soulbound
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{badge.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Emitido por: {badge.issuedByOngName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Horas Auditadas</div>
                        <div className="font-bold text-slate-800 font-mono">{badge.verifiedHours} hrs</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Aporte en Especie</div>
                        <div className="font-bold text-emerald-700 font-mono">
                          {formatSingleCurrency(badge.economicValuationInKind, badge.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate" title={badge.sha256CertificateHash}>
                        Hash: {badge.sha256CertificateHash.substring(0, 16)}...
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(badge.sha256CertificateHash);
                          setCopiedHash(badge.id);
                          setTimeout(() => setCopiedHash(null), 2000);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-sans font-bold flex items-center gap-0.5 shrink-0"
                      >
                        {copiedHash === badge.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Transaction Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Historial de Movimientos de Tokens VIT ({userTransactions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Libro mayor de transacciones honoríficas timbradas criptográficamente.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">Tipo</th>
                    <th className="px-3 py-2.5">Monto VIT</th>
                    <th className="px-3 py-2.5">Detalle / Proyecto</th>
                    <th className="px-3 py-2.5">Nota de No Laboralidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/75">
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tx.amount > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono font-bold">
                        <span className={tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} VIT
                        </span>
                      </td>
                      <td className="px-3 py-2.5 max-w-xs truncate" title={tx.reason}>
                        <span className="font-semibold text-slate-800">{tx.reason}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500 max-w-xs truncate" title={tx.legalNonRemunerationNotice}>
                        {tx.legalNonRemunerationNotice}
                      </td>
                    </tr>
                  ))}
                  {userTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                        Aún no tienes movimientos en tu billetera.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PERKS MARKETPLACE (CATÁLOGO DE RECOMPENSAS SOSTENIBLES) */}
      {activeTab === 'PERKS_MARKETPLACE' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block">
                Economía Circular & RSE Corporativo
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Marketplace de Recompensas de Impacto
              </h2>
              <p className="text-xs text-emerald-200 max-w-xl">
                Canjea tus tokens VIT acumulados por beneficios en especie, formación académica certificada y donaciones matching gift patrocinadas por empresas aliadas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-emerald-200">Tu Saldo Disponible</div>
              <div className="text-3xl font-black font-mono text-white mt-0.5">{wallet.balance} VIT</div>
              <div className="text-[9px] text-emerald-300">Listo para canjear</div>
            </div>
          </div>

          {/* Categories filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPerkCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                perkCategoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos ({perks.length})
            </button>
            <button
              onClick={() => setPerkCategoryFilter('FORMACION_EDUCACION')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                perkCategoryFilter === 'FORMACION_EDUCACION'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cursos & Educación
            </button>
            <button
              onClick={() => setPerkCategoryFilter('SOSTENIBILIDAD')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                perkCategoryFilter === 'SOSTENIBILIDAD'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Economía Circular & Árboles
            </button>
            <button
              onClick={() => setPerkCategoryFilter('EXPERIENCIA')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                perkCategoryFilter === 'EXPERIENCIA'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Experiencias Culturales
            </button>
            <button
              onClick={() => setPerkCategoryFilter('MATCHING_DONATION')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                perkCategoryFilter === 'MATCHING_DONATION'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Donaciones Solidarias
            </button>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks
              .filter((p) => perkCategoryFilter === 'ALL' || p.category === perkCategoryFilter)
              .map((perk) => {
                const canAfford = wallet.balance >= perk.tokenCost;
                return (
                  <div
                    key={perk.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {perk.category}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {perk.availableStock} disponibles
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{perk.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{perk.description}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Patrocinado por:</span>
                          <span className="font-bold text-slate-800">{perk.sponsorCompanyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{perk.taxExemptionStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Costo en Tokens</div>
                        <div className="text-xl font-black text-indigo-700 font-mono">{perk.tokenCost} VIT</div>
                      </div>

                      <button
                        onClick={() => setSelectedPerkForRedeem(perk)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Canjear' : 'Faltan VIT'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* DIPLOMA / CERTIFICATE MODAL (ISO 26000) */}
      <VolunteerDiplomaModal
        isOpen={Boolean(selectedAppForDiploma)}
        onClose={() => setSelectedAppForDiploma(null)}
        application={selectedAppForDiploma}
        project={selectedAppForDiploma ? projects.find((p) => p.id === selectedAppForDiploma.projectId) : undefined}
      />

      {/* PRO-BONO SUBMISSION MODAL */}
      <ProBonoSubmissionModal
        isOpen={isProBonoModalOpen}
        onClose={() => setIsProBonoModalOpen(false)}
        currentUser={currentUser}
        projects={projects}
        onSubmitted={() => {
          setSuccessToast('¡Entregable Pro-Bono radicado exitosamente! Ha sido notificado a la ONG para su revisión.');
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />

      {/* PRIVACY & ARCO RIGHTS PORTAL */}
      <PrivacyRightsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentUser={currentUser}
      />

      {/* LEGAL ADHESION MODAL (NON-REMUNERATION COMPLIANCE) */}
      <LegalAdhesionModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        currentUser={currentUser}
        onSignedSuccess={() => {
          setSuccessToast('¡Término de Adhesión formalizado y sellado con hash SHA-256 en la cadena inmutable!');
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />

      {/* PERK REDEMPTION MODAL */}
      <PerkRedeemModal
        isOpen={Boolean(selectedPerkForRedeem)}
        onClose={() => setSelectedPerkForRedeem(null)}
        perk={selectedPerkForRedeem}
        currentUser={currentUser}
        onRedeemSuccess={() => {
          setSuccessToast('¡Recompensa canjeada con éxito! Se ha generado tu timbrado tributario y deducible.');
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />
    </div>
  );
};
