import React, { useState, useEffect } from 'react';
import { X, MapPin, Compass, CheckCircle2, AlertCircle } from 'lucide-react';
import { GasaReserva } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CreateGasaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGasa: (newGasa: GasaReserva) => void;
  defaultCoordinates?: [number, number];
  existingGasasCount?: number;
  gasaToEdit?: GasaReserva | null;
}

export const CreateGasaModal: React.FC<CreateGasaModalProps> = ({
  isOpen,
  onClose,
  onSaveGasa,
  defaultCoordinates = [19.645, -99.82],
  existingGasasCount = 8,
  gasaToEdit = null
}) => {
  const { t } = useLanguage();
  const [nombre, setNombre] = useState('');
  const [metros, setMetros] = useState<number>(30);
  const [tipoCable, setTipoCable] = useState('Cable Troncal 48H');
  const [lat, setLat] = useState<string | number>(defaultCoordinates[0]);
  const [lng, setLng] = useState<string | number>(defaultCoordinates[1]);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (gasaToEdit) {
      setNombre(gasaToEdit.nombre || '');
      setMetros(Number(gasaToEdit.longitud_metros || gasaToEdit.metros_reserva || 30));
      setTipoCable(gasaToEdit.tipo_cable || 'Cable Troncal 48H');
      if (gasaToEdit.coordenadas_gps) {
        setLat(gasaToEdit.coordenadas_gps.lat);
        setLng(gasaToEdit.coordenadas_gps.lng);
      }
      setErrorMsg(null);
    } else {
      setNombre(`Gasa Reserva #${existingGasasCount + 1}`);
      setMetros(30);
      setTipoCable('Cable Troncal 48H');
      if (defaultCoordinates && defaultCoordinates.length >= 2) {
        setLat(defaultCoordinates[0]);
        setLng(defaultCoordinates[1]);
      }
      setErrorMsg(null);
    }
  }, [isOpen, gasaToEdit, defaultCoordinates, existingGasasCount]);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(t('forms.createGasa.errGeoNotSupported'));
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
        setErrorMsg(t('forms.createGasa.errGeoError'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;

    if (!nombre.trim()) {
      setErrorMsg(t('forms.createGasa.errName'));
      return;
    }
    if (isNaN(numLat) || isNaN(numLng)) {
      setErrorMsg(t('forms.createGasa.errCoords'));
      return;
    }

    const savedGasa: GasaReserva = {
      id_gasa: gasaToEdit ? gasaToEdit.id_gasa : `gasa-custom-${Date.now()}`,
      nombre: nombre.trim(),
      metros_reserva: Number(metros),
      longitud_metros: Number(metros),
      tipo_cable: tipoCable,
      coordenadas_gps: {
        lat: numLat,
        lng: numLng
      }
    };

    onSaveGasa(savedGasa);
    onClose();
  };

  const isEditing = Boolean(gasaToEdit);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto text-slate-900 dark:text-white transition-colors">
        {/* Cabecera */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ∞
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? t('forms.createGasa.titleEdit') : t('forms.createGasa.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? t('forms.createGasa.subtitleEdit') : t('forms.createGasa.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title={t('reports.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('forms.createGasa.name')}
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t('forms.createGasa.namePlaceholder')}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('forms.createGasa.length')}
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 30, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMetros(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      metros === val
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val}m
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={metros}
                onChange={(e) => setMetros(Number(e.target.value))}
                className="w-full mt-1.5 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('forms.createGasa.cableType')}
              </label>
              <select
                value={tipoCable}
                onChange={(e) => setTipoCable(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Cable Troncal 96H">{t('forms.createGasa.cableTroncal96')}</option>
                <option value="Cable Troncal 48H">{t('forms.createGasa.cableTroncal48')}</option>
                <option value="Cable Distribución 12H">{t('forms.createGasa.cableDistribucion12')}</option>
                <option value="Cable Troncal 24H">{t('forms.createGasa.cableTroncal24')}</option>
                <option value="Drop Óptico">{t('forms.createGasa.cableDrop')}</option>
              </select>
            </div>
          </div>

          {/* Coordenadas GPS */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {t('forms.createGasa.gpsTitle')}
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? t('forms.createGasa.gettingGps') : t('forms.createGasa.useCurrentGps')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t('forms.createGasa.latitude')}</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{t('forms.createGasa.longitude')}</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('forms.createGasa.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? t('forms.createGasa.saveChanges') : t('forms.createGasa.save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
