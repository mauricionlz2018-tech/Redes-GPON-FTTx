import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  LanguageOption,
  AVAILABLE_LANGUAGES,
  translations,
  TranslationSchema
} from '../translations';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const STORAGE_KEY = 'gpon_language';

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const EMERGENCY_FALLBACK_LABELS: Record<string, string> = {
  // Users Management
  'users.title': 'Gestión de Personal y Accesos',
  'users.subtitle': 'Control de usuarios, roles de seguridad y permisos en plataforma',
  'users.addUser': 'Nuevo Usuario',
  'users.addStaff': 'Agregar Personal',
  'users.totalStaff': 'Total Personal',
  'users.fieldTechs': 'Técnicos de Campo',
  'users.supportStaff': 'Soporte Técnico',
  'users.administrators': 'Administradores',
  'users.colStaff': 'Personal',
  'users.colCredential': 'Credencial / Acceso',
  'users.colRole': 'Rol Asignado',
  'users.colDate': 'Fecha de Registro',
  'users.colActions': 'Acciones',
  'users.fullName': 'Nombre Completo',
  'users.email': 'Correo Electrónico',
  'users.username': 'Nombre de Usuario',
  'users.role': 'Rol de Sistema',
  'users.lastAccess': 'Último Acceso',
  'users.editUser': 'Editar Usuario',
  'users.deleteUser': 'Dar de Baja Usuario',
  'users.noStaff': 'No se encontraron usuarios que coincidan con la búsqueda o filtro aplicado.',

  // Reports
  'reports.title': 'Reportes de Auditoría y Saturación',
  'reports.subtitle': 'Métricas de capacidad instalada, vanos aéreos y saturación de puertos',
  'reports.downloadPdf': 'Descargar Reporte PDF',
  'reports.generatingPdf': 'Compilando informe en PDF...',
  'reports.totalNaps': 'Total Cajas NAP',
  'reports.totalPorts': 'Capacidad en Puertos',
  'reports.occupiedPorts': 'Puertos Ocupados',
  'reports.freePorts': 'Puertos Libres',
  'reports.damagedPorts': 'Puertos Dañados',
  'reports.globalSaturation': 'Saturación Global',
  'reports.inventorySummary': 'Resumen de Inventario de Red',
  'reports.activeNaps': 'Cajas NAP Activas',
  'reports.connectedClients': 'Abonados Conectados',
  'reports.matrixTitle': 'Matriz de Estado y Saturación por Caja de Distribución (NAP)',
  'reports.matrixSubtitle': 'Criterio de Alerta ≥ 80% • Mostrando 20 cajas por página',
  'reports.colId': 'Identificador',
  'reports.colZone': 'Zona / Cobertura',
  'reports.colTotalPorts': 'Puertos Totales',
  'reports.colFree': 'Libres',
  'reports.colOccupied': 'Ocupados',
  'reports.colSaturation': 'Saturación',
  'reports.colStatus': 'Diagnóstico',
  'reports.saturated': 'SATURADA',
  'reports.alert': 'EN ALERTA',
  'reports.available': 'DISPONIBLE',
  'reports.noNaps': 'No se encontraron cajas NAP con los criterios de búsqueda especificados.',

  // Clients
  'clients.title': 'Padrón de Abonados FTTH',
  'clients.subtitle': 'Gestión de clientes residenciales y corporativos conectados a la red GPON',
  'clients.searchPlaceholder': 'Buscar por nombre, contrato, ONT MAC o dirección...',
  'clients.clientName': 'Nombre del Abonado',
  'clients.contractNumber': 'No. Contrato / Cliente',
  'clients.napAssigned': 'Caja NAP',
  'clients.portAssigned': 'Puerto',
  'clients.ontBrand': 'Marca ONT',
  'clients.ontMac': 'MAC Address ONT',
  'clients.powerRx': 'Potencia Rx',
  'clients.assignNew': 'Asignar Nuevo Cliente',
  'clients.editClient': 'Editar Abonado',
  'clients.releaseConfirm': '¿Seguro que deseas liberar este puerto y desconectar al cliente?',
  'clients.totalActive': 'Total activos',
  'clients.filterBrand': 'Marca ONT',
  'clients.allBrands': 'Todas las marcas',
  'clients.colCode': 'Código',
  'clients.colName': 'Nombre del Abonado',
  'clients.colNap': 'NAP / Puerto',
  'clients.colOnt': 'Equipo ONT',
  'clients.colMac': 'MAC ONT',
  'clients.colPower': 'Potencia Rx',
  'clients.colAddress': 'Dirección',
  'clients.colActions': 'Acciones',
  'clients.noNap': 'Sin NAP asignada',
  'clients.noClients': 'No se encontraron abonados con los criterios de búsqueda especificados.',

  // Navbar & System
  'nav.brandSubtitle': 'Inventario y Mapeo Lógico de Fibra',
  'nav.map': 'Mapa de Red',
  'nav.clients': 'Abonados',
  'nav.reports': 'Reportes PDF',
  'nav.users': 'Personal',
  'nav.themeDark': 'Oscuro',
  'nav.themeLight': 'Claro',
  'nav.online': 'En Línea',
  'nav.offline': 'Modo Offline',
  'nav.sync': 'Sincronizar',
  'nav.downloadApk': 'APK',
  'nav.downloadApkTitle': 'Centro de Descarga e Instalación Móvil (APK / PWA)',
  'nav.profile': 'Perfil',
  'nav.logout': 'Cerrar Sesión',
  'nav.language': 'Idioma',

  // Chatbot
  'chatbot.buttonText': 'Asistente GPON',
  'chatbot.buttonTitle': 'Abrir Asistente GPON',

  // Map
  'map.expand': 'Expandir',
  'map.expandMap': 'Expandir Mapa',
  'map.uploadKmz': 'Subir KMZ',
  'map.downloadKmz': 'Descargar KMZ',
  'map.refresh': 'Actualizar',
  'map.oltOdfLogical': 'Mapeo Lógico OLT / ODF',
  'map.legend': 'Simbología'
};

