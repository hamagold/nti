import { useLanguageStore, Language } from '@/store/languageStore';
import { translations, TranslationKeys } from '@/i18n/translations';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}` | K
        : K
      : never
    }[keyof T]
  : never;

type TranslationPath = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return path if translation not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = (path: TranslationPath | string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[language] as unknown as Record<string, unknown>, path);
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
        translation
      );
    }
    
    return translation;
  };
  
  const currentLanguage = language;
  const isRTL = language !== 'en';
  
  return { t, currentLanguage, isRTL };
}

export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    ku: 'کوردی',
    en: 'English',
    ar: 'العربية',
  };
  return names[lang];
}
