import React from 'react';
import { X, MapPin, Server, Users, BarChart3, ChevronRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { NapBox } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface MunicipalityStat {
  municipio: string;
  totalNaps: number;
  totalPuertos: number;
  ocupados: number;
  libres: number;
  danados: number;
  saturacion: number;
  naps: NapBox[];
}

export function getMunicipalityFromNap(nap: NapBox): string {
  if (!nap) return 'San José del Rincón';

  if ((nap as any).municipio && typeof (nap as any).municipio === 'string' && (nap as any).municipio.trim()) {
    return (nap as any).municipio.trim();
  }

  const combined = `${nap.zona || ''} ${nap.direccion_texto || ''} ${nap.identificador || ''}`.toLowerCase();

  if (combined.includes('jocotitlan') || combined.includes('jocotitlán') || combined.includes('joc-') || combined.includes('joc ')) {
    return 'Jocotitlán';
  }
  if (combined.includes('ixtlahuaca') || combined.includes('ixt-') || combined.includes('ixt ')) {
    return 'Ixtlahuaca';
  }
  if (combined.includes('el oro') || combined.includes('oro-') || combined.includes('oro ')) {
    return 'El Oro';
  }
  if (combined.includes('atlacomulco') || combined.includes('atla-') || combined.includes('atla ')) {
    return 'Atlacomulco';
  }
  if (
    combined.includes('san josé del rincón') ||
    combined.includes('san jose del rincon') ||
    combined.includes('sjr') ||
    combined.includes('san francisco de la loma') ||
    combined.includes('la presa') ||
    combined.includes('providencia') ||
    combined.includes('palos amarillos') ||
    combined.includes('guadalupe')
  ) {
    return 'San José del Rincón';
  }

  if (nap.zona && nap.zona.includes('-')) {
    const part = nap.zona.split('-')[0].trim();
    if (part && part.length > 3) return part;
  }
  if (nap.zona && nap.zona.trim()) {
    return nap.zona.trim();
  }

  return 'San José del Rincón';
}

interface MunicipalityDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  naps: NapBox[];
  onSelectMunicipality?: (municipio: string) => void;
}

export const MunicipalityDistributionModal: React.FC<MunicipalityDistributionModalProps> = ({
  isOpen,
  onClose,
  naps,
  onSelectMunicipality
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Agrupar NAPs por municipio
  const groupMap = new Map<string, NapBox[]>();
  naps.forEach((nap) => {
    const mun = getMunicipalityFromNap(nap);
    const list = groupMap.get(mun) || [];
    list.push(nap);
    groupMap.set(mun, list);
  });

  const stats: MunicipalityStat[] = Array.from(groupMap.entries()).map(([municipio, napList]) => {
    const totalPuertos = napList.reduce((acc, n) => acc + (n.total_puertos || 16), 0);
    const ocupados = napList.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
    const danados = napList.reduce((acc, n) => acc + (n.metricas?.danados || 0), 0);
    const libres = totalPuertos - ocupados - danados;
    const saturacion = totalPuertos > 0 ? Math.round((ocupados / totalPuertos) * 100) : 0;
    return {
      municipio,
      totalNaps: napList.length,
      totalPuertos,
      ocupados,
      libres,
      danados,
      saturacion,
      naps: napList
    };
  }).sort((a, b) => b.totalNaps - a.totalNaps);

  const totalAllNaps = naps.length;
  const totalAllPorts = stats.reduce((acc, s) => acc + s.totalPuertos, 0);
  const totalAllOcupados = stats.reduce((acc, s) => acc + s.ocupados, 0);
  const avgSaturacion = totalAllPorts > 0 ? Math.round((totalAllOcupados / totalAllPorts) * 100) : 0;

  const handleFilterClick = (mun: string) => {
    if (onSelectMunicipality) {
      onSelectMunicipality(mun);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto text-slate-900 dark:text-white transition-colors">
        {/* Cabecera */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('reports.municipalitiesModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('reports.municipalitiesModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title={t('reports.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen Global */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('reports.totalMunicipalities')}
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {stats.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('reports.activeNaps')}
              </span>
              <span className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono">
                {totalAllNaps}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('reports.totalPorts')}
              </span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {totalAllPorts}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('reports.avgSaturation')}
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {avgSaturacion}%
              </span>
            </div>
          </div>

          {/* Desglose de Municipios */}
          <div className="space-y-3">
            {stats.map((s) => {
              const isAlert = s.saturacion >= 80;
              return (
                <div
                  key={s.municipio}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs hover:border-sky-400 dark:hover:border-sky-500 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {s.municipio}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.naps.length} {s.naps.length === 1 ? 'Caja NAP' : 'Cajas NAP'} ({Math.round((s.totalNaps / totalAllNaps) * 100)}% del total)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                          isAlert
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isAlert ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{s.saturacion}% {t('reports.colSaturation')}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleFilterClick(s.municipio)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors cursor-pointer"
                        title={t('reports.filterByMunicipality')}
                      >
                        <span>{t('reports.filterByMunicipality')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Barra de progreso de saturación */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isAlert ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${s.saturacion}%` }}
                    />
                  </div>

                  {/* Métricas del municipio */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-center">
                    <div className="bg-slate-50 dark:bg-slate-900/40 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('reports.colTotalPorts')}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{s.totalPuertos}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('reports.colOccupied')}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{s.ocupados}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('reports.colFree')}</span>
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">{s.libres}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie de modal */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('reports.inventorySummary')} • GPON TELECOM
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('reports.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
