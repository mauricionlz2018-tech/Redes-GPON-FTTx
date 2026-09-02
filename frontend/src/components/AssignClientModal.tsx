import React, { useState } from 'react';
import { NapBox, NapPort } from '../types';
import { useNetwork } from '../context/NetworkContext';
import api from '../api/client';
import { UserCheck, X, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface AssignClientModalProps {
  nap: NapBox;
  port: NapPort;
  onClose: () => void;
  onAssignedSuccess: () => void;
}

export const AssignClientModal: React.FC<AssignClientModalProps> = ({
  nap,
  port,
  onClose,
  onAssignedSuccess
}) => {
  const { isOnline, enqueueAssignment } = useNetwork();

  // Generar código de cliente sugerido
  const initialClientCode = `CLI-${Math.floor(10000 + Math.random() * 90000)}`;

  const [formData, setFormData] = useState({
    numero_cliente: initialClientCode,
    nombre_completo: '',
    marca_ont: 'ZTE' as 'ZTE' | 'Huawei' | 'V-SOL' | 'TP-Link',
    direccion: nap.direccion_texto,
    ont_mac: '',
    potencia_rx_estimada: -19.5
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validación básica de MAC
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(formData.ont_mac)) {
      setErrorMsg('La dirección MAC debe tener el formato AA:BB:CC:DD:EE:FF');
      return;
    }

    const payload = {
      id_puerto: port.id_puerto,
      ...formData
    };

    setLoading(true);

    try {
      if (isOnline) {
        // En línea: ejecutar transacción atómica ACID en backend
        const response = await api.post('/puertos/asignar', payload);
        if (response.data.success) {
          onAssignedSuccess();
          onClose();
        }
      } else {
        // Fuera de línea: encolar en Dexie IndexedDB
        await enqueueAssignment(payload);
        alert(
          '💾 Operación guardada en modo OFFLINE. La asignación del abonado se sincronizará automáticamente cuando el dispositivo recupere conexión a internet.'
        );
        onAssignedSuccess();
        onClose();
      }
    } catch (err: any) {
      console.warn('Backend no respondió, asignando abonado localmente en Modo Demostración...', err);
      // Aplicar cambio visual inmediato en el puerto para demostración
      port.estado = 'Ocupado';
      port.cliente = {
        id_cliente: `cli-${Date.now()}`,
        numero_cliente: formData.numero_cliente,
        nombre_completo: formData.nombre_completo,
        id_puerto_nap: port.id_puerto,
        marca_ont: formData.marca_ont,
        direccion: formData.direccion,
        ont_mac: formData.ont_mac,
        potencia_rx_estimada: formData.potencia_rx_estimada
      };
      if (nap.metricas) {
        nap.metricas.ocupados += 1;
        nap.metricas.libres = Math.max(0, nap.metricas.libres - 1);
        nap.metricas.porcentajeSaturacion = Math.round((nap.metricas.ocupados / nap.total_puertos) * 100);
      }
      onAssignedSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Asignar Abonado a Puerto</h3>
            <p className="text-xs text-slate-400">
              Caja <span className="text-sky-400 font-semibold">{nap.identificador}</span> &bull; Puerto{' '}
              <span className="text-emerald-400 font-semibold">#{port.indice_puerto}</span>
            </p>
          </div>
        </div>

        {/* Indicador de modo Offline si aplica */}
        {!isOnline && (
          <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs text-amber-300">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>
              Estás en <strong>Modo Sin Conexión</strong>. La asignación se guardará en IndexedDB y se sincronizará automáticamente al volver en línea.
            </span>
          </div>
        )}

        {/* Mensaje de error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código / N° de Cliente
              </label>
              <input
                type="text"
                required
                value={formData.numero_cliente}
                onChange={(e) => setFormData({ ...formData, numero_cliente: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Marca de ONT (CPE)
              </label>
              <select
                value={formData.marca_ont}
                onChange={(e) => setFormData({ ...formData, marca_ont: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ZTE">ZTE (F660 / F670)</option>
                <option value="Huawei">Huawei (HG8245H)</option>
                <option value="V-SOL">V-SOL (V2804)</option>
                <option value="TP-Link">TP-Link (TX-VG1530)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre Completo del Abonado
            </label>
            <input
              type="text"
              required
              placeholder="Ej. María Elena González Flores"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dirección MAC de la ONT
              </label>
              <input
                type="text"
                required
                placeholder="48:2C:EA:12:34:56"
                value={formData.ont_mac}
                onChange={(e) => setFormData({ ...formData, ont_mac: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Potencia Rx Estimada (dBm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.potencia_rx_estimada}
                onChange={(e) =>
                  setFormData({ ...formData, potencia_rx_estimada: parseFloat(e.target.value) || -19.5 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dirección de Instalación
            </label>
            <textarea
              rows={2}
              required
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Asignando...' : 'Confirmar Asignación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

