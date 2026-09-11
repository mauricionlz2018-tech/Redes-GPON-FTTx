import React, { useState } from 'react';
import { NapBox } from '../types';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface DeleteNapModalProps {
  nap: NapBox;
  onClose: () => void;
  onConfirmDelete: (nap: NapBox) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteNapModal: React.FC<DeleteNapModalProps> = ({
  nap,
  onClose,
  onConfirmDelete,
  isDeleting
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const occupiedCount = nap.metricas?.ocupados ?? 0;
  const totalCount = nap.total_puertos ?? 16;
  const isMatch = confirmText.trim().toUpperCase() === nap.identificador.toUpperCase();

  const handleDelete = async () => {
    if (occupiedCount > 0 && !isMatch) {
      setErrorMsg(`Por favor escribe "${nap.identificador}" para confirmar la baja segura.`);
      return;
    }
    setErrorMsg(null);
    try {
      await onConfirmDelete(nap);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al eliminar la caja NAP.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Eliminar Caja NAP de la Red
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baja técnica de infraestructura pasiva FTTx
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-5 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          {/* Tarjeta con detalles de la caja */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {nap.identificador}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {nap.zona}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {nap.direccion_texto}
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
              <div>
                <span className="block text-[10px] text-slate-400">Puertos Totales</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalCount}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Puertos Libres</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{nap.metricas?.libres ?? 0}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Abonados Activos</span>
                <span className={`font-bold ${occupiedCount > 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}>
                  {occupiedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia sobre impacto de la baja */}
          {occupiedCount > 0 ? (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <strong className="font-semibold block">Atencion: Abonados activos vinculados</strong>
                <p className="text-[11px] leading-relaxed">
                  Esta caja tiene <strong>{occupiedCount} cliente(s) conectado(s)</strong>. Al eliminar la caja, sus puertos se darán de baja y los abonados quedarán desvinculados para su reasignación en otra caja NAP disponible.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start gap-2 text-slate-600 dark:text-slate-400">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
              <p className="text-[11px]">
                La caja no tiene abonados activos. La eliminación retirará de forma segura el activo de la base de datos y de la cartografía Leaflet.
              </p>
            </div>
          )}

          {/* Confirmación escribiendo el identificador si tiene abonados */}
          {occupiedCount > 0 && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                Para confirmar, escribe <code className="font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-1 py-0.5 rounded">{nap.identificador}</code>:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={nap.identificador}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden transition-all uppercase"
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/60">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || (occupiedCount > 0 && !isMatch)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-red-950/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Definitivamente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
