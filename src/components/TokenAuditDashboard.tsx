import React, { useState } from 'react';
import {
  Coins,
  ShieldCheck,
  Award,
  FileCheck2,
  AlertTriangle,
  Search,
  CheckCircle2,
  ExternalLink,
  Download,
  Building2,
  FileText,
  Lock,
  Flame,
  Layers,
} from 'lucide-react';
import { dataStore } from '../lib/dataStore';
import { TokenTransactionType, ImpactTokenTransaction } from '../types';

export const TokenAuditDashboard: React.FC = () => {
  const [txFilter, setTxFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<ImpactTokenTransaction | null>(null);

  const summary = dataStore.getTokenAuditSummary();
  const transactions = dataStore.getTokenTransactions();
  const soulboundBadges = dataStore.getSoulboundBadges();
  const adhesionTerms = dataStore.getAdhesionTerms();

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter !== 'ALL' && tx.type !== txFilter) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.userName.toLowerCase().includes(q) ||
      tx.reason.toLowerCase().includes(q) ||
      tx.sha256ProofHash.toLowerCase().includes(q) ||
      (tx.projectTitle && tx.projectTitle.toLowerCase().includes(q))
    );
  });

  const exportAuditReport = () => {
    const reportData = {
      title: 'Dictamen de Auditoría Técnica, Impositiva y de Tokens de Impacto - Plataforma Volunta',
      generatedAt: new Date().toISOString(),
      standardsCompliance: {
        colombia: 'Ley 720 de 2001 (Art. 6) & Dcto 4290/2005 - Estricta No Laboralidad',
        chile: 'Ley 20.500 de Asociaciones y Participación Ciudadana',
        brasil: 'Lei 9.608/1998 e Decreto 9.906/2019 de Serviço Voluntário',
        iso27001: 'Cabeceras criptográficas y SHA-256 en ledger inmutable',
        iso26000: 'Responsabilidad Social Corporativa y gobernanza ESG',
        taxStatus: 'Art. 125-2 Estatuto Tributario - Deducción por donación RSE del 25%',
      },
      metrics: summary,
      transactionsAudited: transactions.length,
      soulboundBadgesAudited: soulboundBadges.length,
      adhesionTermsAudited: adhesionTerms.length,
      laborRiskScore: 'BAJO_CERO',
      conclusion:
        'Se certifica que ningún voluntario recibe compensación en dinero fiduciario. Todos los incentivos operan como tokens honoríficos de impacto (VIT) o credenciales Soulbound intransferibles, garantizando neutralidad fiscal y cero contingencia laboral.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dictamen-Auditoria-Tokens-Volunta-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Coins className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auditoría de Tokens & Neutralidad Impositiva</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Módulo de Supervisión Fiscal y Libro Mayor VIT
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Monitoreo en tiempo real de emisión de Volunta Impact Tokens (VIT), credenciales Soulbound (ERC-5192) y blindaje jurídico contra riesgos de desnaturalización laboral (Ley 720 CO / Ley 20.500 CL / Lei 9.608 BR).
          </p>
        </div>

        <button
          onClick={exportAuditReport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Dictamen Fiscal JSON</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-indigo-600" />
            Tokens en Circulación
          </div>
          <div className="text-2xl font-black text-indigo-950 font-mono">
            {summary.totalCirculatingVIT} VIT
          </div>
          <div className="text-[10px] text-slate-500">
            Total Emitido: {summary.totalMintedVIT} | Canjeado: {summary.totalBurnedRedeemedVIT}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            Insignias Soulbound
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono">
            {summary.totalSoulboundBadgesIssued}
          </div>
          <div className="text-[10px] text-slate-500">
            Estándar ERC-5192 intransferible
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            Términos de Adhesión
          </div>
          <div className="text-2xl font-black text-blue-950 font-mono">
            {summary.signedAdhesionTermsCount}
          </div>
          <div className="text-[10px] text-slate-500">
            Formalizados con firma electrónica
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Riesgo Laboral / Fiscal
          </div>
          <div className="text-xl font-black text-emerald-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            BAJO CERO
          </div>
          <div className="text-[10px] text-emerald-700">
            100% Exento de Remuneración Laboral
          </div>
        </div>
      </div>

      {/* Compliance Legal Standards Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Matriz de Cumplimiento Impositivo y Normativo Internacional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🇨🇴 Colombia</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                Ley 720 / Art. 125-2 ET
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              El Art. 6 de la Ley 720 prohíbe pactar remuneración laboral. Los VIT son recompensas de mérito en especie. Las empresas que patrocinan perks aplican 25% de descuento tributario en el impuesto sobre la renta por donaciones a entidades del RTE.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🇨🇱 Chile</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                Ley 20.500 / Ley 19.885
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              El voluntariado se estructura como actividad autónoma sin vínculo de subordinación. Las donaciones corporativas a proyectos sociales califican para crédito tributario conforme a la Ley de Donaciones Sociales (Ley 19.885).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🇧🇷 Brasil</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                Lei 9.608/98 / Dec. 9.906
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Exige formalización mediante «Termo de Adesão», deslindando expresamente cualquier obligación de carácter laboral o previsional. Los selos e insignias actúan como mérito para concursos públicos y deducción en IRPJ (Lei 9.249).
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Libro Mayor Criptográfico de Tokens de Impacto ({transactions.length} Registros)
            </h3>
            <p className="text-xs text-slate-500">
              Trazabilidad inmutable de cada acuñación (mint) y canje (redeem) con sello SHA-256.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por voluntario, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-indigo-500 w-48"
              />
            </div>

            <select
              value={txFilter}
              onChange={(e) => setTxFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="MINT_HOURS">MINT: Horas en Terreno</option>
              <option value="MINT_PROBONO">MINT: Pro-Bono Profesional</option>
              <option value="REDEEM_PERK">REDEEM: Recompensa Canjeada</option>
              <option value="DONATION_MATCH">DONATION: Matching Gift</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Fecha & ID</th>
                <th className="px-4 py-3">Voluntario / Actor</th>
                <th className="px-4 py-3">Tipo Operación</th>
                <th className="px-4 py-3">Monto VIT</th>
                <th className="px-4 py-3">Motivo / Proyecto</th>
                <th className="px-4 py-3">Sello Hash SHA-256</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tx.id.substring(0, 14)}...
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{tx.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tx.walletId}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tx.type === 'MINT_HOURS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tx.type === 'MINT_PROBONO'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`font-mono font-bold text-xs ${
                        tx.amount > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} VIT
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <div className="truncate font-medium text-slate-800" title={tx.reason}>
                      {tx.reason}
                    </div>
                    {tx.projectTitle && (
                      <div className="text-[10px] text-slate-500 truncate">
                        {tx.projectTitle}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded-md max-w-[140px] truncate block"
                      title={tx.sha256ProofHash}
                    >
                      {tx.sha256ProofHash.substring(0, 16)}...
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="text-indigo-600 hover:text-indigo-900 font-bold text-[11px] p-1 rounded-md hover:bg-indigo-50"
                    >
                      Verificar
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No se encontraron transacciones con el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Certificación Criptográfica de Transacción
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ID Transacción:</span>
                <span className="font-mono font-bold text-slate-800">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Voluntario:</span>
                <span className="font-bold text-slate-800">{selectedTx.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto:</span>
                <span className="font-mono font-bold text-indigo-700">{selectedTx.amount} VIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Sello:</span>
                <span className="text-slate-800">{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">
                Atestación Jurídica de No Remuneración
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs leading-relaxed">
                {selectedTx.legalNonRemunerationNotice}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">
                Hash SHA-256 Inmutable
              </div>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl break-all">
                {selectedTx.sha256ProofHash}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Cerrar Verificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
