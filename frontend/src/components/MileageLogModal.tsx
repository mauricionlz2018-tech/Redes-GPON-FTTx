import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchMileageLogs,
  removeMileageLog,
  exportMileageToCsv,
  MileageRecord
} from '../services/mileageService';
import {
  Gauge,
  Car,
  Download,
  Plus,
  Trash2,
  Search,
  Filter,
  X,
  RefreshCw,
  TrendingUp,
  MapPin,
  Clock,
  User,
  Truck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface MileageLogModalProps {
  onClose: () => void;
  onOpenCapture: () => void;
}

export const MileageLogModal: React.FC<MileageLogModalProps> = ({
  onClose,
  onOpenCapture
}) => {
  const [logs, setLogs] = useState<MileageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMotivo, setFilterMotivo] = useState<string>('todos');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMileageLogs();
      setLogs(data);
    } catch (e) {
      console.error('Error cargando bitácora de kilometraje:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este registro de kilometraje?')) {
      return;
    }
    setDeletingId(id);
    try {
      await removeMileageLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error('Error eliminando registro:', e);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrado de registros
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        log.tecnico_nombre.toLowerCase().includes(q) ||
        log.vehiculo_unidad.toLowerCase().includes(q) ||
        log.destino_nombre.toLowerCase().includes(q) ||
        (log.nap_identificador && log.nap_identificador.toLowerCase().includes(q)) ||
        (log.notas && log.notas.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (filterMotivo !== 'todos' && log.motivo_traslado !== filterMotivo) {
        return false;
      }

      return true;
    });
  }, [logs, searchTerm, filterMotivo]);

  // Cálculos estadísticos (KPIs)
  const stats = useMemo(() => {
    const totalKm = logs.reduce((acc, cur) => acc + (cur.km_recorridos || 0), 0);
    const totalViajes = logs.length;
    const promedioKm = totalViajes > 0 ? totalKm / totalViajes : 0;
    return {
      totalKm: Number(totalKm.toFixed(1)),
      totalViajes,
      promedioKm: Number(promedioKm.toFixed(1))
    };
  }, [logs]);

  // Lista de motivos únicos para el selector
  const motivosDisponibles = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.motivo_traslado) set.add(l.motivo_traslado);
    });
    return Array.from(set);
  }, [logs]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh] transition-colors">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 px-4 sm:px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Bitácora de Kilometraje de Técnicos
              </h3>
              <p className="text-xs text-sky-100 font-medium">
                Control de Distancias y Vehículos en Cuadrillas de Red GPON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            title="Cerrar bitácora"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tarjetas de Métricas Rápidas (KPIs) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Total Kilómetros
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.totalKm}
              </span>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">km</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Total de Traslados
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.totalViajes}
              </span>
              <span className="text-xs font-semibold text-slate-400">viajes</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Promedio por Traslado
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.promedioKm}
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">km/viaje</span>
            </div>
          </div>
        </div>

        {/* Barra de Herramientas: Búsqueda, Filtro y Botones de Acción */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por técnico, unidad, NAP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="w-40">
              <select
                value={filterMotivo}
                onChange={(e) => setFilterMotivo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="todos">Todos los Motivos</option>
                {motivosDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportMileageToCsv(filteredLogs)}
              disabled={filteredLogs.length === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Descargar reporte en formato CSV compatible con Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={onOpenCapture}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Km</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabla / Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span>Cargando bitácora de kilometraje...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Gauge className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No hay registros de kilometraje que coincidan con la búsqueda.
              </p>
              <button
                onClick={onOpenCapture}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold"
              >
                Registrar el primer kilometraje de hoy
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.fecha_hora);
                const fechaStr = dateObj.toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const horaStr = dateObj.toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={log.id}
                    className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    {/* Datos del traslado */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-sky-500" />
                          {log.tecnico_nombre}
                        </span>

                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-600">
                          <Truck className="w-3 h-3 text-slate-400" />
                          {log.vehiculo_unidad}
                        </span>

                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold border border-indigo-200 dark:border-indigo-800">
                          {log.motivo_traslado}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <strong>Destino:</strong> {log.destino_nombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {fechaStr} a las {horaStr}
                        </span>
                      </div>

                      {/* Detalles técnicos de odómetro */}
                      {log.tipo_calculo === 'odometro' && log.km_inicial !== undefined && log.km_final !== undefined && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          Odómetro: {log.km_inicial} km → {log.km_final} km
                        </div>
                      )}

                      {log.notas && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-md border border-slate-200 dark:border-slate-800">
                          &ldquo;{log.notas}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Kilometraje destacado y botón eliminar */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 gap-2 shrink-0">
                      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block tracking-wider">
                          Recorrido
                        </span>
                        <span className="text-base font-black text-sky-700 dark:text-sky-300 font-mono">
                          {log.km_recorridos} km
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Eliminar este registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>
            Mostrando {filteredLogs.length} de {logs.length} registros grabados
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

