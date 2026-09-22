import React, { useState } from 'react';
import {
  Compass,
  X,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Camera,
  MapPin,
  Navigation,
  Eye
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

  if (!isOpen || !coordinates) return null;

  const { lat, lng } = coordinates;
  const latFixed = lat.toFixed(6);
  const lngFixed = lng.toFixed(6);

  // Enlace Oficial y 100% legal de Google Maps URLs API (map_action=pano)
  const officialStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  // Enlace oficial de Google Earth 3D para inspección topográfica de relieve y vegetación
  const googleEarthUrl = `https://earth.google.com/web/@${lat},${lng},2600a,1000d,35y,0h,45t,0r`;

  // URL del visualizador embebido (Street View Panorama Embebido con fallback satélite)
  const embedStreetViewUrl = `https://maps.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed`;

  const handleCopyGps = () => {
    navigator.clipboard.writeText(`${latFixed}, ${lngFixed}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="street-view-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Cabecera con Alto Contraste */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 sm:px-6 py-3.5 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-500 text-slate-950 font-black rounded-xl shadow-xs flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="street-view-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {title}
                </h2>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-600">
                  360° Oficial
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {subtitle || 'Vista fotográfica a nivel de calle de la infraestructura GPON / poste / fachada'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Cerrar vista Street View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Coordenadas y Copia Rápida */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
            <span>Coordenadas de Campo:</span>
            <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-900 dark:text-white">
              {latFixed}, {lngFixed}
            </code>
          </div>

          <button
            onClick={handleCopyGps}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Visualizador Embebido 360° */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          <iframe
            title="Visualizador 360 Street View"
            src={embedStreetViewUrl}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Superposición informativa si la zona no tiene cobertura vehicular Street View directa */}
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-md bg-slate-900/90 text-white p-2.5 rounded-xl text-[11px] backdrop-blur border border-slate-700/80 pointer-events-none">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspección 360° en Tiempo Real</span>
            </p>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Si el visor se muestra estático o negro, pulsa el botón dorado inferior para abrir el panorama oficial con giroscopio y navegación táctil.
            </p>
          </div>
        </div>

        {/* Pie con Botones de Acción de Alto Contraste */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 sm:px-6 py-3.5 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium text-center sm:text-left">
            <span>Esquema oficial 100% legal: </span>
            <strong className="text-slate-900 dark:text-white">Google Maps URLs API</strong>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            {/* Botón Google Earth 3D */}
            <a
              href={googleEarthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors shadow-xs"
              title="Abrir en Google Earth 3D para ver modelo de relieve"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Google Earth 3D</span>
            </a>

            {/* Botón Principal Street View Oficial 360° */}
            <a
              href={officialStreetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border border-amber-600 shadow-md shadow-amber-950/20 transition-all cursor-pointer"
              title="Abrir en Google Maps Street View 360° nativo (celular o pantalla completa)"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Abrir Street View 360° Oficial</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-900" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

