import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  X,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  MapPin,
  Plug,
  Unlock,
  FileText,
  UserPlus,
  WifiOff,
  Sparkles,
  CheckCircle2,
  Activity,
  Layers,
  Palette,
  Compass,
  Navigation,
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { searchKnowledge, KnowledgeItem } from '../data/assistantKnowledgeBase';

interface StepGuide {
  id: string;
  category: 'presupuesto' | 'municipios' | 'infraestructura' | 'naps' | 'clientes' | 'sistema';
  title: string;
  shortDesc: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  explanation: string;
  steps: string[];
  tip?: string;
}

const STEP_GUIDES: StepGuide[] = [
  {
    id: 'optical-budget',
    category: 'presupuesto',
    title: '¿Cómo calcular el presupuesto óptico bidireccional (ITU-T)?',
    shortDesc: 'Atenuación espectral 1490nm/1310nm, splitters y semáforo de margen.',
    icon: Activity,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    explanation:
      'Para evaluar la viabilidad de potencia y margen de seguridad de un enlace GPON bajo la norma ITU-T G.984.2:',
    steps: [
      'En el Mapa de Red, selecciona la Caja NAP o el enlace de fibra que deseas diagnosticar.',
      'Abre la pestaña "Presupuesto Óptico" en el panel de detalle técnico.',
      'Selecciona la Clase de Óptica configurada en la OLT: Clase B+ (margen 28.5 dB) o Clase C+ (margen 32.0 dB).',
      'El sistema calcula automáticamente la atenuación espectral: 0.25 dB/km en Downstream (1490 nm) y 0.35 dB/km en Upstream (1310 nm).',
      'Aplica las pérdidas de conectores (1.4 dB fijos por 4 pares SC/APC), empalmes de fusión (0.1 dB cada uno) y la inserción del splitter óptico de la NAP.',
      'Verifica el semáforo de salud óptica: Verde (Margen >= 5 dB, Conforme), Ámbar (3 a 4.9 dB, Precaución) o Rojo (< 3 dB, Crítico).'
    ],
    tip: 'En troncales rurales con distancias mayores a 15 km se aconseja instalar módulos Clase C+ para mantener un margen seguro superior a 5 dB.'
  },
  {
    id: 'municipalities-nav',
    category: 'municipios',
    title: '¿Cómo navegar y delimitar por municipio en el mapa?',
    shortDesc: 'Despliegue perimetral oficial y navegación rápida entre localidades.',
    icon: Navigation,
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    explanation:
      'Para centrar la vista y demarcar los límites territoriales de una jurisdicción operativa:',
    steps: [
      'En la barra superior de herramientas del mapa, localiza el menú desplegable "Municipio / Delimitación".',
      'Selecciona el municipio deseado (Ixtlahuaca, Jocotitlán, Atlacomulco, San José del Rincón, San Felipe del Progreso, Jiquipilco, Acambay/Dongu o El Oro).',
      'El visor Leaflet volará suavemente a la cabecera municipal ajustando el nivel de zoom óptimo de forma automática.',
      'Se dibujará el contorno perimetral oficial (polígono administrativo INEGI/OSM) en línea punteada índigo para delimitar la zona.',
      'Para desmarcar el contorno y regresar al encuadre general de toda la red, vuelve a seleccionar la opción "Todos los municipios".'
    ],
    tip: 'El contorno es meramente de referencia visual y no bloquea clics sobre cajas NAP, postes ni tendidos de fibra.'
  },
  {
    id: 'poles-gasas-lod',
    category: 'infraestructura',
    title: '¿Cómo visualizar y gestionar postes y gasas técnicas (LOD)?',
    shortDesc: 'Optimización a 60 FPS a nivel de calle (zoom 15+) sin saturar la pantalla.',
    icon: Layers,
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    explanation:
      'Para consultar postes y bucles de reserva técnica de Planta Externa con alto rendimiento gráfico:',
    steps: [
      'En el panel de capas de Planta Externa, marca las casillas "Postes CFE", "Postes Propuestos" o "Gasas Técnicas".',
      'A nivel de zoom regional o general (zoom 10 a 14), los postes se mantienen ocultos para evitar que la computadora o celular se trabe.',
      'Acércate con zoom 15 o superior a la calle o localidad de trabajo; los postes y gasas se mostrarán al instante de forma ágil.',
      'Haz clic sobre cualquier poste para consultar su placa oficial CFE, altura, material (concreto/madera) y coordenadas GPS.',
      'Si desactivas la casilla de la capa, los marcadores se retiran inmediatamente del visor sin dejar elementos fantasma en pantalla.'
    ],
    tip: 'La optimización por nivel de detalle (LOD) asegura 60 FPS constantes incluso con miles de postes en la base de datos.'
  },
  {
    id: 'fiber-routes-colors',
    category: 'infraestructura',
    title: '¿Cómo trazar rutas de fibra con colores personalizados?',
    shortDesc: 'Trazado interactivo con vértices arrastrables y paleta libre sin bloqueo de color.',
    icon: Palette,
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    explanation:
      'Para digitalizar nuevos tendidos de fibra óptica troncal o ramales de distribución:',
    steps: [
      'En la barra superior del mapa, presiona el botón "Trazar Cable / Ruta de Fibra".',
      'Elige el tipo de tramo: Troncal (48 a 96 hilos) o Ramal de Distribución (12 a 24 hilos).',
      'Selecciona el color deseado en la paleta cromática (azul, índigo, verde, naranja, morado, cian, rojo, etc.).',
      'Haz clic en el mapa siguiendo la trayectoria de postes o calles para fijar los vértices del cable.',
      'Puedes arrastrar cualquier vértice numerado para alinear la fibra con precisión a lo largo de la vialidad.',
      'Haz clic en "Finalizar Trazo y Guardar". El sistema guardará la ruta con el color exacto seleccionado sin forzar tonos café.'
    ],
    tip: 'El color elegido se respeta fielmente y persiste al cerrar y reabrir sesión en cualquier dispositivo.'
  },
  {
    id: 'adjust-gps-pin',
    category: 'infraestructura',
    title: '¿Cómo afinar la posición de postes y cajas con el pin GPS arrastrable?',
    shortDesc: 'Ajuste milimétrico de ubicación en mapa satelital sin teclear coordenadas.',
    icon: Compass,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    explanation:
      'Para calibrar la posición exacta de un elemento físico en terreno sobre la cartografía satelital:',
    steps: [
      'Abre el formulario de edición del poste, mufa o Caja NAP en el mapa.',
      'Activa la opción "Afinar Pin en Mapa".',
      'Haz clic sostenido sobre el marcador y arrástralo hasta la ubicación física exacta sobre el poste o fachada.',
      'Las coordenadas de latitud y longitud se recalcularán en tiempo real con precisión submétrica.',
      'Presiona "Guardar Coordenadas" para asentar la nueva posición en la base de datos central.'
    ],
    tip: 'Activa la vista de satélite para identificar con facilidad las sombras de postes y esquinas reales.'
  },
  {
    id: 'add-nap',
    category: 'naps',
    title: '¿Cómo agregar una nueva Caja NAP en el mapa?',
    shortDesc: 'Registro georreferenciado de caja con sus 16 puertos listos.',
    icon: MapPin,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    explanation:
      'Para desplegar una nueva caja terminal óptica (NAP) en la red pasiva:',
    steps: [
      'Ve a la pestaña "Mapa" en la barra de navegación.',
      'En la barra superior del mapa, haz clic en el botón "+ Nueva Caja NAP".',
      'El sistema asignará automáticamente el nombre correlativo oficial (ej. NAP-SJR-26).',
      'Indica la zona (ej. Centro, San Juan) y una referencia del poste o ubicación.',
      'Verifica las coordenadas capturadas con el GPS o ubícalas con el cursor.',
      'Pulsa en "Guardar y Desplegar Caja". La NAP quedará registrada al instante con sus 16 puertos.'
    ],
    tip: 'Si el nombre ya existe en la red, el sistema te avisará al instante para evitar duplicidades.'
  },
  {
    id: 'connect-client',
    category: 'clientes',
    title: '¿Cómo conectar y dar de alta a un abonado?',
    shortDesc: 'Asignación de puerto óptico, contrato y equipo ONT del cliente.',
    icon: Plug,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    explanation:
      'Para dar de alta a un suscriptor y conectarlo a un puerto físico libre:',
    steps: [
      'En el mapa, haz clic sobre el icono de la Caja NAP donde se hará la acometida.',
      'En la tarjeta de información lateral, presiona "Ver Matriz de Puertos".',
      'Ubica cualquier conector disponible en color verde (Libre) y presiona "Asignar / Conectar".',
      'Ingresa el número de contrato o cliente (ej. CLI-1090) y el nombre del suscriptor.',
      'Escribe la marca de la ONT (Huawei, ZTE, V-SOL, TP-Link) y la dirección MAC.',
      'Haz clic en "Confirmar Conexión Óptica". El puerto pasará a color azul (Ocupado).'
    ],
    tip: 'La potencia óptica estimada (dBm) se calcula automáticamente según la atenuación de la fibra.'
  },
  {
    id: 'release-port',
    category: 'clientes',
    title: '¿Cómo liberar un puerto de fibra óptica?',
    shortDesc: 'Desvincular contrato por baja y regresar el conector a Libre.',
    icon: Unlock,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    explanation:
      'Cuando un cliente cancela o se muda de domicilio y necesitas liberar el conector:',
    steps: [
      'Asegúrate de contar con permisos de Soporte o Administrador.',
      'Abre la Caja NAP en el mapa o búscala en el padrón de la pestaña "Abonados".',
      'Entra a la "Matriz de Puertos" de la caja.',
      'Selecciona el puerto ocupado (azul) que deseas dejar disponible y presiona "Liberar Puerto".',
      'Confirma la acción en el mensaje de seguridad. El puerto volverá a estar disponible en color verde.'
    ],
    tip: 'Toda liberación de conector queda auditada en el sistema con fecha, hora y usuario.'
  },
  {
    id: 'download-pdf',
    category: 'sistema',
    title: '¿Cómo descargar el reporte de saturación en PDF?',
    shortDesc: 'Generación del informe ejecutivo oficial con métricas de red.',
    icon: FileText,
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    explanation:
      'Para generar y descargar el reporte de capacidad de la red GPON en formato PDF:',
    steps: [
      'Ingresa a la sección "Reportes" en la barra de navegación.',
      'Revisa las métricas globales (Total de Cajas NAP, Puertos totales, Libres y Saturación).',
      'En la esquina superior derecha, haz clic en "Descargar Reporte PDF".',
      'El sistema compilará de inmediato el documento oficial con membrete corporativo y desglose de puertos.',
      'El archivo PDF se guardará de forma directa en tu dispositivo.'
    ],
    tip: 'El PDF incluye el estado de saturación por caja para facilitar auditorías y planeación de expansión.'
  },
  {
    id: 'manage-users',
    category: 'sistema',
    title: '¿Cómo dar de alta nuevo personal o técnicos?',
    shortDesc: 'Registro de técnicos de campo, soporte o administradores.',
    icon: UserPlus,
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    explanation:
      'Con rol de Administrador, puedes incorporar nuevos integrantes a las cuadrillas:',
    steps: [
      'Dirígete a la sección "Personal" en el menú de navegación.',
      'Haz clic en el botón "+ Agregar Personal" situado arriba a la derecha.',
      'Introduce el nombre completo del colaborador y su correo institucional.',
      'Selecciona el rol correspondiente: Técnico (campo), Soporte (clientes/red) o Administrador.',
      'Asigna la contraseña de acceso y pulsa "Guardar Personal".'
    ],
    tip: 'El técnico podrá ingresar al sistema de inmediato con las credenciales registradas.'
  },
  {
    id: 'offline-mode',
    category: 'sistema',
    title: '¿Cómo usar el sistema sin conexión (Modo Offline)?',
    shortDesc: 'Continuidad de trabajo en campo y zonas rurales sin cobertura.',
    icon: WifiOff,
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    explanation:
      'Si sales a campo a zonas sin señal celular o WiFi, la plataforma sigue activa:',
    steps: [
      'El sistema descarga automáticamente el mapa y los puertos en la memoria local de tu dispositivo.',
      'Si se corta la conexión, verás el indicador "Offline" en la barra superior.',
      'Puedes seguir navegando por la cartografía y registrando conexiones con total normalidad.',
      'Todas las operaciones se almacenan de manera segura en tu teléfono o computadora.',
      'En cuanto recuperes cobertura celular o WiFi, las acciones se sincronizan automáticamente con la central.'
    ],
    tip: 'Puedes instalar la aplicación con el botón "APK" de la barra superior para usarla como app nativa.'
  }
];

