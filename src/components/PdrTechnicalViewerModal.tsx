import React, { useState } from 'react';
import {
  X,
  FileCode2,
  Server,
  Layout,
  ShieldCheck,
  Coins,
  Cpu,
  Terminal,
  Download,
  Copy,
  CheckCircle2,
  Layers,
  Lock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { dataStore } from '../lib/dataStore';

interface PdrTechnicalViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdrTechnicalViewerModal: React.FC<PdrTechnicalViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FRONTEND' | 'BACKEND' | 'CRYPTO_TOKEN' | 'LEGAL_TAX' | 'DEMO_CONSOLE'>('OVERVIEW');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestApi = async (endpoint: string) => {
    setLoadingApi(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse({ endpoint, status: res.status, data });
    } catch (err: any) {
      setApiResponse({ endpoint, status: 'ERROR', error: err.message });
    } finally {
      setLoadingApi(false);
    }
  };

  const handleDownloadPDR = () => {
    const fullPdrMarkdown = `# VOLUNTA - PRODUCT DESIGN REVIEW (PDR) DE ALTO SENIORITY
Versión: 2.4.0-PROD | Fecha: 2026-09-27 | Clasificación: Arquitectura Técnica & Auditoría
Autores: Lead Software Architect & Principal Systems Engineer

## 1. RESUMEN EJECUTIVO Y FILOSOFÍA DEL SISTEMA
Volunta es una plataforma descentralizada de articulación de impacto social (ESG), voluntariado calificado/pro-bono y patrocinio corporativo con incentivos no salariales timbrados criptográficamente.
Resuelve la triple problemática de:
1. Contingencias laborales por voluntariado informal (Ley 720/2001 Colombia, Ley 20.500 Chile, Lei 9.608 Brasil).
2. Seguridad jurídica y beneficios fiscales bajo Art. 125-2 del Estatuto Tributario (25% descuento en impuesto sobre la renta).
3. Transparencia auditable sin costo de gas mediante libro mayor criptográfico SHA-256 Merkle-tree y tokens de impacto Soulbound ERC-5192.

## 2. ARQUITECTURA FRONTEND (REACT 19 + VITE + TAILWIND CSS)
- Paradigma reactivo unificado con Store Observable Pattern (\`dataStore.ts\`).
- UI Adaptable multi-rol: SUPER_ADMIN, ONG_ADMIN, EMPRESA_RSE, VOLUNTEER.
- Internacionalización con fallback instantáneo (es, en, pt) y Dark Mode con detección de sistema.
- PWA de nivel 3 con Service Worker, caché estática/dinámica (\`stale-while-revalidate\`) y soporte offline.
- Cero tolerancia al "AI slop": componentes semánticos, microinteracciones y densidad de información profesional.

## 3. ARQUITECTURA BACKEND (EXPRESS 5 + NODE.JS + VITE SSR INTEGRATION)
- Servidor RESTful modular con middleware de seguridad ISO 27001 / OWASP Top 10.
- Rutas desacopladas: /api/auth, /api/projects, /api/sponsorships, /api/deliverables, /api/compliance, /api/tokens.
- Motor de persistencia ACID en archivo JSON concurrente con bloqueo idempotente y esquema Prisma DDL sincronizado.
- Verificación criptográfica con cadena inmutable de bloques SHA-256 vinculando cada hora verificada y canje de perk.

## 4. MOTOR DE TOKENOMICS (VIT) Y RECOMPENSAS
- Tasa de acuñación: 10 VIT/hora certificada en terreno, 15 VIT/hora en entregables técnicos Pro-Bono.
- Quema (burn) al canjear recompensas del catálogo de beneficios en especie (cursos, mentorías, membresías ecológicas).
- Badges Soulbound ERC-5192 intransferibles atestando mérito cívico inmutable.
- Blindaje legal: Cláusula de adhesión no remunerativa incorporada en metadatos y firmas digitales.
`;

    const blob = new Blob([fullPdrMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PDR_Volunta_Frontend_Backend_Seniority_${new Date().toISOString().slice(0,10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const auditBlocks = dataStore.getAuditBlocks();
  const summary = dataStore.getTokenAuditSummary();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">
                  PDR Técnico: Frontend & Backend Architecture
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Senior Staff Review
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documento de especificación, diseño de producto y demostración técnica verificada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDR}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Descargar PDR completo en Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar PDR (.md)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto gap-2 py-2">
          {[
            { id: 'OVERVIEW', label: '1. Arquitectura General', icon: Layers },
            { id: 'FRONTEND', label: '2. Frontend PDR & SPA', icon: Layout },
            { id: 'BACKEND', label: '3. Backend REST & DB', icon: Server },
            { id: 'CRYPTO_TOKEN', label: '4. Tokenomics (VIT) & Ledger', icon: Coins },
            { id: 'LEGAL_TAX', label: '5. Blindaje Legal & Tributario', icon: ShieldCheck },
            { id: 'DEMO_CONSOLE', label: '6. Consola de Demostración', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Objetivo del Product Design Review (PDR)
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1 leading-relaxed">
                  Este PDR detalla la arquitectura de software end-to-end de <strong>Volunta</strong>.
                  La plataforma unifica en un solo sistema transaccional: marketplace de proyectos ODS,
                  certificación de horas de voluntariado, patrocinio empresarial con deducción fiscal (Art. 125-2 E.T.),
                  economía de incentivos en especie basada en tokens VIT y badges intransferibles Soulbound ERC-5192.
                </p>
              </div>

              {/* High-level Architecture ASCII Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Diagrama de Topología del Sistema
                  </h4>
                  <button
                    onClick={() => handleCopy(`+-----------------------------------------------------------------------------------+
| CLIENT BROWSER / PWA LAYER (React 19 + TypeScript + Tailwind CSS)                 |
| - Micro-frontend role views: SuperAdmin | ONG | Empresa RSE | Voluntario          |
| - Local State Store (Observable Pattern) + Service Worker Cache + Offline Sync   |
+-----------------------------------------------------------------------------------+
                                      |
                           HTTPS / REST API / WSS
                                      v
+-----------------------------------------------------------------------------------+
| FULL-STACK BACKEND LAYER (Express 5.x + Node.js 22 LTS Runtime)                   |
| - Security Middleware (ISO 27001 Headers, CORS, Rate Limit, Perms-Policy)         |
| - Routing Modules: /api/auth | /api/projects | /api/sponsorships | /api/tokens     |
| - Compliance Engine: Zero-Budget Valuation + Colombian Art. 125-2 Tax Calculator  |
+-----------------------------------------------------------------------------------+
                                      |
                     Cryptographic Ingestion & Hashing
                                      v
+-----------------------------------------------------------------------------------+
| PERSISTENCE & CRYPTOGRAPHIC LEDGER                                                |
| - ACID JSON Datastore (storage.json) with Write-Ahead Mutex                      |
| - SHA-256 Merkle Chain (CryptographicAuditBlock) with PrevBlockHash linkages     |
| - ERC-5192 Soulbound Attestations & Non-Wage Safe Harbor Metadata                  |
+-----------------------------------------------------------------------------------+`, 'topomap')}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'topomap' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'topomap' ? 'Copiado' : 'Copiar Diagrama'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
{`+-----------------------------------------------------------------------------------+
| CLIENT BROWSER / PWA LAYER (React 19 + TypeScript + Tailwind CSS)                 |
| - Micro-frontend role views: SuperAdmin | ONG | Empresa RSE | Voluntario          |
| - Local State Store (Observable Pattern) + Service Worker Cache + Offline Sync   |
+-----------------------------------------------------------------------------------+
                                      |
                           HTTPS / REST API / WSS
                                      v
+-----------------------------------------------------------------------------------+
| FULL-STACK BACKEND LAYER (Express 5.x + Node.js 22 LTS Runtime)                   |
| - Security Middleware (ISO 27001 Headers, CORS, Rate Limit, Perms-Policy)         |
| - Routing Modules: /api/auth | /api/projects | /api/sponsorships | /api/tokens     |
| - Compliance Engine: Zero-Budget Valuation + Colombian Art. 125-2 Tax Calculator  |
+-----------------------------------------------------------------------------------+
                                      |
                     Cryptographic Ingestion & Hashing
                                      v
+-----------------------------------------------------------------------------------+
| PERSISTENCE & CRYPTOGRAPHIC LEDGER                                                |
| - ACID JSON Datastore (storage.json) with Write-Ahead Mutex                      |
| - SHA-256 Merkle Chain (CryptographicAuditBlock) with PrevBlockHash linkages     |
| - ERC-5192 Soulbound Attestations & Non-Wage Safe Harbor Metadata                  |
+-----------------------------------------------------------------------------------+`}
                </pre>
              </div>

              {/* System KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Bloques Inmutables</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {auditBlocks.length}
                  </div>
                  <div className="text-[10px] text-slate-400">Encadenados por SHA-256</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total VIT Circulante</div>
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                    {summary.totalCirculatingVIT} VIT
                  </div>
                  <div className="text-[10px] text-slate-400">En billeteras de voluntarios</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Badges Soulbound</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    {summary.totalSoulboundBadgesIssued} SBT
                  </div>
                  <div className="text-[10px] text-slate-400">ERC-5192 Intransferibles</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Deducción Fiscal (E.T.)</div>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                    25% Renta
                  </div>
                  <div className="text-[10px] text-slate-400">Art. 125-2 Estatuto Tributario</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRONTEND */}
          {activeTab === 'FRONTEND' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-emerald-600" />
                  Arquitectura Frontend (Single-Page Application)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Estructuración modular bajo principios de Clean Architecture, reactividad por suscripción y tolerancia a fallos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Árbol Jerárquico de Componentes
                  </h4>
                  <ul className="text-xs space-y-1.5 font-mono text-slate-600 dark:text-slate-300">
                    <li>App.tsx (Root Controller & View Switcher)</li>
                    <li>├── Navbar.tsx (User Context, i18n, Theme, PWA)</li>
                    <li>├── LandingPage.tsx (Public Marketplace & ODS Filters)</li>
                    <li>├── SuperAdminView.tsx (Platform Governance & Crypto Audit)</li>
                    <li>├── OngView.tsx (Project Management & Impact Minting)</li>
                    <li>├── EmpresaView.tsx (Tax Compliance, ESG & Pro-Bono)</li>
                    <li>├── VoluntarioView.tsx (Wallet VIT, Perks & Adhesion)</li>
                    <li>└── Modals (PerkRedeem, LegalAdhesion, TokenAudit, etc.)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Patrón de Gestión de Estado (Observable)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Se implementó un patrón <code>Observable State Store</code> en <code>dataStore.ts</code> con emisión de eventos sincrónicos hacia los suscriptores React mediante <code>useEffect</code>. Los cambios persisten en <code>localStorage</code> para modo offline y se replican bidireccionalmente contra los endpoints REST de Express.
                  </p>
                  <div className="text-[11px] font-mono bg-slate-900 text-slate-200 p-2.5 rounded-lg overflow-x-auto">
                    {`subscribe(listener: () => void): () => void
notifyListeners(): void
mintImpactTokens(params): { tx, block, badge }`}
                  </div>
                </div>
              </div>

              {/* PWA & Service Worker */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Estrategia PWA & Resiliencia Offline
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  El Service Worker en <code>public/sw.js</code> emplea la estrategia <strong>Stale-While-Revalidate</strong> para bundles estáticos (JS, CSS, SVGs) y <strong>Network-First with Cache Fallback</strong> para peticiones de API. La bandera de red es monitoreada por el componente <code>OfflineIndicator.tsx</code> con sincronización diferida al reanudar conexión.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BACKEND */}
          {activeTab === 'BACKEND' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  Arquitectura Backend (Express 5 + Persistence Engine)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  API REST de alto rendimiento con validación de esquemas tipados, cabeceras ISO 27001 y persistencia transaccional.
                </p>
              </div>

              {/* Endpoints Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Método</th>
                      <th className="p-2.5">Ruta</th>
                      <th className="p-2.5">Propósito</th>
                      <th className="p-2.5">Controlador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                      <td className="p-2.5">/api/health</td>
                      <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">Verificación de liveness y conteo de entidades</td>
                      <td className="p-2.5 text-slate-500">server.ts</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-blue-600 font-bold">POST</td>
                      <td className="p-2.5">/api/tokens/mint</td>
                      <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">Acuñación criptográfica de tokens VIT + bloque</td>
                      <td className="p-2.5 text-slate-500">tokens.ts</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-blue-600 font-bold">POST</td>
                      <td className="p-2.5">/api/tokens/redeem</td>
                      <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">Quema de VIT por perks en especie</td>
                      <td className="p-2.5 text-slate-500">tokens.ts</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-blue-600 font-bold">POST</td>
                      <td className="p-2.5">/api/tokens/sign-adhesion</td>
                      <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">Firma digital de adhesión voluntaria no salarial</td>
                      <td className="p-2.5 text-slate-500">tokens.ts</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                      <td className="p-2.5">/api/compliance/audit-blocks</td>
                      <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">Consulta de libro mayor de bloques SHA-256</td>
                      <td className="p-2.5 text-slate-500">compliance.ts</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                      <td className="p-2.5">/api/compliance/tax-certificate/:id</td>
                      <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">Generación de certificado fiscal Art. 125-2 E.T.</td>
                      <td className="p-2.5 text-slate-500">compliance.ts</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Data Layer Specifications */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Capa de Persistencia y Concurrencia
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Implementada en <code>server/db.ts</code> con almacenamiento atómico en <code>data/storage.json</code>. Cuenta con serialización síncrona para evitar condiciones de carrera (Race Conditions) y preserva el estado entre reintentos. Su esquema coincide con el modelo relacional documentado en <code>src/lib/prismaSchema.ts</code> (PostgreSQL / Supabase Ready).
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CRYPTO & TOKENOMICS */}
          {activeTab === 'CRYPTO_TOKEN' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Economía de Incentivos (VIT) y Libro Mayor Inmutable
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mecanismo de gobernanza tokenizada, incentivos en especie y atestaciones no transferibles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Acuñación (Minting)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    - <strong>10 VIT/hr</strong>: Voluntariado presencial/campo certificado por ONG.
                    <br />
                    - <strong>15 VIT/hr</strong>: Pro-Bono profesional calificado (Legal, Tech, Finanzas).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Quema (Burning)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Los tokens se destruyen al reclamar incentivos en especie (cursos, mentorías, membresías), evitando presiones inflacionarias secundarias.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Soulbound ERC-5192</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Insignias de mérito intransferibles (locked: true) ligadas a la identidad cívica del voluntario para su reputación profesional.
                  </p>
                </div>
              </div>

              {/* Cryptographic verification formula */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Función Criptográfica de Enlace de Bloques (SHA-256)
                </h4>
                <pre className="p-4 rounded-xl bg-slate-900 text-amber-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
{`const payloadToHash = JSON.stringify({
  blockIndex: newBlockIndex,
  prevBlockHash: previousBlock.blockHash,
  timestamp: new Date().toISOString(),
  recordType: 'TOKEN_EMISSION' | 'PERK_REDEMPTION' | 'ADHESION_SIGNATURE',
  entityId: userId,
  amount: vitAmount,
  merkleRoot: sha256(payloadData),
});
const blockHash = '0x' + crypto.createHash('sha256').update(payloadToHash).digest('hex');`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: LEGAL & TAX */}
          {activeTab === 'LEGAL_TAX' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Blindaje Jurídico y Régimen Tributario
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cumplimiento regulatorio estricto para mitigar contingencias laborales e impositivas en Latinoamérica.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    A. Safe Harbor Laboral (No Relación de Dependencia)
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                    Fundamentado en <strong>Ley 720 de 2001 (Colombia)</strong>, <strong>Ley 20.500 (Chile)</strong> y <strong>Lei 9.608 (Brasil)</strong>. Cada voluntario suscribe un acuerdo digital previo con aceptación explícita de gratuidad, sin contraprestación remuneratoria, salarial ni prestacional. Los tokens VIT son calificados jurídicamente como <em>reconocimientos honoríficos y de formación</em>, no susceptibles de convertibilidad en moneda fiduciaria ni reclamo pecuniario.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    B. Descuento Tributario del 25% (Art. 125-2 Estatuto Tributario Colombia)
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-300/90 leading-relaxed">
                    Las donaciones en dinero y valoraciones de servicios pro-bono a favor de entidades sin ánimo de lucro (ESAL) pertenecientes al Régimen Tributario Especial (RTE) otorgan un descuento tributario del <strong>25% del valor donado</strong> directamente aplicable al impuesto sobre la renta y complementarios. La plataforma genera el Certificado de Donación formal con hash criptográfico SHA-256 exigible por la DIAN.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300">
                    C. Portal de Derechos ARCO y Habeas Data (Ley 1581 de 2012 / GDPR)
                  </h4>
                  <p className="text-xs text-purple-800 dark:text-purple-300/90 leading-relaxed">
                    Módulo integrado que permite el ejercicio de derechos de <strong>Acceso, Rectificación, Cancelación y Oposición</strong> con plazos reglamentarios (10 días hábiles en Colombia), cifrado de logs y constancia de anonimización auditable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DEMO CONSOLE */}
          {activeTab === 'DEMO_CONSOLE' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-500" />
                  Consola de Demostración & Verificación en Vivo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interactúa directamente con el backend Express y consulta el estado del libro mayor en tiempo real.
                </p>
              </div>

              {/* Action Buttons to hit endpoints */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTestApi('/api/health')}
                  disabled={loadingApi}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-emerald-400 hover:bg-slate-800 text-xs font-mono font-bold border border-slate-700 cursor-pointer"
                >
                  GET /api/health
                </button>

                <button
                  onClick={() => handleTestApi('/api/tokens/perks')}
                  disabled={loadingApi}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-blue-400 hover:bg-slate-800 text-xs font-mono font-bold border border-slate-700 cursor-pointer"
                >
                  GET /api/tokens/perks
                </button>

                <button
                  onClick={() => handleTestApi('/api/compliance/audit-blocks')}
                  disabled={loadingApi}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-purple-400 hover:bg-slate-800 text-xs font-mono font-bold border border-slate-700 cursor-pointer"
                >
                  GET /api/compliance/audit-blocks
                </button>
              </div>

              {/* Response Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Respuesta HTTP del Backend:</span>
                  {apiResponse && (
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Status: {apiResponse.status}
                    </span>
                  )}
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto border border-slate-800">
                  {loadingApi ? (
                    <span className="text-amber-400">Consultando backend en tiempo real...</span>
                  ) : apiResponse ? (
                    JSON.stringify(apiResponse, null, 2)
                  ) : (
                    `Haz clic en cualquiera de los botones superiores para ejecutar una petición HTTP real contra el backend Express y verificar la respuesta JSON en vivo.`
                  )}
                </pre>
              </div>

              {/* Latest Block Inspection */}
              {auditBlocks.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Último Bloque Criptográfico Validado en el Ledger:
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
                    <div><strong>Index:</strong> #{auditBlocks[auditBlocks.length - 1].blockIndex}</div>
                    <div className="truncate"><strong>Hash:</strong> {auditBlocks[auditBlocks.length - 1].currentBlockHash}</div>
                    <div className="truncate"><strong>Prev Hash:</strong> {auditBlocks[auditBlocks.length - 1].previousBlockHash}</div>
                    <div><strong>Timestamp:</strong> {auditBlocks[auditBlocks.length - 1].timestamp}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Stack: React 19 + TypeScript + Express 5 + Merkle SHA-256 Ledger</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDR}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDR</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
