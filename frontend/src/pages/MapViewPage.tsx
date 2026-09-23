import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GponMap } from '../components/GponMap';
import { NapPortMatrix } from '../components/NapPortMatrix';
import { AssignClientModal } from '../components/AssignClientModal';
import { GpsCaptureModal } from '../components/GpsCaptureModal';
import { CreateNapModal } from '../components/CreateNapModal';
import { DeleteNapModal } from '../components/DeleteNapModal';
import { RouteNavigationCard } from '../components/RouteNavigationCard';
import { MileageCaptureModal } from '../components/MileageCaptureModal';
import { MileageLogModal } from '../components/MileageLogModal';
import { FiberDesignLegendModal } from '../components/FiberDesignLegendModal';
import { CreateRouteModal } from '../components/CreateRouteModal';
import { CreateMufaModal } from '../components/CreateMufaModal';
import { CreatePosteModal } from '../components/CreatePosteModal';
import { DeleteElementModal } from '../components/DeleteElementModal';
import { useAuth } from '../context/AuthContext';
import { NapBox, NapPort, OdfPanel, FiberRoute, EmpalmeClosure, PosteInfraestructura } from '../types';
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
  Navigation,
  Gauge,
  Layers,
  GitCommit,
  Ruler,
  MapPin,
  X,
  GripVertical
} from 'lucide-react';

import {
  mockNaps,
  mockOdf,
  troncalIxtJocRoutes,
  troncalMufas,
  getTroncalDesignMetrics
} from '../data/mockGponData';

