import React, { useState, useEffect } from 'react';
import { NapBox } from '../types';
import { mockNaps } from '../data/mockGponData';
import api from '../api/client';
import {
  FileText,
  Download,
  Server,
  Network,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Loader2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [naps, setNaps] = useState<NapBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadNaps = async () => {
      try {
        const res = await api.get('/naps');
        if (res.data.success && res.data.data.length > 0) {
          setNaps(res.data.data);
        } else {
          setNaps(mockNaps);
        }
      } catch (e) {
        console.warn('Backend no disponible, cargando datos mock en Reportes...');
        setNaps(mockNaps);
      } finally {
        setLoading(false);
      }
    };
    loadNaps();
  }, []);

  // Descargar PDF generado con PDFKit en el backend
  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get('/reportes/saturacion-pdf', {
        responseType: 'blob'
      });

      // Crear enlace de descarga en el navegador
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `reporte_gpon_saturacion_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error descargando reporte PDF:', error);
      alert('Error al generar o descargar el reporte PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Métricas acumuladas
  const totalNaps = naps.length;
  const totalPuertos = naps.reduce((acc, n) => acc + (n.total_puertos || 16), 0);
  const totalOcupados = naps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
  const totalLibres = totalPuertos - totalOcupados;
  const saturacionGlobal = totalPuertos > 0 ? Math.round((totalOcupados / totalPuertos) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado y Acción de Descarga */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Reportes e Indicadores de Saturación GPON
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de capacidad de red FTTx y exportación de reportes ejecutivos en PDF.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-lg shadow-sky-900/30 transition-all disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isDownloading ? 'Generando PDF...' : 'Descargar Reporte PDF Ejecutivo'}</span>
        </button>
      </div>

      {/* Tarjetas KPI de la Red */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cajas NAP Activas</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalNaps}</p>
          <span className="text-[11px] text-slate-400">Distribuidas en San José del Rincón</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Puertos</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalPuertos}</p>
          <span className="text-[11px] text-slate-400">Capacidad splitter 1:16</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Abonados Conectados</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{totalOcupados}</p>
          <span className="text-[11px] text-slate-400">Puertos libres: {totalLibres}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Saturación Global</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              saturacionGlobal >= 80 ? 'text-amber-400' : 'text-sky-400'
            }`}
          >
            {saturacionGlobal}%
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                saturacionGlobal >= 80 ? 'bg-amber-400' : 'bg-sky-400'
              }`}
              style={{ width: `${saturacionGlobal}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabla Detallada de Saturación por Caja NAP */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="font-semibold text-xs text-white uppercase tracking-wider">
            Matriz de Estado y Saturación por Caja de Distribución (NAP)
          </span>
          <span className="text-[11px] text-slate-400">Criterio: Alerta &ge; 80%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Identificador</th>
                <th className="px-4 py-3">Zona / Cobertura</th>
                <th className="px-4 py-3 text-center">Puertos Totales</th>
                <th className="px-4 py-3 text-center">Libres</th>
                <th className="px-4 py-3 text-center">Ocupados</th>
                <th className="px-4 py-3">Saturación</th>
                <th className="px-4 py-3">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {naps.map((nap) => {
                const m = nap.metricas;
                const pct = m?.porcentajeSaturacion ?? 0;
                const isCritico = pct >= 80;

                return (
                  <tr key={nap.id_nap} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-sky-400">{nap.identificador}</td>
                    <td className="px-4 py-3 text-slate-300">{nap.zona}</td>
                    <td className="px-4 py-3 text-center font-mono">{nap.total_puertos}</td>
                    <td className="px-4 py-3 text-center font-mono text-emerald-400 font-semibold">
                      {m?.libres ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sky-300 font-semibold">
                      {m?.ocupados ?? 0}
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {pct >= 100 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" /> SATURADA
                        </span>
                      ) : pct >= 80 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> EN ALERTA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> DISPONIBLE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

