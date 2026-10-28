import JSZip from 'jszip';
import { FiberRoute, EmpalmeClosure, GasaReserva, PosteInfraestructura, NapBox } from '../types';

export interface ParsedKmzItem {
  id: string;
  nombre: string;
  tipo: 'troncal' | 'ramal' | 'mufa' | 'poste_cfe' | 'poste_propuesto' | 'gasa' | 'nap';
  categoria: 'ruta' | 'punto';
  coordenadas: [number, number][] | { lat: number; lng: number };
  distanciaKm?: number;
  distanciaMetros?: number;
  detalles?: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
  selected: boolean;
}

export interface ParsedKmzResult {
  filename: string;
  items: ParsedKmzItem[];
  totalRoutes: number;
  totalPoints: number;
}

// Calcular distancia geodésica entre dos puntos (Haversine)
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
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

function calculateRouteDistance(points: [number, number][]): { km: number; metros: number } {
  let meters = 0;
  for (let i = 0; i < points.length - 1; i++) {
    meters += haversineMeters(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
  }
  return {
    metros: Math.round(meters),
    km: Number((meters / 1000).toFixed(2))
  };
}

/**
 * Parsea un archivo .kmz o .kml y extrae todos los elementos con detección de duplicados
 */
export async function parseKmzOrKmlFile(
  file: File,
  existingRoutes: FiberRoute[] = [],
  existingEmpalmes: EmpalmeClosure[] = [],
  existingPostes: PosteInfraestructura[] = []
): Promise<ParsedKmzResult> {
  let kmlText = '';

  const isKmz = file.name.toLowerCase().endsWith('.kmz');

  if (isKmz) {
    const zip = await JSZip.loadAsync(file);
    // Buscar archivo .kml dentro del ZIP
    let kmlFileInZip: JSZip.JSZipObject | null = null;
    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.toLowerCase().endsWith('.kml') && !kmlFileInZip) {
        kmlFileInZip = zipEntry;
      }
    });

    if (!kmlFileInZip) {
      throw new Error('El archivo KMZ no contiene ningún archivo KML válido en su interior.');
    }

    kmlText = await (kmlFileInZip as any).async('text');
  } else {
    kmlText = await file.text();
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, 'text/xml');

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Error al interpretar el contenido XML del archivo KML.');
  }

  const placemarks = xmlDoc.querySelectorAll('Placemark');
  const items: ParsedKmzItem[] = [];

  const existingRouteNames = new Set(
    existingRoutes.map((r) => (r.nombre || '').toLowerCase().trim())
  );
  const existingMufaNames = new Set(
    existingEmpalmes.map((m) => (m.nombre || '').toLowerCase().trim())
  );

  let routeCounter = 0;
  let pointCounter = 0;

  placemarks.forEach((pm, index) => {
    const nameEl = pm.querySelector('name');
    const descEl = pm.querySelector('description');
    const rawName = nameEl?.textContent?.trim() || `Elemento ${index + 1}`;
    const descText = descEl?.textContent?.trim() || '';

    // 1. Verificar si es una línea / ruta (LineString)
    const lineString = pm.querySelector('LineString');
    if (lineString) {
      const coordEl = lineString.querySelector('coordinates');
      if (coordEl && coordEl.textContent) {
        const rawCoords = coordEl.textContent.trim().split(/\s+/);
        const points: [number, number][] = [];

        rawCoords.forEach((pair) => {
          const parts = pair.split(',');
          if (parts.length >= 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              points.push([lat, lng]);
            }
          }
        });

        if (points.length >= 2) {
          const dist = calculateRouteDistance(points);
          const isDup = existingRouteNames.has(rawName.toLowerCase());
          routeCounter++;

          items.push({
            id: `kmz-route-${Date.now()}-${index}`,
            nombre: rawName,
            tipo: rawName.toLowerCase().includes('ramal') ? 'ramal' : 'troncal',
            categoria: 'ruta',
            coordenadas: points,
            distanciaKm: dist.km,
            distanciaMetros: dist.metros,
            detalles: `${points.length} vértices geodésicos • ${dist.km} km`,
            isDuplicate: isDup,
            duplicateReason: isDup ? 'Ya existe una ruta con este nombre en la red' : undefined,
            selected: !isDup // Seleccionar por defecto solo si no es duplicado
          });
        }
      }
      return;
    }

    // 2. Verificar si es un punto (Point): Mufa, Poste, Gasa, NAP
    const pointEl = pm.querySelector('Point');
    if (pointEl) {
      const coordEl = pointEl.querySelector('coordinates');
      if (coordEl && coordEl.textContent) {
        const parts = coordEl.textContent.trim().split(',');
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            pointCounter++;
            const lowerName = rawName.toLowerCase();
            let detectedType: ParsedKmzItem['tipo'] = 'poste_propuesto';

            if (lowerName.includes('mufa') || lowerName.includes('cierre') || lowerName.includes('torpedo')) {
              detectedType = 'mufa';
            } else if (lowerName.includes('nap') || lowerName.includes('caja')) {
              detectedType = 'nap';
            } else if (lowerName.includes('gasa') || lowerName.includes('reserva')) {
              detectedType = 'gasa';
            } else if (lowerName.includes('cfe') || lowerName.includes('poste cfe')) {
              detectedType = 'poste_cfe';
            }

            const isDup =
              detectedType === 'mufa' && existingMufaNames.has(lowerName);

            items.push({
              id: `kmz-point-${Date.now()}-${index}`,
              nombre: rawName,
              tipo: detectedType,
              categoria: 'punto',
              coordenadas: { lat, lng },
              detalles: `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              isDuplicate: isDup,
              duplicateReason: isDup ? 'Ya existe este elemento en la red' : undefined,
              selected: !isDup
            });
          }
        }
      }
    }
  });

  return {
    filename: file.name,
    items,
    totalRoutes: routeCounter,
    totalPoints: pointCounter
  };
}

