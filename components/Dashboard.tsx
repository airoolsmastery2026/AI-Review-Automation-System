




import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { VideoIdea, RenderJob } from '../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { Youtube, GitBranch, Share2, Check, Video } from './LucideIcons';
import { useI18n } from '../hooks/useI18n';

interface DashboardProps {
    videoIdeas: VideoIdea[];
    renderJobs: RenderJob[];
}

const revenueData = [
  { name: 'Jan', revenue: 120 },
  { name: 'Feb', revenue: 190 },
  { name: 'Mar', revenue: 150 },
  { name: 'Apr', revenue: 210 },
  { name: 'May', revenue: 250 },
  { name: 'Jun', revenue: 310 },
];

const renderTikTokIcon = () => (
    <div className="h-4 w-4 rounded-sm bg-black border border-white p-0.5 flex items-center justify-center">
        <svg fill="#fff" viewBox="0 0 448 512" className="w-full h-full"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ videoIdeas, renderJobs }) => {
    const { t } = useI18n();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-400 text-sm font-medium">{t('dashboard.totalViews')}</p>
                    <p className="text-3xl font-bold text-white">5.6M</p>
                </Card>
                 <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-400 text-sm font-medium">{t('dashboard.totalEarnings')}</p>
                    <p className="text-3xl font-bold text-white">$12,450</p>
                </Card>
                 <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-400 text-sm font-medium">{t('dashboard.videosCreated')}</p>
                    <p className="text-3xl font-bold text-white">82</p>
                </Card>
                 <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-400 text-sm font-medium">{t('dashboard.conversionRate')}</p>
                    <p className="text-3xl font-bold text-white">12.5%</p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{t('dashboard.revenue_trends')}</CardTitle>
                            <CardDescription>+25% {t('Last Month')}</CardDescription>
                        </CardHeader>
                        <div className="h-80 pr-4 p-4">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(26, 32, 44, 0.7)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#E5E7EB'
                                        }} 
                                    />
                                    <XAxis dataKey="name" stroke="#6B7280" dy={5} />
                                    <YAxis stroke="#6B7280" dx={-5} unit="$" />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.videoIdeasTitle')}</CardTitle>
                        <CardDescription>{t('dashboard.videoIdeasDescription')}</CardDescription>
                    </CardHeader>
                     <div className="p-4 space-y-3">
                        {videoIdeas.map(idea => (
                            <div key={idea.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
                                <div className="flex items-center">
                                    <Youtube className="w-4 h-4 mr-3 text-red-500" />
                                    <span className="text-gray-300 text-sm">{idea.title}</span>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    idea.status === "Generated" ? "bg-blue-500/20 text-blue-300" :
                                    idea.status === "In Production" ? "bg-yellow-500/20 text-yellow-300" :
                                    "bg-green-500/20 text-green-300"
                                }`}>{t(`automation.${idea.status}`)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};