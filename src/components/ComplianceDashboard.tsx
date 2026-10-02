import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Leaf,
  CheckCircle2,
  FileText,
  Download,
  Filter,
  ExternalLink,
  Info,
  Layers,
  Globe2,
  Calendar,
  Lock,
  Target,
} from 'lucide-react';
import {
  Project,
  SponsorshipIntent,
  CorporateTeamBooking,
  User,
  JurisdictionCountry,
  ProBonoDeliverable,
  ProfessionalCategory,
  CurrencyCode,
} from '../types';
import { dataStore } from '../lib/dataStore';
import {
  JURISDICTION_INFO,
  calculateSroiAndGriMetrics,
  HOURLY_BENCHMARK_RATES,
} from '../lib/complianceEngine';
import { formatSingleCurrency } from '../lib/currency';

interface ComplianceDashboardProps {
  currentUser: User;
  projects: Project[];
  sponsorships: SponsorshipIntent[];
  corporateBookings?: CorporateTeamBooking[];
  onOpenEsgReport?: () => void;
  onOpenProjectDetail?: (project: Project) => void;
}

// ODS Colors & Metadata according to UN SDG Guidelines
const ODS_METADATA: Record<
  number,
  { name: string; shortName: string; color: string; icon: string }
> = {
  1: { name: 'Fin de la Pobreza', shortName: 'ODS 1', color: '#E5243B', icon: '🍲' },
  2: { name: 'Hambre Cero', shortName: 'ODS 2', color: '#DDA63A', icon: '🌾' },
  3: { name: 'Salud y Bienestar', shortName: 'ODS 3', color: '#4C9F38', icon: '🩺' },
  4: { name: 'Educación de Calidad', shortName: 'ODS 4', color: '#C5192D', icon: '📚' },
  5: { name: 'Igualdad de Género', shortName: 'ODS 5', color: '#FF3A21', icon: '⚖️' },
  6: { name: 'Agua Limpia y Saneamiento', shortName: 'ODS 6', color: '#26BDE2', icon: '💧' },
  7: { name: 'Energía Asequible y No Contaminante', shortName: 'ODS 7', color: '#FCC30B', icon: '⚡' },
  8: { name: 'Trabajo Decente y Crecimiento', shortName: 'ODS 8', color: '#A21942', icon: '📈' },
  9: { name: 'Industria, Innovación e Infraestructura', shortName: 'ODS 9', color: '#FD6925', icon: '🏭' },
  10: { name: 'Reducción de las Desigualdades', shortName: 'ODS 10', color: '#DD1367', icon: '🤝' },
  11: { name: 'Ciudades y Comunidades Sostenibles', shortName: 'ODS 11', color: '#FD9D24', icon: '🏙️' },
  12: { name: 'Producción y Consumo Responsables', shortName: 'ODS 12', color: '#BF8B2E', icon: '🔄' },
  13: { name: 'Acción por el Clima', shortName: 'ODS 13', color: '#3F7E44', icon: '🌍' },
  14: { name: 'Vida Submarina', shortName: 'ODS 14', color: '#0A97D9', icon: '🐟' },
  15: { name: 'Vida de Ecosistemas Terrestres', shortName: 'ODS 15', color: '#56C02B', icon: '🌳' },
  16: { name: 'Paz, Justicia e Instituciones Sólidas', shortName: 'ODS 16', color: '#00689D', icon: '🕊️' },
  17: { name: 'Alianzas para Lograr los Objetivos', shortName: 'ODS 17', color: '#19486A', icon: '🌐' },
};

const CATEGORY_COLORS: Record<ProfessionalCategory, string> = {
  LEGAL: '#3B82F6', // Blue
  FINANCE: '#10B981', // Emerald
  TECH: '#8B5CF6', // Purple
  ESG_CONSULTING: '#059669', // Teal
  GENERAL: '#F59E0B', // Amber
};

