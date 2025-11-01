

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { useI18n } from '../hooks/useI18n';
import { AnalyticsIcon, DashboardIcon, EditIcon, PublishIcon, SearchIcon, SparklesIcon, ConnectIcon, TemplateIcon } from './Icons';
import { Video } from './LucideIcons';

const Section: React.FC<{ title: string, id: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, id, icon, children }) => (
    <Card id={id} className="mb-8 transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-500/10">
              {icon}
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
            </div>
        </CardHeader>
        <div className="p-6 prose prose-sm sm:prose-base prose-invert max-w-none">
            {children}
        </div>
    </Card>
);

const tocItems = [
    { id: 'dashboard', key: 'dashboard_title', icon: <DashboardIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'automation', key: 'automation_title', icon: <SparklesIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'productScout', key: 'productScout_title', icon: <SearchIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'promptTemplates', key: 'promptTemplates_title', icon: <TemplateIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'contentGenerator', key: 'contentGenerator_title', icon: <EditIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'publisher', key: 'publisher_title', icon: <PublishIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'renderQueue', key: 'renderQueue_title', icon: <Video className="h-5 w-5 text-primary-600" /> },
    { id: 'connections', key: 'connections_title', icon: <ConnectIcon className="h-5 w-5 text-primary-600" /> },
    { id: 'analytics', key: 'analytics_title', icon: <AnalyticsIcon className="h-5 w-5 text-primary-600" /> },
];

export const AppGuide: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="container mx-auto">
            <Card className="mb-8 text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">{t('appGuide.title')}</CardTitle>
                    <CardDescription>{t('appGuide.description')}</CardDescription>
                </CardHeader>
            </Card>

            <main>
                {tocItems.map(item => (
                    <Section 
                        key={item.id}
                        id={item.id} 
                        title={t(`appGuide.${item.key}`)}
                        icon={React.cloneElement(item.icon, { className: "h-6 w-6 text-primary-600" })}
                    >
                        <p>{t(`appGuide.${item.id}_content`)}</p>
                    </Section>
                ))}
            </main>
        </div>
    );
};