import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GponMap } from '../components/GponMap';
import { NapPortMatrix } from '../components/NapPortMatrix';
import { AssignClientModal } from '../components/AssignClientModal';
import { GpsCaptureModal } from '../components/GpsCaptureModal';
import { CreateNapModal } from '../components/CreateNapModal';
import { DeleteNapModal } from '../components/DeleteNapModal';
import { RouteNavigationCard } from '../components/RouteNavigationCard';
import { FiberDesignLegendModal } from '../components/FiberDesignLegendModal';
import { CreateRouteModal } from '../components/CreateRouteModal';
import { CreateMufaModal } from '../components/CreateMufaModal';
import { CreatePosteModal } from '../components/CreatePosteModal';
import { CreateGasaModal } from '../components/CreateGasaModal';
import { DeleteElementModal } from '../components/DeleteElementModal';
import { OltOdfLogicalModal } from '../components/OltOdfLogicalModal';
import { useAuth } from '../context/AuthContext';
import { NapBox, NapPort, OdfPanel, FiberRoute, EmpalmeClosure, GasaReserva, PosteInfraestructura } from '../types';
import { offlineDb } from '../db/offlineDb';
import api from '../api/client';
import {
  fetchDrivingRoute,
  RouteResult,
  Coordinates
} from '../services/routingService';
import {
  Radio,
  RefreshCw,
  Search,
  Filter,
  Compass,
  Plus,
  Box,
  Navigation,
  Gauge,
  Layers,
  GitCommit,
  Ruler,
  MapPin,
  X,
  GripVertical,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Server
} from 'lucide-react';

import {
  mockNaps,
  mockOdf,
  mockFiberRoutes,
  mockEmpalmes,
  troncalIxtJocRoutes,
  troncalMufas,
  troncalGasas,
  troncalPostesCfe,
  troncalPostesPropuestos,
  getTroncalDesignMetrics
} from '../data/mockGponData';
import { exportGponNetworkToKmz } from '../utils/kmzExport';
import { KmzImportModal } from '../components/KmzImportModal';
import { parseKmzOrKmlFile, ParsedKmzResult, ParsedKmzItem } from '../utils/kmzParser';


import { safeJsonStringify, sanitizeNap, sanitizeNaps } from '../utils/safeJson';
import {
  getCachedNapsSync,
  saveCachedNaps,
  subscribeToRealtime,
  broadcastRealtimeEvent,
  haveDeepItemsChanged
} from '../services/realtimeSync';

