import React, { useState } from 'react';
import type { ProductWithContent, RenderJob } from '../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../hooks/useI18n';
import { AlertTriangle, Upload, X } from './LucideIcons';
import { generateVideo, generateSpeech } from '../services/geminiService';
import { logger } from '../services/loggingService';

interface PublisherProps {
    productsWithContent: ProductWithContent[];
    onAddRenderJob: (job: Omit<RenderJob, 'id'>) => void;
    onPublishProduct: (productId: string) => Promise<void>;
}

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
    isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, productName, isLoading }) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-card w-full max-w-md rounded-lg shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-900/40 border border-yellow-500/30 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left flex-1">
                        <h3 className="text-lg font-semibold leading-6 text-gray-100">
                            {t('publisher.confirmTitle')}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-300">
                                {t('publisher.confirmMessage', { productName })}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 flex flex-row-reverse space-x-2 space-x-reverse">
                    <Button
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {t('publisher.confirmPublish')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        {t('publisher.cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const Publisher: React.FC<PublisherProps> = ({ productsWithContent, onAddRenderJob, onPublishProduct }) => {
    const [creatingVideo, setCreatingVideo] = useState<string | null>(null);
    const [productToPublish, setProductToPublish] = useState<ProductWithContent | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Record<string, string | null>>({}); // { productId: base64 | null }
    const { t } = useI18n();

    const handleImageChange = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // VEO has a 4MB limit for image uploads.
        if (file.size > 4 * 1024 * 1024) {
            alert('Image file size must be less than 4MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImages(prev => ({ ...prev, [productId]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleCreateVideo = async (product: ProductWithContent) => {
        if (!product.content.script) {
            logger.error(`Script not found for product ${product.name}. Cannot create video.`);
            return;
        }

        setCreatingVideo(product.id);
        const imageBase64 = selectedImages[product.id] || undefined;
        try {
            // Generate audio and video in parallel
            const [audioData, operation] = await Promise.all([
                generateSpeech(product.content.script),
                generateVideo(product.content.script, imageBase64)
            ]);
            
            onAddRenderJob({
                productName: product.name,
                status: 'Rendering',
                progress: 5,
                createdAt: new Date().toISOString(),
                models: ['VEO 3.1', 'Gemini TTS'],
                operationName: operation.name,
                audioData: audioData
            });
        } catch (error: any) {
            logger.error(`Video/Audio generation failed for ${product.name}`, { error: error.message });
            if (error.message.includes("API key not valid") || error.message.includes("not found") || error.message.includes("billing")) {
                alert(`${t('publisher.apiKeyErrorTitle')}\n\n${t('publisher.apiKeyErrorMessage')}`);
            }
        } finally {
            setCreatingVideo(null);
        }
    };
    
    const handlePublishClick = (product: ProductWithContent) => {
        setProductToPublish(product);
    };

    const handleConfirmPublish = async () => {
        if (!productToPublish) return;
        setIsPublishing(true);
        try {
            await onPublishProduct(productToPublish.id);
        } catch (e) {
            logger.error(`Failed to publish product ${productToPublish.name}`, { error: e });
        } finally {
            setIsPublishing(false);
            setProductToPublish(null);
        }
    };

    const handleCloseModal = () => {
        setProductToPublish(null);
    };
    
    const readyToPublish = productsWithContent.filter(p => 
        p.content.script && p.content.titles && p.content.seoDescription && p.content.captions
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('publisher.title')}</CardTitle>
                    <CardDescription>{t('publisher.description')}</CardDescription>
                </CardHeader>
                <div className="divide-y divide-gray-700">
                    {readyToPublish.length > 0 ? readyToPublish.map(product => (
                        <div key={product.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-lg font-bold text-gray-100">{product.name}</h3>
                                <p className="text-sm text-gray-400">{t('publisher.readyToPublish')}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div>
                                    {selectedImages[product.id] ? (
                                        <div className="relative group w-20 h-20">
                                            <img src={selectedImages[product.id]!} alt="Start frame preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                            <button
                                                onClick={() => setSelectedImages(prev => ({ ...prev, [product.id]: null }))}
                                                className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                                                aria-label="Remove image"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer w-20 h-20 flex flex-col items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
                                            <Upload className="w-6 h-6 text-gray-400" />
                                            <span className="text-xs text-center text-gray-400 mt-1 px-1">Start Image</span>
                                            <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={e => handleImageChange(product.id, e)} />
                                        </label>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-2">
                                     <Button 
                                        variant="secondary"
                                        isLoading={creatingVideo === product.id}
                                        onClick={() => handleCreateVideo(product)}>
                                        {creatingVideo === product.id ? t('publisher.creatingVideo') : t('publisher.createVideo')}
                                     </Button>
                                     <Button 
                                        onClick={() => handlePublishClick(product)}
                                        disabled={!!product.financials}
                                    >
                                        {product.financials ? t('publisher.published') : t('publisher.publishNow')}
                                     </Button>
                                </div>
                            </div>
                        </div>
                    )) : (
                         <div className="p-4 text-center text-gray-400">
                            {t('publisher.notReady')}
                        </div>
                    )}
                </div>
            </Card>

            <ConfirmationModal 
                isOpen={!!productToPublish}
                onClose={handleCloseModal}
                onConfirm={handleConfirmPublish}
                productName={productToPublish?.name || ''}
                isLoading={isPublishing}
            />
        </>
    );
};