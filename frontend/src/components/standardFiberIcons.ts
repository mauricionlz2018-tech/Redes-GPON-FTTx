import L from 'leaflet';
import { NapBox, EmpalmeClosure, GasaReserva } from '../types';

/**
 * Paleta de colores estándar para ingeniería de planta externa FTTx
 * Basada en la norma de diseño y simbología de red de fibra óptica.
 */
export const FIBER_DESIGN_COLORS = {
  // Código de Fibras y Rutas
  fibraDistribucion12H: '#00e5ff', // Celeste / Cyan
  fibraTroncal12H: '#e0009c',      // Magenta / Fucsia
  fibraTroncal48H: '#8d5b4c',      // Café / Marrón
  fibraTroncal96H: '#4a148c',      // Púrpura oscuro
  fibra24H: '#ff7043',             // Naranja
  
  // Elementos de Red
  divisorTroncal: '#1e88e5',       // Azul
  divisorNap: '#d81b60',           // Magenta intenso
  mufaTorpedo: '#0284c7',          // Azul cian / cielo
  gasaReserva: '#2563eb',          // Azul zafiro
  postePropuesto: '#ef4444',       // Rojo intenso (#ff0000)
  posteCfe: '#64748b',             // Gris acero
  odfCentral: '#0284c7',           // Azul corporativo
  
  // Código de colores estándar de los 8 hilos (código TIA-598)
  fiberPins: [
    '#2563eb', // 1: Azul
    '#f97316', // 2: Naranja
    '#16a34a', // 3: Verde
    '#78350f', // 4: Café
    '#94a3b8', // 5: Gris
    '#ffffff', // 6: Blanco
    '#dc2626', // 7: Rojo
    '#0f172a'  // 8: Negro
  ]
};

/**
 * 1. Divisor Óptico 1:8 Troncal
 */
