import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Camera,
  MapPin,
  Eye,
  Satellite
} from 'lucide-react';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lat: number; lng: number } | null;
  title?: string;
  subtitle?: string;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  coordinates,
  title = 'Inspección Street View 360°',
  subtitle
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'streetview' | 'satellite'>('streetview');

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Restablecer al modo predeterminado al abrir
  useEffect(() => {
    if (isOpen) {
      setViewMode('streetview');
      setCopied(false);
    }
  }, [isOpen, coordinates]);

  if (!isOpen || !coordinates) return null;

  const { lat, lng } = coordinates;
  const latFixed = lat.toFixed(6);
  const lngFixed = lng.toFixed(6);

  // Enlace Oficial y 100% legal de Google Maps URLs API (map_action=pano)
  const officialStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  // Enlace oficial de Google Earth 3D para inspección topográfica de relieve y vegetación
  const googleEarthUrl = `https://earth.google.com/web/@${lat},${lng},2600a,1000d,35y,0h,45t,0r`;

  // URL del visualizador embebido Street View 360°
  const embedStreetViewUrl = `https://maps.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed`;

  // URL del visualizador embebido Satélite HD (cobertura 100% garantizada de techos, calles y postes)
  const embedSatelliteUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=19&ie=UTF8&iwloc=&output=embed`;

  const handleCopyGps = () => {
    navigator.clipboard.writeText(`${latFixed}, ${lngFixed}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="street-view-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] transition-colors animate-scaleUp">
        {/* Cabecera con Alto Contraste y diseño responsivo anti-deformación */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-3.5 sm:px-6 py-3 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto transition-colors animate-scaleUp">
        {/* Cabecera limpia y responsiva */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-amber-500 text-slate-950 font-black rounded-xl shadow-xs flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2
                  id="street-view-modal-title"
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate"
                >
                  {title}
                </h2>
                <span className="text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-600 shrink-0 whitespace-nowrap">
                  360° Oficial
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                {subtitle || 'Vista a nivel de calle de la infraestructura GPON / poste / fachada'}
              </p>
              <h2
                id="street-view-modal-title"
                className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar vista Street View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Coordenadas, Selector de Modo (Street View vs Satélite) y Copia Rápida */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">GPS:</span>
            <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-900 dark:text-white text-[11px] sm:text-xs">
              {latFixed}, {lngFixed}
            </code>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Conmutador entre Street View 360° y Satélite HD */}
            <div className="bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode('streetview')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'streetview'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
                title="Ver toma a nivel de calle 360°"
              >
                <Camera className="w-3 h-3" />
                <span>360°</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('satellite')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'satellite'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
                title="Ver satélite cenital en alta resolución"
              >
                <Satellite className="w-3 h-3" />
                <span>Satélite HD</span>
              </button>
            </div>

            <button
              onClick={handleCopyGps}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Copiar GPS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visualizador Embebido (Street View 360° o Satélite HD con Iframe) */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        {/* Visualizador Embebido Adaptativo */}
        <div className="relative flex-1 h-[42vh] min-h-[220px] max-h-[380px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden shrink">
          <iframe
            key={viewMode}
            title={viewMode === 'streetview' ? 'Visualizador 360 Street View' : 'Visualizador Satélite HD'}
            src={viewMode === 'streetview' ? embedStreetViewUrl : embedSatelliteUrl}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Superposición informativa si la zona no tiene cobertura vehicular Street View directa */}
          {viewMode === 'streetview' ? (
            <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-md bg-slate-900/90 text-white p-2.5 rounded-xl text-[11px] backdrop-blur border border-slate-700/80 pointer-events-none">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspección 360° en Tiempo Real</span>
              </p>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Si esta calle no tiene cobertura vehicular del auto de Google, pulsa <strong>"Satélite HD"</strong> arriba o el botón dorado abajo.
              </p>
            </div>
          ) : (
            <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-md bg-slate-900/90 text-white p-2.5 rounded-xl text-[11px] backdrop-blur border border-slate-700/80 pointer-events-none">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-indigo-400" />
                <span>Vista Cenital Satélite HD Activa</span>
              </p>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Fotografía satelital cenital de alta resolución con calles, techos y postes visibles.
              </p>
            </div>
          )}
        </div>

        {/* Pie con Botones de Acción de Alto Contraste */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-3.5 sm:px-6 py-2.5 sm:py-3 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 font-medium text-center sm:text-left hidden xs:block">
            <span>Esquema oficial 100% legal: </span>
            <strong className="text-slate-900 dark:text-white">Google Maps URLs API & Esri Satélite HD</strong>
          </div>
        {/* Pie con Botones de Acción Siempre Visibles */}
        <div className="bg-slate-100 dark:bg-slate-800/95 px-3.5 sm:px-6 py-2.5 sm:py-3 border-t border-slate-300 dark:border-slate-700 flex items-center justify-end gap-2 sm:gap-3 shrink-0 z-10">
          {/* Botón Google Earth 3D */}
          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors shadow-xs"
            title="Abrir en Google Earth 3D para ver modelo de relieve"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Google Earth 3D</span>
          </a>

          <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            {/* Botón Google Earth 3D */}
            <a
              href={googleEarthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors shadow-xs"
              title="Abrir en Google Earth 3D para ver modelo de relieve"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Google Earth 3D</span>
            </a>

            {/* Botón Principal Street View Oficial 360° */}
            <a
              href={officialStreetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border border-amber-600 shadow-md shadow-amber-950/20 transition-all cursor-pointer whitespace-nowrap"
              title="Abrir en Google Maps Street View 360° nativo (celular o pantalla completa)"
            >
              <Camera className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Abrir Street View 360°</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-900 shrink-0" />
            </a>
          </div>
          {/* Botón Principal Street View Oficial 360° */}
          <a
            href={officialStreetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border border-amber-600 shadow-md shadow-amber-950/20 transition-all cursor-pointer whitespace-nowrap"
            title="Abrir en Google Maps Street View 360° nativo (celular o pantalla completa)"
          >
            <Camera className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Abrir Street View 360°</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-900 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

