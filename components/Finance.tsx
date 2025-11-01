import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProductWithContent } from '../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { useI18n } from '../hooks/useI18n';
import { DollarSign, TrendingUp, BarChart3 } from './LucideIcons';

interface FinanceProps {
    productsWithContent: ProductWithContent[];
}

const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const Finance: React.FC<FinanceProps> = ({ productsWithContent }) => {
    const { t } = useI18n();

    const financialProducts = productsWithContent
        .filter(p => p.financials)
        .map(p => ({
            ...p,
            profit: (p.financials!.affiliateRevenue - p.financials!.productionCost),
            roi: p.financials!.productionCost > 0 ? ((p.financials!.affiliateRevenue - p.financials!.productionCost) / p.financials!.productionCost) * 100 : 0,
        }))
        .sort((a, b) => new Date(a.financials!.publishedAt).getTime() - new Date(b.financials!.publishedAt).getTime());

    const totalRevenue = financialProducts.reduce((sum, p) => sum + p.financials!.affiliateRevenue, 0);
    const totalCost = financialProducts.reduce((sum, p) => sum + p.financials!.productionCost, 0);
    const netProfit = totalRevenue - totalCost;

    let cumulativeProfit = 0;
    const netProfitData = financialProducts.map(p => {
        cumulativeProfit += p.profit;
        return {
            name: new Date(p.financials!.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            netProfit: cumulativeProfit,
        };
    });
    
    if (financialProducts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('finance.title')}</CardTitle>
                    <CardDescription>{t('finance.description')}</CardDescription>
                </CardHeader>
                <div className="p-8 text-center text-gray-500">
                    <p>{t('finance.noFinancialData')}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">{t('finance.title')}</CardTitle>
                    <CardDescription>{t('finance.description')}</CardDescription>
                </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-400 mr-4"><DollarSign className="h-6 w-6"/></div>
                        <div>
                            <p className="text-sm text-gray-400">{t('finance.totalRevenue')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                     <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-500/10 text-red-400 mr-4"><BarChart3 className="h-6 w-6"/></div>
                        <div>
                            <p className="text-sm text-gray-400">{t('finance.totalCost')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                     <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mr-4"><TrendingUp className="h-6 w-6"/></div>
                        <div>
                             <p className="text-sm text-gray-400">{t('finance.netProfit')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(netProfit)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('finance.netProfitOverTime')}</CardTitle>
                </CardHeader>
                <div className="h-80 pr-4 p-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={netProfitData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorProfitFinance" x1="0" y1="0" x2="0" y2="1">
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
                            <Area type="monotone" dataKey="netProfit" stroke="#3b82f6" fill="url(#colorProfitFinance)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('finance.videoPerformanceBreakdown')}</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('finance.product')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('finance.productionCost')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('finance.affiliateRevenue')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('finance.profit')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('finance.roi')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {financialProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-800/40">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{formatCurrency(product.financials!.productionCost)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{formatCurrency(product.financials!.affiliateRevenue)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${product.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(product.profit)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${product.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {product.roi.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};