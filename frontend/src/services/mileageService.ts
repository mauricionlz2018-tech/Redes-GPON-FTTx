import api from '../api/client';

export interface MileageRecord {
  id: string;
  id_nap?: string;
  nap_identificador?: string;
  nap_zona?: string;
  tecnico_nombre: string;
  vehiculo_unidad: string;
  motivo_traslado: string;
  tipo_calculo: 'odometro' | 'distancia_directa';
  km_inicial?: number;
  km_final?: number;
  km_recorridos: number;
  distancia_estimada_ruta_km?: number;
  origen_nombre?: string;
  destino_nombre: string;
  notas?: string;
  fecha_hora: string;
}

const STORAGE_KEY = 'gpon_mileage_logs_v1';

// Mock inicial para demostración de pruebas
const MOCK_INITIAL_LOGS: MileageRecord[] = [
  {
    id: 'mock-log-1',
    nap_identificador: 'NAP-SJR-01',
    nap_zona: 'Centro',
    tecnico_nombre: 'Ing. Carlos Mendoza',
    vehiculo_unidad: 'Camioneta Frontier #01',
    motivo_traslado: 'Instalacion',
    tipo_calculo: 'odometro',
    km_inicial: 48210,
    km_final: 48226,
    km_recorridos: 16.0,
    distancia_estimada_ruta_km: 15.2,
    origen_nombre: 'Central ODF San José',
    destino_nombre: 'NAP-SJR-01 - Centro',
    notas: 'Acometida de 150m con ONT ZTE para nuevo suscriptor',
    fecha_hora: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'mock-log-2',
    nap_identificador: 'NAP-SJR-10',
    nap_zona: 'Barrio San Miguel',
    tecnico_nombre: 'Téc. Roberto Gómez',
    vehiculo_unidad: 'Moto Italika #03',
    motivo_traslado: 'Mantenimiento',
    tipo_calculo: 'distancia_directa',
    km_recorridos: 8.5,
    distancia_estimada_ruta_km: 8.2,
    origen_nombre: 'Central ODF San José',
    destino_nombre: 'NAP-SJR-10 - San Miguel',
    notas: 'Limpieza de conectores y fusión de hilo atenuado (-28 dBm corregido a -19.2 dBm)',
    fecha_hora: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Obtener del almacenamiento local
export function getLocalMileageLogs(): MileageRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INITIAL_LOGS));
      return MOCK_INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error al leer kilometraje local:', e);
    return MOCK_INITIAL_LOGS;
  }
}

// Guardar en almacenamiento local
export function setLocalMileageLogs(logs: MileageRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Error al persistir kilometraje local:', e);
  }
}

// Consultar lista completa (intentando backend primero, con fallback local)
export async function fetchMileageLogs(): Promise<MileageRecord[]> {
  try {
    const res = await api.get('/kilometraje');
    if (res.data?.success && Array.isArray(res.data?.data)) {
      const serverLogs: MileageRecord[] = res.data.data;
      // Combinar inteligentemente con logs locales
      const localLogs = getLocalMileageLogs();
      const serverIds = new Set(serverLogs.map((l) => l.id));
      const merged = [...serverLogs];

      for (const local of localLogs) {
        if (!serverIds.has(local.id)) {
          merged.push(local);
        }
      }

      setLocalMileageLogs(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Backend no disponible para kilometraje, usando almacenamiento local / demo:', err);
  }
  return getLocalMileageLogs();
}

// Grabar un nuevo kilometraje
export async function recordMileageLog(
  record: Omit<MileageRecord, 'id' | 'fecha_hora'> & { fecha_hora?: string }
): Promise<MileageRecord> {
  const newLog: MileageRecord = {
    ...record,
    id: `km-${Date.now()}`,
    fecha_hora: record.fecha_hora || new Date().toISOString()
  };

  // Intentar guardar en backend
  try {
    const res = await api.post('/kilometraje', newLog);
    if (res.data?.success && res.data?.data) {
      const saved = res.data.data;
      const current = getLocalMileageLogs();
      setLocalMileageLogs([saved, ...current.filter((l) => l.id !== newLog.id)]);
      return saved;
    }
  } catch (err) {
    console.warn('Backend no disponible al guardar kilometraje, persistiendo localmente:', err);
  }

  // Fallback: guardar en local
  const current = getLocalMileageLogs();
  const updated = [newLog, ...current];
  setLocalMileageLogs(updated);
  return newLog;
}

// Eliminar un registro de kilometraje
export async function removeMileageLog(id: string): Promise<boolean> {
  try {
    await api.delete(`/kilometraje/${id}`);
  } catch (err) {
    console.warn('No se pudo eliminar en backend, procediendo en local:', err);
  }

  const current = getLocalMileageLogs();
  const filtered = current.filter((l) => l.id !== id);
  setLocalMileageLogs(filtered);
  return true;
}

// Exportar bitácora grabada a formato CSV compatible con Excel
export function exportMileageToCsv(records: MileageRecord[]): void {
  if (records.length === 0) return;

  const headers = [
    'ID',
    'Fecha',
    'Hora',
    'Tecnico',
    'Vehiculo / Unidad',
    'Motivo Traslado',
    'Destino / NAP',
    'Zona',
    'Modo Calculo',
    'Km Inicial',
    'Km Final',
    'Km Recorridos',
    'Km Ruta Estimada',
    'Notas'
  ];

  const rows = records.map((r) => {
    const d = new Date(r.fecha_hora);
    const fecha = d.toLocaleDateString('es-MX');
    const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    return [
      `"${r.id}"`,
      `"${fecha}"`,
      `"${hora}"`,
      `"${r.tecnico_nombre || ''}"`,
      `"${r.vehiculo_unidad || ''}"`,
      `"${r.motivo_traslado || ''}"`,
      `"${r.destino_nombre || ''}"`,
      `"${r.nap_zona || ''}"`,
      `"${r.tipo_calculo || ''}"`,
      r.km_inicial ?? '',
      r.km_final ?? '',
      r.km_recorridos,
      r.distancia_estimada_ruta_km ?? '',
      `"${(r.notas || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `bitacora_kilometraje_tecnicos_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
