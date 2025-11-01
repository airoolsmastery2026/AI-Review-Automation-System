import React, { useState, useCallback, useEffect } from 'react';
import type { Product, GeneratedContent } from '../types';
import { GenerationType } from '../types';
import {
    generateReviewScript,
    generateVideoTitles,
    generateSeoDescription,
    generateCaptionsAndHashtags
} from '../services/geminiService';
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Spinner } from './common/Spinner';
import { useI18n } from '../hooks/useI18n';

interface ContentGeneratorProps {
    products: Product[];
    generatedContent: Record<string, GeneratedContent>;
    onContentUpdate: (productId: string, newContent: Partial<GeneratedContent>) => void;
    productToAutoGenerate: string | null;
    onGenerationComplete: () => void;
}

const GenerationSection: React.FC<{
    title: string;
    children: React.ReactNode;
    onGenerate: () => void;
    isLoading: boolean;
    isGenerated: boolean;
}> = ({ title, children, onGenerate, isLoading, isGenerated }) => {
    const { t } = useI18n();
    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {isGenerated ? t('contentGenerator.generatedSuccess') : t('contentGenerator.generateDescription', { type: title.toLowerCase() })}
                    </CardDescription>
                </div>
                <Button onClick={onGenerate} isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? t('contentGenerator.generating') : isGenerated ? t('contentGenerator.regenerate') : t('contentGenerator.generate')}
                </Button>
            </CardHeader>
            {isLoading && !isGenerated && <div className="flex justify-center p-8"><Spinner/></div>}
            {isGenerated && <div className="prose prose-sm max-w-none p-4 bg-gray-800/50 rounded-b-lg text-gray-300 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-invert">{children}</div>}
        </Card>
    );
};

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ products, generatedContent, onContentUpdate, productToAutoGenerate, onGenerationComplete }) => {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(products.length > 0 ? products[0].id : null);
    const [loadingStates, setLoadingStates] = useState<Record<GenerationType, boolean>>({
        [GenerationType.SCRIPT]: false,
        [GenerationType.TITLES]: false,
        [GenerationType.DESCRIPTION]: false,
        [GenerationType.CAPTIONS]: false,
    });
    const { t } = useI18n();

    const handleGeneration = useCallback(async (type: GenerationType, overrideProduct?: Product) => {
        const product = overrideProduct || products.find(p => p.id === selectedProductId);
        if (!product) return;

        setLoadingStates(prev => ({ ...prev, [type]: true }));

        try {
            switch (type) {
                case GenerationType.SCRIPT:
                    const script = await generateReviewScript(product);
                    onContentUpdate(product.id, { script });
                    break;
                case GenerationType.TITLES:
                    const titles = await generateVideoTitles(product.name);
                    onContentUpdate(product.id, { titles });
                    break;
                case GenerationType.DESCRIPTION:
                    const seoDescription = await generateSeoDescription(product.name);
                    onContentUpdate(product.id, { seoDescription });
                    break;
                case GenerationType.CAPTIONS:
                    const captions = await generateCaptionsAndHashtags(product.name);
                    onContentUpdate(product.id, { captions });
                    break;
            }
        } catch (error) {
            console.error(`Error generating ${type}:`, error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [type]: false }));
        }
    }, [selectedProductId, products, onContentUpdate]);

    useEffect(() => {
        if (productToAutoGenerate) {
            const product = products.find(p => p.id === productToAutoGenerate);
            if (product) {
                setSelectedProductId(product.id);
                const content = generatedContent[product.id] || {};
                
                // Automatically generate all content types if they don't exist
                if (!content.script) { handleGeneration(GenerationType.SCRIPT, product); }
                if (!content.titles) { handleGeneration(GenerationType.TITLES, product); }
                if (!content.seoDescription) { handleGeneration(GenerationType.DESCRIPTION, product); }
                if (!content.captions) { handleGeneration(GenerationType.CAPTIONS, product); }
            }
            // Clear the trigger state in App.tsx once generation has been initiated
            onGenerationComplete();
        }
    }, [productToAutoGenerate, products, generatedContent, handleGeneration, onGenerationComplete]);


    const selectedProductContent = selectedProductId ? generatedContent[selectedProductId] : undefined;

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>{t('contentGenerator.title')}</CardTitle>
                    <CardDescription>{t('contentGenerator.description')}</CardDescription>
                </CardHeader>
                <div className="p-4">
                    <label htmlFor="product-select" className="block text-sm font-medium text-gray-300 mb-2">{t('contentGenerator.selectLabel')}</label>
                    <select
                        id="product-select"
                        className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-50"
                        value={selectedProductId || ''}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        disabled={products.length === 0}
                    >
                        {products.length > 0 ? (
                             products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                        ) : (
                            <option>{t('contentGenerator.noProducts')}</option>
                        )}
                    </select>
                </div>
            </Card>

            {selectedProductId && (
                <div className="space-y-4">
                    <GenerationSection
                        title={t('contentGenerator.videoScript')}
                        onGenerate={() => handleGeneration(GenerationType.SCRIPT)}
                        isLoading={loadingStates[GenerationType.SCRIPT]}
                        isGenerated={!!selectedProductContent?.script}
                    >
                        <pre className="whitespace-pre-wrap font-sans">{selectedProductContent?.script}</pre>
                    </GenerationSection>

                    <GenerationSection
                        title={t('contentGenerator.videoTitles')}
                        onGenerate={() => handleGeneration(GenerationType.TITLES)}
                        isLoading={loadingStates[GenerationType.TITLES]}
                        isGenerated={!!selectedProductContent?.titles}
                    >
                        <ul className="list-disc pl-5">
                            {selectedProductContent?.titles?.map((title, i) => <li key={i}>{title}</li>)}
                        </ul>
                    </GenerationSection>

                    <GenerationSection
                        title={t('contentGenerator.seoDescription')}
                        onGenerate={() => handleGeneration(GenerationType.DESCRIPTION)}
                        isLoading={loadingStates[GenerationType.DESCRIPTION]}
                        isGenerated={!!selectedProductContent?.seoDescription}
                    >
                        <pre className="whitespace-pre-wrap font-sans">{selectedProductContent?.seoDescription}</pre>
                    </GenerationSection>

                     <GenerationSection
                        title={t('contentGenerator.captionsHashtags')}
                        onGenerate={() => handleGeneration(GenerationType.CAPTIONS)}
                        isLoading={loadingStates[GenerationType.CAPTIONS]}
                        isGenerated={!!selectedProductContent?.captions}
                    >
                       <div>
                            <p className="font-bold">{t('contentGenerator.caption')}</p>
                            <p>{selectedProductContent?.captions?.caption}</p>
                            <p className="font-bold mt-4">{t('contentGenerator.hashtags')}</p>
                            <p className="text-primary-400">{selectedProductContent?.captions?.hashtags.join(' ')}</p>
                       </div>
                    </GenerationSection>
                </div>
            )}
        </div>
    );
};