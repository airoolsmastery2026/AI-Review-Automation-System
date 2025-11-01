import React, { useState, useEffect } from 'react';
import type { Product, ScoutedProduct, Trend } from '../types';
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Search, Star, Clock, Check, X, SkipForward, Bot, TrendingUp, DollarSign } from './LucideIcons';
import { useI18n } from '../hooks/useI18n';
import { scoutForProducts, huntForTrends } from '../services/geminiService';
import { Spinner } from './common/Spinner';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const TWO_HOURS = 2 * 60 * 60 * 1000;

const CountdownTimer: React.FC<{ foundAt: number }> = ({ foundAt }) => {
    const { t } = useI18n();
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = now - foundAt;

            if (elapsed < FIFTEEN_MINUTES) {
                const remaining = FIFTEEN_MINUTES - elapsed;
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setTimeLeft(t('productScout.skipsIn', { time: `${minutes}m ${seconds}s` }));
            } else if (elapsed < TWO_HOURS) {
                const remaining = TWO_HOURS - elapsed;
                const hours = Math.floor(remaining / 3600000);
                const minutes = Math.floor((remaining % 3600000) / 60000);
                setTimeLeft(t('productScout.autoProducesIn', { time: `${hours}h ${minutes}m`}));
            } else {
                setTimeLeft('');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [foundAt, t]);

    return <p className="text-xs text-gray-400 flex items-center mt-1"><Clock className="h-3 w-3 mr-1" /> {timeLeft}</p>;
};

const RpmBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' | undefined }> = ({ level }) => {
    const { t } = useI18n();
    if (!level) return null;
    const styles = {
        Low: 'bg-red-500/20 text-red-300',
        Medium: 'bg-yellow-500/20 text-yellow-300',
        High: 'bg-green-500/20 text-green-300',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center ${styles[level]}`}>{t(`productScout.rpm_${level}`)}</span>;
}

const ApprovalCard: React.FC<{ 
    product: ScoutedProduct, 
    onApprove: (id: string) => void,
    onDecline: (id: string) => void,
}> = ({ product, onApprove, onDecline }) => {
    const { t } = useI18n();
    const isActionable = product.status === 'pending';
    const scoreColor = (product.opportunityScore || 0) > 75 ? 'text-green-400' : (product.opportunityScore || 0) > 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <li className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-opacity duration-300">
            <div className="flex-1 mb-4 sm:mb-0 sm:pr-4">
                <p className="text-lg font-semibold text-gray-100">{product.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                   <div className="text-center">
                        <p className={`text-2xl font-bold ${scoreColor}`}>{product.opportunityScore || 'N/A'}</p>
                        <p className="text-xs font-medium text-gray-500">{t('productScout.opportunityScore')}</p>
                    </div>
                     <div className="border-l border-gray-700 pl-4 space-y-1">
                        <div className="flex items-center" title={t('productScout.affiliateScore')}>
                            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-semibold">{product.affiliateScore?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center" title={t('productScout.rpmPotential')}>
                            <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                            <RpmBadge level={product.rpmPotential} />
                        </div>
                    </div>
                </div>
                {isActionable && <CountdownTimer foundAt={product.foundAt} />}
            </div>
            <div className="flex flex-col items-end space-y-2">
                 {isActionable ? (
                    <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => onDecline(product.id)}><X className="h-4 w-4" /></Button>
                        <Button size="sm" onClick={() => onApprove(product.id)} icon={<Bot className="h-4 w-4"/>}>
                           {t('productScout.approveAndGenerate')}
                        </Button>
                    </div>
                ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center ${product.status === 'skipped' ? 'bg-gray-700 text-gray-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {product.status === 'skipped' ? <SkipForward className="h-3 w-3 mr-1" /> : <Bot className="h-3 w-3 mr-1" />}
                        {t(`productScout.${product.status}`)}
                    </span>
                )}
            </div>
        </li>
    );
};


interface ProductScoutProps {
    onApproveAndGenerate: (product: Product) => void;
    pendingProducts: ScoutedProduct[];
    setPendingProducts: React.Dispatch<React.SetStateAction<ScoutedProduct[]>>;
}

export const ProductScout: React.FC<ProductScoutProps> = ({ onApproveAndGenerate, pendingProducts, setPendingProducts }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isHunting, setIsHunting] = useState(false);
    const [trends, setTrends] = useState<Trend[]>([]);
    const [topic, setTopic] = useState('');
    const { t } = useI18n();

    const handleHuntTrends = async () => {
        setIsHunting(true);
        const fetchedTrends = await huntForTrends();
        setTrends(fetchedTrends);
        setIsHunting(false);
    };

    const handleScout = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        const products = await scoutForProducts(topic);
        setPendingProducts(prev => [...prev, ...products]);
        setIsLoading(false);
    };

    const handleApprove = (id: string) => {
        const product = pendingProducts.find(p => p.id === id);
        if (product) {
            onApproveAndGenerate(product);
            setPendingProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleDecline = (id: string) => {
        setPendingProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('productScout.title')}</CardTitle>
                    <CardDescription>{t('productScout.description')}</CardDescription>
                </CardHeader>
                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="product-niche" className="block text-sm font-medium text-gray-300 mb-2">
                           {t('productScout.nicheLabel')}
                        </label>
                        <input
                            id="product-niche"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t('productScout.nichePlaceholder')}
                            className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex justify-center">
                        <Button
                            onClick={handleScout}
                            isLoading={isLoading}
                            disabled={isLoading || !topic.trim()}
                            icon={<Search className="h-5 w-5"/>}
                        >
                            {t('productScout.button')}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('productScout.trendHunterTitle')}</CardTitle>
                    <CardDescription>{t('productScout.trendHunterDescription')}</CardDescription>
                </CardHeader>
                <div className="p-4 space-y-4">
                    <div className="flex justify-center">
                        <Button
                            onClick={handleHuntTrends}
                            isLoading={isHunting}
                            disabled={isHunting}
                            variant="secondary"
                            icon={<TrendingUp className="h-5 w-5"/>}
                        >
                            {t('productScout.huntTrendsButton')}
                        </Button>
                    </div>
                    {isHunting && <div className="flex justify-center py-4"><Spinner /></div>}
                    {trends.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-300">{t('productScout.suggestedTrends')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {trends.map((trend) => (
                                    <button
                                        key={trend.topic}
                                        onClick={() => setTopic(trend.topic)}
                                        title={trend.description}
                                        className="px-3 py-1.5 text-sm bg-primary-500/10 text-primary-300 rounded-full hover:bg-primary-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {trend.topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {(pendingProducts.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('productScout.approvalTitle')}</CardTitle>
                        <CardDescription>{t('productScout.approvalDescription')}</CardDescription>
                    </CardHeader>
                    <ul className="divide-y divide-gray-700">
                        {pendingProducts.map((product) => (
                            <ApprovalCard 
                                key={product.id}
                                product={product}
                                onApprove={handleApprove}
                                onDecline={handleDecline}
                            />
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};