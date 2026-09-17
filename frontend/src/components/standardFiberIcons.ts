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
 * Triángulo azul apuntando a la izquierda con 8 pines de color de salida en el lado derecho.
 */
export const createSplitterTroncalIcon = (label?: string) => {
  return L.divIcon({
    className: 'custom-splitter-troncal-icon',
    html: `
      <div class="relative flex items-center justify-center filter drop-shadow-md hover:scale-125 transition-transform cursor-pointer" title="Divisor Óptico 1:8 Troncal ${label || ''}">
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Triángulo azul orientado a la izquierda -->
          <polygon points="26,2 6,14 26,26" fill="#1e88e5" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
          <!-- Entrada izquierda -->
          <line x1="2" y1="14" x2="6" y2="14" stroke="#ffffff" stroke-width="2" />
          <!-- 8 pines de salida colorimétricos a la derecha -->
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
 * Triángulo magenta con un cuadrado interior y 8 pines de color.
 */
export const createSplitterNapIcon = (label?: string) => {
  return L.divIcon({
    className: 'custom-splitter-nap-icon',
    html: `
      <div class="relative flex items-center justify-center filter drop-shadow-md hover:scale-125 transition-transform cursor-pointer" title="Divisor Óptico 1:8 NAP ${label || ''}">
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Triángulo magenta -->
          <polygon points="26,2 6,14 26,26" fill="#d81b60" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
          <!-- Cuadro interior blanco / transparente representativo del módulo NAP -->
          <rect x="15" y="10" width="7" height="8" fill="#ffffff" stroke="#d81b60" stroke-width="1" rx="1" />
          <!-- Entrada -->
          <line x1="2" y1="14" x2="6" y2="14" stroke="#ffffff" stroke-width="2" />
          <!-- 8 pines de salida a clientes -->
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
 * 3. Caja NAP Normalizada con Semáforo Cromático
 * Rectángulo con diseño estándar de ingeniería de planta externa
 */
export const createNapStandardIcon = (nap: NapBox, isSelected: boolean, isRouteDestination: boolean) => {
  const metricas = nap.metricas;
  const pct = metricas ? metricas.porcentajeSaturacion : 0;
  const ocupados = metricas ? metricas.ocupados : 0;
  const total = nap.total_puertos || 16;

  let headerColor = '#10b981'; // Verde (<80%)
  let statusBadge = 'bg-emerald-500';

  if (pct >= 100) {
    headerColor = '#ef4444'; // Rojo (100%)
    statusBadge = 'bg-red-600';
  } else if (pct >= 80) {
    headerColor = '#f59e0b'; // Ámbar (>=80%)
    statusBadge = 'bg-amber-500';
  }

  const ringStyle = isRouteDestination
    ? 'ring-4 ring-indigo-500 scale-125 shadow-xl animate-bounce'
    : isSelected
    ? 'ring-4 ring-sky-400 scale-110 shadow-lg'
    : 'shadow-md hover:scale-105';

  return L.divIcon({
    className: 'custom-standard-nap-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-200 ${ringStyle}">
        <!-- Caja NAP rectangular con estilo de planta externa -->
        <div class="flex items-center gap-1 bg-slate-900 border-2 border-white rounded-lg px-2 py-1 shadow-md text-white font-mono text-[11px] leading-tight">
          <!-- Mini conector / status -->
          <div class="w-2.5 h-2.5 rounded-sm ${statusBadge}"></div>
          <span class="font-bold text-white tracking-tight">${nap.identificador}</span>
          <span class="bg-slate-800 text-slate-300 text-[9px] px-1 rounded ml-0.5">${ocupados}/${total}</span>
        </div>
        <!-- Puntero inferior -->
        <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-white"></div>
      </div>
    `,
    iconSize: [60, 36],
    iconAnchor: [30, 26],
    popupAnchor: [0, -28]
  });
};

/**
 * 4. Cierre de Empalme / Mufa Torpedo
 * Forma torpedo azul cilíndrico estriado con símbolo de fusión óptica ><
 */
export const createMufaTorpedoIcon = (empalme?: EmpalmeClosure) => {
  const cap = empalme?.capacidad_hilos || 48;
  return L.divIcon({
    className: 'custom-mufa-torpedo-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer hover:scale-125 transition-transform" title="Cierre de Empalme / Mufa Torpedo: ${empalme?.nombre || 'Mufa'}">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Cuerpo de torpedo redondeado azul -->
          <rect x="4" y="4" width="28" height="16" rx="8" fill="#0284c7" stroke="#ffffff" stroke-width="1.8" />
          <!-- Estrías del domo -->
          <line x1="12" y1="4" x2="12" y2="20" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 1" />
          <line x1="24" y1="4" x2="24" y2="20" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 1" />
          <!-- Símbolo de Fusión Óptica en moño: >< -->
          <path d="M14 8 L22 16 M14 16 L22 8" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
          <!-- Puntos de entrada / salida de cables -->
          <circle cx="2" cy="12" r="1.5" fill="#ffffff" />
          <circle cx="34" cy="12" r="1.5" fill="#ffffff" />
        </svg>
        <div class="text-[9px] font-bold text-slate-800 bg-sky-50 border border-sky-300 px-1 py-0.2 rounded shadow-xs -mt-0.5 whitespace-nowrap">
          ${empalme?.nombre || 'MUFA'}
        </div>
      </div>
    `,
    iconSize: [40, 36],
    iconAnchor: [20, 18],
    popupAnchor: [0, -20]
  });
};

/**
 * 5. Gasa / Reserva Técnica de Cable
 * Símbolo de infinito '∞' azul con los metros rotulados (e.g. 30m, 50m)
 */
export const createGasaReservaIcon = (gasa?: GasaReserva) => {
  const metraje = gasa?.longitud_metros ? `${gasa.longitud_metros}m` : '30m';
  return L.divIcon({
    className: 'custom-gasa-reserva-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer hover:scale-125 transition-transform" title="Gasa de Reserva Técnica: ${gasa?.nombre || metraje}">
        <!-- Símbolo de bucle/infinito ∞ -->
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
};

/**
 * 6. Poste Propuesto (Círculo rojo estándar del plano de diseño)
 */
export const createPostePropuestoIcon = (codigo?: string) => {
  return L.divIcon({
    className: 'custom-poste-propuesto-marker',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer hover:scale-150 transition-transform" title="Poste Propuesto ${codigo || ''}">
        <div class="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-sm ring-1 ring-red-500"></div>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8]
  });
};

/**
 * 7. Poste CFE Existente (Punto grisáceo con cruz central o círculo)
 */
export const createPosteCfeIcon = (codigo?: string) => {
  return L.divIcon({
    className: 'custom-poste-cfe-marker',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer hover:scale-150 transition-transform" title="Poste CFE Existente ${codigo || ''}">
        <div class="w-3 h-3 rounded-full bg-slate-600 border border-white shadow-xs flex items-center justify-center text-[7px] text-white font-bold">
          +
        </div>
      </div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -7]
  });
};

/**
 * 8. ODF / Central Office (Cabecera)
 */
export const createOdfStandardIcon = (nombre?: string) => {
  return L.divIcon({
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
};

