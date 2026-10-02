import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, X, Lock } from 'lucide-react';
import { User, JurisdictionCountry } from '../types';
import { dataStore } from '../lib/dataStore';

interface LegalAdhesionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSignedSuccess?: () => void;
}

export const LegalAdhesionModal: React.FC<LegalAdhesionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignedSuccess,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<JurisdictionCountry>(
    dataStore.getActiveJurisdiction() || 'CO'
  );
  const [acceptedClauses, setAcceptedClauses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  if (!isOpen) return null;

  const wallet = dataStore.getTokenWallet(currentUser.id);
  const terms = dataStore.getAdhesionTerms(currentUser.id);
  const existingTerm = terms.length > 0 ? terms[0] : null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedClauses) {
      alert('Debes confirmar la lectura y aceptación de las cláusulas legales.');
      return;
    }

    setIsSubmitting(true);
    try {
      dataStore.signAdhesionTerm({
        userId: currentUser.id,
        country: selectedCountry,
      });
      setSignSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSignedSuccess) onSignedSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : 'Error al registrar la firma del término');
    }
  };

  const getLegalReferenceText = () => {
    switch (selectedCountry) {
      case 'CL':
        return {
          title: 'Término de Adhesión y Voluntariado Autónomo (Chile)',
          norm: 'Ley 20.500 de Asociaciones y Participación Ciudadana y Código del Trabajo',
          body: 'El voluntario declara expresamente que presta sus servicios de forma autónoma, benévola y solidaria. No media vínculo de subordinación ni dependencia, ni derecho a compensación económica o laboral alguna. Los tokens de impacto y certificaciones emitidas constituyen exclusivamente reconocimientos honoríficos y formativos sin carácter remuneratorio.',
        };
      case 'BR':
        return {
          title: 'Termo de Adesão ao Serviço Voluntário (Brasil)',
          norm: 'Lei Federal Nº 9.608/1998 e Decreto Federal Nº 9.906/2019 (Pátria Voluntária)',
          body: 'Nos termos da Lei Federal nº 9.608/1998, o serviço voluntário não gera vínculo empregatício, nem obrigação de natureza trabalhista, previdenciária ou afim. Os tokens de impacto e selos emitidos configuram estímulo honorífico e reconhecimento cívico, sem qualquer natureza salarial ou tributável.',
        };
      case 'CO':
      default:
        return {
          title: 'Término de Adhesión al Servicio de Voluntariado (Colombia)',
          norm: 'Ley 720 de 2001 (Art. 6) y Decreto Nacional 4290 de 2005',
          body: 'Conforme al Art. 6 de la Ley 720 de 2001, la acción voluntaria no generará relación de carácter laboral ni contraprestación económica. No es lícito pactar remuneración laboral. Los incentivos de mérito, horas certificadas y Volunta Impact Tokens (VIT) constituyen instrumentos honoríficos y formativos en especie, exentos de renta de trabajo y amparados en el Estatuto Tributario (Art. 125-2 ET).',
        };
    }
  };

  const legalContent = getLegalReferenceText();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {legalContent.title}
            </h2>
            <p className="text-xs text-slate-500">
              Marco Legal: <strong>{legalContent.norm}</strong>
            </p>
          </div>
        </div>

        {existingTerm && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Término de Adhesión ya formalizado</span>
                <div className="text-[11px] text-emerald-700 font-mono">
                  Hash: {existingTerm.sha256ConsentHash.substring(0, 24)}...
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg uppercase">
              Vigente
            </span>
          </div>
        )}

        {/* Country Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Jurisdicción Legal Aplicable
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedCountry('CO')}
              className={`p-2.5 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedCountry === 'CO'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🇨🇴 Colombia</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCountry('CL')}
              className={`p-2.5 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedCountry === 'CL'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🇨🇱 Chile</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCountry('BR')}
              className={`p-2.5 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedCountry === 'BR'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🇧🇷 Brasil</span>
            </button>
          </div>
        </div>

        {/* Legal Text Scrollbox */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-56 overflow-y-auto text-xs text-slate-700 space-y-3 leading-relaxed">
          <p className="font-semibold text-slate-900">
            1. Objeto y Naturaleza No Remunerada:
          </p>
          <p>{legalContent.body}</p>

          <p className="font-semibold text-slate-900">
            2. Régimen de Tokens de Impacto (VIT) e Insignias Soulbound:
          </p>
          <p>
            Los tokens de impacto y certificaciones emitidos en Volunta operan bajo el estándar de Prueba de Contribución (Proof-of-Impact). No tienen convertibilidad a moneda de curso legal (fiat) ni constituyen activo financiero de especulación. Únicamente son canjeables en el catálogo de beneficios sostenibles (formación, economía circular y donaciones equivalentes).
          </p>

          <p className="font-semibold text-slate-900">
            3. Exención Impositiva y Seguridad de la Información (ISO 27001):
          </p>
          <p>
            Las organizaciones aliadas no practicarán retenciones en la fuente salariales, ni se presumirá renta gravable, amparándose en la normativa de no onerosidad y en los programas de RSE certificados (Art. 125-2 ET / Ley 19.885 / Lei 9.249). Toda transacción de tokens queda timbrada criptográficamente con algoritmo SHA-256 en el ledger inmutable.
          </p>
        </div>

        {/* Form and Sign */}
        <form onSubmit={handleSign} className="mt-5 space-y-4">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={acceptedClauses}
              onChange={(e) => setAcceptedClauses(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-snug">
              He leído y acepto el <strong>Término de Adhesión</strong>, reconociendo el carácter estrictamente altruista, no laboral y libre de remuneración económica de mis horas e incentivos de voluntariado.
            </span>
          </label>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firma electrónica con sello RFC 3161</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={!acceptedClauses || isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                {isSubmitting ? (
                  <span>Firmando y Sellando...</span>
                ) : signSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Firmado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Firmar Término Digital</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
