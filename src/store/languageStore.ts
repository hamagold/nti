import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ku' | 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ku',
      dir: 'rtl',
      setLanguage: (language) => {
        const dir = language === 'en' ? 'ltr' : 'rtl';
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
        set({ language, dir });
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dir = state.dir;
          document.documentElement.lang = state.language;
        }
      },
    }
  )
);
