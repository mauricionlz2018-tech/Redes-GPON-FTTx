import React from 'react';
import { Trash2, AlertTriangle, X, Ruler, GitCommit, MapPin } from 'lucide-react';

interface DeleteElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  elementName: string;
  elementType: 'troncal' | 'mufa' | 'poste';
  details?: string;
  isDeleting: boolean;
}

export const DeleteElementModal: React.FC<DeleteElementModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  elementName,
  elementType,
  details,
  isDeleting
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (elementType) {
      case 'troncal':
        return <Ruler className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'mufa':
        return <GitCommit className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'poste':
        return <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (elementType) {
      case 'troncal':
        return 'Línea Troncal / Ramal';
      case 'mufa':
        return 'Cierre de Empalme (Mufa)';
      case 'poste':
        return 'Poste de Infraestructura';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/60 dark:bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {title || `Eliminar ${getTypeLabel()}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baja de elemento en red FTTx
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              ¿Estás seguro de que deseas eliminar este elemento? Esta acción se sincronizará automáticamente en la base de datos central y en todos los dispositivos de tus compañeros.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
              {getIcon()}
              <span>{elementName}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
              Tipo: <strong className="text-slate-700 dark:text-slate-300">{getTypeLabel()}</strong>
            </div>
            {details && (
              <div className="text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                {details}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar de la Red'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

