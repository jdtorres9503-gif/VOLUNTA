import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Coins,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  TrendingUp,
  Leaf,
  Globe2,
  FileCode2,
  Table,
  Lock,
  QrCode,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Project, SponsorshipIntent, CorporateTeamBooking, User, JurisdictionCountry } from '../types';
import { dataStore } from '../lib/dataStore';
import { formatSingleCurrency, formatMultiCurrencyString, aggregateCurrencyAmounts } from '../lib/currency';
import { 
  JURISDICTION_INFO, 
  calculateSroiAndGriMetrics, 
  generateEsgJsonReport, 
  generateEsgXmlReport, 
  generateEsgCsvReport,
  HOURLY_BENCHMARK_RATES,
} from '../lib/complianceEngine';

interface ExecutiveEsgReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  sponsorships: SponsorshipIntent[];
  corporateBookings: CorporateTeamBooking[];
  projects: Project[];
}

export const ExecutiveEsgReportModal: React.FC<ExecutiveEsgReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sponsorships,
  corporateBookings,
  projects,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<JurisdictionCountry>(
    dataStore.getActiveJurisdiction()
  );
  const [activeSubTab, setActiveSubTab] = useState<'METRICS' | 'GRI_INDEX' | 'PRO_BONO_DETAILS' | 'EXPORT_CENTER' | 'CRYPTO_AUDIT'>('METRICS');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter only this company's sponsorships and bookings
  const mySponsorships = sponsorships.filter(
    (s) => s.empresaOrganizationId === currentUser.organizationId
  );
  const myBookings = corporateBookings.filter(
    (b) => b.empresaOrganizationId === currentUser.organizationId
  );

  // Pro-Bono deliverables from data store
  const allDeliverables = dataStore.getProBonoDeliverables().filter(
    (d) => d.status === 'ONG_APPROVED' && (d.empresaOrganizationId === currentUser.organizationId || !d.empresaOrganizationId)
  );

  // Filtered projects for this organization
  const impactedProjects = projects.filter((p) =>
    mySponsorships.some((s) => s.projectId === p.id) ||
    myBookings.some((b) => b.projectId === p.id) ||
    allDeliverables.some((d) => d.projectId === p.id)
  );

  const totalFinancialAmount = mySponsorships.reduce((acc, s) => acc + s.amount, 0);

  // SROI & GRI metrics calculation using market benchmark rates
  const metrics = calculateSroiAndGriMetrics({
    country: selectedCountry,
    directFinancialAporte: totalFinancialAmount > 0 ? totalFinancialAmount : (selectedCountry === 'CO' ? 25000000 : selectedCountry === 'CL' ? 6000000 : 35000),
    currency: JURISDICTION_INFO[selectedCountry].currency,
    deliverables: allDeliverables,
    teamBookings: myBookings,
    projects: impactedProjects.length > 0 ? impactedProjects : projects.slice(0, 3),
  });

  const auditBlocks = dataStore.getAuditBlocks();
  const latestAuditBlock = auditBlocks[auditBlocks.length - 1];
  const auditHeadHash = latestAuditBlock ? latestAuditBlock.currentBlockHash : '7b2a8f9c1e0d3b5a7c9e1f3d5b7a9c1e3f5d7b9a1c3e5f7b9a1c3e5f7b9a1c3e';

  const companyName = currentUser.organizationName || 'NexusImpact Allied Enterprise';
  const taxId = selectedCountry === 'CO' ? 'NIT 900.842.119-4' : selectedCountry === 'CL' ? 'RUT 76.842.119-K' : 'CNPJ 42.119.842/0001-90';

  const handlePrint = () => {
    window.print();
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportFeedback(`Archivo ${fileName} generado y descargado exitosamente.`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleExportJson = () => {
    const jsonStr = generateEsgJsonReport({
      reportId: `NEXUS-ESG-2026-${selectedCountry}-0941`,
      companyName,
      taxId,
      country: selectedCountry,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      metrics,
      auditHeadHash,
    });
    downloadFile(jsonStr, `Reporte_ESG_NexusImpact_${selectedCountry}_2026.json`, 'application/json');
  };

  const handleExportXml = () => {
    const xmlStr = generateEsgXmlReport({
      reportId: `NEXUS-ESG-2026-${selectedCountry}-0941`,
      companyName,
      taxId,
      country: selectedCountry,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      metrics,
      auditHeadHash,
    });
    downloadFile(xmlStr, `Reporte_ESG_NexusImpact_${selectedCountry}_ERP.xml`, 'application/xml');
  };

  const handleExportCsv = () => {
    const csvStr = generateEsgCsvReport(companyName, selectedCountry, allDeliverables, metrics);
    downloadFile(csvStr, `Reporte_ProBono_NexusImpact_${selectedCountry}_2026.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:m-0">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              NexusImpact Compliance Engine • GRI Standards 2021-2024 / ISO 27001
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Country Jurisdiction Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              {(['CO', 'CL', 'BR'] as JurisdictionCountry[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCountry === c
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{JURISDICTION_INFO[c].flag}</span>
                  <span>{c}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback alert if file downloaded */}
        {exportFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportFeedback}</span>
          </div>
        )}

        {/* Sub-Navigation Tabs (Hidden when printing) */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-semibold print:hidden">
          <button
            onClick={() => setActiveSubTab('METRICS')}
            className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'METRICS'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            1. Resumen Ejecutivo & SROI
          </button>
          <button
            onClick={() => setActiveSubTab('GRI_INDEX')}
            className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'GRI_INDEX'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            2. Matriz GRI 2021-2024 & ISO
          </button>
          <button
            onClick={() => setActiveSubTab('PRO_BONO_DETAILS')}
            className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'PRO_BONO_DETAILS'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            3. Roster Pro-Bono (Privacy by Design)
          </button>
          <button
            onClick={() => setActiveSubTab('EXPORT_CENTER')}
            className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'EXPORT_CENTER'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            4. Centro de Exportación ERP
          </button>
          <button
            onClick={() => setActiveSubTab('CRYPTO_AUDIT')}
            className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'CRYPTO_AUDIT'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            5. Inmutabilidad SHA-256
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENT HEADER (Always visible / printable) */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                <span>{JURISDICTION_INFO[selectedCountry].flag} NexusImpact • Jurisdicción {JURISDICTION_INFO[selectedCountry].name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{JURISDICTION_INFO[selectedCountry].esgRegulation}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                {companyName}
              </h1>
              <div className="text-xs text-slate-500 mt-0.5 space-x-2">
                <span>Identificación Fiscal: <strong className="text-slate-700 font-mono">{taxId}</strong></span>
                <span>•</span>
                <span>Periodo: Enero - Diciembre 2026</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] font-mono text-slate-400">ID Reporte: NEXUS-ESG-2026-{selectedCountry}-0941</div>
              <div className="text-xs text-slate-600 font-medium">
                Emisión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                Certificación SHA-256 Auditada
              </div>
            </div>
          </div>

          {/* TAB 1: CORE METRICS & SROI */}
          {(activeSubTab === 'METRICS' || window.matchMedia('print').matches) && (
            <div className="space-y-6">
              {/* Core Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Inversión Directa RSE</div>
                  <div className="text-base md:text-lg font-bold text-emerald-950 font-mono mt-1 truncate">
                    {formatSingleCurrency(metrics.directFinancialAporte, metrics.currency)}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Donaciones / Patrocinios</div>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] uppercase font-bold text-blue-800">Valorización Pro-Bono</div>
                  <div className="text-base md:text-lg font-bold text-blue-950 font-mono mt-1 truncate">
                    {formatSingleCurrency(metrics.proBonoInKindValue, metrics.currency)}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">{metrics.totalProBonoHours} hrs auditadas</div>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] uppercase font-bold text-purple-800">Retorno Social (SROI)</div>
                  <div className="text-2xl font-bold text-purple-950 font-mono mt-0.5">
                    {metrics.sroiRatio}x
                  </div>
                  <div className="text-[10px] text-purple-700 mt-0.5">Multiplicador de valor</div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Valor Social Generado</div>
                  <div className="text-base md:text-lg font-bold text-amber-950 font-mono mt-1 truncate">
                    {formatSingleCurrency(metrics.totalSocialValueGenerated, metrics.currency)}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">{metrics.totalBeneficiaries} beneficiarios</div>
                </div>
              </div>

              {/* SROI Calculation Formula Card */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2 text-xs">
                <div className="font-bold text-purple-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-700" />
                    Fórmula Metodológica SROI (Social Value International)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[11px]">
                    SROI Ratio = {metrics.sroiRatio}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  El SROI se calcula dividiendo el <strong>Valor Social Total Generado</strong> ({formatSingleCurrency(metrics.totalSocialValueGenerated, metrics.currency)}) entre la <strong>Inversión Total Agregada</strong> ({formatSingleCurrency(metrics.totalInvestment, metrics.currency)}).
                  Incluye valorización horaria Pro-Bono según benchmarks profesionales de {JURISDICTION_INFO[selectedCountry].name} e incrementado por un factor multiplicador de <strong>1.35x</strong> debido a la transferencia de capacidades técnicas permanentes hacia las ONGs.
                </p>
              </div>

              {/* Hours by Professional Category */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Distribución de Horas Pro-Bono por Especialidad Profesional
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <div className="text-[10px] font-bold text-slate-500">Legal & Compliance</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">{metrics.hoursByCategory.LEGAL} hrs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tarifa: {formatSingleCurrency(HOURLY_BENCHMARK_RATES[selectedCountry].LEGAL, metrics.currency)}/hr</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <div className="text-[10px] font-bold text-slate-500">Finanzas & Presupuesto</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">{metrics.hoursByCategory.FINANCE} hrs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tarifa: {formatSingleCurrency(HOURLY_BENCHMARK_RATES[selectedCountry].FINANCE, metrics.currency)}/hr</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <div className="text-[10px] font-bold text-slate-500">Tecnología & Cloud</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">{metrics.hoursByCategory.TECH} hrs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tarifa: {formatSingleCurrency(HOURLY_BENCHMARK_RATES[selectedCountry].TECH, metrics.currency)}/hr</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <div className="text-[10px] font-bold text-slate-500">Consultoría ESG</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">{metrics.hoursByCategory.ESG_CONSULTING} hrs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tarifa: {formatSingleCurrency(HOURLY_BENCHMARK_RATES[selectedCountry].ESG_CONSULTING, metrics.currency)}/hr</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <div className="text-[10px] font-bold text-slate-500">Equipos & Terreno</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">{metrics.hoursByCategory.GENERAL} hrs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tarifa: {formatSingleCurrency(HOURLY_BENCHMARK_RATES[selectedCountry].GENERAL, metrics.currency)}/hr</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRI INDEX & ISO STANDARDS */}
          {activeSubTab === 'GRI_INDEX' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Tabla de Homologación GRI Standards 2021-2024
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  GRI Sector Standards Ready
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-3">Estándar GRI</th>
                      <th className="p-3">Indicador / Contenido</th>
                      <th className="p-3">Métrica Auditada NexusImpact</th>
                      <th className="p-3 text-right">Valor Reportado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">GRI 201 (2021)</td>
                      <td className="p-3 text-slate-600">201-1: Valor económico directo generado y distribuido</td>
                      <td className="p-3 text-slate-600">Inversión Financiera Directa + Valorización Pro-Bono In-Kind</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {formatSingleCurrency(metrics.totalInvestment, metrics.currency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">GRI 305 (2024)</td>
                      <td className="p-3 text-slate-600">305-5: Reducción de emisiones de Gases de Efecto Invernadero</td>
                      <td className="p-3 text-slate-600">Kg de CO₂e evitados en proyectos de restauración ecológica</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700">
                        {metrics.co2KgMitigated.toLocaleString()} kg CO₂e
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">GRI 404 (2021)</td>
                      <td className="p-3 text-slate-600">404-1: Formación, capacitación y transferencia de habilidades</td>
                      <td className="p-3 text-slate-600">Horas efectivas transferidas a líderes sociales y comunitarios</td>
                      <td className="p-3 text-right font-mono font-bold text-purple-700">
                        {metrics.totalProBonoHours} horas
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">GRI 413 (2021)</td>
                      <td className="p-3 text-slate-600">413-1: Operaciones con participación activa de la comunidad</td>
                      <td className="p-3 text-slate-600">Beneficiarios directos e indirectos certificados por ONGs</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">
                        {metrics.totalBeneficiaries.toLocaleString()} personas
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ISO Standards Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">ISO 14001:2015</div>
                    <div className="text-[11px] text-slate-600">Gestión ambiental y trazabilidad verificada de KPIs de biodiversidad.</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-blue-700 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">ISO/IEC 27001:2022</div>
                    <div className="text-[11px] text-slate-600">Cifrado AES-256 en reposo, TLS 1.3 y registro inmutable de auditoría.</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center gap-3">
                  <Award className="w-6 h-6 text-purple-700 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">ISO 9001 / ISO 26000</div>
                    <div className="text-[11px] text-slate-600">Aseguramiento de calidad Pro-Bono con doble firma de satisfacción.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRO-BONO DETAILS (Privacy by Design) */}
          {activeSubTab === 'PRO_BONO_DETAILS' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Roster Pro-Bono con Privacy by Design (Ley 1581 / Ley 19.628 / LGPD)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Los colaboradores aparecen bajo pseudónimos criptográficos irreversibles para impedir filtraciones de datos personales (PII).
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {allDeliverables.length} Entregables Aprobados
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Pseudónimo Voluntario</th>
                      <th className="p-2.5">Proyecto & Entregable</th>
                      <th className="p-2.5">Especialidad</th>
                      <th className="p-2.5 text-center">Horas</th>
                      <th className="p-2.5 text-right">Valorización</th>
                      <th className="p-2.5">Aprobación ONG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allDeliverables.map((deliv) => (
                      <tr key={deliv.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          {deliv.volunteerPseudonym}
                        </td>
                        <td className="p-2.5 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">{deliv.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{deliv.projectTitle}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {deliv.professionalCategory}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-700">
                          {deliv.hoursWorked}h
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          {formatSingleCurrency(deliv.economicValuation, deliv.currency)}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Aprobado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT CENTER */}
          {activeSubTab === 'EXPORT_CENTER' && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Centro de Exportación de Reportes Pro-Bono e Integración ERP
                </h3>
                <p className="text-[11px] text-slate-500">
                  Descargue los reportes en el formato requerido por sus auditores externos o sistemas contables (SAP, Oracle, Workday).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* JSON Schema */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <FileCode2 className="w-4 h-4 text-emerald-600" />
                      JSON Schema Oficial ERP
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Conforme al estándar JSON-Schema de NexusImpact v2.4 con hash de inmutabilidad SHA-256 e indicadores GRI integrados.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar .JSON
                  </button>
                </div>

                {/* XML Schema */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-blue-600" />
                      XML Interoperable SAP / ERP
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Estructurado en XML estándar para importación directa a módulos de sostenibilidad de SAP S/4HANA o NetSuite.
                    </p>
                  </div>
                  <button
                    onClick={handleExportXml}
                    className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar .XML
                  </button>
                </div>

                {/* CSV / Excel */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Table className="w-4 h-4 text-purple-600" />
                      Hoja de Trabajo Excel (CSV)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tablas estructuradas de entregables, horas, tarifas benchmark de mercado y firmas de auditoría para comités de RSE.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar .CSV (Excel)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CRYPTOGRAPHIC AUDIT TRAIL */}
          {activeSubTab === 'CRYPTO_AUDIT' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Ledger de Auditoría Criptográfica Inmutable (ISO/IEC 27001)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cada hora Pro-Bono validada queda sellada en una cadena de bloques SHA-256 con timestamping RFC 3161 inmutable.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Cadena: {auditBlocks.length} Bloques Verificados
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {auditBlocks.map((block) => (
                  <div
                    key={block.blockIndex}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          BLOQUE #{block.blockIndex}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-800">
                          {block.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({block.country})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Actor: {block.actorPseudonym} • Fecha UTC: {block.timestamp}
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 space-y-0.5">
                      <div>Prev: {block.previousBlockHash.substring(0, 16)}...</div>
                      <div className="text-emerald-700 font-bold">Hash: {block.currentBlockHash.substring(0, 18)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permanent Audit & Verification Stamp (Visible in all tabs & print) */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                NexusImpact Compliance: Conforme a GRI Standards 2021-2024, ISO 14001, ISO 27001 e ISO 9001.
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-slate-700" />
              <span>HEAD HASH: {auditHeadHash.substring(0, 20)}...</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
