import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineDb } from '../db/offlineDb';
import api from '../api/client';

interface NetworkContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
  enqueueAssignment: (payload: any) => Promise<void>;
  enqueueGpsUpdate: (id_nap: string, lat: number, lng: number) => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Actualizar contador de cambios locales pendientes en IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await offlineDb.pending_mutations.count();
      setPendingCount(count);
    } catch (e) {
      console.error('Error leyendo Dexie IndexedDB', e);
    }
  }, []);

  // Sincronizar cola de mutaciones con el backend
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      setIsSyncing(true);
      const mutations = await offlineDb.pending_mutations.toArray();

      for (const item of mutations) {
        try {
          if (item.tipo === 'ASIGNAR_PUERTO') {
            await api.post('/puertos/asignar', item.payload);
          } else if (item.tipo === 'ACTUALIZAR_GPS') {
            await api.patch(`/naps/${item.id_nap}/gps`, item.payload);
          }
          // Si tuvo éxito, eliminar de la cola local
          if (item.id) {
            await offlineDb.pending_mutations.delete(item.id);
          }
        } catch (err: any) {
          console.error(`Error sincronizando item #${item.id}:`, err);
          // Si fue error de conflicto (409) o validación (400), registrar intento
          if (item.id) {
            await offlineDb.pending_mutations.update(item.id, {
              intentos: (item.intentos || 0) + 1
            });
          }
        }
      }
    } finally {
      setIsSyncing(false);
      await refreshPendingCount();
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Al reconectar a internet, sincronizar automáticamente la cola
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow, refreshPendingCount]);

  // Encolar asignación de puerto cuando se esté sin red
  const enqueueAssignment = async (payload: any) => {
    await offlineDb.pending_mutations.add({
      tipo: 'ASIGNAR_PUERTO',
      payload,
      fechaCreacion: new Date().toISOString(),
      intentos: 0
    });
    await refreshPendingCount();
  };

  // Encolar actualización GPS cuando se esté sin red
  const enqueueGpsUpdate = async (id_nap: string, lat: number, lng: number) => {
    await offlineDb.pending_mutations.add({
      tipo: 'ACTUALIZAR_GPS',
      id_nap,
      payload: { lat, lng },
      fechaCreacion: new Date().toISOString(),
      intentos: 0
    });
    await refreshPendingCount();
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        syncNow,
        enqueueAssignment,
        enqueueGpsUpdate
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork debe usarse dentro de un NetworkProvider');
  }
  return context;
};

