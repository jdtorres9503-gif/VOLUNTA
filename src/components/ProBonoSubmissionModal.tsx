import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  Award,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { Project, User, ProfessionalCategory, JurisdictionCountry } from '../types';
import { dataStore } from '../lib/dataStore';
import { formatSingleCurrency } from '../lib/currency';
import { HOURLY_BENCHMARK_RATES, JURISDICTION_INFO } from '../lib/complianceEngine';

interface ProBonoSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  projects: Project[];
  onSubmitted?: () => void;
}

export const ProBonoSubmissionModal: React.FC<ProBonoSubmissionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  projects,
  onSubmitted,
}) => {
  const jurisdiction = dataStore.getActiveJurisdiction();
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState<ProfessionalCategory>('LEGAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState<number>(10);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<number>(25);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentRate = HOURLY_BENCHMARK_RATES[jurisdiction][category];
  const currency = JURISDICTION_INFO[jurisdiction].currency;
  const estimatedEconomicValuation = (hours || 0) * currentRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !projectId) return;

    dataStore.submitProBonoDeliverable({
      projectId,
      professionalCategory: category,
      title,
      description,
      evidenceUrl: evidenceUrl || 'https://docs.nexusimpact.org/deliverables/evidencia.pdf',
      hoursWorked: hours,
      beneficiariesImpacted: beneficiaries,
    });

    setSubmitted(true);
    onSubmitted?.();
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Radicación de Entregable Pro-Bono de Alto Valor
              </h2>
              <div className="text-xs text-slate-500">
                Valorización auditada según estándares de {JURISDICTION_INFO[jurisdiction].name}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project selection */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800">Proyecto Social Receptor</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:outline-emerald-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city})
                </option>
              ))}
            </select>
          </div>

          {/* Professional Category & Hourly Rate preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Especialidad Profesional</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProfessionalCategory)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:outline-emerald-500"
              >
                <option value="LEGAL">Legal & Cumplimiento Normativo</option>
                <option value="FINANCE">Finanzas, Presupuesto & Auditoría</option>
                <option value="TECH">Tecnología, Cloud & Ciberseguridad</option>
                <option value="ESG_CONSULTING">Consultoría ESG & Huella de Carbono</option>
                <option value="GENERAL">Voluntariado General de Campo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Horas Efectivas Dedicadas</label>
              <input
                type="number"
                min={1}
                max={200}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800 focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Benchmark Valuation Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-emerald-950">
                Tarifa Benchmark de Mercado: {formatSingleCurrency(currentRate, currency)}/hr
              </div>
              <div className="text-[11px] text-emerald-800">
                Valoración Económica Social Estimada:
              </div>
            </div>
            <div className="text-right font-mono font-bold text-emerald-900 text-sm">
              {formatSingleCurrency(estimatedEconomicValuation, currency)}
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800">Título del Entregable o Servicio Prestado</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Revisión y formalización de estatutos de la fundación..."
              className="w-full p-2.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:outline-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800">Descripción Técnica del Alcance y Resultados</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle el trabajo realizado, metodologías aplicadas y valor aportado a la comunidad..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">URL de Evidencia o Repositorio Seguro</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://docs.nexusimpact.org/..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-emerald-500 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Beneficiarios Directos Impactados</label>
              <input
                type="number"
                min={1}
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:outline-emerald-500"
              />
            </div>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Entregable radicado exitosamente. Pendiente de verificación por la ONG.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Radicar para Auditoría
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
