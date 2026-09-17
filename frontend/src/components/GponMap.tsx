import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NapBox, OdfPanel, FiberRoute, EmpalmeClosure } from '../types';
import { NapBox, OdfPanel, FiberRoute, EmpalmeClosure, GasaReserva, PosteInfraestructura } from '../types';
import {
  Network,
  Server,
  Radio,
  Compass,
  Navigation,
  X,
  GitCommit,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Map,
  Satellite,
  Car
  Car,
  Eye,
  Maximize2
} from 'lucide-react';
import { RouteResult, formatDistance, formatDuration } from '../services/routingService';
import { mockFiberRoutes, mockEmpalmes } from '../data/mockGponData';
import {
  mockFiberRoutes,
  mockEmpalmes,
  troncalIxtJocRoutes,
  troncalMufas,
  troncalGasas,
  troncalPostesPropuestos,
  troncalPostesCfe
} from '../data/mockGponData';
import {
  createSplitterTroncalIcon,
  createSplitterNapIcon,
  createNapStandardIcon,
  createMufaTorpedoIcon,
  createGasaReservaIcon,
  createPostePropuestoIcon,
  createPosteCfeIcon,
  createOdfStandardIcon,
  FIBER_DESIGN_COLORS
} from './standardFiberIcons';

interface GponMapProps {
  naps: NapBox[];
  odf: OdfPanel | null;
  selectedNap: NapBox | null;
  onSelectNap: (nap: NapBox) => void;
  onViewPorts?: (nap: NapBox) => void;
  onOpenGpsModal: (nap: NapBox) => void;
  activeRoute?: RouteResult | null;
  onRequestRoute?: (nap: NapBox) => void;
  onClearRoute?: () => void;
  fiberRoutes?: FiberRoute[];
  empalmes?: EmpalmeClosure[];
  gasas?: GasaReserva[];
  postesPropuestos?: PosteInfraestructura[];
  postesCfe?: PosteInfraestructura[];
  onDeleteNapRequest?: (nap: NapBox) => void;
  onOpenMileageCapture?: (nap: NapBox, distanceKm?: number) => void;
}

// Helper para calcular metros si una ruta no trae el valor calculado
function getRouteDistance(route: FiberRoute): { metros: number; km: number } {
  if (route.distancia_metros && route.distancia_km) {
    return { metros: route.distancia_metros, km: route.distancia_km };
  }
  const coords = route.coordenadas;
  if (!coords || coords.length < 2) return { metros: 0, km: 0 };
  let total = 0;
  const R = 6371000;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i];
    const [lat2, lon2] = coords[i + 1];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  const metros = Math.round(total * 10) / 10;
  return { metros, km: Number((metros / 1000).toFixed(2)) };
}

// Asignar color estándar de ingeniería si no tiene uno adecuado
function getRouteStandardColor(route: FiberRoute): string {
  if (route.color && route.color !== '#38bdf8' && route.color !== '#0284c7') {
    return route.color;
  }
  const st = (route.subtipo || '').toLowerCase();
  const cap = route.hilos || 0;
  if (cap === 96 || st.includes('96')) return FIBER_DESIGN_COLORS.fibraTroncal96H;
  if (cap === 48 || st.includes('48')) return FIBER_DESIGN_COLORS.fibraTroncal48H;
  if (cap === 12 && (st.includes('distribuc') || route.tipo === 'ramal')) return FIBER_DESIGN_COLORS.fibraDistribucion12H;
  if (cap === 12 || st.includes('12')) return FIBER_DESIGN_COLORS.fibraTroncal12H;
  if (cap === 24 || st.includes('24')) return FIBER_DESIGN_COLORS.fibra24H;
  return route.tipo === 'troncal' ? FIBER_DESIGN_COLORS.fibraTroncal48H : FIBER_DESIGN_COLORS.fibraDistribucion12H;
}

