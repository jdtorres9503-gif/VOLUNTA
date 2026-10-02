import React, { useState, useEffect } from 'react';
import {
  Building2,
  Coins,
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Users,
  Info,
  FileText,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import { CurrencyCode, Project, SponsorshipIntent, User, VolunteerModality, JurisdictionCountry } from '../types';
import { dataStore } from '../lib/dataStore';
import { formatSingleCurrency, formatMultiCurrencyString, aggregateCurrencyAmounts } from '../lib/currency';
import { ExecutiveEsgReportModal } from './ExecutiveEsgReportModal';
import { PrivacyRightsModal } from './PrivacyRightsModal';
import { ComplianceDashboard } from './ComplianceDashboard';
import { JURISDICTION_INFO, calculateSroiAndGriMetrics, HOURLY_BENCHMARK_RATES } from '../lib/complianceEngine';

interface EmpresaViewProps {
  currentUser: User;
  projects: Project[];
  sponsorships: SponsorshipIntent[];
  onOpenProjectDetail: (project: Project) => void;
  initialTab?: 'MARKETPLACE' | 'MY_SPONSORSHIPS' | 'CORPORATE_VOLUNTEERING' | 'PRO_BONO_COMPLIANCE';
}

export const EmpresaView: React.FC<EmpresaViewProps> = ({
  currentUser,
  projects,
  sponsorships,
  onOpenProjectDetail,
  initialTab = 'MARKETPLACE',
}) => {
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_SPONSORSHIPS' | 'CORPORATE_VOLUNTEERING' | 'PRO_BONO_COMPLIANCE'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');

  // Executive ESG Report Modal (Benevity)
  const [isEsgReportOpen, setIsEsgReportOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Sponsorship modal
  const [selectedProjectForSponsorship, setSelectedProjectForSponsorship] = useState<Project | null>(null);
  const [amount, setAmount] = useState<number>(10000000);
  const [currency, setCurrency] = useState<CurrencyCode>('COP');
  const [contactPerson, setContactPerson] = useState(currentUser.name);
  const [contactEmail, setContactEmail] = useState(currentUser.email);
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '+57 315 222 3344');
  const [notes, setNotes] = useState('');

  // Goodera: Team Volunteering Booking Modal
  const [selectedProjectForTeamBooking, setSelectedProjectForTeamBooking] = useState<Project | null>(null);
  const [teamSize, setTeamSize] = useState<number>(15);
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-24');
  const [matchingGiftEnabled, setMatchingGiftEnabled] = useState<boolean>(true);
  const [matchingGiftPerHour, setMatchingGiftPerHour] = useState<number>(50000);
  const [matchingGiftCurrency, setMatchingGiftCurrency] = useState<'COP' | 'USD'>('COP');
  const [teamNotes, setTeamNotes] = useState<string>('');

  // Only show PUBLISHED projects to Empresa in the marketplace
  const publishedProjects = projects.filter((p) => p.status === 'PUBLISHED');

  const filteredProjects = publishedProjects.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (modalityFilter !== 'ALL' && p.modality !== modalityFilter) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.organizationName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  });

  // Filter sponsorships by this company's tenant
  const mySponsorships = sponsorships.filter(
    (s) => s.empresaOrganizationId === currentUser.organizationId
  );

  // Corporate team bookings
  const corporateBookings = dataStore.getCorporateBookingsForCurrentContext();

  // Pro-Bono deliverables and Compliance metrics
  const activeJurisdiction = dataStore.getActiveJurisdiction();
  const proBonoDeliverables = dataStore.getProBonoDeliverables().filter(
    (d) => d.status === 'ONG_APPROVED'
  );
  const auditBlocks = dataStore.getAuditBlocks();

  const totalFinancialAmount = mySponsorships.reduce((acc, s) => acc + s.amount, 0);
  const complianceMetrics = calculateSroiAndGriMetrics({
    country: activeJurisdiction,
    directFinancialAporte: totalFinancialAmount > 0 ? totalFinancialAmount : 25000000,
    currency: JURISDICTION_INFO[activeJurisdiction].currency,
    deliverables: proBonoDeliverables,
    teamBookings: corporateBookings,
    projects: projects.slice(0, 3),
  });

  // Group currencies strictly separately
  const totalCommitted = aggregateCurrencyAmounts(
    mySponsorships.map((s) => ({ amount: s.amount, currency: s.currency }))
  );
  const totalCommittedString = formatMultiCurrencyString(totalCommitted);

  const handleRegisterSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForSponsorship) return;

    try {
      dataStore.registerSponsorshipIntent({
        projectId: selectedProjectForSponsorship.id,
        amount: Number(amount),
        currency,
        contactPerson,
        contactEmail,
        contactPhone,
        notes,
      });

      setSelectedProjectForSponsorship(null);
      setNotes('');
      alert(
        `¡Intención de patrocinio por ${formatSingleCurrency(
          Number(amount),
          currency
        )} registrada con éxito! La ONG ${selectedProjectForSponsorship.organizationName} ha recibido tu contacto.`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar patrocinio');
    }
  };

  const handleBookCorporateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForTeamBooking) return;

    try {
      dataStore.bookCorporateTeam({
        projectId: selectedProjectForTeamBooking.id,
        teamSize: Number(teamSize),
        preferredDate,
        contactPerson,
        contactEmail,
        contactPhone,
        matchingGiftEnabled,
        matchingGiftPerHour: matchingGiftEnabled ? Number(matchingGiftPerHour) : undefined,
        matchingGiftCurrency: matchingGiftEnabled ? matchingGiftCurrency : undefined,
        notes: teamNotes,
      });

      setSelectedProjectForTeamBooking(null);
      setTeamNotes('');
      setActiveTab('CORPORATE_VOLUNTEERING');
      alert(
        `¡Jornada de voluntariado corporativo (Escuadrón de ${teamSize} colaboradores) reservada con éxito! La ONG coordinará la logística.`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al reservar jornada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
              Portal de Empresa & RSE
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {currentUser.organizationName || 'Empresa Aliada'}
            </h1>
            <p className="text-sm text-slate-600">
              Canaliza fondos de inversión social hacia proyectos verificados de ONGs aliadas y moviliza talento mediante voluntariado corporativo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shrink-0">
              <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                Patrocinios Comprometidos
              </div>
              <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">
                {totalCommittedString}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                {mySponsorships.length} convenios formalizados
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-3.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Privacidad & ARCO</span>
              </button>
              <button
                onClick={() => setIsEsgReportOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3.5 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-purple-700" />
                <span>Generar Informe ESG / Sostenibilidad</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'MARKETPLACE'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Explorar Proyectos Verificados ({publishedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_SPONSORSHIPS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'MY_SPONSORSHIPS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Mis Patrocinios RSE ({mySponsorships.length})
          </button>
          <button
            onClick={() => setActiveTab('CORPORATE_VOLUNTEERING')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'CORPORATE_VOLUNTEERING'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Voluntariado en Equipo ({corporateBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('PRO_BONO_COMPLIANCE')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'PRO_BONO_COMPLIANCE'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Compliance Dashboard (GRI / ODS / SROI)
          </button>
        </div>
      </div>

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por causa, ONG o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Causa:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white"
                >
                  <option value="ALL">Todas las Causas</option>
                  <option value="AMBIENTAL">Ambiental (ISO 14001)</option>
                  <option value="EDUCACION">Educación STEM (ISO 9001)</option>
                  <option value="EMPRENDIMIENTO">Emprendimiento</option>
                  <option value="SALUD">Salud y Bienestar</option>
                  <option value="COMUNIDAD">Comunitario</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Modalidad:</span>
                <select
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white"
                >
                  <option value="ALL">Todas (Atados)</option>
                  <option value="PRESENCIAL">Presencial en Terreno</option>
                  <option value="VIRTUAL">Virtual / Remoto</option>
                  <option value="HIBRIDO">Híbrido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/90 text-slate-800 shadow-xs backdrop-blur-xs">
                        ODS #{project.odsNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow-xs">
                        Verificado
                      </span>
                      {project.modality && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white shadow-xs">
                          {project.modality}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                      {project.organizationName}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">{project.summary}</p>

                    {/* Impact metric badge (Maat Impact) */}
                    {project.impactMetrics && (
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2 text-xs flex items-center justify-between">
                        <span className="text-[11px] font-medium text-emerald-900 truncate">
                          {project.impactMetrics.metricLabel}
                        </span>
                        <span className="font-bold text-emerald-800 shrink-0">
                          {project.impactMetrics.targetValue} {project.impactMetrics.unit}
                        </span>
                      </div>
                    )}

                    {/* Funding Goals */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Meta Financiera:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {project.fundingGoals.map((g) => (
                            <span key={g.currency}>
                              {formatSingleCurrency(g.targetAmount, g.currency)} ({g.currency})
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Patrocinado hasta hoy:</span>
                        <span className="font-mono font-semibold text-emerald-700">
                          {project.fundingGoals.map((g) => (
                            <span key={g.currency}>
                              {formatSingleCurrency(g.committedAmount, g.currency)} ({g.currency})
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedProjectForSponsorship(project);
                        const defaultGoal = project.fundingGoals[0];
                        if (defaultGoal) {
                          setCurrency(defaultGoal.currency);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 shrink-0" />
                      <span>Patrocinar</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProjectForTeamBooking(project);
                      }}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Team Day</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenProjectDetail(project)}
                    className="w-full text-center text-xs text-slate-600 hover:text-slate-900 font-medium py-1 cursor-pointer"
                  >
                    Ver detalles completos & voluntariado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY SPONSORSHIPS */}
      {activeTab === 'MY_SPONSORSHIPS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Historial de Patrocinios de RSE
              </h2>
              <p className="text-xs text-slate-500">
                Compromisos formalizados por tu compañía en Volunta.
              </p>
            </div>
          </div>

          {mySponsorships.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tu empresa aún no ha registrado intenciones de patrocinio. Puedes explorar los proyectos en la pestaña de marketplace.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {mySponsorships.map((spon) => (
                <div key={spon.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{spon.projectTitle}</span>
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

                    <div className="text-xs text-slate-500">
                      Contacto designado: {spon.contactPerson} ({spon.contactEmail})
                    </div>

                    {spon.notes && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                        Condiciones: "{spon.notes}"
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-mono font-bold text-emerald-700">
                      {formatSingleCurrency(spon.amount, spon.currency)} ({spon.currency})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Registrado el {new Date(spon.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CORPORATE VOLUNTEERING (Goodera & Benevity) */}
      {activeTab === 'CORPORATE_VOLUNTEERING' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  <Users className="w-3.5 h-3.5" />
                  Modelo Goodera & Benevity
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Jornadas de Voluntariado Corporativo en Equipo (Team Volunteering)
                </h2>
                <p className="text-xs text-slate-500">
                  Incentiva la cohesión de tus equipos con jornadas presenciales o virtuales coordinadas con las ONGs y multiplicador "Dollars for Doers".
                </p>
              </div>

              <button
                onClick={() => setActiveTab('MARKETPLACE')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer shrink-0"
              >
                <Users className="w-3.5 h-3.5" />
                Reservar Nuevo Team Day
              </button>
            </div>

            {corporateBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                No tienes jornadas de voluntariado en equipo registradas. Explora proyectos y pulsa "Team Day" para reservar tu escuadrón.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {corporateBookings.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{b.projectTitle}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status === 'CONFIRMED' ? 'Confirmado con ONG' : 'En Coordinación'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span>
                          Escuadrón: <strong className="text-slate-900 font-semibold">{b.teamSize} colaboradores</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Fecha prevista: <strong className="text-slate-900 font-semibold">{b.preferredDate}</strong>
                        </span>
                        <span>•</span>
                        <span>Contacto: {b.contactPerson} ({b.contactPhone})</span>
                      </div>

                      {b.matchingGiftEnabled && (
                        <div className="text-xs text-purple-800 bg-purple-50 p-2 rounded-lg border border-purple-200 inline-flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-purple-600" />
                          <span>
                            <strong>Benevity Dollars for Doers:</strong> Donación de {b.matchingGiftPerHour?.toLocaleString()} {b.matchingGiftCurrency} por cada hora ejecutada por colaborador.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-slate-500">ID: {b.id}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Registrado el {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRO-BONO COMPLIANCE & ISO/GRI DASHBOARD */}
      {activeTab === 'PRO_BONO_COMPLIANCE' && (
        <div className="animate-in fade-in">
          <ComplianceDashboard
            currentUser={currentUser}
            projects={projects}
            sponsorships={sponsorships}
            corporateBookings={corporateBookings}
            onOpenEsgReport={() => setIsEsgReportOpen(true)}
            onOpenProjectDetail={onOpenProjectDetail}
          />
        </div>
      )}

      {/* GOODERA TEAM VOLUNTEERING BOOKING MODAL */}
      {selectedProjectForTeamBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Reservar Jornada de Voluntariado Corporativo (Team Day)
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  Para: {selectedProjectForTeamBooking.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectForTeamBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                Estándar Goodera & Atados
              </div>
              <p>
                Reserva un cupo para un grupo o departamento de tu empresa. La ONG receptora ({selectedProjectForTeamBooking.organizationName}) se encargará de coordinar la logística, el punto de encuentro ({selectedProjectForTeamBooking.meetingPoint || 'Por acordar'}) y la inducción de seguridad.
              </p>
            </div>

            <form onSubmit={handleBookCorporateTeam} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número de Colaboradores (Tamaño del Escuadrón) *
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={selectedProjectForTeamBooking.corporateTeamCapacity || 100}
                    required
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    Capacidad máxima ONG: {selectedProjectForTeamBooking.corporateTeamCapacity || 50} personas
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha Tentativa de la Jornada *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Benevity Matching Gift (Dollars for Doers) */}
              <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-950 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={matchingGiftEnabled}
                      onChange={(e) => setMatchingGiftEnabled(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Activar Multiplicador "Dollars for Doers" (Benevity)</span>
                  </label>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full">
                    RSE Top Practice
                  </span>
                </div>

                {matchingGiftEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                        Donación por Hora donada
                      </label>
                      <input
                        type="number"
                        min={1000}
                        value={matchingGiftPerHour}
                        onChange={(e) => setMatchingGiftPerHour(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-white font-mono focus:outline-purple-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                        Moneda
                      </label>
                      <select
                        value={matchingGiftCurrency}
                        onChange={(e) => setMatchingGiftCurrency(e.target.value as 'COP' | 'USD')}
                        className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-white focus:outline-purple-500 text-xs"
                      >
                        <option value="COP">COP ($ Pesos)</option>
                        <option value="USD">USD ($ Dólares)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Líder / Contacto de la Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono del Coordinador *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notas de Logística o Requerimientos de Transporte
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: El equipo viaja en bus corporativo y requiere refrigerio vegano para 4 personas..."
                  value={teamNotes}
                  onChange={(e) => setTeamNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForTeamBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirmar Reserva de Escuadrón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPONSORSHIP INTENT REGISTRATION MODAL */}
      {selectedProjectForSponsorship && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Intención de Patrocinio RSE
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  Para: {selectedProjectForSponsorship.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectForSponsorship(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Clean Information Banner */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                Este formulario formaliza un compromiso institucional de inversión social. El desembolso efectivo y la emisión del certificado tributario de donación se coordinan directamente con la organización receptora.
              </div>
            </div>

            <form onSubmit={handleRegisterSponsorship} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Moneda del Aporte *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                  >
                    <option value="COP">COP (Pesos Colombianos)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto a Patrocinar *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persona de Contacto de RSE / Sostenibilidad *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condiciones, expectativas de visibilidad o notas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Aporte condicionado a envío de informe fotográfico para reporte de sostenibilidad GRI..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForSponsorship(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirmar Intención de Patrocinio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXECUTIVE ESG REPORT MODAL */}
      <ExecutiveEsgReportModal
        isOpen={isEsgReportOpen}
        onClose={() => setIsEsgReportOpen(false)}
        currentUser={currentUser}
        sponsorships={sponsorships}
        corporateBookings={corporateBookings}
        projects={projects}
      />

      {/* PRIVACY & ARCO RIGHTS PORTAL MODAL */}
      <PrivacyRightsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

