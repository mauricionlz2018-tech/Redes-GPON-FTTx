import React, { useState, useMemo } from 'react';
import {
  X,
  Server,
  Layers,
  Cpu,
  Activity,
  Zap,
  GitBranch,
  Network,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sliders,
  Gauge,
  Box,
  Radio,
  FileText,
  Info
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
  const [activeTab, setActiveTab] = useState<'olt' | 'odf' | 'trace' | 'budget'>('olt');
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
      const ponId = `pon-${portNum}`;
      // NAPs asignadas a este puerto PON (repartidas equitativamente entre los primeros 4 puertos principales)
      const assignedNaps = naps.filter((n, nIdx) => {
        if (n.id_puerto_pon) {
          return n.id_puerto_pon.toLowerCase().includes(`pon-${portNum}`) || n.id_puerto_pon.toLowerCase().includes(`pon_${portNum}`);
        }
        return nIdx % 4 === idx;
      });

      const totalActiveOnts = assignedNaps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
      const totalNapCapacity = assignedNaps.length * 16;
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto text-slate-900 dark:text-white flex flex-col max-h-[92vh]">
        
        {/* Cabecera Técnica del Nodo Central NOC */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-4 sm:px-6 py-4 border-b border-sky-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-400/30 shadow-inner">
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-sky-500 text-slate-950 px-2 py-0.5 rounded font-black tracking-wider">
                  Cabecera NOC Activa
                </span>
                <span className="text-xs text-sky-300 font-medium hidden sm:inline">
                  Estándar GPON ITU-T G.984.2 / Clase B+
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {odf?.nombre || 'OLT & ODF Central San José del Rincón'}
              </h2>
              <p className="text-xs text-slate-300 truncate max-w-md">
                {odf?.ubicacion_central || 'Centro de Operaciones de Red NOC - San José del Rincón'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pestañas de Arquitectura Lógica */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 sm:px-6 pt-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('olt')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'olt'
                ? 'border-sky-500 bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>1. OLT Activa & Puertos PON</span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-full font-mono">
              16 Puertos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('odf')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'odf'
                ? 'border-sky-500 bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Distribuidor Pasivo ODF</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              48 Hilos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trace')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'trace'
                ? 'border-sky-500 bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>3. Trazabilidad Extremo a Extremo</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'budget'
                ? 'border-sky-500 bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>4. Presupuesto Óptico (Power Budget)</span>
          </button>
        </div>

        {/* Cuerpo del Modal con Contenido por Pestaña */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================== */}
          {/* PESTAÑA 1: CHASIS OLT ACTIVA & MATRIZ DE PUERTOS PON      */}
          {/* ========================================================== */}
          {activeTab === 'olt' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Tarjeta Informativa de Distinción OLT vs ODF */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-xl p-3.5 flex items-start gap-3 text-xs">
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
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Chasis OLT</span>
                  <span className="font-bold text-slate-900 dark:text-white">Huawei SmartAX MA5800</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Tarjeta GPON (Slot 1)</span>
                  <span className="font-bold text-slate-900 dark:text-white">GPFD 16 Puertos SFP+</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Ratio de Splitteo Global</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1:64 (Máx. 1:128)</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Abonados ONT Totales</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {naps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0)} ONTs Activas
                  </span>
                </div>
              </div>

              {/* Matriz Visual de los 16 Puertos PON de la OLT */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-sky-500" />
                    <span>Puertos GPON SFP+ (Tarjeta Slot 1)</span>
                  </h3>
                  <span className="text-xs text-slate-500">Haz clic en un puerto PON para ver su carga lógica</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                  {ponPortsData.map((pon, idx) => {
                    const isSelected = idx === selectedPonIndex;
                    return (
                      <button
                        key={pon.name}
                        onClick={() => setSelectedPonIndex(idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500 shadow-md'
                            : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                            {pon.name}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pon.status === 'En Servicio' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
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

              {/* Detalle Lógico del Puerto PON Seleccionado */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-sky-600 text-white font-mono font-black text-xs rounded-lg">
                      {activePon.name}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Topología de Distribución GPON
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {activePon.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4">
                    <span>Potencia Emisor: <strong>+{activePon.txPower} dBm</strong></span>
                    <span>Capacidad Lógica: <strong>{activePon.activeOnts} / 64 ONTs ({activePon.utilizationPct}%)</strong></span>
                    <span>Hilos ODF: <strong>Hilos #{activePon.hilosAsignados.join(', #')}</strong></span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Cajas NAP Alimentadas por este Puerto PON ({activePon.assignedNaps.length} NAPs):
                  </div>

                  {activePon.assignedNaps.length === 0 ? (
                    <div className="text-xs text-slate-500 italic p-3 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
                      Este puerto PON está en reserva técnica. Aún no tiene Cajas NAP conectadas en planta externa.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {activePon.assignedNaps.map((nap) => {
                        const ocupados = nap.metricas?.ocupados || 0;
                        const pct = Math.round((ocupados / 16) * 100);
                        return (
                          <div
                            key={nap.id_nap}
                            className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Box className="w-3.5 h-3.5 text-emerald-600" />
                                {nap.identificador}
                              </span>
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold">
                                {ocupados}/16 ({pct}%)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Zona: {nap.zona}
                            </div>
                            {onSelectNapOnMap && (
                              <button
                                onClick={() => {
                                  onSelectNapOnMap(nap);
                                  onClose();
                                }}
                                className="w-full mt-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Localizar en Mapa</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PESTAÑA 2: DISTRIBUIDOR ÓPTICO PASIVO ODF (48 HILOS)      */}
          {/* ========================================================== */}
          {activeTab === 'odf' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs">
                <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Distribuidor de Fibra Óptica (ODF) de 48 Hilos - Código TIA-598
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    El bastidor ODF recibe los cables troncales de 48 hilos procedentes de planta externa y los distribuye en 4 bandejas de 12 fusiones térmicas cada una. Los puertos frontales utilizan adaptadores SC/APC (pérdida típica &lt; 0.2 dB) para conexión con los patchcords de la OLT.
                  </p>
                </div>
              </div>

              {/* 4 Bandejas de 12 Hilos */}
              <div className="space-y-4">
                {odfTrays.map((tray) => (
                  <div
                    key={tray.name}
                    className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
                  >
                    <div className="bg-slate-100 dark:bg-slate-700/60 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                        {tray.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">12 Hilos Monomodo G.652D</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                            <th className="py-2 px-3 font-semibold w-16">Hilo</th>
                            <th className="py-2 px-3 font-semibold w-24">Código TIA</th>
                            <th className="py-2 px-3 font-semibold w-28">Puerto OLT</th>
                            <th className="py-2 px-3 font-semibold w-36">Estado</th>
                            <th className="py-2 px-3 font-semibold">Destino de Fibra Troncal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                          {tray.hilos.map((hilo) => (
                            <tr key={hilo.hiloGlobal} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                #{hilo.hiloGlobal}
                              </td>
                              <td className="py-2 px-3">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <span className={`w-3 h-3 rounded-full shrink-0 ${hilo.colorBg}`} />
                                  <span>{hilo.colorName}</span>
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                                {hilo.ponAsociado}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    hilo.estado.includes('Activo')
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
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
          {/* PESTAÑA 3: TRAZABILIDAD LÓGICA EXTREMO A EXTREMO           */}
          {/* ========================================================== */}
          {activeTab === 'trace' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Inspección de Ruta Lógica Extremo a Extremo (Trace Route Óptico)
                  </div>
                  <div className="text-xs text-slate-500">
                    Selecciona una Caja NAP para trazar todo el trayecto desde el emisor láser de la OLT hasta el abonado
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Caja NAP:</span>
                  <select
                    value={selectedNapId}
                    onChange={(e) => setSelectedNapId(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-sky-500"
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
              <div className="relative border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/60 shadow-sm space-y-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Topología Física & Lógica del Enlace Óptico:
                </div>

                {/* Cadena de Bloques de Red */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                  {/* Bloque 1: OLT Activa */}
                  <div className="p-3.5 rounded-xl border-2 border-indigo-500/50 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs space-y-1 relative">
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        1. OLT Activa
                      </span>
                      <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 px-1.5 py-0.2 rounded font-mono">
                        NOC
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Huawei MA5800</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Puerto: <strong>PON 1/1/1</strong>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Tx: +4.80 dBm
                    </div>
                  </div>

                  {/* Bloque 2: Repartidor Pasivo ODF */}
                  <div className="p-3.5 rounded-xl border-2 border-sky-500/50 bg-sky-50/60 dark:bg-sky-950/40 text-xs space-y-1 relative">
                    <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        2. ODF Central
                      </span>
                      <span className="text-[10px] bg-sky-200 dark:bg-sky-900 px-1.5 py-0.2 rounded font-mono">
                        Pasivo
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Bandeja #1</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Hilo: <strong>#1 (Azul TIA-598)</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Atenuación: 0.35 dB
                    </div>
                  </div>

                  {/* Bloque 3: Mufa Torpedo de Empalme */}
                  <div className="p-3.5 rounded-xl border-2 border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/40 text-xs space-y-1 relative">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4" />
                        3. Mufa Torpedo 01
                      </span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.2 rounded font-mono">
                        1:8 Split
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Troncal 48H</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Splitter 1:8 Primario
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                      Pérdida Splitter: 10.5 dB
                    </div>
                  </div>

                  {/* Bloque 4: Caja NAP */}
                  <div className="p-3.5 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/40 text-xs space-y-1 relative">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Box className="w-4 h-4" />
                        4. {targetNap?.identificador || 'Caja NAP'}
                      </span>
                      <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.2 rounded font-mono">
                        1:16 Split
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Poste CFE</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Splitter 1:16 Secundario
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Pérdida Splitter: 13.8 dB
                    </div>
                  </div>

                  {/* Bloque 5: Abonado ONT */}
                  <div className="p-3.5 rounded-xl border-2 border-purple-500/50 bg-purple-50/60 dark:bg-purple-950/40 text-xs space-y-1 relative">
                    <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-4 h-4" />
                        5. ONT Cliente
                      </span>
                      <span className="text-[10px] bg-purple-200 dark:bg-purple-900 px-1.5 py-0.2 rounded font-mono">
                        Drop FTTx
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Cable Drop 1H</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Puerto NAP #1 a #16
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Rx: -19.4 dBm (Óptimo)
                    </div>
                  </div>
                </div>

                {/* Resumen del Factor Total de División */}
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <span>Factor de División Total en Cascada: <strong>1:8 × 1:16 = 1:128 Máx (Operando a 1:64)</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Enlace Óptico Sincronizado sin Saturación
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* PESTAÑA 4: CALCULADORA DE PRESUPUESTO ÓPTICO              */}
          {/* ========================================================== */}
          {activeTab === 'budget' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Fórmula Teórica */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 text-xs space-y-2">
                <div className="font-mono text-sky-400 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Fórmula Oficial de Presupuesto Óptico (ITU-T G.984.2):</span>
                </div>
                <div className="font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200 text-center overflow-x-auto text-[13px]">
                  Atenuación Total = (Distancia × α_fibra) + (Fusiones × 0.1 dB) + (Conectores × 0.35 dB) + Loss_Splitter1 + Loss_Splitter2
                </div>
              </div>

              {/* Controles de Simulación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
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
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>0.5 km (Zona Urbana)</span>
                    <span>15 km (Troncal Larga)</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Splitters en Cascada (1er y 2do Nivel):
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Mufa (1er Nivel):</span>
                      <select
                        value={budgetSplit1}
                        onChange={(e) => setBudgetSplit1(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-bold"
                      >
                        <option value="1:2">1:2 (3.6 dB)</option>
                        <option value="1:4">1:4 (7.2 dB)</option>
                        <option value="1:8">1:8 (10.5 dB)</option>
                        <option value="directo">Directo (0 dB)</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">NAP (2do Nivel):</span>
                      <select
                        value={budgetSplit2}
                        onChange={(e) => setBudgetSplit2(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-bold"
                      >
                        <option value="1:8">1:8 (10.5 dB)</option>
                        <option value="1:16">1:16 (13.8 dB)</option>
                        <option value="1:32">1:32 (17.1 dB)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Potencia Emisor SFP+ OLT ({budgetTxPower} dBm):
                  </label>
                  <input
                    type="range"
                    min="1.5"
                    max="6.0"
                    step="0.1"
                    value={budgetTxPower}
                    onChange={(e) => setBudgetTxPower(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>+1.5 dBm (Clase B+)</span>
                    <span>+6.0 dBm (Clase C+)</span>
                  </div>
                </div>
              </div>

              {/* Resultados del Cálculo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Pérdida por Fibra (0.25 dB/km)</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {calculatedBudget.perdidaFibraDb} dB
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Pérdida por Splitters PLC</span>
                  <span className="text-base font-black text-amber-600">
                    {calculatedBudget.perdidaSplittersDb} dB
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Atenuación Total Teórica</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {calculatedBudget.atenuacionTotalTeoricaDb} dB
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">Potencia Rx Esperada en ONT</span>
                  <span
                    className={`text-base font-black ${
                      calculatedBudget.estadoEnlace === 'Optimo'
                        ? 'text-emerald-600'
                        : calculatedBudget.estadoEnlace === 'Aceptable'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {calculatedBudget.potenciaRxEsperadaDbm} dBm
                  </span>
                </div>
              </div>

              {/* Veredicto de Enlace y Margen de Operación */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
                  calculatedBudget.estadoEnlace === 'Optimo'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : calculatedBudget.estadoEnlace === 'Aceptable'
                    ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <span className="font-bold">Estado del Enlace: {calculatedBudget.estadoEnlace}</span>
                    <span className="block text-[11px] opacity-80">
                      Sensibilidad ONT: {calculatedBudget.sensibilidadMinimaDbm} dBm | Margen de Seguridad: +{calculatedBudget.margenOperativoDb} dB
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-white/80 dark:bg-black/30 rounded-lg font-mono font-bold text-xs">
                  Margen: +{calculatedBudget.margenOperativoDb} dB
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal */}
        <div className="bg-slate-100 dark:bg-slate-800 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Sistema de Mapeo Lógico y Físico GPON FTTx</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
