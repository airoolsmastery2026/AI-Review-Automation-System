





import React from 'react';
import { MenuIcon } from './Icons';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './common/LanguageSwitcher';
import { WorldClock } from './WorldClock';

interface HeaderProps {
    toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { t } = useI18n();
    return (
        <header className="relative z-20 flex-shrink-0 flex h-16 bg-gray-900/60 backdrop-blur-md border-b border-gray-200/10">
             <button
                type="button"
                className="px-4 border-r border-gray-200/10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                onClick={toggleSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex-1 flex items-center">
                   <h1 className="text-xl font-semibold text-gray-100">{t('appName')}</h1>
                </div>
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    <WorldClock />
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
};