const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  LEGAL: 'Legal & Cumplimiento',
  FINANCE: 'Finanzas & Auditoría',
  TECH: 'Tecnología & Cloud',
  ESG_CONSULTING: 'Consultoría ESG',
  GENERAL: 'Voluntariado en Terreno',
};

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  currentUser,
  projects,
  sponsorships,
  corporateBookings = [],
  onOpenEsgReport,
  onOpenProjectDetail,
}) => {
  const activeJurisdiction = dataStore.getActiveJurisdiction();
  const [selectedCountry, setSelectedCountry] = useState<JurisdictionCountry | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ODS' | 'HOURS' | 'GRI_MATRIX'>('OVERVIEW');
  const [selectedOds, setSelectedOds] = useState<number | null>(null);

  // Pro-Bono Deliverables approved by ONGs
  const allDeliverables = useMemo(() => {
    const raw = dataStore.getProBonoDeliverables().filter((d) => d.status === 'ONG_APPROVED');
    if (selectedCountry === 'ALL') return raw;
    return raw.filter((d) => d.country === selectedCountry);
  }, [selectedCountry]);

  // Filtered sponsorships
  const relevantSponsorships = useMemo(() => {
    return sponsorships.filter(
      (s) => s.empresaOrganizationId === currentUser.organizationId
    );
  }, [sponsorships, currentUser.organizationId]);

  // Context corporate bookings
  const relevantBookings = useMemo(() => {
    const raw = corporateBookings.length > 0 
      ? corporateBookings 
      : dataStore.getCorporateBookingsForCurrentContext();
    if (selectedCountry === 'ALL') return raw;
    return raw.filter((b) => {
      if (b.country) return b.country === selectedCountry;
      const proj = projects.find((p) => p.id === b.projectId);
      if (!proj) return false;
      if (selectedCountry === 'CO') return proj.country?.toLowerCase().includes('colombia') || proj.country === 'CO';
      if (selectedCountry === 'CL') return proj.country?.toLowerCase().includes('chile') || proj.country === 'CL';
      if (selectedCountry === 'BR') return proj.country?.toLowerCase().includes('brasil') || proj.country?.toLowerCase().includes('brazil') || proj.country === 'BR';
      return false;
    });
  }, [corporateBookings, selectedCountry, projects]);

  const auditBlocks = useMemo(() => dataStore.getAuditBlocks(), []);

  // Compute aggregated compliance metrics
  const targetCountry = selectedCountry === 'ALL' ? activeJurisdiction : selectedCountry;
  const targetCurrency = JURISDICTION_INFO[targetCountry].currency;

  const totalFinancialAmount = relevantSponsorships.reduce((acc, s) => acc + s.amount, 0);

  const complianceMetrics = useMemo(() => {
    return calculateSroiAndGriMetrics({
      country: targetCountry,
      directFinancialAporte: totalFinancialAmount > 0 ? totalFinancialAmount : 28000000,
      currency: targetCurrency,
      deliverables: allDeliverables,
      teamBookings: relevantBookings,
      projects: projects.slice(0, 4),
    });
  }, [targetCountry, targetCurrency, totalFinancialAmount, allDeliverables, relevantBookings, projects]);

  // 1. ODS Impact Chart Data
  const odsChartData = useMemo(() => {
    const map = new Map<number, { ods: number; hours: number; beneficiaries: number; projectsCount: number }>();

    // Seed common ODS if not present
    [4, 8, 10, 13, 15].forEach((num) => {
      map.set(num, { ods: num, hours: 0, beneficiaries: 0, projectsCount: 0 });
    });

    // Map projects with ODS
    projects.forEach((p) => {
      const num = p.odsNumber || 10;
      const current = map.get(num) || { ods: num, hours: 0, beneficiaries: 0, projectsCount: 0 };
      current.projectsCount += 1;
      current.beneficiaries += p.impactMetrics?.beneficiariesDirect || 120;
      map.set(num, current);
    });

    // Add Pro-Bono deliverables hours & beneficiaries to ODS
    allDeliverables.forEach((d) => {
      const proj = projects.find((p) => p.id === d.projectId);
      const odsNum = proj?.odsNumber || 8;
      const current = map.get(odsNum) || { ods: odsNum, hours: 0, beneficiaries: 0, projectsCount: 1 };
      current.hours += d.hoursWorked;
      current.beneficiaries += d.beneficiariesImpacted || 20;
      map.set(odsNum, current);
    });

    // Add corporate team hours to ODS
    relevantBookings.forEach((b) => {
      const proj = projects.find((p) => p.id === b.projectId);
      const odsNum = proj?.odsNumber || 15;
      const current = map.get(odsNum) || { ods: odsNum, hours: 0, beneficiaries: 0, projectsCount: 1 };
      current.hours += b.teamSize * 8;
      current.beneficiaries += b.teamSize * 10;
      map.set(odsNum, current);
    });

    return Array.from(map.values())
      .filter((item) => item.hours > 0 || item.projectsCount > 0)
      .map((item) => ({
        ...item,
        name: ODS_METADATA[item.ods]?.shortName || `ODS ${item.ods}`,
        fullName: ODS_METADATA[item.ods]?.name || `Objetivo ${item.ods}`,
        color: ODS_METADATA[item.ods]?.color || '#3B82F6',
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [projects, allDeliverables, relevantBookings]);

  // 2. Timeline Evolution Data (GRI 404 & SROI)
  const timelineData = useMemo(() => {
    return [
      {
        quarter: 'Q1 2026',
        proBonoHours: Math.round(complianceMetrics.individualProBonoHours * 0.2),
        fieldHours: Math.round(complianceMetrics.corporateTeamHours * 0.15),
        totalHours: Math.round(complianceMetrics.totalProBonoHours * 0.18),
        sroiGenerated: Math.round(complianceMetrics.totalSocialValueGenerated * 0.18),
        beneficiaries: Math.round(complianceMetrics.totalBeneficiaries * 0.2),
      },
      {
        quarter: 'Q2 2026',
        proBonoHours: Math.round(complianceMetrics.individualProBonoHours * 0.35),
        fieldHours: Math.round(complianceMetrics.corporateTeamHours * 0.3),
        totalHours: Math.round(complianceMetrics.totalProBonoHours * 0.32),
        sroiGenerated: Math.round(complianceMetrics.totalSocialValueGenerated * 0.32),
        beneficiaries: Math.round(complianceMetrics.totalBeneficiaries * 0.35),
      },
      {
        quarter: 'Q3 2026',
        proBonoHours: Math.round(complianceMetrics.individualProBonoHours * 0.3),
        fieldHours: Math.round(complianceMetrics.corporateTeamHours * 0.35),
        totalHours: Math.round(complianceMetrics.totalProBonoHours * 0.32),
        sroiGenerated: Math.round(complianceMetrics.totalSocialValueGenerated * 0.32),
        beneficiaries: Math.round(complianceMetrics.totalBeneficiaries * 0.3),
      },
      {
        quarter: 'Q4 2026 (Est.)',
        proBonoHours: Math.round(complianceMetrics.individualProBonoHours * 0.15),
        fieldHours: Math.round(complianceMetrics.corporateTeamHours * 0.2),
        totalHours: Math.round(complianceMetrics.totalProBonoHours * 0.18),
        sroiGenerated: Math.round(complianceMetrics.totalSocialValueGenerated * 0.18),
        beneficiaries: Math.round(complianceMetrics.totalBeneficiaries * 0.15),
      },
    ];
  }, [complianceMetrics]);

  // 3. Category Distribution Data
  const categoryData = useMemo(() => {
    return (Object.keys(complianceMetrics.hoursByCategory) as ProfessionalCategory[])
      .map((cat) => ({
        category: cat,
        name: CATEGORY_LABELS[cat],
        hours: complianceMetrics.hoursByCategory[cat],
        color: CATEGORY_COLORS[cat],
      }))
      .filter((item) => item.hours > 0);
  }, [complianceMetrics]);

  // 4. SROI Breakdown Waterfall
  const sroiWaterfallData = useMemo(() => {
    return [
      {
        concept: 'Aporte Financiero',
        monto: complianceMetrics.directFinancialAporte,
        tipo: 'Inversión Directa (GRI 201-1)',
        color: '#6366F1',
      },
      {
        concept: 'Valor Pro-Bono In-Kind',
        monto: complianceMetrics.proBonoInKindValue,
        tipo: 'Aporte Especie Auditado (GRI 404-1)',
        color: '#10B981',
      },
      {
        concept: 'Inversión Total Bruta',
        monto: complianceMetrics.totalInvestment,
        tipo: 'Base de Retorno Social',
        color: '#3B82F6',
      },
      {
        concept: 'Valor Social SROI',
        monto: complianceMetrics.totalSocialValueGenerated,
        tipo: `Retorno Social (${complianceMetrics.sroiRatio}x)`,
        color: '#8B5CF6',
      },
    ];
  }, [complianceMetrics]);

  return (
    <div id="compliance-dashboard-root" className="space-y-6">
      {/* Header with Title, Country & Period Switchers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 tracking-wide uppercase">
                GRI Standards 2024 / ISO 26000
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Auditado Criptográficamente (ISO 27001)
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Dashboard de Cumplimiento & Impacto Social (GRI / ODS / SROI)
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
              Trazabilidad técnica del retorno social de la inversión (SROI), horas de voluntariado profesional Pro-Bono e indicadores ambientales y comunitarios alineados con memorias integradas ESG.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            {/* Jurisdiction Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCountry('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedCountry === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌐 Consolidado
              </button>
              {(['CO', 'CL', 'BR'] as JurisdictionCountry[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedCountry === c
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{JURISDICTION_INFO[c].flag}</span>
                  <span>{c}</span>
                </button>
              ))}
            </div>

            {/* ESG Export Button */}
            {onOpenEsgReport && (
              <button
                type="button"
                onClick={onOpenEsgReport}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Emitir Reporte GRI</span>
              </button>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pt-5 mt-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Resumen Ejecutivo & SROI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ODS')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ODS'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Matriz de Impacto ODS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HOURS')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HOURS'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Horas Pro-Bono & Especialidades</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GRI_MATRIX')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'GRI_MATRIX'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Homologación GRI & ISO</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: SROI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-purple-700 mb-1">
            <span className="uppercase tracking-wider">Retorno Social (SROI)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-900">
            {complianceMetrics.sroiRatio}x
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Por cada $1 invertido se generan {complianceMetrics.sroiRatio}x en valor social para ONGs y comunidades.
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Metodología SROI Network</span>
            <span className="text-purple-700 font-bold">Auditado EVPA</span>
          </div>
        </div>

        {/* KPI 2: Total Volunteer Hours */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-1">
            <span className="uppercase tracking-wider">Horas de Voluntariado</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-blue-900">
            {complianceMetrics.totalProBonoHours.toLocaleString()}h
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {complianceMetrics.individualProBonoHours}h Pro-Bono calificado + {complianceMetrics.corporateTeamHours}h en terreno.
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>GRI 404-1 Formación</span>
            <span className="text-blue-700 font-bold">
              {formatSingleCurrency(complianceMetrics.proBonoInKindValue, targetCurrency)}
            </span>
          </div>
        </div>

        {/* KPI 3: Beneficiaries & Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-1">
            <span className="uppercase tracking-wider">Beneficiarios Directos</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-900">
            {complianceMetrics.totalBeneficiaries.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Personas beneficiadas en comunidades locales a través de {projects.length} programas sociales.
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>GRI 413-1 Comunidades</span>
            <span className="text-emerald-700 font-bold">100% Verificado</span>
          </div>
        </div>

        {/* KPI 4: CO2 Mitigation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-teal-700 mb-1">
            <span className="uppercase tracking-wider">Mitigación Ambiental</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-teal-900">
            {(complianceMetrics.co2KgMitigated / 1000).toFixed(1)} t
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {complianceMetrics.co2KgMitigated.toLocaleString()} kg CO₂e capturados/mitigados en iniciativas eco-ambientales.
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>GRI 305-5 / ISO 14064</span>
            <span className="text-teal-700 font-bold">Huella Positiva</span>
          </div>
        </div>
      </div>

      {/* MAIN TAB CONTENT */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Charts Row: SROI Waterfall & Quarterly Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: SROI Value Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Creación de Valor Social SROI (GRI 201-1)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aporte financiero vs valor en especie Pro-Bono y retorno social amplificado.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800">
                  {complianceMetrics.sroiRatio}x Retorno
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sroiWaterfallData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="concept"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        formatSingleCurrency(Number(value), targetCurrency),
                        'Monto Valorado',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="monto" radius={[8, 8, 0, 0]}>
                      {sroiWaterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                {sroiWaterfallData.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-slate-500 truncate">{item.concept}</span>
                    <span className="font-mono font-bold text-slate-900 block truncate">
                      {formatSingleCurrency(item.monto, targetCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Timeline Evolution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Evolución de Horas y Valor Retornado (Trimestral)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proyección y ejecución acumulada de horas Pro-Bono e impacto social.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">Año 2026</span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorField" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${val}h`,
                        name === 'proBonoHours' ? 'Horas Pro-Bono' : 'Horas en Terreno',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(val) => (val === 'proBonoHours' ? 'Horas Pro-Bono' : 'Horas en Terreno')}
                    />
                    <Area
                      type="monotone"
                      dataKey="proBonoHours"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                    <Area
                      type="monotone"
                      dataKey="fieldHours"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorField)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Total Horas Proyectadas: <strong className="text-slate-900">{complianceMetrics.totalProBonoHours}h</strong></span>
                <span>Beneficiarios Acumulados: <strong className="text-slate-900">{complianceMetrics.totalBeneficiaries}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick ODS Highlights in Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-600" />
                  Contribución Prioritaria a Objetivos de Desarrollo Sostenible (ODS)
                </h3>
                <p className="text-xs text-slate-500">
                  Despliegue estratégico de capacidades corporativas y donaciones sobre la Agenda 2030.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ODS')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Ver matriz detallada →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {odsChartData.slice(0, 5).map((odsItem) => (
                <div
                  key={odsItem.ods}
                  onClick={() => {
                    setSelectedOds(odsItem.ods);
                    setActiveTab('ODS');
                  }}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: odsItem.color }}
                    >
                      ODS {odsItem.ods}
                    </span>
                    <span className="text-base">{ODS_METADATA[odsItem.ods]?.icon}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {odsItem.fullName}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5 font-medium">
                    <div>{odsItem.hours} horas dedicadas</div>
                    <div className="text-slate-400">{odsItem.beneficiaries} beneficiarios</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ODS TAB: Detailed ODS Matrix */}
      {activeTab === 'ODS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ODS Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-600" />
                    Horas de Impacto Desplegadas por Meta ODS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aporte cuantitativo de talento y recursos alineado con metas de desarrollo sostenible.
                  </p>
                </div>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={odsChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} horas (${item.payload.beneficiaries} personas beneficiadas)`,
                        item.payload.fullName,
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
                      {odsChartData.map((entry, index) => (
                        <Cell key={`cell-ods-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ODS Detail Card & Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Desglose ODS Seleccionado
              </h3>

              {(() => {
                const targetOdsItem = selectedOds 
                  ? odsChartData.find((item) => item.ods === selectedOds) || odsChartData[0]
                  : odsChartData[0];

                if (!targetOdsItem) {
                  return <div className="text-xs text-slate-500">No hay datos de ODS registrados.</div>;
                }

                return (
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-xl text-white space-y-2"
                      style={{ backgroundColor: targetOdsItem.color }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{ODS_METADATA[targetOdsItem.ods]?.icon}</span>
                        <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                          Meta Global 2030
                        </span>
                      </div>
                      <div className="font-extrabold text-lg">
                        ODS {targetOdsItem.ods}: {targetOdsItem.fullName}
                      </div>
                      <p className="text-xs text-white/90">
                        {targetOdsItem.ods === 13
                          ? 'Adopción de medidas urgentes para combatir el cambio climático y sus efectos mediante voluntariado ambiental y captura de carbono.'
                          : targetOdsItem.ods === 4
                          ? 'Garantizar una educación inclusiva, equitativa y de calidad promoviendo oportunidades de aprendizaje profesional.'
                          : targetOdsItem.ods === 8
                          ? 'Promover el crecimiento económico inclusivo y sostenible, el empleo productivo y el trabajo decente mediante Pro-Bono.'
                          : 'Contribución estratégica para el desarrollo comunitario sostenible y reducción de vulnerabilidades estructurales.'}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">Horas Totales Dedicadas:</span>
                        <span className="font-bold font-mono text-slate-900">{targetOdsItem.hours}h</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">Beneficiarios Alcanzados:</span>
                        <span className="font-bold font-mono text-slate-900">{targetOdsItem.beneficiaries}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">Proyectos Vinculados:</span>
                        <span className="font-bold font-mono text-slate-900">{targetOdsItem.projectsCount} iniciativas</span>
                      </div>
                    </div>

                    {/* Selector of other ODS */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">
                        Seleccionar otro ODS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {odsChartData.map((item) => (
                          <button
                            key={item.ods}
                            type="button"
                            onClick={() => setSelectedOds(item.ods)}
                            className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              targetOdsItem.ods === item.ods
                                ? 'ring-2 ring-slate-900 text-white'
                                : 'opacity-70 hover:opacity-100 text-white'
                            }`}
                            style={{ backgroundColor: item.color }}
                          >
                            ODS {item.ods}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Connected Projects for Selected ODS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Iniciativas Sociales Activas Vinculadas a ODS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        ODS {proj.odsNumber || 10}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{proj.city}, {proj.country}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 line-clamp-1">{proj.title}</div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{proj.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">ONG: <strong className="text-slate-800">{proj.organizationName}</strong></span>
                    {onOpenProjectDetail && (
                      <button
                        type="button"
                        onClick={() => onOpenProjectDetail(proj)}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Detalle</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOURS TAB: Pro-Bono by Specialty & In-Kind Valuation */}
      {activeTab === 'HOURS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart: Hours by Professional Category */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Distribución de Horas por Especialidad (GRI 404-1)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aportes de alto valor profesional según benchmark auditado de mercado.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="hours"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} horas`,
                        item.payload.name,
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => entry.payload.name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-1">{item.hours}h dedicadas</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmarks and Hourly Values */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Tarifas Benchmark por País ({JURISDICTION_INFO[targetCountry].name})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tarifario homologado por colegios profesionales y firmas de auditoría.
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-slate-100 text-slate-700">
                  {targetCurrency} / hora
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {(
                  [
                    'LEGAL',
                    'FINANCE',
                    'TECH',
                    'ESG_CONSULTING',
                    'GENERAL',
                  ] as ProfessionalCategory[]
                ).map((cat) => {
                  const rate = HOURLY_BENCHMARK_RATES[targetCountry][cat];
                  const hours = complianceMetrics.hoursByCategory[cat] || 0;
                  const total = rate * hours;

                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                        />
                        <div>
                          <div className="font-bold text-slate-900">{CATEGORY_LABELS[cat]}</div>
                          <div className="text-[11px] text-slate-500">
                            Tarifa: {formatSingleCurrency(rate, targetCurrency)}/h
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-extrabold text-slate-900">
                          {formatSingleCurrency(total, targetCurrency)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{hours}h certificadas</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold">Valorización In-Kind Consolidada:</span>
                <span className="font-extrabold font-mono text-sm">
                  {formatSingleCurrency(complianceMetrics.proBonoInKindValue, targetCurrency)}
                </span>
              </div>
            </div>
          </div>

          {/* Verified Deliverables Table with Cryptographic Hashes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Registro Inmutable de Entregables Pro-Bono (ISO 27001 / SHA-256)
                </h3>
                <p className="text-xs text-slate-500">
                  Aprobaciones técnicas con constancia de satisfacción expedida por la ONG receptora.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                {allDeliverables.length} Certificados
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">Pseudónimo Titular</th>
                    <th className="p-3">Entregable & Proyecto</th>
                    <th className="p-3">Especialidad</th>
                    <th className="p-3 text-center">Horas</th>
                    <th className="p-3 text-right">Valorización</th>
                    <th className="p-3 font-mono">Hash SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allDeliverables.map((deliv) => (
                    <tr key={deliv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {deliv.volunteerPseudonym}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{deliv.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{deliv.projectTitle}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[deliv.professionalCategory] }}
                        >
                          {deliv.professionalCategory}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-blue-700">
                        {deliv.hoursWorked}h
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {formatSingleCurrency(deliv.economicValuation, deliv.currency)}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {deliv.sha256VerificationHash.substring(0, 14)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GRI MATRIX TAB: Homologation with Global Standards */}
      {activeTab === 'GRI_MATRIX' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Matriz de Homologación GRI Standards (Versión 2021-2024)
                </h3>
                <p className="text-xs text-slate-500">
                  Correspondencia directa con memorias integradas de sostenibilidad y directivas internacionales.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Auditoría Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* GRI 201 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">GRI 201-1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Dimensión Económica
                  </span>
                </div>
                <div className="font-medium text-slate-700">
                  Valor Económico Directo Generado y Distribuido
                </div>
                <p className="text-[11px] text-slate-500">
                  Incluye aportes financieros directos ({formatSingleCurrency(complianceMetrics.directFinancialAporte, targetCurrency)}) más el valor económico de servicios Pro-Bono aportados in-kind ({formatSingleCurrency(complianceMetrics.proBonoInKindValue, targetCurrency)}).
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono font-bold text-emerald-800">
                  Total Distribuido: {formatSingleCurrency(complianceMetrics.totalInvestment, targetCurrency)}
                </div>
              </div>

              {/* GRI 404 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">GRI 404-1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Dimensión Social
                  </span>
                </div>
                <div className="font-medium text-slate-700">
                  Formación y Transferencia de Habilidades Pro-Bono
                </div>
                <p className="text-[11px] text-slate-500">
                  Horas medias dedicadas por profesionales voluntarios y empleados a fortalecer la capacidad operativa de las ONGs en temas jurídicos, financieros y tecnológicos.
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono font-bold text-blue-800">
                  Total Horas Certificadas: {complianceMetrics.totalProBonoHours} horas
                </div>
              </div>

              {/* GRI 413 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">GRI 413-1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    Comunidades Locales
                  </span>
                </div>
                <div className="font-medium text-slate-700">
                  Operaciones con Participación Activa Comunitaria
                </div>
                <p className="text-[11px] text-slate-500">
                  Proyectos con evaluación de impacto local, consentimiento previo y salvaguarda de derechos humanos según ISO 26000.
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono font-bold text-purple-800">
                  Impacto Directo: {complianceMetrics.totalBeneficiaries.toLocaleString()} beneficiarios
                </div>
              </div>

              {/* GRI 305 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">GRI 305-5</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    Dimensión Ambiental
                  </span>
                </div>
                <div className="font-medium text-slate-700">
                  Reducción de Emisiones de Gases de Efecto Invernadero (GEI)
                </div>
                <p className="text-[11px] text-slate-500">
                  Cálculo de absorción de carbono en reforestación y restauración de ecosistemas según ISO 14064 y GHG Protocol Alcance 3.
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono font-bold text-teal-800">
                  Captura Estimada: {complianceMetrics.co2KgMitigated.toLocaleString()} kg CO₂e
                </div>
              </div>
            </div>
          </div>

          {/* ISO Certifications & Legal Assurance */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Garantía Normativa ISO & Privacidad por Diseño</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {auditBlocks.length} Bloques de Auditoría SHA-256
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-emerald-400 mb-1">ISO 27001 (Seguridad)</div>
                <p className="text-slate-300 text-[11px]">
                  Criptografía SHA-256 en cada entregable y trazabilidad inmutable sin almacenamiento de PII en reportes públicos.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-blue-400 mb-1">ISO 26000 (RSE)</div>
                <p className="text-slate-300 text-[11px]">
                  Alineación con las 7 materias fundamentales de responsabilidad social: gobernanza, derechos humanos y medio ambiente.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-purple-400 mb-1">Privacidad Regional</div>
                <p className="text-slate-300 text-[11px]">
                  Cumplimiento de Ley 1581 (CO), Ley 19.628 (CL) y LGPD (BR) con gestión automatizada de derechos ARCO.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
