import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Plug,
  Unlock,
  FileText,
  UserPlus,
  WifiOff,
  Search,
  Sparkles
} from 'lucide-react';

interface StepGuide {
  id: string;
  title: string;
  shortDesc: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  explanation: string;
  steps: string[];
  tip?: string;
  keywords: string[];
}

const STEP_GUIDES: StepGuide[] = [
  {
    id: 'add-nap',
    title: '¿Cómo agregar una Caja NAP en el mapa?',
    shortDesc: 'Registro de divisor óptico 1:16 con coordenadas GPS.',
    icon: MapPin,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    explanation:
      'Para desplegar una nueva caja terminal óptica (NAP) en la red, sigue estos sencillos pasos:',
    steps: [
      'Ve a la pestaña "Mapa de Red" en la barra de navegación superior.',
      'Haz clic en el botón azul "+ Agregar NAP" ubicado en la barra de herramientas del mapa (o haz doble clic sobre el punto exacto de la calle donde está el poste).',
      'El sistema detectará automáticamente el siguiente identificador correlativo (ej. NAP-SJR-26).',
      'Ingresa el nombre de la zona (ej. Centro, San Juan) y la dirección o referencia física.',
      'Verifica las coordenadas GPS capturadas automáticamente o pulsa el botón de geolocalización.',
      'Haz clic en "Guardar y Desplegar Caja". La NAP se creará de inmediato con sus 16 puertos listos.'
    ],
    tip: 'Si el nombre ya existe en la red, el sistema te advertirá en tiempo real para evitar duplicados.',
    keywords: ['agregar caja', 'crear nap', 'nueva caja', 'divisor', 'poste', 'mapa']
  },
  {
    id: 'connect-client',
    title: '¿Cómo conectar a un nuevo abonado?',
    shortDesc: 'Asignación de puerto óptico, datos de suscriptor y ONT.',
    icon: Plug,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    explanation:
      'Para dar de alta a un suscriptor y conectarlo a un puerto físico libre en una caja NAP:',
    steps: [
      'En el mapa, haz clic sobre el icono de la Caja NAP donde se realizará la acometida.',
      'En el panel de información que se despliega a la derecha, pulsa "Ver Matriz de Puertos".',
      'Busca cualquier puerto que esté en color verde (Estado: "Libre") y pulsa en "Asignar / Conectar".',
      'Escribe el número de contrato o cliente (ej. CLI-1090) y el nombre completo del titular.',
      'Ingresa la marca del equipo ONT instalado (Huawei, ZTE, V-SOL, TP-Link) y su dirección MAC.',
      'Pulsa en "Confirmar Conexión Óptica". El puerto cambiará a color azul (Ocupado).'
    ],
    tip: 'El cálculo de potencia óptica estimada (dBm) se actualiza de forma automática en el sistema.',
    keywords: ['conectar', 'abonado', 'cliente', 'asignar puerto', 'ont', 'mac', 'nuevo cliente']
  },
  {
    id: 'release-port',
    title: '¿Cómo liberar un puerto ocupado?',
    shortDesc: 'Desvincular cliente por cancelación y regresar puerto a Libre.',
    icon: Unlock,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    explanation:
      'Cuando un cliente cancela su servicio o se traslada de domicilio, puedes liberar el conector óptico:',
    steps: [
      'Asegúrate de haber iniciado sesión con rol de "Soporte" o "Administrador" (los técnicos en campo solo tienen permisos de lectura/conexión).',
      'Abre la Caja NAP en el mapa o búscala en la pestaña "Abonados".',
      'Ingresa a la "Matriz de Puertos" de la caja.',
      'Ubica el puerto ocupado (azul) que deseas vaciar y pulsa el botón "Liberar Puerto".',
      'Confirma la acción en el diálogo de seguridad. El puerto volverá automáticamente a estado Verde (Libre) y el cliente quedará desvinculado.'
    ],
    tip: 'Por auditoría de telecomunicaciones, la acción queda registrada con fecha, hora y usuario responsable.',
    keywords: ['liberar', 'desconectar', 'cancelar', 'vaciar puerto', 'desvincular']
  },
  {
    id: 'download-pdf',
    title: '¿Cómo descargar el reporte de saturación en PDF?',
    shortDesc: 'Generación del informe ejecutivo oficial con gráficas y tablas.',
    icon: FileText,
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    explanation:
      'Para generar y descargar el reporte de capacidad de la red GPON en formato PDF:',
    steps: [
      'Ve a la pestaña "Reportes PDF" en el menú principal superior.',
      'Revisa las métricas globales en pantalla (Total de NAPs, Puertos totales, Libres y Saturación global).',
      'En la esquina superior derecha, haz clic en el botón azul "Descargar Reporte PDF".',
      'El servidor compilará al instante el documento con diseño corporativo institucional, tablas de todas las cajas y firma de auditoría.',
      'El archivo PDF se descargará automáticamente en tu dispositivo.'
    ],
    tip: 'Puedes filtrar la tabla de reportes por zona o nombre de caja antes de revisar la saturación.',
    keywords: ['pdf', 'reporte', 'descargar', 'informe', 'saturacion', 'imprimir']
  },
  {
    id: 'manage-users',
    title: '¿Cómo dar de alta nuevo personal?',
    shortDesc: 'Registro de técnicos de campo, soporte o administradores.',
    icon: UserPlus,
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    explanation:
      'Si tienes rol de Administrador, puedes agregar miembros a las cuadrillas de trabajo:',
    steps: [
      'Dirígete a la sección "Personal" en la barra de navegación superior.',
      'Haz clic en el botón "+ Agregar Personal" arriba a la derecha.',
      'Ingresa el nombre y apellidos completos del colaborador.',
      'Define su correo o credencial de acceso (ej. tecnico3@gpon.com).',
      'Selecciona el rol adecuado: Técnico (campo), Soporte (red y clientes) o Admin (control total).',
      'Establece una contraseña inicial segura y pulsa "Guardar Personal".'
    ],
    tip: 'El nuevo colaborador podrá iniciar sesión de inmediato con las credenciales asignadas.',
    keywords: ['personal', 'tecnico', 'crear usuario', 'alta usuario', 'agregar personal', 'rol']
  },
  {
    id: 'offline-mode',
    title: '¿Cómo funciona el modo sin conexión (Offline)?',
    shortDesc: 'Uso de la plataforma en zonas rurales sin señal celular.',
    icon: WifiOff,
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    explanation:
      'En campo es común quedarse sin cobertura de telefonía. El sistema opera 100% de forma autónoma:',
    steps: [
      'La aplicación almacena automáticamente la cartografía, las cajas NAP y los clientes en la memoria local (IndexedDB) de tu teléfono o laptop.',
      'Si pierdes la conexión, verás el indicador amarillo "Offline" en la barra superior.',
      'Puedes seguir navegando por el mapa, consultando puertos y registrando conexiones como de costumbre.',
      'Todas las acciones se guardan en una cola local protegida.',
      'En cuanto tu dispositivo vuelva a tener señal WiFi o 4G/5G, pulsa "Sync" o el sistema sincronizará los cambios automáticamente.'
    ],
    tip: 'Puedes instalar la aplicación como APK / PWA tocando el botón "APK" de la barra superior para abrirla sin navegador.',
    keywords: ['offline', 'sin internet', 'sin conexion', 'sincronizar', 'pwa', 'cobertura']
  },
  {
    id: 'quick-search',
    title: '¿Cómo buscar una caja o abonado rápidamente?',
    shortDesc: 'Uso del buscador en tiempo real en el mapa y tablas.',
    icon: Search,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    explanation:
      'Localiza elementos al instante escribiendo cualquier parte de su nombre o código:',
    steps: [
      'En el mapa: utiliza la barra de búsqueda en la parte superior izquierda. Escribe el número de NAP (ej. 24) o la zona (ej. Centro) y el mapa volará directamente hacia ella.',
      'En Abonados: escribe en el buscador el nombre del suscriptor (ej. Carlos) o el código (ej. CLI-1002); los resultados se filtran al momento.',
      'Cada tabla muestra 20 registros por página para que la navegación sea rápida y ligera.'
    ],
    tip: 'No te preocupes por acentos o mayúsculas; el buscador es inteligente y reconoce coincidencias de cualquier forma.',
    keywords: ['buscar', 'buscador', 'encontrar', 'localizar', 'filtrar']
  }
];

