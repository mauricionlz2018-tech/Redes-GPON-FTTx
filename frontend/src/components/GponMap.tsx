import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { NapBox, OdfPanel } from '../types';
import { Network, Server, MapPin, Radio, Compass } from 'lucide-react';

interface GponMapProps {
  naps: NapBox[];
  odf: OdfPanel | null;
  selectedNap: NapBox | null;
  onSelectNap: (nap: NapBox) => void;
  onOpenGpsModal: (nap: NapBox) => void;
}

// Generador de iconos Leaflet personalizados
const createOdfIcon = () => {
  return L.divIcon({
    className: 'custom-odf-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 bg-sky-600 border-2 border-white rounded-xl shadow-lg text-white animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
};

const createNapIcon = (nap: NapBox, isSelected: boolean) => {
  const metricas = nap.metricas;
  const pct = metricas ? metricas.porcentajeSaturacion : 0;
  const ocupados = metricas ? metricas.ocupados : 0;
  const total = nap.total_puertos || 16;

  // Código de colores estricto según especificación
  let bgColor = 'bg-emerald-500'; // Verde: <80%
  let borderColor = 'border-emerald-300';
  let badgeColor = 'bg-emerald-700';

  if (pct >= 100) {
    bgColor = 'bg-red-600'; // Rojo: Saturada
    borderColor = 'border-red-300';
    badgeColor = 'bg-red-800';
  } else if (pct >= 80) {
    bgColor = 'bg-amber-500'; // Amarillo: >=80%
    borderColor = 'border-amber-200';
    badgeColor = 'bg-amber-700';
  }

  const selectedRing = isSelected ? 'ring-4 ring-white shadow-2xl scale-110' : 'shadow-md';

  return L.divIcon({
    className: 'custom-nap-marker',
    html: `
      <div class="relative flex flex-col items-center cursor-pointer transition-transform ${selectedRing}">
        <div class="flex items-center justify-center w-9 h-9 ${bgColor} border-2 ${borderColor} rounded-full text-white font-bold text-xs shadow-lg">
          ${ocupados}/${total}
        </div>
        <div class="w-2 h-2 ${bgColor} rotate-45 -mt-1 shadow-sm"></div>
        <div class="text-[10px] font-bold text-slate-900 bg-white/95 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 -mt-0.5 whitespace-nowrap">
          ${nap.identificador}
        </div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 36],
    popupAnchor: [0, -36]
  });
};

export const GponMap: React.FC<GponMapProps> = ({
  naps,
  odf,
  selectedNap,
  onSelectNap,
  onOpenGpsModal
}) => {
  // Centro por defecto: San José del Rincón, Edo. Méx.
  const defaultCenter: [number, number] = useMemo(() => {
    if (odf && odf.coordenadas_gps) {
      return [odf.coordenadas_gps.lat, odf.coordenadas_gps.lng];
    }
    return [19.6642, -100.1472];
  }, [odf]);

  const odfIcon = useMemo(() => createOdfIcon(), []);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Capa de Cartografía OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador del ODF Central */}
        {odf && odf.coordenadas_gps && (
          <Marker
            position={[odf.coordenadas_gps.lat, odf.coordenadas_gps.lng]}
            icon={odfIcon}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-sm mb-1">
                  <Server className="w-4 h-4" />
                  <span>{odf.nombre}</span>
                </div>
                <p className="text-xs text-slate-300">{odf.ubicacion_central}</p>
                <div className="mt-2 text-[11px] text-slate-400 bg-slate-800 p-1.5 rounded border border-slate-700">
                  <span>Capacidad: </span>
                  <strong className="text-white">{odf.capacidad_hilos} Hilos de Fibra</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Trazado de Hilos / Líneas de Fibra Óptica (Polylines) entre ODF y NAPs */}
        {odf &&
          naps.map((nap) => {
            if (!nap.coordenadas_gps) return null;
            const isSelected = selectedNap?.id_nap === nap.id_nap;
            const positions: [number, number][] = [
              [odf.coordenadas_gps.lat, odf.coordenadas_gps.lng],
              [nap.coordenadas_gps.lat, nap.coordenadas_gps.lng]
            ];

            return (
              <Polyline
                key={`fiber-${nap.id_nap}`}
                positions={positions}
                pathOptions={{
                  color: isSelected ? '#0ea5e9' : '#0284c7',
                  weight: isSelected ? 4 : 2,
                  dashArray: isSelected ? '6, 6' : undefined,
                  opacity: isSelected ? 0.9 : 0.45
                }}
              />
            );
          })}

        {/* Marcadores de Cajas NAP con colores según saturación */}
        {naps.map((nap) => {
          if (!nap.coordenadas_gps) return null;
          const isSelected = selectedNap?.id_nap === nap.id_nap;
          const icon = createNapIcon(nap, isSelected);
          const m = nap.metricas;
          const pct = m ? m.porcentajeSaturacion : 0;

          return (
            <Marker
              key={nap.id_nap}
              position={[nap.coordenadas_gps.lat, nap.coordenadas_gps.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectNap(nap)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[210px] text-slate-100">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-2">
                    <span className="font-bold text-sm text-sky-400 flex items-center gap-1">
                      <Network className="w-3.5 h-3.5" />
                      {nap.identificador}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        pct >= 100
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : pct >= 80
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {pct}% Ocupado
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-1">{nap.zona}</p>
                  <p className="text-[11px] text-slate-400 mb-2">{nap.direccion_texto}</p>

                  {/* Barra de progreso de saturación */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] mb-3 bg-slate-800/80 p-1.5 rounded border border-slate-700">
                    <div>
                      Libres: <strong className="text-emerald-400">{m?.libres ?? 0}</strong>
                    </div>
                    <div>
                      Ocupados: <strong className="text-sky-400">{m?.ocupados ?? 0}</strong>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => onSelectNap(nap)}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium py-1.5 px-2 rounded-md transition-colors flex items-center justify-center gap-1 shadow"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Ver Panel de 16 Puertos</span>
                    </button>
                    <button
                      onClick={() => onOpenGpsModal(nap)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Capturar GPS de Campo</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda del Mapa flotante en esquina */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-xl max-w-[200px]">
        <span className="font-semibold text-white block mb-1.5">Semáforo de Saturación</span>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span>&lt; 80% Disponible</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          <span>&ge; 80% En Alerta</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-600/20" />
          <span>100% Saturada / Dañada</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-sky-400 font-medium">
          <span className="w-3 h-0.5 bg-sky-500" />
          <span>Fibra Óptica ODF</span>
        </div>
      </div>
    </div>
  );
};

