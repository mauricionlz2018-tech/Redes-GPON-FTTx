import React, { useState } from 'react';
import { NapBox } from '../types';
import { useNetwork } from '../context/NetworkContext';
import api from '../api/client';
import { Compass, MapPin, X, Check, RefreshCw, AlertTriangle } from 'lucide-react';

interface GpsCaptureModalProps {
  nap: NapBox;
  onClose: () => void;
  onGpsUpdated: () => void;
}

export const GpsCaptureModal: React.FC<GpsCaptureModalProps> = ({
  nap,
  onClose,
  onGpsUpdated
}) => {
  const { isOnline, enqueueGpsUpdate } = useNetwork();
  const [lat, setLat] = useState<number>(nap.coordenadas_gps?.lat || 19.6642);
  const [lng, setLng] = useState<number>(nap.coordenadas_gps?.lng || -100.1472);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const captureGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu navegador o dispositivo no soporta la API de Geolocalización.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(Number(position.coords.latitude.toFixed(6)));
        setLng(Number(position.coords.longitude.toFixed(6)));
        setAccuracy(Math.round(position.coords.accuracy));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Error de GPS:', err);
        setErrorMsg(`No se pudo obtener el GPS: ${err.message}. Asegúrate de conceder permisos de ubicación.`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (isOnline) {
        await api.patch(`/naps/${nap.id_nap}/gps`, { lat, lng });
        alert(`✔ Coordenadas de la caja ${nap.identificador} actualizadas con éxito.`);
      } else {
        await enqueueGpsUpdate(nap.id_nap, lat, lng);
        alert(`💾 Coordenadas guardadas localmente en modo OFFLINE. Se sincronizarán al recuperar señal.`);
      }
      onGpsUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar coordenadas');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Capturar GPS en Campo</h3>
            <p className="text-xs text-slate-400">
              Caja <span className="text-sky-400 font-semibold">{nap.identificador}</span>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Ubicación actual de la caja:</span>
              <span className="font-mono text-white">
                {nap.coordenadas_gps?.lat.toFixed(4)}, {nap.coordenadas_gps?.lng.toFixed(4)}
              </span>
            </div>
            {accuracy !== null && (
              <div className="flex justify-between items-center text-slate-400">
                <span>Precisión del sensor:</span>
                <span className="font-semibold text-emerald-400">&plusmn;{accuracy} metros</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={captureGps}
            disabled={isLocating}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detectando señal GPS...' : 'Obtener Coordenadas del Dispositivo'}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Latitud</label>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Longitud</label>
              <input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Coordenadas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