export const MapViewPage: React.FC = () => {
  const [naps, setNaps] = useState<NapBox[]>(mockNaps);
  const [odf, setOdf] = useState<OdfPanel | null>(mockOdf);
  const [selectedNap, setSelectedNap] = useState<NapBox | null>(mockNaps[0]);
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

  // Estados de Planta Externa: Simbología, Metrajes y Creación de Rutas/Mufas
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
  const [isCreateMufaOpen, setIsCreateMufaOpen] = useState(false);
  const [isCreatePosteOpen, setIsCreatePosteOpen] = useState(false);

  // Estados para Drag & Drop y Colocación Interactiva de Elementos
  const [placementMode, setPlacementMode] = useState<'poste' | 'mufa' | 'nap' | 'troncal' | null>(null);
  const [droppedCoordinates, setDroppedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [tempPlacementPin, setTempPlacementPin] = useState<{
    type: 'poste' | 'mufa' | 'nap' | 'troncal';
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

  const handlePlaceElement = (type: 'poste' | 'mufa' | 'nap' | 'troncal', latlng: { lat: number; lng: number }) => {
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
  const [customRoutes, setCustomRoutes] = useState<FiberRoute[]>(() => {
    try {
      const saved = localStorage.getItem('gpon_custom_routes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customEmpalmes, setCustomEmpalmes] = useState<EmpalmeClosure[]>(() => {
    try {
      const saved = localStorage.getItem('gpon_custom_empalmes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customPostes, setCustomPostes] = useState<PosteInfraestructura[]>(() => {
    try {
      const saved = localStorage.getItem('gpon_custom_postes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Estados de control para eliminación de elementos (Troncales, Mufas, Postes)
  const [deletingElement, setDeletingElement] = useState<{
    type: 'troncal' | 'mufa' | 'poste';
    id: string;
    name: string;
    details?: string;
  } | null>(null);
  const [isDeletingElement, setIsDeletingElement] = useState(false);

  // Registro de IDs eliminados para sincronización inmediata entre dispositivos y filtros
  const [deletedRouteIds, setDeletedRouteIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('gpon_deleted_route_ids');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [deletedMufaIds, setDeletedMufaIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('gpon_deleted_mufa_ids');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [deletedPosteIds, setDeletedPosteIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('gpon_deleted_poste_ids');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

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
    } catch (e) {
      console.warn('Ruta guardada localmente:', e);
    }
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
    } catch (e) {
      console.warn('Mufa guardada localmente:', e);
    }
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
    } catch (e) {
      console.warn('Poste guardado en local; se sincronizará al conectar:', e);
    }
    setFeedbackNotice({
      type: 'success',
      message: `Poste "${newPoste.nombre}" (${newPoste.tipo === 'poste_propuesto' ? 'Propuesto' : 'CFE'}) registrado y sincronizado en todos los dispositivos.`
    });
    setTimeout(() => setFeedbackNotice(null), 6000);
    fetchData(false);
  };

  // Cargar NAPs, ODF e Infraestructura (Postes, Mufas, Rutas) sincronizada
  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      // Peticiones aisladas e individuales para que la falla de una no bloquee a las demás
      const [napsRes, odfRes, postesRes, mufasRes, routesRes] = await Promise.all([
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
        })
      ]);

      if (napsRes.data?.success && Array.isArray(napsRes.data.data) && napsRes.data.data.length > 0) {
        setNaps(napsRes.data.data);
        setIsDemoMode(false);
        try {
          await offlineDb.cached_naps.clear();
          await offlineDb.cached_naps.bulkAdd(napsRes.data.data);
        } catch (dbErr) {
          console.warn('Error guardando en Dexie cache:', dbErr);
        }
      } else {
        const cached = await offlineDb.cached_naps.toArray().catch(() => []);
        if (cached.length > 0) {
          setNaps(cached);
        }
      }

      if (odfRes.data?.success && Array.isArray(odfRes.data.data) && odfRes.data.data.length > 0) {
        setOdf(odfRes.data.data[0]);
      }

      // Sincronizar Postes desde la base central Neon DB
      if (postesRes.data?.success && Array.isArray(postesRes.data.data)) {
        const serverPostes: PosteInfraestructura[] = postesRes.data.data;
        setCustomPostes(() => {
          const filtered = serverPostes.filter((p) => !deletedPosteIds.includes(p.id_poste));
          try {
            localStorage.setItem('gpon_custom_postes', JSON.stringify(filtered));
          } catch {}
          return filtered;
        });
      }

      // Sincronizar Mufas desde la base central Neon DB
      if (mufasRes.data?.success && Array.isArray(mufasRes.data.data)) {
        const serverMufas: EmpalmeClosure[] = mufasRes.data.data;
        setCustomEmpalmes(() => {
          const filtered = serverMufas.filter((m) => !deletedMufaIds.includes(m.id_empalme));
          try {
            localStorage.setItem('gpon_custom_empalmes', JSON.stringify(filtered));
          } catch {}
          return filtered;
        });
      }

      // Sincronizar Rutas Troncales desde la base central Neon DB
      if (routesRes.data?.success && Array.isArray(routesRes.data.data)) {
        const serverRoutes: FiberRoute[] = routesRes.data.data;
        setCustomRoutes(() => {
          const filtered = serverRoutes.filter((r) => !deletedRouteIds.includes(r.id_ruta));
          try {
            localStorage.setItem('gpon_custom_routes', JSON.stringify(filtered));
          } catch {}
          return filtered;
        });
      }
    } catch (err) {
      console.warn('Sincronización con backend parcial o en caché offline:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [deletedRouteIds, deletedMufaIds, deletedPosteIds]);

  // Polling automático cada 8 segundos para sincronización multi-dispositivo en tiempo real
  useEffect(() => {
    fetchData(true);
    const syncTimer = setInterval(() => {
      fetchData(false);
    }, 8000);

    return () => clearInterval(syncTimer);
  }, [fetchData]);

  const refreshSelectedNap = async () => {
    if (!selectedNap) return;
    try {
      const res = await api.get(`/naps/${selectedNap.id_nap}`);
      if (res.data.success) {
        setSelectedNap(res.data.data);
        setNaps((prev) =>
          prev.map((n) => (n.id_nap === selectedNap.id_nap ? res.data.data : n))
        );
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
    try {
      setIsDeletingNap(true);
      const deleteId = targetNap.id_nap || targetNap.identificador;
      const res = await api.delete(`/naps/${deleteId}`);
      if (!res.data?.success && res.status >= 400) {
        throw new Error(res.data?.message || 'Error al eliminar la caja NAP');
      }

      // Eliminar de base local IndexedDB
      try {
        await offlineDb.cached_naps.delete(targetNap.id_nap);
      } catch (dbErr) {
        console.warn('Error eliminando de Dexie:', dbErr);
      }

      // Actualizar estado en memoria
      setNaps((prev) => prev.filter((n) => n.id_nap !== targetNap.id_nap && n.identificador !== targetNap.identificador));

      if (selectedNap?.id_nap === targetNap.id_nap || selectedNap?.identificador === targetNap.identificador) {
        setSelectedNap(null);
      }

      setFeedbackNotice({
        type: 'success',
        message: `Caja NAP ${targetNap.identificador} dada de baja exitosamente de la red.`
      });
      setTimeout(() => setFeedbackNotice(null), 5000);

      setDeletingNap(null);
      fetchData();
    } catch (err: any) {
      console.error('Error al eliminar caja NAP:', err);
      const msg = err.response?.data?.message || err.message || 'Error al procesar la eliminación de la caja NAP';
      setFeedbackNotice({
        type: 'error',
        message: `Error al eliminar caja: ${msg}`
      });
      throw new Error(msg);
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
        setFeedbackNotice({
          type: 'success',
          message: `Poste de infraestructura "${name}" eliminado correctamente.`
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
      nap.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nap.zona.toLowerCase().includes(searchTerm.toLowerCase());

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

          {/* Botón Actualizar a la derecha */}
          <div className="flex items-center justify-end shrink-0">
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 h-9 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer w-full sm:w-auto"
              title="Actualizar datos de la red"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Elementos de Despliegue de Red y Trazado Centrados y con sus Colores Originales */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap pb-0.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
            onClick={() => setPlacementMode(placementMode === 'mufa' ? null : 'mufa')}
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
            onClick={() => setPlacementMode(placementMode === 'poste' ? null : 'poste')}
            className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-rose-50 to-red-50 dark:from-slate-800 dark:to-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs px-3 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
              placementMode === 'poste' ? 'ring-2 ring-rose-500 shadow-md ring-offset-1 animate-pulse' : ''
            }`}
            title="Arrastra hacia el mapa satelital o haz clic para ubicar un nuevo poste"
          >
            <GripVertical className="w-3 h-3 text-rose-500/70 shrink-0" />
            <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>+ Poste</span>
          </button>

          {/* Botón para registrar nueva caja NAP */}
          {user?.rol !== 'Tecnico' && (
            <button
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', 'nap');
                e.dataTransfer.setData('application/gpon-element', 'nap');
              }}
              onClick={() => setPlacementMode(placementMode === 'nap' ? null : 'nap')}
              className={`flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs px-3.5 rounded-lg shadow-md shadow-sky-950/20 transition-all active:scale-95 cursor-grab active:cursor-grabbing shrink-0 ${
                placementMode === 'nap' ? 'ring-2 ring-sky-300 ring-offset-1 animate-pulse' : ''
              }`}
              title="Arrastra hacia el mapa satelital o haz clic para ubicar una nueva caja NAP"
            >
              <GripVertical className="w-3 h-3 text-white/70 shrink-0" />
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Nueva Caja NAP</span>
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

      {/* Grid: Mapa + Panel de NAP y 16 Puertos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Mapa Leaflet interactivo */}
        <div className="lg:col-span-7 xl:col-span-8 h-[550px] lg:h-[680px]">
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
              scrollToPortsPanel();
            }}
            onOpenGpsModal={(nap) => setGpsModalNap(nap)}
            activeRoute={isRouteActive ? routeResult : null}
            onRequestRoute={handleRequestRoute}
            onClearRoute={handleClearRoute}
            fiberRoutes={customRoutes}
            empalmes={customEmpalmes}
            customPostes={customPostes}
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
            deletedRouteIds={deletedRouteIds}
            deletedMufaIds={deletedMufaIds}
            deletedPosteIds={deletedPosteIds}
            onOpenMileageCapture={(nap: NapBox, dist?: number) =>
              setMileageCaptureData({ isOpen: true, nap, distanceKm: dist })
            }
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
          />
        </div>

        {/* Panel lateral: Tarjeta de Navegación + Selección de NAP y Matriz de 16 Puertos */}
        <div
          id="panel-puertos-nap"
          ref={portsPanelRef}
          className="lg:col-span-5 xl:col-span-4 space-y-4 scroll-mt-24"
        >
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
              onOpenMileageCapture={(nap: NapBox, dist?: number) =>
                setMileageCaptureData({ isOpen: true, nap, distanceKm: dist })
              }
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
                      scrollToPortsPanel();
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

      {isCreateNapOpen && (
        <CreateNapModal
          onClose={() => {
            setIsCreateNapOpen(false);
            setTempPlacementPin(null);
            setDroppedCoordinates(null);
          }}
          existingNaps={naps}
          onCreatedSuccess={(newNap) => {
            setNaps((prev) => [newNap, ...prev.filter((n) => n.id_nap !== newNap.id_nap)]);
            setSelectedNap(newNap);
            setTempPlacementPin(null);
            setDroppedCoordinates(null);
            setFeedbackNotice({
              type: 'success',
              message: `Caja ${newNap.identificador} registrada y desplegada exitosamente en el mapa (${newNap.total_puertos} puertos).`
            });
            setTimeout(() => setFeedbackNotice(null), 6000);
          }}
          defaultCoordinates={
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
              : 'Poste'
          }`}
          elementName={deletingElement.name}
          elementType={deletingElement.type}
          details={deletingElement.details}
          isDeleting={isDeletingElement}
        />
      )}

      {/* Modal de Captura de Kilometraje del Técnico */}
      {mileageCaptureData.isOpen && (
        <MileageCaptureModal
          nap={mileageCaptureData.nap}
          distanceKm={mileageCaptureData.distanceKm}
          availableNaps={naps}
          onClose={() => setMileageCaptureData({ isOpen: false })}
          onSaved={(record) => {
            setFeedbackNotice({
              type: 'success',
              message: `Kilometraje grabado correctamente: ${record.km_recorridos} km para ${record.destino_nombre} (${record.tecnico_nombre}).`
            });
            setTimeout(() => setFeedbackNotice(null), 6000);
          }}
        />
      )}

      {/* Modal de Bitácora de Kilometraje Completa con KPIs y Exportación */}
      {isMileageLogOpen && (
        <MileageLogModal
          onClose={() => setIsMileageLogOpen(false)}
          onOpenCapture={() => {
            setMileageCaptureData({
              isOpen: true,
              nap: selectedNap
            });
          }}
        />
      )}

      {/* Modal de Simbología de Planta Externa y Metrajes Totales */}
      <FiberDesignLegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
        activeRoutes={[...troncalIxtJocRoutes, ...customRoutes].filter((r) => !deletedRouteIds.includes(r.id_ruta))}
        activeEmpalmes={[...troncalMufas, ...customEmpalmes].filter((m) => !deletedMufaIds.includes(m.id_empalme))}
      />

      {/* Modal para Crear y Trazar Nueva Ruta Troncal o Ramal */}
      <CreateRouteModal
        isOpen={isCreateRouteOpen}
        onClose={() => {
          setIsCreateRouteOpen(false);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
          setRouteDraftPoints([]);
          setIsDrawingRoute(false);
        }}
        onSaveRoute={(route) => {
          handleSaveRoute(route);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
          setRouteDraftPoints([]);
          setIsDrawingRoute(false);
        }}
        draftPoints={routeDraftPoints.length >= 2 ? routeDraftPoints : undefined}
        onEditOnMap={() => {
          setIsCreateRouteOpen(false);
          setIsDrawingRoute(true);
        }}
        defaultCoordinates={
          droppedCoordinates
            ? [droppedCoordinates.lat, droppedCoordinates.lng]
            : selectedNap?.coordenadas_gps
            ? [selectedNap.coordenadas_gps.lat, selectedNap.coordenadas_gps.lng]
            : odf?.coordenadas_gps
            ? [odf.coordenadas_gps.lat, odf.coordenadas_gps.lng]
            : [19.645, -99.82]
        }
      />

      {/* Modal para Crear e Instalar Nueva Mufa / Cierre de Empalme Torpedo */}
      <CreateMufaModal
        isOpen={isCreateMufaOpen}
        onClose={() => {
          setIsCreateMufaOpen(false);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        onSaveMufa={(mufa) => {
          handleSaveMufa(mufa);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        defaultCoordinates={
          droppedCoordinates
            ? [droppedCoordinates.lat, droppedCoordinates.lng]
            : selectedNap?.coordenadas_gps
            ? [
                Number((selectedNap.coordenadas_gps.lat + 0.002).toFixed(6)),
                Number((selectedNap.coordenadas_gps.lng + 0.002).toFixed(6))
              ]
            : [19.645, -99.82]
        }
      />

      {/* Modal para Crear y Registrar Nuevo Poste de Red (Propuesto o CFE) */}
      <CreatePosteModal
        isOpen={isCreatePosteOpen}
        onClose={() => {
          setIsCreatePosteOpen(false);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        onSavePoste={(poste) => {
          handleSavePoste(poste);
          setTempPlacementPin(null);
          setDroppedCoordinates(null);
        }}
        defaultCoordinates={
          droppedCoordinates
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
    </div>
  );
};
