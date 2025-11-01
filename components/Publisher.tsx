import React, { useState } from 'react';
import type { ProductWithContent, RenderJob } from '../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../hooks/useI18n';

interface PublisherProps {
    productsWithContent: ProductWithContent[];
    onAddRenderJob: (job: Omit<RenderJob, 'id'>) => void;
}

export const Publisher: React.FC<PublisherProps> = ({ productsWithContent, onAddRenderJob }) => {
    const [published, setPublished] = useState<Record<string, string | null>>({});
    const [creatingVideo, setCreatingVideo] = useState<string | null>(null);
    const { t } = useI18n();

    const handleCreateVideo = (product: ProductWithContent) => {
        setCreatingVideo(product.id);
        setTimeout(() => {
            onAddRenderJob({
                productName: product.name,
                status: 'Queued',
                progress: 0,
                createdAt: new Date().toISOString(),
                models: ['VEO 3.1', 'Suno', 'ElevenLabs Voice AI']
            });
            setCreatingVideo(null);
        }, 1500);
    };

    const handlePublish = (productId: string) => {
        setPublished(prev => ({ ...prev, [productId]: 'Publishing...' }));
        setTimeout(() => {
             setPublished(prev => ({ ...prev, [productId]: 'Published!' }));
        }, 2000)
    };
    
    const readyToPublish = productsWithContent.filter(p => 
        p.content.script && p.content.titles && p.content.seoDescription && p.content.captions
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('publisher.title')}</CardTitle>
                <CardDescription>{t('publisher.description')}</CardDescription>
            </CardHeader>
            <div className="divide-y divide-slate-200">
                {readyToPublish.length > 0 ? readyToPublish.map(product => (
                    <div key={product.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                            <p className="text-sm text-slate-700">{t('publisher.readyToPublish')}</p>
                        </div>
                        <div className="flex space-x-2">
                             <Button 
                                variant="secondary"
                                isLoading={creatingVideo === product.id}
                                onClick={() => handleCreateVideo(product)}>
                                {creatingVideo === product.id ? t('publisher.creatingVideo') : t('publisher.createVideo')}
                             </Button>
                             <Button 
                                onClick={() => handlePublish(product.id)}
                                disabled={!!published[product.id]}
                            >
                                {published[product.id] || t('publisher.publishNow')}
                             </Button>
                        </div>
                    </div>
                )) : (
                     <div className="p-4 text-center text-slate-700">
                        {t('publisher.notReady')}
                    </div>
                )}
            </div>
        </Card>
    );
};