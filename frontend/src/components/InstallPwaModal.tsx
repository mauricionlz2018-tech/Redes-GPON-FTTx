import React from 'react';
import { Download, X, Smartphone, CheckCircle, Apple, Monitor } from 'lucide-react';

interface InstallPwaModalProps {
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  onClose,
  deferredPrompt,
  onInstallSuccess
}) => {
  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-800 to-emerald-950 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Instalar Aplicación Móvil</h2>
              <p className="text-xs text-slate-400">Acceso rápido, pantalla completa y modo offline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Si el navegador soportó el evento directo */}
          {deferredPrompt && (
            <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl text-center space-y-3">
              <p className="text-xs text-emerald-200">
                Tu navegador está listo para instalar la aplicación directamente con 1 solo toque:
              </p>
              <button
                onClick={handleNativeInstall}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Instalar GPON FTTx Ahora</span>
              </button>
            </div>
          )}

          {/* Guía paso a paso por sistema operativo */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300">
              Instrucciones según tu dispositivo:
            </h3>

            {/* Android */}
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80 flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg flex-shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-200 block">En Teléfonos Android (Google Chrome)</span>
                <p className="text-slate-400 leading-relaxed">
                  Toca los <span className="text-white font-bold">tres puntos ⋮</span> en la esquina superior derecha del navegador y pulsa <span className="text-emerald-400 font-semibold">"Instalar aplicación"</span> o <span className="text-emerald-400 font-semibold">"Agregar a la pantalla principal"</span>.
                </p>
              </div>
            </div>

            {/* iPhone / iOS */}
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80 flex items-start gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg flex-shrink-0">
                <Apple className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-200 block">En iPhone / iPad (Safari)</span>
                <p className="text-slate-400 leading-relaxed">
                  Toca el botón <span className="text-white font-bold">Compartir ⎋</span> (el cuadro con la flecha hacia arriba) en la barra inferior y selecciona <span className="text-sky-400 font-semibold">"Agregar a pantalla de inicio"</span>.
                </p>
              </div>
            </div>

            {/* PC / Laptop */}
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80 flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg flex-shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-200 block">En Computadora (Chrome / Edge)</span>
                <p className="text-slate-400 leading-relaxed">
                  Haz clic en el icono de instalación <span className="text-purple-400 font-semibold">⤓</span> que aparece al final de la barra de direcciones de tu navegador.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