export const MapViewPage: React.FC = () => {
  // Carga instantánea de NAPs desde caché local en 0ms (Deduplicación estricta para garantizar 26 NAPs exactas)
  const [naps, setNaps] = useState<NapBox[]>(() => {
    const cached = getCachedNapsSync();
    const seen = new Set<string>();
    const unique = cached.filter((n) => {
      const key = String(n?.identificador || n?.id_nap || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.length > 0 ? unique : mockNaps;
  });
  const [odf, setOdf] = useState<OdfPanel | null>(mockOdf);
  const [selectedNap, setSelectedNap] = useState<NapBox | null>(() => {
    const cached = getCachedNapsSync();
    return cached.length > 0 ? cached[0] : mockNaps[0];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [loading, setLoading] = useState(false);
  const [, setIsDemoMode] = useState(false);

  // Estados para el módulo de navegación y trazado de rutas (Modo Pruebas)
  const [isRouteActive, setIsRouteActive] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);
  const [originType, setOriginType] = useState<'odf' | 'user'>('odf');
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);

  // Estados para Modo Pantalla Completa / Expandido con Pestaña Deslizable
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [isExpandedDrawerOpen, setIsExpandedDrawerOpen] = useState<boolean>(false);

  // Redimensionar Leaflet al alternar pantalla completa o drawer y ocultar barras externas
  useEffect(() => {
    if (isMapExpanded) {
      document.body.classList.add('gpon-fullscreen-active');
    } else {
      document.body.classList.remove('gpon-fullscreen-active');
    }

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('gpon-fullscreen-active');
    };
  }, [isMapExpanded, isExpandedDrawerOpen]);

  // Referencia para scroll suave al panel de puertos
  const portsPanelRef = useRef<HTMLDivElement>(null);

  const scrollToPortsPanel = () => {
    setTimeout(() => {
      const panel = portsPanelRef.current || document.getElementById('panel-puertos-nap');
      if (panel) {
        const navBar = document.querySelector('header');
        const roleBar = document.querySelector('aside');
        const offset = (navBar?.offsetHeight || 56) + (roleBar?.offsetHeight || 30) + 16;
        const elementPosition = panel.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const scrollToMap = () => {
    const mapEl = document.getElementById('seccion-mapa-gpon');
    if (mapEl) {
      const navBar = document.querySelector('header');
      const roleBar = document.querySelector('aside');
      const offset = (navBar?.offsetHeight || 56) + (roleBar?.offsetHeight || 30) + 16;
      const elementPosition = mapEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modales
  const { user } = useAuth();
  const [assigningPort, setAssigningPort] = useState<NapPort | null>(null);
  const [gpsModalNap, setGpsModalNap] = useState<NapBox | null>(null);
  const [isCreateNapOpen, setIsCreateNapOpen] = useState(false);
  const [deletingNap, setDeletingNap] = useState<NapBox | null>(null);
  const [isDeletingNap, setIsDeletingNap] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isMileageLogOpen, setIsMileageLogOpen] = useState(false);
  const [mileageCaptureData, setMileageCaptureData] = useState<{
    isOpen: boolean;
    nap?: NapBox | null;
    distanceKm?: number;
  }>({ isOpen: false });

  // Estados de Planta Externa: Simbología, Metrajes y Creación de Rutas/Mufas/Gasas/Postes
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [isOltModalOpen, setIsOltModalOpen] = useState(false);
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
  const [isCreateMufaOpen, setIsCreateMufaOpen] = useState(false);
  const [isCreatePosteOpen, setIsCreatePosteOpen] = useState(false);
  const [isCreateGasaOpen, setIsCreateGasaOpen] = useState(false);

  // Estados de Edición de Infraestructura
  const [editingRoute, setEditingRoute] = useState<FiberRoute | null>(null);
  const [editingMufa, setEditingMufa] = useState<EmpalmeClosure | null>(null);
  const [editingPoste, setEditingPoste] = useState<PosteInfraestructura | null>(null);
  const [editingGasa, setEditingGasa] = useState<GasaReserva | null>(null);
  const [editingNap, setEditingNap] = useState<NapBox | null>(null);

  // Estados para Drag & Drop y Colocación Interactiva de Elementos
  const [placementMode, setPlacementMode] = useState<'poste' | 'mufa' | 'nap' | 'troncal' | 'gasa' | null>(null);
  const [droppedCoordinates, setDroppedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [tempPlacementPin, setTempPlacementPin] = useState<{
    type: 'poste' | 'mufa' | 'nap' | 'troncal' | 'gasa';
    lat: number;
    lng: number;
  } | null>(null);

  // Estados para Trazado Interactivo de Líneas de Fibra (Puntos sucesivos con curvas reales)
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [routeDraftPoints, setRouteDraftPoints] = useState<[number, number][]>([]);

  const handleAddRoutePoint = (pt: [number, number]) => {
    setRouteDraftPoints((prev) => [...prev, pt]);
  };

  const handleUpdateRoutePoint = (idx: number, pt: [number, number]) => {
    setRouteDraftPoints((prev) => prev.map((p, i) => (i === idx ? pt : p)));
  };

  const handleRemoveLastRoutePoint = () => {
    setRouteDraftPoints((prev) => prev.slice(0, -1));
  };

  const handleClearRoutePoints = () => {
    setRouteDraftPoints([]);
  };

  const handleFinishDrawingRoute = () => {
    setIsDrawingRoute(false);
    setIsCreateRouteOpen(true);
  };

  const handleCancelDrawingRoute = () => {
    setIsDrawingRoute(false);
    setRouteDraftPoints([]);
  };

  const handlePlaceElement = (type: 'poste' | 'mufa' | 'nap' | 'troncal' | 'gasa', latlng: { lat: number; lng: number }) => {
    setDroppedCoordinates(latlng);
    setPlacementMode(null);
    if (type === 'poste') {
      setTempPlacementPin({ type, ...latlng });
      setIsCreatePosteOpen(true);
    } else if (type === 'mufa') {
      setTempPlacementPin({ type, ...latlng });
      setIsCreateMufaOpen(true);
    } else if (type === 'nap') {
      setTempPlacementPin({ type, ...latlng });
      setIsCreateNapOpen(true);
    } else if (type === 'gasa') {
      setTempPlacementPin({ type, ...latlng });
      setIsCreateGasaOpen(true);
    } else if (type === 'troncal') {
      setTempPlacementPin(null);
      setIsDrawingRoute(true);
      setRouteDraftPoints([[latlng.lat, latlng.lng]]);
    }
  };

  const handleUpdateTempPin = (latlng: { lat: number; lng: number }) => {
    setDroppedCoordinates(latlng);
    setTempPlacementPin((prev) => (prev ? { ...prev, ...latlng } : null));
  };

  const handleCancelPlacement = () => {
    setPlacementMode(null);
    setTempPlacementPin(null);
    setDroppedCoordinates(null);
  };
    const getStoredArray = <T,>(key: string): T[] => {
    try {
      const s = localStorage.getItem(key);
      if (!s) return [];
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const safeId = (id: any): string => (id ? String(id).toLowerCase().trim() : '');
  const safeIdent = (ident: any): string => (ident ? String(ident).toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '');

  const isDeletedNap = (n: { id_nap?: string; identificador?: string } | null | undefined, list: string[]): boolean => {
    if (!n || !Array.isArray(list) || list.length === 0) return false;
    if (n.id_nap && list.includes(n.id_nap)) return true;
    if (n.identificador && list.includes(n.identificador)) return true;
    return false;
  };

  const isDeletedItem = (id: any, list: string[]): boolean => {
    if (!id || !Array.isArray(list) || list.length === 0) return false;
    return list.includes(String(id));
  };
const [customRoutes, setCustomRoutes] = useState<FiberRoute[]>(() => getStoredArray<FiberRoute>('gpon_custom_routes'));
  const [customEmpalmes, setCustomEmpalmes] = useState<EmpalmeClosure[]>(() => getStoredArray<EmpalmeClosure>('gpon_custom_empalmes'));
  const [customGasas, setCustomGasas] = useState<GasaReserva[]>(() => getStoredArray<GasaReserva>('gpon_custom_gasas'));
  const [customPostes, setCustomPostes] = useState<PosteInfraestructura[]>(() => getStoredArray<PosteInfraestructura>('gpon_custom_postes'));
  const [customNaps, setCustomNaps] = useState<NapBox[]>(() => getStoredArray<NapBox>('gpon_custom_naps'));
  const isFetchingRef = useRef<boolean>(false);

  // Estados de control para eliminación de elementos (Troncales, Mufas, Postes, Gasas)
  const [deletingElement, setDeletingElement] = useState<{
    type: 'troncal' | 'mufa' | 'poste' | 'gasa';
    id: string;
    name: string;
    details?: string;
  } | null>(null);
  const [isDeletingElement, setIsDeletingElement] = useState(false);

  // Registro de IDs eliminados para sincronización inmediata entre dispositivos y filtros
  const [deletedRouteIds, setDeletedRouteIds] = useState<string[]>(() => getStoredArray<string>('gpon_deleted_route_ids'));
  const [deletedMufaIds, setDeletedMufaIds] = useState<string[]>(() => getStoredArray<string>('gpon_deleted_mufa_ids'));
  const [deletedGasaIds, setDeletedGasaIds] = useState<string[]>(() => getStoredArray<string>('gpon_deleted_gasa_ids'));
  const [deletedPosteIds, setDeletedPosteIds] = useState<string[]>(() => getStoredArray<string>('gpon_deleted_poste_ids'));
  const [deletedNapIds, setDeletedNapIds] = useState<string[]>(() => getStoredArray<string>('gpon_deleted_nap_ids'));

// Helpers para seguimiento de IDs confirmados en la base de datos central (evita re-subir eliminados)
const getKnownServerIds = (key: string): Set<string> => {
  try {
    const s = localStorage.getItem(key);
    return new Set(s ? JSON.parse(s) : []);
  } catch {
    return new Set();
  }
};

const saveKnownServerIds = (key: string, ids: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch {}
};

  // Estados y referencias para importación de KMZ / KML con vista previa y deduplicación
  const [kmzImportData, setKmzImportData] = useState<ParsedKmzResult | null>(null);
  const [isKmzModalOpen, setIsKmzModalOpen] = useState(false);
  const [isParsingKmz, setIsParsingKmz] = useState(false);
  const kmzFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleKmzFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsParsingKmz(true);
      setFeedbackNotice({
        type: 'success',
        message: `Leyendo archivo "${file.name}" y analizando capas geodésicas...`
      });

      const activeRoutes = [...troncalIxtJocRoutes, ...customRoutes].filter(
        (r) => r && r.id_ruta && !isDeletedItem(r.id_ruta, deletedRouteIds)
      );
      const activeEmpalmes = [...troncalMufas, ...customEmpalmes].filter(
        (m) => m && m.id_empalme && !isDeletedItem(m.id_empalme, deletedMufaIds)
      );
      const activePostes = [
        ...troncalPostesCfe,
        ...troncalPostesPropuestos,
        ...customPostes
      ].filter((p) => p && p.id_poste && !isDeletedItem(p.id_poste, deletedPosteIds));

      const parsed = await parseKmzOrKmlFile(file, activeRoutes, activeEmpalmes, activePostes);

      if (parsed.items.length === 0) {
        setFeedbackNotice({
          type: 'error',
          message: 'No se encontraron elementos geográficos (rutas o puntos) válidos en el archivo KMZ/KML.'
        });
        setTimeout(() => setFeedbackNotice(null), 5000);
        return;
      }

      setKmzImportData(parsed);
      setIsKmzModalOpen(true);
      setFeedbackNotice(null);
    } catch (err: any) {
      console.error('Error al procesar archivo KMZ/KML:', err);
      setFeedbackNotice({
        type: 'error',
        message: err?.message || 'Error al procesar el archivo KMZ/KML.'
      });
      setTimeout(() => setFeedbackNotice(null), 6000);
    } finally {
      setIsParsingKmz(false);
      if (kmzFileInputRef.current) {
        kmzFileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmKmzImport = async (itemsToImport: ParsedKmzItem[]) => {
    if (itemsToImport.length === 0) return;

    const routeItems = itemsToImport.filter((it) => it.categoria === 'ruta');
    const pointItems = itemsToImport.filter((it) => it.categoria === 'punto');

    // 1. Procesar rutas
    if (routeItems.length > 0) {
      const newRoutes: FiberRoute[] = routeItems.map((item, idx) => {
        const isTroncal = item.tipo === 'troncal' || !(item.nombre || '').toLowerCase().includes('ramal');
        const coords = item.coordenadas as [number, number][];
        return {
          id_ruta: `route_kmz_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          nombre: item.nombre,
          vertices: coords.length,
          color: isTroncal ? '#ea580c' : '#8b5cf6',
          grosor: isTroncal ? 4 : 3,
          tipo: isTroncal ? 'troncal' : 'ramal',
          subtipo: isTroncal ? 'Troncal 48H' : 'Ramal 24H',
          hilos: isTroncal ? 48 : 24,
          coordenadas: coords,
          distancia_km: item.distanciaKm || 0,
          distancia_metros: item.distanciaMetros || 0,
          origen: 'KMZ Importado',
          destino: 'KMZ Importado',
          estado: 'operativa'
        };
      });

      setCustomRoutes((prev) => {
        const updated = [...newRoutes, ...prev];
        try {
          localStorage.setItem('gpon_custom_routes', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      for (const r of newRoutes) {
        api.post('/infra/routes', r).catch(() => {});
        broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'route', item: r });
      }
    }

    // 2. Procesar Mufas
    const mufaItems = pointItems.filter((it) => it.tipo === 'mufa');
    if (mufaItems.length > 0) {
      const newMufas: EmpalmeClosure[] = mufaItems.map((item, idx) => {
        const coords = item.coordenadas as { lat: number; lng: number };
        return {
          id_empalme: `mufa_kmz_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          nombre: item.nombre,
          tipo_cierre: 'Cierre de Empalme FTTx',
          capacidad_hilos: 48,
          estado: 'optimo',
          coordenadas_gps: coords
        };
      });

      setCustomEmpalmes((prev) => {
        const updated = [...newMufas, ...prev];
        try {
          localStorage.setItem('gpon_custom_empalmes', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      for (const m of newMufas) {
        api.post('/infra/empalmes', m).catch(() => {});
        broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'mufa', item: m });
      }
    }

    // 3. Procesar Postes
    const posteItems = pointItems.filter(
      (it) => it.tipo === 'poste_cfe' || it.tipo === 'poste_propuesto'
    );
    if (posteItems.length > 0) {
      const newPostes: PosteInfraestructura[] = posteItems.map((item, idx) => {
        const coords = item.coordenadas as { lat: number; lng: number };
        const isCfe = item.tipo === 'poste_cfe';
        return {
          id_poste: `poste_kmz_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          nombre: item.nombre,
          codigo: item.nombre,
          tipo: isCfe ? 'poste_cfe' : 'poste_propuesto',
          coordenadas_gps: coords
        };
      });

      setCustomPostes((prev) => {
        const updated = [...newPostes, ...prev];
        try {
          localStorage.setItem('gpon_custom_postes', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      for (const p of newPostes) {
        api.post('/infra/postes', p).catch(() => {});
        broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'poste', item: p });
      }
    }

    // 4. Procesar Gasas
    const gasaItems = pointItems.filter((it) => it.tipo === 'gasa');
    if (gasaItems.length > 0) {
      const newGasas: GasaReserva[] = gasaItems.map((item, idx) => {
        const coords = item.coordenadas as { lat: number; lng: number };
        return {
          id_gasa: `gasa_kmz_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          nombre: item.nombre,
          metros_reserva: 20,
          longitud_metros: 20,
          tipo_cable: 'Troncal 48H',
          coordenadas_gps: coords
        };
      });

      setCustomGasas((prev) => {
        const updated = [...newGasas, ...prev];
        try {
          localStorage.setItem('gpon_custom_gasas', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      for (const g of newGasas) {
        api.post('/infra/gasas', g).catch(() => {});
        broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'gasa', item: g });
      }
    }

    setFeedbackNotice({
      type: 'success',
      message: `Se importaron ${itemsToImport.length} elementos geográficos a la red satelital con éxito.`
    });
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  const [isExportingKmz, setIsExportingKmz] = useState(false);

  const handleExportKmz = async () => {
    try {
      setIsExportingKmz(true);
      setFeedbackNotice({
        type: 'success',
        message: 'Compilando capas geográficas completas (Cajas NAP, troncales, mufas, postes)...'
      });

      const activeRoutes = [...troncalIxtJocRoutes, ...customRoutes].filter(
        (r) => r && r.id_ruta && !isDeletedItem(r.id_ruta, deletedRouteIds)
      );
      const activeEmpalmes = [...troncalMufas, ...customEmpalmes].filter(
        (m) => m && m.id_empalme && !isDeletedItem(m.id_empalme, deletedMufaIds)
      );
      const activePostesPropuestos = [
        ...troncalPostesPropuestos,
        ...customPostes.filter((p) => p.tipo === 'poste_propuesto')
      ].filter((p) => p && p.id_poste && !isDeletedItem(p.id_poste, deletedPosteIds));
      const activePostesCfe = [
        ...troncalPostesCfe,
        ...customPostes.filter((p) => p.tipo === 'poste_cfe')
      ].filter((p) => p && p.id_poste && !isDeletedItem(p.id_poste, deletedPosteIds));
      const activeGasas = [
        ...troncalGasas,
        ...customGasas
      ].filter((g) => g && g.id_gasa && !isDeletedItem(g.id_gasa, deletedGasaIds));

      await exportGponNetworkToKmz({
        naps,
        odf,
        fiberRoutes: activeRoutes,
        empalmes: activeEmpalmes,
        gasas: activeGasas,
        postesPropuestos: activePostesPropuestos,
        postesCfe: activePostesCfe,
        filename: 'Red_GPON_San_Jose_del_Rincon.kmz'
      });


      setFeedbackNotice({
        type: 'success',
        message: '¡Descarga exitosa! Archivo KMZ descargado para abrir en Google Earth o software GIS.'
      });
      setTimeout(() => setFeedbackNotice(null), 5000);
    } catch (err) {
      console.error('Error al exportar KMZ:', err);
      setFeedbackNotice({
        type: 'error',
        message: 'Ocurrió un error al compilar el archivo KMZ de la red.'
      });
      setTimeout(() => setFeedbackNotice(null), 5000);
    } finally {
      setIsExportingKmz(false);
    }
  };

  const handleSaveRoute = async (newRoute: FiberRoute) => {
    setCustomRoutes((prev) => {
      const updated = [newRoute, ...prev.filter((r) => r.id_ruta !== newRoute.id_ruta)];
      try {
        localStorage.setItem('gpon_custom_routes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setDeletedRouteIds((prev) => {
      const updated = prev.filter((id) => id !== newRoute.id_ruta);
      try {
        localStorage.setItem('gpon_deleted_route_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await api.post('/infra/routes', newRoute);
      const known = getKnownServerIds('gpon_known_server_route_ids');
      known.add(newRoute.id_ruta);
      saveKnownServerIds('gpon_known_server_route_ids', known);
    } catch (e) {
      console.warn('Ruta guardada localmente; se sincronizará automáticamente:', e);
    }
    broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'route', item: newRoute });
    setFeedbackNotice({
      type: 'success',
      message: `Ruta ${newRoute.subtipo || newRoute.tipo} "${newRoute.nombre}" guardada y sincronizada (${newRoute.distancia_km} km).`
    });
    setTimeout(() => setFeedbackNotice(null), 6000);
    fetchData(false);
  };

  const handleSaveMufa = async (newMufa: EmpalmeClosure) => {
    setCustomEmpalmes((prev) => {
      const updated = [newMufa, ...prev.filter((m) => m.id_empalme !== newMufa.id_empalme)];
      try {
        localStorage.setItem('gpon_custom_empalmes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setDeletedMufaIds((prev) => {
      const updated = prev.filter((id) => id !== newMufa.id_empalme);
      try {
        localStorage.setItem('gpon_deleted_mufa_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await api.post('/infra/mufas', newMufa);
      const known = getKnownServerIds('gpon_known_server_mufa_ids');
      known.add(newMufa.id_empalme);
      saveKnownServerIds('gpon_known_server_mufa_ids', known);
    } catch (e) {
      console.warn('Mufa guardada localmente; se sincronizará automáticamente:', e);
    }
    broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'mufa', item: newMufa });
    setFeedbackNotice({
      type: 'success',
      message: `Mufa "${newMufa.nombre}" instalada y sincronizada (${newMufa.capacidad_hilos} Hilos).`
    });
    setTimeout(() => setFeedbackNotice(null), 6000);
    fetchData(false);
  };

  const handleSavePoste = async (newPoste: PosteInfraestructura) => {
    setCustomPostes((prev) => {
      const updated = [newPoste, ...prev.filter((p) => p.id_poste !== newPoste.id_poste)];
      try {
        localStorage.setItem('gpon_custom_postes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setDeletedPosteIds((prev) => {
      const updated = prev.filter((id) => id !== newPoste.id_poste);
      try {
        localStorage.setItem('gpon_deleted_poste_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await api.post('/infra/postes', newPoste);
      const known = getKnownServerIds('gpon_known_server_poste_ids');
      known.add(newPoste.id_poste);
      saveKnownServerIds('gpon_known_server_poste_ids', known);
    } catch (e) {
      console.warn('Poste guardado localmente; se sincronizará automáticamente:', e);
    }
    broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'poste', item: newPoste });
    setFeedbackNotice({
      type: 'success',
      message: `Poste "${newPoste.nombre}" (${newPoste.tipo === 'poste_propuesto' ? 'Propuesto' : 'CFE'}) registrado y sincronizado en todos los dispositivos.`
    });
    setTimeout(() => setFeedbackNotice(null), 6000);
    fetchData(false);
  };

  const handleSaveGasa = async (newGasa: GasaReserva) => {
    setCustomGasas((prev) => {
      const updated = [newGasa, ...prev.filter((g) => g.id_gasa !== newGasa.id_gasa)];
      try {
        localStorage.setItem('gpon_custom_gasas', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setDeletedGasaIds((prev) => {
      const updated = prev.filter((id) => id !== newGasa.id_gasa);
      try {
        localStorage.setItem('gpon_deleted_gasa_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await api.post('/infra/gasas', newGasa);
      const known = getKnownServerIds('gpon_known_server_gasa_ids');
      known.add(newGasa.id_gasa);
      saveKnownServerIds('gpon_known_server_gasa_ids', known);
    } catch (e) {
      console.warn('Gasa guardada localmente; se sincronizará automáticamente:', e);
    }
    broadcastRealtimeEvent({ type: 'INFRA_CREATED', category: 'gasa', item: newGasa });
    setFeedbackNotice({
      type: 'success',
      message: `Gasa de reserva técnica "${newGasa.nombre}" (${newGasa.longitud_metros || newGasa.metros_reserva || 30}m) registrada exitosamente.`
    });
    setTimeout(() => setFeedbackNotice(null), 6000);
    fetchData(false);
  };

  // Comparador de datos profundo para detectar cambios reales (puertos, métricas, coordenadas, clientes)
  const haveItemsChanged = <T extends Record<string, any>>(prev: T[], next: T[], idKey: string): boolean => {
    return haveDeepItemsChanged(prev, next, idKey);
  };

  // Cargar NAPs, ODF e Infraestructura (Postes, Mufas, Rutas) sincronizada
  const fetchData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current && !isInitial) return;
    isFetchingRef.current = true;
    try {
      if (isInitial) setLoading(true);

      let napsRes: any, odfRes: any, postesRes: any, mufasRes: any, routesRes: any, gasasRes: any;

      // 1. Intentar sincronización global unificada en 1 sola petición HTTP (ultrarrápida < 200ms)
      let networkData: any = null;
      try {
        const syncRes = await api.get('/network-sync');
        if (syncRes.data?.success && syncRes.data.data) {
          networkData = syncRes.data.data;
        }
      } catch (e) {
        // Fallback a peticiones individuales si /network-sync no está disponible
      }

      if (networkData) {
        napsRes = { data: { success: true, data: networkData.naps || [] } };
        odfRes = { data: { success: true, data: networkData.odf ? [networkData.odf] : [] } };
        postesRes = { data: { success: true, data: networkData.postes || [] } };
        mufasRes = { data: { success: true, data: networkData.mufas || [] } };
        routesRes = { data: { success: true, data: networkData.routes || [] } };
        gasasRes = { data: { success: true, data: networkData.gasas || [] } };
      } else {
        // Peticiones aisladas e individuales como fallback de resiliencia
        [napsRes, odfRes, postesRes, mufasRes, routesRes, gasasRes] = await Promise.all([
          api.get('/naps').catch((err) => {
            console.warn('Fallo al obtener NAPs:', err);
            return { data: { success: false, data: [] } };
          }),
          api.get('/odf').catch((err) => {
            console.warn('Fallo al obtener ODF:', err);
            return { data: { success: false, data: [] } };
          }),
          api.get('/infra/postes').catch((err) => {
            console.warn('Fallo al obtener postes:', err);
            return { data: { success: false, data: [] } };
          }),
          api.get('/infra/mufas').catch((err) => {
            console.warn('Fallo al obtener mufas:', err);
            return { data: { success: false, data: [] } };
          }),
          api.get('/infra/routes').catch((err) => {
            console.warn('Fallo al obtener rutas:', err);
            return { data: { success: false, data: [] } };
          }),
          api.get('/infra/gasas').catch((err) => {
            console.warn('Fallo al obtener gasas:', err);
            return { data: { success: false, data: [] } };
          })
        ]);
      }

      // 0. Sincronización Bidireccional de Cajas NAP
      const localNaps: NapBox[] = getStoredArray<NapBox>('gpon_custom_naps');

      if (napsRes.data?.success && Array.isArray(napsRes.data.data) && napsRes.data.data.length > 0) {
        const serverNaps: NapBox[] = napsRes.data.data.filter((n: any) => n && (n.id_nap || n.identificador));
        const serverIds = new Set(serverNaps.map((n) => safeId(n.id_nap)).filter(Boolean));
        const serverIdents = new Set(serverNaps.map((n) => safeIdent(n.identificador)).filter(Boolean));
        const knownNapIds = getKnownServerIds('gpon_known_server_nap_ids');

        // Subir a la base de datos en Neon cualquier caja creada fuera de línea
        const unsyncedNaps = localNaps.filter(
          (loc) => loc && (safeId(loc.id_nap).startsWith('local-') || safeId(loc.id_nap).startsWith('nap-local-')) &&
                   !knownNapIds.has(loc.id_nap) &&
                   !isDeletedNap(loc, deletedNapIds)
        );

        if (unsyncedNaps.length > 0) {
          for (const unsynced of unsyncedNaps) {
            knownNapIds.add(unsynced.id_nap);
            saveKnownServerIds('gpon_known_server_nap_ids', knownNapIds);
            api.post('/naps', {
              identificador: unsynced.identificador,
              zona: unsynced.zona,
              direccion_texto: unsynced.direccion_texto,
              total_puertos: unsynced.total_puertos,
              coordenadas_gps: unsynced.coordenadas_gps
            })
              .then((res) => {
                if (res.data?.data?.id_nap) {
                  knownNapIds.add(res.data.data.id_nap);
                  saveKnownServerIds('gpon_known_server_nap_ids', knownNapIds);
                }
              })
              .catch((e) => {
                console.warn('Sincronización diferida de NAP al servidor:', e);
              });
          }
        }

        // Mapeo para sobreponer ediciones locales sobre datos antiguos del servidor
        const customNapMap = new Map<string, NapBox>();
        localNaps.forEach((cn) => {
          if (!cn || isDeletedNap(cn, deletedNapIds)) return;
          const kId = safeId(cn.id_nap);
          if (kId) customNapMap.set(kId, cn);
          const kIdent = safeIdent(cn.identificador);
          if (kIdent) customNapMap.set(kIdent, cn);
        });

        // Aplicar cualquier edición local sobre las cajas del servidor
        const mergedServerNaps = serverNaps
          .filter((sn) => !isDeletedNap(sn, deletedNapIds))
          .map((sn) => {
            const localOverride = (sn.id_nap ? customNapMap.get(safeId(sn.id_nap)) : undefined) || 
                                  (sn.identificador ? customNapMap.get(safeIdent(sn.identificador)) : undefined);
            if (localOverride) {
              return {
                ...sn,
                ...localOverride,
                puertos: localOverride.puertos || sn.puertos,
                metricas: localOverride.metricas || sn.metricas
              };
            }
            return sn;
          });

        // Mantener cajas creadas localmente que aún no están en el servidor
        const localOnly = localNaps.filter((loc) => {
          if (!loc || isDeletedNap(loc, deletedNapIds)) return false;
          const idMatch = loc.id_nap ? serverIds.has(safeId(loc.id_nap)) : false;
          const identMatch = loc.identificador ? serverIdents.has(safeIdent(loc.identificador)) : false;
          return !idMatch && !identMatch;
        });

        const mergedNaps = [...mergedServerNaps, ...localOnly];

        setNaps((prev) => {
          if (!haveDeepItemsChanged(prev, mergedNaps, 'id_nap')) return prev;
          saveCachedNaps(mergedNaps);
          return mergedNaps;
        });
        setIsDemoMode(false);
      } else {
        const cached = await offlineDb.cached_naps.toArray().catch(() => []);
        if (cached.length > 0) {
          setNaps((prev) => (haveDeepItemsChanged(prev, cached, 'id_nap') ? cached : prev));
        }
      }

      if (odfRes.data?.success && Array.isArray(odfRes.data.data) && odfRes.data.data.length > 0) {
        setOdf(odfRes.data.data[0]);
      }

      // 1. Sincronización Bidireccional de Postes con Neon DB
      const localPostes: PosteInfraestructura[] = getStoredArray<PosteInfraestructura>('gpon_custom_postes');

      if (postesRes.data?.success && Array.isArray(postesRes.data.data)) {
        const serverPostes: PosteInfraestructura[] = postesRes.data.data.filter((p: any) => p && p.id_poste);
        const serverIds = new Set(serverPostes.map((p) => String(p.id_poste)));
        const knownPosteIds = getKnownServerIds('gpon_known_server_poste_ids');

        // Postes locales nuevos que nunca se subieron al servidor
        const unsyncedPostes = localPostes.filter(
          (loc) => loc && loc.id_poste && !serverIds.has(String(loc.id_poste)) && !knownPosteIds.has(String(loc.id_poste)) && !isDeletedItem(loc.id_poste, deletedPosteIds)
        );

        if (unsyncedPostes.length > 0) {
          for (const unsynced of unsyncedPostes) {
            api.post('/infra/postes', unsynced)
              .then(() => {
                knownPosteIds.add(unsynced.id_poste);
                saveKnownServerIds('gpon_known_server_poste_ids', knownPosteIds);
              })
              .catch((e) => console.warn('Error subiendo poste local:', e));
          }
        }

        serverPostes.forEach((p) => knownPosteIds.add(p.id_poste));
        saveKnownServerIds('gpon_known_server_poste_ids', knownPosteIds);

        const mergedPostes = [
          ...serverPostes.filter((p) => !isDeletedItem(p.id_poste, deletedPosteIds)),
          ...unsyncedPostes
        ];

        setCustomPostes((prev) => {
          if (!haveItemsChanged(prev, mergedPostes, 'id_poste')) return prev;
          try {
            localStorage.setItem('gpon_custom_postes', JSON.stringify(mergedPostes));
          } catch {}
          return mergedPostes;
        });
      }

      // 2. Sincronización Bidireccional de Mufas con Neon DB
      const localMufas: EmpalmeClosure[] = getStoredArray<EmpalmeClosure>('gpon_custom_empalmes');

      if (mufasRes.data?.success && Array.isArray(mufasRes.data.data)) {
        const serverMufas: EmpalmeClosure[] = mufasRes.data.data.filter((m: any) => m && m.id_empalme);
        const serverIds = new Set(serverMufas.map((m) => String(m.id_empalme)));
        const knownMufaIds = getKnownServerIds('gpon_known_server_mufa_ids');

        const unsyncedMufas = localMufas.filter(
          (loc) => loc && loc.id_empalme && !serverIds.has(String(loc.id_empalme)) && !knownMufaIds.has(String(loc.id_empalme)) && !isDeletedItem(loc.id_empalme, deletedMufaIds)
        );

        if (unsyncedMufas.length > 0) {
          for (const unsynced of unsyncedMufas) {
            api.post('/infra/mufas', unsynced)
              .then(() => {
                knownMufaIds.add(unsynced.id_empalme);
                saveKnownServerIds('gpon_known_server_mufa_ids', knownMufaIds);
              })
              .catch((e) => console.warn('Error subiendo mufa local:', e));
          }
        }

        serverMufas.forEach((m) => knownMufaIds.add(m.id_empalme));
        saveKnownServerIds('gpon_known_server_mufa_ids', knownMufaIds);

        const mergedMufas = [
          ...serverMufas.filter((m) => !isDeletedItem(m.id_empalme, deletedMufaIds)),
          ...unsyncedMufas
        ];

        setCustomEmpalmes((prev) => {
          if (!haveItemsChanged(prev, mergedMufas, 'id_empalme')) return prev;
          try {
            localStorage.setItem('gpon_custom_empalmes', JSON.stringify(mergedMufas));
          } catch {}
          return mergedMufas;
        });
      }

      // 3. Sincronización Bidireccional de Rutas Troncales con Neon DB
      const localRoutes: FiberRoute[] = getStoredArray<FiberRoute>('gpon_custom_routes');

      if (routesRes.data?.success && Array.isArray(routesRes.data.data)) {
        const serverRoutes: FiberRoute[] = routesRes.data.data.filter((r: any) => r && r.id_ruta);
        const serverIds = new Set(serverRoutes.map((r) => String(r.id_ruta)));
        const knownRouteIds = getKnownServerIds('gpon_known_server_route_ids');

        const unsyncedRoutes = localRoutes.filter(
          (loc) => loc && loc.id_ruta && !serverIds.has(String(loc.id_ruta)) && !knownRouteIds.has(String(loc.id_ruta)) && !isDeletedItem(loc.id_ruta, deletedRouteIds)
        );

        if (unsyncedRoutes.length > 0) {
          for (const unsynced of unsyncedRoutes) {
            api.post('/infra/routes', unsynced)
              .then(() => {
                knownRouteIds.add(unsynced.id_ruta);
                saveKnownServerIds('gpon_known_server_route_ids', knownRouteIds);
              })
              .catch((e) => console.warn('Error subiendo ruta local:', e));
          }
        }

        serverRoutes.forEach((r) => knownRouteIds.add(r.id_ruta));
        saveKnownServerIds('gpon_known_server_route_ids', knownRouteIds);

        const mergedRoutes = [
          ...serverRoutes.filter((r) => !isDeletedItem(r.id_ruta, deletedRouteIds)),
          ...unsyncedRoutes
        ];

        setCustomRoutes((prev) => {
          if (!haveItemsChanged(prev, mergedRoutes, 'id_ruta')) return prev;
          try {
            localStorage.setItem('gpon_custom_routes', JSON.stringify(mergedRoutes));
          } catch {}
          return mergedRoutes;
        });
      }

      // 4. Sincronización Bidireccional de Gasas de Reserva Técnica con Neon DB
      const localGasas: GasaReserva[] = getStoredArray<GasaReserva>('gpon_custom_gasas');

      if (gasasRes.data?.success && Array.isArray(gasasRes.data.data)) {
        const serverGasas: GasaReserva[] = gasasRes.data.data.filter((g: any) => g && g.id_gasa);
        const serverIds = new Set(serverGasas.map((g) => String(g.id_gasa)));
        const knownGasaIds = getKnownServerIds('gpon_known_server_gasa_ids');

        const unsyncedGasas = localGasas.filter(
          (loc) => loc && loc.id_gasa && !serverIds.has(String(loc.id_gasa)) && !knownGasaIds.has(String(loc.id_gasa)) && !isDeletedItem(loc.id_gasa, deletedGasaIds)
        );

        if (unsyncedGasas.length > 0) {
          for (const unsynced of unsyncedGasas) {
            api.post('/infra/gasas', unsynced)
              .then(() => {
                knownGasaIds.add(unsynced.id_gasa);
                saveKnownServerIds('gpon_known_server_gasa_ids', knownGasaIds);
              })
              .catch((e) => console.warn('Error subiendo gasa local:', e));
          }
        }

        serverGasas.forEach((g) => knownGasaIds.add(g.id_gasa));
        saveKnownServerIds('gpon_known_server_gasa_ids', knownGasaIds);

        const mergedGasas = [
          ...serverGasas.filter((g) => !isDeletedItem(g.id_gasa, deletedGasaIds)),
          ...unsyncedGasas
        ];

        setCustomGasas((prev) => {
          if (!haveItemsChanged(prev, mergedGasas, 'id_gasa')) return prev;
          try {
            localStorage.setItem('gpon_custom_gasas', JSON.stringify(mergedGasas));
          } catch {}
          return mergedGasas;
        });
      }
    } catch (err) {
      console.warn('Sincronización con backend parcial o en caché offline:', err);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) setLoading(false);
    }
  }, [deletedRouteIds, deletedMufaIds, deletedPosteIds, deletedGasaIds, deletedNapIds]);


  // Sincronización en tiempo real reactiva y polling optimizado entre pestañas y dispositivos
  useEffect(() => {
    fetchData(false);

    // 1. Suscripción instantánea a eventos emitidos en cualquier ventana/pestaña o vía SSE multi-dispositivo
    const unsubscribe = subscribeToRealtime((event) => {
      if (event.type === 'DATA_REFRESH_REQUESTED') {
        // Notificación SSE remota de Mac u otro dispositivo -> actualizar mapa inmediatamente (<200ms)
        fetchData(false);
      } else if (event.type === 'NAP_CREATED') {
        setCustomNaps((prev) => {
          const updated = [event.nap, ...prev.filter((n) => n.id_nap !== event.nap.id_nap && n.identificador !== event.nap.identificador)];
          try { localStorage.setItem('gpon_custom_naps', safeJsonStringify(sanitizeNaps(updated))); } catch {}
          return updated;
        });
        setNaps((prev) => {
          const updated = [event.nap, ...prev.filter((n) => n.id_nap !== event.nap.id_nap)];
          saveCachedNaps(updated);
          return updated;
        });
      } else if (event.type === 'NAP_UPDATED') {
        setCustomNaps((prev) => {
          const updated = [event.nap, ...prev.filter((n) => n.id_nap !== event.nap.id_nap && n.identificador !== event.nap.identificador)];
          try { localStorage.setItem('gpon_custom_naps', safeJsonStringify(sanitizeNaps(updated))); } catch {}
          return updated;
        });
        setNaps((prev) => {
          const updated = prev.map((n) => (n.id_nap === event.nap.id_nap ? event.nap : n));
          saveCachedNaps(updated);
          return updated;
        });
        setSelectedNap((curr) => (curr?.id_nap === event.nap.id_nap ? event.nap : curr));
      } else if (event.type === 'NAP_DELETED') {
        setCustomNaps((prev) => {
          const updated = prev.filter((n) => n.id_nap !== event.id_nap);
          try { localStorage.setItem('gpon_custom_naps', safeJsonStringify(sanitizeNaps(updated))); } catch {}
          return updated;
        });
        setNaps((prev) => {
          const updated = prev.filter((n) => n.id_nap !== event.id_nap);
          saveCachedNaps(updated);
          return updated;
        });
        setSelectedNap((curr) => (curr?.id_nap === event.id_nap ? null : curr));
      } else if (event.type === 'CLIENT_ASSIGNED') {
        if (event.nap) {
          setNaps((prev) => {
            const updated = prev.map((n) => (n.id_nap === event.nap!.id_nap ? event.nap! : n));
            saveCachedNaps(updated);
            return updated;
          });
          setSelectedNap((curr) => (curr?.id_nap === event.nap!.id_nap ? event.nap! : curr));
        }
      } else if (event.type === 'CLIENT_RELEASED') {
        setNaps((prev) => {
          const updated = prev.map((n) => {
            if (n.id_nap === event.id_nap) {
              const updatedPorts = (n.puertos || []).map((p) =>
                p.id_puerto === event.id_puerto ? { ...p, estado: 'Libre' as any, cliente: null } : p
              );
              return { ...n, puertos: updatedPorts };
            }
            return n;
          });
          saveCachedNaps(updated);
          return updated;
        });
        setSelectedNap((curr) => {
          if (curr?.id_nap === event.id_nap) {
            const updatedPorts = (curr.puertos || []).map((p) =>
              p.id_puerto === event.id_puerto ? { ...p, estado: 'Libre' as any, cliente: null } : p
            );
            return { ...curr, puertos: updatedPorts };
          }
          return curr;
        });
      } else if (event.type === 'INFRA_CREATED') {
        if (event.category === 'poste') {
          setCustomPostes((prev) => [event.item, ...prev.filter((p) => p.id_poste !== event.item.id_poste)]);
        } else if (event.category === 'mufa') {
          setCustomEmpalmes((prev) => [event.item, ...prev.filter((m) => m.id_empalme !== event.item.id_empalme)]);
        } else if (event.category === 'gasa') {
          setCustomGasas((prev) => [event.item, ...prev.filter((g) => g.id_gasa !== event.item.id_gasa)]);
        } else if (event.category === 'route') {
          setCustomRoutes((prev) => [event.item, ...prev.filter((r) => r.id_ruta !== event.item.id_ruta)]);
        }
      } else if (event.type === 'INFRA_DELETED') {
        if (event.category === 'poste') {
          setCustomPostes((prev) => prev.filter((p) => p.id_poste !== event.id));
        } else if (event.category === 'mufa') {
          setCustomEmpalmes((prev) => prev.filter((m) => m.id_empalme !== event.id));
        } else if (event.category === 'gasa') {
          setCustomGasas((prev) => prev.filter((g) => g.id_gasa !== event.id));
        } else if (event.category === 'route') {
          setCustomRoutes((prev) => prev.filter((r) => r.id_ruta !== event.id));
        }
      }
    });

    // 2. Refrescar silenciosamente al regresar de otra pestaña (con debounce de 15s para no saturar al interactuar)
    let lastVisibilitySync = 0;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastVisibilitySync > 15000) {
          lastVisibilitySync = now;
          fetchData(false);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Polling de respaldo a 35s cuando la pestaña está activa
    const syncTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(false);
      }
    }, 35000);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(syncTimer);
    };
  }, [fetchData]);

  const refreshSelectedNap = async () => {
    if (!selectedNap) return;
    try {
      const res = await api.get(`/naps/${selectedNap.id_nap}`);
      if (res.data.success) {
        setSelectedNap(res.data.data);
        setNaps((prev) => {
          const updated = prev.map((n) => (n.id_nap === selectedNap.id_nap ? res.data.data : n));
          saveCachedNaps(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error('Error refrescando NAP:', e);
    }
  };

  // Cálculo de ruta OSRM
  const calculateRouteToNap = useCallback(
    async (targetNap: NapBox, type: 'odf' | 'user' = originType, userCoordOverride?: Coordinates) => {
      if (!targetNap.coordenadas_gps) {
        setFeedbackNotice({
          type: 'error',
          message: 'Esta caja NAP no tiene coordenadas GPS registradas para trazar ruta.'
        });
        setTimeout(() => setFeedbackNotice(null), 4000);
        return;
      }

      let origin: Coordinates | null = null;

      if (type === 'user') {
        origin = userCoordOverride || userCoordinates;
        if (!origin) {
          if (navigator.geolocation) {
            setIsRouteLoading(true);
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserCoordinates(userLoc);
                calculateRouteToNap(targetNap, 'user', userLoc);
              },
              (err) => {
                console.warn('GPS no disponible en navegador, usando Central:', err);
                setOriginType('odf');
                if (odf?.coordenadas_gps) {
                  calculateRouteToNap(targetNap, 'odf');
                }
              }
            );
            return;
          } else {
            origin = odf?.coordenadas_gps || null;
          }
        }
      } else {
        origin = odf?.coordenadas_gps || null;
      }

      if (!origin) {
        setFeedbackNotice({
          type: 'error',
          message: 'No se cuenta con las coordenadas de origen de la Central ODF para trazar ruta.'
        });
        setTimeout(() => setFeedbackNotice(null), 4000);
        return;
      }

      try {
        setIsRouteLoading(true);
        setIsRouteActive(true);
        const result = await fetchDrivingRoute(origin, targetNap.coordenadas_gps);
        setRouteResult(result);
        scrollToMap();
      } catch (err) {
        console.error('Error al calcular ruta vial:', err);
      } finally {
        setIsRouteLoading(false);
      }
    },
    [odf, originType, userCoordinates]
  );

  const handleRequestRoute = (nap: NapBox) => {
    setSelectedNap(nap);
    calculateRouteToNap(nap, originType);
  };

  const handleOriginChange = (type: 'odf' | 'user') => {
    setOriginType(type);
    if (selectedNap) {
      calculateRouteToNap(selectedNap, type);
    }
  };

  const handleClearRoute = () => {
    setIsRouteActive(false);
    setRouteResult(null);
  };

  const handleConfirmDeleteNap = async (targetNap: NapBox) => {
    setIsDeletingNap(true);
    try {
      const deleteId = targetNap.id_nap || targetNap.identificador;

      // 1. Intentar eliminación remota en backend de forma no bloqueante ante latencia o suspensión de Render
      try {
        await api.delete(`/naps/${deleteId}`);
      } catch (backendErr: any) {
        console.warn('Aviso: eliminación remota en backend con latencia o sin conexión, procediendo con baja definitiva local:', backendErr?.message);
      }

      // 2. Eliminar de base local IndexedDB
      try {
        await offlineDb.cached_naps.delete(targetNap.id_nap);
      } catch (dbErr) {
        console.warn('Error eliminando de Dexie:', dbErr);
      }

      // 3. Actualizar estado en memoria y caché persistente
      setCustomNaps((prev) => {
        const updated = prev.filter((n) => n.id_nap !== targetNap.id_nap && n.identificador !== targetNap.identificador);
        try {
          localStorage.setItem('gpon_custom_naps', safeJsonStringify(sanitizeNaps(updated)));
        } catch {}
        return updated;
      });
      setNaps((prev) => {
        const updated = prev.filter((n) => n.id_nap !== targetNap.id_nap && n.identificador !== targetNap.identificador);
        saveCachedNaps(updated);
        return updated;
      });
      setDeletedNapIds((prev) => {
        const next = Array.from(new Set([...prev, targetNap.id_nap, targetNap.identificador].filter(Boolean)));
        try {
          localStorage.setItem('gpon_deleted_nap_ids', JSON.stringify(next));
        } catch {}
        return next;
      });
      broadcastRealtimeEvent({ type: 'NAP_DELETED', id_nap: targetNap.id_nap });

      if (selectedNap?.id_nap === targetNap.id_nap || selectedNap?.identificador === targetNap.identificador) {
        setSelectedNap(null);
      }

      setFeedbackNotice({
        type: 'success',
        message: `Caja NAP ${targetNap.identificador} dada de baja exitosamente de la red.`
      });
      setTimeout(() => setFeedbackNotice(null), 5000);

      setDeletingNap(null);
    } catch (err: any) {
      console.error('Error al dar de baja caja NAP:', err);
      setFeedbackNotice({
        type: 'error',
        message: `Error al eliminar caja: ${err?.message || 'Error inesperado'}`
      });
    } finally {
      setIsDeletingNap(false);
    }
  };

  const handleConfirmDeleteElement = async () => {
    if (!deletingElement) return;
    setIsDeletingElement(true);
    const { type, id, name } = deletingElement;

    try {
      if (type === 'troncal') {
        try {
          await api.delete(`/infra/routes/${id}`);
        } catch (e) {
          console.warn('Error eliminando ruta en backend:', e);
        }
        setDeletedRouteIds((prev) => {
          const next = Array.from(new Set([...prev, id]));
          localStorage.setItem('gpon_deleted_route_ids', JSON.stringify(next));
          return next;
        });
        setCustomRoutes((prev) => {
          const next = prev.filter((r) => r.id_ruta !== id);
          localStorage.setItem('gpon_custom_routes', JSON.stringify(next));
          return next;
        });
        broadcastRealtimeEvent({ type: 'INFRA_DELETED', category: 'route', id });
        setFeedbackNotice({
          type: 'success',
          message: `Línea/Ruta "${name}" eliminada correctamente de la red.`
        });
      } else if (type === 'mufa') {
        try {
          await api.delete(`/infra/mufas/${id}`);
        } catch (e) {
          console.warn('Error eliminando mufa en backend:', e);
        }
        setDeletedMufaIds((prev) => {
          const next = Array.from(new Set([...prev, id]));
          localStorage.setItem('gpon_deleted_mufa_ids', JSON.stringify(next));
          return next;
        });
        setCustomEmpalmes((prev) => {
          const next = prev.filter((m) => m.id_empalme !== id);
          localStorage.setItem('gpon_custom_empalmes', JSON.stringify(next));
          return next;
        });
        broadcastRealtimeEvent({ type: 'INFRA_DELETED', category: 'mufa', id });
        setFeedbackNotice({
          type: 'success',
          message: `Cierre de empalme / Mufa "${name}" eliminada correctamente.`
        });
      } else if (type === 'poste') {
        try {
          await api.delete(`/infra/postes/${id}`);
        } catch (e) {
          console.warn('Error eliminando poste en backend:', e);
        }
        setDeletedPosteIds((prev) => {
          const next = Array.from(new Set([...prev, id]));
          localStorage.setItem('gpon_deleted_poste_ids', JSON.stringify(next));
          return next;
        });
        setCustomPostes((prev) => {
          const next = prev.filter((p) => p.id_poste !== id);
          localStorage.setItem('gpon_custom_postes', JSON.stringify(next));
          return next;
        });
        broadcastRealtimeEvent({ type: 'INFRA_DELETED', category: 'poste', id });
        setFeedbackNotice({
          type: 'success',
          message: `Poste de infraestructura "${name}" eliminado correctamente.`
        });
      } else if (type === 'gasa') {
        try {
          await api.delete(`/infra/gasas/${id}`);
        } catch (e) {
          console.warn('Error eliminando gasa en backend:', e);
        }
        setDeletedGasaIds((prev) => {
          const next = Array.from(new Set([...prev, id]));
          localStorage.setItem('gpon_deleted_gasa_ids', JSON.stringify(next));
          return next;
        });
        setCustomGasas((prev) => {
          const next = prev.filter((g) => g.id_gasa !== id);
          localStorage.setItem('gpon_custom_gasas', JSON.stringify(next));
          return next;
        });
        broadcastRealtimeEvent({ type: 'INFRA_DELETED', category: 'gasa', id });
        setFeedbackNotice({
          type: 'success',
          message: `Gasa de reserva técnica "${name}" eliminada correctamente.`
        });
      }

      setDeletingElement(null);
      setTimeout(() => setFeedbackNotice(null), 5000);
      fetchData(false);
    } catch (err: any) {
      console.error('Error al eliminar elemento:', err);
      setFeedbackNotice({
        type: 'error',
        message: `Error al eliminar: ${err?.message || 'Error de conexión'}`
      });
    } finally {
      setIsDeletingElement(false);
    }
  };

  // Filtrado de NAPs en el listado
  const filteredNaps = naps.filter((nap) => {
    const matchSearch =
      (nap?.identificador || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nap?.zona || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filterStatus === 'disponible') {
      return (nap.metricas?.porcentajeSaturacion ?? 0) < 80;
    }
    if (filterStatus === 'alerta') {
      const p = nap.metricas?.porcentajeSaturacion ?? 0;
      return p >= 80 && p < 100;
    }
    if (filterStatus === 'saturada') {
      return (nap.metricas?.porcentajeSaturacion ?? 0) >= 100;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-28 sm:pb-8 space-y-4">
      {/* Notificación de feedback (éxito o error) */}
      {feedbackNotice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all animate-fadeIn ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <span className="font-semibold">{feedbackNotice.message}</span>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Barra de Filtros, Búsqueda y Herramientas Responsiva */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl shadow-sm dark:shadow-md space-y-2.5 w-full transition-colors">
        {/* Fila 1: Búsqueda y Filtros de Estado + Herramientas de Utilidad (Bitácora Km y Actualizar) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por NAP o zona (ej. NAP-SJR-01)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden sm:block" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="todos">Todos los Estados</option>
                <option value="disponible">Disponibles (&lt;80%)</option>
                <option value="alerta">En Alerta (&ge;80%)</option>
                <option value="saturada">Saturadas (100%)</option>
              </select>
            </div>
          </div>

          {/* Botones Descargar KMZ, Expandir Mapa y Actualizar a la derecha */}
          <div className="flex items-center justify-end shrink-0 gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsMapExpanded(true);
                setIsExpandedDrawerOpen(false);
              }}
              className="flex items-center justify-center gap-1 sm:gap-1.5 h-9 min-h-[36px] bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-2.5 sm:px-3 rounded-lg border border-sky-500 transition-all shadow-xs active:scale-95 cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
              title="Expandir el mapa a pantalla completa y ocultar paneles"
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Expandir Mapa</span>
              <span className="sm:hidden">Expandir</span>
            </button>

            {/* Selector de archivo KMZ / KML oculto */}
            <input
              type="file"
              ref={kmzFileInputRef}
              accept=".kmz,.kml"
              onChange={handleKmzFileSelect}
              className="hidden"
            />

            {/* Botón Subir KMZ con Vista Previa */}
            <button
              onClick={() => kmzFileInputRef.current?.click()}
              disabled={isParsingKmz}
              className="flex items-center justify-center gap-1 sm:gap-1.5 h-9 min-h-[36px] bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-2 sm:px-3 rounded-lg border border-teal-500 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
              title="Subir archivo KMZ o KML de Google Earth para vista previa, edición y agregación a la red"
            >
              <Upload className={`w-3.5 h-3.5 shrink-0 ${isParsingKmz ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isParsingKmz ? 'Cargando...' : 'Subir KMZ'}</span>
              <span className="sm:hidden">{isParsingKmz ? 'KMZ...' : 'Subir'}</span>
            </button>

            <button
              onClick={handleExportKmz}
              disabled={isExportingKmz}
              className="flex items-center justify-center gap-1 sm:gap-1.5 h-9 min-h-[36px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2 sm:px-3 rounded-lg border border-emerald-500 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
              title="Descargar toda la infraestructura geográfica de la red (cajas NAP, fibra óptica, mufas y postes) en archivo KMZ para Google Earth"
            >
              <Download className={`w-3.5 h-3.5 shrink-0 ${isExportingKmz ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isExportingKmz ? 'Generando...' : 'Descargar KMZ'}</span>
              <span className="sm:hidden">{isExportingKmz ? 'KMZ...' : 'KMZ'}</span>
            </button>

            <button
              onClick={() => {
                fetchData(true);
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then((regs) => {
                    regs.forEach((r) => r.update());
                  }).catch(() => {});
                }
                setFeedbackNotice({
                  type: 'success',
                  message: 'Sincronizando elementos con la base central y verificando actualizaciones...'
                });
                setTimeout(() => setFeedbackNotice(null), 4000);
              }}
              disabled={loading}
              className="flex items-center justify-center gap-1 sm:gap-1.5 h-9 min-h-[36px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2 sm:px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
              title="Actualizar datos de la red y comprobar nueva versión"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Elementos de Despliegue de Red y Trazado Centrados y con sus Colores Originales */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap pb-0.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Botón de Arquitectura Lógica GPON OLT / ODF y Trazabilidad */}
          <button
            onClick={() => setIsOltModalOpen(true)}
            className="flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs px-3 rounded-lg border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            title="Abrir Arquitectura Lógica GPON: Chasis OLT Activo, Puertos PON, Distribuidor ODF, Trazabilidad Extremo a Extremo y Presupuesto Óptico"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Mapeo Lógico OLT / ODF</span>
          </button>

          {/* Botón de Simbología Estándar y Metrajes */}
          <button
            onClick={() => setIsLegendModalOpen(true)}
            className="flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs px-3 rounded-lg border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            title="Ver norma de simbología (triángulos, mufas torpedo, gasas) y cómputo de metrajes totales en ML y km"
          >
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Simbología</span>
          </button>

          {/* Botón para crear nueva línea troncal o ramal (Trazado interactivo de curvas o arrastre) */}
          <button
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'troncal');
              e.dataTransfer.setData('application/gpon-element', 'troncal');
            }}
            onClick={() => {
              if (isDrawingRoute) {
                setIsDrawingRoute(false);
              } else {
                setPlacementMode(null);
                setIsDrawingRoute(true);
              }
            }}
            className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs px-3 rounded-lg border border-purple-300 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
              isDrawingRoute ? 'ring-2 ring-purple-500 shadow-md ring-offset-1 animate-pulse bg-purple-100 dark:bg-purple-900/50' : ''
            }`}
            title="Haz clic para trazar puntos y curvas en el mapa o arrastra para ubicar el punto inicial de la línea troncal"
          >
            <GripVertical className="w-3 h-3 text-purple-500/70 shrink-0" />
            <Ruler className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{isDrawingRoute ? 'Trazando...' : '+ Troncal / Ramal'}</span>
          </button>

          {/* Botón para crear nueva mufa de empalme (Arrastrable hacia el mapa) */}
          <button
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'mufa');
              e.dataTransfer.setData('application/gpon-element', 'mufa');
            }}
            onClick={() => {
              setIsDrawingRoute(false);
              setPlacementMode(placementMode === 'mufa' ? null : 'mufa');
            }}
            className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs px-3 rounded-lg border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
              placementMode === 'mufa' ? 'ring-2 ring-amber-500 shadow-md ring-offset-1 animate-pulse' : ''
            }`}
            title="Arrastra hacia el mapa satelital o haz clic para ubicar una nueva mufa torpedo"
          >
            <GripVertical className="w-3 h-3 text-amber-500/70 shrink-0" />
            <GitCommit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>+ Mufa</span>
          </button>

          {/* Botón para registrar nuevo poste (Arrastrable hacia el mapa) */}
          <button
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'poste');
              e.dataTransfer.setData('application/gpon-element', 'poste');
            }}
            onClick={() => {
              setIsDrawingRoute(false);
              setPlacementMode(placementMode === 'poste' ? null : 'poste');
            }}
            className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-rose-50 to-red-50 dark:from-slate-800 dark:to-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs px-3 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
              placementMode === 'poste' ? 'ring-2 ring-rose-500 shadow-md ring-offset-1 animate-pulse' : ''
            }`}
            title="Arrastra hacia el mapa satelital o haz clic para ubicar un nuevo poste"
          >
            <GripVertical className="w-3 h-3 text-rose-500/70 shrink-0" />
            <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>+ Poste</span>
          </button>

          {/* Botón para registrar nueva gasa de reserva (Arrastrable hacia el mapa) */}
          <button
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'gasa');
              e.dataTransfer.setData('application/gpon-element', 'gasa');
            }}
            onClick={() => {
              setIsDrawingRoute(false);
              setPlacementMode(placementMode === 'gasa' ? null : 'gasa');
            }}
            className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs px-3 rounded-lg border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
              placementMode === 'gasa' ? 'ring-2 ring-blue-500 shadow-md ring-offset-1 animate-pulse' : ''
            }`}
            title="Arrastra hacia el mapa satelital o haz clic para ubicar una nueva gasa de reserva técnica"
          >
            <GripVertical className="w-3 h-3 text-blue-500/70 shrink-0" />
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm leading-none shrink-0">∞</span>
            <span>+ Gasa</span>
          </button>

          {/* Botón para registrar nueva caja NAP con icono de cajita */}
          {user?.rol !== 'Tecnico' && (
            <button
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', 'nap');
                e.dataTransfer.setData('application/gpon-element', 'nap');
              }}
              onClick={() => {
                setIsDrawingRoute(false);
                setPlacementMode(placementMode === 'nap' ? null : 'nap');
              }}
              className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs px-3 rounded-lg border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
                placementMode === 'nap' ? 'ring-2 ring-sky-500 shadow-md ring-offset-1 animate-pulse' : ''
              }`}
              title="Arrastra hacia el mapa satelital o haz clic para ubicar una nueva caja NAP"
            >
              <GripVertical className="w-3 h-3 text-sky-500/70 shrink-0" />
              <Box className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>+ Caja NAP</span>
            </button>
          )}

          {/* Botón Ruta a Caja (si hay caja seleccionada) */}
          {selectedNap && (
            <button
              onClick={() => {
                if (isRouteActive) {
                  handleClearRoute();
                } else {
                  handleRequestRoute(selectedNap);
                }
              }}
              className={`flex items-center justify-center gap-1.5 h-9 text-xs font-semibold px-3 rounded-lg border transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 ${
                isRouteActive
                  ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'
                  : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
              }`}
              title="Calcular ruta vial de llegada desde la Empresa hacia la caja seleccionada"
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>{isRouteActive ? 'Ocultar Ruta' : 'Ruta a Caja'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Mapa + Panel de NAP y 16 Puertos con Soporte para Modo Expandido Pantalla Completa */}
      <div
        className={`transition-all duration-300 ${
          isMapExpanded
            ? 'fixed inset-0 z-[9990] bg-slate-100 dark:bg-slate-950 w-screen h-screen overflow-hidden'
            : 'grid grid-cols-1 lg:grid-cols-12 gap-4 items-start'
        }`}
      >
        {/* Mapa Leaflet interactivo */}
        <div
          className={`relative ${
            isMapExpanded
              ? 'w-full h-full'
              : 'lg:col-span-7 xl:col-span-8 h-[550px] lg:h-[680px]'
          }`}
        >
          {/* Barra Superior Flotante en Modo Expandido (Restaurar Pantalla + Opciones con Soporte Modo Oscuro) */}
          {isMapExpanded && (
            <div className="absolute top-2.5 left-14 sm:left-16 right-28 sm:right-36 z-[450] flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
              {/* Botón Salir / Restaurar Pantalla */}
              <button
                onClick={() => {
                  setIsMapExpanded(false);
                  setIsExpandedDrawerOpen(false);
                }}
                className="bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-xl shadow-md border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all backdrop-blur shrink-0 cursor-pointer active:scale-95"
                title="Volver a la vista normal con paneles"
              >
                <Minimize2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="hidden sm:inline">Restaurar Pantalla</span>
                <span className="sm:hidden">Salir</span>
              </button>

              {/* En teléfonos (< sm): Botón directo para abrir Herramientas sin abarrotar la pantalla */}
              <button
                onClick={() => setIsExpandedDrawerOpen(true)}
                className="sm:hidden bg-white/95 dark:bg-slate-900/95 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2.5 py-1.5 rounded-xl shadow-md border border-sky-300 dark:border-sky-800 flex items-center gap-1 text-xs font-bold transition-all backdrop-blur shrink-0 cursor-pointer active:scale-95"
                title="Abrir menú de herramientas de red"
              >
                <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Herramientas</span>
              </button>

              <div className="hidden sm:block h-5 w-px bg-slate-300/80 dark:bg-slate-700 shrink-0 mx-0.5" />

              {/* Cuando se está trazando troncal o ubicando un elemento, mostrar barra limpia y enfocada */}
              {isDrawingRoute ? (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 font-bold text-xs shadow-xs animate-pulse">
                    <Ruler className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Trazando Línea Troncal</span>
                  </div>
                  <button
                    onClick={handleCancelDrawingRoute}
                    className="bg-white/95 dark:bg-slate-900/95 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-xl shadow-xs border border-red-200 dark:border-red-800 flex items-center gap-1 text-xs font-bold transition-all backdrop-blur shrink-0 cursor-pointer active:scale-95"
                    title="Cancelar trazado de fibra"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                </div>
              ) : placementMode ? (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs animate-pulse ${
                    placementMode === 'poste'
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : placementMode === 'mufa'
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : placementMode === 'gasa'
                      ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                  }`}>
                    {placementMode === 'poste' && <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                    {placementMode === 'mufa' && <GitCommit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                    {placementMode === 'gasa' && <span className="font-bold text-blue-600 dark:text-blue-400 text-sm leading-none shrink-0">∞</span>}
                    {placementMode === 'nap' && <Box className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                    <span>
                      {placementMode === 'poste'
                        ? 'Ubicando Poste'
                        : placementMode === 'mufa'
                        ? 'Ubicando Mufa'
                        : placementMode === 'gasa'
                        ? 'Ubicando Gasa'
                        : 'Ubicando Caja NAP'}
                    </span>
                  </div>
                  <button
                    onClick={handleCancelPlacement}
                    className="bg-white/95 dark:bg-slate-900/95 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-xl shadow-xs border border-red-200 dark:border-red-800 flex items-center gap-1 text-xs font-bold transition-all backdrop-blur shrink-0 cursor-pointer active:scale-95"
                    title="Cancelar colocación"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                </div>
              ) : (
                /* Botones de herramientas completas para tablets y PC con Modo Oscuro */
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => setIsOltModalOpen(true)}
                    className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors"
                    title="Mapeo Lógico GPON: OLT, Puertos PON, ODF y Trazabilidad"
                  >
                    <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Mapeo Lógico</span>
                  </button>

                  <button
                    onClick={() => setIsLegendModalOpen(true)}
                    className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors"
                    title="Ver norma de simbología y metrajes"
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Simbología</span>
                  </button>

                  <button
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'troncal');
                      e.dataTransfer.setData('application/gpon-element', 'troncal');
                    }}
                    onClick={() => {
                      setPlacementMode(null);
                      setIsDrawingRoute(true);
                    }}
                    className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors"
                    title="Trazar ruta troncal o ramal"
                  >
                    <Ruler className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>+ Troncal</span>
                  </button>

                  <button
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'mufa');
                      e.dataTransfer.setData('application/gpon-element', 'mufa');
                    }}
                    onClick={() => {
                      setIsDrawingRoute(false);
                      setPlacementMode(placementMode === 'mufa' ? null : 'mufa');
                    }}
                    className={`flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors ${
                      placementMode === 'mufa' ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/60' : ''
                    }`}
                    title="Ubicar mufa torpedo"
                  >
                    <GitCommit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>+ Mufa</span>
                  </button>

                  <button
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'poste');
                      e.dataTransfer.setData('application/gpon-element', 'poste');
                    }}
                    onClick={() => {
                      setIsDrawingRoute(false);
                      setPlacementMode(placementMode === 'poste' ? null : 'poste');
                    }}
                    className={`flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors ${
                      placementMode === 'poste' ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/60' : ''
                    }`}
                    title="Ubicar poste"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>+ Poste</span>
                  </button>

                  <button
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'gasa');
                      e.dataTransfer.setData('application/gpon-element', 'gasa');
                    }}
                    onClick={() => {
                      setIsDrawingRoute(false);
                      setPlacementMode(placementMode === 'gasa' ? null : 'gasa');
                    }}
                    className={`flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-blue-300 dark:border-blue-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors ${
                      placementMode === 'gasa' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/60' : ''
                    }`}
                    title="Ubicar gasa de reserva técnica"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm leading-none shrink-0">∞</span>
                    <span>+ Gasa</span>
                  </button>

                  {user?.rol !== 'Tecnico' && (
                    <button
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', 'nap');
                        e.dataTransfer.setData('application/gpon-element', 'nap');
                      }}
                      onClick={() => {
                        setIsDrawingRoute(false);
                        setPlacementMode(placementMode === 'nap' ? null : 'nap');
                      }}
                      className={`flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors ${
                        placementMode === 'nap' ? 'ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950/60' : ''
                      }`}
                      title="Ubicar nueva caja NAP"
                    >
                      <Box className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span>+ Caja NAP</span>
                    </button>
                  )}

                  {selectedNap && (
                    <button
                      onClick={() => {
                        if (isRouteActive) {
                          handleClearRoute();
                        } else {
                          handleRequestRoute(selectedNap);
                        }
                      }}
                      className={`flex items-center gap-1 font-bold text-xs px-2.5 py-1.5 rounded-xl border shadow-xs backdrop-blur shrink-0 cursor-pointer active:scale-95 transition-colors ${
                        isRouteActive
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white/95 dark:bg-slate-900/95 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                      }`}
                      title="Calcular ruta a la caja seleccionada"
                    >
                      <Navigation className="w-3.5 h-3.5 shrink-0" />
                      <span>{isRouteActive ? 'Ocultar Ruta' : 'Ruta a Caja'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pestaña lateral flotante centrada verticalmente */}
          {isMapExpanded && (
            <button
              onClick={() => setIsExpandedDrawerOpen(!isExpandedDrawerOpen)}
              className={`absolute top-1/2 -translate-y-1/2 right-0 z-[450] bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 pl-3 pr-2.5 py-3 rounded-l-2xl shadow-xl border-y border-l border-slate-300 dark:border-slate-700 flex items-center gap-2 text-xs font-bold transition-all duration-300 backdrop-blur cursor-pointer hover:border-sky-400 dark:hover:border-sky-500 ${
                isExpandedDrawerOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
              }`}
              title={isExpandedDrawerOpen ? 'Ocultar panel' : 'Deslizar panel de opciones y puertos'}
            >
              <ChevronLeft className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-pulse" />
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline font-bold">Opciones y Puertos</span>
              <span className="sm:hidden font-bold">Menú</span>
            </button>
          )}

          <GponMap
            naps={filteredNaps}
            odf={odf}
            selectedNap={selectedNap}
            onSelectNap={(nap) => {
              setSelectedNap(nap);
              if (isRouteActive) {
                calculateRouteToNap(nap, originType);
              }
            }}
            onViewPorts={(nap) => {
              setSelectedNap(nap);
              if (isMapExpanded) {
                setIsExpandedDrawerOpen(true);
              } else {
                scrollToPortsPanel();
              }
            }}
            onOpenGpsModal={(nap) => setGpsModalNap(nap)}
            activeRoute={isRouteActive ? routeResult : null}
            onRequestRoute={handleRequestRoute}
            onClearRoute={handleClearRoute}
            fiberRoutes={customRoutes}
            empalmes={customEmpalmes}
            customPostes={customPostes}
            customGasas={customGasas}
            onDeleteNapRequest={(nap) => setDeletingNap(nap)}
            onDeleteRouteRequest={(route) =>
              setDeletingElement({
                type: 'troncal',
                id: route.id_ruta,
                name: route.nombre,
                details: `${route.subtipo || route.tipo} (${route.distancia_km || 0} km)`
              })
            }
            onDeleteMufaRequest={(mufa) =>
              setDeletingElement({
                type: 'mufa',
                id: mufa.id_empalme,
                name: mufa.nombre,
                details: `Mufa/Cierre (${mufa.capacidad_hilos || 0} hilos)`
              })
            }
            onDeletePosteRequest={(poste) =>
              setDeletingElement({
                type: 'poste',
                id: poste.id_poste,
                name: poste.nombre,
                details: `${poste.tipo === 'poste_propuesto' ? 'Poste Propuesto' : 'Poste CFE'} (${poste.codigo || 'Sin código'})`
              })
            }
            onDeleteGasaRequest={(gasa) =>
              setDeletingElement({
                type: 'gasa',
                id: gasa.id_gasa,
                name: gasa.nombre,
                details: `Reserva técnica: ${gasa.longitud_metros || gasa.metros_reserva || 30} metros.`
              })
            }
            onEditRouteRequest={(route) => setEditingRoute(route)}
            onEditMufaRequest={(mufa) => setEditingMufa(mufa)}
            onEditPosteRequest={(poste) => setEditingPoste(poste)}
            onEditGasaRequest={(gasa) => setEditingGasa(gasa)}
            onEditNapRequest={(nap) => setEditingNap(nap)}
            deletedRouteIds={deletedRouteIds}
            deletedMufaIds={deletedMufaIds}
            deletedPosteIds={deletedPosteIds}
            deletedGasaIds={deletedGasaIds}
            
            placementMode={placementMode}
            onPlaceElement={handlePlaceElement}
            onCancelPlacement={handleCancelPlacement}
            tempPlacementPin={tempPlacementPin}
            onUpdateTempPin={handleUpdateTempPin}
            isDrawingRoute={isDrawingRoute}
            routeDraftPoints={routeDraftPoints}
            onAddRoutePoint={handleAddRoutePoint}
            onUpdateRoutePoint={handleUpdateRoutePoint}
            onRemoveLastRoutePoint={handleRemoveLastRoutePoint}
            onClearRoutePoints={handleClearRoutePoints}
            onFinishDrawingRoute={handleFinishDrawingRoute}
            onCancelDrawingRoute={handleCancelDrawingRoute}
            onOpenOltModal={() => setIsOltModalOpen(true)}
          />
        </div>

        {/* Overlay para cerrar en móvil cuando el cajón está abierto */}
        {isMapExpanded && isExpandedDrawerOpen && (
          <div
            onClick={() => setIsExpandedDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[490] lg:hidden"
          />
        )}

        {/* Panel lateral normal O Cajón Deslizable en Modo Pantalla Completa */}
        <div
          id="panel-puertos-nap"
          ref={portsPanelRef}
          className={
            isMapExpanded
              ? `fixed top-0 right-0 bottom-0 w-full sm:w-[420px] md:w-[480px] max-w-[95vw] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-300 dark:border-slate-800 z-[500] flex flex-col transition-transform duration-300 ease-out overflow-hidden ${
                  isExpandedDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
                }`
              : 'lg:col-span-5 xl:col-span-4 space-y-4 scroll-mt-24'
          }
        >
          {/* Cabecera del Cajón en Modo Expandido con Modo Oscuro */}
          {isMapExpanded && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100">Panel de Herramientas y Puertos</span>
              </div>
              <button
                onClick={() => setIsExpandedDrawerOpen(false)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Ocultar y ver mapa completo"
              >
                <span>Ocultar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className={isMapExpanded ? 'flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-white dark:bg-slate-950' : 'space-y-4'}>
            {/* Sección de Herramientas de Red para Móvil y Escritorio */}
            {isMapExpanded && (
              <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Herramientas Rápidas de Red
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setIsLegendModalOpen(true);
                      setIsExpandedDrawerOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs text-left cursor-pointer transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Simbología</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlacementMode(null);
                      setIsDrawingRoute(!isDrawingRoute);
                      setIsExpandedDrawerOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800/60 text-xs font-bold shadow-2xs text-left cursor-pointer transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>{isDrawingRoute ? 'Trazando...' : '+ Troncal'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawingRoute(false);
                      setPlacementMode(placementMode === 'mufa' ? null : 'mufa');
                      setIsExpandedDrawerOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/60 text-xs font-bold shadow-2xs text-left cursor-pointer transition-colors"
                  >
                    <GitCommit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>+ Mufa</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawingRoute(false);
                      setPlacementMode(placementMode === 'poste' ? null : 'poste');
                      setIsExpandedDrawerOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800/60 text-xs font-bold shadow-2xs text-left cursor-pointer transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>+ Poste</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawingRoute(false);
                      setPlacementMode(placementMode === 'gasa' ? null : 'gasa');
                      setIsExpandedDrawerOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800/60 text-xs font-bold shadow-2xs text-left cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm leading-none shrink-0">∞</span>
                    <span>+ Gasa</span>
                  </button>

                  {user?.rol !== 'Tecnico' && (
                    <button
                      onClick={() => {
                        setIsDrawingRoute(false);
                        setPlacementMode(placementMode === 'nap' ? null : 'nap');
                        setIsExpandedDrawerOpen(false);
                      }}
                      className="col-span-2 flex items-center justify-center gap-1.5 p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg border border-sky-600 text-xs font-bold shadow-sm cursor-pointer transition-colors"
                    >
                      <Box className="w-4 h-4 shrink-0" />
                      <span>+ Caja NAP</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Tarjeta de Navegación cuando está activa la ruta */}
            {isRouteActive && selectedNap && (
              <RouteNavigationCard
                nap={selectedNap}
                odf={odf}
                routeResult={routeResult}
                isLoading={isRouteLoading}
                originType={originType}
                userCoordinates={userCoordinates}
                onOriginChange={handleOriginChange}
                onClose={handleClearRoute}
              />
            )}

            {selectedNap ? (
              <NapPortMatrix
                nap={selectedNap}
                onPortSelectToAssign={(port) => setAssigningPort(port)}
                onRefreshNap={refreshSelectedNap}
                onScrollToMap={scrollToMap}
                onRequestRoute={handleRequestRoute}
                onDeleteNapRequest={(nap) => setDeletingNap(nap)}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-3 shadow-sm dark:shadow-xl transition-colors">
                <div className="w-12 h-12 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Selecciona una Caja NAP</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Haz clic en cualquier marcador del mapa cartográfico o elije una caja de la lista rápida a continuación para inspeccionar su panel de 16 puertos.
                </p>

                {/* Lista rápida de NAPs para acceso inmediato */}
                <div className="pt-2 text-left space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    Cajas NAP Disponibles ({filteredNaps.length}):
                  </span>
                  {filteredNaps.map((n) => (
                    <button
                      key={n.id_nap}
                      onClick={() => {
                        setSelectedNap(n);
                        if (isMapExpanded) {
                          setIsExpandedDrawerOpen(true);
                        } else {
                          scrollToPortsPanel();
                        }
                      }}
                      className="w-full text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-xs text-sky-600 dark:text-sky-400 block">
                          {n.identificador}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{n.zona}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          (n.metricas?.porcentajeSaturacion ?? 0) >= 80
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {n.metricas?.porcentajeSaturacion ?? 0}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {assigningPort && selectedNap && (
        <AssignClientModal
          nap={selectedNap}
          port={assigningPort}
          onClose={() => setAssigningPort(null)}
          onAssignedSuccess={() => {
            fetchData();
            refreshSelectedNap();
          }}
        />
      )}

      {gpsModalNap && (
        <GpsCaptureModal
          nap={gpsModalNap}
          onClose={() => setGpsModalNap(null)}
          onGpsUpdated={() => {
            fetchData();
            refreshSelectedNap();
          }}
        />
      )}

      {(isCreateNapOpen || !!editingNap) && (
        <CreateNapModal
          onClose={() => {
            setIsCreateNapOpen(false);
            setEditingNap(null);
            setTempPlacementPin(null);
            setDroppedCoordinates(null);
          }}
          napToEdit={editingNap}
          existingNaps={naps}
          onCreatedSuccess={(savedNap) => {
            setCustomNaps((prev) => {
              const updated = [savedNap, ...prev.filter((n) => n.id_nap !== savedNap.id_nap && n.identificador !== savedNap.identificador)];
              try {
                localStorage.setItem('gpon_custom_naps', safeJsonStringify(sanitizeNaps(updated)));
              } catch {}
              return updated;
            });
            setNaps((prev) => {
              const updated = [savedNap, ...prev.filter((n) => n.id_nap !== savedNap.id_nap)];
              saveCachedNaps(updated);
              return updated;
            });
            setSelectedNap(savedNap);
            setEditingNap(null);
            setTempPlacementPin(null);
            setDroppedCoordinates(null);
            setFeedbackNotice({
              type: 'success',
              message: `Caja ${savedNap.identificador} guardada exitosamente (${savedNap.total_puertos} puertos).`
            });
            setTimeout(() => setFeedbackNotice(null), 6000);
          }}
          defaultCoordinates={
            editingNap?.coordenadas_gps ||
            droppedCoordinates ||
            (odf?.coordenadas_gps
              ? {
                  lat: Number((odf.coordenadas_gps.lat + 0.003).toFixed(6)),
                  lng: Number((odf.coordenadas_gps.lng + 0.003).toFixed(6))
                }
              : undefined)
          }
        />
      )}

      {deletingNap && (
        <DeleteNapModal
          nap={deletingNap}
          onClose={() => setDeletingNap(null)}
          onConfirmDelete={handleConfirmDeleteNap}
          isDeleting={isDeletingNap}
        />
      )}

      {/* Modal para Confirmar Eliminación de Líneas Troncales, Mufas o Postes */}
      {deletingElement && (
        <DeleteElementModal
          isOpen={!!deletingElement}
          onClose={() => setDeletingElement(null)}
          onConfirm={handleConfirmDeleteElement}
          title={`Eliminar ${
            deletingElement.type === 'troncal'
              ? 'Línea de Fibra'
              : deletingElement.type === 'mufa'
              ? 'Cierre de Empalme'
              : deletingElement.type === 'gasa'
              ? 'Gasa de Reserva'
              : 'Poste'
          }`}
          elementName={deletingElement.name}
          elementType={deletingElement.type}
          details={deletingElement.details}
          isDeleting={isDeletingElement}
        />
      )}

{/* Modal de Simbología de Planta Externa y Metrajes Totales */}
      <FiberDesignLegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
        activeRoutes={[...troncalIxtJocRoutes, ...customRoutes].filter((r) => r && r.id_ruta && !isDeletedItem(r.id_ruta, deletedRouteIds))}
        activeEmpalmes={(() => {
          const seen = new Set<string>();
          return [...customEmpalmes, ...troncalMufas].filter((m) => {
            if (isDeletedItem(m?.id_empalme, deletedMufaIds)) return false;
            const key = String(m?.nombre || m?.id_empalme || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!key) return false;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        })()}
      />

      {/* Modal de Arquitectura Lógica GPON: Chasis OLT Activo, Puertos PON, Distribuidor ODF, Trazabilidad y Atenuación */}
      <OltOdfLogicalModal
        isOpen={isOltModalOpen}
        onClose={() => setIsOltModalOpen(false)}
        odf={odf}
        naps={filteredNaps}
        routes={[...troncalIxtJocRoutes, ...customRoutes].filter((r) => r && r.id_ruta && !isDeletedItem(r.id_ruta, deletedRouteIds))}
        onSelectNapOnMap={(nap) => {
          setSelectedNap(nap);
          setIsOltModalOpen(false);
        }}
      />

      {/* Modal para Crear y Trazar Nueva Ruta Troncal o Ramal, o Editar una existente */}
      <CreateRouteModal
        isOpen={isCreateRouteOpen || !!editingRoute}
        onClose={() => {
          setIsCreateRouteOpen(false);
          setEditingRoute(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
          setRouteDraftPoints([]);
          setIsDrawingRoute(false);
        }}
        onSaveRoute={(route) => {
          handleSaveRoute(route);
          setIsCreateRouteOpen(false);
          setEditingRoute(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
          setRouteDraftPoints([]);
          setIsDrawingRoute(false);
        }}
        routeToEdit={editingRoute}
        draftPoints={routeDraftPoints.length >= 2 ? routeDraftPoints : undefined}
        onEditOnMap={() => {
          setIsCreateRouteOpen(false);
          setIsDrawingRoute(true);
        }}
        defaultCoordinates={
          editingRoute?.coordenadas?.[0]
            ? editingRoute.coordenadas[0]
            : droppedCoordinates
            ? [droppedCoordinates.lat, droppedCoordinates.lng]
            : selectedNap?.coordenadas_gps
            ? [selectedNap.coordenadas_gps.lat, selectedNap.coordenadas_gps.lng]
            : odf?.coordenadas_gps
            ? [odf.coordenadas_gps.lat, odf.coordenadas_gps.lng]
            : [19.645, -99.82]
        }
      />

      {/* Modal para Crear e Instalar Nueva Mufa / Cierre de Empalme Torpedo, o Editar una existente */}
      <CreateMufaModal
        isOpen={isCreateMufaOpen || !!editingMufa}
        onClose={() => {
          setIsCreateMufaOpen(false);
          setEditingMufa(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        onSaveMufa={(mufa) => {
          handleSaveMufa(mufa);
          setIsCreateMufaOpen(false);
          setEditingMufa(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        mufaToEdit={editingMufa}
        defaultCoordinates={
          editingMufa?.coordenadas_gps
            ? [editingMufa.coordenadas_gps.lat, editingMufa.coordenadas_gps.lng]
            : droppedCoordinates
            ? [droppedCoordinates.lat, droppedCoordinates.lng]
            : selectedNap?.coordenadas_gps
            ? [
                Number((selectedNap.coordenadas_gps.lat + 0.002).toFixed(6)),
                Number((selectedNap.coordenadas_gps.lng + 0.002).toFixed(6))
              ]
            : [19.645, -99.82]
        }
      />

      {/* Modal para Crear y Registrar Nuevo Poste de Red (Propuesto o CFE), o Editar uno existente */}
      <CreatePosteModal
        isOpen={isCreatePosteOpen || !!editingPoste}
        onClose={() => {
          setIsCreatePosteOpen(false);
          setEditingPoste(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        onSavePoste={(poste) => {
          handleSavePoste(poste);
          setIsCreatePosteOpen(false);
          setEditingPoste(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        posteToEdit={editingPoste}
        defaultCoordinates={
          editingPoste?.coordenadas_gps
            ? [editingPoste.coordenadas_gps.lat, editingPoste.coordenadas_gps.lng]
            : droppedCoordinates
            ? [droppedCoordinates.lat, droppedCoordinates.lng]
            : selectedNap?.coordenadas_gps
            ? [
                Number((selectedNap.coordenadas_gps.lat + 0.001).toFixed(6)),
                Number((selectedNap.coordenadas_gps.lng + 0.001).toFixed(6))
              ]
            : [19.645, -99.82]
        }
        existingPostesCount={144 + customPostes.length}
      />

      {/* Modal para Crear y Registrar Nueva Gasa de Reserva Técnica, o Editar una existente */}
      <CreateGasaModal
        isOpen={isCreateGasaOpen || !!editingGasa}
        onClose={() => {
          setIsCreateGasaOpen(false);
          setEditingGasa(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        onSaveGasa={(gasa) => {
          handleSaveGasa(gasa);
          setIsCreateGasaOpen(false);
          setEditingGasa(null);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        gasaToEdit={editingGasa}
        defaultCoordinates={
          editingGasa?.coordenadas_gps
            ? [editingGasa.coordenadas_gps.lat, editingGasa.coordenadas_gps.lng]
            : droppedCoordinates
            ? [droppedCoordinates.lat, droppedCoordinates.lng]
            : selectedNap?.coordenadas_gps
            ? [
                Number((selectedNap.coordenadas_gps.lat + 0.0015).toFixed(6)),
                Number((selectedNap.coordenadas_gps.lng + 0.0015).toFixed(6))
              ]
            : [19.645, -99.82]
        }
        existingGasasCount={troncalGasas.length + customGasas.length}
      />

      {/* Modal de Vista Previa, Edición y Deduplicación para Importar KMZ / KML */}
      <KmzImportModal
        isOpen={isKmzModalOpen}
        onClose={() => {
          setIsKmzModalOpen(false);
          setKmzImportData(null);
        }}
        importData={kmzImportData}
        onConfirmImport={handleConfirmKmzImport}
      />
    </div>
  );
};
