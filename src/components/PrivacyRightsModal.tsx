import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Send,
  HelpCircle,
} from 'lucide-react';
import { User, ArcoRightType, JurisdictionCountry } from '../types';
import { dataStore } from '../lib/dataStore';
import { JURISDICTION_INFO } from '../lib/complianceEngine';

interface PrivacyRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const PrivacyRightsModal: React.FC<PrivacyRightsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'CONSENTS' | 'NEW_REQUEST' | 'REQUEST_HISTORY'>('CONSENTS');
  const [jurisdiction, setJurisdiction] = useState<JurisdictionCountry>(
    dataStore.getActiveJurisdiction()
  );

  // Granular consent state
  const [habeasData, setHabeasData] = useState(true);
  const [proBonoAgreement, setProBonoAgreement] = useState(true);
  const [anonymizedReporting, setAnonymizedReporting] = useState(true);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [imageRights, setImageRights] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New ARCO request form state
  const [selectedRight, setSelectedRight] = useState<ArcoRightType>('ACCESS_KNOW');
  const [details, setDetails] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  if (!isOpen) return null;

  const arcoRequests = dataStore.getArcoRequests().filter(
    (r) => r.userId === currentUser.id || currentUser.role === 'SUPER_ADMIN'
  );

  const handleSaveConsents = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    dataStore.fileArcoRequest({
      rightType: selectedRight,
      details,
    });

    setDetails('');
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setActiveTab('REQUEST_HISTORY');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Portal de Privacidad & Derechos ARCO / LGPD
              </h2>
              <p className="text-xs text-slate-500">
                Cumplimiento normativo para Colombia, Chile y Brasil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Jurisdiction Selector Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{JURISDICTION_INFO[jurisdiction].flag}</span>
            <div>
              <span className="font-bold text-slate-800">Jurisdicción Activa: {JURISDICTION_INFO[jurisdiction].name}</span>
              <div className="text-[11px] text-slate-500">{JURISDICTION_INFO[jurisdiction].dataPrivacyLaw}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 font-semibold">
            {(['CO', 'CL', 'BR'] as JurisdictionCountry[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setJurisdiction(c);
                  dataStore.setActiveJurisdiction(c);
                }}
                className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                  jurisdiction === c
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CONSENTS')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CONSENTS'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Consentimientos Granulares
          </button>
          <button
            onClick={() => setActiveTab('NEW_REQUEST')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'NEW_REQUEST'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            Ejercer Derecho ARCO
          </button>
          <button
            onClick={() => setActiveTab('REQUEST_HISTORY')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'REQUEST_HISTORY'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial ({arcoRequests.length})
          </button>
        </div>

        {/* TAB 1: GRANULAR CONSENT SETTINGS */}
        {activeTab === 'CONSENTS' && (
          <form onSubmit={handleSaveConsents} className="space-y-4 text-xs">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={habeasData}
                  onChange={(e) => setHabeasData(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Tratamiento de Datos Personales (Base Legal Principal)</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    Autorizo a NexusImpact y a la ONG anfitriona a procesar mis datos para coordinar la postulación, validar horas y emitir certificaciones oficiales ({JURISDICTION_INFO[jurisdiction].dataPrivacyLaw}).
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={proBonoAgreement}
                  onChange={(e) => setProBonoAgreement(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Convenio de Voluntariado / Termo de Adesão</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    Acepto prestar servicios Pro-Bono de forma libre, solidaria y sin subordinación laboral, bajo el amparo de la {JURISDICTION_INFO[jurisdiction].volunteerLaw}.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymizedReporting}
                  onChange={(e) => setAnonymizedReporting(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Pseudonimización en Reportes ESG Corporativos (Privacy by Design)</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    Mis aportes se consolidan en reportes empresariales utilizando únicamente identificadores alfanuméricos auditables (ej. <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">VOL-CO-***</code>), sin exponer mis datos de contacto directos.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={gpsTracking}
                  onChange={(e) => setGpsTracking(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Geolocalización Voluntaria en Terreno (Opt-in)</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    Permite verificar automáticamente mi asistencia en campo en proyectos ambientales y de reforestación. Las coordenadas exactas se eliminan tras 30 días de la jornada.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageRights}
                  onChange={(e) => setImageRights(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Cesión No Exclusiva de Registro Fotográfico Social</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    Autorizo a la ONG a publicar fotografías de la jornada con fines exclusivamente educativos y de visibilidad comunitaria.
                  </div>
                </div>
              </label>
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preferencias de privacidad y consentimiento actualizadas exitosamente.</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Guardar Preferencias de Privacidad
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: FILE ARCO REQUEST */}
        {activeTab === 'NEW_REQUEST' && (
          <form onSubmit={handleFileRequest} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Tipo de Derecho a Ejercer</label>
              <select
                value={selectedRight}
                onChange={(e) => setSelectedRight(e.target.value as ArcoRightType)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:outline-emerald-500"
              >
                <option value="ACCESS_KNOW">Acceso / Conocer (Conocer datos recopilados e historial de tratamiento)</option>
                <option value="RECTIFICATION">Rectificación / Actualizar (Corregir datos inexactos o incompletos)</option>
                <option value="CANCELLATION_DELETE">Cancelación / Supresión / Eliminação (Eliminar mis datos de la plataforma)</option>
                <option value="OPPOSITION_PORTABILITY">Oposición / Portabilidad (Exportar historial a formato interoperable JSON)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-900 text-[11px] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Plazo legal de respuesta:</strong> Conforme a la legislación de {JURISDICTION_INFO[jurisdiction].name} ({JURISDICTION_INFO[jurisdiction].dataPrivacyLaw}), el Oficial de Cumplimiento responderá formalmente en un plazo máximo de <strong>{JURISDICTION_INFO[jurisdiction].arcoDeadlineDays} días hábiles</strong>.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">Detalle de la Solicitud</label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describa con precisión los datos o registros objeto de su solicitud..."
                className="w-full p-3 rounded-lg border border-slate-200 text-slate-800 focus:outline-emerald-500 text-xs"
              />
            </div>

            {requestSubmitted && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Solicitud radicada con número de seguimiento y sellado de tiempo RFC 3161.</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Radicar Solicitud Formal
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: REQUEST HISTORY */}
        {activeTab === 'REQUEST_HISTORY' && (
          <div className="space-y-3 text-xs">
            {arcoRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-slate-200 rounded-xl">
                No hay solicitudes de derechos ARCO radicadas por el titular.
              </div>
            ) : (
              arcoRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900">{req.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                        {req.rightType}
                      </span>
                      <span className="text-slate-400 text-[10px]">({req.country})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'COMPLETED' ? 'Resuelta a Satisfacción' : 'En Proceso de Revisión Legal'}
                    </span>
                  </div>

                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {req.details}
                  </p>

                  {req.resolutionNotes && (
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
                      <span className="font-bold text-emerald-800">Dictamen DPO:</span> {req.resolutionNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>Radicado: {new Date(req.requestedAt).toLocaleDateString()}</span>
                    <span>Vencimiento Legal: {new Date(req.legalDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
