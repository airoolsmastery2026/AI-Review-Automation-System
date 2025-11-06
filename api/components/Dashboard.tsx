
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProductWithContent, RenderJob } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { SystemLog } from './SystemLog';
import { useI18n } from '../../hooks/useI18n';
import { TrendingUp, DollarSign, BarChart3, Eye } from './LucideIcons';

interface DashboardProps {
    productsWithContent: ProductWithContent[];
    renderJobs: RenderJob[];
}

export const Dashboard: React.FC<DashboardProps> = ({ productsWithContent, renderJobs }) => {
    const { t } = useI18n();

    const publishedProducts = productsWithContent.filter(p => p.financials);
    
    const totalRevenue = publishedProducts.reduce((sum, p) => sum + (p.financials?.affiliateRevenue || 0), 0);
    const totalCost = publishedProducts.reduce((sum, p) => sum + (p.financials?.productionCost || 0), 0);
    const netProfit = totalRevenue - totalCost;
    
    const totalInvested = publishedProducts.reduce((sum, p) => sum + (p.financials?.productionCost || 0), 0);
    const averageROI = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    const profitData = publishedProducts
      .sort((a, b) => new Date(a.financials!.publishedAt).getTime() - new Date(b.financials!.publishedAt).getTime())
      .map(p => ({
        name: p.name.slice(0, 10) + (p.name.length > 10 ? '...' : ''),
        profit: (p.financials!.affiliateRevenue - p.financials!.productionCost),
      }));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">{t('dashboard.welcome_title')}</CardTitle>
                    <CardDescription>{t('dashboard.welcome_description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-400 mr-4"><DollarSign className="h-6 w-6"/></div>
                        <div>
                            <p className="text-sm text-gray-400">{t('dashboard.totalRevenue')}</p>
                            <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                     <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-500/10 text-red-400 mr-4"><BarChart3 className="h-6 w-6"/></div>
                        <div>
                            <p className="text-sm text-gray-400">{t('dashboard.totalCost')}</p>
                            <p className="text-2xl font-bold text-white">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                     <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mr-4"><Eye className="h-6 w-6"/></div>
                        <div>
                             <p className="text-sm text-gray-400">{t('dashboard.netProfit')}</p>
                            <p className="text-2xl font-bold text-white">${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                     <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400 mr-4"><TrendingUp className="h-6 w-6"/></div>
                        <div>
                            <p className="text-sm text-gray-400">{t('dashboard.avgROI')}</p>
                            <p className="text-2xl font-bold text-white">{averageROI.toFixed(1)}%</p>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{t('dashboard.revenue_trends')}</CardTitle>
                        </CardHeader>
                        <div className="h-80 pr-4 p-4">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={profitData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
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
                                    <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="url(#colorProfit)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <SystemLog renderJobs={renderJobs} />
                </div>
            </div>
        </div>
    );
};