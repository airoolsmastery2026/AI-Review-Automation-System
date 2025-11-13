import * as React from 'react';
import { translations } from '../locales/translations';

type Locale = 'en' | 'vi';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, options?: { [key: string]: string }) => string;
}

// --- Context ---
export const I18nContext = React.createContext<I18nContextType | null>(null);

// --- Provider ---
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocale] = React.useState<Locale>('en');

    const t = React.useCallback((key: string, options?: { [key: string]: string }): string => {
        const findTranslation = (lang: Locale, translationKey: string): string | undefined => {
            const keys = translationKey.split('.');
            let result: any = translations[lang];
            for (const k of keys) {
                result = result?.[k];
                if (result === undefined) return undefined;
            }
            // Ensure we only return strings, not objects.
            if (typeof result === 'string') {
                return result;
            }
            return undefined;
        };

        let translation = findTranslation(locale, key) ?? findTranslation('en', key) ?? key;

        if (options) {
            return translation.replace(/\{(\w+)\}/g, (placeholder, placeholderKey) => {
                return options[placeholderKey] || placeholder;
            });
        }
        
        return translation;
    }, [locale]);


    const value = React.useMemo(() => ({
        locale,
        setLocale,
        t,
    }), [locale, t]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

// --- Hook ---
export const useI18n = (): I18nContextType => {
  const context = React.useContext(I18nContext);
  if (!context) {
    console.warn('⚠️ useI18n called outside I18nProvider — using fallback.');
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: string) => key,
    };
  }
  return context;
};