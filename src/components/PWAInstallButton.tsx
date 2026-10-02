import React, { useState } from 'react';
import { usePWAInstall } from '../lib/usePWAInstall';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running in standalone/native wrapper, show a subtle active badge
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">App Instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        title="Instalar Volunta como App Nativa en iOS o Android"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      {/* Modal with Native Store & Installation Instructions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-5 text-white relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center p-1.5 border border-white/30">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Instalar Volunta App</h3>
                  <p className="text-xs text-blue-100">
                    Experiencia Nativa PWA (iOS & Google Play Ready)
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Cumple con estándares <strong>ISO 27001</strong> de seguridad y <strong>W3C PWA</strong> para ejecutarse a pantalla completa sin barra de navegación del explorador.
                </span>
              </div>

              {/* iOS Instructions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white"></span>
                  Apple iOS (iPhone / iPad)
                </div>
                <div className="p-3 bg-slate-100/70 dark:bg-slate-800/80 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1. Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>2. Desplázate y selecciona <strong>«Agregar a pantalla de inicio»</strong>.</span>
                  </div>
                </div>
              </div>

              {/* Android Instructions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Android (Google Play / Chromium)
                </div>
                <div className="p-3 bg-slate-100/70 dark:bg-slate-800/80 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {isInstallable ? (
                    <button
                      onClick={() => {
                        install();
                        setShowModal(false);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar directamente ahora</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Toca el menú de tres puntos (⋮) en Chrome y pulsa <strong>«Instalar aplicación»</strong>.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
