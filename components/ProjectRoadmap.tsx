import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { useI18n } from '../hooks/useI18n';
import type { RoadmapTask, RoadmapStatus, ChangelogEntry } from '../types';
import { GitBranch, ClipboardList, CheckCircle } from './LucideIcons';

const roadmapTasks: RoadmapTask[] = [
    // Planned
    { id: '1', titleKey: 'projectRoadmap.task1_title', descriptionKey: 'projectRoadmap.task1_desc', status: 'Planned', tags: ['Backend', 'Security', 'Critical'] },
    { id: '2', titleKey: 'projectRoadmap.task2_title', descriptionKey: 'projectRoadmap.task2_desc', status: 'Planned', tags: ['Analytics', 'UI/UX'] },
    { id: '3', titleKey: 'projectRoadmap.task3_title', descriptionKey: 'projectRoadmap.task3_desc', status: 'Planned', tags: ['Video', 'Feature'] },
    { id: '4', titleKey: 'projectRoadmap.task4_title', descriptionKey: 'projectRoadmap.task4_desc', status: 'Planned', tags: ['i18n', 'AI'] },
    // In Progress
    { id: '8', titleKey: 'projectRoadmap.task8_title', descriptionKey: 'projectRoadmap.task8_desc', status: 'In Progress', tags: ['Architecture', 'Frontend'] },
    // Completed
    { id: '7', titleKey: 'projectRoadmap.task7_title', descriptionKey: 'projectRoadmap.task7_desc', status: 'Completed', tags: ['System', 'Monitoring', 'Frontend'] },
    { id: '6', titleKey: 'projectRoadmap.task6_title', descriptionKey: 'projectRoadmap.task6_desc', status: 'Completed', tags: ['AI', 'Core Feature'] },
    { id: '5', titleKey: 'projectRoadmap.task5_title', descriptionKey: 'projectRoadmap.task5_desc', status: 'Completed', tags: ['Architecture'] },
];

const changelogEntries: ChangelogEntry[] = [
    { version: '1.3.0', date: '2024-07-29', changeKeys: ['projectRoadmap.v1_3_0_change1', 'projectRoadmap.v1_3_0_change2'] },
    { version: '1.2.0', date: '2024-07-25', changeKeys: ['projectRoadmap.v1_2_0_change1', 'projectRoadmap.v1_2_0_change2'] },
    { version: '1.1.0', date: '2024-07-20', changeKeys: ['projectRoadmap.v1_1_0_change1', 'projectRoadmap.v1_1_0_change2'] },
    { version: '1.0.0', date: '2024-07-15', changeKeys: ['projectRoadmap.v1_0_0_change1'] },
];

const tagColors: Record<string, string> = {
    'Backend': 'bg-red-200 text-red-800',
    'Security': 'bg-red-200 text-red-800',
    'Critical': 'bg-red-200 text-red-800',
    'Analytics': 'bg-blue-200 text-blue-800',
    'UI/UX': 'bg-blue-200 text-blue-800',
    'Video': 'bg-purple-200 text-purple-800',
    'Feature': 'bg-purple-200 text-purple-800',
    'i18n': 'bg-yellow-200 text-yellow-800',
    'AI': 'bg-yellow-200 text-yellow-800',
    'System': 'bg-green-200 text-green-800',
    'Monitoring': 'bg-green-200 text-green-800',
    'Frontend': 'bg-indigo-200 text-indigo-800',
    'Architecture': 'bg-gray-300 text-gray-800',
    'Core Feature': 'bg-green-200 text-green-800',
};

const RoadmapCard: React.FC<{ task: RoadmapTask }> = ({ task }) => {
    const { t } = useI18n();
    return (
        <div className="bg-white/80 p-4 rounded-lg shadow-md border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">{t(task.titleKey)}</h3>
            <p className="text-sm text-slate-600 my-2">{t(task.descriptionKey)}</p>
            <div className="flex flex-wrap gap-2 mt-3">
                {task.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[tag] || 'bg-gray-200 text-gray-800'}`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

const RoadmapColumn: React.FC<{ title: string, tasks: RoadmapTask[], status: RoadmapStatus }> = ({ title, tasks }) => {
    const statusColors: Record<RoadmapStatus, string> = {
        'Planned': 'border-t-blue-500',
        'In Progress': 'border-t-yellow-500',
        'Completed': 'border-t-green-500',
    };
    return (
        <div className={`flex-1 min-w-[300px] bg-slate-100 rounded-lg shadow-inner ${statusColors[status]}`}>
            <h2 className="text-lg font-semibold text-slate-700 p-4 border-b border-slate-200 sticky top-0 bg-slate-100/80 backdrop-blur-sm rounded-t-lg">{title}</h2>
            <div className="p-4 space-y-4">
                {tasks.map(task => <RoadmapCard key={task.id} task={task} />)}
            </div>
        </div>
    );
};

export const ProjectRoadmap: React.FC = () => {
    const { t } = useI18n();

    const getTasksByStatus = (status: RoadmapStatus) => roadmapTasks.filter(task => task.status === status);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="text-center !p-6">
                    <CardTitle className="text-2xl">{t('projectRoadmap.title')}</CardTitle>
                    <CardDescription>{t('projectRoadmap.description')}</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex items-center space-x-3">
                    <GitBranch className="h-6 w-6 text-primary-500" />
                    <CardTitle>{t('projectRoadmap.roadmapTitle')}</CardTitle>
                </CardHeader>
                <div className="p-4">
                    <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto">
                        <RoadmapColumn title={t('projectRoadmap.planned')} tasks={getTasksByStatus('Planned')} status="Planned" />
                        <RoadmapColumn title={t('projectRoadmap.inProgress')} tasks={getTasksByStatus('In Progress')} status="In Progress" />
                        <RoadmapColumn title={t('projectRoadmap.completed')} tasks={getTasksByStatus('Completed')} status="Completed" />
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader className="flex items-center space-x-3">
                    <ClipboardList className="h-6 w-6 text-primary-500" />
                    <CardTitle>{t('projectRoadmap.changelogTitle')}</CardTitle>
                </CardHeader>
                <div className="p-4 space-y-6">
                    {changelogEntries.map(entry => (
                        <div key={entry.version} className="relative pl-8">
                            <div className="absolute left-0 top-1 flex items-center">
                                <span className="h-3 w-3 bg-primary-500 rounded-full ring-4 ring-slate-200"></span>
                                <div className="h-px w-5 bg-slate-300"></div>
                            </div>
                            <div className="border border-slate-200 rounded-lg p-4 bg-white/50">
                                <div className="flex items-baseline space-x-3">
                                    <h3 className="font-bold text-lg text-slate-800">{t('projectRoadmap.version')} {entry.version}</h3>
                                    <p className="text-sm text-slate-500">{entry.date}</p>
                                </div>
                                <ul className="mt-2 list-none space-y-1">
                                    {entry.changeKeys.map(changeKey => (
                                        <li key={changeKey} className="flex items-start text-sm text-slate-700">
                                            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                            <span>{t(changeKey)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};