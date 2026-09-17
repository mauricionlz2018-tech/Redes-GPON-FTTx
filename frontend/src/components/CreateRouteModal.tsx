import React, { useState, useMemo } from 'react';
import { X, Network, MapPin, Plus, Trash2, CheckCircle2, Ruler } from 'lucide-react';
import { FiberRoute } from '../types';
import { FIBER_DESIGN_COLORS } from './standardFiberIcons';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoute: (route: FiberRoute) => void;
  defaultCoordinates?: [number, number];
}

// Cálculo geodésico Haversine para metros y kilómetros
function calculateDistanceMeters(coords: [number, number][]): number {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  const R = 6371000; // Radio de la Tierra en metros

  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i];
    const [lat2, lon2] = coords[i + 1];

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }

  return Math.round(total * 10) / 10;
}

export const CreateRouteModal: React.FC<CreateRouteModalProps> = ({
  isOpen,
  onClose,
  onSaveRoute,
  defaultCoordinates = [19.698, -100.112]
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'troncal' | 'ramal' | 'distribucion'>('troncal');
  const [hilos, setHilos] = useState<number>(48);
  const [subtipo, setSubtipo] = useState('Troncal 48H');
  const [color, setColor] = useState(FIBER_DESIGN_COLORS.fibraTroncal48H);
  const [grosor, setGrosor] = useState(4);
  const [estado, setEstado] = useState<'operativa' | 'en_construccion' | 'planificada'>('operativa');

  // Coordenadas del tendido: lista de puntos [lat, lng]
  const [points, setPoints] = useState<[number, number][]>([
    [defaultCoordinates[0], defaultCoordinates[1]],
    [defaultCoordinates[0] + 0.008, defaultCoordinates[1] + 0.006]
  ]);

  // Manejar cambio de tipo de cable para autoajustar color y grosor según la norma
  const handleSubtipoPresetChange = (preset: string) => {
    setSubtipo(preset);
    if (preset === 'Troncal 96H') {
      setTipo('troncal');
      setHilos(96);
      setColor(FIBER_DESIGN_COLORS.fibraTroncal96H);
      setGrosor(5);
    } else if (preset === 'Troncal 48H') {
      setTipo('troncal');
      setHilos(48);
      setColor(FIBER_DESIGN_COLORS.fibraTroncal48H);
      setGrosor(4);
    } else if (preset === 'Troncal 12H') {
      setTipo('troncal');
      setHilos(12);
      setColor(FIBER_DESIGN_COLORS.fibraTroncal12H);
      setGrosor(3.5);
    } else if (preset === 'Distribución 12H') {
      setTipo('distribucion');
      setHilos(12);
      setColor(FIBER_DESIGN_COLORS.fibraDistribucion12H);
      setGrosor(3);
    } else if (preset === 'Ramal 24H') {
      setTipo('ramal');
      setHilos(24);
      setColor(FIBER_DESIGN_COLORS.fibra24H);
      setGrosor(3);
    }
  };

  // Cálculo en tiempo real de la distancia de la línea
  const distanciaMetros = useMemo(() => calculateDistanceMeters(points), [points]);
  const distanciaKm = useMemo(() => Number((distanciaMetros / 1000).toFixed(2)), [distanciaMetros]);

  const handlePointChange = (index: number, field: 'lat' | 'lng', val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setPoints((prev) => {
      const copy = [...prev];
      const current = [...copy[index]] as [number, number];
      if (field === 'lat') current[0] = num;
      if (field === 'lng') current[1] = num;
      copy[index] = current;
      return copy;
    });
  };

  const handleAddPoint = () => {
    const lastPoint = points[points.length - 1] || defaultCoordinates;
    setPoints([...points, [lastPoint[0] + 0.003, lastPoint[1] + 0.003]]);
  };

  const handleRemovePoint = (index: number) => {
    if (points.length <= 2) return;
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor introduce un nombre para la ruta');
      return;
    }

    const newRoute: FiberRoute = {
      id_ruta: `route-custom-${Date.now()}`,
      nombre: nombre.trim(),
      tipo,
      subtipo,
      color,
      grosor,
      hilos,
      distancia_metros: distanciaMetros,
      distancia_km: distanciaKm,
      origen: `Punto Inicial (${points[0][0].toFixed(4)}, ${points[0][1].toFixed(4)})`,
      destino: `Punto Final (${points[points.length - 1][0].toFixed(4)}, ${points[points.length - 1][1].toFixed(4)})`,
      coordenadas: points,
      vertices: points.length,
      estado
    };

    onSaveRoute(newRoute);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Agregar Nueva Línea Troncal / Ramal</h3>
              <p className="text-xs text-indigo-200/80">
                Diseño de tendido con cálculo automático de metrajes (ML y Kilómetros)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Card de Distancia en Tiempo Real */}
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-emerald-950/30 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Longitud Calculada de Tendido:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-indigo-950 dark:text-indigo-200">
                    {distanciaKm} km
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ({distanciaMetros.toLocaleString()} Metros Lineales)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-medium">
              <span>{points.length} Vértices GPS</span>
            </div>
          </div>

          {/* Preset y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo / Norma de Cable
              </label>
              <select
                value={subtipo}
                onChange={(e) => handleSubtipoPresetChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Troncal 96H">Troncal 96 Hilos (Púrpura - #4a148c)</option>
                <option value="Troncal 48H">Troncal 48 Hilos (Café - #8d5b4c)</option>
                <option value="Troncal 12H">Troncal 12 Hilos (Magenta - #e0009c)</option>
                <option value="Distribución 12H">Distribución 12 Hilos (Celeste - #00e5ff)</option>
                <option value="Ramal 24H">Ramal 24 Hilos (Naranja - #ff7043)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre de la Ruta / Tramo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Troncal Ixtlahuaca a Subestación CFE"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Configuración avanzada de color, grosor y estado */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Color de Línea
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Capacidad de Hilos
              </label>
              <input
                type="number"
                min="2"
                max="288"
                value={hilos}
                onChange={(e) => setHilos(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estado de Operación
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="operativa">Operativa (En servicio)</option>
                <option value="en_construccion">En Construcción / Tendido</option>
                <option value="planificada">Planificada / En Proyecto</option>
              </select>
            </div>
          </div>

          {/* Lista de Vértices GPS del Tendido */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Vértices y Trayectoria GPS del Cable ({points.length} puntos)
              </span>
              <button
                type="button"
                onClick={handleAddPoint}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 px-2 py-1 rounded-md shadow-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar Vértice</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.000001"
                      value={pt[0]}
                      onChange={(e) => handlePointChange(idx, 'lat', e.target.value)}
                      placeholder="Latitud"
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono"
                    />
                    <input
                      type="number"
                      step="0.000001"
                      value={pt[1]}
                      onChange={(e) => handlePointChange(idx, 'lng', e.target.value)}
                      placeholder="Longitud"
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  {points.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Eliminar este punto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar e Integrar al Mapa ({distanciaKm} km)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

