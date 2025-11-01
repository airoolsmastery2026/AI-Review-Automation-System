import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { RenderJob } from '../types';
import { useI18n } from '../hooks/useI18n';
// Fix: Import Search and Video from LucideIcons, and EditIcon and PublishIcon from Icons
import { EditIcon, PublishIcon } from './Icons';
import { Search, Video } from './LucideIcons';

interface SystemLogProps {
    renderJobs: RenderJob[];
}

const getRelativeTime = (date: Date, locale: string) => {
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (seconds < 60) return rtf.format(-seconds, 'second');
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    return date.toLocaleDateString(locale);
};

export const SystemLog: React.FC<SystemLogProps> = ({ renderJobs }) => {
    const { t, locale } = useI18n();

    const logEvents = useMemo(() => {
        const events = [
            { id: 1, icon: <Search className="w-4 h-4 text-blue-400" />, text: "Product Scout Agent found 3 new high-commission products.", time: new Date(Date.now() - 2 * 60 * 1000) },
            { id: 2, icon: <EditIcon className="w-4 h-4 text-green-400" />, text: "Content Agent generated a new script for 'VEO 3.1 Suite'.", time: new Date(Date.now() - 5 * 60 * 1000) },
             { id: 3, icon: <PublishIcon className="w-4 h-4 text-purple-400" />, text: "Publisher Agent successfully posted 'KlingAI Review' to YouTube.", time: new Date(Date.now() - 35 * 60 * 1000) },
        ];
        
        renderJobs.forEach(job => {
            events.push({
                id: job.id,
                icon: <Video className="w-4 h-4 text-cyan-400" />,
                text: `Video Agent: Job for '${job.productName}' is now ${t(`renderQueue.${job.status}`)}.`,
                time: new Date(job.createdAt)
            })
        });

        return events.sort((a, b) => b.time.getTime() - a.time.getTime());

    }, [renderJobs, t]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="!p-4 !mb-0">
                <CardTitle className="text-lg">{t('dashboard.systemLogTitle')}</CardTitle>
                <CardDescription>{t('dashboard.systemLogDescription')}</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                {logEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-1 bg-slate-800/70 p-2 rounded-full ring-1 ring-slate-700">
                           {event.icon}
                        </div>
                        <div>
                            <p className="text-sm text-slate-200">{event.text}</p>
                            <p className="text-xs text-slate-500">{getRelativeTime(event.time, locale)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};