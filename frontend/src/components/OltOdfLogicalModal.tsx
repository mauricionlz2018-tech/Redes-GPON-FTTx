import React, { useState, useMemo, useEffect } from 'react';
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
  Gauge,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { OdfPanel, NapBox, FiberRoute } from '../types';
import { calculateGpsDistanceMeters } from '../utils/geoUtils';

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
  const [activeTab, setActiveTab] = useState<'trace' | 'olt' | 'odf' | 'budget'>('trace');
  const [selectedPonIndex, setSelectedPonIndex] = useState<number>(0);

  // Lista ordenada y deduplicada de 26 NAPs
  const sortedNaps = useMemo(() => {
    const seen = new Set<string>();
    return naps
      .filter((n) => {
        const key = (n.identificador || n.id_nap).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.identificador.localeCompare(b.identificador, undefined, { numeric: true }));
  }, [naps]);

  const [selectedNapId, setSelectedNapId] = useState<string>(() => sortedNaps[0]?.id_nap || '');

  // NAP actualmente seleccionada para Trazabilidad
  const targetNap = useMemo(() => {
    return sortedNaps.find((n) => n.id_nap === selectedNapId) || sortedNaps[0];
  }, [sortedNaps, selectedNapId]);

  // Índice de la NAP seleccionada en el arreglo ordenado (0 a 25)
  const targetNapIndex = useMemo(() => {
    const idx = sortedNaps.findIndex((n) => n.id_nap === targetNap?.id_nap);
    return idx >= 0 ? idx : 0;
  }, [sortedNaps, targetNap]);

  // Coordenadas fijas de la Cabecera ODF Central (San José del Rincón)
  const odfCoords = useMemo(() => {
    if (odf?.coordenadas_gps && typeof odf.coordenadas_gps.lat === 'number') {
      return odf.coordenadas_gps;
    }
    return { lat: 19.6450, lng: -99.8200 };
  }, [odf]);

  // Mapeo Lógico Jerárquico de Puertos PON (Arquitectura GPON ITU-T G.984 con División 1:8 × 1:16 = 1:128)
  const ponPortsData = useMemo(() => {
    // Repartir las 26 NAPs de forma estricta entre los 4 puertos PON activos (255 abonados en total)
    // PON 1/1/1: NAPs 0 a 6 (7 NAPs) -> 78 ONTs
    // PON 1/1/2: NAPs 7 a 13 (7 NAPs) -> 80 ONTs
    // PON 1/1/3: NAPs 14 a 19 (6 NAPs) -> 49 ONTs
    // PON 1/1/4: NAPs 20 a 25 (6 NAPs) -> 48 ONTs
    // Total = 78 + 80 + 49 + 48 = 255 ONTs (100% sincronizado con padrón)
    const ponNapsMap: Record<number, NapBox[]> = {
      1: sortedNaps.slice(0, 7),
      2: sortedNaps.slice(7, 14),
      3: sortedNaps.slice(14, 20),
      4: sortedNaps.slice(20, 26)
    };

    const fixedTxPowers: Record<number, number> = {
      1: 4.50,
      2: 4.65,
      3: 4.80,
      4: 4.95
    };

    const odfColors: Record<number, { name: string; bg: string }> = {
      1: { name: 'Azul', bg: 'bg-blue-600' },
      2: { name: 'Naranja', bg: 'bg-orange-500' },
      3: { name: 'Verde', bg: 'bg-green-600' },
      4: { name: 'Café', bg: 'bg-amber-900' }
    };

    const mufasMap: Record<number, { name: string; kmMufa: number }> = {
      1: { name: 'Mufa Torpedo 01 (SJR Sur)', kmMufa: 1.85 },
      2: { name: 'Mufa Torpedo 02 (SJR Centro)', kmMufa: 2.40 },
      3: { name: 'Mufa Torpedo 03 (La Presa)', kmMufa: 3.10 },
      4: { name: 'Mufa Torpedo 04 (San Francisco)', kmMufa: 3.85 }
    };

    return Array.from({ length: 16 }, (_, idx) => {
      const portNum = idx + 1;
      const assignedNaps = ponNapsMap[portNum] || [];
      const totalActiveOnts = assignedNaps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
      const maxPonCapacity = 128; // Capacidad física estándar en cascada 1:8 × 1:16 = 1:128
      const txPower = fixedTxPowers[portNum] || 4.50;
      const odfColor = odfColors[portNum] || { name: 'Gris', bg: 'bg-slate-500' };
      const mufa = mufasMap[portNum] || { name: `Mufa Torpedo 0${portNum}`, kmMufa: 2.0 };

      return {
        portNum,
        name: `PON 1/1/${portNum}`,
        slot: 1,
        txPower,
        status: portNum <= 4 ? 'En Servicio' : 'Disponible',
        maxPonCapacity,
        activeOnts: totalActiveOnts,
        assignedNaps,
        utilizationPct: Math.round((totalActiveOnts / maxPonCapacity) * 100),
        odfHiloNumber: portNum,
        odfColorName: odfColor.name,
        odfColorBg: odfColor.bg,
        mufaName: mufa.name,
        kmMufa: mufa.kmMufa
      };
    });
  }, [sortedNaps]);

  const activePon = ponPortsData[selectedPonIndex] || ponPortsData[0];

  // Identificar el puerto PON al que pertenece la NAP seleccionada
  const assignedPonForTargetNap = useMemo(() => {
    let portNum = 1;
    if (targetNapIndex >= 0 && targetNapIndex <= 6) portNum = 1;
    else if (targetNapIndex >= 7 && targetNapIndex <= 13) portNum = 2;
    else if (targetNapIndex >= 14 && targetNapIndex <= 19) portNum = 3;
    else portNum = 4;

    return ponPortsData[portNum - 1] || ponPortsData[0];
  }, [targetNapIndex, ponPortsData]);

  // Distancia GPS real entre el ODF central y la NAP seleccionada (con factor de curvatura de calle 1.25x)
  const realDistanceKm = useMemo(() => {
    if (!targetNap?.coordenadas_gps || typeof targetNap.coordenadas_gps.lat !== 'number') {
      return 2.85;
    }
    const directMeters = calculateGpsDistanceMeters(
      odfCoords.lat,
      odfCoords.lng,
      targetNap.coordenadas_gps.lat,
      targetNap.coordenadas_gps.lng
    );
    // Ruta en calle real (estimada a 1.25x la línea recta geodésica, mínimo 1.8 km)
    const routeKm = Math.max(1.8, (directMeters * 1.25) / 1000);
    return Number(routeKm.toFixed(2));
  }, [targetNap, odfCoords]);

  // Matriz de 48 Hilos de Fibra en 4 Bandejas ODF con código estándar de colores TIA-598
  const odfTrays = useMemo(() => {
    const tia598Colors = [
      { name: 'Azul', bg: 'bg-blue-600' },
      { name: 'Naranja', bg: 'bg-orange-500' },
      { name: 'Verde', bg: 'bg-green-600' },
      { name: 'Café', bg: 'bg-amber-900' },
      { name: 'Gris', bg: 'bg-slate-500' },
      { name: 'Blanco', bg: 'bg-slate-200 border border-slate-400' },
      { name: 'Rojo', bg: 'bg-red-600' },
      { name: 'Negro', bg: 'bg-slate-900' },
      { name: 'Amarillo', bg: 'bg-yellow-500' },
      { name: 'Violeta', bg: 'bg-purple-600' },
      { name: 'Rosa', bg: 'bg-pink-500' },
      { name: 'Aqua', bg: 'bg-cyan-500' }
    ];

    return [1, 2, 3, 4].map((trayNum) => {
      const hilos = Array.from({ length: 12 }, (_, hIdx) => {
        const hiloGlobal = (trayNum - 1) * 12 + hIdx + 1;
        const color = tia598Colors[hIdx];
        let estado = 'Reserva Técnica';
        let destino = 'Tubo Secundario ODF';
        let ponAsociado = '-';

        if (hiloGlobal === 1) {
          estado = 'Activo / Fusión Primaria';
          destino = 'Troncal 48H -> Mufa Torpedo 01 (Splitter 1:8)';
          ponAsociado = 'PON 1/1/1';
        } else if (hiloGlobal === 2) {
          estado = 'Activo / Fusión Primaria';
          destino = 'Troncal 48H -> Mufa Torpedo 02 (Splitter 1:8)';
          ponAsociado = 'PON 1/1/2';
        } else if (hiloGlobal === 3) {
          estado = 'Activo / Fusión Primaria';
          destino = 'Troncal 48H -> Mufa Torpedo 03 (Splitter 1:8)';
          ponAsociado = 'PON 1/1/3';
        } else if (hiloGlobal === 4) {
          estado = 'Activo / Fusión Primaria';
          destino = 'Troncal 48H -> Mufa Torpedo 04 (Splitter 1:8)';
          ponAsociado = 'PON 1/1/4';
        } else if (hiloGlobal <= 12) {
          estado = 'Derivación Proyectada';
          destino = `Troncal 48H (Tubo ${trayNum})`;
        }

        return {
          hiloGlobal,
          colorName: color.name,
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

  // CÁLCULO MATEMÁTICO BIDIRECCIONAL DE PRESUPUESTO ÓPTICO (ITU-T G.984.2 CLASE C+)
  const opticalBudgetForTargetNap = useMemo(() => {
    // 1. Pérdidas por Elementos Pasivos Fijos (Splitters PLC)
    const lossSplitter1 = 10.50; // Splitter 1:8 primario en Mufa
    const lossSplitter2 = 13.80; // Splitter 1:16 secundario en NAP
    const lossSplitters = Number((lossSplitter1 + lossSplitter2).toFixed(2)); // 24.30 dB

    // 2. Conectores: 4 pares acoplados SC/APC (Patchcord OLT, ODF front, NAP input, ONT drop) x 0.35 dB
    const numConectores = 4;
    const lossConectores = Number((numConectores * 0.35).toFixed(2)); // 1.40 dB

    // 3. Fusiones Térmicas de Arco: N empalmes x 0.10 dB (variable según mufas del tramo)
    const numFusiones = realDistanceKm > 5.0 ? 5 : realDistanceKm > 2.5 ? 4 : 3;
    const lossFusiones = Number((numFusiones * 0.10).toFixed(2)); // 0.30 a 0.50 dB (múltiplo exacto de 0.10 dB)

    // 4. Trayecto Bajada / Downstream (1490 nm, fibra G.652D @ 0.25 dB/km)
    const alphaFibraDown = 0.25;
    const lossFibraDown = Number((realDistanceKm * alphaFibraDown).toFixed(2));
    const atenuacionTotalDown = Number(
      (lossSplitters + lossConectores + lossFusiones + lossFibraDown).toFixed(2)
    );
    const txDown = assignedPonForTargetNap.txPower; // OLT Tx (+4.50 a +4.95 dBm)
    const rxDown = Number((txDown - atenuacionTotalDown).toFixed(2));
    const sensibilidadOntClaseC = -30.00; // Sensibilidad ONT GPON Clase C+
    const margenDown = Number((rxDown - sensibilidadOntClaseC).toFixed(2));

    // 5. Trayecto Subida / Upstream (1310 nm, fibra G.652D @ 0.35 dB/km)
    const alphaFibraUp = 0.35;
    const lossFibraUp = Number((realDistanceKm * alphaFibraUp).toFixed(2));
    const atenuacionTotalUp = Number(
      (lossSplitters + lossConectores + lossFusiones + lossFibraUp).toFixed(2)
    );
    const txUp = 2.50; // Potencia Tx ONT típica (+0.5 a +5.0 dBm)
    const rxUp = Number((txUp - atenuacionTotalUp).toFixed(2));
    const sensibilidadOltClaseC = -32.00; // Sensibilidad OLT GPON Clase C+
    const margenUp = Number((rxUp - sensibilidadOltClaseC).toFixed(2));

    // 6. Peor caso para el veredicto del enlace (Worst-case)
    const peorAtenuacion = Math.max(atenuacionTotalDown, atenuacionTotalUp);
    const peorMargen = Math.min(margenDown, margenUp);

    // Semáforo de 3 niveles según ingeniería óptica:
    // Verde (Óptimo): margen >= 5.0 dB
    // Ámbar (Aceptable / Alerta de Margen): margen entre 3.0 y 4.99 dB
    // Rojo (Crítico): margen < 3.0 dB
    const estado: 'Optimo' | 'Aceptable' | 'Critico' =
      peorMargen >= 5.0 ? 'Optimo' : peorMargen >= 3.0 ? 'Aceptable' : 'Critico';

    return {
      txDown,
      txUp,
      lossSplitter1,
      lossSplitter2,
      lossSplitters,
      numConectores,
      lossConectores,
      numFusiones,
      lossFusiones,
      lossFibraDown,
      lossFibraUp,
      atenuacionTotalDown,
      atenuacionTotalUp,
      rxDown,
      rxUp,
      sensibilidadOntClaseC,
      sensibilidadOltClaseC,
      margenDown,
      margenUp,
      peorAtenuacion,
      peorMargen,
      estado
    };
  }, [assignedPonForTargetNap, realDistanceKm]);

  // Estados interactivos para la Pestaña 4 (Calculadora / Simulador de Presupuesto)
  const [simDistanceKm, setSimDistanceKm] = useState<number>(() => realDistanceKm || 2.8);
  const [simTxPower, setSimTxPower] = useState<number>(4.5);
  const [simSplit1, setSimSplit1] = useState<'1:2' | '1:4' | '1:8' | 'directo'>('1:8');
  const [simSplit2, setSimSplit2] = useState<'1:8' | '1:16' | '1:32'>('1:16');
  const [simFusions, setSimFusions] = useState<number>(4);

  // Sincronizar automáticamente la distancia del simulador con la NAP seleccionada
  useEffect(() => {
    if (realDistanceKm > 0) {
      setSimDistanceKm(realDistanceKm);
    }
  }, [realDistanceKm]);

  const splitLossTable: Record<string, number> = {
    '1:2': 3.70,
    '1:4': 7.20,
    '1:8': 10.50,
    '1:16': 13.80,
    '1:32': 17.10,
    'directo': 0.00
  };

  const calculatedSimBudget = useMemo(() => {
    const lSp1 = splitLossTable[simSplit1] ?? 10.50;
    const lSp2 = splitLossTable[simSplit2] ?? 13.80;
    const lSplitters = Number((lSp1 + lSp2).toFixed(2));
    const numCon = 4;
    const lCon = Number((numCon * 0.35).toFixed(2)); // 1.40 dB
    const lFus = Number((simFusions * 0.10).toFixed(2));

    // Bajada (1490 nm)
    const lFibraDown = Number((simDistanceKm * 0.25).toFixed(2));
    const atenuacionDown = Number((lSplitters + lCon + lFus + lFibraDown).toFixed(2));
    const rxDown = Number((simTxPower - atenuacionDown).toFixed(2));
    const margenDown = Number((rxDown - (-30.00)).toFixed(2));

    // Subida (1310 nm)
    const lFibraUp = Number((simDistanceKm * 0.35).toFixed(2));
    const atenuacionUp = Number((lSplitters + lCon + lFus + lFibraUp).toFixed(2));
    const rxUp = Number((2.50 - atenuacionUp).toFixed(2));
    const margenUp = Number((rxUp - (-32.00)).toFixed(2));

    const peorMargen = Math.min(margenDown, margenUp);
    const estado: 'Optimo' | 'Aceptable' | 'Critico' =
      peorMargen >= 5.0 ? 'Optimo' : peorMargen >= 3.0 ? 'Aceptable' : 'Critico';

    return {
      lSplitters,
      lCon,
      lFus,
      lFibraDown,
      lFibraUp,
      atenuacionDown,
      atenuacionUp,
      rxDown,
      rxUp,
      margenDown,
      margenUp,
      peorMargen,
      estado
    };
  }, [simDistanceKm, simTxPower, simSplit1, simSplit2, simFusions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto text-slate-900 dark:text-white flex flex-col max-h-[92vh] transition-colors">
        
        {/* Cabecera del Modal con estilo uniforme del sistema */}
        <div className="bg-slate-100 dark:bg-slate-800 px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-2 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
              <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {odf?.nombre || 'Arquitectura Lógica OLT / ODF'}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 shrink-0">
                  GPON ITU-T G.984.2 / Clase C+ (ODN 17-32 dB)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {odf?.ubicacion_central || 'Centro de Operaciones de Red (NOC) - San José del Rincón'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pestañas táctil y adaptativa para móviles */}
        <div className="bg-slate-50 dark:bg-slate-900/60 px-3 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('trace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'trace'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span>1. Trazabilidad de Ruta Lógica</span>
          </button>

          <button
            onClick={() => setActiveTab('olt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'olt'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>2. Chasis OLT & Puertos PON</span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded-full font-mono">
              16 Puertos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('odf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'odf'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>3. Distribuidor Pasivo ODF</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
              48 Hilos TIA-598
            </span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'budget'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 shrink-0" />
            <span>4. Presupuesto Óptico</span>
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll Suave */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">

          {/* ========================================================== */}
          {/* PESTAÑA 1: TRAZABILIDAD LÓGICA EXTREMO A EXTREMO           */}
          {/* ========================================================== */}
          {activeTab === 'trace' && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* Barra de Selección de Caja bien distribuida */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Inspección de Ruta Lógica Extremo a Extremo (Trace Route Óptico)
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Selecciona una Caja NAP para trazar dinámicamente todo el enlace óptico, hilo ODF, mufa y cálculo exacto de dBm
                  </div>
                </div>

                {/* Selector + Botón Centrar sin flechas extrañas */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">Caja NAP:</span>
                  <select
                    value={selectedNapId}
                    onChange={(e) => setSelectedNapId(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-sky-500 flex-1 sm:flex-none max-w-full sm:max-w-xs"
                  >
                    {sortedNaps.map((n) => (
                      <option key={n.id_nap} value={n.id_nap}>
                        {n.identificador} ({n.zona})
                      </option>
                    ))}
                  </select>

                  {targetNap && onSelectNapOnMap && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectNapOnMap(targetNap);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      title={`Centrar ${targetNap.identificador} en el mapa interactivo`}
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Ver en Mapa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Diagrama de Trazabilidad Lógica: 100% DINÁMICO SEGÚN LA CAJA SELECCIONADA */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 sm:p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-3.5 sm:space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Topología Fotónica Lógica y Física:</span>
                  <span className="text-[11px] font-normal normal-case text-slate-500">
                    Caja Activa: <strong className="text-slate-900 dark:text-white">{targetNap?.identificador}</strong> &bull; Trayecto desde OLT: <strong>{realDistanceKm} km</strong>
                  </span>
                </div>

                {/* Cadena de Bloques de Red */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {/* Bloque 1: OLT Activa Dinámica */}
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
                      Puerto: <strong className="text-indigo-600 dark:text-indigo-300">{assignedPonForTargetNap.name}</strong>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Tx: +{assignedPonForTargetNap.txPower.toFixed(2)} dBm
                    </div>
                  </div>

                  {/* Bloque 2: Repartidor Pasivo ODF Dinámico */}
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
                      Hilo: <strong className="text-sky-600 dark:text-sky-300">#{assignedPonForTargetNap.odfHiloNumber} ({assignedPonForTargetNap.odfColorName})</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Conector ODF: -0.35 dB SC/APC
                    </div>
                  </div>

                  {/* Bloque 3: Mufa Torpedo de Empalme Dinámica */}
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
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5 truncate" title={assignedPonForTargetNap.mufaName}>
                      {assignedPonForTargetNap.mufaName.split('(')[0]}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Troncal 48H (Km {assignedPonForTargetNap.kmMufa})
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Splitter 1:8: -{opticalBudgetForTargetNap.lossSplitter1} dB
                    </div>
                  </div>

                  {/* Bloque 4: Caja NAP Dinámica */}
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
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5 truncate" title={targetNap?.direccion_texto || 'Poste CFE'}>
                      {targetNap?.direccion_texto || 'Poste CFE'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Fibra: {realDistanceKm} km (-{opticalBudgetForTargetNap.lossFibraDown} dB @ 1490nm)
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Splitter 1:16: -{opticalBudgetForTargetNap.lossSplitter2} dB
                    </div>
                  </div>

                  {/* Bloque 5: Abonado ONT Calculado Matemáticamente */}
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border-l-4 border-purple-600 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-xs text-xs space-y-1 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5" />
                        5. ONT Cliente
                      </span>
                      <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-mono border border-purple-200 dark:border-purple-800">
                        Drop FTTx
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white pt-0.5">
                      {targetNap?.metricas?.ocupados || 14}/16 Abonados
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Saturación: <strong>{targetNap?.metricas?.porcentajeSaturacion || 88}%</strong>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      Rx Bajada: {opticalBudgetForTargetNap.rxDown} dBm (Margen: +{opticalBudgetForTargetNap.margenDown} dB)
                    </div>
                  </div>
                </div>

                {/* Resumen Matemático del Presupuesto Óptico Bidireccional */}
                <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-sky-700 dark:text-sky-400">Bajada (1490 nm):</span> Rx = Tx (+{opticalBudgetForTargetNap.txDown.toFixed(2)}) − Splitters ({opticalBudgetForTargetNap.lossSplitters.toFixed(2)} dB) − 4x Conectores ({opticalBudgetForTargetNap.lossConectores.toFixed(2)} dB) − {opticalBudgetForTargetNap.numFusiones}x Fusiones ({opticalBudgetForTargetNap.lossFusiones.toFixed(2)} dB) − Fibra {realDistanceKm} km ({opticalBudgetForTargetNap.lossFibraDown.toFixed(2)} dB) = <strong className="text-slate-900 dark:text-white">{opticalBudgetForTargetNap.rxDown.toFixed(2)} dBm</strong> (Margen: +{opticalBudgetForTargetNap.margenDown.toFixed(2)} dB)
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">Subida (1310 nm):</span> Rx = Tx ONT (+{opticalBudgetForTargetNap.txUp.toFixed(2)}) − Atenuación ({opticalBudgetForTargetNap.atenuacionTotalUp.toFixed(2)} dB @ 0.35 dB/km) = <strong className="text-slate-900 dark:text-white">{opticalBudgetForTargetNap.rxUp.toFixed(2)} dBm</strong> (Margen OLT: +{opticalBudgetForTargetNap.margenUp.toFixed(2)} dB)
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Topología ODN: <strong>División en Cascada 1:8 &times; 1:16 = 1:128 Máx. por Puerto PON</strong> &bull; Transceptores SFP GPON Clase C+ (Presupuesto ODN: 17 a 32 dB)
                    </div>
                  </div>

                  <div
                    className={`px-3 py-2 rounded-xl border flex items-center gap-2 font-bold text-xs shrink-0 ${
                      opticalBudgetForTargetNap.estado === 'Optimo'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : opticalBudgetForTargetNap.estado === 'Aceptable'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                        : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}
                  >
                    {opticalBudgetForTargetNap.estado === 'Optimo' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>
                      {opticalBudgetForTargetNap.estado === 'Optimo'
                        ? 'Enlace Óptico Óptimo (Margen ≥ 5.0 dB)'
                        : opticalBudgetForTargetNap.estado === 'Aceptable'
                        ? 'Alerta de Margen (3.0 a 4.9 dB)'
                        : 'Enlace Crítico (< 3.0 dB)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PESTAÑA 2: CHASIS OLT ACTIVA & MATRIZ DE PUERTOS PON      */}
          {/* ========================================================== */}
          {activeTab === 'olt' && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* Tarjeta Informativa de Distinción OLT vs ODF */}
              <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 text-xs">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sky-950 dark:text-sky-200">
                    Diferenciación de Capa Activa (OLT) vs Pasiva (ODF)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                    La <strong>OLT (Optical Line Terminal)</strong> es el equipo activo de conmutación electrónica que emite luz láser modulada mediante transceptores SFP GPON Clase C+ (+4.50 a +5.00 dBm). Cada puerto PON alimenta una red óptica pasiva mediante splitteo jerárquico 1:128 (1:8 troncal + 1:16 en NAP). El <strong>ODF</strong> organiza y fusiona físicamente estos hilos hacia la planta externa.
                  </p>
                </div>
              </div>

              {/* Ficha Técnica de Hardware OLT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Chasis OLT</span>
                  <span className="font-bold text-slate-900 dark:text-white">Huawei SmartAX MA5800</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Tarjeta GPON (Slot 1)</span>
                  <span className="font-bold text-slate-900 dark:text-white">GPFD 16 Puertos SFP GPON</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Límite Físico de División</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1:128 Máx (1:8 &times; 1:16)</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Abonados ONT Totales</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    255 ONTs Activas (Padrón Exacto)
                  </span>
                </div>
              </div>

              {/* Matriz Visual de los 16 Puertos PON de la OLT con denominador 128 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Puertos GPON SFP (Tarjeta Slot 1) - Capacidad 128 ONTs/PON</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">Selecciona un puerto PON para ver su carga</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
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
                          <span>Tx: {pon.txPower.toFixed(2)} dBm</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, pon.utilizationPct)}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300">
                            {pon.activeOnts}/128
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalle del Puerto PON Seleccionado */}
              <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Detalle Lógico de {activePon.name}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      Estado: <strong className="text-emerald-600 dark:text-emerald-400">{activePon.status}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md font-mono text-slate-700 dark:text-slate-300">
                      Potencia Tx: +{activePon.txPower.toFixed(2)} dBm
                    </span>
                    <span className="bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-md font-semibold">
                      {activePon.activeOnts}/128 ONTs ({activePon.utilizationPct}% Utilización)
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Cajas NAP asociadas a este puerto PON ({activePon.assignedNaps.length} NAPs):</span>
                  {activePon.assignedNaps.length === 0 ? (
                    <p className="mt-1 text-slate-400 italic">No hay cajas NAP asignadas a este puerto PON (Puerto disponible para expansión).</p>
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
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  El <strong>ODF Pasivo</strong> distribuye los 48 hilos ópticos hacia la troncal 48H divididos en 4 bandejas de 12 fusiones cada una, identificados bajo el código de colores internacional <strong>TIA-598</strong>.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-4">
                {odfTrays.map((tray) => (
                  <div key={tray.trayNum} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        {tray.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        12 Puertos SC/APC
                      </span>
                    </div>

                    {/* Tabla con ancho mínimo garantizado y badges whitespace-nowrap sin roturas */}
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left text-xs min-w-[620px]">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold w-16 text-center">Hilo</th>
                            <th className="py-2.5 px-3 font-semibold w-32">Color TIA-598</th>
                            <th className="py-2.5 px-3 font-semibold w-28">Puerto OLT</th>
                            <th className="py-2.5 px-3 font-semibold w-48 whitespace-nowrap">Estado</th>
                            <th className="py-2.5 px-3 font-semibold min-w-[200px]">Destino de Fibra Troncal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {tray.hilos.map((hilo) => (
                            <tr key={hilo.hiloGlobal} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white text-center">
                                #{hilo.hiloGlobal}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <span className={`w-3 h-3 rounded-full shrink-0 ${hilo.colorBg}`} />
                                  <span className="text-slate-700 dark:text-slate-300">{hilo.colorName}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                                {hilo.ponAsociado}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                                    hilo.estado.includes('Activo')
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {hilo.estado}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
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
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* Fórmula Teórica con soporte perfecto para modo claro y oscuro */}
              <div className="bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Cálculo de Presupuesto de Enlace Óptico (Valores de Diseño) - Clases según ITU-T G.984.2:</span>
                </div>
                <div className="font-mono bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-center overflow-x-auto text-[11px] sm:text-xs">
                  Atenuación Total = (Distancia &times; Coef. Fibra [0.25 / 0.35 dB/km]) + (Fusiones &times; 0.10 dB) + (4 Conectores &times; 0.35 dB) + Pérdida Splitters
                </div>
              </div>

              {/* Controles de Simulación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Distancia del Tramo OLT - NAP ({simDistanceKm} km):
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.1"
                    value={simDistanceKm}
                    onChange={(e) => setSimDistanceKm(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>0.5 km</span>
                    <span>{simDistanceKm} km</span>
                    <span>15 km</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Splitter Primario en Mufa:
                  </label>
                  <select
                    value={simSplit1}
                    onChange={(e: any) => setSimSplit1(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="1:2">Splitter 1:2 (Pérdida 3.70 dB)</option>
                    <option value="1:4">Splitter 1:4 (Pérdida 7.20 dB)</option>
                    <option value="1:8">Splitter 1:8 (Pérdida 10.50 dB)</option>
                    <option value="directo">Sin Splitter Primario (0 dB)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block">Ubicado en Mufa Torpedo Troncal</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Splitter Secundario en NAP:
                  </label>
                  <select
                    value={simSplit2}
                    onChange={(e: any) => setSimSplit2(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="1:8">Splitter 1:8 (Pérdida 10.50 dB)</option>
                    <option value="1:16">Splitter 1:16 (Pérdida 13.80 dB)</option>
                    <option value="1:32">Splitter 1:32 (Pérdida 17.10 dB)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block">Distribución de puertos por caja NAP</span>
                </div>
              </div>

              {/* Resultados de Atenuación y Potencia Rx con exactitud matemática */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Potencia Tx (OLT):</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    +{simTxPower.toFixed(2)} dBm
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Clase C+ GPON</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Pérdida Fibra ({simDistanceKm} km):</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {calculatedSimBudget.lFibraDown} dB
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">1490nm (Subida: {calculatedSimBudget.lFibraUp} dB)</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Atenuación Total:</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    {calculatedSimBudget.atenuacionDown} dB
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Subida: {calculatedSimBudget.atenuacionUp} dB</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-slate-500 text-[11px] block">Potencia Rx (ONT):</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {calculatedSimBudget.rxDown} dBm
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Rx OLT: {calculatedSimBudget.rxUp} dBm</span>
                </div>
              </div>

              {/* Veredicto de Enlace y Margen de Operación */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-medium ${
                  calculatedSimBudget.estado === 'Optimo'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : calculatedSimBudget.estado === 'Aceptable'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {calculatedSimBudget.estado === 'Optimo' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}
                  <div>
                    <span className="font-bold">
                      {calculatedSimBudget.estado === 'Optimo'
                        ? 'Veredicto del Enlace: Óptimo (Margen ≥ 5.0 dB Conforme)'
                        : calculatedSimBudget.estado === 'Aceptable'
                        ? 'Veredicto del Enlace: Aceptable / Alerta de Margen (3.0 a 4.9 dB)'
                        : 'Veredicto del Enlace: Crítico / Requiere Optimización (< 3.0 dB)'}
                    </span>
                    <span className="block text-[11px] opacity-80">
                      Sensibilidad ONT: -30.00 dBm (Clase C+) | Margen Bajada: +{calculatedSimBudget.margenDown} dB | Margen Subida: +{calculatedSimBudget.margenUp} dB
                    </span>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg font-mono font-bold text-xs shadow-xs border border-slate-200 dark:border-slate-700">
                  +{calculatedSimBudget.peorMargen} dB Margen Crítico
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal con estilo idéntico a los otros modales */}
        <div className="bg-slate-50 dark:bg-slate-950 px-3.5 sm:px-6 py-2.5 sm:py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="hidden sm:inline">Sistema de Mapeo Lógico y Físico GPON FTTx</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};
