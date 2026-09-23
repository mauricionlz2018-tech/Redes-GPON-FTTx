import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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
  Map,
  Satellite,
  Car,
  Eye,
  Camera,
  Globe,
  Crosshair,
  MapPin,
  Plus,
  RotateCcw,
  Check,
  CheckCircle2,
  RefreshCw,
  Power,
  Ruler
} from 'lucide-react';
import { RouteResult, formatDistance, formatDuration } from '../services/routingService';
import { StreetViewModal } from './StreetViewModal';
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
  customPostes?: PosteInfraestructura[];
  onDeleteNapRequest?: (nap: NapBox) => void;
  onDeleteRouteRequest?: (route: FiberRoute) => void;
  onDeleteMufaRequest?: (mufa: EmpalmeClosure) => void;
  onDeletePosteRequest?: (poste: PosteInfraestructura) => void;
  deletedRouteIds?: string[];
  deletedMufaIds?: string[];
  deletedPosteIds?: string[];
  onOpenMileageCapture?: (nap: NapBox, distanceKm?: number) => void;
  placementMode?: 'poste' | 'mufa' | 'nap' | 'troncal' | null;
  onPlaceElement?: (type: 'poste' | 'mufa' | 'nap' | 'troncal', latlng: { lat: number; lng: number }) => void;
  onCancelPlacement?: () => void;
  tempPlacementPin?: { type: 'poste' | 'mufa' | 'nap' | 'troncal'; lat: number; lng: number } | null;
  onUpdateTempPin?: (latlng: { lat: number; lng: number }) => void;
  isDrawingRoute?: boolean;
  routeDraftPoints?: [number, number][];
  onAddRoutePoint?: (latlng: [number, number]) => void;
  onUpdateRoutePoint?: (index: number, latlng: [number, number]) => void;
  onRemoveLastRoutePoint?: () => void;
  onClearRoutePoints?: () => void;
  onFinishDrawingRoute?: () => void;
  onCancelDrawingRoute?: () => void;
}

// Controlador para escuchar cambios de límites visibles (bounds) y nivel de zoom para virtualización
const ViewportListener: React.FC<{
  onViewportChange: (bounds: L.LatLngBounds, zoom: number) => void;
}> = ({ onViewportChange }) => {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      onViewportChange(map.getBounds(), map.getZoom());
    };
    update();
    map.on('moveend', update);
    map.on('zoomend', update);
    return () => {
      map.off('moveend', update);
      map.off('zoomend', update);
    };
  }, [map, onViewportChange]);
  return null;
};

// Controlador para forzar el redibujado de Leaflet en dispositivos móviles y cambios de tamaño
const MapResizeController: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size immediately and after DOM/layout stabilization
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 250),
      setTimeout(() => map.invalidateSize(), 600),
      setTimeout(() => map.invalidateSize(), 1200)
    ];

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);

  return null;
};

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

// Asignar color estándar de ingeniería según la capacidad y tipo de cable
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

// Controlador para centrar en una ubicación específica con animación fluida
const MapCenterController: React.FC<{ targetCenter?: [number, number] | null; zoom?: number }> = ({ targetCenter, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, zoom || 13, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, zoom, map]);
  return null;
};

