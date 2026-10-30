import React, { useState, useEffect } from 'react';
import { NapBox, NapPort, NapPortStatus } from '../types';
import api from '../api/client';
import { putCachedNapImmediate, broadcastRealtimeEvent } from '../services/realtimeSync';
import { PlusCircle, MapPin, X, Compass, CheckCircle, AlertCircle } from 'lucide-react';

interface CreateNapModalProps {
  onClose: () => void;
  onCreatedSuccess: (newNap: NapBox) => void;
  defaultCoordinates?: { lat: number; lng: number };
  existingNaps?: NapBox[];
  napToEdit?: NapBox | null;
}

const getInitialIdentificador = (naps?: NapBox[]) => {
  if (!naps || naps.length === 0) return 'NAP-SJR-26';
  let maxNum = 0;
  naps.forEach((n) => {
    const match = n.identificador.match(/NAP-SJR-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum > 0 ? maxNum + 1 : naps.length + 1;
  return `NAP-SJR-${nextNum.toString().padStart(2, '0')}`;
};

export const CreateNapModal: React.FC<CreateNapModalProps> = ({
  onClose,
  onCreatedSuccess,
  defaultCoordinates,
  existingNaps,
  napToEdit = null
}) => {
  const [identificador, setIdentificador] = useState('');
  const [zona, setZona] = useState('');
  const [direccionTexto, setDireccionTexto] = useState('');
  const [lat, setLat] = useState<string | number>(defaultCoordinates?.lat ?? 19.6670);
  const [lng, setLng] = useState<string | number>(defaultCoordinates?.lng ?? -100.1490);
  const [totalPuertos, setTotalPuertos] = useState<number>(16);

  useEffect(() => {
    if (napToEdit) {
      setIdentificador(napToEdit.identificador || '');
      setZona(napToEdit.zona || '');
      setDireccionTexto(napToEdit.direccion_texto || '');
      setTotalPuertos(napToEdit.total_puertos || 16);
      if (napToEdit.coordenadas_gps) {
        setLat(napToEdit.coordenadas_gps.lat);
        setLng(napToEdit.coordenadas_gps.lng);
      }
    } else {
      setIdentificador(getInitialIdentificador(existingNaps));
      setZona('');
      setDireccionTexto('');
      setTotalPuertos(16);
      if (defaultCoordinates) {
        setLat(defaultCoordinates.lat);
        setLng(defaultCoordinates.lng);
      }
    }
  }, [napToEdit, defaultCoordinates?.lat, defaultCoordinates?.lng, existingNaps]);

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validacion en tiempo real si el nombre ya existe en la red
  const trimmedId = identificador.trim().toUpperCase();
  const duplicateMatch = existingNaps?.find((n) => {
    if (napToEdit && (n.id_nap === napToEdit.id_nap || n.identificador.toUpperCase() === napToEdit.identificador.toUpperCase())) {
      return false;
    }
    return n.identificador.trim().toUpperCase() === trimmedId;
  });
  const isDuplicateName = Boolean(trimmedId && duplicateMatch);

  // Obtener geolocalizacion actual del navegador / smartphone
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      (err) => {
        console.warn('Error al capturar GPS:', err);
        setErrorMsg('No se pudo obtener la ubicación GPS precisa. Puedes escribir las coordenadas manualmente.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Si el nombre ya existe, bloquea la creacion/edicion
    if (isDuplicateName) {
      setErrorMsg(`Alerta: Ya existe una caja NAP registrada con el nombre "${trimmedId}" en la zona "${duplicateMatch?.zona}". Debes cambiar el nombre.`);
      return;
    }

    if (!identificador.trim() || !zona.trim() || !direccionTexto.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (isNaN(numLat) || isNaN(numLng) || lat === '' || lng === '') {
      setErrorMsg('Por favor ingresa coordenadas GPS numéricas válidas.');
      return;
    }

    const payload = {
      identificador: trimmedId,
      zona: zona.trim(),
      direccion_texto: direccionTexto.trim(),
      total_puertos: Number(totalPuertos),
      coordenadas_gps: {
        lat: numLat,
        lng: numLng
      }
    };

    setLoading(true);

    if (napToEdit) {
      try {
        const res = await api.put(`/naps/${napToEdit.id_nap}`, payload);
        const updatedNap: NapBox = {
          ...napToEdit,
          ...payload,
          puertos: napToEdit.puertos,
          metricas: napToEdit.metricas
        };
        await putCachedNapImmediate(updatedNap);
        broadcastRealtimeEvent({ type: 'NAP_UPDATED', nap: updatedNap });
        onCreatedSuccess(updatedNap);
        onClose();
        return;
      } catch (err: any) {
        console.warn('Error guardando en backend, guardando en cache local:', err);
        const updatedNap: NapBox = {
          ...napToEdit,
          ...payload,
          puertos: napToEdit.puertos,
          metricas: napToEdit.metricas
        };
        await putCachedNapImmediate(updatedNap);
        broadcastRealtimeEvent({ type: 'NAP_UPDATED', nap: updatedNap });
        onCreatedSuccess(updatedNap);
        onClose();
        return;
      } finally {
        setLoading(false);
      }
    }

    // Modo creacion
    try {
      const res = await api.post('/naps', payload);
      if (res.data.success) {
        const createdNap: NapBox = res.data.data;
        await putCachedNapImmediate(createdNap);
        broadcastRealtimeEvent({ type: 'NAP_CREATED', nap: createdNap });
        onCreatedSuccess(createdNap);
        onClose();
        return;
      }
    } catch (err: any) {
      console.warn('Backend no respondio o error de conexion al registrar caja NAP:', err);
      if (err.response && (err.response.status === 409 || err.response.status === 400)) {
        const serverMsg = err.response.data?.message || 'Error de validación al registrar la caja';
        setErrorMsg(serverMsg);
        setLoading(false);
        return;
      }

      const localId = `local-nap-${Date.now()}`;
      const defaultPorts: NapPort[] = Array.from({ length: Number(totalPuertos) }, (_, i) => ({
        id_puerto: `port-local-${Date.now()}-${i + 1}`,
        id_nap: localId,
        indice_puerto: i + 1,
        estado: 'Libre' as NapPortStatus,
        cliente: null
      }));

      const localNap: NapBox = {
        id_nap: localId,
        identificador: trimmedId,
        zona: zona.trim(),
        id_puerto_pon: 'pon-slot1-port1',
        total_puertos: Number(totalPuertos),
        direccion_texto: direccionTexto.trim(),
        coordenadas_gps: {
          lat: numLat,
          lng: numLng
        },
        metricas: {
          total: Number(totalPuertos),
          libres: Number(totalPuertos),
          ocupados: 0,
          danados: 0,
          reservados: 0,
          porcentajeSaturacion: 0,
          estadoSaturacion: 'disponible'
        },
        puertos: defaultPorts
      };

      await putCachedNapImmediate(localNap);
      broadcastRealtimeEvent({ type: 'NAP_CREATED', nap: localNap });
      onCreatedSuccess(localNap);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(napToEdit);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 dark:text-white transition-colors">
        {/* Encabezado */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Editar Caja NAP' : 'Nueva Caja de Distribución Óptica (NAP)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Modificar datos de identificación, zona o ubicación geodésica'
                  : 'Registro de nuevo punto de acceso y matriz de puertos para abonados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 dark:bg-red-950/50 border border-red-500/30 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Identificador de Caja *
              </label>
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => {
                  setIdentificador(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ej. NAP-SJR-26"
                className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none transition-colors ${
                  isDuplicateName
                    ? 'border-red-500 text-red-700 dark:text-red-400 focus:border-red-600 bg-red-50/50 dark:bg-red-950/30'
                    : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-sky-500'
                }`}
              />
              {isDuplicateName && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div>
                    <strong className="block font-semibold">Nombre de caja ya registrado</strong>
                    <span>Ya existe una caja registrada como <strong>"{trimmedId}"</strong>{duplicateMatch?.zona ? ` en la zona "${duplicateMatch.zona}"` : ''}.</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Capacidad de Puertos
              </label>
              <select
                value={totalPuertos}
                disabled={isEditing}
                onChange={(e) => setTotalPuertos(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
              >
                <option value={8}>8 Puertos (Splitter 1:8)</option>
                <option value={16}>16 Puertos (Estándar 1:16)</option>
                <option value={24}>24 Puertos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Zona / Municipio / Localidad *
            </label>
            <input
              type="text"
              required
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Ej. San José del Rincón Centro"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dirección Física / Referencia del Poste *
            </label>
            <input
              type="text"
              required
              value={direccionTexto}
              onChange={(e) => setDireccionTexto(e.target.value)}
              placeholder="Ej. Calle Hidalgo #45, Poste CFE #892 frente a Farmacia"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Coordenadas GPS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                Coordenadas GPS de la Caja
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Capturando GPS...' : 'Usar mi ubicación'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Latitud</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Longitud</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isDuplicateName}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                isDuplicateName
                  ? 'bg-rose-700/80 cursor-not-allowed opacity-80'
                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/30 disabled:opacity-50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isDuplicateName
                  ? 'Nombre Duplicado - Cambiar Nombre'
                  : loading
                  ? 'Guardando...'
                  : isEditing
                  ? 'Guardar Cambios'
                  : 'Guardar y Desplegar Caja'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
