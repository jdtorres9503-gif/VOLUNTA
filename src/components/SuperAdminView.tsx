import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  HeartHandshake,
  FileText,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  Coins,
} from 'lucide-react';
import { Organization, Project, AuditLogEntry, VerificationStatus, ProjectStatus } from '../types';
import { dataStore } from '../lib/dataStore';
import { aggregateCurrencyAmounts, formatMultiCurrencyString, formatSingleCurrency } from '../lib/currency';
import { TokenAuditDashboard } from './TokenAuditDashboard';

interface SuperAdminViewProps {
  organizations: Organization[];
  projects: Project[];
  auditLogs: AuditLogEntry[];
  onOpenProjectDetail: (project: Project) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  organizations,
  projects,
  auditLogs,
  onOpenProjectDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'ORGS' | 'PROJECTS' | 'AUDIT' | 'DIRECTORY' | 'TOKENS_AUDIT'>('ORGS');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Calculations
  const pendingOrgs = organizations.filter((o) => o.verificationStatus === 'PENDING_VERIFICATION');
  const activeOrgs = organizations.filter((o) => o.verificationStatus === 'ACTIVE');
  const pendingProjects = projects.filter((p) => p.status === 'IN_REVIEW');
  const publishedProjects = projects.filter((p) => p.status === 'PUBLISHED');

  // Multi-currency calculation: strict adherence to NO adding different currencies
  const allFundingGoals = projects.flatMap((p) => p.fundingGoals);
  const totalCommittedByCurrency = aggregateCurrencyAmounts(
    allFundingGoals.map((g) => ({ amount: g.committedAmount, currency: g.currency }))
  );
  const totalCommittedString = formatMultiCurrencyString(totalCommittedByCurrency);