export const createSplitterTroncalIcon = (label?: string) => {
  return L.divIcon({
    className: 'custom-splitter-troncal-icon',
    html: `
      <div class="relative flex items-center justify-center filter drop-shadow-md hover:scale-125 transition-transform cursor-pointer" title="Divisor Óptico 1:8 Troncal ${label || ''}">
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="26,2 6,14 26,26" fill="#1e88e5" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
          <line x1="2" y1="14" x2="6" y2="14" stroke="#ffffff" stroke-width="2" />
          <line x1="26" y1="4" x2="32" y2="4" stroke="#2563eb" stroke-width="1.5" />
          <line x1="26" y1="7" x2="32" y2="7" stroke="#f97316" stroke-width="1.5" />
          <line x1="26" y1="10" x2="32" y2="10" stroke="#16a34a" stroke-width="1.5" />
          <line x1="26" y1="13" x2="32" y2="13" stroke="#78350f" stroke-width="1.5" />
          <line x1="26" y1="15" x2="32" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="26" y1="18" x2="32" y2="18" stroke="#ffffff" stroke-width="1.5" />
          <line x1="26" y1="21" x2="32" y2="21" stroke="#dc2626" stroke-width="1.5" />
          <line x1="26" y1="24" x2="32" y2="24" stroke="#0f172a" stroke-width="1.5" />
        </svg>
        <span class="absolute -bottom-3 text-[9px] font-bold text-slate-800 bg-white/90 px-1 rounded shadow-xs border border-slate-200">1:8</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

/**
 * 2. Divisor Óptico 1:8 NAP
 */
export const createSplitterNapIcon = (label?: string) => {
  return L.divIcon({
    className: 'custom-splitter-nap-icon',
    html: `
      <div class="relative flex items-center justify-center filter drop-shadow-md hover:scale-125 transition-transform cursor-pointer" title="Divisor Óptico 1:8 NAP ${label || ''}">
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="26,2 6,14 26,26" fill="#d81b60" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
          <rect x="15" y="10" width="7" height="8" fill="#ffffff" stroke="#d81b60" stroke-width="1" rx="1" />
          <line x1="2" y1="14" x2="6" y2="14" stroke="#ffffff" stroke-width="2" />
          <line x1="26" y1="4" x2="32" y2="4" stroke="#2563eb" stroke-width="1.5" />
          <line x1="26" y1="7" x2="32" y2="7" stroke="#f97316" stroke-width="1.5" />
          <line x1="26" y1="10" x2="32" y2="10" stroke="#16a34a" stroke-width="1.5" />
          <line x1="26" y1="13" x2="32" y2="13" stroke="#78350f" stroke-width="1.5" />
          <line x1="26" y1="15" x2="32" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="26" y1="18" x2="32" y2="18" stroke="#ffffff" stroke-width="1.5" />
          <line x1="26" y1="21" x2="32" y2="21" stroke="#dc2626" stroke-width="1.5" />
          <line x1="26" y1="24" x2="32" y2="24" stroke="#0f172a" stroke-width="1.5" />
        </svg>
        <span class="absolute -bottom-3 text-[9px] font-bold text-pink-700 bg-white/90 px-1 rounded shadow-xs border border-pink-200">NAP</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

/**
 * 3. Caja NAP Normalizada con Semáforo Cromático (Con caché de instancia para fluidez a 60 FPS)
 */
const napIconCache = new Map<string, L.DivIcon>();

export const createNapStandardIcon = (nap: NapBox, isSelected: boolean, isRouteDestination: boolean) => {
  const metricas = nap.metricas;
  const pct = metricas ? metricas.porcentajeSaturacion : 0;

  // Semáforo cromático estándar
  let tier = 'green';
  let triColor = '#10b981'; // Verde (<80%)
  if (pct >= 100) {
    tier = 'red';
    triColor = '#ef4444'; // Rojo (100%)
  } else if (pct >= 80) {
    tier = 'amber';
    triColor = '#f59e0b'; // Ámbar (>=80%)
  }

  const cacheKey = `${tier}_${isSelected ? 1 : 0}_${isRouteDestination ? 1 : 0}`;
  const cached = napIconCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const ringStyle = isRouteDestination
    ? 'scale-150 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.9)] animate-bounce'
    : isSelected
    ? 'scale-135 filter drop-shadow-[0_0_8px_rgba(14,165,233,0.9)]'
    : 'filter drop-shadow-md hover:scale-125';

  const icon = L.divIcon({
    className: 'custom-standard-nap-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-all duration-200 ${ringStyle}">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="13,2 24,22 2,22" fill="${triColor}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />
          <rect x="10" y="12" width="6" height="6" rx="1" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });

  napIconCache.set(cacheKey, icon);
  return icon;
};

/**
 * 4. Cierre de Empalme / Mufa Torpedo (Con caché de instancia)
 */
const mufaIconCache = new Map<string, L.DivIcon>();

export const createMufaTorpedoIcon = (empalme?: EmpalmeClosure) => {
  const nombre = empalme?.nombre || 'MUFA';
  if (mufaIconCache.has(nombre)) {
    return mufaIconCache.get(nombre)!;
  }

  const icon = L.divIcon({
    className: 'custom-mufa-torpedo-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer hover:scale-125 transition-transform" title="Cierre de Empalme / Mufa Torpedo: ${nombre}">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="28" height="16" rx="8" fill="#0284c7" stroke="#ffffff" stroke-width="1.8" />
          <line x1="12" y1="4" x2="12" y2="20" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 1" />
          <line x1="24" y1="4" x2="24" y2="20" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 1" />
          <path d="M14 8 L22 16 M14 16 L22 8" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="2" cy="12" r="1.5" fill="#ffffff" />
          <circle cx="34" cy="12" r="1.5" fill="#ffffff" />
        </svg>
        <div class="text-[9px] font-bold text-slate-800 bg-sky-50 border border-sky-300 px-1 py-0.2 rounded shadow-xs -mt-0.5 whitespace-nowrap">
          ${nombre}
        </div>
      </div>
    `,
    iconSize: [40, 36],
    iconAnchor: [20, 18],
    popupAnchor: [0, -20]
  });

  mufaIconCache.set(nombre, icon);
  return icon;
};

/**
 * 5. Gasa / Reserva Técnica de Cable (Con caché de instancia)
 */
const gasaIconCache = new Map<string, L.DivIcon>();

export const createGasaReservaIcon = (gasa?: GasaReserva) => {
  const metraje = gasa?.longitud_metros ? `${gasa.longitud_metros}m` : gasa?.metros_reserva ? `${gasa.metros_reserva}m` : '30m';
  if (gasaIconCache.has(metraje)) {
    return gasaIconCache.get(metraje)!;
  }

  const icon = L.divIcon({
    className: 'custom-gasa-reserva-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer hover:scale-125 transition-transform" title="Gasa de Reserva Técnica: ${gasa?.nombre || metraje}">
        <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm leading-none">
          ∞
        </div>
        <div class="text-[9px] font-bold text-blue-900 bg-white border border-blue-300 px-1 rounded shadow-xs -mt-1 whitespace-nowrap">
          ${metraje}
        </div>
      </div>
    `,
    iconSize: [30, 36],
    iconAnchor: [15, 18],
    popupAnchor: [0, -20]
  });

  gasaIconCache.set(metraje, icon);
  return icon;
};

/**
 * 6. Poste Propuesto (Con caché de instancia)
 */
const postePropuestoIconCache = new Map<string, L.DivIcon>();

export const createPostePropuestoIcon = (codigo?: string) => {
  const key = codigo || 'default';
  if (!postePropuestoIconCache.has(key)) {
    postePropuestoIconCache.set(
      key,
      L.divIcon({
        className: 'custom-poste-propuesto-marker',
        html: `
          <div class="relative flex items-center justify-center p-1 cursor-pointer hover:scale-135 active:scale-95 transition-transform" title="Poste Propuesto ${codigo || ''}">
            <div class="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md ring-2 ring-red-500/80 flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      })
    );
  }
  return postePropuestoIconCache.get(key)!;
};

/**
 * 7. Poste CFE Existente (Con caché de instancia)
 */
const posteCfeIconCache = new Map<string, L.DivIcon>();

export const createPosteCfeIcon = (codigo?: string) => {
  const key = codigo || 'default';
  if (!posteCfeIconCache.has(key)) {
    posteCfeIconCache.set(
      key,
      L.divIcon({
        className: 'custom-poste-cfe-marker',
        html: `
          <div class="relative flex items-center justify-center p-1 cursor-pointer hover:scale-135 active:scale-95 transition-transform" title="Poste CFE Existente ${codigo || ''}">
            <div class="w-4 h-4 rounded-full bg-slate-700 border-2 border-white shadow-md ring-2 ring-slate-400/80 flex items-center justify-center text-[9px] text-white font-black leading-none">
              +
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      })
    );
  }
  return posteCfeIconCache.get(key)!;
};

/**
 * 8. ODF / Central Office (Cabecera, con caché de instancia)
 */
let odfIconSingleton: L.DivIcon | null = null;

export const createOdfStandardIcon = (_nombre?: string) => {
  if (!odfIconSingleton) {
    odfIconSingleton = L.divIcon({
      className: 'custom-odf-marker',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-600 to-blue-700 border-2 border-white rounded-xl shadow-xl text-white hover:scale-110 transition-transform" title="Cabecera OLT / ODF Central">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/>
          </svg>
          <span class="absolute -bottom-4 text-[9px] font-black text-white bg-blue-900 border border-blue-400 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
            OLT/ODF
          </span>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -24]
    });
  }
  return odfIconSingleton;
};

/**
 * 8. Brazo de Extensión para Cajas NAP y Postes
 */
const brazoIconCache = new Map<string, L.DivIcon>();

export const createBrazoExtensionIcon = (codigoOrBrazo?: string | { codigo?: string }) => {
  const codigo = typeof codigoOrBrazo === 'string' ? codigoOrBrazo : codigoOrBrazo?.codigo;
  const cacheKey = codigo || 'default';
  if (brazoIconCache.has(cacheKey)) {
    return brazoIconCache.get(cacheKey)!;
  }

  const icon = L.divIcon({
    className: 'custom-brazo-extension-icon',
    html: `
      <div class="relative flex flex-col items-center justify-center filter drop-shadow-md hover:scale-125 transition-transform cursor-pointer" title="Brazo de Extensión ${codigo || ''}">
        <div style="background: linear-gradient(135deg, #d97706, #ea580c); border: 2px solid #ffffff; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <span class="mt-0.5 text-[8.5px] font-black text-amber-900 bg-amber-100/95 border border-amber-300 px-1 rounded shadow-xs whitespace-nowrap">
          ${codigo || 'BRAZO'}
        </span>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 19],
    popupAnchor: [0, -20]
  });

  brazoIconCache.set(cacheKey, icon);
  return icon;
};
