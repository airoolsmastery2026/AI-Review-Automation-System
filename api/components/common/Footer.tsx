
import * as React from 'react';
import { useI18n } from '../../../contexts/I18nContext';

export const Footer: React.FC = () => {
    const { t } = useI18n();
    return (
        <footer className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-slate-400 bg-slate-900/70 backdrop-blur-md border-t border-slate-500/30">
            <p>{t('appName')} - {t('appSlogan')}</p>
            <p className="mt-1">{t('copyright', { year: new Date().getFullYear().toString() })}</p>
        </footer>
    );
};
