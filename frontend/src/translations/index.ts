import { es } from './es';
import { en } from './en';
import { pt } from './pt';

export type Language = 'es' | 'en' | 'pt';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  badge: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', nativeLabel: 'Español', badge: 'ES' },
  { code: 'en', label: 'English', nativeLabel: 'English', badge: 'EN' },
  { code: 'pt', label: 'Português (Brasil)', nativeLabel: 'Português do Brasil', badge: 'PT' }
];

export const translations = {
  es,
  en,
  pt
};

export type TranslationSchema = typeof es;

