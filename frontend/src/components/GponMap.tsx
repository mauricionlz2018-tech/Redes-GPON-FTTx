import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NapBox, OdfPanel, FiberRoute, EmpalmeClosure } from '../types';
import { Network, Server, Radio, Compass, Navigation, X, GitCommit, Trash2, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { RouteResult, formatDistance, formatDuration } from '../services/routingService';
import { mockFiberRoutes, mockEmpalmes } from '../data/mockGponData';

interface GponMapProps {
  naps: NapBox[];
  odf: OdfPanel | null;
  selectedNap: NapBox | null;
  onSelectNap: (nap: NapBox) => void;
  onViewPorts?: (nap: NapBox) => void;
  onOpenGpsModal: (nap: NapBox) => void;
  activeRoute?: RouteResult | null;
  onRequestRoute?: (nap: NapBox) => void;
  onClearRoute?: () => void;
  fiberRoutes?: FiberRoute[];
  empalmes?: EmpalmeClosure[];
  onDeleteNapRequest?: (nap: NapBox) => void;
}

// Componente para ajustar dinámicamente el encuadre del mapa
const MapBoundsAdjuster: React.FC<{ coordinates?: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 1) {
      try {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true
        });
      } catch (e) {
        console.warn('No se pudo ajustar el encuadre a la ruta:', e);
      }
    }
  }, [coordinates, map]);

  return null;
};

// Generador de icono para el ODF Central
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