/**
 * Convierte cualquier identificador camelCase o clave en texto legible en español
 * para asegurar que NINGÚN usuario vea jamás variables crudas con puntos.
 */
const humanizeFallbackKey = (path: string): string => {
  if (EMERGENCY_FALLBACK_LABELS[path]) return EMERGENCY_FALLBACK_LABELS[path];
  const lastSegment = path.split('.').pop() || path;
  return lastSegment
    .replace(/([A-Z])/g, ' $1')
    .replace(/^col\s+/i, '')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'es' || saved === 'en' || saved === 'pt')) {
        return saved;
      }
      // Detección automática del idioma del navegador
      const browserLang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : '';
      if (browserLang.startsWith('pt')) return 'pt';
      if (browserLang.startsWith('en')) return 'en';
    } catch {}
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'pt' ? 'pt-BR' : language;
    }
  }, [language]);

  /**
   * Función de traducción con resolución de claves anidadas (ej. 'nav.map')
   * y sustitución dinámica de parámetros (ej. {mode}, {count}).
   * Garantiza que NINGÚN texto crudo con punto (ej. 'users.totalStaff') se muestre jamás en pantalla.
   */
  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    const currentDict = translations[language] as any;
    const fallbackDict = translations.es as any;

    let result: any = currentDict;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        result = undefined;
        break;
      }
    }

    // Fallback a español si la clave no se encuentra en el idioma actual
    if (typeof result !== 'string' || !result) {
      let fallbackResult: any = fallbackDict;
      for (const key of keys) {
        if (fallbackResult && typeof fallbackResult === 'object' && key in fallbackResult) {
          fallbackResult = fallbackResult[key];
        } else {
          fallbackResult = undefined;
          break;
        }
      }
      result = typeof fallbackResult === 'string' && fallbackResult ? fallbackResult : undefined;
    }

    // Escudo de emergencia: Si aún no se resolvió, buscar en el diccionario plano o humanizar
    if (typeof result !== 'string' || !result) {
      result = humanizeFallbackKey(path);
    }

    if (typeof result === 'string' && params) {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }

    return result;
  };

  const currentLanguageOption =
    AVAILABLE_LANGUAGES.find((opt) => opt.code === language) || AVAILABLE_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: AVAILABLE_LANGUAGES,
        currentLanguageOption
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser utilizado dentro de un LanguageProvider');
  }
  return context;
};
