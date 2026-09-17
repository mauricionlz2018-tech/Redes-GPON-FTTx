import React, { useState } from 'react';
import { X, GitCommit, MapPin, CheckCircle2 } from 'lucide-react';
import { EmpalmeClosure } from '../types';

interface CreateMufaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMufa: (mufa: EmpalmeClosure) => void;
  defaultCoordinates?: [number, number];
}

export const CreateMufaModal: React.FC<CreateMufaModalProps> = ({
  isOpen,
  onClose,
  onSaveMufa,
  defaultCoordinates = [19.702, -100.108]
}) => {
  const [nombre, setNombre] = useState('');
  const [tipoCierre, setTipoCierre] = useState('Cierre de Empalme Torpedo Domo (IP68)');
  const [capacidadHilos, setCapacidadHilos] = useState<number>(48);
  const [lat, setLat] = useState<number>(defaultCoordinates[0]);
  const [lng, setLng] = useState<number>(defaultCoordinates[1]);
  const [estado, setEstado] = useState<'operativa' | 'planificada' | 'en_mantenimiento'>('operativa');
  const [tipoFusion, setTipoFusion] = useState<'paso' | 'derivacion' | 'sangria'>('derivacion');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor introduce un nombre o identificador para la mufa');
      return;
    }

    const newMufa: EmpalmeClosure = {
      id_empalme: `empalme-custom-${Date.now()}`,
      nombre: nombre.trim(),
      tipo_cierre: tipoCierre,
      capacidad_hilos: capacidadHilos,
      estado,
      coordenadas_gps: {
        lat: Number(lat),
        lng: Number(lng)
      }
    };

    onSaveMufa(newMufa);
    onClose();
  };

  if (!isOpen) return null;

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
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Agregar Cierre de Empalme / Mufa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Punto de fusión óptica en planta externa conforme al estándar
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
              Nombre / Identificador de la Mufa *
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
                Tipo de Mufa
              </label>
              <select
                value={tipoCierre}
                onChange={(e) => setTipoCierre(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Cierre de Empalme Torpedo Domo (IP68)">Torpedo Domo (IP68)</option>
                <option value="Cierre Horizontal En-Línea">Horizontal En-Línea</option>
                <option value="Mufa de Sangría Mid-Span">Mufa de Sangría Mid-Span</option>
                <option value="Caja Terminal de Empalme">Caja Terminal de Empalme</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Capacidad de Hilos
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
              Ubicación Geodésica de la Mufa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Latitud</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Longitud</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
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
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Instalar Mufa en el Mapa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