// Generador de icono para Cierres de Empalme / Muffas
const createEmpalmeIcon = () => {
  return L.divIcon({
    className: 'custom-empalme-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 bg-amber-600 border-2 border-white rounded-lg shadow-md text-white hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="12" x="3" y="6" rx="2"/><path d="M7 12h10"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Generador de icono para Cajas NAP
const createNapIcon = (nap: NapBox, isSelected: boolean, isRouteDestination: boolean) => {
  const metricas = nap.metricas;
  const pct = metricas ? metricas.porcentajeSaturacion : 0;
  const ocupados = metricas ? metricas.ocupados : 0;
  const total = nap.total_puertos || 16;

  let bgColor = 'bg-emerald-500'; // Verde: <80%
  let borderColor = 'border-emerald-300';

  if (pct >= 100) {
    bgColor = 'bg-red-600'; // Rojo: saturada o dañada
    borderColor = 'border-red-400';
  } else if (pct >= 80) {
    bgColor = 'bg-amber-500'; // Amarillo: >=80%
    borderColor = 'border-amber-300';
  }

  let ringStyle = 'ring-2 ring-white/90 shadow-md';
  if (isRouteDestination) {
    ringStyle = 'ring-4 ring-indigo-500 scale-125 shadow-indigo-500/60 shadow-xl animate-bounce';
  } else if (isSelected) {
    ringStyle = 'ring-4 ring-sky-400 scale-110 shadow-sky-500/50 shadow-md';
  }

  return L.divIcon({
    className: 'custom-nap-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-200">
        <div class="w-8 h-8 rounded-full ${bgColor} border-2 ${borderColor} ${ringStyle} text-white flex items-center justify-center font-bold text-[11px]">
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
  onViewPorts,
  onOpenGpsModal,
  activeRoute,
  onRequestRoute,
  onClearRoute,
  fiberRoutes = mockFiberRoutes,
  empalmes = mockEmpalmes,
  onDeleteNapRequest
}) => {
  // Centro por defecto: Cobertura de la red en San José del Rincón
  const defaultCenter: [number, number] = useMemo(() => {
    return [19.6980, -100.1120];
  }, []);

  const odfIcon = useMemo(() => createOdfIcon(), []);
  const empalmeIcon = useMemo(() => createEmpalmeIcon(), []);
  const [isLegendOpen, setIsLegendOpen] = React.useState(true);

  return (
    <div id="seccion-mapa-gpon" className="relative isolate w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors scroll-mt-24">
      {/* Banner flotante superior si hay una ruta vial activa */}
      {activeRoute && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-semibold">
          <Navigation className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            Ruta activa: {formatDistance(activeRoute.distanceMeters)} ({formatDuration(activeRoute.durationSeconds)})
          </span>
          {onClearRoute && (
            <button
              onClick={onClearRoute}
              className="ml-1 text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              title="Quitar ruta"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapBoundsAdjuster coordinates={activeRoute?.coordinates} />

        {/* Capa de Cartografía Oficial OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Trazado de Rutas Reales de Fibra Óptica (Troncales y Ramales del KMZ) */}
        {fiberRoutes.map((route) => (
          <Polyline
            key={`route-${route.id_ruta}`}
            positions={route.coordenadas}
            pathOptions={{
              color: route.color,
              weight: route.grosor,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Popup>
              <div className="p-1 max-w-[240px] text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                  <span>{route.nombre}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Tipo: <strong className="uppercase text-slate-700 dark:text-slate-200">{route.tipo}</strong>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Vértices de tendido: <strong>{route.vertices} puntos GPS</strong>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* 2. Marcadores de Cierres de Empalme (Muffas) */}
        {empalmes.map((emp) => (
          <Marker
            key={emp.id_empalme}
            position={[emp.coordenadas_gps.lat, emp.coordenadas_gps.lng]}
            icon={empalmeIcon}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm mb-1">
                  <GitCommit className="w-4 h-4" />
                  <span>{emp.nombre}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">{emp.tipo_cierre}</p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-800/60">
                  GPS: <strong>{emp.coordenadas_gps.lat.toFixed(5)}, {emp.coordenadas_gps.lng.toFixed(5)}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Marcador del ODF Central en Cabecera */}
        {odf && odf.coordenadas_gps && (
          <Marker
            position={[odf.coordenadas_gps.lat, odf.coordenadas_gps.lng]}
            icon={odfIcon}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-sm mb-1">
                  <Server className="w-4 h-4" />
                  <span>{odf.nombre}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{odf.ubicacion_central}</p>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                  <span>Capacidad: </span>
                  <strong className="text-slate-900 dark:text-white">{odf.capacidad_hilos} Hilos de Fibra</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Trazado de Ruta Vial de Navegación (Modo Pruebas OSRM) */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <>
            <Polyline
              key="route-outline"
              positions={activeRoute.coordinates}
              pathOptions={{
                color: '#1e1b4b',
                weight: 7,
                opacity: 0.75,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Polyline
              key="route-line"
              positions={activeRoute.coordinates}
              pathOptions={{
                color: '#6366f1',
                weight: 4.5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* 5. Marcadores de las 25 Cajas NAP Reales con semáforo cromático */}
        {naps.map((nap) => {
          if (!nap.coordenadas_gps) return null;
          const isSelected = selectedNap?.id_nap === nap.id_nap;
          const isRouteDestination = Boolean(activeRoute && selectedNap?.id_nap === nap.id_nap);
          const icon = createNapIcon(nap, isSelected, isRouteDestination);
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
                <div className="p-1 min-w-[220px] text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                    <span className="font-bold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <Network className="w-3.5 h-3.5" />
                      {nap.identificador}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        pct >= 100
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30'
                          : pct >= 80
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                      }`}
                    >
                      {pct}% Ocupado
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">{nap.zona}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{nap.direccion_texto}</p>

                  {/* Barra de progreso de saturación */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] mb-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                    <div>
                      Libres: <strong className="text-emerald-600 dark:text-emerald-400">{m?.libres ?? 0}</strong>
                    </div>
                    <div>
                      Ocupados: <strong className="text-sky-600 dark:text-sky-400">{m?.ocupados ?? 0}</strong>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-1.5">
                    {onRequestRoute && (
                      <button
                        onClick={() => onRequestRoute(nap)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Trazar Ruta de Llegada</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectNap(nap);
                        if (onViewPorts) {
                          onViewPorts(nap);
                        } else {
                          const panel = document.getElementById('panel-puertos-nap');
                          if (panel) {
                            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Ver Panel de {nap.total_puertos || 16} Puertos</span>
                    </button>
                    <button
                      onClick={() => onOpenGpsModal(nap)}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>Calibrar GPS de Campo</span>
                    </button>

                    {onDeleteNapRequest && (
                      <button
                        onClick={() => onDeleteNapRequest(nap)}
                        className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 border border-red-200 dark:border-red-800/60 cursor-pointer"
                        title="Eliminar o dar de baja esta caja NAP"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Caja NAP</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda del Mapa flotante en esquina - Plegable y contenida en el mapa */}
      {!isLegendOpen ? (
        <button
          onClick={() => setIsLegendOpen(true)}
          className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-md flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Mostrar leyenda de la red"
        >
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span>Leyenda</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      ) : (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-lg dark:shadow-xl max-w-[210px] transition-all">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white">Topología GPON</span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimizar leyenda"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span>&lt; 80% Libre ({naps.filter(n => (n.metricas?.porcentajeSaturacion || 0) < 80).length})</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span>&ge; 80% Alerta ({naps.filter(n => (n.metricas?.porcentajeSaturacion || 0) >= 80 && (n.metricas?.porcentajeSaturacion || 0) < 100).length})</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-600/20" />
            <span>100% Saturada ({naps.filter(n => (n.metricas?.porcentajeSaturacion || 0) >= 100).length})</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-amber-600 font-medium mb-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-600 shrink-0" />
            <span>Muffas ({empalmes.length})</span>
          </div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium">
            <span className="w-3 h-0.5 bg-sky-500 shrink-0" />
            <span>Rutas Fibra ({fiberRoutes.length})</span>
          </div>
          {activeRoute && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-medium">
              <span className="w-3 h-1 bg-indigo-500 rounded-full" />
              <span>Ruta Vial Activa</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
