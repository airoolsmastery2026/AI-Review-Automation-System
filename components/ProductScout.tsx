import React, { useState, useEffect, useCallback } from 'react';
import type { Product, ScoutedProduct, RenderJob, Trend } from '../types';
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Search, Star, Clock, Check, X, SkipForward, Bot, TrendingUp } from './LucideIcons';
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

    return <p className="text-xs text-slate-700 flex items-center"><Clock className="h-3 w-3 mr-1" /> {timeLeft}</p>;
};

const StatusBadge: React.FC<{ status: ScoutedProduct['status'] }> = ({ status }) => {
    const { t } = useI18n();
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        skipped: 'bg-slate-200 text-slate-600',
        'auto-producing': 'bg-blue-100 text-blue-800',
    };
    const icons = {
        pending: <Clock className="h-3 w-3 mr-1" />,
        skipped: <SkipForward className="h-3 w-3 mr-1" />,
        'auto-producing': <Bot className="h-3 w-3 mr-1" />,
    }

    if (status === 'approved' || status === 'declined') return null;

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles[status]}`}>
            {icons[status]}
            {t(`productScout.${status}`)}
        </span>
    );
};


const ApprovalCard: React.FC<{ 
    product: ScoutedProduct, 
    onApprove: (id: string) => void,
    onDecline: (id: string) => void,
}> = ({ product, onApprove, onDecline }) => {
    const { t } = useI18n();
    const isActionable = product.status === 'pending';

    return (
        <li className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-opacity duration-300">
            <div className="flex-1 mb-4 sm:mb-0 sm:pr-4">
                <p className="text-lg font-semibold text-slate-800">{product.name}</p>
                <p className="text-sm text-slate-700 mb-2">{t('productScout.suggestedPlan')}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span className="font-bold text-green-600">${product.commission} {t('commission')}</span>
                    <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span>{product.rating}</span>
                    </div>
                </div>
                {isActionable && <CountdownTimer foundAt={product.foundAt} />}
            </div>
            <div className="flex items-center space-x-2">
                <StatusBadge status={product.status} />
                {isActionable && (
                    <>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-100" onClick={() => onDecline(product.id)}><X className="h-4 w-4" /></Button>
                        <Button size="sm" onClick={() => onApprove(product.id)} icon={<Bot className="h-4 w-4"/>}>
                           {t('productScout.approveAndGenerate')}
                        </Button>
                    </>
                )}
            </div>
        </li>
    );
};


interface ProductScoutProps {
    onApproveAndGenerate: (product: Product) => void;
    onAddRenderJob: (job: Omit<RenderJob, 'id'>) => void;
}

export const ProductScout: React.FC<ProductScoutProps> = ({ onApproveAndGenerate, onAddRenderJob }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isHunting, setIsHunting] = useState(false);
    const [trends, setTrends] = useState<Trend[]>([]);
    const [pendingProducts, setPendingProducts] = useState<ScoutedProduct[]>([]);
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
        const scoutedProducts: ScoutedProduct[] = products.map(p => ({
            ...p,
            status: 'pending',
            foundAt: Date.now()
        }));
        setPendingProducts(prev => [...prev, ...scoutedProducts]);
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
    
    const processAutoActions = useCallback(() => {
        const autoApprovedProduct = pendingProducts.find(p => p.status === 'auto-producing');

        if (autoApprovedProduct) {
            onApproveAndGenerate(autoApprovedProduct);
            onAddRenderJob({
                productName: autoApprovedProduct.name,
                status: 'Queued',
                progress: 0,
                createdAt: new Date().toISOString(),
                models: ['VEO 3.1', 'Suno']
            });
            setPendingProducts(prev => prev.filter(p => p.id !== autoApprovedProduct.id));
        }
    }, [pendingProducts, onApproveAndGenerate, onAddRenderJob]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            let hasChanged = false;
            const updatedProducts = pendingProducts.map((p): ScoutedProduct => {
                if (p.status === 'pending') {
                    const elapsed = now - p.foundAt;
                    if (elapsed >= TWO_HOURS) {
                        hasChanged = true;
                        return { ...p, status: 'auto-producing' };
                    } else if (elapsed >= FIFTEEN_MINUTES) {
                        hasChanged = true;
                        return { ...p, status: 'skipped' };
                    }
                }
                return p;
            });
            if (hasChanged) {
                setPendingProducts(updatedProducts);
            }
        }, 5000);
        
        processAutoActions();

        return () => clearInterval(timer);
    }, [pendingProducts, processAutoActions]);


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('productScout.title')}</CardTitle>
                    <CardDescription>{t('productScout.description')}</CardDescription>
                </CardHeader>
                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="product-niche" className="block text-sm font-medium text-slate-700 mb-2">
                           {t('productScout.nicheLabel')}
                        </label>
                        <input
                            id="product-niche"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t('productScout.nichePlaceholder')}
                            className="w-full bg-white/50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                            <h4 className="text-sm font-semibold text-slate-700">{t('productScout.suggestedTrends')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {trends.map((trend) => (
                                    <button
                                        key={trend.topic}
                                        onClick={() => setTopic(trend.topic)}
                                        title={trend.description}
                                        className="px-3 py-1.5 text-sm bg-primary-500/10 text-primary-700 rounded-full hover:bg-primary-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    <ul className="divide-y divide-slate-200">
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