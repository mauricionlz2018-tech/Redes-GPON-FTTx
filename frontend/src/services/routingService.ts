export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  modifier?: string;
  type?: string;
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng] para Leaflet
  distanceMeters: number;
  durationSeconds: number;
  summary: string;
  steps: RouteStep[];
  isFallback?: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Traduce las maniobras técnicas de OSRM a indicaciones legibles en español (sin emojis).
 */
function translateManeuver(type: string, modifier?: string, streetName?: string): string {
  const road = streetName && streetName.trim().length > 0 ? streetName.trim() : 'la vía';

  switch (type) {
    case 'depart':
      return `Iniciar recorrido por ${road}`;
    case 'arrive':
      return `Llegada al destino en ${road}`;
    case 'turn':
      if (modifier === 'left') return `Girar a la izquierda en ${road}`;
      if (modifier === 'right') return `Girar a la derecha en ${road}`;
      if (modifier === 'slight left') return `Girar ligeramente a la izquierda hacia ${road}`;
      if (modifier === 'slight right') return `Girar ligeramente a la derecha hacia ${road}`;
      if (modifier === 'sharp left') return `Giro pronunciado a la izquierda hacia ${road}`;
      if (modifier === 'sharp right') return `Giro pronunciado a la derecha hacia ${road}`;
      if (modifier === 'uturn') return `Dar vuelta en U en ${road}`;
      return `Girar hacia ${road}`;
    case 'new name':
    case 'continue':
      return `Continuar recto por ${road}`;
    case 'roundabout':
    case 'rotary':
      return `Ingresar a la glorieta y salir hacia ${road}`;
    case 'fork':
      return `Mantenerse en la bifurcación hacia ${road}`;
    case 'merge':
      return `Incorporarse a ${road}`;
    case 'end of road':
      return `Al final de la calle, girar hacia ${road}`;
    default:
      if (modifier === 'left') return `Girar a la izquierda en ${road}`;
      if (modifier === 'right') return `Girar a la derecha en ${road}`;
      return `Continuar por ${road}`;
  }
}

/**
 * Calcula la distancia aproximada en línea recta usando la fórmula de Haversine (para fallback offline)
 */
function calculateHaversineDistance(c1: Coordinates, c2: Coordinates): number {
  const R = 6371e3; // Radio terrestre en metros
  const rad = Math.PI / 180;
  const lat1 = c1.lat * rad;
  const lat2 = c2.lat * rad;
  const deltaLat = (c2.lat - c1.lat) * rad;
  const deltaLng = (c2.lng - c1.lng) * rad;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Consulta el servidor público de OSRM para obtener la ruta de conducción real.
 * Si no hay conexión a internet o el servicio no responde, utiliza un fallback en línea recta.
 */
export async function fetchDrivingRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No se encontró una ruta vial disponible');
    }

    const primaryRoute = data.routes[0];
    // Coordenadas vienen en formato GeoJSON [lng, lat], Leaflet requiere [lat, lng]
    const leafletCoordinates: [number, number][] = primaryRoute.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    const steps: RouteStep[] = [];
    if (primaryRoute.legs && primaryRoute.legs.length > 0) {
      for (const leg of primaryRoute.legs) {
        if (leg.steps) {
          for (const s of leg.steps) {
            const instruction = translateManeuver(
              s.maneuver?.type || '',
              s.maneuver?.modifier,
              s.name
            );
            steps.push({
              instruction,
              distanceMeters: Math.round(s.distance || 0),
              durationSeconds: Math.round(s.duration || 0),
              modifier: s.maneuver?.modifier,
              type: s.maneuver?.type
            });
          }
        }
      }
    }

    return {
      coordinates: leafletCoordinates,
      distanceMeters: Math.round(primaryRoute.distance),
      durationSeconds: Math.round(primaryRoute.duration),
      summary: primaryRoute.legs?.[0]?.summary || 'Ruta calculada por vialidades locales',
      steps,
      isFallback: false
    };
  } catch (error) {
    console.warn('Fallo al obtener ruta OSRM, aplicando fallback en línea recta:', error);

    const fallbackDist = calculateHaversineDistance(origin, destination);
    // Estimación a 30 km/h en ciudad = ~8.33 m/s
    const fallbackDuration = Math.round(fallbackDist / 8.33);

    return {
      coordinates: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ],
      distanceMeters: fallbackDist,
      durationSeconds: fallbackDuration,
      summary: 'Trayecto estimado en línea recta (Modo local / sin red)',
      steps: [
        {
          instruction: 'Partir desde el origen hacia las coordenadas de la caja',
          distanceMeters: fallbackDist,
          durationSeconds: fallbackDuration
        },
        {
          instruction: 'Llegada a la ubicación de la caja NAP',
          distanceMeters: 0,
          durationSeconds: 0
        }
      ],
      isFallback: true
    };
  }
}

/**
 * Formatea distancia en metros o kilómetros
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formatea duración en minutos u horas
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) {
    return 'Menos de 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Enlace directo para abrir navegación en Google Maps
 */
export function getGoogleMapsUrl(origin: Coordinates, destination: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
}

/**
 * Enlace directo para abrir destino en Waze
 */
export function getWazeUrl(destination: Coordinates): string {
  return `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
}

