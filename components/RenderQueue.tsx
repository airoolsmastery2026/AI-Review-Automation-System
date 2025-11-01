import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { Download } from './LucideIcons';
import type { RenderJob } from '../types';
import { useI18n } from '../hooks/useI18n';

interface RenderQueueProps {
    jobs: RenderJob[];
    setJobs: React.Dispatch<React.SetStateAction<RenderJob[]>>;
}

const statusColors: Record<RenderJob['status'], string> = {
    'Queued': 'bg-slate-100 text-slate-700',
    'Rendering': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Failed': 'bg-red-100 text-red-800',
};

const modelColors: Record<string, string> = {
    'Sora 2': 'border-purple-500',
    'VEO 3.1': 'border-blue-500',
    'Suno': 'border-pink-500',
    'Dreamina': 'border-yellow-500',
    'KlingAI': 'border-green-500',
    'ElevenLabs Voice AI': 'border-cyan-500'
};


export const RenderQueue: React.FC<RenderQueueProps> = ({ jobs, setJobs }) => {
    const { t } = useI18n();
    
    useEffect(() => {
        const interval = setInterval(() => {
            setJobs(prevJobs => 
                prevJobs.map(job => {
                    if (job.status === 'Rendering' && job.progress < 100) {
                        return { ...job, progress: Math.min(job.progress + Math.floor(Math.random() * 10), 100) };
                    }
                    if (job.progress === 100 && job.status === 'Rendering') {
                        return { ...job, status: 'Completed' };
                    }
                    if (job.status === 'Queued') {
                         return { ...job, status: 'Rendering' };
                    }
                    return job;
                })
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [setJobs]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('renderQueue.title')}</CardTitle>
                <CardDescription>{t('renderQueue.description')}</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{t('renderQueue.product')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{t('renderQueue.status')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{t('renderQueue.progress')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{t('renderQueue.models')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{t('renderQueue.created')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{t('renderQueue.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {jobs.length > 0 ? jobs.map(job => (
                            <tr key={job.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{job.productName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[job.status]}`}>
                                        {t(`renderQueue.${job.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    <div className="flex items-center">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${job.progress}%` }}></div>
                                        </div>
                                        <span className="ml-3">{job.progress}%</span>
                                    </div>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    <div className="flex flex-wrap gap-1">
                                        {job.models.map(model => (
                                            <span key={model} className={`px-2 py-0.5 text-xs rounded border ${modelColors[model] || 'border-slate-400'}`}>{model}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(job.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Button size="sm" variant="ghost" disabled={job.status !== 'Completed'}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {t('renderQueue.download')}
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                                    {t('renderQueue.noJobs')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};