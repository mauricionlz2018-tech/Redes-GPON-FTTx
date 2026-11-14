import React, { useState, useEffect, useMemo } from 'react';
import { NapBox } from '../types';
import { mockNaps } from '../data/mockGponData';
import { useLanguage } from '../context/LanguageContext';
import { sanitizeNaps } from '../utils/safeJson';
import api from '../api/client';
import { getCachedNapsSync, saveCachedNaps } from '../services/realtimeSync';
import { ReportPreviewModal } from '../components/ReportPreviewModal';
import {
  MunicipalityDistributionModal,
  getMunicipalityFromNap,
  MunicipalityStat
} from '../components/MunicipalityDistributionModal';
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
  X,
  MapPin,
  ChevronRight,
  Layers
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
      if (Array.isArray(parsed)) customNaps = sanitizeNaps(parsed.filter(Boolean));
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
  const { t } = useLanguage();
  // Carga instantánea de NAPs desde caché local en 0ms para evitar mostrar 0 mientras se conecta al servidor
  const [naps, setNaps] = useState<NapBox[]>(() => {
    const cached = getCachedNapsSync();
    const initial = cached.length > 0 ? cached : mockNaps;
    return getCleanNaps(initial);
  });
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);

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

  // Estadísticas agrupadas por municipio
  const municipalityStats: MunicipalityStat[] = useMemo(() => {
    const groupMap = new Map<string, NapBox[]>();
    naps.forEach((nap) => {
      const mun = getMunicipalityFromNap(nap);
      const list = groupMap.get(mun) || [];
      list.push(nap);
      groupMap.set(mun, list);
    });

    return Array.from(groupMap.entries()).map(([municipio, napList]) => {
      const portsTotal = napList.reduce((acc, n) => acc + (n.total_puertos || 16), 0);
      const ocupados = napList.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
      const danados = napList.reduce((acc, n) => acc + (n.metricas?.danados || 0), 0);
      const libres = portsTotal - ocupados - danados;
      const saturacion = portsTotal > 0 ? Math.round((ocupados / portsTotal) * 100) : 0;
      return {
        municipio,
        totalNaps: napList.length,
        totalPuertos: portsTotal,
        ocupados,
        libres,
        danados,
        saturacion,
        naps: napList
      };
    }).sort((a, b) => b.totalNaps - a.totalNaps);
  }, [naps]);

  // Filtrado de NAPs por búsqueda y municipio seleccionado
  const filteredNaps = useMemo(() => {
    let result = naps;
    if (selectedMunicipality) {
      result = result.filter((nap) => getMunicipalityFromNap(nap) === selectedMunicipality);
    }

    const term = searchTerm
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!term) return result;

    const norm = (str?: string) =>
      (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return result.filter(
      (nap) =>
        norm(nap.identificador).includes(term) ||
        norm(nap.zona).includes(term) ||
        norm(nap.direccion_texto).includes(term) ||
        norm(getMunicipalityFromNap(nap)).includes(term)
    );
  }, [naps, searchTerm, selectedMunicipality]);

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
            {t('reports.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('reports.subtitle')}
          </p>
        </div>

        {/* Único botón: Descargar Reporte PDF */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Abrir vista previa del reporte ejecutivo y descargar en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('reports.downloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de la Red */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Cajas NAP Activas - Con botón interactivo para ver por municipios */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('reports.activeNaps')}</span>
              <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg">
                <Network className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalNaps}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsMunicipalityModalOpen(true)}
            className="mt-2.5 inline-flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-all cursor-pointer shadow-xs group"
            title={t('reports.viewByMunicipality')}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
              <span>{t('reports.viewByMunicipality')}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono opacity-80">
              <span>{municipalityStats.length} {t('reports.municipalitiesBadge')}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('reports.totalPorts')}</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalPuertos}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('reports.splitterCapacity')}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('reports.connectedClients')}</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{totalOcupados}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('reports.freePortsCount', { count: totalLibres })}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('reports.globalSaturation')}</span>
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

      {/* Barra de Filtro Rápido por Municipios */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-thin transition-colors">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5 pl-1">
          <MapPin className="w-3.5 h-3.5 text-sky-500" />
          <span>{t('reports.municipality')}:</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedMunicipality(null);
            setCurrentPage(1);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            selectedMunicipality === null
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {t('reports.allMunicipalities')} ({totalNaps})
        </button>
        {municipalityStats.map((stat) => (
          <button
            key={stat.municipio}
            type="button"
            onClick={() => {
              setSelectedMunicipality(stat.municipio);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedMunicipality === stat.municipio
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span>{stat.municipio}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedMunicipality === stat.municipio
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {stat.totalNaps}
            </span>
          </button>
        ))}
      </div>

      {/* Tabla Detallada de Saturación por Caja NAP */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs dark:shadow-xl transition-colors">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
          <div>
            <span className="font-semibold text-xs text-slate-800 dark:text-white uppercase tracking-wider block">
              {t('reports.matrixTitle')}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('reports.matrixSubtitle')}
              {selectedMunicipality && (
                <span className="ml-2 font-bold text-sky-600 dark:text-sky-400">
                  • {selectedMunicipality}
                </span>
              )}
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                <th className="py-2.5 px-4">{t('reports.colId')}</th>
                <th className="py-2.5 px-4">{t('reports.colZone')}</th>
                <th className="py-2.5 px-4 text-center">{t('reports.colTotalPorts')}</th>
                <th className="py-2.5 px-4 text-center">{t('reports.colFree')}</th>
                <th className="py-2.5 px-4 text-center">{t('reports.colOccupied')}</th>
                <th className="py-2.5 px-4 text-center">{t('reports.colSaturation')}</th>
                <th className="py-2.5 px-4 text-center">{t('reports.colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedNaps.map((nap) => {
                const total = nap.total_puertos || 16;
                const ocupados = nap.metricas?.ocupados || 0;
                const libres = total - ocupados;
                const pct = Math.round((ocupados / total) * 100);
                const isSaturated = pct >= 100;
                const isAlert = pct >= 80 && pct < 100;
                const municipioName = getMunicipalityFromNap(nap);

                return (
                  <tr
                    key={nap.id_nap || nap.identificador}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {nap.identificador}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">{nap.zona}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        {municipioName} • {nap.direccion_texto || 'S/D'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                      {total}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-medium text-sky-600 dark:text-sky-400">
                      {libres}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-900 dark:text-white">
                      {ocupados}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            isSaturated
                              ? 'text-red-600 dark:text-red-400'
                              : isAlert
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {pct}%
                        </span>
                        <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${
                              isSaturated ? 'bg-red-500' : isAlert ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {isSaturated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800">
                          <AlertTriangle className="w-3 h-3" /> {t('reports.saturated')}
                        </span>
                      ) : isAlert ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" /> {t('reports.alert')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> {t('reports.available')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredNaps.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {t('reports.noNaps')}
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

      {/* Modal de Desglose de Cajas NAP por Municipio */}
      <MunicipalityDistributionModal
        isOpen={isMunicipalityModalOpen}
        onClose={() => setIsMunicipalityModalOpen(false)}
        naps={naps}
        onSelectMunicipality={(mun) => {
          setSelectedMunicipality(mun);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
