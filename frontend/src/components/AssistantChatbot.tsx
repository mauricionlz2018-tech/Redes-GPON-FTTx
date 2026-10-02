import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2
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
}

const STEP_GUIDES: StepGuide[] = [
  {
    id: 'add-nap',
    title: '¿Cómo agregar una nueva Caja NAP en el mapa?',
    shortDesc: 'Registro georreferenciado de caja con sus 16 puertos listos.',
    icon: MapPin,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    explanation:
      'Para desplegar una nueva caja terminal óptica (NAP) en la red pasiva:',
    steps: [
      'Ve a la pestaña "Mapa" en la barra de navegación.',
      'En la barra superior del mapa, haz clic en el botón "+ Nueva Caja NAP" (o arrastra el botón hacia el mapa).',
      'El sistema asignará automáticamente el nombre correlativo oficial (ej. NAP-SJR-26).',
      'Indica la zona (ej. Centro, San Juan) y una referencia del poste o ubicación.',
      'Verifica las coordenadas capturadas con el GPS o ubícalas con el cursor.',
      'Pulsa en "Guardar y Desplegar Caja". La NAP quedará registrada al instante con sus 16 puertos.'
    ],
    tip: 'Si el nombre ya existe en la red, el sistema te avisará al instante para evitar duplicidades.'
  },
  {
    id: 'connect-client',
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

export const AssistantChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<StepGuide | null>(null);
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

  const handleSelectGuide = (guide: StepGuide) => {
    setSelectedGuide(guide);
  };

  const handleBackToMenu = () => {
    setSelectedGuide(null);
  };

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha: Elevado en móvil (bottom-[74px]) para NO tapar los botones de navegación (Reportes / Personal) */}
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
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-[440px] max-h-[88vh] h-[600px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-slate-950/40 overflow-hidden transition-colors animate-fadeIn font-sans">
          {/* Cabecera Amigable */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-tight">
                    Guía Rápida GPON
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-full font-medium border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Paso a Paso
                  </span>
                </div>
                <p className="text-[11px] text-sky-100 opacity-90">
                  Ayuda interactiva para el sistema
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
                      Instrucciones Paso a Paso:
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
                    Ver todas las opciones del menú
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
                    Selecciona qué tarea deseas realizar para ver su procedimiento paso a paso:
                  </p>
                </div>

                {/* Menú de Botones Paso a Paso */}
                <div className="space-y-2">
                  {STEP_GUIDES.map((guide) => {
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
                  })}
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
