import React, { useState, useEffect } from 'react';
import { NapBox, NapPort, NapPortStatus } from '../types';
import api from '../api/client';
import { putCachedNapImmediate, broadcastRealtimeEvent } from '../services/realtimeSync';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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
      setErrorMsg(t('forms.createNap.geoNotSupported'));
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
        setErrorMsg(t('forms.createNap.geoError'));
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
      setErrorMsg(
        t('forms.createNap.duplicateAlert', {
          id: trimmedId,
          zone: duplicateMatch?.zona || ''
        })
      );
      return;
    }

    if (!identificador.trim() || !zona.trim() || !direccionTexto.trim()) {
      setErrorMsg(t('forms.createNap.fillRequired'));
      return;
    }

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (isNaN(numLat) || isNaN(numLng) || lat === '' || lng === '') {
      setErrorMsg(t('forms.createNap.validCoords'));
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

    try {
      if (napToEdit) {
        // EDICIÓN DE CAJA EXISTENTE
        const updatedNap: NapBox = {
          ...napToEdit,
          identificador: payload.identificador,
          zona: payload.zona,
          direccion_texto: payload.direccion_texto,
          total_puertos: payload.total_puertos,
          coordenadas_gps: payload.coordenadas_gps
        };

        // Guardar inmediatamente en localStorage
        try {
          const currentCustom = JSON.parse(localStorage.getItem('gpon_custom_naps') || '[]');
          const updatedCustom = currentCustom.map((n: NapBox) =>
            n.id_nap === updatedNap.id_nap ? updatedNap : n
          );
          localStorage.setItem('gpon_custom_naps', JSON.stringify(updatedCustom));
        } catch {}

        // Sincronizar caché de alta disponibilidad
        putCachedNapImmediate(updatedNap);
        broadcastRealtimeEvent({ type: 'NAP_UPDATED', nap: updatedNap });

        // Intentar actualizar en backend
        try {
          await api.put(`/naps/${napToEdit.id_nap}`, payload);
        } catch (apiErr) {
          console.warn('Backend offline o error al editar NAP, actualización guardada localmente:', apiErr);
        }

        onCreatedSuccess(updatedNap);
      } else {
        // CREACIÓN DE NUEVA CAJA
        const portsCount = Number(totalPuertos);
        const newPorts: NapPort[] = Array.from({ length: portsCount }, (_, i) => ({
          id_puerto: `port-${Date.now()}-${i + 1}`,
          id_nap: `nap-${Date.now()}`,
          indice_puerto: i + 1,
          estado: 'Libre' as NapPortStatus,
          cliente: null
        }));

        const newNap: NapBox = {
          id_nap: `nap-${Date.now()}`,
          identificador: payload.identificador,
          zona: payload.zona,
          direccion_texto: payload.direccion_texto,
          id_puerto_pon: 'pon-1',
          total_puertos: portsCount,
          coordenadas_gps: payload.coordenadas_gps,
          metricas: {
            total: portsCount,
            libres: portsCount,
            ocupados: 0,
            danados: 0,
            reservados: 0,
            porcentajeSaturacion: 0,
            estadoSaturacion: 'disponible'
          },
          puertos: newPorts
        };

        // 1. Persistencia inmediata local
        try {
          const currentCustom = JSON.parse(localStorage.getItem('gpon_custom_naps') || '[]');
          currentCustom.push(newNap);
          localStorage.setItem('gpon_custom_naps', JSON.stringify(currentCustom));
        } catch {}

        putCachedNapImmediate(newNap);
        broadcastRealtimeEvent({ type: 'NAP_CREATED', nap: newNap });

        // 2. Intentar guardar en backend
        try {
          const res = await api.post('/naps', payload);
          if (res.data.success && res.data.data) {
            const serverNap: NapBox = {
              ...newNap,
              id_nap: res.data.data.id_nap || newNap.id_nap,
              puertos: res.data.data.puertos || newNap.puertos
            };
            putCachedNapImmediate(serverNap);
            onCreatedSuccess(serverNap);
            onClose();
            return;
          }
        } catch (apiErr) {
          console.warn('Backend no disponible al crear NAP, registrada localmente:', apiErr);
        }

        onCreatedSuccess(newNap);
      }
      onClose();
    } catch (err: any) {
      console.error('Error general al procesar la caja NAP:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(napToEdit);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {isEditing ? t('forms.createNap.editTitle') : t('forms.createNap.title')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEditing ? t('forms.createNap.editSubtitle') : t('forms.createNap.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('forms.createNap.boxId')}
              </label>
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="NAP-SJR-68"
                className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none transition-colors ${
                  isDuplicateName
                    ? 'border-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                    : 'border-slate-300 dark:border-slate-700 focus:border-sky-500'
                }`}
              />
              {isDuplicateName && (
                <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{t('forms.createNap.duplicateName')}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('forms.createNap.portCapacity')}
              </label>
              <select
                value={totalPuertos}
                onChange={(e) => setTotalPuertos(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value={8}>{t('forms.createNap.ports8')}</option>
                <option value={16}>{t('forms.createNap.ports16')}</option>
                <option value={24}>{t('forms.createNap.ports24')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('forms.createNap.zone')}
            </label>
            <input
              type="text"
              required
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder={t('forms.createNap.zonePlaceholder')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('forms.createNap.address')}
            </label>
            <input
              type="text"
              required
              value={direccionTexto}
              onChange={(e) => setDireccionTexto(e.target.value)}
              placeholder={t('forms.createNap.addressPlaceholder')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Coordenadas GPS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                {t('forms.createNap.gpsCoords')}
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? t('forms.createNap.capturingGps') : t('forms.createNap.useMyLocation')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{t('forms.createNap.latitude')}</label>
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
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{t('forms.createNap.longitude')}</label>
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
              {t('forms.createNap.cancel')}
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
                  ? t('forms.createNap.duplicateName')
                  : loading
                  ? t('forms.createNap.saving')
                  : isEditing
                  ? t('forms.createNap.saveChanges')
                  : t('forms.createNap.save')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
