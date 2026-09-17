import React, { useState } from 'react';
import { PosteInfraestructura } from '../types';
import { MapPin, X, Compass, CheckCircle, AlertCircle } from 'lucide-react';

interface CreatePosteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePoste: (newPoste: PosteInfraestructura) => void;
  defaultCoordinates?: [number, number];
  existingPostesCount?: number;
}

export const CreatePosteModal: React.FC<CreatePosteModalProps> = ({
  isOpen,
  onClose,
  onSavePoste,
  defaultCoordinates = [19.6450, -99.8200],
  existingPostesCount = 144
}) => {
  const [tipo, setTipo] = useState<'poste_propuesto' | 'poste_cfe'>('poste_propuesto');
  const [codigo, setCodigo] = useState(() => {
    return `POSTE-P-${existingPostesCount + 1}`;
  });
  const [material, setMaterial] = useState('Concreto 12m');
  const [lat, setLat] = useState<string | number>(defaultCoordinates[0]);
  const [lng, setLng] = useState<string | number>(defaultCoordinates[1]);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Cambiar prefijo de código sugerido según el tipo
  const handleTipoChange = (newTipo: 'poste_propuesto' | 'poste_cfe') => {
    setTipo(newTipo);
    if (newTipo === 'poste_propuesto') {
      setCodigo(`POSTE-P-${existingPostesCount + 1}`);
    } else {
      setCodigo(`CFE-${Math.floor(800 + Math.random() * 200)}`);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu dispositivo o navegador no soporta geolocalización GPS.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
        setErrorMsg(null);
      },
      (err) => {
        console.warn('Error GPS:', err);
        setErrorMsg('No se pudo obtener la ubicación GPS actual.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;

    if (!codigo.trim()) {
      setErrorMsg('Por favor ingresa un código o identificador para el poste.');
      return;
    }
    if (isNaN(numLat) || isNaN(numLng)) {
      setErrorMsg('Las coordenadas GPS no son válidas.');
      return;
    }

    const newPoste: PosteInfraestructura = {
      id_poste: `poste-custom-${Date.now()}`,
      nombre: codigo.trim().toUpperCase(),
      codigo: codigo.trim().toUpperCase(),
      tipo,
      coordenadas_gps: {
        lat: numLat,
        lng: numLng
      }
    };

    onSavePoste(newPoste);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto text-slate-900 dark:text-white transition-colors">
        {/* Cabecera Estándar */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Agregar Poste de Red</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Infraestructura de soporte aéreo de planta externa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tipo de Poste con Vista Previa Visual */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipo de Poste *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleTipoChange('poste_propuesto')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  tipo === 'poste_propuesto'
                    ? 'border-red-500 bg-red-50/60 dark:bg-red-950/30 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xs shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Poste Propuesto</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Proyectado de planta externa (Círculo rojo)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange('poste_cfe')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  tipo === 'poste_cfe'
                    ? 'border-slate-600 bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-600 text-[8px] text-white flex items-center justify-center font-bold border border-white shrink-0 mt-0.5">
                  +
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Poste CFE</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Concesión eléctrica existente
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Código / Nombre del Poste */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Código / Identificador del Poste *
            </label>
            <input
              type="text"
              required
              placeholder={tipo === 'poste_propuesto' ? 'Ej. POSTE-P-145' : 'Ej. CFE-804'}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono font-bold"
            />
          </div>

          {/* Material / Altura */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Material y Altura de Infraestructura
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Concreto 12m">Concreto Octagonal 12m</option>
              <option value="Concreto 9m">Concreto 9m</option>
              <option value="Madera Tratada 9m">Madera Tratada 9m</option>
              <option value="Metálico Tubular 10m">Metálico Tubular 10m</option>
              <option value="Pared / Fachada Directa">Soporte en Fachada / Muro</option>
            </select>
          </div>

          {/* Coordenadas GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ubicación Geodésica GPS *
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
              >
                <Compass className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Detectando...' : 'Obtener GPS actual'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5 font-medium">Latitud</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5 font-medium">Longitud</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Poste</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

