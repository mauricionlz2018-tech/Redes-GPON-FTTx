/**
 * Utilidades para serialización segura y limpieza de referencias circulares.
 * En GPON, las cajas NAP contienen puertos, y los puertos contienen clientes,
 * cuyos clientes a su vez referencian el puerto y la caja NAP original
 * (nap -> puertos[i] -> cliente -> puerto_nap -> caja_nap -> puertos...).
 * Esto produce TypeError: Converting circular structure to JSON si no se previene.
 */

/**
 * Serializador que detecta y reemplaza referencias circulares de forma segura.
 */
export const safeJsonStringify = (value: any, space?: number | string): string => {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            // Referencia circular detectada: cortar el ciclo
            if (val.id_nap && val.identificador) {
              return { id_nap: val.id_nap, identificador: val.identificador };
            }
            if (val.id_puerto) {
              return { id_puerto: val.id_puerto, indice_puerto: val.indice_puerto };
            }
            return undefined;
          }
          seen.add(val);
        }
        return val;
      },
      space
    );
  } catch (err) {
    console.warn('safeJsonStringify error fallback:', err);
    return '[]';
  }
};

/**
 * Limpia recursivamente una caja NAP para asegurar que no posea referencias
 * circulares en sus puertos o clientes vinculados.
 */
export const sanitizeNap = <T extends Record<string, any>>(nap: T): T => {
  if (!nap || typeof nap !== 'object') return nap;

  const cleanNap: any = { ...nap };

  if (Array.isArray(cleanNap.puertos)) {
    cleanNap.puertos = cleanNap.puertos.map((port: any) => {
      if (!port || typeof port !== 'object') return port;
      const cleanPort: any = { ...port };

      // Eliminar referencia circular directa de puerto a caja si existe
      if (cleanPort.caja_nap) {
        delete cleanPort.caja_nap;
      }

      if (cleanPort.cliente && typeof cleanPort.cliente === 'object') {
        const cleanClient: any = { ...cleanPort.cliente };
        // Eliminar ciclo en cliente -> puerto_nap -> caja_nap
        if (cleanClient.puerto_nap && typeof cleanClient.puerto_nap === 'object') {
          cleanClient.puerto_nap = {
            id_puerto: cleanClient.puerto_nap.id_puerto || cleanPort.id_puerto,
            indice_puerto: cleanClient.puerto_nap.indice_puerto || cleanPort.indice_puerto,
            id_nap: cleanNap.id_nap
          };
        }
        cleanPort.cliente = cleanClient;
      }

      return cleanPort;
    });
  }

  return cleanNap as T;
};

/**
 * Sanitiza un array de cajas NAP.
 */
export const sanitizeNaps = <T extends Record<string, any>>(naps: T[]): T[] => {
  if (!Array.isArray(naps)) return [];
  return naps.map(sanitizeNap);
};
