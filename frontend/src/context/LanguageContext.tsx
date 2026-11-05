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
    if (typeof result !== 'string') {
      let fallbackResult: any = fallbackDict;
      for (const key of keys) {
        if (fallbackResult && typeof fallbackResult === 'object' && key in fallbackResult) {
          fallbackResult = fallbackResult[key];
        } else {
          fallbackResult = undefined;
          break;
        }
      }
      result = typeof fallbackResult === 'string' ? fallbackResult : path;
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