// Listener para capturar clics directos sobre el mapa cuando el modo Street View 360° está activo
const MapStreetViewClickListener: React.FC<{
  isActive: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ isActive, onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (isActive) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

// Icono animado de Baliza Satelital para la ubicación GPS del usuario en tiempo real
const createGpsUserBeaconIcon = () => {
  return L.divIcon({
    className: 'gps-user-beacon-wrapper',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 30px; height: 30px; border-radius: 9999px; background: rgba(14, 165, 233, 0.45); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 12px rgba(2, 132, 199, 0.95), 0 2px 4px rgba(0,0,0,0.35);"></span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

// Icono animado del Pin Temporal para ajuste fino arrastrable de elementos nuevos
const createTempPlacementPinIcon = (type: 'poste' | 'mufa' | 'nap' | 'troncal') => {
  const bg =
    type === 'poste'
      ? '#e11d48'
      : type === 'mufa'
      ? '#d97706'
      : type === 'troncal'
      ? '#9333ea'
      : '#0284c7';
  const label =
    type === 'poste'
      ? 'POSTE'
      : type === 'mufa'
      ? 'MUFA'
      : type === 'troncal'
      ? 'TRONCAL'
      : 'NAP';
  return L.divIcon({
    className: 'temp-placement-pin-wrapper',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45)); cursor: grab;">
        <div style="background: ${bg}; color: white; font-weight: 900; font-size: 10px; padding: 2px 8px; border-radius: 8px; border: 2px solid white; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">
          <span>+ ${label}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${bg}; margin-top: -1px;"></div>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #0f172a; margin-top: 1px;"></div>
      </div>
    `,
    iconSize: [48, 44],
    iconAnchor: [24, 40]
  });
};

// Icono numerado estándar para cada vértice en el trazado dinámico de líneas de fibra
const createRouteDraftVertexIcon = (index: number, isLast: boolean) => {
  return L.divIcon({
    className: 'route-draft-vertex-icon',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="width: 18px; height: 18px; border-radius: 50%; background: ${
          isLast ? '#0284c7' : '#0f172a'
        }; color: white; font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.35);">
          ${index + 1}
        </div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

// Cálculo de distancia en tiempo real para el trazado de puntos
function calculatePointsDistance(coords: [number, number][]): { metros: number; km: number } {
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

// Controlador de Eventos de Clic y Soltado (Drag & Drop) sobre el Lienzo de Leaflet
const MapEventsAndDropListener: React.FC<{
  placementMode?: 'poste' | 'mufa' | 'nap' | 'troncal' | null;
  onPlaceElement?: (type: 'poste' | 'mufa' | 'nap' | 'troncal', latlng: { lat: number; lng: number }) => void;
  isDrawingRoute?: boolean;
  onAddRoutePoint?: (latlng: [number, number]) => void;
}> = ({ placementMode, onPlaceElement, isDrawingRoute, onAddRoutePoint }) => {
  const map = useMap();

  useMapEvents({
    click: (e) => {
      if (isDrawingRoute && onAddRoutePoint) {
        onAddRoutePoint([
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        ]);
        return;
      }
      if (placementMode && onPlaceElement) {
        onPlaceElement(placementMode, {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6))
        });
      }
    }
  });

  useEffect(() => {
    const container = map.getContainer();

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const rawType = e.dataTransfer?.getData('application/gpon-element') || e.dataTransfer?.getData('text/plain');
      if (rawType === 'poste' || rawType === 'mufa' || rawType === 'nap' || rawType === 'troncal') {
        const rect = container.getBoundingClientRect();
        const clientPoint = L.point(e.clientX - rect.left, e.clientY - rect.top);
        const latlng = map.containerPointToLatLng(clientPoint);
        if (onPlaceElement) {
          onPlaceElement(rawType as 'poste' | 'mufa' | 'nap' | 'troncal', {
            lat: Number(latlng.lat.toFixed(6)),
            lng: Number(latlng.lng.toFixed(6))
          });
        }
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [map, onPlaceElement]);

  return null;
};

// Controlador para animación de vuelo suave al centrar sobre el GPS del técnico
const MapGpsFlyHandler: React.FC<{
  target?: [number, number] | null;
  trigger: number;
}> = ({ target, trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (target && trigger > 0) {
      map.flyTo(target, Math.max(map.getZoom(), 16), {
        duration: 1.2
      });
    }
  }, [trigger, target, map]);
  return null;
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
  fiberRoutes = [],
  empalmes = [],
  gasas = troncalGasas,
  postesPropuestos = troncalPostesPropuestos,
  postesCfe = troncalPostesCfe,
  customPostes = [],
  onDeleteNapRequest,
  onDeleteRouteRequest,
  onDeleteMufaRequest,
  onDeletePosteRequest,
  deletedRouteIds = [],
  deletedMufaIds = [],
  deletedPosteIds = [],
  onOpenMileageCapture,
  placementMode,
  onPlaceElement,
  onCancelPlacement,
  tempPlacementPin,
  onUpdateTempPin,
  isDrawingRoute = false,
  routeDraftPoints = [],
  onAddRoutePoint,
  onUpdateRoutePoint,
  onRemoveLastRoutePoint,
  onClearRoutePoints,
  onFinishDrawingRoute,
  onCancelDrawingRoute
}) => {
  // Centro por defecto: Región Ixtlahuaca - Jiquipilco
  const defaultCenter: [number, number] = useMemo(() => {
    return [19.6450, -99.8200];
  }, []);

  const [targetFocus, setTargetFocus] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(12);

  // Auto-centrado y acercamiento suave cuando se selecciona o crea una caja NAP
  // Referencia para distinguir clics directos en marcadores del mapa vs selecciones externas (búsqueda, lista, etc.)
  const isMapMarkerClickRef = React.useRef(false);

  // Auto-centrado y acercamiento suave cuando se selecciona externamente una caja NAP
  useEffect(() => {
    if (isMapMarkerClickRef.current) {
      // Si el usuario hizo clic directamente sobre el marcador en el mapa, no usamos flyTo
      // para evitar que la animación compita con la apertura del Popup y provoque saltos/tirones.
      isMapMarkerClickRef.current = false;
      return;
    }

    if (selectedNap?.coordenadas_gps?.lat && selectedNap?.coordenadas_gps?.lng) {
      setTargetFocus([selectedNap.coordenadas_gps.lat, selectedNap.coordenadas_gps.lng]);
      // Offset de latitud ligero (+0.0015) para que el popup (que mide ~300px hacia arriba) quede perfectamente
      // centrado y visible en pantalla sin cortarse con la barra superior ni provocar autoPan brusco.
      setTargetFocus([selectedNap.coordenadas_gps.lat + 0.0015, selectedNap.coordenadas_gps.lng]);
      setTargetZoom(16);
    }
  }, [selectedNap?.id_nap]);

  // Límites visibles en pantalla y zoom actual para virtualización de alto rendimiento
  const [viewportBounds, setViewportBounds] = useState<L.LatLngBounds | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  const handleViewportChange = React.useCallback((bounds: L.LatLngBounds, zoom: number) => {
    setViewportBounds(bounds);
    setCurrentZoom(zoom);
  }, []);

  // Buffer de 30% alrededor de la pantalla para navegación fluida sin cortes
  const bufferedBounds = useMemo(() => {
    if (!viewportBounds) return null;
    return viewportBounds.pad(0.3);
  }, [viewportBounds]);

  // Estados de visibilidad de capas
  const [showFiberRoutes, setShowFiberRoutes] = useState(true);
  const [showEmpalmes, setShowEmpalmes] = useState(true);
  const [showGasas, setShowGasas] = useState(true);
  const [showPostesPropuestos, setShowPostesPropuestos] = useState(true);
  const [showPostesCfe, setShowPostesCfe] = useState(true); // Activo por defecto con virtualización a 60 FPS
  const [showNaps, setShowNaps] = useState(true);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [isBaseMapMenuOpen, setIsBaseMapMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Distancia calculada en tiempo real de la ruta en modo trazado borrador
  const routeDraftDistance = useMemo(() => {
    return calculatePointsDistance(routeDraftPoints || []);
  }, [routeDraftPoints]);

  // Estados para Geolocalización GPS a Demanda (No intrusivo, con control total de encendido/apagado)
  const [userGpsPosition, setUserGpsPosition] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    heading: number | null;
  } | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsCenterTrigger, setGpsCenterTrigger] = useState<number>(0);

  const fetchGpsLocation = (centerMap: boolean = false) => {
    if (!('geolocation' in navigator)) {
      alert('Tu dispositivo o navegador no soporta geolocalización GPS.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextPos = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading
        };
        setUserGpsPosition(nextPos);
        setIsGpsActive(true);
        setIsGpsLoading(false);
        if (centerMap) {
          setGpsCenterTrigger((prev) => prev + 1);
        }
      },
      (err) => {
        console.warn('GPS no disponible:', err.message);
        alert('No se pudo obtener la señal GPS: ' + err.message);
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleTurnOffGps = () => {
    setIsGpsActive(false);
    setUserGpsPosition(null);
  };



  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Estado para alternar entre vista estándar de calles y Satélite HD oficial (Esri World Imagery / Maxar - 100% Legal)
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>(() => {
    try {
      const saved = localStorage.getItem('gpon_map_layer');
      if (saved === 'satellite' || saved === 'streets') return saved;
      if (saved === 'google_hybrid' || saved === 'esri_satellite' || saved === 'hybrid') return 'satellite';
    } catch {}
    return 'satellite'; // Por defecto Satélite HD de alta resolución 100% legal
  });

  const handleSelectMapLayer = (layer: 'streets' | 'satellite') => {
    setMapLayer(layer);
    try {
      localStorage.setItem('gpon_map_layer', layer);
    } catch {}
  };

  // Estado del modo explorador Street View 360° (Pegman)
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);
  const [streetViewData, setStreetViewData] = useState<{
    isOpen: boolean;
    coordinates: { lat: number; lng: number } | null;
    title?: string;
    subtitle?: string;
  }>({
    isOpen: false,
    coordinates: null
  });

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setStreetViewData({
      isOpen: true,
      coordinates: { lat, lng },
      title: 'Punto de Interés en Calle',
      subtitle: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });
  };

  // Combinar rutas KMZ completas con rutas de la base central y personalizadas (Filtrando eliminadas)
  const allRoutes = useMemo(() => {
    const combined: FiberRoute[] = [];
    (fiberRoutes || []).forEach((fr) => {
      if (!combined.some((c) => c.id_ruta === fr.id_ruta)) {
        combined.push(fr);
      }
    });
    troncalIxtJocRoutes.forEach((tr) => {
      if (!combined.some((c) => c.id_ruta === tr.id_ruta)) {
        combined.push(tr);
      }
    });
    mockFiberRoutes.forEach((sr) => {
      if (!combined.some((c) => c.id_ruta === sr.id_ruta)) {
        combined.push(sr);
      }
    });
    return combined.filter((r) => {
      if (deletedRouteIds.includes(r.id_ruta)) return false;
      if (!r.coordenadas || !Array.isArray(r.coordenadas) || r.coordenadas.length < 2) return false;
      return r.coordenadas.every(
        (pt) => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && !isNaN(pt[0]) && typeof pt[1] === 'number' && !isNaN(pt[1])
      );
    });
  }, [fiberRoutes, deletedRouteIds]);

  // Combinar empalmes KMZ con empalmes de la base central (Filtrando eliminadas)
  const allEmpalmes = useMemo(() => {
    const combined: EmpalmeClosure[] = [];
    (empalmes || []).forEach((em) => {
      if (!combined.some((c) => c.id_empalme === em.id_empalme)) {
        combined.push(em);
      }
    });
    troncalMufas.forEach((tm) => {
      if (!combined.some((c) => c.id_empalme === tm.id_empalme)) {
        combined.push(tm);
      }
    });
    mockEmpalmes.forEach((me) => {
      if (!combined.some((c) => c.id_empalme === me.id_empalme)) {
        combined.push(me);
      }
    });
    return combined.filter((m) => {
      if (deletedMufaIds.includes(m.id_empalme)) return false;
      if (!m.coordenadas_gps || typeof m.coordenadas_gps.lat !== 'number' || typeof m.coordenadas_gps.lng !== 'number') return false;
      return !isNaN(m.coordenadas_gps.lat) && !isNaN(m.coordenadas_gps.lng);
    });
  }, [empalmes, deletedMufaIds]);

  // Combinar postes propuestos (KMZ + personalizados de la base central)
  const allPostesPropuestos = useMemo(() => {
    const combined = [...postesPropuestos];
    if (customPostes && customPostes.length > 0) {
      customPostes.forEach((cp) => {
        if (cp.tipo === 'poste_propuesto' && !combined.some((p) => p.id_poste === cp.id_poste)) {
          combined.push(cp);
        }
      });
    }
    return combined.filter((p) => {
      if (deletedPosteIds.includes(p.id_poste)) return false;
      if (!p.coordenadas_gps || typeof p.coordenadas_gps.lat !== 'number' || typeof p.coordenadas_gps.lng !== 'number') return false;
      return !isNaN(p.coordenadas_gps.lat) && !isNaN(p.coordenadas_gps.lng);
    });
  }, [postesPropuestos, customPostes, deletedPosteIds]);

  // Combinar postes CFE (KMZ + personalizados de la base central)
  const allPostesCfe = useMemo(() => {
    const combined = [...postesCfe];
    if (customPostes && customPostes.length > 0) {
      customPostes.forEach((cp) => {
        if (cp.tipo === 'poste_cfe' && !combined.some((p) => p.id_poste === cp.id_poste)) {
          combined.push(cp);
        }
      });
    }
    return combined.filter((p) => {
      if (deletedPosteIds.includes(p.id_poste)) return false;
      if (!p.coordenadas_gps || typeof p.coordenadas_gps.lat !== 'number' || typeof p.coordenadas_gps.lng !== 'number') return false;
      return !isNaN(p.coordenadas_gps.lat) && !isNaN(p.coordenadas_gps.lng);
    });
  }, [postesCfe, customPostes, deletedPosteIds]);

  // Virtualización por Vista (Viewport Culling): renderizar de forma óptima a 60 FPS
  const visiblePostesPropuestos = useMemo(() => {
    if (!showPostesPropuestos) return [];

    // 1. Postes propuestos personalizados por el usuario (siempre se muestran sin perderse en móviles)
    const customProps = (customPostes || []).filter((p) => p.tipo !== 'poste_cfe');
    const customInView = customProps.filter((p) => {
      if (!bufferedBounds) return true;
      return bufferedBounds.contains([p.coordenadas_gps.lat, p.coordenadas_gps.lng]);
    });

    // 2. Postes propuestos masivos del KMZ
    if (!bufferedBounds) return customInView.length > 0 ? customInView : postesPropuestos.slice(0, 80);

    const kmzInView = postesPropuestos.filter((p) =>
      bufferedBounds.contains([p.coordenadas_gps.lat, p.coordenadas_gps.lng])
    );
    return [...customInView, ...kmzInView];
  }, [showPostesPropuestos, customPostes, postesPropuestos, bufferedBounds]);

  const visiblePostesCfe = useMemo(() => {
    if (!showPostesCfe) return [];

    // 1. Postes CFE personalizados por el usuario: NUNCA se ocultan por nivel de zoom bajo en móviles
    const customCfe = (customPostes || []).filter((p) => p.tipo === 'poste_cfe');
    const customInView = customCfe.filter((p) => {
      if (!bufferedBounds) return true;
      return bufferedBounds.contains([p.coordenadas_gps.lat, p.coordenadas_gps.lng]);
    });

    // 2. Postes CFE masivos del KMZ (803 pines): nivel de detalle a partir de zoom 13
    if (currentZoom < 13 || !bufferedBounds) {
      return customInView;
    }

    const kmzInView = postesCfe.filter((p) =>
      bufferedBounds.contains([p.coordenadas_gps.lat, p.coordenadas_gps.lng])
    );
    return [...customInView, ...kmzInView];
  }, [showPostesCfe, customPostes, postesCfe, bufferedBounds, currentZoom]);

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

  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) return null;
    return allRoutes.find((r) => r.id_ruta === selectedRouteId) || null;
  }, [selectedRouteId, allRoutes]);

  return (
    <div
      id="seccion-mapa-gpon"
      className="relative isolate w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors scroll-mt-24"
    >
      {/* Selector flotante de Capas Cartográficas (Plegable y Oculto mientras se traza Troncal) */}
      {!isDrawingRoute && (
        <div className="absolute top-3 right-2.5 sm:right-3 z-[400]">
          {!isBaseMapMenuOpen ? (
            <button
              onClick={() => setIsBaseMapMenuOpen(true)}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Cambiar tipo de mapa (Calles / Satélite / Street View)"
            >
              {mapLayer === 'satellite' ? (
                <>
                  <Satellite className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Satélite</span>
                </>
              ) : (
                <>
                  <Map className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Calles</span>
                </>
              )}
              {isStreetViewActive && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" title="Street View activo" />
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
            </button>
          ) : (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-300 dark:border-slate-800 rounded-xl p-2 shadow-xl text-xs space-y-1.5 w-48 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 px-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  Tipo de Mapa
                </span>
                <button
                  onClick={() => setIsBaseMapMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botón Calles */}
              <button
                type="button"
                onClick={() => {
                  handleSelectMapLayer('streets');
                  setIsBaseMapMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapLayer === 'streets'
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Map className="w-3.5 h-3.5 text-sky-400" />
                  <span>Calles (OSM)</span>
                </div>
                {mapLayer === 'streets' && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Botón Satélite */}
              <button
                type="button"
                onClick={() => {
                  handleSelectMapLayer('satellite');
                  setIsBaseMapMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapLayer === 'satellite'
                    ? 'bg-sky-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5 text-amber-400" />
                  <span>Satélite HD</span>
                </div>
                {mapLayer === 'satellite' && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

              {/* Botón Street View */}
              <button
                type="button"
                onClick={() => {
                  setIsStreetViewActive(!isStreetViewActive);
                  setIsBaseMapMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isStreetViewActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Street View 360°</span>
                </div>
                {isStreetViewActive && <span className="text-[10px] font-bold bg-slate-950 text-white px-1.5 py-0.2 rounded-full">ON</span>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Banner flotante informativo cuando el modo Street View está encendido */}
      {isStreetViewActive && (
        <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-[450] bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-full shadow-xl border border-amber-600 flex items-center justify-between gap-2 text-xs font-bold w-[92%] sm:w-auto max-w-sm whitespace-nowrap animate-fadeIn">
          <div className="flex items-center gap-1.5 truncate">
            <Camera className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Modo Street View: Toca una calle o poste</span>
          </div>
          <button
            onClick={() => setIsStreetViewActive(false)}
            className="bg-slate-950 text-white px-2 py-0.5 rounded-full text-[10px] font-bold hover:bg-slate-800 cursor-pointer shrink-0 ml-1 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Salir</span>
          </button>
        </div>
      )}

      {/* Banner flotante cuando el Modo de Colocación (Click / Arrastre) está activo - Centrado arriba */}
      {placementMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-900 dark:text-white px-3.5 py-1.5 rounded-xl shadow-xl border border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3 text-xs font-semibold w-[94%] sm:w-auto max-w-md animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate text-xs">
              Ubicar en el mapa:{' '}
              <strong className="text-sky-700 dark:text-sky-300 font-bold">
                {placementMode === 'poste'
                  ? 'Poste'
                  : placementMode === 'mufa'
                  ? 'Mufa'
                  : placementMode === 'troncal'
                  ? 'Línea Troncal'
                  : 'Caja NAP'}
              </strong>
            </span>
          </div>
          {onCancelPlacement && (
            <button
              onClick={onCancelPlacement}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors cursor-pointer"
              title="Cancelar colocación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Barra de Control Integrada para Trazado de Ruta en el Mapa - Posicionada Arriba */}
      {isDrawingRoute && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2 sm:gap-3 text-xs text-slate-800 dark:text-slate-100 max-w-[94vw] whitespace-nowrap animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-400">
            <Ruler className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="hidden xs:inline">Trazar Troncal:</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
              {routeDraftPoints.length} {routeDraftPoints.length === 1 ? 'pt' : 'pts'}
            </span>
            {routeDraftPoints.length >= 2 && (
              <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                ({routeDraftDistance.metros} m)
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={routeDraftPoints.length === 0}
              onClick={onRemoveLastRoutePoint}
              className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Deshacer último punto"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Deshacer</span>
            </button>

            <button
              type="button"
              disabled={routeDraftPoints.length === 0}
              onClick={onClearRoutePoints}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Borrar puntos"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={routeDraftPoints.length < 2}
              onClick={onFinishDrawingRoute}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer ml-0.5"
              title="Finalizar trazado y abrir formulario"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={onCancelDrawingRoute}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-0.5"
              title="Cancelar trazado"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Control Flotante de Filtros de Elementos de Red (Troncal, Mufas, Gasas, Postes) - Ubicado limpiamente debajo de los botones de zoom +/- */}
      <div className="absolute top-[82px] left-2.5 sm:left-3 z-[400]">
        {!isLayersMenuOpen ? (
          <button
            onClick={() => setIsLayersMenuOpen(true)}
            className="bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-md flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Abrir selector de capas de red de fibra"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Capas</span>
            <span className="hidden sm:inline">de Red</span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded-full font-mono">
              {totalNetworkDistance.km} km
            </span>
          </button>
        ) : (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-300 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 w-[260px] max-w-[85vw] animate-fadeIn max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                Capas de Planta Externa
              </span>
              <button
                onClick={() => setIsLayersMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
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
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
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
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
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
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
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
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span className="flex-1">
                  Postes Propuestos ({allPostesPropuestos.length})
                  {showPostesPropuestos && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                      {visiblePostesPropuestos.length} en pantalla (fluido)
                    </span>
                  )}
                </span>
              </label>

              {/* Postes CFE */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showPostesCfe}
                  onChange={(e) => setShowPostesCfe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0 text-[6px] text-white flex items-center justify-center font-bold">
                  +
                </span>
                <span className="flex-1">
                  Postes CFE ({allPostesCfe.length})
                  {showPostesCfe && (
                    <span className="text-[10px] block">
                      {currentZoom < 13 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Acércate (zoom) para activar
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {visiblePostesCfe.length} en pantalla (fluido)
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </label>

              {/* Cajas NAP */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={showNaps}
                  onChange={(e) => setShowNaps(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
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

      {/* Banner flotante superior si hay una ruta vial activa */}
      {!isDrawingRoute && activeRoute && (
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

      {/* Banner flotante cuando se selecciona e ilumina una ruta de fibra */}
      {selectedRoute && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-900 dark:text-white px-4 py-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-fadeIn max-w-[92vw]">
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-2 ring-white/60"
            style={{ backgroundColor: getRouteStandardColor(selectedRoute) }}
          />
          <span className="truncate max-w-[160px] sm:max-w-xs">{selectedRoute.nombre}</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {getRouteDistance(selectedRoute).km} km ({getRouteDistance(selectedRoute).metros.toLocaleString()} ML)
          </span>
          {onDeleteRouteRequest && (
            <button
              onClick={() => onDeleteRouteRequest(selectedRoute)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-xs transition-all active:scale-95 cursor-pointer ml-1"
              title="Eliminar esta línea troncal de la red"
            >
              <Trash2 className="w-3 h-3" />
              <span>Eliminar</span>
            </button>
          )}
          <button
            onClick={() => setSelectedRouteId(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            title="Deseleccionar ruta"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MapContainer Principal */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapResizeController />
        <MapBoundsAdjuster coordinates={activeRoute?.coordinates} />
        <MapCenterController targetCenter={targetFocus} zoom={targetZoom} />
        <ViewportListener onViewportChange={handleViewportChange} />
        <MapStreetViewClickListener
          isActive={isStreetViewActive}
          onLocationSelect={handleMapLocationSelect}
        />
        <MapEventsAndDropListener
          placementMode={placementMode}
          onPlaceElement={onPlaceElement}
          isDrawingRoute={isDrawingRoute}
          onAddRoutePoint={onAddRoutePoint}
        />
        <MapGpsFlyHandler
          target={userGpsPosition ? [userGpsPosition.lat, userGpsPosition.lng] : null}
          trigger={gpsCenterTrigger}
        />

        {/* 1. Capa de Calles (OpenStreetMap - 100% Libre y Legal) */}
        {mapLayer === 'streets' && (
          <TileLayer
            key="osm-streets"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* 2. Capa Satélite HD Fotorrealista (Esri World Imagery + Maxar / Earthstar - 100% Legal) */}
        {mapLayer === 'satellite' && (
          <>
            {/* Ortofotografía Satelital de Alta Resolución Maxar / Earthstar */}
            <TileLayer
              key="esri-satellite-base"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            {/* Capa Híbrida Oficial de Nombres de Calles, Poblados y Carreteras de Esri */}
            <TileLayer
              key="esri-satellite-labels"
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.85}
            />
          </>
        )}

        {/* 4. Trazado de Rutas Reales de Fibra Óptica (KMZ IXT-JOC + Complementos) */}
        {showFiberRoutes &&
          allRoutes.map((route) => {
            const { metros, km } = getRouteDistance(route);
            const lineColor = getRouteStandardColor(route);
            const lineWeight = route.grosor || 4;
            const isSelected = selectedRouteId === route.id_ruta;
            const hasSelection = Boolean(selectedRouteId);

            return (
              <React.Fragment key={`route-group-${route.id_ruta}`}>
                {/* Resplandor y halo de iluminación cuando la ruta está seleccionada (intenso, sin tono lechoso) */}
                {isSelected && (
                  <Polyline
                    positions={route.coordenadas}
                    pathOptions={{
                      color: lineColor,
                      weight: lineWeight + 6,
                      opacity: 0.65,
                      lineCap: 'round',
                      lineJoin: 'round',
                      className: 'outline-none focus:outline-none'
                    }}
                  />
                )}

                {/* Línea principal de fibra óptica interactiva */}
                <Polyline
                  positions={route.coordenadas}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setSelectedRouteId((prev) => (prev === route.id_ruta ? null : route.id_ruta));
                    }
                  }}
                  pathOptions={{
                    color: lineColor,
                    weight: isSelected ? lineWeight + 3 : hasSelection ? Math.max(2, lineWeight - 1) : lineWeight,
                    opacity: isSelected ? 1.0 : hasSelection ? 0.45 : 0.9,
                    lineCap: 'round',
                    lineJoin: 'round',
                    className: 'outline-none focus:outline-none'
                  }}
                >
                  {/* Tooltip limpio con Nombre y Distancia precisa al posar el cursor */}
                  <Tooltip sticky>
                    <div className="text-xs font-sans">
                      <strong className="block text-slate-900">{route.nombre}</strong>
                      <span className="text-indigo-600 font-bold">
                        {km} km ({metros.toLocaleString()} ML)
                      </span>
                      <span className="text-slate-500 block text-[10px]">{route.subtipo || route.tipo}</span>
                    </div>
                  </Tooltip>
                </Polyline>
              </React.Fragment>
            );
          })}

        {/* 5. Marcadores de Cierres de Empalme (Mufas Torpedo Estandarizadas) */}
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
                    <button
                      type="button"
                      onClick={() =>
                        setStreetViewData({
                          isOpen: true,
                          coordinates: emp.coordenadas_gps,
                          title: `Mufa Torpedo ${emp.nombre}`,
                          subtitle: `Cierre de empalme (${emp.capacidad_hilos || 48} Hilos) en infraestructura aérea/subterránea`
                        })
                      }
                      className="mt-2 w-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 text-[11px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-amber-400 dark:border-amber-700 font-bold cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                      <span>Ver Mufa en Street View</span>
                    </button>
                    {onDeleteMufaRequest && (
                      <button
                        type="button"
                        onClick={() => onDeleteMufaRequest(emp)}
                        className="mt-1.5 w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-red-200 dark:border-red-800 font-semibold cursor-pointer"
                        title="Eliminar este cierre de empalme / mufa de la red"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar Mufa</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 6. Marcadores de Gasas de Reserva Técnica (∞) */}
        {showGasas &&
          gasas.map((gasa) => {
            const icon = createGasaReservaIcon(gasa);
            const metraje = gasa.longitud_metros || gasa.metros_reserva || 30;
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
                      Longitud de Reserva: <strong className="text-blue-700 dark:text-blue-300">{metraje} Metros</strong>
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

        {/* 7. Marcadores de Postes Propuestos Normalizados (Virtualizados a 60 FPS) */}
        {showPostesPropuestos &&
          visiblePostesPropuestos.map((poste) => {
            const codigo = poste.codigo || poste.nombre;
            const icon = createPostePropuestoIcon(codigo);
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
                      <span>Poste Propuesto {codigo}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Infraestructura Proyectada de Planta Externa
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {poste.coordenadas_gps.lat.toFixed(5)}, {poste.coordenadas_gps.lng.toFixed(5)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setStreetViewData({
                          isOpen: true,
                          coordinates: poste.coordenadas_gps,
                          title: `Poste Propuesto ${codigo}`,
                          subtitle: 'Inspección de calle para proyectar herrajes y tendido de cable'
                        })
                      }
                      className="mt-2 w-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 text-[11px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-amber-400 dark:border-amber-700 font-bold cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                      <span>Ver Poste en Street View</span>
                    </button>
                    {onDeletePosteRequest && (
                      <button
                        type="button"
                        onClick={() => onDeletePosteRequest(poste)}
                        className="mt-1.5 w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-red-200 dark:border-red-800 font-semibold cursor-pointer"
                        title="Eliminar este poste propuesto de la red"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar Poste</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 8. Marcadores de Postes CFE Existentes (Virtualizados con LOD a 60 FPS) */}
        {showPostesCfe &&
          visiblePostesCfe.map((poste) => {
            const codigo = poste.codigo || poste.nombre;
            const icon = createPosteCfeIcon(codigo);
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
                      <span>Poste CFE {codigo}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Poste de Concesión Eléctrica Existente
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {poste.coordenadas_gps.lat.toFixed(5)}, {poste.coordenadas_gps.lng.toFixed(5)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setStreetViewData({
                          isOpen: true,
                          coordinates: poste.coordenadas_gps,
                          title: `Poste CFE ${codigo}`,
                          subtitle: 'Inspección de poste existente para verificar retenidas y vano'
                        })
                      }
                      className="mt-2 w-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 text-[11px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-amber-400 dark:border-amber-700 font-bold cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                      <span>Ver Poste en Street View</span>
                    </button>
                    {onDeletePosteRequest && (
                      <button
                        type="button"
                        onClick={() => onDeletePosteRequest(poste)}
                        className="mt-1.5 w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-red-200 dark:border-red-800 font-semibold cursor-pointer"
                        title="Eliminar este poste de la red"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar Poste</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 9. Marcador del ODF Central en Cabecera */}
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

        {/* 10. Trazado de Ruta Vial de Navegación (Modo Pruebas OSRM) */}
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

        {/* 11. Marcadores de Cajas NAP Normalizadas con Semáforo Cromático */}
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
                  click: () => {
                    isMapMarkerClickRef.current = true;
                    onSelectNap(nap);
                    setTimeout(() => {
                      isMapMarkerClickRef.current = false;
                    }, 100);
                  }
                }}
              >
                <Popup
                  autoPanPaddingTopLeft={L.point(20, 90)}
                  autoPanPaddingBottomRight={L.point(20, 20)}
                  autoPan={true}
                >
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
                      </div>
                      <div>
                        Ocupados: <strong className="text-sky-600 dark:text-sky-400">{m?.ocupados ?? 0}</strong>
                      </div>
                    </div>

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

                      {/* Botón Inspección Street View */}
                      <button
                        type="button"
                        onClick={() =>
                          setStreetViewData({
                            isOpen: true,
                            coordinates: nap.coordenadas_gps,
                            title: `Caja ${nap.identificador} (${nap.zona})`,
                            subtitle: `Fachada e instalación en ${nap.direccion_texto}`
                          })
                        }
                        className="w-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-amber-300 dark:border-amber-700 font-bold cursor-pointer"
                        title="Ver fachada, poste y entorno en Street View"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                        <span>Ver en Street View</span>
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
                </Popup>
              </Marker>
            );
          })}

        {/* Baliza Satelital de Posición GPS del Usuario a Demanda */}
        {userGpsPosition && isGpsActive && (
          <>
            <Circle
              center={[userGpsPosition.lat, userGpsPosition.lng]}
              radius={Math.max(userGpsPosition.accuracy, 5)}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />
            <Marker
              position={[userGpsPosition.lat, userGpsPosition.lng]}
              icon={createGpsUserBeaconIcon()}
              zIndexOffset={9000}
            >
              <Popup className="gpon-modern-popup">
                <div className="p-2 space-y-1.5 text-xs text-slate-800 dark:text-slate-100 min-w-[210px]">
                  <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>Tu Ubicación en Tiempo Real</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    GPS: {userGpsPosition.lat}, {userGpsPosition.lng}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Precisión satelital: &plusmn;{userGpsPosition.accuracy} m
                  </p>
                  {onPlaceElement && (
                    <div className="pt-1.5 grid grid-cols-2 gap-1.5 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() =>
                          onPlaceElement('poste', {
                            lat: userGpsPosition.lat,
                            lng: userGpsPosition.lng
                          })
                        }
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1 px-1 rounded text-[10px] text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Poste Aquí</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onPlaceElement('mufa', {
                            lat: userGpsPosition.lat,
                            lng: userGpsPosition.lng
                          })
                        }
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-1 px-1 rounded text-[10px] text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Mufa Aquí</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onPlaceElement('troncal', {
                            lat: userGpsPosition.lat,
                            lng: userGpsPosition.lng
                          })
                        }
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-1 rounded text-[10px] text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Troncal Aquí</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onPlaceElement('nap', {
                            lat: userGpsPosition.lat,
                            lng: userGpsPosition.lng
                          })
                        }
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-1 px-1 rounded text-[10px] text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>NAP Aquí</span>
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Trazado Dinámico de Línea de Fibra Óptica (Vértices y Curvas Reales en Vivo) */}
        {isDrawingRoute && routeDraftPoints && routeDraftPoints.length > 0 && (
          <>
            {/* Halo exterior para contraste sobre satélite y calles */}
            <Polyline
              positions={routeDraftPoints}
              pathOptions={{
                color: '#ffffff',
                weight: 6,
                opacity: 0.7,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Línea principal trazada */}
            <Polyline
              positions={routeDraftPoints}
              pathOptions={{
                color: '#0284c7',
                weight: 3.5,
                opacity: 1,
                dashArray: '6, 6',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Marcadores numerados arrastrables para cada vértice del trazado */}
            {routeDraftPoints.map((pt, idx) => (
              <Marker
                key={`draft-vertex-${idx}`}
                position={pt}
                icon={createRouteDraftVertexIcon(idx, idx === routeDraftPoints.length - 1)}
                draggable={true}
                zIndexOffset={11000 + idx}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const newLatLng = marker.getLatLng();
                    if (onUpdateRoutePoint) {
                      onUpdateRoutePoint(idx, [
                        Number(newLatLng.lat.toFixed(6)),
                        Number(newLatLng.lng.toFixed(6))
                      ]);
                    }
                  }
                }}
              >
                <Tooltip direction="top" offset={[0, -14]}>
                  <div className="text-[10px] font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded shadow">
                    <span>Vértice #{idx + 1}</span>
                    <span className="block font-mono text-[9px] text-slate-500">
                      {pt[0].toFixed(5)}, {pt[1].toFixed(5)}
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </>
        )}

        {/* Marcador Temporal Interactivo de Colocación (Arrastrable para Ajuste Fino) */}
        {tempPlacementPin && (
          <Marker
            position={[tempPlacementPin.lat, tempPlacementPin.lng]}
            icon={createTempPlacementPinIcon(tempPlacementPin.type)}
            draggable={true}
            zIndexOffset={10000}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newLatLng = marker.getLatLng();
                if (onUpdateTempPin) {
                  onUpdateTempPin({
                    lat: Number(newLatLng.lat.toFixed(6)),
                    lng: Number(newLatLng.lng.toFixed(6))
                  });
                }
              }
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -38]}>
              <div className="text-[11px] font-bold text-slate-900 bg-white/95 px-2.5 py-1 rounded-lg shadow-md border border-slate-300 dark:border-slate-700 text-center">
                <span>Arrastra para ajustar posición exacta</span>
                <span className="block font-mono text-[10px] text-slate-600">
                  {tempPlacementPin.lat.toFixed(6)}, {tempPlacementPin.lng.toFixed(6)}
                </span>
              </div>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Control Flotante de Geolocalización GPS a Demanda (Esquina Inferior Derecha) */}
      <div className="absolute bottom-5 right-3 z-[400] flex flex-col items-end gap-1.5 pointer-events-auto">
        {!isGpsActive ? (
          <button
            type="button"
            onClick={() => fetchGpsLocation(true)}
            disabled={isGpsLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700"
            title="Activar geolocalización GPS a demanda"
          >
            <Crosshair className={`w-4 h-4 text-sky-600 dark:text-sky-400 ${isGpsLoading ? 'animate-spin' : ''}`} />
            <span>{isGpsLoading ? 'Buscando GPS...' : 'Activar GPS'}</span>
          </button>
        ) : (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur p-1.5 rounded-xl border border-sky-300 dark:border-sky-700 shadow-xl flex items-center gap-1.5 text-xs animate-fadeIn">
            {userGpsPosition && (
              <div className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/50 rounded-lg text-[10px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>&plusmn;{userGpsPosition.accuracy}m</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fetchGpsLocation(false)}
              disabled={isGpsLoading}
              className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              title="Actualizar mi ubicación actual por GPS ahora"
            >
              <RefreshCw className={`w-3 h-3 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              type="button"
              onClick={() => setGpsCenterTrigger((prev) => prev + 1)}
              className="p-1.5 rounded-lg font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
              title="Centrar mapa en mi ubicación GPS"
            >
              <Crosshair className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </button>
            <button
              type="button"
              onClick={handleTurnOffGps}
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Desactivar y apagar GPS"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Leyenda Plegable del Mapa en Esquina Inferior Izquierda */}
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
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-lg dark:shadow-xl max-w-[220px] transition-all">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white">Simbología</span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimizar leyenda"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

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

          {/* Elementos físicos */}
          <div className="flex items-center gap-2 mb-1 text-sky-700 dark:text-sky-400 font-medium">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Mufas ({allEmpalmes.length})</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-blue-700 dark:text-blue-400 font-medium">
            <span className="font-bold">∞</span>
            <span>Gasas Reserva ({gasas.length})</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-red-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Postes Propuestos ({postesPropuestos.length})</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Cajas NAP ({naps.length})</span>
          </div>
        </div>
      )}

      {/* Modal Interactivo Oficial de Inspección Street View 360° */}
      <StreetViewModal
        isOpen={streetViewData.isOpen}
        onClose={() => setStreetViewData((prev) => ({ ...prev, isOpen: false }))}
        coordinates={streetViewData.coordinates}
        title={streetViewData.title}
        subtitle={streetViewData.subtitle}
      />
    </div>
  );
};
