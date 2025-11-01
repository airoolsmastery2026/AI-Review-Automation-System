
import React from 'react';
import { useI18n } from '../../hooks/useI18n';

export const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useI18n();

    const baseClasses = "px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200";
    const activeClasses = "bg-primary-600 text-white shadow-sm";
    const inactiveClasses = "text-slate-600 hover:bg-primary-500/10 hover:text-primary-600";

    return (
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
                onClick={() => setLocale('en')}
                className={`${baseClasses} ${locale === 'en' ? activeClasses : inactiveClasses}`}
            >
                EN
            </button>
            <button
                onClick={() => setLocale('vi')}
                className={`${baseClasses} ${locale === 'vi' ? activeClasses : inactiveClasses}`}
            >
                VI
            </button>
        </div>
    );
};