  const handleVerifyOrg = (orgId: string, status: VerificationStatus) => {
    try {
      dataStore.verifyOrganization(orgId, status);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al verificar organización');
    }
  };

  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus) => {
    try {
      dataStore.updateProjectStatus(projectId, status);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al cambiar estado del proyecto');
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter !== 'ALL' && log.severity !== auditFilter) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.traceId.toLowerCase().includes(q) ||
      log.resourceId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Orientation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel de Gobernanza & Compliance
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Super Admin Volunta
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Control central del ecosistema. Supervisa la debida diligencia de ONGs y Empresas, aprueba proyectos para publicación en el marketplace y audita las acciones con trazabilidad inmutable bajo ISO 27001.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Orgs Activas</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{activeOrgs.length}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                {pendingOrgs.length} por verificar
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Proyectos</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{publishedProjects.length}</div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                {pendingProjects.length} en revisión
              </div>
            </div>

            <div className="col-span-2 bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
                <span>Total Fondos Comprometidos</span>
              </div>
              <div className="text-sm font-bold text-emerald-950 mt-1 truncate" title={totalCommittedString}>
                {totalCommittedString}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                Multi-moneda estricta (COP y USD separados)
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ORGS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ORGS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Verificación de Organizaciones
            {pendingOrgs.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                {pendingOrgs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'PROJECTS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Revisión de Proyectos
            {pendingProjects.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                {pendingProjects.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'AUDIT'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Auditoría Inmutable (ISO 27001)
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-slate-200 text-slate-700 rounded">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'DIRECTORY'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Directorio Completo
          </button>

          <button
            onClick={() => setActiveTab('TOKENS_AUDIT')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'TOKENS_AUDIT'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-indigo-600" />
            Auditoría de Tokens & Neutralidad Fiscal
          </button>
        </div>
      </div>

      {/* TAB CONTENT: TOKENS & FISCAL AUDIT */}
      {activeTab === 'TOKENS_AUDIT' && (
        <TokenAuditDashboard />
      )}

      {/* TAB CONTENT: ORGANIZATIONS VERIFICATION */}
      {activeTab === 'ORGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Solicitudes de Incorporación (Due Diligence)
              </h2>
              <p className="text-xs text-slate-500">
                Aprobación de ONGs y Empresas antes de que puedan interactuar en la red.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {pendingOrgs.length} solicitudes pendientes
            </span>
          </div>

          {pendingOrgs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                ¡Todas las organizaciones están verificadas!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No hay solicitudes pendientes en la bandeja de entrada. Puedes revisar el historial en la pestaña de Directorio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrgs.map((org) => (
                <div
                  key={org.id}
                  className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Pendiente Validación NIT
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 font-bold">
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          NIT: {org.nit}
                        </span>
                        <span>•</span>
                        <span>{org.city}, {org.country}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {org.description}
                  </p>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Tipo de Actor:</span>
                      <span className="font-semibold text-slate-900">
                        {org.type === 'ONG' ? 'Organización Social / ONG' : 'Empresa / Corporativo RSE'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Contacto:</span>
                      <span className="font-mono text-slate-700">{org.contactEmail}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Cumplimiento / Sellos:</span>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {org.complianceTags.join(', ') || 'En auditoría inicial'}
                      </span>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'ACTIVE')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar y Activar
                    </button>
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'SUSPENDED')}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROJECTS REVIEW */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Proyectos Sociales en Revisión Técnica
              </h2>
              <p className="text-xs text-slate-500">
                Valida que cada proyecto cumpla con los estándares de Volunta antes de ser visible para Empresas y Voluntarios.
              </p>
            </div>
          </div>

          {pendingProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                No hay proyectos pendientes de revisión
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Todos los proyectos postulados han sido procesados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                        ODS #{project.odsNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pendiente Aprobación
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {project.organizationName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {project.summary}
                    </p>

                    {/* Goals summary */}
                    <div className="flex flex-wrap gap-4 pt-1 text-xs">
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Meta Financiera: </span>
                        {project.fundingGoals.map((g) => (
                          <span key={g.currency} className="font-mono font-medium text-emerald-700">
                            {formatSingleCurrency(g.targetAmount, g.currency)} ({g.currency})
                          </span>
                        ))}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Voluntarios Requeridos: </span>
                        <span>
                          {project.volunteerRoles.reduce((acc, r) => acc + r.spotsTotal, 0)} vacantes
                        </span>
                      </div>
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Ubicación: </span>
                        <span>{project.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-44">
                    <button
                      onClick={() => onOpenProjectDetail(project)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspeccionar
                    </button>
                    <button
                      onClick={() => handleUpdateProjectStatus(project.id, 'PUBLISHED')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aprobar & Publicar
                    </button>
                    <button
                      onClick={() => handleUpdateProjectStatus(project.id, 'REJECTED')}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: IMMUTABLE AUDIT LOG (ISO 27001) */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Registro Inmutable de Auditoría & Trazabilidad</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    ISO/IEC 27001
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Cada acción crítica queda registrada con traceId único, IP simulada, severidad y payload JSON inmutable.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por acción o traceId..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-500 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                >
                  <option value="ALL">Todas las severidades</option>
                  <option value="INFO">INFO</option>
                  <option value="AUDIT">AUDIT</option>
                  <option value="ERROR">ERROR / ALERTA</option>
                </select>
              </div>
            </div>

            {/* Logs Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Trace ID</th>
                      <th className="py-2.5 px-3">Timestamp (UTC)</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Acción</th>
                      <th className="py-2.5 px-3">Recurso</th>
                      <th className="py-2.5 px-3">Severidad</th>
                      <th className="py-2.5 px-3 text-right">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredLogs.map((log) => {
                      const isError = log.severity === 'ERROR';
                      const isAudit = log.severity === 'AUDIT';

                      return (
                        <tr
                          key={log.traceId + log.timestamp}
                          className={`hover:bg-slate-50 transition-colors ${
                            isError ? 'bg-rose-50/50' : isAudit ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-semibold text-slate-800">{log.traceId}</td>
                          <td className="py-2 px-3 text-slate-500 font-sans text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-sans">
                            <span className="font-medium text-slate-800">{log.userName}</span>
                            <span className="text-[10px] text-slate-500 block">({log.userRole})</span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{log.action}</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{log.resourceId}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isError
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isAudit
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-sans">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                            >
                              Ver JSON
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Directorio Ecosistema Volunta
              </h2>
              <p className="text-xs text-slate-500">
                Todas las entidades registradas bajo multi-tenancy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-all bg-white"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      org.type === 'ONG'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {org.type}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      org.verificationStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : org.verificationStatus === 'PENDING_VERIFICATION'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {org.verificationStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{org.name}</h3>
                <div className="text-xs text-slate-500 font-mono">NIT: {org.nit}</div>
                <div className="text-xs text-slate-600 line-clamp-2">{org.description}</div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                  <span>{org.city}</span>
                  <span className="font-mono">{org.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured JSON Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-mono text-slate-500">Trace ID: {selectedLog.traceId}</div>
                <h3 className="text-base font-bold text-slate-900">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1">
                Payload Pino JSON Estructurado:
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>

            <div className="text-xs text-slate-500">
              Registrado conforme a directrices de auditoría ISO 27001 y Ley 1581 de Habeas Data.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
