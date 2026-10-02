import React, { useState } from 'react';
import { Gift, CheckCircle2, AlertCircle, X, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { ImpactPerkReward, User } from '../types';
import { dataStore } from '../lib/dataStore';

interface PerkRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  perk: ImpactPerkReward | null;
  currentUser: User;
  onRedeemSuccess?: () => void;
}

export const PerkRedeemModal: React.FC<PerkRedeemModalProps> = ({
  isOpen,
  onClose,
  perk,
  currentUser,
  onRedeemSuccess,
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    txId: string;
    proofHash: string;
  } | null>(null);

  if (!isOpen || !perk) return null;

  const wallet = dataStore.getTokenWallet(currentUser.id);
  const hasEnoughTokens = wallet.balance >= perk.tokenCost;
  const newBalance = wallet.balance - perk.tokenCost;

  const handleConfirmRedeem = () => {
    if (!hasEnoughTokens) {
      alert('Saldo insuficiente de tokens VIT.');
      return;
    }

    setIsRedeeming(true);
    try {
      const result = dataStore.redeemPerk(currentUser.id, perk.id);
      setSuccessResult({
        txId: result.transaction.id,
        proofHash: result.transaction.sha256ProofHash,
      });
      setIsRedeeming(false);
      if (onRedeemSuccess) onRedeemSuccess();
    } catch (err: unknown) {
      setIsRedeeming(false);
      alert(err instanceof Error ? err.message : 'Error al canjear la recompensa');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successResult ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {perk.category}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {perk.title}
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {perk.description}
            </p>

            {/* Sponsor and tax status */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Patrocinador RSE:
                </span>
                <span className="font-bold text-slate-800">
                  {perk.sponsorCompanyName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Disponibilidad en stock:</span>
                <span className="font-semibold text-emerald-700">
                  {perk.availableStock} unidades disponibles
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Régimen Fiscal:</strong> {perk.taxExemptionStatus}
                </span>
              </div>
            </div>

            {/* Token balance summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Costo de Recompensa:</span>
                <span className="font-bold text-indigo-700 font-mono text-sm">
                  {perk.tokenCost} VIT
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Tu Saldo Actual:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {wallet.balance} VIT
                </span>
              </div>
              <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Saldo tras el canje:</span>
                <span
                  className={`font-bold font-mono text-sm ${
                    hasEnoughTokens ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {newBalance} VIT
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-[11px] text-slate-500 italic bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
              📌 <strong>Instrucciones:</strong> {perk.redemptionInstructions}
            </div>

            {!hasEnoughTokens && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  No tienes suficientes tokens VIT. Participa en más horas de voluntariado o entregables pro-bono para sumar tokens.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                disabled={!hasEnoughTokens || isRedeeming}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirmar Canje ({perk.tokenCost} VIT)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              ¡Recompensa Canjeada con Éxito!
            </h3>

            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Has canjeado <strong>{perk.title}</strong>. Se ha generado un registro inmutable en el libro mayor de impacto.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1 text-xs">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                Sello Criptográfico SHA-256 (RFC 3161)
              </div>
              <div className="font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded-md border border-slate-200">
                {successResult.proofHash}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                ID Transacción: <span className="font-mono">{successResult.txId}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
              >
                Volver a mi Billetera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
