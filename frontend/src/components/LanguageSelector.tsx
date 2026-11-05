import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '../translations';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'compact' | 'login';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'navbar' }) => {
  const { language, setLanguage, languages, currentLanguageOption, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const getDropdownHeaderTitle = () => {
    switch (language) {
      case 'en':
        return 'Select Language';
      case 'pt':
        return 'Selecionar Idioma';
      default:
        return 'Seleccionar Idioma';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer font-semibold shadow-xs select-none ${
          variant === 'login'
            ? 'px-3 py-1.5 text-xs bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-200'
            : 'p-1.5 sm:px-2.5 sm:py-1 text-xs border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title={t('nav.language')}
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        <span className="hidden sm:inline font-semibold text-xs whitespace-nowrap">
          {currentLanguageOption.label}
        </span>
        <span className="sm:hidden font-mono font-bold text-[11px] tracking-wide">
          {currentLanguageOption.badge}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-1.5 z-[100] animate-fadeIn text-slate-800 dark:text-slate-100 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {getDropdownHeaderTitle()}
          </div>
          <div className="py-1">
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.badge}
                    </span>
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.nativeLabel}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

