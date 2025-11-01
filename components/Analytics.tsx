import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import type { PlatformPerformance, ProductWithContent } from '../types';
import { Youtube, Instagram, TrendingUp } from './LucideIcons';
import { useI18n } from '../hooks/useI18n';

interface AnalyticsProps {
    productsWithContent: ProductWithContent[];
}

const PlatformIcon: React.FC<{platform: string}> = ({ platform }) => {
    switch(platform) {
        case 'YouTube': return <Youtube className="h-6 w-6 text-red-500" />;
        case 'TikTok': return <div className="h-6 w-6 rounded bg-black border border-white p-1"><svg fill="#fff" viewBox="0 0 448 512"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg></div>;
        case 'Instagram': return <Instagram className="h-6 w-6 text-pink-500" />;
        default: return null;
    }
}

const chartTooltipStyle = {
    backgroundColor: 'rgba(2, 6, 23, 0.8)', // slate-950
    borderColor: 'var(--panel-border)',
    color: '#e2e8f0' // slate-200
};

export const Analytics: React.FC<AnalyticsProps> = ({ productsWithContent }) => {
    const { t } = useI18n();
    
    const publishedProducts = productsWithContent.filter(p => p.financials && p.performance);

    if (publishedProducts.length === 0) {
        return (
             <Card>
                <CardHeader className="text-center p-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary-500/10 text-primary-400">
                            <TrendingUp className="h-8 w-8"/>
                        </div>
                    </div>
                    <CardTitle className="text-xl">{t('analytics.noDataTitle')}</CardTitle>
                    <CardDescription>{t('analytics.noDataDescription')}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const revenueData = publishedProducts
      .filter(p => p.financials!.affiliateRevenue > 0)
      .map(p => ({
        name: p.name.slice(0, 15) + (p.name.length > 15 ? '...' : ''),
        revenue: p.financials!.affiliateRevenue,
      }));

    const platformPerformanceData: PlatformPerformance[] = Object.values(
        publishedProducts.reduce((acc, p) => {
            if (p.performance) {
                p.performance.forEach(perf => {
                    if (!acc[perf.platform]) {
                        acc[perf.platform] = { platform: perf.platform, views: 0, likes: 0, shares: 0 };
                    }
                    acc[perf.platform].views += perf.views;
                    acc[perf.platform].likes += perf.likes;
                    acc[perf.platform].shares += perf.shares;
                });
            }
            return acc;
        }, {} as Record<string, PlatformPerformance>)
    );

    // Fix: Explicitly type the initial value for the accumulator to ensure correct type inference for `monthlyViewsData`,
    // which resolves the error when accessing `a.date` and `b.date` in the sort function.
    const monthlyViewsData = publishedProducts.reduce((acc, p) => {
        if (p.financials && p.performance) {
            const date = new Date(p.financials.publishedAt);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            const totalViews = p.performance.reduce((sum, perf) => sum + perf.views, 0);

            if (!acc[monthKey]) {
                acc[monthKey] = { name: monthName, views: 0, date };
            }
            acc[monthKey].views += totalViews;
        }
        return acc;
    }, {} as Record<string, { name: string; views: number; date: Date }>);
    
    const sortedViewsData = Object.values(monthlyViewsData).sort((a,b) => a.date.getTime() - b.date.getTime());

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.viewsOverTime')}</CardTitle>
                        <CardDescription>{t('analytics.viewsDescription')}</CardDescription>
                    </CardHeader>
                    <div className="h-80 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sortedViewsData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Legend wrapperStyle={{color: '#e2e8f0'}}/>
                                <Area type="monotone" dataKey="views" stroke="#00FFFF" strokeWidth={2} fill="url(#colorViews)" activeDot={{ r: 8, fill: '#00FFFF', stroke: '#020617' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.affiliateRevenueByProduct')}</CardTitle>
                        <CardDescription>{t('analytics.revenueDescription')}</CardDescription>
                    </CardHeader>
                    <div className="h-80 p-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={chartTooltipStyle} cursor={{fill: 'rgba(0, 255, 255, 0.05)'}} />
                                <Legend wrapperStyle={{color: '#e2e8f0'}}/>
                                <Bar dataKey="revenue" fill="#00FFFF" fillOpacity={0.7} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
             <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.performanceByPlatform')}</CardTitle>
                  <CardDescription>{t('analytics.performanceDescription')}</CardDescription>
                </CardHeader>
                <div className="p-4 space-y-4">
                  {platformPerformanceData.length > 0 ? platformPerformanceData.map((data) => (
                    <div key={data.platform} className="flex items-center justify-between border-b border-primary-500/20 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center">
                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50">
                            <PlatformIcon platform={data.platform} />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-100">{data.platform}</h3>
                        </div>
                      </div>
                      <div className="flex space-x-6 text-right">
                        <div>
                          <p className="font-medium text-slate-100">{data.views.toLocaleString()}</p>
                          <p className="text-sm text-slate-400">{t('analytics.views')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{data.likes.toLocaleString()}</p>
                          <p className="text-sm text-slate-400">{t('analytics.likes')}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="font-medium text-slate-100">{data.shares.toLocaleString()}</p>
                          <p className="text-sm text-slate-400">{t('analytics.shares')}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-slate-400">
                        {t('finance.noFinancialData')}
                    </div>
                  )}
                </div>
              </Card>
        </div>
    );
};