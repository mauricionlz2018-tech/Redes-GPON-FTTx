import { NapBox, OdfPanel, FiberRoute, EmpalmeClosure } from '../types';
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

export { realOdf, realNaps, realFiberRoutes, realEmpalmes };


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
