
import React, { createContext, useState, useCallback, useMemo } from 'react';
import { translations } from '../locales/translations';

type Locale = 'en' | 'vi';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, options?: { [key: string]: string }) => string;
}

export const I18nContext = createContext<I18nContextType>({
    locale: 'en',
    setLocale: () => {},
    t: (key: string) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>('en');

    const t = useCallback((key: string, options?: { [key: string]: string }): string => {
        const keys = key.split('.');
        
        const findTranslation = (lang: Locale) => {
            let result: any = translations[lang];
            for (const k of keys) {
                result = result?.[k];
                if (result === undefined) return undefined;
            }
            return result;
        };

        let translation = findTranslation(locale);

        if (translation === undefined) {
            translation = findTranslation('en') || key; // Fallback to English
        }
        
        if (typeof translation === 'string' && options) {
            return translation.replace(/\{(\w+)\}/g, (placeholder, placeholderKey) => {
                return options[placeholderKey] || placeholder;
            });
        }

        return translation;
    }, [locale]);

    const value = useMemo(() => ({
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
