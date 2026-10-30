import { NapBox, Client, User } from '../types';
import { mockNaps } from '../data/mockGponData';
import { offlineDb } from '../db/offlineDb';

export type RealtimeEvent =
  | { type: 'NAP_CREATED'; nap: NapBox }
  | { type: 'NAP_UPDATED'; nap: NapBox }
  | { type: 'NAP_DELETED'; id_nap: string }
  | { type: 'CLIENT_ASSIGNED'; client: Client; nap?: NapBox }
  | { type: 'CLIENT_UPDATED'; client: Client }
  | { type: 'CLIENT_RELEASED'; id_puerto: string; id_nap: string }
  | { type: 'INFRA_CREATED'; category: 'route' | 'mufa' | 'poste' | 'gasa'; item: any }
  | { type: 'INFRA_DELETED'; category: 'route' | 'mufa' | 'poste' | 'gasa'; id: string }
  | { type: 'USER_CREATED'; user: User }
  | { type: 'USER_UPDATED'; user: User }
  | { type: 'USER_DELETED'; id_usuario: string }
  | { type: 'DATA_REFRESH_REQUESTED' };

const CHANNEL_NAME = 'gpon_realtime_sync_channel';

// Instancia de BroadcastChannel si el navegador lo soporta
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel no soportado, se usará sincronización por StorageEvent', e);
}

// Suscriptores locales en memoria
const listeners = new Set<(event: RealtimeEvent) => void>();

if (channel) {
  channel.onmessage = (msgEvent) => {
    if (msgEvent.data && typeof msgEvent.data.type === 'string') {
      listeners.forEach((fn) => {
        try {
          fn(msgEvent.data as RealtimeEvent);
        } catch (err) {
          console.error('Error en listener de realtime channel:', err);
        }
      });
    }
  };
}

// Fallback cruzado con StorageEvent para navegadores o pestañas secundarias
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'gpon_realtime_event_signal' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn(parsed));
      } catch {}
    }
  });
}

/**
 * Emite un evento en tiempo real a todas las pestañas, ventanas y componentes abiertos.
 */
export const broadcastRealtimeEvent = (event: RealtimeEvent) => {
  // 1. Notificar a oyentes locales en la pestaña activa
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch (err) {
      console.error('Error en listener local de realtime:', err);
    }
  });

  // 2. Transmitir por BroadcastChannel a otras pestañas activas
  if (channel) {
    try {
      channel.postMessage(event);
    } catch (err) {
      console.warn('Error enviando mensaje por BroadcastChannel:', err);
    }
  }

  // 3. Escribir señal en localStorage para provocar storage event en otras pestañas
  try {
    localStorage.setItem(
      'gpon_realtime_event_signal',
      JSON.stringify({ ...event, _timestamp: Date.now() })
    );
  } catch {}
};

/**
 * Suscribirse a eventos en tiempo real. Devuelve una función para desuscribirse.
 */
export const subscribeToRealtime = (handler: (event: RealtimeEvent) => void): (() => void) => {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
};

// ==============================================================
// GESTIÓN DE CACHÉ INSTANTÁNEA (CACHE-FIRST / 0ms AL RECARGAR)
// ==============================================================

const NAPS_CACHE_KEY = 'gpon_cached_naps';
const CLIENTS_CACHE_KEY = 'gpon_cached_clients';

/**
 * Obtiene las cajas NAP de la caché local de forma sincrónica e instantánea.
 * Al recargar la página, esto devuelve los datos en < 1 milisegundo sin esperar peticiones de red.
 */
