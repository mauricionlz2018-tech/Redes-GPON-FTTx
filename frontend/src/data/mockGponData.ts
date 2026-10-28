import { NapBox, OdfPanel, FiberRoute, EmpalmeClosure, BrazoExtension } from '../types';
import { realOdf, realNaps, realFiberRoutes, realEmpalmes } from './realGponKmzData';
import {
  troncalIxtJocRoutes,
  troncalMufas,
  troncalGasas,
  troncalPostesCfe,
  troncalPostesPropuestos,
  getTroncalDesignMetrics
} from './troncalIxtJocData';

export const mockOdf: OdfPanel = realOdf;
export const mockNaps: NapBox[] = realNaps;
export const mockFiberRoutes: FiberRoute[] = realFiberRoutes;
export const mockEmpalmes: EmpalmeClosure[] = realEmpalmes;

export const mockBrazosExtension: BrazoExtension[] = realNaps.map((nap, index) => ({
  id_brazo: `brazo-${nap.identificador.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  codigo: `BR-${String(index + 1).padStart(2, '0')}`,
  nombre: `Brazo de Extensión ${nap.identificador}`,
  longitud_metros: index % 2 === 0 ? 1.2 : 1.5,
  tipo: 'brazo_extension_nap',
  material: 'Acero Galvanizado por Inmersión (Norma CFE)',
  id_nap_asociada: nap.id_nap,
  id_poste_asociado: `POSTE-${nap.identificador}`,
  coordenadas_gps: {
    lat: nap.coordenadas_gps?.lat || 19.704,
    lng: nap.coordenadas_gps?.lng || -100.100
  },
  estado: 'instalado',
  descripcion: `Herraje de montaje en poste para soporte y despeje de acometida para ${nap.identificador}`
}));

export {
  realOdf,
  realNaps,
  realFiberRoutes,
  realEmpalmes,
  troncalIxtJocRoutes,
  troncalMufas,
  troncalGasas,
  troncalPostesCfe,
  troncalPostesPropuestos,
  getTroncalDesignMetrics
};