type CategoryFilter = 'todas' | 'presupuesto' | 'municipios' | 'infraestructura' | 'naps' | 'clientes' | 'sistema';

interface CategoryTab {
  id: CategoryFilter;
  label: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'presupuesto', label: 'Presupuesto' },
  { id: 'municipios', label: 'Municipios' },
  { id: 'infraestructura', label: 'Planta Externa' },
  { id: 'naps', label: 'Cajas NAP' },
  { id: 'clientes', label: 'Abonados' },
  { id: 'sistema', label: 'Sistema' }
];

interface ActiveViewDetail {
  title: string;
  categoryLabel?: string;
  explanation: string;
  steps: string[];
  tip?: string;
  icon?: any;
  iconBg?: string;
  iconColor?: string;
}

export const AssistantChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<ActiveViewDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todas');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-gpon-assistant', handleOpen);
    return () => window.removeEventListener('open-gpon-assistant', handleOpen);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = 0;
    }
  }, [selectedGuide]);

  // Consulta de la base de conocimiento general cuando hay texto de búsqueda
  const kbSearchResult = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return null;
    return searchKnowledge(searchQuery);
  }, [searchQuery]);

  // Filtrado de las guías paso a paso
  const filteredGuides = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return STEP_GUIDES.filter((guide) => {
      const matchesCategory =
        activeCategory === 'todas' || guide.category === activeCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const titleMatch = guide.title.toLowerCase().includes(q);
      const descMatch = guide.shortDesc.toLowerCase().includes(q);
      const explMatch = guide.explanation.toLowerCase().includes(q);
      const stepsMatch = guide.steps.some((s) => s.toLowerCase().includes(q));

      return titleMatch || descMatch || explMatch || stepsMatch;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectGuide = (guide: StepGuide) => {
    setSelectedGuide({
      title: guide.title,
      categoryLabel: CATEGORY_TABS.find((c) => c.id === guide.category)?.label,
      explanation: guide.explanation,
      steps: guide.steps,
      tip: guide.tip,
      icon: guide.icon,
      iconBg: guide.iconBg,
      iconColor: guide.iconColor
    });
  };

  const handleSelectKnowledgeItem = (item: KnowledgeItem) => {
    setSelectedGuide({
      title: item.title,
      categoryLabel: 'Conocimiento Técnico',
      explanation: item.shortAnswer,
      steps: item.detailedSteps || [],
      tip: item.tips && item.tips.length > 0 ? item.tips.join(' ') : undefined,
      icon: Info,
      iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
      iconColor: 'text-sky-600 dark:text-sky-400'
    });
  };

  const handleBackToMenu = () => {
    setSelectedGuide(null);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveCategory('todas');
  };

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha */}
      <div className="fixed bottom-[74px] sm:bottom-6 right-3 sm:right-6 z-30">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-medium text-xs sm:text-sm px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-lg shadow-sky-950/25 hover:shadow-sky-600/30 transition-all duration-200 active:scale-95 cursor-pointer border border-sky-400/40 group"
            title="Abrir Asistente y Guía Paso a Paso GPON"
          >
            <div className="relative">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-sky-700" />
            </div>
            <span className="tracking-wide">Asistente GPON</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      {/* Ventana Modal del Asistente */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-[460px] max-h-[90vh] h-[640px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-slate-950/40 overflow-hidden transition-colors animate-fadeIn font-sans">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-tight">
                    Asistente Técnico GPON
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-full font-medium border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Paso a Paso
                  </span>
                </div>
                <p className="text-[11px] text-sky-100 opacity-90">
                  Ayuda técnica y procedimientos del sistema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {selectedGuide && (
                <button
                  onClick={handleBackToMenu}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Volver al menú de opciones"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar asistente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros de Categoría */}
          {!selectedGuide && (
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por postes, municipios, presupuesto, clientes..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Pestañas de Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                {CATEGORY_TABS.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cuerpo Principal del Asistente */}
          <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-950/40">
            {/* Si el usuario seleccionó una guía paso a paso o resultado técnico específico */}
            {selectedGuide ? (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Botón de Regresar al Menú */}
                <button
                  onClick={handleBackToMenu}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la lista de temas</span>
                </button>

                {/* Tarjeta de Detalle */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    {selectedGuide.icon && (
                      <div className={`p-2.5 rounded-xl shrink-0 ${selectedGuide.iconBg || 'bg-sky-500/10 dark:bg-sky-500/20'}`}>
                        <selectedGuide.icon className={`w-5 h-5 ${selectedGuide.iconColor || 'text-sky-600 dark:text-sky-400'}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {selectedGuide.categoryLabel && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1 block">
                          {selectedGuide.categoryLabel}
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {selectedGuide.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        {selectedGuide.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Lista de Pasos Numerados */}
                  {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                        Procedimiento Paso a Paso:
                      </span>
                      <div className="space-y-2">
                        {selectedGuide.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed flex-1">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recomendación / Tip */}
                  {selectedGuide.tip && (
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
                      <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="font-semibold">Recomendación técnica: </strong>
                        <span>{selectedGuide.tip}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón inferior para regresar */}
                <div className="text-center pt-2">
                  <button
                    onClick={handleBackToMenu}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Ver todas las guías y temas
                  </button>
                </div>
              </div>
            ) : (
              /* Vista de Menú Principal */
              <div className="space-y-3.5 animate-fadeIn">
                {/* Saludo inicial amigable (sin emojis) */}
                {!searchQuery && activeCategory === 'todas' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-sky-500" />
                      <span>Bienvenido, {user?.nombre_completo.split(' ')[0] || 'Compañero'}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Selecciona una tarea o tema técnico para consultar el procedimiento detallado:
                    </p>
                  </div>
                )}

                {/* Tarjeta de Coincidencia de Base de Conocimiento (si la búsqueda arroja resultado directo) */}
                {kbSearchResult && (
                  <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-300/60 dark:border-sky-700/60 rounded-xl p-3.5 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 text-xs font-bold">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Respuesta Técnica Directa</span>
                    </div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white leading-snug">
                      {kbSearchResult.item.title}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {kbSearchResult.item.shortAnswer}
                    </p>
                    <button
                      onClick={() => handleSelectKnowledgeItem(kbSearchResult.item)}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Ver explicación técnica completa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Lista de Guías Paso a Paso */}
                <div className="space-y-2">
                  {filteredGuides.length > 0 ? (
                    filteredGuides.map((guide) => {
                      const Icon = guide.icon;
                      return (
                        <button
                          key={guide.id}
                          onClick={() => handleSelectGuide(guide)}
                          className="w-full text-left p-3 rounded-xl bg-white hover:bg-sky-50/70 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs group cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl shrink-0 ${guide.iconBg}`}>
                              <Icon className={`w-4 h-4 ${guide.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                                {guide.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {guide.shortDesc}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      <SlidersHorizontal className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        No se encontraron guías para la búsqueda actual.
                      </p>
                      <button
                        onClick={handleResetSearch}
                        className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                      >
                        Restablecer filtros de búsqueda
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pie del Asistente */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              GPON Telecom • Guía Paso a Paso
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};