import React, { useState, useEffect, useMemo } from 'react';
import { NapBox } from '../types';
import { mockNaps } from '../data/mockGponData';
import api from '../api/client';
import { getCachedNapsSync, saveCachedNaps } from '../services/realtimeSync';
import { ReportPreviewModal } from '../components/ReportPreviewModal';
import {
  FileText,
  Download,
  Server,
  Network,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Search,
  X
} from 'lucide-react';
import { TablePagination } from '../components/TablePagination';


const getCleanNaps = (rawNaps: NapBox[]): NapBox[] => {
  let deletedIds: string[] = [];
  try {
    const del = localStorage.getItem('gpon_deleted_nap_ids');
    if (del) {
      const parsed = JSON.parse(del);
      if (Array.isArray(parsed)) deletedIds = parsed.filter(Boolean);
    }
  } catch {}

  let customNaps: NapBox[] = [];
  try {
    const cust = localStorage.getItem('gpon_custom_naps');
    if (cust) {
      const parsed = JSON.parse(cust);
      if (Array.isArray(parsed)) customNaps = parsed.filter(Boolean);
    }
  } catch {}

  const safeId = (id?: any) => (id ? String(id).toLowerCase().trim() : '');
  const safeIdent = (ident?: any) => (ident ? String(ident).toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '');

  const isDeleted = (n: NapBox) => {
    if (!n) return true;
    if (n.id_nap && deletedIds.includes(n.id_nap)) return true;
    if (n.identificador && deletedIds.includes(n.identificador)) return true;
    return false;
  };

  const customMap = new Map<string, NapBox>();
  customNaps.filter((c) => !isDeleted(c)).forEach((c) => {
    const kId = safeId(c.id_nap);
    if (kId) customMap.set(kId, c);
    const kIdent = safeIdent(c.identificador);
    if (kIdent) customMap.set(kIdent, c);
  });

  const merged = (rawNaps || [])
    .filter((n) => !isDeleted(n))
    .map((n) => {
      const local = (n.id_nap ? customMap.get(safeId(n.id_nap)) : undefined) ||
                    (n.identificador ? customMap.get(safeIdent(n.identificador)) : undefined);
      return local ? { ...n, ...local } : n;
    });

  const rawIds = new Set((rawNaps || []).map((n) => safeId(n.id_nap)).filter(Boolean));
  const rawIdents = new Set((rawNaps || []).map((n) => safeIdent(n.identificador)).filter(Boolean));
  const localOnly = customNaps.filter((c) => {
    if (isDeleted(c)) return false;
    const idMatch = c.id_nap ? rawIds.has(safeId(c.id_nap)) : false;
    const identMatch = c.identificador ? rawIdents.has(safeIdent(c.identificador)) : false;
    return !idMatch && !identMatch;
  });

  return [...merged, ...localOnly];
};

export const ReportsPage: React.FC = () => {
  // Carga instantánea de NAPs desde caché local en 0ms para evitar mostrar 0 mientras se conecta al servidor
  const [naps, setNaps] = useState<NapBox[]>(() => {
    const cached = getCachedNapsSync();
    const initial = cached.length > 0 ? cached : mockNaps;
    return getCleanNaps(initial);
  });
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Estados de paginación y búsqueda para la Matriz de Estado (20 registros por página)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadNaps = async () => {
      try {
        const res = await api.get('/naps');
        if (res.data.success && res.data.data.length > 0) {
          const clean = getCleanNaps(res.data.data);
          setNaps(clean);
          saveCachedNaps(clean);
        } else {
          const cached = getCachedNapsSync();
          const clean = getCleanNaps(cached.length > 0 ? cached : mockNaps);
          setNaps(clean);
        }
      } catch (e) {
        console.warn('Backend no disponible, cargando datos locales/mock en Reportes...');
        const cached = getCachedNapsSync();
        setNaps(cached.length > 0 ? cached : mockNaps);
      } finally {
        setLoading(false);
      }
    };
    loadNaps();
  }, []);

  // Métricas acumuladas
  const totalNaps = naps.length;
  const totalPuertos = naps.reduce((acc, n) => acc + (n.total_puertos || 16), 0);
  const totalOcupados = naps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
  const totalLibres = totalPuertos - totalOcupados;
  const saturacionGlobal = totalPuertos > 0 ? Math.round((totalOcupados / totalPuertos) * 100) : 0;

  // Filtrado y Paginación de NAPs en la Matriz de Estado (20 registros por página)
  const filteredNaps = useMemo(() => {
    const term = searchTerm
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!term) return naps;

    const norm = (str?: string) =>
      (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return naps.filter(
      (nap) =>
        norm(nap.identificador).includes(term) ||
        norm(nap.zona).includes(term) ||
        norm(nap.direccion_texto).includes(term)
    );
  }, [naps, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredNaps.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedNaps = filteredNaps.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado y Acción de Descarga con único botón */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            Reportes e Indicadores de Saturación GPON
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de capacidad de red y exportación de reportes ejecutivos en PDF de alta fidelidad.
          </p>
        </div>

        {/* Único botón: Descargar Reporte PDF (abre la vista previa del reporte para revisión y descarga) */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Abrir vista previa del reporte ejecutivo y descargar en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de la Red */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cajas NAP Activas</span>
            <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalNaps}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Distribuidas en San José del Rincón</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Puertos</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalPuertos}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Capacidad splitter 1:16</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Abonados Conectados</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{totalOcupados}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Puertos libres: {totalLibres}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Saturación Global</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              saturacionGlobal >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
            }`}
          >
            {saturacionGlobal}%
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                saturacionGlobal >= 80 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${saturacionGlobal}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabla Detallada de Saturación por Caja NAP */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs dark:shadow-xl transition-colors">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
          <div>
            <span className="font-semibold text-xs text-slate-800 dark:text-white uppercase tracking-wider block">
              Matriz de Estado y Saturación por Caja de Distribución (NAP)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Criterio de Alerta &ge; 80% • Mostrando 20 cajas por página
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar caja o zona..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Borrar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Identificador</th>
                <th className="px-4 py-3">Zona / Cobertura</th>
                <th className="px-4 py-3 text-center">Puertos Totales</th>
                <th className="px-4 py-3 text-center">Libres</th>
                <th className="px-4 py-3 text-center">Ocupados</th>
                <th className="px-4 py-3">Saturación</th>
                <th className="px-4 py-3">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedNaps.map((nap) => {
                const m = nap.metricas;
                const pct = m?.porcentajeSaturacion ?? 0;

                return (
                  <tr key={nap.id_nap} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{nap.identificador}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{nap.zona}</td>
                    <td className="px-4 py-3 text-center font-mono">{nap.total_puertos}</td>
                    <td className="px-4 py-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {m?.libres ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sky-600 dark:text-sky-300 font-semibold">
                      {m?.ocupados ?? 0}
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] w-10 text-right text-slate-800 dark:text-slate-200">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {pct >= 100 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" /> SATURADA
                        </span>
                      ) : pct >= 80 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> EN ALERTA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> DISPONIBLE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredNaps.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron cajas NAP con los criterios de búsqueda especificados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pestañas de Navegación / Paginación (20 registros por página) */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalItems={filteredNaps.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          }}
          itemName="cajas NAP"
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* Modal de Vista Previa Oficial con Descarga PDF e Impresión */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        naps={naps}
      />
    </div>
  );
};
