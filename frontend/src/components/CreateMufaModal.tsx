import React, { useState, useEffect } from 'react';
import { EmpalmeClosure } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { GitCommit, X, MapPin, CheckCircle2 } from 'lucide-react';

interface CreateMufaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMufa: (newMufa: EmpalmeClosure) => void;
  defaultCoordinates?: [number, number];
  mufaToEdit?: EmpalmeClosure | null;
}

export const CreateMufaModal: React.FC<CreateMufaModalProps> = ({
  isOpen,
  onClose,
  onSaveMufa,
  defaultCoordinates = [19.6480, -99.8220],
  mufaToEdit = null
}) => {
  const { t } = useLanguage();
  const [nombre, setNombre] = useState('');
  const [tipoCierre, setTipoCierre] = useState('Cierre de Empalme Torpedo Domo (IP68)');
  const [capacidadHilos, setCapacidadHilos] = useState(48);
  const [tipoFusion, setTipoFusion] = useState<'paso' | 'derivacion' | 'sangria'>('derivacion');
  const [estado, setEstado] = useState<'operativa' | 'planificada' | 'en_mantenimiento'>('operativa');
  const [lat, setLat] = useState<number>(defaultCoordinates[0]);
  const [lng, setLng] = useState<number>(defaultCoordinates[1]);

  useEffect(() => {
    if (!isOpen) return;

    if (mufaToEdit) {
      setNombre(mufaToEdit.nombre || mufaToEdit.id_empalme || '');
      setTipoCierre(mufaToEdit.tipo_cierre || 'Cierre de Empalme Torpedo Domo (IP68)');
      setCapacidadHilos(mufaToEdit.capacidad_hilos || 48);
      setTipoFusion((mufaToEdit.tipo_fusion as any) || 'derivacion');
      setEstado((mufaToEdit.estado as any) || 'operativa');
      if (mufaToEdit.coordenadas_gps) {
        setLat(mufaToEdit.coordenadas_gps.lat);
        setLng(mufaToEdit.coordenadas_gps.lng);
      }
    } else {
      setNombre(`MUFA-IXT-${Math.floor(10 + Math.random() * 89)}`);
      setTipoCierre('Cierre de Empalme Torpedo Domo (IP68)');
      setCapacidadHilos(48);
      setTipoFusion('derivacion');
      setEstado('operativa');
      setLat(defaultCoordinates[0]);
      setLng(defaultCoordinates[1]);
    }
  }, [isOpen, mufaToEdit, defaultCoordinates]);

  if (!isOpen) return null;

  const isEditing = Boolean(mufaToEdit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const mufaData: EmpalmeClosure = {
      id_empalme: mufaToEdit ? mufaToEdit.id_empalme : `mufa-custom-${Date.now()}`,
      nombre: nombre.trim(),
      tipo_cierre: tipoCierre,
      capacidad_hilos: Number(capacidadHilos),
      tipo_fusion: tipoFusion,
      estado,
      coordenadas_gps: { lat, lng }
    };

    onSaveMufa(mufaData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto text-slate-900 dark:text-white transition-colors">
        {/* Cabecera */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? `${t('common.edit')} ${t('forms.createMufa.title')}` : t('forms.createMufa.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('forms.createMufa.subtitle')}
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
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('forms.createMufa.code')}
            </label>
            <input
              type="text"
              required
              placeholder="Ej. MUFA-IXT-08 (Crucero CFE)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('forms.createMufa.model')}
              </label>
              <select
                value={tipoCierre}
                onChange={(e) => setTipoCierre(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Cierre de Empalme Torpedo Domo (IP68)">{t('forms.createMufa.modelDome')} (IP68)</option>
                <option value="Cierre Horizontal En-Línea">{t('forms.createMufa.modelInline')}</option>
                <option value="Mufa de Sangría Mid-Span">Mufa Sangría Mid-Span</option>
                <option value="Caja Terminal de Empalme">Caja Terminal de Empalme</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('forms.createMufa.capacity')}
              </label>
              <select
                value={capacidadHilos}
                onChange={(e) => setCapacidadHilos(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="24">24 Hilos</option>
                <option value="48">48 Hilos</option>
                <option value="96">96 Hilos</option>
                <option value="144">144 Hilos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Fusión Dominante
              </label>
              <select
                value={tipoFusion}
                onChange={(e) => setTipoFusion(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="derivacion">Derivación a Splitter / NAP</option>
                <option value="paso">Paso Continuo (1:1)</option>
                <option value="sangria">Sangría Mid-Span</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estado Operativo
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="operativa">Operativa / En Servicio</option>
                <option value="planificada">Planificada</option>
                <option value="en_mantenimiento">En Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Coordenadas GPS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              {t('forms.createNap.gpsCoords')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{t('forms.createNap.latitude')}</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{t('forms.createNap.longitude')}</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? t('common.saveChanges') : t('forms.createMufa.save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
