import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { useI18n } from '../hooks/useI18n';
import { Code, Zap, Settings, BookOpen } from './LucideIcons';

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
    { id: 'introduction', key: 'introduction_title', icon: <Code className="h-5 w-5 text-primary-600" /> },
    { id: 'gettingStarted', key: 'gettingStarted_title', icon: <Settings className="h-5 w-5 text-primary-600" /> },
    { id: 'coreFeatures', key: 'coreFeatures_title', icon: <Zap className="h-5 w-5 text-primary-600" /> },
    { id: 'bestPractices', key: 'bestPractices_title', icon: <BookOpen className="h-5 w-5 text-primary-600" /> },
];

export const LlamaCoderGuide: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="container mx-auto">
            <Card className="mb-8 text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">{t('llamaCoderGuide.title')}</CardTitle>
                    <CardDescription>{t('llamaCoderGuide.description')}</CardDescription>
                </CardHeader>
            </Card>

            <main>
                {tocItems.map(item => (
                    <Section 
                        key={item.id}
                        id={item.id} 
                        title={t(`llamaCoderGuide.${item.key}`)}
                        icon={React.cloneElement(item.icon, { className: "h-6 w-6 text-primary-600" })}
                    >
                        <p>{t(`llamaCoderGuide.${item.id}_content`)}</p>
                    </Section>
                ))}
            </main>
        </div>
    );
};