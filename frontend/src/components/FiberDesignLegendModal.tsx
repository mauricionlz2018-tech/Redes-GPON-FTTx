import React from 'react';
import { X, Network, GitCommit, Layers, Info, MapPin } from 'lucide-react';
import { FIBER_DESIGN_COLORS } from './standardFiberIcons';
import { getTroncalDesignMetrics } from '../data/troncalIxtJocData';
import { FiberRoute, EmpalmeClosure } from '../types';

interface FiberDesignLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoutes?: FiberRoute[];
  activeEmpalmes?: EmpalmeClosure[];
}

export const FiberDesignLegendModal: React.FC<FiberDesignLegendModalProps> = ({
  isOpen,
  onClose,
  activeRoutes,
  activeEmpalmes
}) => {
  if (!isOpen) return null;

  // Obtenemos métricas del dataset KMZ base y recalculamos con las rutas activas si se han agregado
  const baseMetrics = getTroncalDesignMetrics();
  
  // Si hay rutas personalizadas adicionales, recalculamos dinámicamente
  const calculatedMetrics = React.useMemo(() => {
    if (!activeRoutes || activeRoutes.length === 0) return baseMetrics;

    const summary = {
      totalMetros: 0,
      totalKm: 0,
      rutas96H_metros: 0,
      rutas48H_metros: 0,
      rutas12HTroncal_metros: 0,
      rutas12HDist_metros: 0,
      totalMufas: activeEmpalmes?.length ?? baseMetrics.totalMufas,
      totalGasas: baseMetrics.totalGasas,
      totalPostesCfe: baseMetrics.totalPostesCfe,
      totalPostesPropuestos: baseMetrics.totalPostesPropuestos,
      totalRutasTrazadas: activeRoutes.length
    };

    activeRoutes.forEach(r => {
      const dist = r.distancia_metros || 0;
      summary.totalMetros += dist;
      const st = (r.subtipo || '').toLowerCase();
      const cap = r.hilos || 0;
      if (cap === 96 || st.includes('96')) summary.rutas96H_metros += dist;
      else if (cap === 48 || st.includes('48')) summary.rutas48H_metros += dist;
      else if (cap === 12 && (st.includes('distribuc') || r.tipo === 'ramal')) summary.rutas12HDist_metros += dist;
      else if (cap === 12 || st.includes('12')) summary.rutas12HTroncal_metros += dist;
      else summary.rutas12HTroncal_metros += dist;
    });

    summary.totalKm = Number((summary.totalMetros / 1000).toFixed(2));
    return summary;
  }, [activeRoutes, activeEmpalmes, baseMetrics]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 px-6 py-4 text-white flex items-center justify-between border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 border border-sky-400/30 rounded-xl text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Norma de Diseño de Planta Externa FTTx
                <span className="text-[11px] font-mono bg-sky-500/20 border border-sky-400/40 text-sky-300 px-2 py-0.5 rounded-full">
                  KMZ IXT-JOC
                </span>
              </h2>
              <p className="text-xs text-sky-200/80">
                Simbología estandarizada de ingeniería, tipos de fusiones ópticas y desglose de metrajes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* TABLA DE METRAJES Y DISTANCIAS TOTALES */}
          <div className="bg-gradient-to-br from-slate-50 to-sky-50/40 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-4 border border-sky-200/80 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Cómputo Total de Tendido de Fibra Óptica (Metros Lineales y Km)
              </h3>
              <span className="text-xs font-semibold bg-sky-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                Total Red: {calculatedMetrics.totalKm.toLocaleString()} km ({calculatedMetrics.totalMetros.toLocaleString()} ML)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 96H Troncal */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-purple-800 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraTroncal96H }} />
                  Fibra 96H Troncal
                </div>
                <div className="text-base font-black text-purple-950 dark:text-purple-300 mt-1">
                  {(calculatedMetrics.rutas96H_metros / 1000).toFixed(2)} km
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {calculatedMetrics.rutas96H_metros.toLocaleString()} ML
                </div>
              </div>

              {/* 48H Troncal */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-amber-800 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraTroncal48H }} />
                  Fibra 48H Troncal
                </div>
                <div className="text-base font-black text-amber-950 dark:text-amber-300 mt-1">
                  {(calculatedMetrics.rutas48H_metros / 1000).toFixed(2)} km
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {calculatedMetrics.rutas48H_metros.toLocaleString()} ML
                </div>
              </div>

              {/* 12H Troncal */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-pink-600 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraTroncal12H }} />
                  Fibra 12H Troncal
                </div>
                <div className="text-base font-black text-pink-900 dark:text-pink-300 mt-1">
                  {(calculatedMetrics.rutas12HTroncal_metros / 1000).toFixed(2)} km
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {calculatedMetrics.rutas12HTroncal_metros.toLocaleString()} ML
                </div>
              </div>

              {/* 12H Distribución */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-cyan-400 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraDistribucion12H }} />
                  Fibra 12H Distribución
                </div>
                <div className="text-base font-black text-cyan-900 dark:text-cyan-300 mt-1">
                  {(calculatedMetrics.rutas12HDist_metros / 1000).toFixed(2)} km
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {calculatedMetrics.rutas12HDist_metros.toLocaleString()} ML
                </div>
              </div>
            </div>

            {/* Elementos físicos inventariados */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
              <div className="flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-sky-600" />
                <span>Mufas de Empalme: <strong>{calculatedMetrics.totalMufas}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-blue-600">∞</span>
                <span>Gasas de Reserva: <strong>{calculatedMetrics.totalGasas}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                <span>Postes CFE: <strong>{calculatedMetrics.totalPostesCfe}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <span>Postes Propuestos: <strong>{calculatedMetrics.totalPostesPropuestos}</strong></span>
              </div>
            </div>
          </div>

          {/* GRID COMPARATIVO: TIPO FUSIONES vs SIMBOLOGÍA PARA EL DISEÑO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. COLUMNA IZQUIERDA: TIPO FUSIONES */}
            <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold">
                    &gt;&lt;
                  </span>
                  Tipo Fusiones Ópticas
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Estándares de empalme por fusión térmica en planta externa
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Fusión de Paso */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>1. Fusión de Paso (Troncal a Troncal)</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                      Continuidad
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Unión hila a hilo directa (1:1) entre cables principales de 96H o 48H manteniendo el código de colores estricto para continuidad de la ruta troncal interurbana.
                  </p>
                </div>

                {/* Fusión de Derivación */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>2. Fusión de Derivación (Troncal a Ramal/NAP)</span>
                    <span className="text-[10px] bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded">
                      Splitter
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Derivación de un hilo troncal alimentador hacia la entrada IN de un divisor óptico o caja terminal NAP para alimentar clústeres residenciales.
                  </p>
                </div>

                {/* Fusión de Sangría */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>3. Fusión en Sangría (Mid-Span Access)</span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      Sin corte
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Se abre una ventana longitudinal en la cubierta del cable sin cortar las fibras restantes, extrayendo únicamente los hilos requeridos en la mufa.
                  </p>
                </div>

                {/* Remate de Fibras */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>4. Remate y Conectorización SC/APC</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Bandeja
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Empalme con pigtails preconectorizados SC/APC con pulido angular de 8° para pérdidas de retorno óptico &gt; 60 dB.
                  </p>
                </div>

                {/* Código de Colores TIA-598 */}
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-[11px] text-slate-700 dark:text-slate-300 mb-1.5">
                    Código Cromático de Hilos (TIA-598)
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> 1. Azul</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 2. Nar</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600" /> 3. Verde</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-900" /> 4. Café</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> 5. Gris</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" /> 6. Blan</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> 7. Rojo</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-black border border-white" /> 8. Neg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. COLUMNA DERECHA: SIMBOLOGÍA PARA EL DISEÑO */}
            <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-bold">
                    ▲
                  </span>
                  Simbología para el Diseño
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Iconografía de plano conforme al estándar de ingeniería de red
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* 1. Divisor Óptico 1:8 Troncal */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-8 flex items-center justify-center shrink-0">
                    <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                      <polygon points="26,2 6,12 26,22" fill="#1e88e5" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1="2" y1="12" x2="6" y2="12" stroke="#ffffff" strokeWidth="2" />
                      <line x1="26" y1="5" x2="32" y2="5" stroke="#2563eb" strokeWidth="1.5" />
                      <line x1="26" y1="9" x2="32" y2="9" stroke="#f97316" strokeWidth="1.5" />
                      <line x1="26" y1="13" x2="32" y2="13" stroke="#16a34a" strokeWidth="1.5" />
                      <line x1="26" y1="17" x2="32" y2="17" stroke="#dc2626" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Divisor Óptico 1:8 Troncal</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Triángulo azul con 8 salidas acopladas hacia el siguiente nivel de distribución.
                    </div>
                  </div>
                </div>

                {/* 2. Divisor Óptico 1:8 NAP */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-8 flex items-center justify-center shrink-0">
                    <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                      <polygon points="26,2 6,12 26,22" fill="#d81b60" stroke="#ffffff" strokeWidth="1.5" />
                      <rect x="15" y="8" width="6" height="8" fill="#ffffff" stroke="#d81b60" strokeWidth="1" rx="1" />
                      <line x1="2" y1="12" x2="6" y2="12" stroke="#ffffff" strokeWidth="2" />
                      <line x1="26" y1="5" x2="32" y2="5" stroke="#2563eb" strokeWidth="1.5" />
                      <line x1="26" y1="9" x2="32" y2="9" stroke="#f97316" strokeWidth="1.5" />
                      <line x1="26" y1="13" x2="32" y2="13" stroke="#16a34a" strokeWidth="1.5" />
                      <line x1="26" y1="17" x2="32" y2="17" stroke="#dc2626" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Divisor Óptico 1:8 NAP</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Triángulo magenta con caja interior para acometidas directas a abonados.
                    </div>
                  </div>
                </div>

                {/* 3. Caja NAP */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-8 flex items-center justify-center shrink-0">
                    <div className="bg-slate-900 border border-white rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      NAP
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Caja Terminal NAP (8 / 16 Puertos)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Punto de acceso al usuario final con semáforo de saturación en tiempo real.
                    </div>
                  </div>
                </div>

                {/* 4. Cierre de Empalme / Mufa */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-8 flex items-center justify-center shrink-0">
                    <svg width="34" height="20" viewBox="0 0 34 20" fill="none">
                      <rect x="2" y="3" width="30" height="14" rx="7" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                      <path d="M12 6 L20 14 M12 14 L20 6" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Cierre de Empalme / Mufa Torpedo</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Cilindro domo hermético IP68 para fusión de cables principales y derivaciones.
                    </div>
                  </div>
                </div>

                {/* 5. Gasa / Reserva Técnica */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-8 flex items-center justify-center shrink-0">
                    <div className="w-7 h-7 rounded-full bg-blue-600 border border-white text-white font-bold flex items-center justify-center text-xs">
                      ∞
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Gasa / Reserva Técnica (30m / 50m)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Reserva de fibra enrollada en poste para mantenimiento y contingencias de corte.
                    </div>
                  </div>
                </div>

                {/* 6. Postes Propuestos vs CFE */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-8 flex items-center justify-center gap-2 shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-300" title="Poste Propuesto" />
                    <div className="w-3 h-3 rounded-full bg-slate-600 text-[6px] text-white flex items-center justify-center" title="Poste CFE">
                      +
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Poste Propuesto (Rojo) & CFE (Gris)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Círculo rojo para postes proyectados por ingeniería; gris para infraestructura CFE.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-sky-50 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Todos los elementos han sido importados con alta precisión geodésica directamente desde el plano <strong>Troncal IXT-JOC.kmz</strong>. Puedes añadir nuevas rutas troncales, ramales y mufas con cálculo de distancia automático desde la barra de herramientas.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

