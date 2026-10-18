import { FiberRoute } from '../types';

/**
 * Cálculo geodésico de alta precisión (Haversine) entre dos coordenadas GPS (WGS84).
 */
export function calculateGpsDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio medio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Obtiene la distancia exacta calculada de un tramo de fibra óptica.
 */
export function getRouteDistance(route: FiberRoute): { metros: number; km: number } {
  const coords = route.coordenadas;
  if (!coords || coords.length < 2) {
    if (route.distancia_metros) {
      return {
        metros: Math.round(route.distancia_metros),
        km: Number((route.distancia_metros / 1000).toFixed(2))
      };
    }
    return { metros: 0, km: 0 };
  }

  let totalMeters = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const pt1 = coords[i];
    const pt2 = coords[i + 1];
    if (
      Array.isArray(pt1) &&
      Array.isArray(pt2) &&
      typeof pt1[0] === 'number' &&
      typeof pt1[1] === 'number' &&
      typeof pt2[0] === 'number' &&
      typeof pt2[1] === 'number' &&
      !isNaN(pt1[0]) &&
      !isNaN(pt1[1]) &&
      !isNaN(pt2[0]) &&
      !isNaN(pt2[1])
    ) {
      totalMeters += calculateGpsDistanceMeters(pt1[0], pt1[1], pt2[0], pt2[1]);
    }
  }

  return {
    metros: Math.round(totalMeters),
    km: Number((totalMeters / 1000).toFixed(2))
  };
}

/**
 * Especificación de Atenuación Teórica de Splitters PLC comerciales (ITU-T G.671).
 */
export const SPLITTER_PLC_LOSS_DB: Record<string, number> = {
  'directo': 0,
  '1:2': 3.6,
  '1:4': 7.2,
  '1:8': 10.5,
  '1:16': 13.8,
  '1:32': 17.1,
  '1:64': 20.5
};

export interface OpticalBudgetCalculation {
  distanciaKm: number;
  perdidaFibraDb: number;
  perdidaFusionesDb: number;
  perdidaConectoresDb: number;
  perdidaSplittersDb: number;
  atenuacionTotalTeoricaDb: number;
  potenciaTxEstimadaDbm: number;
  potenciaRxEsperadaDbm: number;
  sensibilidadMinimaDbm: number;
  margenOperativoDb: number;
  estadoEnlace: 'Optimo' | 'Aceptable' | 'Critico' | 'FueraDeRango';
}

/**
 * Calcula el Presupuesto Óptico (Optical Power Budget) teórico para un tramo FTTx.
 * Fórmula ITU-T G.984.2:
 * Atenuación Total = (L * α_fibra) + (N_f * α_fusión) + (N_c * α_conector) + Loss_Splitter1 + Loss_Splitter2
 */
export function calculateOpticalPowerBudget(params: {
  distanciaKm: number;
  splitter1Ratio?: '1:2' | '1:4' | '1:8' | 'directo';
  splitter2Ratio?: '1:8' | '1:16' | '1:32' | 'directo';
  numFusiones?: number;
  numConectores?: number;
  potenciaTxDbm?: number;
  longitudOnda?: '1310' | '1490';
}): OpticalBudgetCalculation {
  const {
    distanciaKm,
    splitter1Ratio = '1:8',
    splitter2Ratio = '1:16',
    numFusiones = 4, // Típico: Salida ODF, Mufa 1, Mufa 2, Entrada NAP
    numConectores = 4, // OLT SFP+, ODF front, NAP input, ONT SC/APC
    potenciaTxDbm = 3.5, // Emisor OLT SFP Clase B+ típico (+1.5 a +5 dBm)
    longitudOnda = '1490'
  } = params;

  // Coeficiente de atenuación según ITU-T G.652D
  const alphaFibra = longitudOnda === '1310' ? 0.35 : 0.25; // dB/km
  const perdidaFibraDb = Number((distanciaKm * alphaFibra).toFixed(2));

  // Pérdida por fusión de arco (0.1 dB por empalme térmico)
  const perdidaFusionesDb = Number((numFusiones * 0.1).toFixed(2));

  // Pérdida por conector SC/APC (0.35 dB por unión)
  const perdidaConectoresDb = Number((numConectores * 0.35).toFixed(2));

  // Pérdida por splitters de primer y segundo nivel
  const lossSp1 = SPLITTER_PLC_LOSS_DB[splitter1Ratio] || 10.5;
  const lossSp2 = SPLITTER_PLC_LOSS_DB[splitter2Ratio] || 13.8;
  const perdidaSplittersDb = Number((lossSp1 + lossSp2).toFixed(2));

  const atenuacionTotalTeoricaDb = Number(
    (perdidaFibraDb + perdidaFusionesDb + perdidaConectoresDb + perdidaSplittersDb).toFixed(2)
  );

  const potenciaRxEsperadaDbm = Number((potenciaTxDbm - atenuacionTotalTeoricaDb).toFixed(2));
  const sensibilidadMinimaDbm = -27.0; // Umbral de sobrecarga/desconexión ONT típica
  const margenOperativoDb = Number((potenciaRxEsperadaDbm - sensibilidadMinimaDbm).toFixed(2));

  let estadoEnlace: 'Optimo' | 'Aceptable' | 'Critico' | 'FueraDeRango' = 'Optimo';
  if (potenciaRxEsperadaDbm >= -22.0 && potenciaRxEsperadaDbm <= -14.0) {
    estadoEnlace = 'Optimo';
  } else if (potenciaRxEsperadaDbm > -25.0 && potenciaRxEsperadaDbm < -22.0) {
    estadoEnlace = 'Aceptable';
  } else if (potenciaRxEsperadaDbm >= -27.0 && potenciaRxEsperadaDbm <= -25.0) {
    estadoEnlace = 'Critico';
  } else {
    estadoEnlace = 'FueraDeRango';
  }

  return {
    distanciaKm,
    perdidaFibraDb,
    perdidaFusionesDb,
    perdidaConectoresDb,
    perdidaSplittersDb,
    atenuacionTotalTeoricaDb,
    potenciaTxEstimadaDbm: potenciaTxDbm,
    potenciaRxEsperadaDbm,
    sensibilidadMinimaDbm,
    margenOperativoDb,
    estadoEnlace
  };
}