export const getCachedNapsSync = (): NapBox[] => {
  try {
    const raw = localStorage.getItem(NAPS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return mockNaps;
};

/**
 * Guarda las cajas NAP en caché síncrona (localStorage) y asíncrona (IndexedDB Dexie).
 */
export const saveCachedNaps = async (naps: NapBox[]) => {
  try {
    localStorage.setItem(NAPS_CACHE_KEY, JSON.stringify(naps));
  } catch (e) {
    console.warn('No se pudo guardar naps en localStorage:', e);
  }

  try {
    await offlineDb.cached_naps.clear();
    await offlineDb.cached_naps.bulkPut(naps);
  } catch (e) {
    console.warn('No se pudo guardar en Dexie offlineDb:', e);
  }
};

/**
 * Agrega o actualiza una caja NAP de forma inmediata tanto en caché como en IndexedDB.
 */
export const putCachedNapImmediate = async (newOrUpdatedNap: NapBox) => {
  const current = getCachedNapsSync();
  const exists = current.some((n) => n.id_nap === newOrUpdatedNap.id_nap);
  const updatedList = exists
    ? current.map((n) => (n.id_nap === newOrUpdatedNap.id_nap ? newOrUpdatedNap : n))
    : [newOrUpdatedNap, ...current];

  try {
    localStorage.setItem(NAPS_CACHE_KEY, JSON.stringify(updatedList));
  } catch {}

  try {
    await offlineDb.cached_naps.put(newOrUpdatedNap);
  } catch {}

  return updatedList;
};

/**
 * Obtiene la lista de abonados de la caché local de forma sincrónica.
 */
export const getCachedClientsSync = (): Client[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Extraer clientes iniciales desde mockNaps como fallback
  const mockClients: Client[] = [];
  mockNaps.forEach((nap) => {
    (nap.puertos || []).forEach((port) => {
      if (port.cliente) {
        mockClients.push({
          ...port.cliente,
          puerto_nap: {
            ...port,
            caja_nap: nap
          }
        });
      }
    });
  });
  return mockClients;
};

/**
 * Guarda la lista de abonados en caché síncrona.
 */
export const saveCachedClients = (clients: Client[]) => {
  try {
    localStorage.setItem(CLIENTS_CACHE_KEY, JSON.stringify(clients));
  } catch {}
};

/**
 * Agrega o actualiza un cliente en caché síncrona de inmediato.
 */
export const putCachedClientImmediate = (client: Client) => {
  const current = getCachedClientsSync();
  const exists = current.some((c) => c.id_cliente === client.id_cliente);
  const updated = exists
    ? current.map((c) => (c.id_cliente === client.id_cliente ? client : c))
    : [client, ...current];
  saveCachedClients(updated);
  return updated;
};

/**
 * Comparador profundo y seguro para detectar cambios reales en listas de objetos
 * (puertos, clientes, coordenadas, métricas, etc.) sin descartar actualizaciones.
 */
export const haveDeepItemsChanged = <T extends Record<string, any>>(
  prev: T[],
  next: T[],
  idKey: string
): boolean => {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i][idKey] !== next[i][idKey]) return true;
    if (JSON.stringify(prev[i]) !== JSON.stringify(next[i])) return true;
  }
  return false;
};

// ==============================================================
// CONEXIÓN SSE MULTI-DISPOSITIVO (Mac <-> Windows <-> Móvil)
// ==============================================================
let sseSource: EventSource | null = null;
let sseReconnectTimer: any = null;

export const initMultiDeviceSse = () => {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
  if (sseSource && sseSource.readyState !== EventSource.CLOSED) return;

  const token = localStorage.getItem('gpon_token') || 'demo-jwt-token';
  const defaultApiUrl = import.meta.env.DEV ? '' : 'https://redes-gpon-fttx.onrender.com';
  const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
  const baseUrl = apiUrl ? `${apiUrl.replace(/\/+$/, '')}/api/v1` : '/api/v1';

  try {
    const sseUrl = `${baseUrl}/events?token=${encodeURIComponent(token)}`;
    const source = new EventSource(sseUrl);
    sseSource = source;

    source.onopen = () => {
      console.log('⚡ [SSE GPON] Conectado en tiempo real con el servidor central');
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type && payload.type !== 'CONNECTED') {
          console.log(`⚡ [SSE Evento Remoto recibido]: ${payload.type}`, payload);
          // Notificar inmediatamente a la aplicación para actualizar mapa y datos sin espera
          broadcastRealtimeEvent({ type: 'DATA_REFRESH_REQUESTED' });
        }
      } catch (err) {}
    };

    source.onerror = () => {
      source.close();
      if (sseSource === source) {
        sseSource = null;
      }
      clearTimeout(sseReconnectTimer);
      sseReconnectTimer = setTimeout(() => {
        initMultiDeviceSse();
      }, 7000);
    };
  } catch (e) {
    console.warn('No se pudo inicializar EventSource SSE:', e);
  }
};

// Auto-iniciar SSE al cargar la aplicación
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initMultiDeviceSse();
  }, 1000);
}