export const AssistantChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<StepGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
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
  }, [selectedGuide, customAnswer]);

  const handleSelectGuide = (guide: StepGuide) => {
    setSelectedGuide(guide);
    setCustomAnswer(null);
  };

  const handleBackToMenu = () => {
    setSelectedGuide(null);
    setCustomAnswer(null);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Buscar coincidencia en las guías
    const found = STEP_GUIDES.find(
      (g) =>
        g.title.toLowerCase().includes(query) ||
        g.keywords.some((k) => query.includes(k) || k.includes(query)) ||
        g.steps.some((s) => s.toLowerCase().includes(query))
    );

    if (found) {
      setSelectedGuide(found);
      setCustomAnswer(null);
    } else {
      setSelectedGuide(null);
      setCustomAnswer(
        `No encontré un procedimiento exacto para "${searchQuery}". Por favor selecciona una de las guías del menú a continuación o prueba buscando palabras clave como "agregar caja", "conectar abonado", "liberar puerto" o "descargar pdf".`
      );
    }
  };

  const filteredGuides = STEP_GUIDES.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.shortDesc.toLowerCase().includes(q) ||
      g.keywords.some((k) => k.includes(q))
    );
  });

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha (por encima de la barra de navegación móvil) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9990]">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-semibold text-xs sm:text-sm p-3 sm:px-4 sm:py-2.5 rounded-full shadow-2xl shadow-sky-950/60 hover:shadow-sky-600/40 transition-all duration-300 active:scale-95 cursor-pointer border border-sky-400/30 group"
            title="Abrir Asistente GPON"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-sky-700" />
            </div>
            <span className="tracking-wide hidden sm:inline">Asistente GPON</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform hidden sm:inline" />
          </button>
        )}
      </div>

      {/* Ventana Modal del Asistente */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-18 sm:inset-auto sm:bottom-6 sm:right-6 z-[9995] sm:w-[440px] max-h-[76vh] sm:max-h-[85vh] h-[600px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/40 overflow-hidden transition-colors animate-fadeIn font-sans">
          {/* Cabecera Amigable */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-tight">
                    Asistente GPON Telecom
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-400/20 text-emerald-100 px-2 py-0.2 rounded-full font-medium border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    En línea
                  </span>
                </div>
                <p className="text-[11px] text-sky-100 opacity-90">
                  Guía paso a paso • {user?.rol || 'Técnico'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleBackToMenu}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Volver al menú principal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar asistente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo Principal del Asistente */}
          <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-950/40">
            {/* Si el usuario seleccionó una guía paso a paso específica */}
            {selectedGuide ? (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Botón de Regresar al Menú */}
                <button
                  onClick={handleBackToMenu}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al menú de opciones</span>
                </button>

                {/* Tarjeta de la Guía */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${selectedGuide.iconBg}`}>
                      <selectedGuide.icon className={`w-5 h-5 ${selectedGuide.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {selectedGuide.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {selectedGuide.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Lista de Pasos Numerados Claros */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                      Procedimiento Paso a Paso:
                    </span>
                    <div className="space-y-2">
                      {selectedGuide.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed flex-1">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recomendación / Tip */}
                  {selectedGuide.tip && (
                    <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-start gap-2 text-xs text-sky-900 dark:text-sky-200">
                      <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="font-semibold">Recomendación técnica: </strong>
                        <span>{selectedGuide.tip}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón inferior para regresar */}
                <div className="text-center pt-1">
                  <button
                    onClick={handleBackToMenu}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Ver otras preguntas y procedimientos
                  </button>
                </div>
              </div>
            ) : (
              /* Vista de Menú Principal de Opciones Paso a Paso */
              <div className="space-y-3.5 animate-fadeIn">
                {/* Saludo inicial amigable */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>¡Hola, {user?.nombre_completo.split(' ')[0] || 'Compañero'}!</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Selecciona una de las siguientes opciones para ver el procedimiento paso a paso detallado:
                  </p>
                </div>

                {/* Mensaje de respuesta personalizada si no hubo match */}
                {customAnswer && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{customAnswer}</span>
                  </div>
                )}

                {/* Menú de Botones Paso a Paso */}
                <div className="space-y-2">
                  {filteredGuides.map((guide) => {
                    const Icon = guide.icon;
                    return (
                      <button
                        key={guide.id}
                        onClick={() => handleSelectGuide(guide)}
                        className="w-full text-left p-3 rounded-xl bg-white hover:bg-sky-50/70 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs group cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${guide.iconBg}`}>
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
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Barra de Entrada / Pregunta rápida */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe tu consulta (ej. agregar caja, puerto)..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Buscar procedimiento"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
