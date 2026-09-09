import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Database, Check, X, Info, FileText } from 'lucide-react';

interface DataDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataDisclaimerModal: React.FC<DataDisclaimerModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgainSession, setDontShowAgainSession] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (dontShowAgainSession) {
      try {
        sessionStorage.setItem('gpon_disclaimer_acknowledged', 'true');
        localStorage.setItem('gpon_disclaimer_acknowledged_date', new Date().toISOString());
      } catch (e) {
        console.warn('No se pudo guardar la preferencia en almacenamiento local:', e);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-modal-title"
      >
        {/* Cabecera con identidad visual */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 min-w-0 z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-inner flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-sky-100 inline-block mb-1">
                Aviso de Privacidad y Pruebas
              </span>
              <h2 id="disclaimer-modal-title" className="text-sm sm:text-base font-bold text-white truncate">
                Entorno de Pruebas y Protección de Datos
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0 z-10"
            title="Cerrar aviso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          {/* Mensaje destacado */}
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sky-900 dark:text-sky-200">
                Bienvenido al Sistema de Gestión de Red GPON / FTTx
              </p>
              <p className="text-xs text-sky-800/90 dark:text-sky-300 leading-relaxed">
                Este software se encuentra configurado para fines demostrativos, de evaluación técnica y auditoría operativa de infraestructura óptica.
              </p>
            </div>
          </div>

          {/* Tarjetas informativas clave */}
          <div className="space-y-3">
            {/* Punto 1: Datos de prueba */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                  1. Datos de prueba y simulación técnica
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Todos los registros de <strong>abonados, nombres de clientes, domicilios, números telefónicos, coordenadas y contratos</strong> visualizados en el mapa y en los reportes son <strong>datos ficticios</strong> generados para comprobar el funcionamiento de la plataforma, el trazado de fibra óptica y la ocupación de puertos NAP.
                </p>
              </div>
            </div>

            {/* Punto 2: Protección de datos reales */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                  2. Privacidad y protección de personas reales
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  En estricto cumplimiento con las normativas de protección de datos personales y privacidad, la información e identidad de clientes y suscriptores reales está <strong>totalmente resguardada, cifrada y protegida</strong>. Ningún dato sensible de personas reales se expone en este entorno de prueba.
                </p>
              </div>
            </div>

            {/* Punto 3: Alcance técnico */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                  3. Libertad de prueba operativa
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Puedes registrar clientes de prueba, asignar puertos, medir potencias ópticas en dBm y generar reportes en PDF con total confianza de estar en un entorno seguro y aislado.
                </p>
              </div>
            </div>
          </div>

          {/* Opción de no volver a mostrar en esta sesión */}
          <div className="pt-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgainSession}
                onChange={(e) => setDontShowAgainSession(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span>No volver a mostrar esta advertencia automáticamente durante esta sesión</span>
            </label>
          </div>
        </div>

        {/* Pie del modal con botón de acción */}
        <div className="p-3.5 sm:p-4 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Datos 100% Seguros</span>
          </div>

          <button
            onClick={handleAccept}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-950/20 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Entendido y Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

