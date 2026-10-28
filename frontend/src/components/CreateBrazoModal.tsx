import React, { useState, useEffect } from 'react';
import { X, MapPin, Compass, CheckCircle2, AlertCircle, Wrench, Layers } from 'lucide-react';
import { BrazoExtension, NapBox } from '../types';

interface CreateBrazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBrazo: (newBrazo: BrazoExtension) => void;
  defaultCoordinates?: [number, number];
  existingBrazosCount?: number;
  brazoToEdit?: BrazoExtension | null;
  availableNaps?: NapBox[];
}

export const CreateBrazoModal: React.FC<CreateBrazoModalProps> = ({
  isOpen,
  onClose,
  onSaveBrazo,
  defaultCoordinates = [19.645, -99.82],
  existingBrazosCount = 27,
  brazoToEdit = null,
  availableNaps = []
}) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [longitudMetros, setLongitudMetros] = useState<number>(1.2);
  const [material, setMaterial] = useState('Acero Galvanizado en Caliente (Norma CFE)');
  const [tipo, setTipo] = useState('brazo_extension_nap');
  const [idNapAsociada, setIdNapAsociada] = useState<string>('');
  const [idPosteAsociado, setIdPosteAsociado] = useState<string>('');
  const [estado, setEstado] = useState('instalado');
  const [descripcion, setDescripcion] = useState('');
  const [lat, setLat] = useState<string | number>(defaultCoordinates[0]);
  const [lng, setLng] = useState<string | number>(defaultCoordinates[1]);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (brazoToEdit) {
      setCodigo(brazoToEdit.codigo || '');
      setNombre(brazoToEdit.nombre || '');
      setLongitudMetros(brazoToEdit.longitud_metros || 1.2);
      setMaterial(brazoToEdit.material || 'Acero Galvanizado en Caliente (Norma CFE)');
      setTipo(brazoToEdit.tipo || 'brazo_extension_nap');
      setIdNapAsociada(brazoToEdit.id_nap_asociada || '');
      setIdPosteAsociado(brazoToEdit.id_poste_asociado || '');
      setEstado(brazoToEdit.estado || 'instalado');
      setDescripcion(brazoToEdit.descripcion || '');
      if (brazoToEdit.coordenadas_gps) {
        setLat(brazoToEdit.coordenadas_gps.lat);
        setLng(brazoToEdit.coordenadas_gps.lng);
      }
      setErrorMsg(null);
    } else {
      const nextNum = existingBrazosCount + 1;
      const initialCodigo = `BR-${String(nextNum).padStart(2, '0')}`;
      setCodigo(initialCodigo);
      setNombre(`Brazo de Extensión ${initialCodigo}`);
      setLongitudMetros(1.2);
      setMaterial('Acero Galvanizado en Caliente (Norma CFE)');
      setTipo('brazo_extension_nap');
      setIdNapAsociada('');
      setIdPosteAsociado('');
      setEstado('instalado');
      setDescripcion('Herraje de montaje en poste para soporte y despeje de caja NAP.');
      if (defaultCoordinates && defaultCoordinates.length >= 2) {
        setLat(defaultCoordinates[0]);
        setLng(defaultCoordinates[1]);
      }
      setErrorMsg(null);
    }
  }, [isOpen, brazoToEdit, defaultCoordinates[0], defaultCoordinates[1], existingBrazosCount]);

  if (!isOpen) return null;

  // Al seleccionar una caja NAP, auto-rellenar las coordenadas y nombre si aplica
  const handleSelectNap = (napId: string) => {
    setIdNapAsociada(napId);
    if (!napId) return;

    const selected = availableNaps.find((n) => n.id_nap === napId);
    if (selected) {
      if (selected.coordenadas_gps?.lat && selected.coordenadas_gps?.lng) {
        setLat(selected.coordenadas_gps.lat);
        setLng(selected.coordenadas_gps.lng);
      }
      if (!brazoToEdit) {
        setNombre(`Brazo de Extensión para ${selected.identificador}`);
        setIdPosteAsociado(`POSTE-${selected.identificador}`);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu dispositivo no soporta geolocalización GPS.');
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
      setErrorMsg('Por favor ingresa un código de identificación.');
      return;
    }
    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa un nombre para el brazo de extensión.');
      return;
    }
    if (isNaN(numLat) || isNaN(numLng)) {
      setErrorMsg('Las coordenadas GPS no son válidas.');
      return;
    }

    const savedBrazo: BrazoExtension = {
      id_brazo: brazoToEdit ? brazoToEdit.id_brazo : `brazo-${Date.now()}`,
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      longitud_metros: Number(longitudMetros),
      tipo,
      material,
      id_nap_asociada: idNapAsociada || undefined,
      id_poste_asociado: idPosteAsociado || undefined,
      coordenadas_gps: {
        lat: numLat,
        lng: numLng
      },
      estado,
      descripcion: descripcion.trim() || undefined,
      is_custom: true
    };

    onSaveBrazo(savedBrazo);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors animate-scaleUp">
        {/* Cabecera del Modal */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-orange-500 text-white rounded-xl shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {brazoToEdit ? 'Editar Brazo de Extensión' : 'Registrar Brazo de Extensión'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Herraje de montaje en poste para soporte y despeje de cajas NAP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Código del Brazo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Código / Identificador *
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej. BR-01, BRAZO-NAP-05"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                required
              />
            </div>

            {/* Longitud de Extensión */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Longitud de Extensión
              </label>
              <select
                value={longitudMetros}
                onChange={(e) => setLongitudMetros(parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value={0.8}>0.80 m (Despeje corto)</option>
                <option value={1.0}>1.00 m (Estándar)</option>
                <option value={1.2}>1.20 m (Recomendado CFE)</option>
                <option value={1.5}>1.50 m (Despeje extendido)</option>
                <option value={2.0}>2.00 m (Brazo largo de alta tensión)</option>
              </select>
            </div>
          </div>

          {/* Nombre descriptivo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre descriptivo del elemento *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Brazo Extensión NAP-SJR-01"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              required
            />
          </div>

          {/* Caja NAP Asociada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>Caja NAP Asociada (Vínculo Directo)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
            </label>
            <select
              value={idNapAsociada}
              onChange={(e) => handleSelectNap(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
            >
              <option value="">-- Sin caja NAP asignada (Brazo autónomo) --</option>
              {availableNaps.map((nap) => (
                <option key={nap.id_nap} value={nap.id_nap}>
                  {nap.identificador} — {nap.zona || 'San José del Rincón'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Material */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Material / Tratamiento
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Acero Galvanizado en Caliente (Norma CFE)">Acero Galvanizado (Norma CFE)</option>
                <option value="Aluminio Estructural Anticorrosivo">Aluminio Estructural</option>
                <option value="Material Dieléctrico / Polímero">Material Dieléctrico Reforzado</option>
              </select>
            </div>

            {/* Estado de Conservación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estado Físico
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="instalado">Instalado y Operativo</option>
                <option value="optimo">Óptimo (Nuevo)</option>
                <option value="mantenimiento">Requiere Mantenimiento / Ajuste</option>
              </select>
            </div>
          </div>

          {/* Coordenadas GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Coordenadas Geográficas (Poste / Ubicación)</span>
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Compass className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Capturando GPS...' : 'Mi GPS actual'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitud (Ej. 19.7041)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Longitud (Ej. -100.115)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observaciones / Referencia
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Instalado en poste CFE de concreto para despeje de cables de media tensión."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{brazoToEdit ? 'Actualizar Brazo' : 'Guardar Brazo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
