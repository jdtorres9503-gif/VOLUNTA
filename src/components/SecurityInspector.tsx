import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
  FileCode2,
  Database,
  Layers,
  BookOpen,
  X,
} from 'lucide-react';
import { User } from '../types';
import { dataStore } from '../lib/dataStore';
import { PRISMA_SCHEMA_CONTENT, FOUNDER_GUIDE_STEPS } from '../lib/prismaSchema';

interface SecurityInspectorProps {
  currentUser: User;
  onClose: () => void;
}

export const SecurityInspector: React.FC<SecurityInspectorProps> = ({
  currentUser,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'IDOR' | 'ISO' | 'PRISMA' | 'CURRENCY'>('IDOR');
  const [copiedPrisma, setCopiedPrisma] = useState(false);
  const [idorResult, setIdorResult] = useState<{
    tested: boolean;
    blocked: boolean;
    message: string;
  } | null>(null);

  const handleRunIdorTest = () => {
    // Project prj_2 belongs to org_ong_2 (Corporación Semillas del Futuro)
    // If current user is not org_ong_2 or Super Admin, it should trigger an IDOR block!
    const result = dataStore.simulateIdorAttack('prj_2');
    setIdorResult({
      tested: true,
      blocked: result.blocked,
      message: result.message,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrisma(true);
    setTimeout(() => setCopiedPrisma(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Centro de Arquitectura, Ciberseguridad & Compliance
                </h2>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  Zero Trust • OWASP A01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Herramientas de verificación técnica para fundadores y auditores de Volunta.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('IDOR')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'IDOR'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            Prueba de Intrusión IDOR
          </button>

          <button
            onClick={() => setActiveSubTab('ISO')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'ISO'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Normas ISO & Ley 1581
          </button>

          <button
            onClick={() => setActiveSubTab('PRISMA')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'PRISMA'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-purple-600" />
            Esquema Prisma & Neon DB
          </button>

          <button
            onClick={() => setActiveSubTab('CURRENCY')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'CURRENCY'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            Regla Multi-Moneda MVP1
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: IDOR SIMULATION */}
          {activeSubTab === 'IDOR' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  ¿Qué es IDOR y cómo protege Volunta los datos de cada ONG?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Insecure Direct Object Reference (IDOR)</strong> ocurre cuando un usuario malicioso cambia el <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">projectId</code> en la URL o petición para ver o modificar proyectos de otra ONG.
                  En Volunta, <strong>cada consulta SQL / Prisma filtra obligatoriamente por <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">organizationId</code></strong> a nivel de código de aplicación, bloqueando inmediatamente cualquier acceso cruzado no autorizado.
                </p>
              </div>

              {/* Code comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 space-y-2">
                  <div className="text-emerald-800 font-bold flex items-center gap-1.5 font-sans">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Arquitectura Segura Volunta (Correcto):
                  </div>
                  <pre className="text-[11px] text-slate-800 overflow-x-auto">
{`// Filtro obligatorio de ownership:
const project = await prisma.project.findFirst({
  where: {
    id: projectId,
    organizationId: session.user.organizationId,
  },
});`}
                  </pre>
                  <p className="font-sans text-[11px] text-emerald-900">
                    Si el proyecto pertenece a otra ONG, la base de datos devuelve nulo y el sistema emite un 403 Forbidden registrado en la auditoría inmutable.
                  </p>
                </div>

                <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-3.5 space-y-2">
                  <div className="text-rose-800 font-bold flex items-center gap-1.5 font-sans">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Vulnerable a IDOR (Prohibido):
                  </div>
                  <pre className="text-[11px] text-slate-800 overflow-x-auto">
{`// INSEGURO: Buscar solo por ID
const project = await prisma.project.findUnique({
  where: { id: projectId },
});`}
                  </pre>
                  <p className="font-sans text-[11px] text-rose-900">
                    Cualquier usuario autenticado podría modificar proyectos ajenos enviando un ID diferente.
                  </p>
                </div>
              </div>

              {/* Live Interactive Test */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    // Simulador en vivo de Petición HTTP manipulada
                  </div>
                  <div className="text-xs text-slate-400">
                    Usuario activo: <span className="text-white font-semibold">{currentUser.name}</span>{' '}
                    (Tenant: {currentUser.organizationId || 'Sin Tenant'})
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  POST /api/projects/prj_2/update-budget
                  <br />
                  Host: volunta.org
                  <br />
                  Authorization: Bearer google_oauth_token
                  <br />
                  Payload: {`{ "committedAmount": 999999 }`}
                  <br />
                  <span className="text-amber-400">
                    [Objetivo: Proyecto de "Corporación Semillas del Futuro" (org_ong_2)]
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleRunIdorTest}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer font-sans"
                  >
                    <Terminal className="w-4 h-4" />
                    Ejecutar Ataque Simulado
                  </button>

                  <span className="text-xs text-slate-400">
                    Comprueba cómo el backend de Volunta responde y audita el evento.
                  </span>
                </div>

                {idorResult && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs font-mono ${
                      idorResult.blocked
                        ? 'bg-rose-950/80 border border-rose-600 text-rose-200'
                        : 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1 font-sans">
                      {idorResult.blocked ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      Resultado de la prueba:
                    </div>
                    {idorResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ISO STANDARDS & COMPLIANCE */}
          {activeSubTab === 'ISO' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      ISO/IEC 27001 (Seguridad de la Información)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Registro de auditoría inmutable en formato Pino con <code className="font-mono">traceId</code>, timestamp UTC, IP origen y severidad. Prohibición de contraseñas propias en MVP1 mediante delegación exclusiva a Google OAuth.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      ISO 26000 (Responsabilidad Social)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Certificación transparente de horas donadas por voluntarios individuales y corporativos, alineadas a los Objetivos de Desarrollo Sostenible (ODS) de la ONU.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      ISO 14001 (Gestión Ambiental)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Trazabilidad de proyectos ecológicos de reforestación y restauración hidrológica con métricas verificadas antes de su publicación en el marketplace.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Ley 1581 de Colombia & GDPR (Habeas Data)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Consentimiento explícito e informado antes de recopilar datos de contacto de voluntarios o donantes, con finalidad exclusiva para la actividad social convenida.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRISMA SCHEMA FOR NEON DB */}
          {activeSubTab === 'PRISMA' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Instrucciones de Despliegue para el Fundador
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pasos exactos para crear tu base de datos en Neon (PostgreSQL) y correr Prisma.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {FOUNDER_GUIDE_STEPS.map((step) => (
                    <div
                      key={step.step}
                      className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs"
                    >
                      <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-mono">
                          {step.step}
                        </span>
                        {step.title}
                      </div>
                      <p className="text-slate-600 text-[11px]">{step.detail}</p>
                      <div className="bg-slate-900 text-emerald-400 p-1.5 rounded font-mono text-[10px] mt-1 overflow-x-auto">
                        {step.command}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prisma Code Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Archivo de Producción: <code className="font-mono">prisma/schema.prisma</code>
                  </span>
                  <button
                    onClick={() => copyToClipboard(PRISMA_SCHEMA_CONTENT)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    {copiedPrisma ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Esquema
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-950 text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                  {PRISMA_SCHEMA_CONTENT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: STRICT MULTI-CURRENCY RULE */}
          {activeSubTab === 'CURRENCY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Regla Absoluta de Producto: Cero mezclas de divisas
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  En Volunta MVP1 <strong>NO se suman montos de distinta moneda</strong> bajo ninguna circunstancia. Si un proyecto o la plataforma recibe aportes en Pesos Colombianos (COP) y Dólares (USD), los totales siempre se muestran agrupados de forma independiente.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="text-xs font-bold text-slate-900">
                  Demostración del Agregador Matemático:
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                  <div>Patrocinio A: $25.000.000 COP (Grupo Bancolombia RSE)</div>
                  <div>Patrocinio B: $5.000 USD (Cementos Argos Sostenibilidad)</div>
                  <div className="pt-2 border-t border-slate-200 font-bold text-emerald-700 text-sm">
                    Total Formateado: $25.000.000 COP + $5.000 USD
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
