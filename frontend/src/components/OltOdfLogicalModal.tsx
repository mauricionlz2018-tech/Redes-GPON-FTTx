import React, { useState, useMemo } from 'react';
import {
  X,
  Server,
  Layers,
  Cpu,
  Activity,
  GitBranch,
  Network,
  CheckCircle2,
  Box,
  Radio,
  Info,
  Sliders,
  Gauge
} from 'lucide-react';
import { OdfPanel, NapBox, FiberRoute } from '../types';
import { calculateOpticalPowerBudget, SPLITTER_PLC_LOSS_DB } from '../utils/geoUtils';

interface OltOdfLogicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  odf?: OdfPanel | null;
  naps?: NapBox[];
  routes?: FiberRoute[];
  onSelectNapOnMap?: (nap: NapBox) => void;
}

export const OltOdfLogicalModal: React.FC<OltOdfLogicalModalProps> = ({
  isOpen,
  onClose,
  odf,
  naps = [],
  routes = [],
  onSelectNapOnMap
}) => {
  const [activeTab, setActiveTab] = useState<'olt' | 'odf' | 'trace' | 'budget'>('trace');
  const [selectedPonIndex, setSelectedPonIndex] = useState<number>(0);
  const [selectedNapId, setSelectedNapId] = useState<string>(naps[0]?.id_nap || '');
  const [budgetDistanceKm, setBudgetDistanceKm] = useState<number>(2.4);
  const [budgetTxPower, setBudgetTxPower] = useState<number>(4.5);
  const [budgetSplit1, setBudgetSplit1] = useState<'1:2' | '1:4' | '1:8' | 'directo'>('1:8');
  const [budgetSplit2, setBudgetSplit2] = useState<'1:8' | '1:16' | '1:32' | 'directo'>('1:16');
  const [budgetFusions, setBudgetFusions] = useState<number>(4);

  // 16 Puertos PON de la tarjeta OLT GPFD en Slot 1 (Estándar GPON ITU-T G.984)
  const ponPortsData = useMemo(() => {
    return Array.from({ length: 16 }, (_, idx) => {
      const portNum = idx + 1;
      // NAPs asignadas a este puerto PON
      const assignedNaps = naps.filter((n, nIdx) => {
        if (n.id_puerto_pon) {
          return n.id_puerto_pon.toLowerCase().includes(`pon-${portNum}`) || n.id_puerto_pon.toLowerCase().includes(`pon_${portNum}`);
        }
        return nIdx % 4 === idx;
      });

      const totalActiveOnts = assignedNaps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
      const maxPonCapacity = 64; // Relación GPON 1:64 típica
      const txPower = 4.5 + ((portNum % 5) * 0.15); // Potencia Tx SFP+ Clase B+ típica (+4.5 a +5.1 dBm)
      const hilosAsignados = [portNum, portNum + 16];

      return {
        portNum,
        name: `PON 1/1/${portNum}`,
        slot: 1,
        txPower: Number(txPower.toFixed(2)),
        status: portNum <= 4 ? 'En Servicio' : portNum <= 8 ? 'Disponible' : 'Reserva',
        maxPonCapacity,
        activeOnts: totalActiveOnts,
        assignedNaps,
        utilizationPct: Math.round((totalActiveOnts / maxPonCapacity) * 100),
        hilosAsignados
      };
    });
  }, [naps]);

  const activePon = ponPortsData[selectedPonIndex] || ponPortsData[0];

  // Matriz de 48 Hilos de Fibra en 4 Bandejas ODF con código estándar de colores TIA-598
  const odfTrays = useMemo(() => {
    const tia598Colors = [
      { name: 'Azul', hex: '#2563eb', bg: 'bg-blue-600' },
      { name: 'Naranja', hex: '#f97316', bg: 'bg-orange-500' },
      { name: 'Verde', hex: '#16a34a', bg: 'bg-green-600' },
      { name: 'Café', hex: '#78350f', bg: 'bg-amber-900' },
      { name: 'Gris', hex: '#64748b', bg: 'bg-slate-500' },
      { name: 'Blanco', hex: '#f8fafc', bg: 'bg-slate-200 border border-slate-400' },
      { name: 'Rojo', hex: '#dc2626', bg: 'bg-red-600' },
      { name: 'Negro', hex: '#0f172a', bg: 'bg-slate-900' },
      { name: 'Amarillo', hex: '#eab308', bg: 'bg-yellow-500' },
      { name: 'Violeta', hex: '#9333ea', bg: 'bg-purple-600' },
      { name: 'Rosa', hex: '#ec4899', bg: 'bg-pink-500' },
      { name: 'Aqua', hex: '#06b6d4', bg: 'bg-cyan-500' }
    ];

    return [1, 2, 3, 4].map((trayNum) => {
      const hilos = Array.from({ length: 12 }, (_, hIdx) => {
        const hiloGlobal = (trayNum - 1) * 12 + hIdx + 1;
        const color = tia598Colors[hIdx];
        let estado = 'Reserva Técnica';
        let destino = 'Sin Conectar';
        let ponAsociado = '-';

        if (hiloGlobal === 1) {
          estado = 'Activo / Fusión Primaria';
          destino = 'Troncal Principal 48H -> Mufa Torpedo 01 (Splitter 1:8)';
          ponAsociado = 'PON 1/1/1';
        } else if (hiloGlobal === 2) {
          estado = 'Activo / Fusión Primaria';
          destino = 'Troncal Principal 48H -> Mufa Torpedo 02 (Splitter 1:8)';
          ponAsociado = 'PON 1/1/2';
        } else if (hiloGlobal === 3) {
          estado = 'Activo / Ramal';
          destino = 'Ramal Distribución 12H -> Sector La Presa';
          ponAsociado = 'PON 1/1/3';
        } else if (hiloGlobal === 4) {
          estado = 'Activo / Ramal';
          destino = 'Ramal Distribución 12H -> Sector Centro';
          ponAsociado = 'PON 1/1/4';
        } else if (hiloGlobal <= 12) {
          estado = 'Derivación Proyectada';
          destino = 'Troncal 48H (Tubo 1)';
        } else {
          estado = 'Reserva Técnica Libre';
          destino = 'Tubo Secundario ODF';
        }

        return {
          hiloGlobal,
          colorName: color.name,
          colorHex: color.hex,
          colorBg: color.bg,
          estado,
          destino,
          ponAsociado
        };
      });

      return {
        trayNum,
        name: `Bandeja ${trayNum} (Hilos ${(trayNum - 1) * 12 + 1} al ${trayNum * 12})`,
        hilos
      };
    });
  }, []);

  // NAP actualmente seleccionada para Trazabilidad
  const targetNap = useMemo(() => {
    return naps.find((n) => n.id_nap === selectedNapId) || naps[0];
  }, [naps, selectedNapId]);

  // Cálculo de Presupuesto Óptico en tiempo real con motor físico ITU-T
  const calculatedBudget = useMemo(() => {
    return calculateOpticalPowerBudget({
      distanciaKm: budgetDistanceKm,
      potenciaTxDbm: budgetTxPower,
      splitter1Ratio: budgetSplit1,
      splitter2Ratio: budgetSplit2,
      numFusiones: budgetFusions,
      numConectores: 4,
      longitudOnda: '1490'
    });
  }, [budgetDistanceKm, budgetTxPower, budgetSplit1, budgetSplit2, budgetFusions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto text-slate-900 dark:text-white flex flex-col max-h-[90vh] transition-colors">
        
        {/* Cabecera del Modal con estilo idéntico a FiberDesignLegendModal */}
        <div className="bg-slate-100 dark:bg-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {odf?.nombre || 'Arquitectura Lógica OLT / ODF'}
                </h2>
                <span className="text-[11px] font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 hidden sm:inline">
                  Estándar GPON ITU-T G.984.2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {odf?.ubicacion_central || 'Centro de Operaciones de Red (NOC) - San José del Rincón'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pestañas con estilo limpio y armónico */}
        <div className="bg-slate-50 dark:bg-slate-900/60 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('trace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trace'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>1. Trazabilidad Extremo a Extremo</span>
          </button>

          <button
            onClick={() => setActiveTab('olt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'olt'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. OLT Activa & Puertos PON</span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded-full font-mono">
              16
            </span>
          </button>

          <button
            onClick={() => setActiveTab('odf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'odf'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Distribuidor Pasivo ODF</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
              48H
            </span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'budget'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>4. Presupuesto Óptico</span>
          </button>
        </div>

        {/* Cuerpo del Modal con Contenido por Pestaña */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* ========================================================== */}
          {/* PESTAÑA 1: TRAZABILIDAD LÓGICA EXTREMO A EXTREMO           */}
          {/* ========================================================== */}
          {activeTab === 'trace' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Barra de Selección de Caja */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Inspección de Ruta Lógica Extremo a Extremo (Trace Route Óptico)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Selecciona una Caja NAP para trazar todo el trayecto desde el emisor láser de la OLT hasta el abonado
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Caja NAP:</span>
                  <select
                    value={selectedNapId}
                    onChange={(e) => setSelectedNapId(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-sky-500"
                  >
                    {naps.map((n) => (
                      <option key={n.id_nap} value={n.id_nap}>
                        {n.identificador} ({n.zona})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diagrama de Trazabilidad Lógica Horizontal */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Topología Física & Lógica del Enlace Óptico:</span>
                  <span className="text-[11px] font-normal normal-case text-slate-500">
                    {targetNap?.identificador} &bull; {targetNap?.coordenadas_gps ? `${targetNap.coordenadas_gps.lat.toFixed(4)}, ${targetNap.coordenadas_gps.lng.toFixed(4)}` : ''}
                  </span>
                </div>

                {/* Cadena de Bloques de Red */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
                  {/* Bloque 1: OLT Activa */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border-l-4 border-indigo-600 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        1. OLT Activa
                      </span>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-mono border border-indigo-200 dark:border-indigo-800">
                        NOC
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5">Huawei MA5800</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Puerto: <strong>PON 1/1/1</strong>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Tx: +4.80 dBm
                    </div>
                  </div>

                  {/* Bloque 2: Repartidor Pasivo ODF */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border-l-4 border-sky-600 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        2. ODF Central
                      </span>
                      <span className="text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded font-mono border border-sky-200 dark:border-sky-800">
                        Pasivo
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5">Bandeja #1</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Hilo: <strong>#1 (Azul TIA-598)</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Atenuación: 0.35 dB
                    </div>
                  </div>

                  {/* Bloque 3: Mufa Torpedo de Empalme */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border-l-4 border-amber-600 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        3. Mufa Torpedo
                      </span>
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-200 dark:border-amber-800">
                        1:8 Split
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5">Troncal 48H</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Splitter 1:8 Primario
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Pérdida Splitter: 10.5 dB
                    </div>
                  </div>

                  {/* Bloque 4: Caja NAP */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border-l-4 border-emerald-600 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5" />
                        4. {targetNap?.identificador || 'Caja NAP'}
                      </span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-200 dark:border-emerald-800">
                        1:16 Split
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5">{targetNap?.direccion_texto || 'Poste CFE'}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Splitter 1:16 Secundario
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Pérdida Splitter: 13.8 dB
                    </div>
                  </div>

                  {/* Bloque 5: Abonado ONT */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border-l-4 border-purple-600 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5" />
                        5. ONT Cliente
                      </span>
                      <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-mono border border-purple-200 dark:border-purple-800">
                        Drop FTTx
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5">Acometida 1H</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Puertos 1 a 16
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Rx: -19.4 dBm (Óptimo)
                    </div>
                  </div>
                </div>

                {/* Resumen del Factor Total de División */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                  <span>Factor de División Total en Cascada: <strong>1:8 &times; 1:16 = 1:128 Máx (Operando a 1:64)</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Enlace Óptico Sincronizado sin Saturación
                  </span>
                </div>
              </div>

              {/* Botón de Centrar Caja en el Mapa */}
              {targetNap && onSelectNapOnMap && (
                <div className="flex justify-end">
                  <button
                    onClick={() => onSelectNapOnMap(targetNap)}
                    className="px-3.5 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded-lg text-xs font-bold hover:bg-sky-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Centrar {targetNap.identificador} en el Mapa &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* PESTAÑA 2: CHASIS OLT ACTIVA & MATRIZ DE PUERTOS PON      */}
          {/* ========================================================== */}
          {activeTab === 'olt' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Tarjeta Informativa de Distinción OLT vs ODF */}
              <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 rounded-xl p-3.5 flex items-start gap-3 text-xs">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sky-950 dark:text-sky-200">
                    Diferenciación de Capa Activa (OLT) vs Pasiva (ODF)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    La <strong>OLT (Optical Line Terminal)</strong> es el equipo activo de conmutación electrónica que emite luz láser modulada mediante transceptores SFP+ Clase B+ (+1.5 a +5.0 dBm). Cada puerto PON alimenta una red óptica pasiva mediante splitteo jerárquico 1:64 (1:8 troncal + 1:16 en NAP). El <strong>ODF</strong> organiza y fusiona físicamente estos hilos hacia la planta externa.
                  </p>
                </div>
              </div>

              {/* Ficha Técnica de Hardware OLT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Chasis OLT</span>
                  <span className="font-bold text-slate-900 dark:text-white">Huawei SmartAX MA5800</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Tarjeta GPON (Slot 1)</span>
                  <span className="font-bold text-slate-900 dark:text-white">GPFD 16 Puertos SFP+</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Ratio de Splitteo Global</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1:64 (Máx. 1:128)</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Abonados ONT Totales</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {naps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0)} ONTs Activas
                  </span>
                </div>
              </div>

              {/* Matriz Visual de los 16 Puertos PON de la OLT */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Puertos GPON SFP+ (Tarjeta Slot 1)</span>
                  </h3>
                  <span className="text-xs text-slate-500">Selecciona un puerto PON para ver su carga</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                  {ponPortsData.map((pon, idx) => {
                    const isSelected = idx === selectedPonIndex;
                    return (
                      <button
                        key={pon.name}
                        onClick={() => setSelectedPonIndex(idx)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                            {pon.name}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pon.status === 'En Servicio' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between">
                          <span>Tx: {pon.txPower} dBm</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, pon.utilizationPct)}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300">
                            {pon.activeOnts}/64
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalle del Puerto PON Seleccionado */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Detalle Lógico de {activePon.name}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      Estado: <strong className="text-emerald-600 dark:text-emerald-400">{activePon.status}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md font-mono text-slate-700 dark:text-slate-300">
                      Potencia Tx: {activePon.txPower} dBm
                    </span>
                    <span className="bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-md font-semibold">
                      {activePon.activeOnts} ONTs conectadas
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Cajas NAP asociadas a este puerto PON:</span>
                  {activePon.assignedNaps.length === 0 ? (
                    <p className="mt-1 text-slate-400 italic">No hay cajas NAP asignadas a este puerto PON actualmente.</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {activePon.assignedNaps.map((n) => (
                        <div
                          key={n.id_nap}
                          className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{n.identificador}</span>
                            <span className="text-[11px] text-slate-500">{n.zona}</span>
                          </div>
                          <span className="font-mono font-bold text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {n.metricas?.ocupados || 0}/16
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PESTAÑA 3: DISTRIBUIDOR PASIVO ODF (48 HILOS TIA-598)      */}
          {/* ========================================================== */}
          {activeTab === 'odf' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  El <strong>ODF Pasivo</strong> distribuye los 48 hilos ópticos hacia la troncal 48H divididos en 4 bandejas de 12 fusiones cada una, identificados bajo el código de colores internacional <strong>TIA-598</strong>.
                </p>
              </div>

              <div className="space-y-4">
                {odfTrays.map((tray) => (
                  <div key={tray.trayNum} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        {tray.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        12 Puertos SC/APC
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-2 px-3 font-semibold w-16">Hilo</th>
                            <th className="py-2 px-3 font-semibold w-28">Color TIA-598</th>
                            <th className="py-2 px-3 font-semibold w-28">Puerto OLT</th>
                            <th className="py-2 px-3 font-semibold w-36">Estado</th>
                            <th className="py-2 px-3 font-semibold">Destino de Fibra Troncal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {tray.hilos.map((hilo) => (
                            <tr key={hilo.hiloGlobal} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                #{hilo.hiloGlobal}
                              </td>
                              <td className="py-2 px-3">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <span className={`w-3 h-3 rounded-full shrink-0 ${hilo.colorBg}`} />
                                  <span className="text-slate-700 dark:text-slate-300">{hilo.colorName}</span>
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                                {hilo.ponAsociado}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    hilo.estado.includes('Activo')
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {hilo.estado}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                {hilo.destino}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PESTAÑA 4: CALCULADORA DE PRESUPUESTO ÓPTICO              */}
          {/* ========================================================== */}
          {activeTab === 'budget' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Fórmula Teórica con soporte perfecto para modo claro y oscuro */}
              <div className="bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Fórmula Oficial de Presupuesto Óptico (Norma ITU-T G.984.2):</span>
                </div>
                <div className="font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-center overflow-x-auto text-xs">
                  Atenuación Total = (Distancia &times; 0.35 dB/km) + (Fusiones &times; 0.1 dB) + (Conectores &times; 0.35 dB) + Loss_Splitter1 + Loss_Splitter2
                </div>
              </div>

              {/* Controles de Simulación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Distancia del Tramo OLT - NAP ({budgetDistanceKm} km):
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.1"
                    value={budgetDistanceKm}
                    onChange={(e) => setBudgetDistanceKm(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>0.5 km</span>
                    <span>{budgetDistanceKm} km</span>
                    <span>15 km</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Splitter Primario en Mufa:
                  </label>
                  <select
                    value={budgetSplit1}
                    onChange={(e: any) => setBudgetSplit1(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="1:2">Splitter 1:2 (Pérdida ~3.7 dB)</option>
                    <option value="1:4">Splitter 1:4 (Pérdida ~7.2 dB)</option>
                    <option value="1:8">Splitter 1:8 (Pérdida ~10.5 dB)</option>
                    <option value="directo">Sin Splitter Primario (0 dB)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block">Ubicado en Mufa Torpedo Troncal</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Splitter Secundario en NAP:
                  </label>
                  <select
                    value={budgetSplit2}
                    onChange={(e: any) => setBudgetSplit2(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="1:8">Splitter 1:8 (Pérdida ~10.5 dB)</option>
                    <option value="1:16">Splitter 1:16 (Pérdida ~13.8 dB)</option>
                    <option value="1:32">Splitter 1:32 (Pérdida ~17.1 dB)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block">Distribución de 16 puertos por caja NAP</span>
                </div>
              </div>

              {/* Resultados de Atenuación y Potencia Rx */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Potencia Tx (OLT):</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    +{budgetTxPower.toFixed(1)} dBm
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Pérdida por Fibra:</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {calculatedBudget.perdidaFibraDb} dB
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Atenuación Total:</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    {calculatedBudget.atenuacionTotalTeoricaDb} dB
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Potencia Rx (ONT):</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {calculatedBudget.potenciaRxEsperadaDbm} dBm
                  </span>
                </div>
              </div>

              {/* Veredicto de Enlace y Margen de Operación */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                  calculatedBudget.estadoEnlace === 'Optimo'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : calculatedBudget.estadoEnlace === 'Aceptable'
                    ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold">Estado del Enlace: {calculatedBudget.estadoEnlace}</span>
                    <span className="block text-[11px] opacity-80">
                      Sensibilidad ONT: {calculatedBudget.sensibilidadMinimaDbm} dBm | Margen: +{calculatedBudget.margenOperativoDb} dB
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg font-mono font-bold text-xs shadow-xs border border-slate-200 dark:border-slate-700">
                  +{calculatedBudget.margenOperativoDb} dB
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal con estilo idéntico a los otros modales */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Sistema de Mapeo Lógico y Físico GPON FTTx</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
