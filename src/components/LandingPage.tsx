import React, { useState } from 'react';
import {
  Building2,
  HeartHandshake,
  UserCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Coins,
  MapPin,
  Calendar,
  Globe2,
  ChevronRight,
  BarChart3,
  Flame,
  FileCheck2,
  Smartphone,
  Download,
  Shield,
  Layers,
} from 'lucide-react';
import { Project, User, UserRole } from '../types';
import { i18n, Language } from '../lib/i18n';
import { formatSingleCurrency, formatMultiCurrencyString, aggregateCurrencyAmounts } from '../lib/currency';

interface LandingPageProps {
  projects: Project[];
  currentUser: User;
  onEnterPlatform: (
    targetRole?: UserRole,
    initialTab?: 'MARKETPLACE' | 'MY_SPONSORSHIPS' | 'CORPORATE_VOLUNTEERING' | 'PRO_BONO_COMPLIANCE'
  ) => void;
  onOpenProjectDetail: (project: Project) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  projects,
  currentUser,
  onEnterPlatform,
  onOpenProjectDetail,
}) => {
  const [selectedProfileType, setSelectedProfileType] = useState<'EMPRESA' | 'ONG' | 'VOLUNTARIO'>('EMPRESA');

  const publishedProjects = projects.filter((p) => p.status === 'PUBLISHED');

  const totalVolunteersNeeded = publishedProjects.reduce(
    (acc, p) => acc + (p.volunteerRoles || []).reduce((sAcc, s) => sAcc + s.spotsTotal, 0),
    0
  );

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-600/15"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{i18n.t('hero_badge')}</span>
          </div>

          {/* Interactive Profile Selector Tabs */}
          <div className="flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-xl mx-auto border border-slate-200 dark:border-slate-700/80 shadow-inner">
            <button
              onClick={() => setSelectedProfileType('EMPRESA')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedProfileType === 'EMPRESA'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{i18n.t('tab_for_companies')}</span>
            </button>

            <button
              onClick={() => setSelectedProfileType('ONG')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedProfileType === 'ONG'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{i18n.t('tab_for_ongs')}</span>
            </button>

            <button
              onClick={() => setSelectedProfileType('VOLUNTARIO')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedProfileType === 'VOLUNTARIO'
                  ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{i18n.t('tab_for_volunteers')}</span>
            </button>
          </div>

          {/* Dynamic Content per Profile */}
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {selectedProfileType === 'EMPRESA' && (
              <>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {i18n.t('hero_empresa_title')}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {i18n.t('hero_empresa_sub')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onEnterPlatform('EMPRESA_RSE', 'MARKETPLACE')}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{i18n.t('hero_empresa_cta1')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEnterPlatform('EMPRESA_RSE', 'PRO_BONO_COMPLIANCE')}
                    className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-blue-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Compliance ESG (GRI / SROI)</span>
                  </button>
                  <a
                    href="#proyectos-destacados"
                    className="w-full sm:w-auto px-5 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{i18n.t('hero_empresa_cta2')}</span>
                  </a>
                </div>
              </>
            )}

            {selectedProfileType === 'ONG' && (
              <>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {i18n.t('hero_ong_title')}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {i18n.t('hero_ong_sub')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onEnterPlatform('ONG_ADMIN')}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{i18n.t('hero_ong_cta1')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEnterPlatform('ONG_ADMIN')}
                    className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{i18n.t('hero_ong_cta2')}</span>
                  </button>
                </div>
              </>
            )}

            {selectedProfileType === 'VOLUNTARIO' && (
              <>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {i18n.t('hero_voluntario_title')}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {i18n.t('hero_voluntario_sub')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onEnterPlatform('VOLUNTEER')}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{i18n.t('hero_voluntario_cta1')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#proyectos-destacados"
                    className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{i18n.t('hero_voluntario_cta2')}</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* STATS COUNTER BAR */}
      <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/70">
          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {i18n.t('stat_funds_label')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {i18n.t('stat_funds_sub')}
            </div>
          </div>

          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {i18n.t('stat_hours_label')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {i18n.t('stat_hours_sub')}
            </div>
          </div>

          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {i18n.t('stat_ods_label')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {i18n.t('stat_ods_sub')}
            </div>
          </div>

          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {i18n.t('stat_projects_label')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {i18n.t('stat_projects_sub')}
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC VALUE PROPOSITIONS (Adjustable to User Type) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {selectedProfileType === 'EMPRESA' && 'Beneficios para tu Estrategia de Sostenibilidad'}
            {selectedProfileType === 'ONG' && 'Herramientas para Impulsar tu Organización'}
            {selectedProfileType === 'VOLUNTARIO' && 'Ventajas de Voluntariar con Volunta'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {selectedProfileType === 'EMPRESA' && 'Respaldado por metodologías de reporte GRI, ISO 26000 y métricas SROI auditadas.'}
            {selectedProfileType === 'ONG' && 'Autonomía total para recibir fondos empresariales y certificar a tus voluntarios.'}
            {selectedProfileType === 'VOLUNTARIO' && 'Validación institucional de tus horas con diplomas oficiales reconocidos por el sector.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedProfileType === 'EMPRESA' && (
            <>
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_empresa_1_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_empresa_1_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_empresa_2_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_empresa_2_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_empresa_3_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_empresa_3_desc')}
                </p>
              </div>
            </>
          )}

          {selectedProfileType === 'ONG' && (
            <>
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_ong_1_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_ong_1_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_ong_2_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_ong_2_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_ong_3_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_ong_3_desc')}
                </p>
              </div>
            </>
          )}

          {selectedProfileType === 'VOLUNTARIO' && (
            <>
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_voluntario_1_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_voluntario_1_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_voluntario_2_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_voluntario_2_desc')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {i18n.t('prop_voluntario_3_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {i18n.t('prop_voluntario_3_desc')}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FEATURED PROJECTS SHOWCASE */}
      <section id="proyectos-destacados" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {i18n.t('showcase_title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {i18n.t('showcase_sub')}
            </p>
          </div>

          <button
            onClick={() => onEnterPlatform(selectedProfileType === 'EMPRESA' ? 'EMPRESA_RSE' : selectedProfileType === 'ONG' ? 'ONG_ADMIN' : 'VOLUNTEER')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{i18n.t('showcase_all')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedProjects.slice(0, 3).map((project) => {
            const primaryGoal = project.fundingGoals[0] || {
              currency: 'COP' as const,
              targetAmount: 1,
              committedAmount: 0,
            };
            const fundingPercent = Math.min(
              100,
              Math.round((primaryGoal.committedAmount / (primaryGoal.targetAmount || 1)) * 100)
            );
            const totalSlots = (project.volunteerRoles || []).reduce((acc, s) => acc + s.spotsTotal, 0);
            const filledSlots = (project.volunteerRoles || []).reduce((acc, s) => acc + s.spotsFilled, 0);

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-600 text-white shadow-xs">
                      ODS #{project.odsNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200">
                      {project.category}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-semibold truncate">
                    {project.organizationName}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {project.summary}
                    </p>
                  </div>

                  {/* Location & Modality */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {project.city}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {project.modality || 'PRESENCIAL'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Meta Financiera:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {fundingPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${fundingPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>{filledSlots} de {totalSlots} voluntarios</span>
                      <span>{formatSingleCurrency(primaryGoal.targetAmount, primaryGoal.currency)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenProjectDetail(project)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      {i18n.t('showcase_view_details')}
                    </button>

                    {selectedProfileType === 'EMPRESA' && (
                      <button
                        onClick={() => onEnterPlatform('EMPRESA_RSE')}
                        className="py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                      >
                        {i18n.t('showcase_sponsor_btn')}
                      </button>
                    )}

                    {selectedProfileType === 'VOLUNTARIO' && (
                      <button
                        onClick={() => onEnterPlatform('VOLUNTEER')}
                        className="py-2 px-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer"
                      >
                        {i18n.t('showcase_apply_btn')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS (TRI-SIDED ECOSYSTEM) */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {i18n.t('how_title')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {i18n.t('how_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20 text-lg font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {i18n.t('how_step1_title')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
              {i18n.t('how_step1_desc')}
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/20 text-lg font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {i18n.t('how_step2_title')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
              {i18n.t('how_step2_desc')}
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-600/20 text-lg font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {i18n.t('how_step3_title')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
              {i18n.t('how_step3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* APP NATIVE STORE & CYBERSECURITY / ISO COMPLIANCE BANNER */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Disponible como App Nativa (iOS & Android)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Lleva el Impacto Social y ESG en tu Bolsillo
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Volunta opera como Progressive Web App (PWA) de alto rendimiento, optimizada para <strong>Apple App Store</strong> y <strong>Google Play Store</strong> con soporte sin conexión, notificaciones de voluntariado y sincronización segura.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
              {/* Apple App Store Native Look */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors backdrop-blur-xs cursor-pointer">
                <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.93-.93.04-2.03.63-2.68 1.4-.58.67-1.09 1.76-.95 2.81 1.03.08 2.07-.53 2.69-1.28z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Instalar para</div>
                  <div className="text-sm font-bold leading-tight">Apple iOS</div>
                </div>
              </div>

              {/* Google Play Store Native Look */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors backdrop-blur-xs cursor-pointer">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186c-.34-.234-.564-.627-.564-1.072V2.886c0-.445.224-.838.564-1.072zm11.246 11.248l2.253 2.253-12.01 6.942 9.757-9.195zm0-2.124L5.098 1.743l12.01 6.942-2.253 2.253zm1.062 1.062l3.414 1.972c.983.568.983 1.494 0 2.062l-3.414 1.972-2.122-2.122 2.122-2.084z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Descargar para</div>
                  <div className="text-sm font-bold leading-tight">Google Play</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Global ISO Standards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> ISO 27001
              </div>
              <div className="text-slate-400 text-[11px]">Seguridad de la información y criptografía SHA-256.</div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4" /> ISO 26000
              </div>
              <div className="text-slate-400 text-[11px]">Responsabilidad social corporativa y gobernanza ESG.</div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-teal-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" /> ISO 14064
              </div>
              <div className="text-slate-400 text-[11px]">Cuantificación y mitigación trazable de huella de carbono CO₂e.</div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> GRI & SROI
              </div>
              <div className="text-slate-400 text-[11px]">Global Reporting Initiative y retorno social monetizado.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-emerald-800 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {i18n.t('cta_banner_title')}
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {i18n.t('cta_banner_sub')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onEnterPlatform(selectedProfileType === 'EMPRESA' ? 'EMPRESA_RSE' : selectedProfileType === 'ONG' ? 'ONG_ADMIN' : 'VOLUNTEER')}
            className="px-8 py-4 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{i18n.t('cta_banner_btn')}</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </section>
    </div>
  );
};
