import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GponMap } from '../components/GponMap';
import { NapPortMatrix } from '../components/NapPortMatrix';
import { AssignClientModal } from '../components/AssignClientModal';
import { GpsCaptureModal } from '../components/GpsCaptureModal';
import { CreateNapModal } from '../components/CreateNapModal';
import { useAuth } from '../context/AuthContext';
import { NapBox, NapPort, OdfPanel } from '../types';
import { offlineDb } from '../db/offlineDb';
import api from '../api/client';
import {
  Radio,
  Layers,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Compass,
  Plus
} from 'lucide-react';

import { mockNaps, mockOdf } from '../data/mockGponData';

export const MapViewPage: React.FC = () => {
  const [naps, setNaps] = useState<NapBox[]>(mockNaps);
  const [odf, setOdf] = useState<OdfPanel | null>(mockOdf);
  const [selectedNap, setSelectedNap] = useState<NapBox | null>(mockNaps[0]); // Mostrar la primera NAP por defecto
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Referencia para scroll suave al panel de puertos (útil en móviles)
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

  // Cargar NAPs y ODF
  const fetchData = useCallback(async () => {
    try {
      // 1. Intentar cargar desde Backend
      const [napsRes, odfRes] = await Promise.all([
        api.get('/naps'),
        api.get('/odf')
      ]);

      if (napsRes.data.success && napsRes.data.data.length > 0) {
        setNaps(napsRes.data.data);
        setIsDemoMode(false);
        // Guardar en Dexie IndexedDB para respaldo offline
        try {
          await offlineDb.cached_naps.clear();
          await offlineDb.cached_naps.bulkAdd(napsRes.data.data);
        } catch (dbErr) {
          console.warn('Error guardando en Dexie cache:', dbErr);
        }
      }

      if (odfRes.data.success && odfRes.data.data.length > 0) {
        setOdf(odfRes.data.data[0]);
      }
    } catch (err) {
      console.warn('Backend no disponible, activando modo demostración interactivo con topología de San José del Rincón.');
      setIsDemoMode(true);
      // Si hay datos en Dexie, usarlos; de lo contrario, cargar mockNaps
      const cached = await offlineDb.cached_naps.toArray();
      if (cached.length > 0) {
        setNaps(cached);
      } else {
        setNaps(mockNaps);
        setOdf(mockOdf);
        setSelectedNap(mockNaps[0]);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recargar detalle de la NAP seleccionada tras mutaciones
  const refreshSelectedNap = async () => {
    if (!selectedNap) return;
    try {
      const res = await api.get(`/naps/${selectedNap.id_nap}`);
      if (res.data.success) {
        setSelectedNap(res.data.data);
        // Actualizar en el array general
        setNaps((prev) =>
          prev.map((n) => (n.id_nap === selectedNap.id_nap ? res.data.data : n))
        );
      }
    } catch (e) {
      console.error('Error refrescando NAP:', e);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Barra de Filtros y Búsqueda Responsiva */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shadow-sm dark:shadow-md w-full transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 w-full">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por NAP o zona (ej. NAP-SJR-01)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden md:block" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="disponible">🟢 Disponibles (&lt;80%)</option>
              <option value="alerta">🟡 En Alerta (&ge;80%)</option>
              <option value="saturada">🔴 Saturadas (100%)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {user?.rol !== 'Tecnico' && (
            <button
              onClick={() => setIsCreateNapOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-sky-950/20 transition-all active:scale-95"
              title="Registrar e instalar nueva caja NAP en la red FTTx"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Caja NAP</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
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
            onSelectNap={(nap) => setSelectedNap(nap)}
            onViewPorts={(nap) => {
              setSelectedNap(nap);
              scrollToPortsPanel();
            }}
            onOpenGpsModal={(nap) => setGpsModalNap(nap)}
          />
        </div>

        {/* Panel lateral: Selección de NAP y Matriz de 16 Puertos */}
        <div
          id="panel-puertos-nap"
          ref={portsPanelRef}
          className="lg:col-span-5 xl:col-span-4 space-y-4 scroll-mt-24"
        >
          {selectedNap ? (
            <NapPortMatrix
              nap={selectedNap}
              onPortSelectToAssign={(port) => setAssigningPort(port)}
              onRefreshNap={refreshSelectedNap}
              onScrollToMap={scrollToMap}
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
          onClose={() => setIsCreateNapOpen(false)}
          onCreatedSuccess={(newNap) => {
            setNaps((prev) => [newNap, ...prev]);
            setSelectedNap(newNap);
            fetchData();
          }}
          defaultCoordinates={
            odf?.coordenadas_gps
              ? {
                  lat: Number((odf.coordenadas_gps.lat + 0.003).toFixed(6)),
                  lng: Number((odf.coordenadas_gps.lng + 0.003).toFixed(6))
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

