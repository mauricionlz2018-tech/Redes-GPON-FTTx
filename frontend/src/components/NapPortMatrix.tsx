import React, { useState } from 'react';
import { NapBox, NapPort, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Server,
  User,
  Radio,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Trash2,
  Wrench,
  ShieldAlert,
  Info
} from 'lucide-react';

interface NapPortMatrixProps {
  nap: NapBox;
  onPortSelectToAssign: (port: NapPort) => void;
  onRefreshNap: () => void;
}

export const NapPortMatrix: React.FC<NapPortMatrixProps> = ({
  nap,
  onPortSelectToAssign,
  onRefreshNap
}) => {
  const { user } = useAuth();
  const [selectedPort, setSelectedPort] = useState<NapPort | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rbacError, setRbacError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const ports = nap.puertos || [];

  // Liberar puerto
  const handleReleasePort = async (port: NapPort) => {
    // Validación de RBAC del lado del cliente
    if (user?.rol === 'Tecnico') {
      setRbacError(
        "⛔ Permiso denegado (HTTP 403 Forbidden): El rol 'Tecnico' tiene acceso de solo lectura y registro inicial. La corrección o liberación de puertos ocupados es exclusiva de Soporte y Administrador."
      );
      return;
    }

    if (!window.confirm(`¿Estás seguro de liberar el puerto #${port.indice_puerto}? El abonado será desvinculado.`)) {
      return;
    }

    try {
      setIsProcessing(true);
      setRbacError(null);
      await api.delete(`/puertos/${port.id_puerto}/liberar`);
      setActionSuccess(`Puerto #${port.indice_puerto} liberado exitosamente.`);
      setSelectedPort(null);
      onRefreshNap();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setRbacError(error.response.data.message || '403 Forbidden: Sin autorización');
      } else {
        // Fallback interactivo si el backend no está disponible (ej. Vercel)
        port.estado = 'Libre';
        port.cliente = null;
        if (nap.metricas) {
          nap.metricas.ocupados = Math.max(0, nap.metricas.ocupados - 1);
          nap.metricas.libres = Math.min(nap.total_puertos, nap.metricas.libres + 1);
          nap.metricas.porcentajeSaturacion = Math.round((nap.metricas.ocupados / nap.total_puertos) * 100);
        }
        setActionSuccess(`Puerto #${port.indice_puerto} liberado exitosamente (Modo Demo).`);
        setSelectedPort(null);
        onRefreshNap();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Cambiar estado a Dañado / Libre / Mantenimiento (Admin / Soporte)
  const handleChangeStatus = async (port: NapPort, nuevoEstado: string) => {
    if (user?.rol === 'Tecnico') {
      setRbacError(
        "⛔ Permiso denegado (HTTP 403 Forbidden): El rol 'Tecnico' no puede cambiar estados de puertos manualmente."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setRbacError(null);
      await api.patch(`/puertos/${port.id_puerto}/estado`, { estado: nuevoEstado });
      setActionSuccess(`Estado del puerto #${port.indice_puerto} cambiado a ${nuevoEstado}.`);
      onRefreshNap();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setRbacError(error.response.data.message);
      } else {
        alert('Error al actualizar estado: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Libre':
        return {
          bg: 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-400',
          led: 'bg-emerald-500 shadow-emerald-500/50 shadow-md',
          label: 'Libre'
        };
      case 'Ocupado':
        return {
          bg: 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-300',
          led: 'bg-sky-500 shadow-sky-500/50 shadow-md',
          label: 'Ocupado'
        };
      case 'Dañado':
        return {
          bg: 'bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400',
          led: 'bg-red-500 shadow-red-500/50 shadow-md',
          label: 'Dañado'
        };
      case 'Reservado':
        return {
          bg: 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-400',
          led: 'bg-amber-500 shadow-amber-500/50 shadow-md',
          label: 'Reservado'
        };
      default:
        return {
          bg: 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600 text-slate-400',
          led: 'bg-slate-500',
          label: estado
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      {/* Cabecera del Chasis de la NAP */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-white">{nap.identificador}</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {nap.zona}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{nap.direccion_texto}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-xs text-slate-400">Saturación:</span>
            <span
              className={`ml-1 text-xs font-bold px-2 py-0.5 rounded ${
                (nap.metricas?.porcentajeSaturacion ?? 0) >= 80
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {nap.metricas?.porcentajeSaturacion ?? 0}% ({nap.metricas?.ocupados ?? 0}/
              {nap.total_puertos})
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de RBAC (403) si un técnico intenta acción prohibida */}
      {rbacError && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold text-red-300">Restricción de Perfil RBAC</strong>
            <span>{rbacError}</span>
          </div>
          <button
            onClick={() => setRbacError(null)}
            className="text-red-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Aviso de acción exitosa */}
      {actionSuccess && (
        <div className="mb-4 p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Matriz Visual Física de los 16 Puertos (Estilo Panel de Fibra SC-APC) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            Panel Físico de Puertos Ópticos (1 a 16)
          </span>
          <span className="text-[11px] text-sky-400 flex items-center gap-1">
            <Info className="w-3 h-3" /> Haz clic en un puerto para interactuar
          </span>
        </div>

        {/* Rejilla de 16 puertos (8 columnas en desktop, 4 en tablet/móvil) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {ports.map((port) => {
            const statusStyle = getStatusColor(port.estado);
            const isSelected = selectedPort?.id_puerto === port.id_puerto;

            return (
              <button
                key={port.id_puerto}
                onClick={() => {
                  setSelectedPort(port);
                  setRbacError(null);
                  setActionSuccess(null);
                }}
                className={`flex flex-col items-center justify-between p-2 rounded-lg border transition-all relative ${
                  statusStyle.bg
                } ${isSelected ? 'ring-2 ring-sky-400 scale-105 shadow-lg shadow-sky-900/30' : ''}`}
              >
                {/* Luz LED indicadora */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold text-slate-400">P#{port.indice_puerto}</span>
                  <span className={`w-2 h-2 rounded-full ${statusStyle.led}`} />
                </div>

                {/* Icono conector de fibra */}
                <div className="w-7 h-7 bg-slate-900 rounded border border-slate-700 flex items-center justify-center my-1">
                  <span className="text-[10px] font-mono font-bold text-slate-300">
                    {port.indice_puerto}
                  </span>
                </div>

                {/* Etiqueta de estado */}
                <span className="text-[9px] font-semibold truncate max-w-full">
                  {statusStyle.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle y Operaciones del Puerto Seleccionado */}
      {selectedPort ? (
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                Detalle del Puerto #{selectedPort.indice_puerto}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  getStatusColor(selectedPort.estado).bg
                }`}
              >
                {selectedPort.estado}
              </span>
            </div>
            <button
              onClick={() => setSelectedPort(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>

          {/* Caso 1: Puerto Libre -> Botón de Asignación */}
          {selectedPort.estado === 'Libre' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-emerald-300 font-medium">
                  El puerto #{selectedPort.indice_puerto} se encuentra disponible para nueva instalación.
                </p>
                <p className="text-[11px] text-slate-400">
                  Permitido para Técnicos de campo, Soporte y Administradores.
                </p>
              </div>
              <button
                onClick={() => onPortSelectToAssign(selectedPort)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Asignar Abonado</span>
              </button>
            </div>
          )}

          {/* Caso 2: Puerto Ocupado -> Ficha del Abonado */}
          {selectedPort.estado === 'Ocupado' && selectedPort.cliente && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Abonado Conectado:</span>
                  <strong className="text-white text-sm">
                    {selectedPort.cliente.nombre_completo}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cód. Cliente:</span>
                  <span className="font-mono font-semibold text-sky-400">
                    {selectedPort.cliente.numero_cliente}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ONT Marca:</span>
                  <span className="text-slate-200">
                    {selectedPort.cliente.marca_ont} (MAC: {selectedPort.cliente.ont_mac})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Potencia Rx Estimada:</span>
                  <span className="text-emerald-400 font-mono">
                    {selectedPort.cliente.potencia_rx_estimada} dBm
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Dirección Instalación:</span>
                  <span className="text-slate-300">{selectedPort.cliente.direccion}</span>
                </div>
              </div>

              {/* Botón de Liberación de Puerto */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  {user?.rol === 'Tecnico' ? (
                    <span className="text-amber-400">
                      * Rol Técnico: no autorizado para liberar o reasignar abonados.
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      * Soporte/Admin: puedes liberar el puerto para dejarlo disponible nuevamente.
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleReleasePort(selectedPort)}
                  disabled={isProcessing}
                  className={`text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors ${
                    user?.rol === 'Tecnico'
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-red-500/50 hover:text-red-400 cursor-not-allowed'
                      : 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30'
                  }`}
                  title={user?.rol === 'Tecnico' ? 'Acción restringida para Técnicos' : 'Liberar puerto'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Liberar Puerto</span>
                </button>
              </div>
            </div>
          )}

          {/* Caso 3: Puerto Dañado o en Mantenimiento */}
          {selectedPort.estado === 'Dañado' && (
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Este puerto está marcado como DAÑADO por falla en splitter o conector SC.</span>
              </div>
              {user?.rol !== 'Tecnico' && (
                <button
                  onClick={() => handleChangeStatus(selectedPort, 'Libre')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs border border-slate-600"
                >
                  Restablecer a Libre
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
          Selecciona cualquiera de los 16 puertos en la matriz para ver su detalle u operar sobre él.
        </div>
      )}
    </div>
  );
};

