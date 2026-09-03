import React, { useState } from 'react';
import { Download, X, Smartphone, CheckCircle, Apple, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'ios'>('direct');
  const [downloading, setDownloading] = useState(false);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    } else {
      alert('Para instalar directamente: Toca los tres puntos ⋮ arriba a la derecha en Chrome y pulsa "Instalar aplicación" o "Agregar a la pantalla principal".');
    }
  };

  const handleDownloadApkPackage = () => {
    setDownloading(true);
    // Redirige al generador oficial de APKs de Microsoft PWABuilder pre-cargado con la URL de la app
    const pwaUrl = encodeURIComponent('https://redes-gpon-ft-txs.vercel.app');
    window.open(`https://www.pwabuilder.com/?url=${pwaUrl}`, '_blank');
    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-800 to-emerald-950 px-5 py-3.5 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Centro de Descarga e Instalación Móvil</h2>
              <p className="text-[11px] text-slate-400 truncate">App nativa FTTx para teléfonos y cuadrillas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Opciones */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. Instalar en Celular</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>2. Descargar APK</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>3. iPhone / iOS</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl space-y-3 text-center">
                <div className="w-12 h-12 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instalación Nativa Inmediata (PWA)</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Crea el acceso directo con icono oficial en tu pantalla principal. Funciona en pantalla completa real sin barra de navegador y con soporte offline en campo.
                  </p>
                </div>

                <button
                  onClick={handleNativeInstall}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{deferredPrompt ? 'Instalar Ahora en Mi Teléfono' : 'Activar Instalación Directa'}</span>
                </button>
              </div>

              {/* Guía si no sale el aviso directo */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-400" />
                  ¿Cómo instalarlo en 2 pasos desde Chrome en Android?
                </span>
                <ol className="text-xs text-slate-400 space-y-1.5 pl-4 list-decimal">
                  <li>Toca los <strong className="text-white">tres puntos ⋮</strong> en la esquina superior derecha del navegador Chrome.</li>
                  <li>Selecciona la opción <strong className="text-emerald-400">"Instalar aplicación"</strong> o <strong className="text-emerald-400">"Agregar a la pantalla principal"</strong>.</li>
                  <li>¡Listo! El icono de GPON FTTx se agregará a tu cajón de aplicaciones.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Generar y Descargar Archivo .APK</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Genera un archivo instalador <strong>.APK</strong> firmado de Android usando el motor de Microsoft PWABuilder para compartir por WhatsApp o guardar en una memoria USB.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadApkPackage}
                    disabled={downloading}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{downloading ? 'Abriendo generador APK...' : 'Generar / Descargar APK en PWABuilder'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-2">
                <span className="font-bold text-slate-300 block">Pasos para descargar el APK:</span>
                <p>1. Al pulsar el botón azul, se abrirá la herramienta oficial con tu app ya cargada y calificada con 100/100 en verde.</p>
                <p>2. Haz clic en <strong>"Package for Stores"</strong> o en la pestaña <strong>Android</strong>.</p>
                <p>3. Pulsa <strong>"Download Package"</strong> y obtendrás tu instalador <strong>.apk</strong> listo.</p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-700 text-white rounded-xl flex-shrink-0">
                    <Apple className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Instalar en iPhone o iPad (Apple iOS)</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Apple no permite descargar archivos .apk, pero sí permite instalar la aplicación completa en tu pantalla de inicio mediante Safari.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
                  <p>1. Abre <strong className="text-sky-400">Safari</strong> en tu iPhone.</p>
                  <p>2. Toca el botón central <strong className="text-white">Compartir ⎋</strong> (el cuadrado con la flecha hacia arriba).</p>
                  <p>3. Desliza hacia abajo y pulsa <strong className="text-emerald-400">"Agregar a pantalla de inicio"</strong>.</p>
                  <p>4. Pulsa "Agregar" arriba a la derecha. ¡Listo!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">Versión Móvil 1.0.0 (FTTx)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
