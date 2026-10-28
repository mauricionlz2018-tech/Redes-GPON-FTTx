import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Network,
  Users,
  Server,
  Loader2
} from 'lucide-react';
import { NapBox } from '../types';
import api from '../api/client';
import { generateClientPdfReport } from '../utils/generatePdfReport';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  naps: NapBox[];
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  naps
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const totalNaps = naps.length;
  const totalPuertos = naps.reduce((acc, n) => acc + (n.total_puertos || 16), 0);
  const totalOcupados = naps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
  const totalLibres = totalPuertos - totalOcupados;
  const saturacionGlobal = totalPuertos > 0 ? Math.round((totalOcupados / totalPuertos) * 100) : 0;

  const disponiblesCount = naps.filter((n) => (n.metricas?.porcentajeSaturacion || 0) < 80).length;
  const alertaCount = naps.filter((n) => {
    const p = n.metricas?.porcentajeSaturacion || 0;
    return p >= 80 && p < 100;
  }).length;
  const saturadasCount = naps.filter((n) => (n.metricas?.porcentajeSaturacion || 0) >= 100).length;

  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);

      // 1. Intentar descargar el PDF generado por backend si responde con prontitud
      try {
        const response = await api.get('/reportes/saturacion-pdf', {
          params: { theme: 'light' },
          responseType: 'blob',
          timeout: 2500
        });

        if (response.data && response.data.size > 100) {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `reporte_gpon_saturacion_${new Date().toISOString().slice(0, 10)}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(downloadUrl);
          return;
        }
      } catch (backendError) {
        console.warn('Backend PDF no disponible en tiempo; generando PDF cliente de alta fidelidad...', backendError);
      }

      // 2. Generación y descarga directa 100% garantizada en cliente
      generateClientPdfReport({ naps });
    } catch (error) {
      console.error('Error generando PDF:', error);
      // Fallback final: diálogo nativo de guardado
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] my-auto overflow-hidden transition-colors animate-scaleUp print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none print:m-0 print:p-0">
        {/* Cabecera del Modal (Oculta al imprimir) */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 sm:px-6 py-3 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600 text-white rounded-xl shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Vista Previa del Reporte Oficial de Red GPON
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Mapeo de Capacidad, Puertos Ópticos y Diagnóstico de Planta Externa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
              title="Imprimir documento o guardar como PDF nativo"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              title="Descargar archivo PDF directamente a tu dispositivo"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isDownloading ? 'Generando PDF...' : 'Descargar PDF'}
              </span>
              <span className="sm:hidden">
                {isDownloading ? 'Generando...' : 'Descargar'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hoja de Documento PDF (Vista Previa Formateada estilo Reporte Formal) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950/50 print:bg-white print:p-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-900 dark:text-slate-100">
            {/* Membrete Oficial */}
            <div className="flex items-center justify-between border-b-2 border-sky-600 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-white rounded border border-slate-200 p-1 flex items-center justify-center">
                  <img src="/logo-gpon.png" alt="Logo GPON" className="max-h-full max-w-full object-contain" onError={(e) => {
                    // Fallback visual si el logo no carga
                    (e.target as HTMLElement).style.display = 'none';
                  }} />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    GPON TELECOM S.A. DE C.V.
                  </h1>
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Inventario y Mapeo Lógico de Fibra Óptica FTTx
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Municipio de San José del Rincón, Estado de México
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  FOLIO: RPT-2026-27
                </p>
                <p className="text-[11px] text-slate-500 capitalize">{currentDate}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                  DOCUMENTO OFICIAL
                </span>
              </div>
            </div>

            {/* Título del Reporte */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Reporte Ejecutivo de Saturación de Red y Ocupación de Puertos Ópticos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluación integral de splitters 1:16, balance de potencia y disponibilidad de acometidas en campo.
              </p>
            </div>

            {/* Tarjetas KPI de Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Cajas NAP
                </span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                  {totalNaps}
                </span>
                <span className="text-[10px] text-slate-400">Distribuidas</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Capacidad Total
                </span>
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
                  {totalPuertos}
                </span>
                <span className="text-[10px] text-slate-400">Puertos Ópticos</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Abonados Activos
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {totalOcupados}
                </span>
                <span className="text-[10px] text-slate-400">Libres: {totalLibres}</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Saturación Global
                </span>
                <span
                  className={`text-2xl font-black mt-1 block ${
                    saturacionGlobal >= 80 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {saturacionGlobal}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {saturacionGlobal >= 80 ? 'Alerta Capacidad' : 'Operativa Normal'}
                </span>
              </div>
            </div>

            {/* Barra de Distribución y Salud de Red */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Estado de la Red:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {disponiblesCount} Cajas Disponibles • {alertaCount} en Alerta (&ge;80%) • {saturadasCount} Saturadas (100%)
                </span>
              </div>
              <div className="w-32 bg-slate-300 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${saturacionGlobal >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${saturacionGlobal}%` }}
                />
              </div>
            </div>

            {/* Tabla Detallada de Cajas NAP */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Desglose por Caja NAP y Zona de Cobertura
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Identificador</th>
                      <th className="py-2 px-3">Zona / Cobertura</th>
                      <th className="py-2 px-3 text-center">Totales</th>
                      <th className="py-2 px-3 text-center">Libres</th>
                      <th className="py-2 px-3 text-center">Ocupados</th>
                      <th className="py-2 px-3 text-center">Saturación</th>
                      <th className="py-2 px-3 text-right">Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {naps.map((nap) => {
                      const m = nap.metricas;
                      const ocupados = m?.ocupados ?? 0;
                      const libres = m?.libres ?? (nap.total_puertos - ocupados);
                      const pct = m?.porcentajeSaturacion ?? Math.round((ocupados / nap.total_puertos) * 100);
                      const isAlert = pct >= 80 && pct < 100;
                      const isSaturated = pct >= 100;

                      return (
                        <tr key={nap.id_nap} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400">
                            {nap.identificador}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {nap.zona || 'San José del Rincón'}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{nap.total_puertos}</td>
                          <td className="py-2 px-3 text-center font-mono text-emerald-600 font-bold">
                            {libres}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {ocupados}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isSaturated
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                                  : isAlert
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {isSaturated ? (
                              <span className="text-red-600 font-bold">SATURADA</span>
                            ) : isAlert ? (
                              <span className="text-amber-600 font-bold">ALERTA</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">DISPONIBLE</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Firmas y Sellos de Auditoría */}
            <div className="pt-6 border-t border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-8 text-center text-xs mt-8">
              <div>
                <div className="border-b border-slate-400 dark:border-slate-600 w-44 mx-auto mb-1 h-12" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Ing. Carlos Mendoza</p>
                <p className="text-[10px] text-slate-500">Dirección de Operaciones FTTx</p>
              </div>
              <div>
                <div className="border-b border-slate-400 dark:border-slate-600 w-44 mx-auto mb-1 h-12" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Supervisión NOC</p>
                <p className="text-[10px] text-slate-500">Auditoría Técnica GPON TELECOM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
