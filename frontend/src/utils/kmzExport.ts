import JSZip from 'jszip';
import { NapBox, OdfPanel, FiberRoute, EmpalmeClosure, GasaReserva, PosteInfraestructura } from '../types';

/**
 * Convierte un color hex (#RRGGBB) a formato KML (AABBGGRR)
 */
function hexToKmlColor(hex: string, alpha = 'ff'): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 6) {
    const r = clean.substring(0, 2);
    const g = clean.substring(2, 4);
    const b = clean.substring(4, 6);
    return `${alpha}${b}${g}${r}`.toLowerCase();
  }
  return `${alpha}ffffff`;
}

/**
 * Escapa caracteres especiales para XML/KML
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface KmzExportOptions {
  naps: NapBox[];
  odf?: OdfPanel | null;
  fiberRoutes: FiberRoute[];
  empalmes: EmpalmeClosure[];
  gasas?: GasaReserva[];
  postesPropuestos?: PosteInfraestructura[];
  postesCfe?: PosteInfraestructura[];
  filename?: string;
}

/**
 * Genera el documento KML estándar con toda la red GPON
 */
export function generateGponKml(options: KmzExportOptions): string {
  const {
    naps,
    odf,
    fiberRoutes,
    empalmes,
    gasas = [],
    postesPropuestos = [],
    postesCfe = []
  } = options;

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Red GPON - GPON TELECOM S.A. DE C.V.</name>
    <description>Mapeo e Inventario Lógico de Planta Externa - San José del Rincón, Estado de México</description>

    <!-- Estilos de Cajas NAP según Saturación -->
    <Style id="nap-disponible">
      <IconStyle>
        <color>ff00e676</color>
        <scale>1.1</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.85</scale></LabelStyle>
    </Style>

    <Style id="nap-alerta">
      <IconStyle>
        <color>ff00d0ff</color>
        <scale>1.1</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.85</scale></LabelStyle>
    </Style>

    <Style id="nap-saturada">
      <IconStyle>
        <color>ff3333ff</color>
        <scale>1.1</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.85</scale></LabelStyle>
    </Style>

    <!-- Estilo ODF / Central -->
    <Style id="odf-central">
      <IconStyle>
        <color>ff0284c7</color>
        <scale>1.3</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.9</scale></LabelStyle>
    </Style>

    <!-- Estilo Mufa Torpedo -->
    <Style id="mufa-torpedo">
      <IconStyle>
        <color>ff00aaff</color>
        <scale>0.9</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/donut.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>

    <!-- Estilo Gasa de Reserva -->
    <Style id="gasa-reserva">
      <IconStyle>
        <color>ffffaa00</color>
        <scale>0.8</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.75</scale></LabelStyle>
    </Style>

    <!-- Estilo Postes -->
    <Style id="poste-propuesto">
      <IconStyle>
        <color>ffa855f7</color>
        <scale>0.7</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/square.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.7</scale></LabelStyle>
    </Style>

    <Style id="poste-cfe">
      <IconStyle>
        <color>ff64748b</color>
        <scale>0.6</scale>
        <Icon><href>https://maps.google.com/mapfiles/kml/shapes/triangle.png</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.65</scale></LabelStyle>
    </Style>
`;

  // 1. Central ODF / OLT
  if (odf && odf.coordenadas_gps) {
    kml += `
    <Folder>
      <name>Central ODF / OLT</name>
      <Placemark>
        <name>${escapeXml(odf.nombre)}</name>
        <styleUrl>#odf-central</styleUrl>
        <description><![CDATA[
          <h3>${escapeXml(odf.nombre)}</h3>
          <p><b>Ubicación:</b> ${escapeXml(odf.ubicacion_central)}</p>
          <p><b>Capacidad Troncal:</b> ${odf.capacidad_hilos} hilos ópticos</p>
          <p><b>Coordenadas:</b> ${odf.coordenadas_gps.lat.toFixed(6)}, ${odf.coordenadas_gps.lng.toFixed(6)}</p>
        ]]></description>
        <Point>
          <coordinates>${odf.coordenadas_gps.lng},${odf.coordenadas_gps.lat},0</coordinates>
        </Point>
      </Placemark>
    </Folder>
`;
  }

  // 2. Cajas NAP (Terminales Ópticas 1:16)
  kml += `
    <Folder>
      <name>Cajas NAP (Splitters 1:16)</name>
`;
  for (const nap of naps) {
    if (!nap.coordenadas_gps) continue;
    const metricas = nap.metricas;
    const ocupados = metricas ? metricas.ocupados : 0;
    const libres = metricas ? metricas.libres : nap.total_puertos;
    const sat = metricas ? metricas.porcentajeSaturacion : 0;

    let style = '#nap-disponible';
    if (sat >= 100) style = '#nap-saturada';
    else if (sat >= 80) style = '#nap-alerta';

    kml += `      <Placemark>
        <name>${escapeXml(nap.identificador)}</name>
        <styleUrl>${style}</styleUrl>
        <description><![CDATA[
          <h3>Caja ${escapeXml(nap.identificador)}</h3>
          <p><b>Zona:</b> ${escapeXml(nap.zona || 'San José del Rincón')}</p>
          <p><b>Dirección / Ref:</b> ${escapeXml(nap.direccion_texto || 'Poste de distribución')}</p>
          <p><b>Capacidad Total:</b> ${nap.total_puertos} Puertos</p>
          <p><b>Puertos Ocupados:</b> ${ocupados}</p>
          <p><b>Puertos Libres:</b> ${libres}</p>
          <p><b>Saturación:</b> ${sat}%</p>
          <p><b>Coordenadas:</b> ${nap.coordenadas_gps.lat.toFixed(6)}, ${nap.coordenadas_gps.lng.toFixed(6)}</p>
        ]]></description>
        <Point>
          <coordinates>${nap.coordenadas_gps.lng},${nap.coordenadas_gps.lat},0</coordinates>
        </Point>
      </Placemark>
`;
  }
  kml += `    </Folder>
`;

  // 3. Líneas de Fibra Óptica (Troncales y Ramales)
  kml += `
    <Folder>
      <name>Líneas de Fibra Óptica (Troncales y Ramales)</name>
`;
  for (let i = 0; i < fiberRoutes.length; i++) {
    const route = fiberRoutes[i];
    if (!route.coordenadas || route.coordenadas.length < 2) continue;

    const styleId = `route-style-${i}`;
    const kmlColor = hexToKmlColor(route.color || '#9333ea', 'ff');
    const width = route.grosor || 4;

    const coordsStr = route.coordenadas
      .map(([lat, lng]) => `${lng},${lat},0`)
      .join(' ');

    kml += `      <Style id="${styleId}">
        <LineStyle>
          <color>${kmlColor}</color>
          <width>${width}</width>
        </LineStyle>
      </Style>
      <Placemark>
        <name>${escapeXml(route.nombre)}</name>
        <styleUrl>#${styleId}</styleUrl>
        <description><![CDATA[
          <h3>${escapeXml(route.nombre)}</h3>
          <p><b>Tipo:</b> ${escapeXml(route.subtipo || route.tipo || 'Línea Troncal')}</p>
          <p><b>Hilos:</b> ${route.hilos || 12} FO</p>
          <p><b>Distancia estimada:</b> ${(route.distancia_km || 0).toFixed(2)} km (${(route.distancia_metros || 0).toFixed(0)} m)</p>
          <p><b>Vértices geodésicos:</b> ${route.coordenadas.length}</p>
        ]]></description>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>${coordsStr}</coordinates>
        </LineString>
      </Placemark>
`;
  }
  kml += `    </Folder>
`;

  // 4. Mufas de Empalme (Cierres Torpedo)
  if (empalmes.length > 0) {
    kml += `
    <Folder>
      <name>Mufas y Cierres de Empalme</name>
`;
    for (const mufa of empalmes) {
      if (!mufa.coordenadas_gps) continue;
      kml += `      <Placemark>
        <name>${escapeXml(mufa.nombre)}</name>
        <styleUrl>#mufa-torpedo</styleUrl>
        <description><![CDATA[
          <h3>${escapeXml(mufa.nombre)}</h3>
          <p><b>Tipo de Cierre:</b> ${escapeXml(mufa.tipo_cierre || 'Torpedo de Fusión')}</p>
          <p><b>Capacidad:</b> ${mufa.capacidad_hilos || 24} hilos</p>
          <p><b>Coordenadas:</b> ${mufa.coordenadas_gps.lat.toFixed(6)}, ${mufa.coordenadas_gps.lng.toFixed(6)}</p>
        ]]></description>
        <Point>
          <coordinates>${mufa.coordenadas_gps.lng},${mufa.coordenadas_gps.lat},0</coordinates>
        </Point>
      </Placemark>
`;
    }
    kml += `    </Folder>
`;
  }

  // 5. Gasas de Reserva Técnica
  if (gasas.length > 0) {
    kml += `
    <Folder>
      <name>Gasas de Reserva Técnica</name>
`;
    for (const gasa of gasas) {
      if (!gasa.coordenadas_gps) continue;
      const metros = gasa.metros_reserva || gasa.longitud_metros || 15;
      kml += `      <Placemark>
        <name>${escapeXml(gasa.nombre)}</name>
        <styleUrl>#gasa-reserva</styleUrl>
        <description><![CDATA[
          <h3>${escapeXml(gasa.nombre)}</h3>
          <p><b>Metraje de Reserva:</b> ${metros} metros</p>
          <p><b>Tipo de Cable:</b> ${escapeXml(gasa.tipo_cable || 'Dieléctrico ADSS')}</p>
          <p><b>Coordenadas:</b> ${gasa.coordenadas_gps.lat.toFixed(6)}, ${gasa.coordenadas_gps.lng.toFixed(6)}</p>
        ]]></description>
        <Point>
          <coordinates>${gasa.coordenadas_gps.lng},${gasa.coordenadas_gps.lat},0</coordinates>
        </Point>
      </Placemark>
`;
    }
    kml += `    </Folder>
`;
  }

  // 6. Postes Propuestos
  if (postesPropuestos.length > 0) {
    kml += `
    <Folder>
      <name>Postes Propuestos para Despliegue</name>
`;
    for (const poste of postesPropuestos) {
      if (!poste.coordenadas_gps) continue;
      kml += `      <Placemark>
        <name>${escapeXml(poste.nombre || poste.codigo || 'Poste Propuesto')}</name>
        <styleUrl>#poste-propuesto</styleUrl>
        <description><![CDATA[
          <h3>Poste Propuesto</h3>
          <p><b>Código:</b> ${escapeXml(poste.codigo || poste.nombre)}</p>
          <p><b>Coordenadas:</b> ${poste.coordenadas_gps.lat.toFixed(6)}, ${poste.coordenadas_gps.lng.toFixed(6)}</p>
        ]]></description>
        <Point>
          <coordinates>${poste.coordenadas_gps.lng},${poste.coordenadas_gps.lat},0</coordinates>
        </Point>
      </Placemark>
`;
    }
    kml += `    </Folder>
`;
  }

  // 7. Postes CFE
  if (postesCfe.length > 0) {
    kml += `
    <Folder>
      <name>Postes CFE Existentes</name>
`;
    for (const poste of postesCfe) {
      if (!poste.coordenadas_gps) continue;
      kml += `      <Placemark>
        <name>${escapeXml(poste.nombre || poste.codigo || 'Poste CFE')}</name>
        <styleUrl>#poste-cfe</styleUrl>
        <description><![CDATA[
          <h3>Poste CFE</h3>
          <p><b>Código CFE:</b> ${escapeXml(poste.codigo || poste.nombre)}</p>
          <p><b>Coordenadas:</b> ${poste.coordenadas_gps.lat.toFixed(6)}, ${poste.coordenadas_gps.lng.toFixed(6)}</p>
        ]]></description>
        <Point>
          <coordinates>${poste.coordenadas_gps.lng},${poste.coordenadas_gps.lat},0</coordinates>
        </Point>
      </Placemark>
`;
    }
    kml += `    </Folder>
`;
  }

  kml += `  </Document>
</kml>`;

  return kml;
}

/**
 * Empaqueta el KML en un archivo comprimido .kmz y lo descarga en el navegador
 */
export async function exportGponNetworkToKmz(options: KmzExportOptions): Promise<void> {
  const kmlContent = generateGponKml(options);
  const zip = new JSZip();

  // El estándar KMZ requiere el KML principal como 'doc.kml' en la raíz
  zip.file('doc.kml', kmlContent);

  const kmzBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const rawFilename = options.filename || 'Red_GPON_San_Jose_del_Rincon.kmz';
  const finalFilename = rawFilename.endsWith('.kmz') ? rawFilename : `${rawFilename}.kmz`;

  // Descarga automática en el navegador
  const url = URL.createObjectURL(kmzBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
