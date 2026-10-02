import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  HeartHandshake,
  Coins,
  Users,
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Project, User } from '../types';
import { formatSingleCurrency } from '../lib/currency';

interface ProjectDetailModalProps {
  project: Project;
  currentUser: User;
  onClose: () => void;
  onActionTrigger?: (action: 'SPONSOR' | 'VOLUNTEER', project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  currentUser,
  onClose,
  onActionTrigger,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Hero Image */}
        <div className="relative h-64 w-full bg-slate-900">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500 text-white">
                ODS #{project.odsNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white">
                {project.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                Verificado por Volunta
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{project.organizationName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{project.city}, Colombia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {new Date(project.startDate).toLocaleDateString()} al{' '}
                {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Acerca de la Causa & Objetivos
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Benchmark Indicators: Modality, Dedication, Insurance & Training (Atados + Hacesfalta) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Condiciones Operativas & Garantías (Estándar Hacesfalta & Atados)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Modalidad</span>
                <span className="font-bold text-slate-900">{project.modality || 'PRESENCIAL'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Dedicación</span>
                <span className="font-bold text-slate-900">{project.dedication || 'PUNTUAL'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Seguro de Voluntario</span>
                <span className="font-bold text-emerald-700">
                  {project.insuranceProvided ? 'Cubierto por ONG' : 'No Aplica / Remoto'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Capacitación Previa</span>
                <span className="font-bold text-blue-700">
                  {project.trainingProvided ? 'Inducción Incluida' : 'Directa'}
                </span>
              </div>
            </div>

            {project.meetingPoint && (
              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Punto de encuentro: <strong className="text-slate-800">{project.meetingPoint}</strong></span>
              </div>
            )}
          </div>

          {/* Impact Metrics & SROI (Maat Impact & Goodera) */}
          {project.impactMetrics && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center justify-between">
                <span>Métricas de Impacto ODS & SROI (Maat Impact)</span>
                {project.impactMetrics.sroiRatio && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SROI {project.impactMetrics.sroiRatio}:1
                  </span>
                )}
                {project.impactMetrics.sroiEstimatedRate && (
                  <span className="text-[10px] font-normal text-emerald-700">
                    SROI Referencia: {project.impactMetrics.sroiEstimatedRate.toLocaleString()} COP/hr
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  {project.impactMetrics.currentValue !== undefined && project.impactMetrics.targetValue !== undefined ? (
                    <div className="text-sm font-bold text-emerald-950">
                      {project.impactMetrics.currentValue.toLocaleString()} de {project.impactMetrics.targetValue.toLocaleString()} {project.impactMetrics.unit || ''}
                    </div>
                  ) : project.impactMetrics.socialValueGenerated ? (
                    <div className="text-xs font-semibold text-emerald-900">
                      {project.impactMetrics.socialValueGenerated}
                    </div>
                  ) : null}
                  {project.impactMetrics.metricLabel && (
                    <div className="text-[11px] text-emerald-800 font-medium">
                      {project.impactMetrics.metricLabel}
                    </div>
                  )}
                </div>
                {project.impactMetrics.co2KgMitigated ? (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-900 font-mono">
                      ~{project.impactMetrics.co2KgMitigated.toLocaleString()} kg CO2
                    </span>
                    <div className="text-[10px] text-emerald-700">Mitigación estimada</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ISO & SDG Standards */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Alineación con Normas ISO & Objetivos Sostenibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.isoStandards.map((iso) => (
                <span
                  key={iso}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {iso.replace('_', ' ')}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                ODS #{project.odsNumber} de la ONU
              </span>
            </div>
          </div>

          {/* Dual Tracks: Funding & Volunteering */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Funding track */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <Coins className="w-4 h-4 text-emerald-600" />
                Financiamiento Requerido (Empresas RSE)
              </div>

              {project.fundingGoals.map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.committedAmount / goal.targetAmount) * 100)
                );

                return (
                  <div key={goal.currency} className="space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-mono text-emerald-700 font-bold">
                        {formatSingleCurrency(goal.committedAmount, goal.currency)}
                      </span>
                      <span className="text-slate-500">
                        de {formatSingleCurrency(goal.targetAmount, goal.currency)} ({goal.currency})
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="text-[11px] text-slate-500">{goal.description}</div>
                  </div>
                );
              })}
            </div>

            {/* Volunteering track */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <Users className="w-4 h-4 text-blue-600" />
                Roles de Voluntariado Requeridos
              </div>

              {project.volunteerRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs"
                >
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{role.title}</span>
                    <span className="font-mono text-slate-600">{role.estimatedHours} hrs</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">{role.description}</div>
                  <div className="text-emerald-700 font-medium text-[11px]">
                    {role.spotsTotal - role.spotsFilled} cupos disponibles de {role.spotsTotal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Alineado a ISO 14001 / ISO 26000 • Volunta MVP1
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
