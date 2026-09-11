import React, { useState } from 'react';
import { NapBox } from '../types';
import { useAuth } from '../context/AuthContext';
import { recordMileageLog, MileageRecord } from '../services/mileageService';
import {
  Car,
  Gauge,
  MapPin,
  Clock,
  Check,
  X,
  AlertCircle,
  Navigation,
  FileText,
  User,
  Truck
} from 'lucide-react';

interface MileageCaptureModalProps {
  nap?: NapBox | null;
  distanceKm?: number;
  availableNaps?: NapBox[];
  onClose: () => void;
  onSaved: (record: MileageRecord) => void;
}

const VEHICULO_PRESETS = [
  'Camioneta Frontier #01',
  'Camioneta Hilux #02',
  'Moto Italika #03',
  'Vehículo de Apoyo #04',
  'Vehículo Personal del Técnico'
];

const MOTIVO_PRESETS = [
  'Instalacion de Cliente',
  'Mantenimiento / Falla',
  'Auditoria de Red',
  'Corte / Reconexion',
  'Traslado Logistico'
];

export const MileageCaptureModal: React.FC<MileageCaptureModalProps> = ({
  nap,
  distanceKm,
  availableNaps = [],
  onClose,
  onSaved
}) => {
  const { user } = useAuth();

  // Estados del formulario
  const [selectedNapId, setSelectedNapId] = useState<string>(nap?.id_nap || nap?.identificador || '');
  const [destinoPersonalizado, setDestinoPersonalizado] = useState<string>(
    nap ? `${nap.identificador} (${nap.zona})` : ''
  );
  const [tecnicoNombre, setTecnicoNombre] = useState<string>(
    user?.nombre_completo || 'Técnico de Campo'
  );
  const [vehiculo, setVehiculo] = useState<string>(VEHICULO_PRESETS[0]);
  const [customVehiculo, setCustomVehiculo] = useState<string>('');
  const [motivo, setMotivo] = useState<string>(MOTIVO_PRESETS[0]);
  const [notas, setNotas] = useState<string>('');

  // Modo de captura: 'odometro' vs 'distancia_directa'
  const [tipoCalculo, setTipoCalculo] = useState<'odometro' | 'distancia_directa'>('odometro');

  // Valores de odómetro
  const [kmInicial, setKmInicial] = useState<string>('');
  const [kmFinal, setKmFinal] = useState<string>('');

  // Valor directo
  const [distanciaDirecta, setDistanciaDirecta] = useState<string>(
    distanceKm ? distanceKm.toFixed(1) : '10.0'
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calcular kilómetros recorridos resultantes
  let kmRecorridosCalculado = 0;
  if (tipoCalculo === 'odometro') {
    const ini = parseFloat(kmInicial);
    const fin = parseFloat(kmFinal);
    if (!isNaN(ini) && !isNaN(fin) && fin >= ini) {
      kmRecorridosCalculado = Number((fin - ini).toFixed(1));
    }
  } else {
    const dir = parseFloat(distanciaDirecta);
    if (!isNaN(dir) && dir > 0) {
      kmRecorridosCalculado = Number(dir.toFixed(1));
    }
  }

  // Manejar cambio de NAP en selector
  const handleNapSelectChange = (id: string) => {
    setSelectedNapId(id);
    const found = availableNaps.find((n) => (n.id_nap || n.identificador) === id);
    if (found) {
      setDestinoPersonalizado(`${found.identificador} (${found.zona})`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones
    if (!tecnicoNombre.trim()) {
      setErrorMsg('Por favor indica el nombre del técnico.');
      return;
    }

    const vehiculoFinal = vehiculo === 'Otro' ? customVehiculo.trim() : vehiculo;
    if (!vehiculoFinal) {
      setErrorMsg('Por favor especifica la unidad o vehículo utilizado.');
      return;
    }

    if (tipoCalculo === 'odometro') {
      const ini = parseFloat(kmInicial);
      const fin = parseFloat(kmFinal);
      if (isNaN(ini) || isNaN(fin)) {
        setErrorMsg('Ingresa valores numéricos válidos para el odómetro inicial y final.');
        return;
      }
      if (fin < ini) {
        setErrorMsg('El kilometraje final no puede ser menor al kilometraje inicial.');
        return;
      }
      if (fin === ini) {
        setErrorMsg('El kilometraje final debe ser mayor al inicial para registrar recorrido.');
        return;
      }
    } else {
      const dist = parseFloat(distanciaDirecta);
      if (isNaN(dist) || dist <= 0) {
        setErrorMsg('Ingresa una distancia recorrida válida mayor a 0 km.');
        return;
      }
    }

    const destinoFinal = destinoPersonalizado.trim() || nap?.identificador || 'Punto en Campo';

    setIsSaving(true);
    try {
      const created = await recordMileageLog({
        id_nap: nap?.id_nap || (selectedNapId ? selectedNapId : undefined),
        nap_identificador: nap?.identificador || selectedNapId || undefined,
        nap_zona: nap?.zona,
        tecnico_nombre: tecnicoNombre.trim(),
        vehiculo_unidad: vehiculoFinal,
        motivo_traslado: motivo,
        tipo_calculo: tipoCalculo,
        km_inicial: tipoCalculo === 'odometro' ? parseFloat(kmInicial) : undefined,
        km_final: tipoCalculo === 'odometro' ? parseFloat(kmFinal) : undefined,
        km_recorridos: kmRecorridosCalculado,
        distancia_estimada_ruta_km: distanceKm ? Number(distanceKm.toFixed(1)) : undefined,
        origen_nombre: 'Central ODF San José',
        destino_nombre: destinoFinal,
        notas: notas.trim() || undefined
      });

      onSaved(created);
      onClose();
    } catch (err: any) {
      console.error('Error guardando kilometraje:', err);
      setErrorMsg(err.message || 'No se pudo guardar el registro de kilometraje.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6 transition-colors">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 px-4 sm:px-5 py-3.5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Capturar Kilometraje de Traslado
              </h3>
              <p className="text-[11px] text-sky-100 font-medium">
                Bitácora de Odómetro y Distancias del Personal Técnico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-2.5 rounded-xl flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Información de Destino */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                Destino / Ubicación de la Caja NAP
              </label>
              {nap && (
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-200 dark:border-sky-800">
                  {nap.zona}
                </span>
              )}
            </div>

            {nap ? (
              <div className="text-slate-800 dark:text-slate-200">
                <span className="font-bold text-sm text-sky-600 dark:text-sky-400">
                  {nap.identificador}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {nap.direccion_texto || 'Coordenadas GPS registradas'}
                </p>
              </div>
            ) : availableNaps.length > 0 ? (
              <select
                value={selectedNapId}
                onChange={(e) => handleNapSelectChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Seleccionar Caja NAP Destino --</option>
                {availableNaps.map((n) => (
                  <option key={n.id_nap || n.identificador} value={n.id_nap || n.identificador}>
                    {n.identificador} - {n.zona}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={destinoPersonalizado}
                onChange={(e) => setDestinoPersonalizado(e.target.value)}
                placeholder="Ej. NAP-SJR-05 o Barrio San Miguel"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            )}

            {distanceKm !== undefined && (
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200 dark:border-slate-700/60 font-medium">
                <Navigation className="w-3.5 h-3.5" />
                <span>Distancia vial calculada en mapa: <strong>{distanceKm.toFixed(1)} km</strong></span>
              </div>
            )}
          </div>

          {/* Datos del Técnico y Vehículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Técnico en Turno
              </label>
              <input
                type="text"
                value={tecnicoNombre}
                onChange={(e) => setTecnicoNombre(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Unidad / Vehículo
              </label>
              <select
                value={vehiculo}
                onChange={(e) => setVehiculo(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                {VEHICULO_PRESETS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                <option value="Otro">Otro vehículo...</option>
              </select>
            </div>
          </div>

          {vehiculo === 'Otro' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Especificar Unidad / Placas
              </label>
              <input
                type="text"
                value={customVehiculo}
                onChange={(e) => setCustomVehiculo(e.target.value)}
                placeholder="Ej. Moto Particular / Unidad de renta"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Motivo del Traslado */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Motivo del Traslado
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVO_PRESETS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMotivo(m)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    motivo === m
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Método de Cálculo */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Método de Medición de Kilómetros
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTipoCalculo('odometro')}
                className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${
                  tipoCalculo === 'odometro'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Odómetro del Tablero</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoCalculo('distancia_directa')}
                className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${
                  tipoCalculo === 'distancia_directa'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Distancia Directa / Ruta</span>
              </button>
            </div>
          </div>

          {/* Inputs según el método seleccionado */}
          {tipoCalculo === 'odometro' ? (
            <div className="bg-sky-50/50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-200 dark:border-sky-800/50 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Km Inicial (Salida)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 48210"
                    value={kmInicial}
                    onChange={(e) => setKmInicial(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Km Final (Llegada)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 48228"
                    value={kmFinal}
                    onChange={(e) => setKmFinal(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Resultado calculado */}
              <div className="flex items-center justify-between pt-2 border-t border-sky-200/60 dark:border-sky-800/40">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Kilómetros netos calculados:
                </span>
                <span className="text-sm font-bold text-sky-700 dark:text-sky-300 font-mono bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded-md border border-sky-300 dark:border-sky-700">
                  {kmRecorridosCalculado > 0 ? `${kmRecorridosCalculado} km` : '0.0 km'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-sky-50/50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-200 dark:border-sky-800/50 space-y-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kilómetros Recorridos
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 14.5"
                    value={distanciaDirecta}
                    onChange={(e) => setDistanciaDirecta(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500 font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                    km
                  </span>
                </div>
              </div>
              {distanceKm !== undefined && (
                <button
                  type="button"
                  onClick={() => setDistanciaDirecta(distanceKm.toFixed(1))}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                >
                  Usar distancia exacta calculada por ruta ({distanceKm.toFixed(1)} km)
                </button>
              )}
            </div>
          )}

          {/* Notas u Observaciones */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notas u Observaciones del Viaje (Opcional)
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Se reparó cable droop a 200m; desvío por reparación en tramo El Depósito..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || kmRecorridosCalculado <= 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-sky-950/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Grabar Kilometraje ({kmRecorridosCalculado} km)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

