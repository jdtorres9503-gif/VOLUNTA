import React from 'react';
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  Users,
  Building2,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Compass,
  DollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const benchmarks = [
    {
      name: 'Maat Impact',
      url: 'https://maatimpact.com/es',
      origin: 'España / LatAm',
      badge: 'ESG & ODS Metrics',
      accentColor: 'border-emerald-500 bg-emerald-50/40 text-emerald-800',
      icon: TrendingUp,
      headline: '4 Tipologías de Voluntariado & Trazabilidad de Métricas ODS Cuantificables',
      whatWeAdopted: [
        'Segmentación en 4 causas nucleares: Ambiental (ISO 14001), Educación STEM, Pro Bono Profesional y Social Comunitario.',
        'Métricas de impacto por proyecto (Árboles plantados, niñas formadas, CO2 mitigado) para memorias de sostenibilidad.',
        'Alineación formal con Objetivos de Desarrollo Sostenible (ODS 2, 4, 6, 8, 13, 15) en cada ficha y reporte corporativo.',
      ],
    },
    {
      name: 'Atados',
      url: 'https://www.atados.com.br/',
      origin: 'Brasil (Líder LatAm)',
      badge: 'Filtros & Gamificación',
      accentColor: 'border-amber-500 bg-amber-50/40 text-amber-800',
      icon: Compass,
      headline: 'Filtros Operativos (Modalidad & Dedicación) y Pasaporte con Insignias Sociales',
      whatWeAdopted: [
        'Filtros directos de búsqueda: Presencial vs. Virtual vs. Híbrido, y Jornada Puntual vs. Voluntariado Recurrente.',
        'Pasaporte del Voluntario con sistema de Insignias (Badges) según ODS, horas verificadas y cumplimiento ético.',
        'Gamificación cívica no comercial enfocada en la fidelización y reconocimiento del talento solidario.',
      ],
    },
    {
      name: 'Goodera',
      url: 'https://www.goodera.com/es',
      origin: 'Global (USA / India / LatAm)',
      badge: 'Team Volunteering & SROI',
      accentColor: 'border-blue-500 bg-blue-50/40 text-blue-800',
      icon: Users,
      headline: 'Voluntariado en Equipo Corporativo & Calculadora de Retorno Social (SROI)',
      whatWeAdopted: [
        'Módulo de Reserva de Escuadrones Corporativos (Team Volunteering): Las empresas registran grupos de colaboradores para jornadas de impacto.',
        'Cálculo de SROI (Social Return on Investment): Valoración económica estándar (~$25 USD / $95.000 COP por hora de voluntariado generada).',
        'Ficha logística de jornada: Punto de encuentro, capacidad grupal y coordinación directa ONG-Empresa.',
      ],
    },
    {
      name: 'Benevity',
      url: 'https://benevity.com/',
      origin: 'Global Leader (B-Corp)',
      badge: 'Matching Gifts & ESG Report',
      accentColor: 'border-purple-500 bg-purple-50/40 text-purple-800',
      icon: DollarSign,
      headline: 'Multiplicador "Dollars for Doers" (Matching Gift) y Reporte Ejecutivo ESG',
      whatWeAdopted: [
        'Mecanismo "Dollars for Doers": La empresa compromete una donación complementaria automática por cada hora de voluntariado que sus colaboradores ejecutan en terreno.',
        'Generador de Reporte Ejecutivo de Sostenibilidad / ESG listo para descargar para Comités de Dirección e Informes GRI.',
        'Segregación estricta de divisas (COP vs USD) y transparencia contable sin mezclas cambiarias indebidas.',
      ],
    },
    {
      name: 'Voluntare',
      url: 'https://www.voluntare.org/',
      origin: 'Red Global España / LatAm',
      badge: 'Competencias & Alianzas',
      accentColor: 'border-teal-500 bg-teal-50/40 text-teal-800',
      icon: Briefcase,
      headline: 'Desarrollo de Competencias Blandas (Soft Skills) y Alianzas Formativas',
      whatWeAdopted: [
        'Cada rol voluntario explicita las competencias desarrolladas: Liderazgo de equipos, Empatía social, Gestión de crisis y Resiliencia.',
        'Marco de voluntariado profesional pro-bono que potencia el perfil curricular de colaboradores y ciudadanos.',
        'Garantía de corresponsabilidad mutua entre la ONG receptora y la empresa patrocinadora bajo ISO 26000.',
      ],
    },
    {
      name: 'Hacesfalta.org',
      url: 'https://www.hacesfalta.org/',
      origin: 'Fundación Hazloposible (España)',
      badge: 'Garantías & Transparencia',
      accentColor: 'border-rose-500 bg-rose-50/40 text-rose-800',
      icon: ShieldCheck,
      headline: 'Ficha de Convocatoria Transparente, Coberturas de Seguro y Certificado Formal',
      whatWeAdopted: [
        'Transparencia sobre qué incluye la ONG: Póliza de seguro de accidentes de voluntariado, inducción formativa previa y herramientas.',
        'Flujo de postulación trazable y con consentimiento explícito de Habeas Data (Ley 1581 / GDPR).',
        'Diploma digital formal con horas acreditadas y verificación oficial para la hoja de vida.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              Auditoría de Benchmarks Internacionales & MVP1
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Mejores Prácticas Adoptadas en Volunta
            </h2>
            <p className="text-xs md:text-sm text-slate-600">
              Revisión técnica de las 6 plataformas referentes en voluntariado corporativo, filantropía social e inversión de impacto:
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 6 Benchmark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benchmarks.map((bm, index) => {
            const Icon = bm.icon;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{bm.name}</h3>
                        <span className="text-[10px] text-slate-500">{bm.origin}</span>
                      </div>
                    </div>

                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      <span>Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${bm.accentColor}`}>
                    {bm.headline}
                  </div>

                  <ul className="space-y-1.5 pt-1">
                    {bm.whatWeAdopted.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture summary */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            Integración Tri-Sided en Volunta (ONG • Empresa • Voluntario)
          </h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Volunta fusiona la rigurosidad corporativa de <strong>Benevity</strong> y <strong>Goodera</strong> (SROI, Team Volunteering, Dollars for Doers) con la cercanía comunitaria y usabilidad de <strong>Atados</strong> y <strong>Hacesfalta</strong> (filtros intuitivos, pólizas de seguro, diplomas con validez curricular), respaldado por la auditoría inmutable <strong>ISO 27001</strong> y protección de datos <strong>Habeas Data</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Entendido, explorar la plataforma
          </button>
        </div>
      </div>
    </div>
  );
};
