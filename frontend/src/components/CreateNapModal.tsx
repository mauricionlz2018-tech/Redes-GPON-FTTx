import React, { useState } from 'react';
import { NapBox } from '../types';
import api from '../api/client';
import { PlusCircle, MapPin, X, Compass, CheckCircle, AlertCircle } from 'lucide-react';

interface CreateNapModalProps {
  onClose: () => void;
  onCreatedSuccess: (newNap: NapBox) => void;
  defaultCoordinates?: { lat: number; lng: number };
}

export const CreateNapModal: React.FC<CreateNapModalProps> = ({
  onClose,
  onCreatedSuccess,
  defaultCoordinates
}) => {
  const [identificador, setIdentificador] = useState('NAP-SJR-05');
  const [zona, setZona] = useState('');
  const [direccionTexto, setDireccionTexto] = useState('');
  const [lat, setLat] = useState<number>(defaultCoordinates?.lat || 19.6670);
  const [lng, setLng] = useState<number>(defaultCoordinates?.lng || -100.1490);
  const [totalPuertos, setTotalPuertos] = useState<number>(16);

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Obtener geolocalización actual del navegador / smartphone
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
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
        alert('No se pudo obtener la ubicación GPS precisa. Puedes escribir las coordenadas manualmente.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identificador.trim() || !zona.trim() || !direccionTexto.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    const payload = {
      identificador: identificador.trim().toUpperCase(),
      zona: zona.trim(),
      direccion_texto: direccionTexto.trim(),
      total_puertos: Number(totalPuertos),
      coordenadas_gps: {
        lat: Number(lat),
        lng: Number(lng)
      }
    };

    setLoading(true);
    try {
      const res = await api.post('/naps', payload);
      if (res.data.success) {
        onCreatedSuccess(res.data.data);
        onClose();
      }
    } catch (err: any) {
      console.warn('Error conectando a la API, creando en modo local/demo...', err);
      // Fallback Demo en caso de que el backend no responda
      const mockCreated: NapBox = {
        id_nap: `nap-${Date.now()}`,
        identificador: payload.identificador,
        zona: payload.zona,
        id_puerto_pon: 'pon-1',
        total_puertos: payload.total_puertos,
        direccion_texto: payload.direccion_texto,
        coordenadas_gps: payload.coordenadas_gps,
        metricas: {
          total: payload.total_puertos,
          libres: payload.total_puertos,
          ocupados: 0,
          danados: 0,
          porcentajeSaturacion: 0,
          estadoSaturacion: 'disponible'
        },
        puertos: Array.from({ length: payload.total_puertos }).map((_, i) => ({
          id_puerto: `port-demo-${Date.now()}-${i + 1}`,
          id_nap: `nap-${Date.now()}`,
          indice_puerto: i + 1,
          estado: 'Libre'
        }))
      };

      onCreatedSuccess(mockCreated);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-slate-800 to-sky-950 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Nueva Caja NAP</h2>
              <p className="text-xs text-slate-400">Instalación y despliegue de divisor óptico 1:16</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Identificador de Caja *
              </label>
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ej. NAP-SJR-05"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capacidad de Puertos
              </label>
              <select
                value={totalPuertos}
                onChange={(e) => setTotalPuertos(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value={8}>8 Puertos (Splitter 1:8)</option>
                <option value={16}>16 Puertos (Estándar FTTx 1:16)</option>
                <option value={24}>24 Puertos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Zona / Sector de Cobertura *
            </label>
            <input
              type="text"
              required
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Ej. Barrio San Miguel / Colonia Centro"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dirección Física / Referencia de Poste *
            </label>
            <input
              type="text"
              required
              value={direccionTexto}
              onChange={(e) => setDireccionTexto(e.target.value)}
              placeholder="Ej. Av. Hidalgo esq. Allende, Poste CFE #89"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Coordenadas GPS */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Coordenadas Geográficas (GPS)
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-[11px] text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/80 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Compass className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Capturando...' : 'GPS de mi dispositivo'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Latitud</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Longitud</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg shadow-sky-900/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Creando caja y puertos...' : 'Guardar y Desplegar Caja'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

