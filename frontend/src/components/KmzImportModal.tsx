import React, { useState } from 'react';
import {
  X,
  Upload,
  Check,
  AlertTriangle,
  Trash2,
  GitBranch,
  MapPin,
  GitCommit,
  Radio,
  FileCheck,
  Edit2
} from 'lucide-react';
import { ParsedKmzItem, ParsedKmzResult } from '../utils/kmzParser';

interface KmzImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importData: ParsedKmzResult | null;
  onConfirmImport: (itemsToImport: ParsedKmzItem[]) => void;
}

export const KmzImportModal: React.FC<KmzImportModalProps> = ({
  isOpen,
  onClose,
  importData,
  onConfirmImport
}) => {
  if (!isOpen || !importData) return null;

  const [items, setItems] = useState<ParsedKmzItem[]>(importData.items);
  const [filter, setFilter] = useState<'todos' | 'rutas' | 'puntos' | 'duplicados'>('todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const selectAll = (selected: boolean) => {
    setItems((prev) => prev.map((it) => ({ ...it, selected })));
  };

  const deselectDuplicates = () => {
    setItems((prev) =>
      prev.map((it) => (it.isDuplicate ? { ...it, selected: false } : it))
    );
  };

  const startEdit = (item: ParsedKmzItem) => {
    setEditingId(item.id);
    setEditingName(item.nombre);
  };

  const saveEdit = (id: string) => {
    if (editingName.trim()) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, nombre: editingName.trim() } : it))
      );
    }
    setEditingId(null);
  };

  const selectedCount = items.filter((it) => it.selected).length;
  const duplicateCount = items.filter((it) => it.isDuplicate).length;
  const routeCount = items.filter((it) => it.categoria === 'ruta').length;
  const pointCount = items.filter((it) => it.categoria === 'punto').length;

  const filteredItems = items.filter((it) => {
    if (filter === 'rutas') return it.categoria === 'ruta';
    if (filter === 'puntos') return it.categoria === 'punto';
    if (filter === 'duplicados') return it.isDuplicate;
    return true;
  });

  const handleConfirm = () => {
    const toImport = items.filter((it) => it.selected);
    onConfirmImport(toImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors animate-scaleUp">
        {/* Cabecera del Modal */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Vista Previa e Importación de KMZ / KML
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Archivo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{importData.filename}</span> &bull; {items.length} elementos extraídos
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

        {/* Barra de Resumen y Métricas */}
        <div className="bg-slate-50 dark:bg-slate-800/40 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              {selectedCount} seleccionados para importar
            </span>
            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-semibold rounded-lg border border-purple-300 dark:border-purple-700 flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              {routeCount} Rutas
            </span>
            <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold rounded-lg border border-sky-300 dark:border-sky-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {pointCount} Puntos
            </span>
            {duplicateCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold rounded-lg border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {duplicateCount} posibles duplicados
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => selectAll(true)}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 px-2 py-1 rounded hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Seleccionar todos
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={deselectDuplicates}
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Omitir duplicados
            </button>
          </div>
        </div>

        {/* Pestañas de Filtro */}
        <div className="px-4 sm:px-6 pt-2 pb-1 border-b border-slate-200 dark:border-slate-800 flex gap-2 text-xs shrink-0">
          <button
            onClick={() => setFilter('todos')}
            className={`pb-2 px-2 font-bold border-b-2 transition-colors cursor-pointer ${
              filter === 'todos'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setFilter('rutas')}
            className={`pb-2 px-2 font-bold border-b-2 transition-colors cursor-pointer ${
              filter === 'rutas'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Líneas / Rutas ({routeCount})
          </button>
          <button
            onClick={() => setFilter('puntos')}
            className={`pb-2 px-2 font-bold border-b-2 transition-colors cursor-pointer ${
              filter === 'puntos'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Elementos de Planta ({pointCount})
          </button>
          {duplicateCount > 0 && (
            <button
              onClick={() => setFilter('duplicados')}
              className={`pb-2 px-2 font-bold border-b-2 transition-colors cursor-pointer ${
                filter === 'duplicados'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-amber-500 hover:text-amber-600'
              }`}
            >
              Duplicados ({duplicateCount})
            </button>
          )}
        </div>

        {/* Lista Scrollable de Elementos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No hay elementos que coincidan con el filtro seleccionado.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  item.selected
                    ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                } ${item.isDuplicate ? 'border-l-4 border-l-amber-500' : ''}`}
              >
                {/* Checkbox y Tipo */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                  />

                  {/* Icono de tipo */}
                  <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 shrink-0">
                    {item.categoria === 'ruta' ? (
                      <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    ) : item.tipo === 'mufa' ? (
                      <GitCommit className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    ) : (
                      <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>

                  {/* Nombre y detalles editables */}
                  <div className="min-w-0 flex-1">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(item.id)}
                          className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 border border-emerald-500 text-slate-900 dark:text-white w-full max-w-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.nombre}
                        </span>
                        <button
                          onClick={() => startEdit(item)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                          title="Editar nombre"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                        {item.tipo.replace('_', ' ')}
                      </span>
                      <span>&bull;</span>
                      <span>{item.detalles}</span>
                      {item.isDuplicate && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {item.duplicateReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón Eliminar / Omitir de la lista */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
                  title="Eliminar de la lista de importación para evitar duplicados"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pie con Acciones */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Puedes desmarcar o eliminar elementos antes de guardar para no duplicar infraestructura.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Importar {selectedCount} elementos a la Red</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

