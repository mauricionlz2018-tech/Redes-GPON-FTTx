import React, { useState } from 'react';
import { NapBox, NapPort, UserRole, Client } from '../types';
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
  Info,
  Edit3,
  X,
  ArrowUp,
  Navigation,
  Clock,
  RotateCcw
} from 'lucide-react';
import { EditClientModal } from './EditClientModal';

interface NapPortMatrixProps {
  nap: NapBox;
  onPortSelectToAssign: (port: NapPort) => void;
  onRefreshNap: () => void;
  onScrollToMap?: () => void;
  onRequestRoute?: (nap: NapBox) => void;
  onDeleteNapRequest?: (nap: NapBox) => void;
}

export const NapPortMatrix: React.FC<NapPortMatrixProps> = ({
  nap,
  onPortSelectToAssign,
  onRefreshNap,
  onScrollToMap,
  onRequestRoute,
  onDeleteNapRequest
}) => {
  const { user } = useAuth();
  const [selectedPort, setSelectedPort] = useState<NapPort | null>(null);
  const [portToRelease, setPortToRelease] = useState<NapPort | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState<boolean>(false);
  const [rbacError, setRbacError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const ports = nap.puertos || [];

  // Iniciar flujo de liberación con modal visual estilizado (sin window.confirm)
  const handleReleaseClick = (port: NapPort) => {
    setRbacError(null);
    setPortToRelease(port);
  };

  // Confirmar y ejecutar la liberación del puerto en backend y UI
  const handleConfirmReleasePort = async () => {
    if (!portToRelease) return;

    try {
      setIsProcessing(true);
      setRbacError(null);
      await api.delete(`/puertos/${portToRelease.id_puerto}/liberar`);
      setActionSuccess(`Puerto #${portToRelease.indice_puerto} liberado exitosamente.`);
      setPortToRelease(null);
      setSelectedPort(null);
      onRefreshNap();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setRbacError(error.response.data.message || '403 Forbidden: Sin autorización');
        setPortToRelease(null);
      } else {
        // Fallback interactivo si el backend no está disponible
        portToRelease.estado = 'Libre';
        portToRelease.cliente = null;
        if (nap.metricas) {
          nap.metricas.ocupados = Math.max(0, nap.metricas.ocupados - 1);
          nap.metricas.libres = Math.min(nap.total_puertos, nap.metricas.libres + 1);
          nap.metricas.porcentajeSaturacion = Math.round((nap.metricas.ocupados / nap.total_puertos) * 100);
        }
        setActionSuccess(`Puerto #${portToRelease.indice_puerto} liberado exitosamente.`);
        setPortToRelease(null);
        setSelectedPort(null);
        onRefreshNap();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Cambiar estado a Dañado / Libre / Reservado (Soporte / Admin / Técnico)
  const handleChangeStatus = async (port: NapPort, nuevoEstado: string) => {
    // Si es técnico y desea marcar como Dañado, restringir por RBAC
    if (user?.rol === 'Tecnico' && nuevoEstado === 'Dañado') {
      setRbacError(
        "Permiso denegado (HTTP 403 Forbidden): El rol 'Técnico' solo puede apartar puertos para órdenes o liberarlos. Para marcar puertos como 'Dañado' se requiere perfil de Soporte o Administrador."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setRbacError(null);
      await api.patch(`/puertos/${port.id_puerto}/estado`, { estado: nuevoEstado });
      setActionSuccess(
        nuevoEstado === 'Reservado'
          ? `Puerto #${port.indice_puerto} apartado exitosamente para orden de instalación programada.`
          : `Estado del puerto #${port.indice_puerto} cambiado a '${nuevoEstado}'.`
      );
      setSelectedPort(null);
      onRefreshNap();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setRbacError(error.response.data.message || '403 Forbidden: Sin autorización');
      } else {
        // Fallback interactivo si el backend no está disponible (ej. Vercel)
        const previousState = port.estado;
        port.estado = nuevoEstado as any;
        if (nuevoEstado !== 'Ocupado') {
          port.cliente = null;
        }

        // Sincronizar métricas locales de la caja NAP
        if (nap.metricas) {
          if (previousState === 'Ocupado') nap.metricas.ocupados = Math.max(0, nap.metricas.ocupados - 1);
          if (previousState === 'Libre') nap.metricas.libres = Math.max(0, nap.metricas.libres - 1);
          if (previousState === 'Dañado') nap.metricas.danados = Math.max(0, nap.metricas.danados - 1);
          if (previousState === 'Reservado') nap.metricas.reservados = Math.max(0, (nap.metricas.reservados || 0) - 1);

          if (nuevoEstado === 'Ocupado') nap.metricas.ocupados += 1;
          if (nuevoEstado === 'Libre') nap.metricas.libres += 1;
          if (nuevoEstado === 'Dañado') nap.metricas.danados += 1;
          if (nuevoEstado === 'Reservado') nap.metricas.reservados = (nap.metricas.reservados || 0) + 1;

          nap.metricas.porcentajeSaturacion = Math.round((nap.metricas.ocupados / nap.total_puertos) * 100);
        }

        setActionSuccess(
          nuevoEstado === 'Reservado'
            ? `Puerto #${port.indice_puerto} apartado exitosamente para orden de instalación programada (Modo Demo).`
            : `Estado del puerto #${port.indice_puerto} cambiado a '${nuevoEstado}' (Modo Demo).`
        );
        setSelectedPort(null);
        onRefreshNap();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = () => {
    if (user?.rol === 'Tecnico') {
      setRbacError(
        "Permiso denegado (HTTP 403 Forbidden): El rol 'Tecnico' no tiene autorización para dar de baja o eliminar cajas NAP de la infraestructura. Esta acción requiere permisos de Soporte o Administrador."
      );
      return;
    }
    if (onDeleteNapRequest) {
      onDeleteNapRequest(nap);
    }
  };

  const getPortBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'Libre':
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
          led: 'bg-emerald-500 shadow-emerald-500/50 shadow-sm',
          label: 'Libre'
        };
      case 'Ocupado':
        return {
          bg: 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/40 text-sky-700 dark:text-sky-300',
          led: 'bg-sky-500 shadow-sky-500/50 shadow-sm',
          label: 'Ocupado'
        };
      case 'Dañado':
        return {
          bg: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-400',
          led: 'bg-red-500 shadow-red-500/50 shadow-sm',
          label: 'Dañado'
        };
      case 'Reservado':
        return {
          bg: 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-amber-800 dark:text-amber-300',
          led: 'bg-amber-500 shadow-amber-500/60 shadow-sm animate-pulse',
          label: 'Reservado'
        };
      default:
        return {
          bg: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/30 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400',
          led: 'bg-slate-400 dark:bg-slate-500',
          label: estado
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-xl transition-colors">
      {/* Cabecera del Chasis de la NAP */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 space-y-2.5">
        {/* Fila 1: Título de la NAP, Zona y Badge de Saturación */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Server className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {nap.identificador}
              </h3>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium shrink-0">
                {nap.zona}
              </span>
            </div>
            {nap.direccion_texto && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2" title={nap.direccion_texto}>
                {nap.direccion_texto}
              </p>
            )}
          </div>

          {/* Badge de Saturación en esquina superior derecha */}
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
              Saturación
            </span>
            <span
              className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-0.5 ${
                (nap.metricas?.porcentajeSaturacion ?? 0) >= 80
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {nap.metricas?.porcentajeSaturacion ?? 0}% ({nap.metricas?.ocupados ?? 0}/{nap.total_puertos})
            </span>
            {!!(nap.metricas?.reservados && nap.metricas.reservados > 0) && (
              <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                {nap.metricas.reservados} reservado{nap.metricas.reservados > 1 ? 's' : ''} (ámbar)
              </span>
            )}
          </div>
        </div>

        {/* Fila 2: Botones de Acción de la Caja (Ruta, Volver a Mapa, Eliminar) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {onRequestRoute && (
            <button
              onClick={() => onRequestRoute(nap)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/80 px-2.5 py-1.5 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Trazar ruta vial desde la Empresa hacia esta caja"
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>Ruta de llegada</span>
            </button>
          )}

          {onScrollToMap && (
            <button
              onClick={onScrollToMap}
              className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800/80 px-2.5 py-1.5 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Volver arriba al mapa"
            >
              <ArrowUp className="w-3.5 h-3.5 shrink-0" />
              <span>Subir a Mapa</span>
            </button>
          )}

          {onDeleteNapRequest && (
            <button
              onClick={handleDeleteClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 border border-red-200 dark:border-red-800/80 px-2.5 py-1.5 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Dar de baja o eliminar esta caja NAP de la red"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Eliminar Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerta de RBAC (403) si un técnico intenta acción prohibida */}
      {rbacError && (
        <div className="mb-4 p-3 bg-red-500/10 dark:bg-red-950/50 border border-red-500/30 dark:border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold text-red-700 dark:text-red-300">Restricción de Perfil RBAC</strong>
            <span>{rbacError}</span>
          </div>
          <button
            onClick={() => setRbacError(null)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-white p-0.5 rounded cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Aviso de acción exitosa */}
      {actionSuccess && (
        <div className="mb-4 p-2.5 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-800/60 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-white p-0.5 rounded cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Matriz física de 16 puertos en 2 filas de 8 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
          <span>Matriz de Distribución FTTx ({ports.length} Puertos)</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Toca un puerto para gestionar</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-slate-100 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
          {ports.map((port) => {
            const style = getPortBadgeStyle(port.estado);
            const isSelected = selectedPort?.id_puerto === port.id_puerto;

            return (
              <button
                key={port.id_puerto}
                onClick={() => setSelectedPort(port)}
                className={`relative flex flex-col items-center justify-between p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  style.bg
                } ${
                  isSelected
                    ? 'ring-2 ring-sky-500 dark:ring-sky-400 scale-105 shadow-md z-10'
                    : 'hover:scale-102'
                }`}
              >
                {/* LED Indicador */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`w-2 h-2 rounded-full ${style.led}`} />
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    #{port.indice_puerto}
                  </span>
                </div>

                {/* Ícono de Estado */}
                <div className="my-1">
                  {port.estado === 'Ocupado' ? (
                    <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  ) : port.estado === 'Libre' ? (
                    <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : port.estado === 'Reservado' ? (
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                  )}
                </div>

                <span className="text-[10px] font-semibold truncate max-w-full">
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Leyenda de Estados del Hardware y Señalización LED */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center justify-between gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shrink-0" />
            <span>Verde: <strong>Libre</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs shrink-0" />
            <span>Azul: <strong>Ocupado</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs animate-pulse shrink-0" />
            <span>Ámbar: <strong>Reservado (Apartado)</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shrink-0" />
            <span>Rojo: <strong>Dañado</strong></span>
          </div>
        </div>
      </div>

      {/* Detalle y Operaciones del Puerto Seleccionado */}
      {selectedPort && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 space-y-3 transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Detalle Puerto #{selectedPort.indice_puerto}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  getPortBadgeStyle(selectedPort.estado).bg
                }`}
              >
                {selectedPort.estado}
              </span>
            </div>
            <button
              onClick={() => setSelectedPort(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Información del Cliente si está ocupado */}
          {selectedPort.cliente ? (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Abonado:</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {selectedPort.cliente.nombre_completo}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Número de Cuenta:</span>
                  <strong className="text-sky-600 dark:text-sky-400 font-mono">
                    {selectedPort.cliente.numero_cliente}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Dirección:</span>
                  <span>{selectedPort.cliente.direccion}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">ONT / Marca:</span>
                  <span>
                    {selectedPort.cliente.marca_ont} (MAC: {selectedPort.cliente.ont_mac || 'N/A'})
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Potencia Óptica Rx:</span>
                  <span
                    className={`font-semibold ${
                      selectedPort.cliente.potencia_rx_estimada && selectedPort.cliente.potencia_rx_estimada < -27
                        ? 'text-red-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {selectedPort.cliente.potencia_rx_estimada
                      ? `${selectedPort.cliente.potencia_rx_estimada} dBm (Rango Operativo Óptimo)`
                      : '-19.2 dBm (Simulada)'}
                  </span>
                </div>
              </div>

              {/* Botón para Editar Datos del Abonado (Todos los roles tienen acceso para correcciones en campo) */}
              <button
                onClick={() => setIsEditClientModalOpen(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-500" />
                <span>Editar Datos del Abonado</span>
              </button>
            </div>
          ) : selectedPort.estado === 'Reservado' ? (
            <div className="text-xs p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 dark:border-amber-500/40 rounded-xl text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-fadeIn">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="font-semibold text-amber-900 dark:text-amber-200 block">
                  Puerto apartado para orden de instalación programada
                </strong>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  Este puerto óptico se encuentra reservado. Puedes proceder con la instalación para vincular al abonado, o liberar el apartado si la orden fue reprogramada o cancelada.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 p-2.5 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              {selectedPort.estado === 'Libre'
                ? 'El puerto se encuentra disponible para asignación de acometida a un nuevo abonado o para apartarse para una orden programada.'
                : `Puerto en condición '${selectedPort.estado}'. Bloqueado para nuevas conexiones por daño físico en conector o fibra.`}
            </div>
          )}

          {/* Botones de Acción sobre el Puerto */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* 1. Acciones cuando el puerto está Libre */}
            {selectedPort.estado === 'Libre' && (
              <>
                <button
                  onClick={() => onPortSelectToAssign(selectedPort)}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Conectar acometida a nuevo abonado"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Asignar Acometida</span>
                </button>

                <button
                  onClick={() => handleChangeStatus(selectedPort, 'Reservado')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Apartar este puerto para una orden de instalación programada"
                >
                  <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Apartar para Orden</span>
                </button>
              </>
            )}

            {/* 2. Acciones cuando el puerto está Reservado (Apartado) */}
            {selectedPort.estado === 'Reservado' && (
              <>
                <button
                  onClick={() => onPortSelectToAssign(selectedPort)}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Completar la instalación programada y vincular cliente en este puerto"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Asignar Acometida</span>
                </button>

                <button
                  onClick={() => handleChangeStatus(selectedPort, 'Libre')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Cancelar el apartado y regresar puerto a Libre"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <span>Liberar Reserva</span>
                </button>
              </>
            )}

            {/* 3. Acción cuando el puerto está Ocupado */}
            {selectedPort.estado === 'Ocupado' && (
              <button
                onClick={() => handleReleaseClick(selectedPort)}
                disabled={isProcessing}
                className="flex-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/80 font-semibold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
                title="Liberar puerto ocupado y desvincular abonado"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Liberar Puerto</span>
              </button>
            )}

            {/* 4. Mantenimiento de Puertos (Admin / Soporte): Dañado o Reparado */}
            {selectedPort.estado !== 'Ocupado' && (
              <button
                onClick={() =>
                  handleChangeStatus(
                    selectedPort,
                    selectedPort.estado === 'Dañado' ? 'Libre' : 'Dañado'
                  )
                }
                disabled={isProcessing}
                className="sm:flex-none bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                title={selectedPort.estado === 'Dañado' ? 'Marcar como reparado y Libre' : 'Marcar como puerto Dañado'}
              >
                <Wrench className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                <span>{selectedPort.estado === 'Dañado' ? 'Marcar Libre' : 'Marcar Dañado'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Liberar Puerto (Reemplaza alert/confirm nativo) */}
      {portToRelease && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all animate-scaleUp">
            {/* Cabecera */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Confirmar Liberación de Puerto
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Desvinculación de abonado y liberación de acometida
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPortToRelease(null)}
                disabled={isProcessing}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Puerto #{portToRelease.indice_puerto}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold">
                    {nap.identificador}
                  </span>
                </div>
                {portToRelease.cliente && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      Abonado: <span className="font-bold text-slate-900 dark:text-white">{portToRelease.cliente.nombre_completo}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Contrato: <span className="font-mono">{portToRelease.cliente.numero_cliente}</span> | ONT MAC: <span className="font-mono">{portToRelease.cliente.ont_mac}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-red-50/60 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 rounded-xl text-red-800 dark:text-red-300 text-[11px] space-y-1">
                <p className="font-semibold text-xs text-red-700 dark:text-red-300">¿Estás seguro de liberar el puerto #{portToRelease.indice_puerto}?</p>
                <p className="text-[11px] leading-relaxed">
                  El abonado será desvinculado de la caja terminal y el puerto pasará inmediatamente a estado <strong>Libre</strong> para nuevas asignaciones.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPortToRelease(null)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReleasePort}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 rounded-lg shadow-md shadow-red-950/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Liberando puerto...' : 'Sí, Liberar Puerto'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Datos del Abonado */}
      {isEditClientModalOpen && selectedPort?.cliente && (
        <EditClientModal
          client={selectedPort.cliente}
          onClose={() => setIsEditClientModalOpen(false)}
          onClientUpdated={(updatedClient: Client) => {
            selectedPort.cliente = updatedClient;
            setActionSuccess(`Datos del abonado ${updatedClient.nombre_completo} actualizados.`);
            onRefreshNap();
          }}
        />
      )}
    </div>
  );
};
