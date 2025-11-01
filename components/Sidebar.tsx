
import React from 'react';
import { Page } from '../types';
import { AnalyticsIcon, DashboardIcon, EditIcon, PublishIcon, SearchIcon, CloseIcon, SparklesIcon, ConnectIcon, TemplateIcon } from './Icons';
import { Video, BookOpen, ShieldCheck, GitBranch, CreditCard } from './LucideIcons';
import { useI18n } from '../hooks/useI18n';

const Logo = () => {
    const { t } = useI18n();
    return (
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-labelledby="logo-title">
               <title id="logo-title">AI System Logo</title>
               <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" className="text-primary-400" />
            </svg>
            <span className="text-xl font-bold text-gray-100 tracking-wide">{t('appName')}</span>
        </div>
    );
};


const navigation = [
    { name: Page.DASHBOARD, icon: DashboardIcon },
    { name: Page.AUTOMATION, icon: SparklesIcon },
    { name: Page.PRODUCT_SCOUT, icon: SearchIcon },
    { name: Page.PROMPT_TEMPLATES, icon: TemplateIcon },
    { name: Page.CONTENT_GENERATOR, icon: EditIcon },
    { name: Page.PUBLISHER, icon: PublishIcon },
    { name: Page.RENDER_QUEUE, icon: Video },
    { name: Page.CONNECTIONS, icon: ConnectIcon },
    { name: Page.ANALYTICS, icon: AnalyticsIcon },
    { name: Page.FINANCE, icon: CreditCard },
    { name: Page.SYSTEM_STATUS, icon: ShieldCheck },
    { name: Page.PROJECT_ROADMAP, icon: GitBranch },
    { name: Page.APP_GUIDE, icon: BookOpen },
];

const NavLink: React.FC<{
    page: Page;
    icon: React.ElementType;
    currentPage: Page;
    onClick: () => void;
}> = ({ page, icon: Icon, currentPage, onClick }) => {
    const { t } = useI18n();
    const isActive = currentPage === page;
    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={`relative flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors group
            ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
        >
            <div className={`absolute left-0 w-1 h-6 rounded-r-sm bg-primary-400 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-y-75'}`}></div>
            <Icon className="mr-3 h-6 w-6" />
            {t(page)}
        </a>
    );
}

const SidebarContent: React.FC<{ currentPage: Page, onNavigate: (page: Page) => void }> = ({ currentPage, onNavigate }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-center px-4 h-16 border-b border-gray-200/10">
                <Logo />
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1.5">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        page={item.name}
                        icon={item.icon}
                        currentPage={currentPage}
                        onClick={() => onNavigate(item.name)}
                    />
                ))}
            </nav>
        </div>
    );
};

export const Sidebar: React.FC<{
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}> = ({ currentPage, setCurrentPage, isOpen, setOpen }) => {
    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setOpen(false); // Close sidebar on mobile after navigation
    };
    
    return (
        <>
            {/* Mobile sidebar with overlay */}
            <div className={`fixed inset-0 z-40 flex md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)}></div>
                <div className="relative flex w-full max-w-xs flex-1 flex-col glass-card border-r border-gray-200/10">
                     <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <CloseIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </button>
                    </div>
                    <SidebarContent currentPage={currentPage} onNavigate={handleNavigate} />
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:inset-y-0">
                <div className="flex flex-col flex-grow bg-gray-900/40 backdrop-blur-lg border-r border-gray-200/10">
                    <SidebarContent currentPage={currentPage} onNavigate={handleNavigate} />
                </div>
            </div>
        </>
    );
};