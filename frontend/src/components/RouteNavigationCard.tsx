import React, { useState } from 'react';
import { NapBox, OdfPanel } from '../types';
import {
  RouteResult,
  formatDistance,
  formatDuration,
  getGoogleMapsUrl,
  getWazeUrl,
  Coordinates
} from '../services/routingService';
import {
  Navigation,
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  X,
  CornerDownRight,
  CornerDownLeft,
  ArrowUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  Car
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RouteNavigationCardProps {
  nap: NapBox;
  odf: OdfPanel | null;
  routeResult: RouteResult | null;
  isLoading: boolean;
  originType: 'odf' | 'user';
  userCoordinates: Coordinates | null;
  onOriginChange: (type: 'odf' | 'user') => void;
  onClose: () => void;
  onOpenMileageCapture?: (nap: NapBox, distanceKm?: number) => void;
}

export const RouteNavigationCard: React.FC<RouteNavigationCardProps> = ({
  nap,
  odf,
  routeResult,
  isLoading,
  originType,
  userCoordinates,
  onOriginChange,
  onClose
}) => {
  const { t } = useLanguage();
  const [showSteps, setShowSteps] = useState(false);

  // Obtener coordenadas de origen según la selección
  const originCoords: Coordinates | null =
    originType === 'user' && userCoordinates
      ? userCoordinates
      : odf && odf.coordenadas_gps
      ? odf.coordenadas_gps
      : null;

  const destCoords: Coordinates | null = nap.coordenadas_gps ? nap.coordenadas_gps : null;

  const googleMapsUrl =
    originCoords && destCoords ? getGoogleMapsUrl(originCoords, destCoords) : '#';

  const wazeUrl = destCoords ? getWazeUrl(destCoords) : '#';

  const getStepIcon = (type?: string, modifier?: string) => {
    if (type === 'arrive') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />;
    }
    if (modifier?.includes('left')) {
      return <CornerDownLeft className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />;
    }
    if (modifier?.includes('right')) {
      return <CornerDownRight className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />;
    }
    if (modifier === 'uturn') {
      return <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
    }
    return <ArrowUp className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg dark:shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100">
      {/* Encabezado del Panel de Ruta */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xs leading-tight">{t('navigation.cardTitle')}</h4>
            <span className="text-[10px] text-sky-100 font-medium">{t('navigation.testingMode')}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
          title={t('navigation.closePanel')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Selector de Origen (Empresa vs Mi Ubicación) */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t('navigation.startingPoint')}
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onOriginChange('odf')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                originType === 'odf'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('navigation.centralOdf')}</span>
            </button>
            <button
              onClick={() => onOriginChange('user')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                originType === 'user'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{t('navigation.currentGps')}</span>
            </button>
          </div>
        </div>

        {/* Resumen de Destino */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/70 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              {t('navigation.destination')}: {nap.identificador}
            </span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-medium border border-sky-200 dark:border-sky-800">
              {nap.zona}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {nap.direccion_texto || t('navigation.noAddress')}
          </p>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span>{t('navigation.calculating')}</span>
          </div>
        )}

        {/* Métricas de Viaje si ya cargó */}
        {!isLoading && routeResult && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {t('navigation.drivingDistance')}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Car className="w-4 h-4 text-indigo-500" />
                  {formatDistance(routeResult.distanceMeters)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {t('navigation.estimatedTime')}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  {formatDuration(routeResult.durationSeconds)}
                </span>
              </div>
            </div>

            {routeResult.isFallback && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2 rounded-lg flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {t('navigation.offlineFallback')}
                </span>
              </div>
            )}

            {/* Desplegable de Indicaciones Giro a Giro */}
            {routeResult.steps.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t('navigation.stepByStep', { count: routeResult.steps.length })}</span>
                  </span>
                  {showSteps ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showSteps && (
                  <div className="max-h-48 overflow-y-auto p-2 space-y-2 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                    {routeResult.steps.map((step, idx) => (
                      <div key={idx} className="pt-1.5 first:pt-0 flex items-start gap-2">
                        {getStepIcon(step.type, step.modifier)}
                        <div className="flex-1">
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                            {step.instruction}
                          </p>
                          {step.distanceMeters > 0 && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {formatDistance(step.distanceMeters)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botones de Navegación Externa para Técnicos en Campo */}
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('navigation.openGoogleMaps')}</span>
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-500" />
                <span>{t('navigation.openWaze')}</span>
              </a>
            </div>
          </>
        )}

        {/* Botón para Desactivar/Ocultar Prueba */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{t('navigation.evaluationPeriod')}</span>
          <button
            onClick={onClose}
            className="text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
          >
            {t('navigation.clearRoute')}
          </button>
        </div>
      </div>
    </div>
  );
};