// Componente para ajustar dinámicamente el encuadre del mapa
const MapBoundsAdjuster: React.FC<{ coordinates?: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 1) {
      try {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true
        });
      } catch (e) {
        console.warn('No se pudo ajustar el encuadre a la ruta:', e);
      }
    }
  }, [coordinates, map]);

  return null;
};

// Generador de icono para el ODF Central
const createOdfIcon = () => {
  return L.divIcon({
    className: 'custom-odf-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 bg-sky-600 border-2 border-white rounded-xl shadow-lg text-white animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
// Controlador para centrar en una ubicación específica
const MapCenterController: React.FC<{ targetCenter?: [number, number] | null; zoom?: number }> = ({ targetCenter, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, zoom || 13, { duration: 1.2 });
    }
  }, [targetCenter, zoom, map]);
  return null;
};

// Generador de icono para Cierres de Empalme / Muffas
const createEmpalmeIcon = () => {
  return L.divIcon({
    className: 'custom-empalme-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 bg-amber-600 border-2 border-white rounded-lg shadow-md text-white hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="12" x="3" y="6" rx="2"/><path d="M7 12h10"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Generador de icono para Cajas NAP
const createNapIcon = (nap: NapBox, isSelected: boolean, isRouteDestination: boolean) => {
  const metricas = nap.metricas;
  const pct = metricas ? metricas.porcentajeSaturacion : 0;
  const ocupados = metricas ? metricas.ocupados : 0;
  const total = nap.total_puertos || 16;

  let bgColor = 'bg-emerald-500'; // Verde: <80%
  let borderColor = 'border-emerald-300';

  if (pct >= 100) {
    bgColor = 'bg-red-600'; // Rojo: saturada o dañada
    borderColor = 'border-red-400';
  } else if (pct >= 80) {
    bgColor = 'bg-amber-500'; // Amarillo: >=80%
    borderColor = 'border-amber-300';
  }

  let ringStyle = 'ring-2 ring-white/90 shadow-md';
  if (isRouteDestination) {
    ringStyle = 'ring-4 ring-indigo-500 scale-125 shadow-indigo-500/60 shadow-xl animate-bounce';
  } else if (isSelected) {
    ringStyle = 'ring-4 ring-sky-400 scale-110 shadow-sky-500/50 shadow-md';
  }

  return L.divIcon({
    className: 'custom-nap-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-200">
        <div class="w-8 h-8 rounded-full ${bgColor} border-2 ${borderColor} ${ringStyle} text-white flex items-center justify-center font-bold text-[11px]">
          ${ocupados}/${total}
        </div>
        <div class="w-2 h-2 ${bgColor} rotate-45 -mt-1 shadow-sm"></div>
        <div class="text-[10px] font-bold text-slate-900 bg-white/95 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 -mt-0.5 whitespace-nowrap">
          ${nap.identificador}
        </div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 36],
    popupAnchor: [0, -36]
  });
};

export const GponMap: React.FC<GponMapProps> = ({
  naps,
  odf,
  selectedNap,
  onSelectNap,
  onViewPorts,
  onOpenGpsModal,
  activeRoute,
  onRequestRoute,
  onClearRoute,
  fiberRoutes = mockFiberRoutes,
  empalmes = mockEmpalmes,
  fiberRoutes = [],
  empalmes = [],
  gasas = troncalGasas,
  postesPropuestos = troncalPostesPropuestos,
  postesCfe = troncalPostesCfe,
  onDeleteNapRequest,
  onOpenMileageCapture
}) => {
  // Centro por defecto: Cobertura de la red en San José del Rincón
  // Centro por defecto: Región Ixtlahuaca - Jiquipilco - San José del Rincón
  const defaultCenter: [number, number] = useMemo(() => {
    return [19.6980, -100.1120];
    return [19.6450, -99.8200];
  }, []);

  const odfIcon = useMemo(() => createOdfIcon(), []);
  const empalmeIcon = useMemo(() => createEmpalmeIcon(), []);
  const [isLegendOpen, setIsLegendOpen] = React.useState(true);
  const [targetFocus, setTargetFocus] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(12);

  // Estados de visibilidad de capas
  const [showFiberRoutes, setShowFiberRoutes] = useState(true);
  const [showEmpalmes, setShowEmpalmes] = useState(true);
  const [showGasas, setShowGasas] = useState(true);
  const [showPostesPropuestos, setShowPostesPropuestos] = useState(true);
  const [showPostesCfe, setShowPostesCfe] = useState(false); // Apagado por defecto para 800+ pines
  const [showNaps, setShowNaps] = useState(true);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Estado para alternar entre vista estándar de calles, satélite real e híbrido
  const [mapLayer, setMapLayer] = React.useState<'streets' | 'satellite' | 'hybrid'>(() => {
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'hybrid'>(() => {
    try {
      const saved = localStorage.getItem('gpon_map_layer');
      if (saved === 'satellite' || saved === 'hybrid' || saved === 'streets') return saved;
    } catch {}
    return 'streets';
  });

  const handleSelectMapLayer = (layer: 'streets' | 'satellite' | 'hybrid') => {
    setMapLayer(layer);
    try {
      localStorage.setItem('gpon_map_layer', layer);
    } catch {}
  };

  // Combinar rutas KMZ completas con cualquier ruta adicional
  const allRoutes = useMemo(() => {
    const combined = [...troncalIxtJocRoutes];
    // Agregar rutas recibidas por props que no estén ya en la lista
    fiberRoutes.forEach((fr) => {
      if (!combined.some((c) => c.id_ruta === fr.id_ruta)) {
        combined.push(fr);
      }
    });
    // Agregar también las rutas de San José si no están
    mockFiberRoutes.forEach((sr) => {
      if (!combined.some((c) => c.id_ruta === sr.id_ruta)) {
        combined.push(sr);
      }
    });
    return combined;
  }, [fiberRoutes]);

  // Combinar empalmes KMZ con empalmes adicionales
  const allEmpalmes = useMemo(() => {
    const combined = [...troncalMufas];
    empalmes.forEach((em) => {
      if (!combined.some((c) => c.id_empalme === em.id_empalme)) {
        combined.push(em);
      }
    });
    mockEmpalmes.forEach((me) => {
      if (!combined.some((c) => c.id_empalme === me.id_empalme)) {
        combined.push(me);
      }
    });
    return combined;
  }, [empalmes]);

  // Total de kilómetros y ML calculados
  const totalNetworkDistance = useMemo(() => {
    let totalMetros = 0;
    allRoutes.forEach((r) => {
      const { metros } = getRouteDistance(r);
      totalMetros += metros;
    });
    return {
      metros: Math.round(totalMetros),
      km: Number((totalMetros / 1000).toFixed(2))
    };
  }, [allRoutes]);

  const odfIcon = useMemo(() => createOdfStandardIcon(odf?.nombre), [odf?.nombre]);

  return (
    <div id="seccion-mapa-gpon" className="relative isolate w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors scroll-mt-24">
      {/* Selector flotante de Capas de Mapa: Calles vs Vista Satélite vs Híbrido */}
    <div
      id="seccion-mapa-gpon"
      className="relative isolate w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors scroll-mt-24"
    >
      {/* 1. Selector flotante de Capas Cartográficas: Calles vs Satélite vs Híbrido */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg flex items-center gap-1">
        <button
          onClick={() => handleSelectMapLayer('streets')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mapLayer === 'streets'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Vista de calles y cartografía base (OpenStreetMap)"
        >
          <Map className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Calles</span>
        </button>
        <button
          onClick={() => handleSelectMapLayer('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mapLayer === 'satellite'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Vista satelital real de alta resolución (Esri World Imagery)"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Satélite</span>
        </button>
        <button
          onClick={() => handleSelectMapLayer('hybrid')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mapLayer === 'hybrid'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Vista satelital con nombres de calles y referencias poblacionales"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Híbrido</span>
        </button>
      </div>

      {/* Banner flotante superior si hay una ruta vial activa */}
      {/* 2. Control Flotante de Filtros de Elementos de Red (Troncal, Mufas, Gasas, Postes) */}
      <div className="absolute top-3 left-3 z-[400]">
        {!isLayersMenuOpen ? (
          <button
            onClick={() => setIsLayersMenuOpen(true)}
            className="bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Abrir selector de capas de red de fibra"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Capas de Red</span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded-full font-mono">
              {totalNetworkDistance.km} km
            </span>
          </button>
        ) : (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 max-w-[260px] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                Capas de Planta Externa
              </span>
              <button
                onClick={() => setIsLayersMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
              {/* Rutas Troncales y Ramales */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showFiberRoutes}
                  onChange={(e) => setShowFiberRoutes(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="w-3 h-1 rounded bg-purple-700 shrink-0" />
                <span className="flex-1">Líneas Troncal ({allRoutes.length})</span>
              </label>

              {/* Mufas / Cierres de Empalme */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showEmpalmes}
                  onChange={(e) => setShowEmpalmes(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <GitCommit className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="flex-1">Mufas Torpedo ({allEmpalmes.length})</span>
              </label>

              {/* Gasas de Reserva */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showGasas}
                  onChange={(e) => setShowGasas(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-blue-600 shrink-0">∞</span>
                <span className="flex-1">Gasas de Reserva ({gasas.length})</span>
              </label>

              {/* Postes Propuestos (Rojos) */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showPostesPropuestos}
                  onChange={(e) => setShowPostesPropuestos(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span className="flex-1">Postes Propuestos ({postesPropuestos.length})</span>
              </label>

              {/* Postes CFE */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showPostesCfe}
                  onChange={(e) => setShowPostesCfe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0 text-[6px] text-white flex items-center justify-center font-bold">
                  +
                </span>
                <span className="flex-1">Postes CFE ({postesCfe.length})</span>
              </label>

              {/* Cajas NAP */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showNaps}
                  onChange={(e) => setShowNaps(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <Network className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="flex-1">Cajas NAP ({naps.length})</span>
              </label>
            </div>

            {/* Accesos rápidos de enfoque */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTargetFocus([19.6450, -99.8200]);
                  setTargetZoom(12);
                }}
                className="flex-1 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 py-1 px-1.5 rounded text-[10px] font-semibold text-center cursor-pointer"
              >
                Troncal IXT-JOC
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetFocus([19.6980, -100.1120]);
                  setTargetZoom(13);
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 py-1 px-1.5 rounded text-[10px] font-semibold text-center cursor-pointer"
              >
                San José NAPs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Banner flotante superior si hay una ruta vial activa */}
      {activeRoute && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-semibold">
          <Navigation className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            Ruta activa: {formatDistance(activeRoute.distanceMeters)} ({formatDuration(activeRoute.durationSeconds)})
          </span>
          {onClearRoute && (
            <button
              onClick={onClearRoute}
              className="ml-1 text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              title="Quitar ruta"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 4. MapContainer Principal */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapBoundsAdjuster coordinates={activeRoute?.coordinates} />
        <MapCenterController targetCenter={targetFocus} zoom={targetZoom} />

        {/* 1. Capa de Calles (OpenStreetMap) */}
        {mapLayer === 'streets' && (
          <TileLayer
            key="osm-streets"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* 2. Capa Satélite Real de Alta Definición (Esri World Imagery) */}
        {(mapLayer === 'satellite' || mapLayer === 'hybrid') && (
          <TileLayer
            key="esri-satellite"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {/* 3. Capa de Referencias y Nombres de Calles sobre Satélite (Modo Híbrido) */}
        {mapLayer === 'hybrid' && (
          <TileLayer
            key="esri-hybrid-labels"
            attribution='&copy; Esri References'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            opacity={0.9}
          />
        )}

        {/* 1. Trazado de Rutas Reales de Fibra Óptica (Troncales y Ramales del KMZ) */}
        {fiberRoutes.map((route) => (
          <Polyline
            key={`route-${route.id_ruta}`}
            positions={route.coordenadas}
            pathOptions={{
              color: route.color,
              weight: route.grosor,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Popup>
              <div className="p-1 max-w-[240px] text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                  <span>{route.nombre}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Tipo: <strong className="uppercase text-slate-700 dark:text-slate-200">{route.tipo}</strong>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Vértices de tendido: <strong>{route.vertices} puntos GPS</strong>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}
        {/* 5. Trazado de Rutas Reales de Fibra Óptica (KMZ IXT-JOC + Complementos) */}
        {showFiberRoutes &&
          allRoutes.map((route) => {
            const { metros, km } = getRouteDistance(route);
            const lineColor = getRouteStandardColor(route);
            const lineWeight = route.grosor || 4;

        {/* 2. Marcadores de Cierres de Empalme (Muffas) */}
        {empalmes.map((emp) => (
          <Marker
            key={emp.id_empalme}
            position={[emp.coordenadas_gps.lat, emp.coordenadas_gps.lng]}
            icon={empalmeIcon}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm mb-1">
                  <GitCommit className="w-4 h-4" />
                  <span>{emp.nombre}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">{emp.tipo_cierre}</p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-800/60">
                  GPS: <strong>{emp.coordenadas_gps.lat.toFixed(5)}, {emp.coordenadas_gps.lng.toFixed(5)}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
            return (
              <Polyline
                key={`route-${route.id_ruta}`}
                positions={route.coordenadas}
                pathOptions={{
                  color: lineColor,
                  weight: lineWeight,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                {/* Tooltip con Nombre y Distancia precisa de la línea */}
                <Tooltip sticky>
                  <div className="text-xs font-sans">
                    <strong className="block text-slate-900">{route.nombre}</strong>
                    <span className="text-indigo-600 font-bold">
                      {km} km ({metros.toLocaleString()} ML)
                    </span>
                    <span className="text-slate-500 block text-[10px]">{route.subtipo || route.tipo}</span>
                  </div>
                </Tooltip>

        {/* 3. Marcador del ODF Central en Cabecera */}
                <Popup>
                  <div className="p-1 max-w-[260px] text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lineColor }} />
                      <span className="text-sm">{route.nombre}</span>
                    </div>

                    {/* Métrica de Distancia destacada */}
                    <div className="bg-sky-50 dark:bg-sky-950/40 p-2 rounded-lg border border-sky-200 dark:border-sky-800 mb-2">
                      <div className="text-[10px] text-sky-800 dark:text-sky-300 font-semibold uppercase">
                        Longitud de Tendido:
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {km} Kilómetros
                      </div>
                      <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400">
                        {metros.toLocaleString()} Metros Lineales (ML)
                      </div>
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                      <div>
                        Norma / Subtipo: <strong className="text-slate-900 dark:text-white">{route.subtipo || 'Fibra Troncal'}</strong>
                      </div>
                      <div>
                        Capacidad: <strong>{route.hilos || 48} Hilos Ópticos</strong>
                      </div>
                      <div>
                        Vértices de Tendido: <strong>{route.vertices || route.coordenadas.length} puntos GPS</strong>
                      </div>
                      {route.origen && (
                        <div className="text-slate-500 text-[10px] truncate">
                          Tramo: {route.origen} &rarr; {route.destino}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* 6. Marcadores de Cierres de Empalme (Mufas Torpedo Estandarizadas) */}
        {showEmpalmes &&
          allEmpalmes.map((emp) => {
            const icon = createMufaTorpedoIcon(emp);
            return (
              <Marker
                key={emp.id_empalme}
                position={[emp.coordenadas_gps.lat, emp.coordenadas_gps.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-1 max-w-[240px]">
                    <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-sm mb-1">
                      <GitCommit className="w-4 h-4" />
                      <span>{emp.nombre}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mb-1">
                      {emp.tipo_cierre}
                    </p>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 mb-2">
                      <div>
                        Capacidad: <strong className="text-slate-800 dark:text-slate-200">{emp.capacidad_hilos || 48} Hilos</strong>
                      </div>
                      <div>
                        Estado: <strong className="text-emerald-600">{emp.estado || 'Operativa'}</strong>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-sky-50 dark:bg-sky-950/40 p-1.5 rounded border border-sky-200 dark:border-sky-800/60 font-mono">
                      GPS: {emp.coordenadas_gps.lat.toFixed(5)}, {emp.coordenadas_gps.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 7. Marcadores de Gasas de Reserva Técnica (∞) */}
        {showGasas &&
          gasas.map((gasa) => {
            const icon = createGasaReservaIcon(gasa);
            return (
              <Marker
                key={gasa.id_gasa}
                position={[gasa.coordenadas_gps.lat, gasa.coordenadas_gps.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-1 max-w-[220px]">
                    <div className="font-bold text-blue-600 text-sm mb-1 flex items-center gap-1.5">
                      <span className="text-base leading-none">∞</span>
                      <span>{gasa.nombre}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                      Longitud de Reserva: <strong className="text-blue-700 dark:text-blue-300">{gasa.longitud_metros} Metros</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">{gasa.tipo_cable || 'Cable Troncal'}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {gasa.coordenadas_gps.lat.toFixed(5)}, {gasa.coordenadas_gps.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 8. Marcadores de Postes Propuestos (Círculos Rojos Normalizados) */}
        {showPostesPropuestos &&
          postesPropuestos.map((poste) => {
            const icon = createPostePropuestoIcon(poste.codigo);
            return (
              <Marker
                key={poste.id_poste}
                position={[poste.coordenadas_gps.lat, poste.coordenadas_gps.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <div className="font-bold text-red-600 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                      <span>Poste Propuesto {poste.codigo}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Infraestructura Proyectada de Planta Externa
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {poste.coordenadas_gps.lat.toFixed(5)}, {poste.coordenadas_gps.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 9. Marcadores de Postes CFE (Opcional por rendimiento de 800+ puntos) */}
        {showPostesCfe &&
          postesCfe.map((poste) => {
            const icon = createPosteCfeIcon(poste.codigo);
            return (
              <Marker
                key={poste.id_poste}
                position={[poste.coordenadas_gps.lat, poste.coordenadas_gps.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 text-[6px] text-white flex items-center justify-center font-bold">
                        +
                      </span>
                      <span>Poste CFE {poste.codigo}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Poste de Concesión Eléctrica Existente
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {poste.coordenadas_gps.lat.toFixed(5)}, {poste.coordenadas_gps.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 10. Marcador del ODF Central en Cabecera */}
        {odf && odf.coordenadas_gps && (
          <Marker
            position={[odf.coordenadas_gps.lat, odf.coordenadas_gps.lng]}
            icon={odfIcon}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-sm mb-1">
                  <Server className="w-4 h-4" />
                  <span>{odf.nombre}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{odf.ubicacion_central}</p>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                  <span>Capacidad: </span>
                  <strong className="text-slate-900 dark:text-white">{odf.capacidad_hilos} Hilos de Fibra</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Trazado de Ruta Vial de Navegación (Modo Pruebas OSRM) */}
        {/* 11. Trazado de Ruta Vial de Navegación (Modo Pruebas OSRM) */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <>
            <Polyline
              key="route-outline"
              positions={activeRoute.coordinates}
              pathOptions={{
                color: '#1e1b4b',
                weight: 7,
                opacity: 0.75,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Polyline
              key="route-line"
              positions={activeRoute.coordinates}
              pathOptions={{
                color: '#6366f1',
                weight: 4.5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* 5. Marcadores de las 25 Cajas NAP Reales con semáforo cromático */}
        {naps.map((nap) => {
          if (!nap.coordenadas_gps) return null;
          const isSelected = selectedNap?.id_nap === nap.id_nap;
          const isRouteDestination = Boolean(activeRoute && selectedNap?.id_nap === nap.id_nap);
          const icon = createNapIcon(nap, isSelected, isRouteDestination);
          const m = nap.metricas;
          const pct = m ? m.porcentajeSaturacion : 0;
        {/* 12. Marcadores de Cajas NAP Normalizadas con Semáforo Cromático */}
        {showNaps &&
          naps.map((nap) => {
            if (!nap.coordenadas_gps) return null;
            const isSelected = selectedNap?.id_nap === nap.id_nap;
            const isRouteDestination = Boolean(activeRoute && selectedNap?.id_nap === nap.id_nap);
            const icon = createNapStandardIcon(nap, isSelected, isRouteDestination);
            const m = nap.metricas;
            const pct = m ? m.porcentajeSaturacion : 0;

          return (
            <Marker
              key={nap.id_nap}
              position={[nap.coordenadas_gps.lat, nap.coordenadas_gps.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectNap(nap)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px] text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                    <span className="font-bold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <Network className="w-3.5 h-3.5" />
                      {nap.identificador}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        pct >= 100
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30'
                          : pct >= 80
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                      }`}
                    >
                      {pct}% Ocupado
                    </span>
                  </div>
            return (
              <Marker
                key={nap.id_nap}
                position={[nap.coordenadas_gps.lat, nap.coordenadas_gps.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectNap(nap)
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[220px] text-slate-800 dark:text-slate-100">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                      <span className="font-bold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <Network className="w-3.5 h-3.5" />
                        {nap.identificador}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          pct >= 100
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30'
                            : pct >= 80
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                        }`}
                      >
                        {pct}% Ocupado
                      </span>
                    </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">{nap.zona}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{nap.direccion_texto}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">{nap.zona}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{nap.direccion_texto}</p>

                  {/* Barra de progreso de saturación */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                    {/* Barra de progreso de saturación */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] mb-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                    <div>
                      Libres: <strong className="text-emerald-600 dark:text-emerald-400">{m?.libres ?? 0}</strong>
                    <div className="grid grid-cols-2 gap-1 text-[11px] mb-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <div>
                        Libres: <strong className="text-emerald-600 dark:text-emerald-400">{m?.libres ?? 0}</strong>
                      </div>
                      <div>
                        Ocupados: <strong className="text-sky-600 dark:text-sky-400">{m?.ocupados ?? 0}</strong>
                      </div>
                    </div>
                    <div>
                      Ocupados: <strong className="text-sky-600 dark:text-sky-400">{m?.ocupados ?? 0}</strong>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-1.5">
                    {onRequestRoute && (
                    {/* Botones de acción */}
                    <div className="flex flex-col gap-1.5">
                      {onRequestRoute && (
                        <button
                          onClick={() => onRequestRoute(nap)}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Trazar Ruta de Llegada</span>
                        </button>
                      )}

                      <button
                        onClick={() => onRequestRoute(nap)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        onClick={() => {
                          onSelectNap(nap);
                          if (onViewPorts) {
                            onViewPorts(nap);
                          } else {
                            const panel = document.getElementById('panel-puertos-nap');
                            if (panel) {
                              panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Trazar Ruta de Llegada</span>
                        <Radio className="w-3.5 h-3.5" />
                        <span>Ver Panel de {nap.total_puertos || 16} Puertos</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectNap(nap);
                        if (onViewPorts) {
                          onViewPorts(nap);
                        } else {
                          const panel = document.getElementById('panel-puertos-nap');
                          if (panel) {
                            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Ver Panel de {nap.total_puertos || 16} Puertos</span>
                    </button>
                    <button
                      onClick={() => onOpenGpsModal(nap)}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>Calibrar GPS de Campo</span>
                    </button>

                    {onOpenMileageCapture && (
                      <button
                        onClick={() =>
                          onOpenMileageCapture(
                            nap,
                            activeRoute ? Number((activeRoute.distanceMeters / 1000).toFixed(1)) : undefined
                          )
                        }
                        className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                        title="Capturar y grabar kilometraje del técnico hacia esta caja"
                        onClick={() => onOpenGpsModal(nap)}
                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Grabar Kilometraje de Traslado</span>
                        <Compass className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Calibrar GPS de Campo</span>
                      </button>
                    )}

                    {onDeleteNapRequest && (
                      <button
                        onClick={() => onDeleteNapRequest(nap)}
                        className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-red-200 dark:border-red-800/60 cursor-pointer"
                        title="Eliminar o dar de baja esta caja NAP"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Caja NAP</span>
                      </button>
                    )}
                      {onOpenMileageCapture && (
                        <button
                          onClick={() =>
                            onOpenMileageCapture(
                              nap,
                              activeRoute ? Number((activeRoute.distanceMeters / 1000).toFixed(1)) : undefined
                            )
                          }
                          className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                          title="Capturar y grabar kilometraje del técnico hacia esta caja"
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>Grabar Kilometraje de Traslado</span>
                        </button>
                      )}

                      {onDeleteNapRequest && (
                        <button
                          onClick={() => onDeleteNapRequest(nap)}
                          className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-red-200 dark:border-red-800/60 cursor-pointer"
                          title="Eliminar o dar de baja esta caja NAP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar Caja NAP</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Leyenda del Mapa flotante en esquina - Plegable y contenida en el mapa */}
      {/* 13. Leyenda Plegable del Mapa en Esquina Inferior Izquierda */}
      {!isLegendOpen ? (
        <button
          onClick={() => setIsLegendOpen(true)}
          className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-md flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Mostrar leyenda de la red"
        >
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span>Leyenda</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      ) : (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-lg dark:shadow-xl max-w-[210px] transition-all">
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-lg dark:shadow-xl max-w-[220px] transition-all">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white">Topología GPON</span>
            <span className="font-semibold text-slate-900 dark:text-white">Simbología GPON/KMZ</span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimizar leyenda"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span>&lt; 80% Libre ({naps.filter(n => (n.metricas?.porcentajeSaturacion || 0) < 80).length})</span>

          {/* Rutas de Fibra y Distancias */}
          <div className="space-y-1 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-semibold">
                <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraTroncal96H }} />
                <span>Troncal 96H</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-semibold">
                <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraTroncal48H }} />
                <span>Troncal 48H</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-semibold">
                <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraTroncal12H }} />
                <span>Troncal 12H</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                <span className="w-3 h-1 rounded" style={{ backgroundColor: FIBER_DESIGN_COLORS.fibraDistribucion12H }} />
                <span>Distribución 12H</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span>&ge; 80% Alerta ({naps.filter(n => (n.metricas?.porcentajeSaturacion || 0) >= 80 && (n.metricas?.porcentajeSaturacion || 0) < 100).length})</span>

          {/* Elementos físicos */}
          <div className="flex items-center gap-2 mb-1 text-sky-700 dark:text-sky-400 font-medium">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Mufas ({allEmpalmes.length})</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-600/20" />
            <span>100% Saturada ({naps.filter(n => (n.metricas?.porcentajeSaturacion || 0) >= 100).length})</span>
          <div className="flex items-center gap-2 mb-1 text-blue-700 dark:text-blue-400 font-medium">
            <span className="font-bold">∞</span>
            <span>Gasas Reserva ({gasas.length})</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-amber-600 font-medium mb-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-600 shrink-0" />
            <span>Muffas ({empalmes.length})</span>
          <div className="flex items-center gap-2 mb-1 text-red-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Postes Propuestos ({postesPropuestos.length})</span>
          </div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium">
            <span className="w-3 h-0.5 bg-sky-500 shrink-0" />
            <span>Rutas Fibra ({fiberRoutes.length})</span>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Cajas NAP ({naps.length})</span>
          </div>
          {activeRoute && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-medium">
              <span className="w-3 h-1 bg-indigo-500 rounded-full" />
              <span>Ruta Vial Activa</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
