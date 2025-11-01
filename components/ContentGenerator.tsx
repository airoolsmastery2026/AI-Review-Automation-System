import React, { useState, useCallback, useEffect } from 'react';
import type { Product, GeneratedContent } from '../types';
import { GenerationType } from '../types';
import {
    generateReviewScript,
    generateVideoTitles,
    generateSeoDescription,
    generateCaptionsAndHashtags,
    translateText
} from '../services/geminiService';
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Spinner } from './common/Spinner';
import { useI18n } from '../hooks/useI18n';
import { Languages, ChevronDown } from './LucideIcons';

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
    isGeneratingAll: boolean;
}> = ({ title, children, onGenerate, isLoading, isGenerated, isGeneratingAll }) => {
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
                <Button onClick={onGenerate} isLoading={isLoading} disabled={isLoading || isGeneratingAll}>
                    {isLoading ? t('contentGenerator.generating') : isGenerated ? t('contentGenerator.regenerate') : t('contentGenerator.generate')}
                </Button>
            </CardHeader>
            {(isLoading || isGeneratingAll) && !isGenerated && <div className="flex justify-center p-8"><Spinner/></div>}
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
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const { t } = useI18n();
    const [targetLanguage, setTargetLanguage] = useState('vi');
    const [translatedScript, setTranslatedScript] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);

    useEffect(() => {
        setTranslatedScript(null);
        setShowTranslation(false);
    }, [selectedProductId]);

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

    const handleGenerateAll = useCallback(async (overrideProduct?: Product) => {
        const product = overrideProduct || products.find(p => p.id === selectedProductId);
        if (!product) return;

        setIsGeneratingAll(true);
        await Promise.all([
            handleGeneration(GenerationType.SCRIPT, product),
            handleGeneration(GenerationType.TITLES, product),
            handleGeneration(GenerationType.DESCRIPTION, product),
            handleGeneration(GenerationType.CAPTIONS, product),
        ]);
        setIsGeneratingAll(false);
    }, [selectedProductId, products, handleGeneration]);

    useEffect(() => {
        if (productToAutoGenerate) {
            const product = products.find(p => p.id === productToAutoGenerate);
            if (product) {
                setSelectedProductId(product.id);
                handleGenerateAll(product);
            }
            // Clear the trigger state in App.tsx once generation has been initiated
            onGenerationComplete();
        }
    }, [productToAutoGenerate, products, handleGenerateAll, onGenerationComplete]);


    const selectedProductContent = selectedProductId ? generatedContent[selectedProductId] : undefined;

    const handleTranslate = async () => {
        if (!selectedProductContent?.script) return;
        setIsTranslating(true);
        try {
            const languageName = languages.find(l => l.code === targetLanguage)?.nameKey || 'Vietnamese';
            const translation = await translateText(selectedProductContent.script, t(languageName));
            setTranslatedScript(translation);
            setShowTranslation(true);
        } catch (error) {
            console.error('Error translating script:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    const languages = [
        { code: 'vi', nameKey: 'contentGenerator.vietnamese' },
        { code: 'es', nameKey: 'contentGenerator.spanish' },
        { code: 'fr', nameKey: 'contentGenerator.french' },
        { code: 'de', nameKey: 'contentGenerator.german' },
        { code: 'ja', nameKey: 'contentGenerator.japanese' },
    ];


    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>{t('contentGenerator.title')}</CardTitle>
                    <CardDescription>{t('contentGenerator.description')}</CardDescription>
                </CardHeader>
                <div className="p-4 space-y-4">
                    <div>
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
                     {selectedProductId && (
                        <div className="pt-2">
                             <Button 
                                className="w-full" 
                                onClick={() => handleGenerateAll()}
                                isLoading={isGeneratingAll}
                                size="lg"
                            >
                                {isGeneratingAll ? t('contentGenerator.generatingAll') : t('contentGenerator.generateAll')}
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {selectedProductId && (
                <div className="space-y-4">
                    <GenerationSection
                        title={t('contentGenerator.videoScript')}
                        onGenerate={() => handleGeneration(GenerationType.SCRIPT)}
                        isLoading={loadingStates[GenerationType.SCRIPT]}
                        isGenerated={!!selectedProductContent?.script}
                        isGeneratingAll={isGeneratingAll}
                    >
                        <pre className="whitespace-pre-wrap font-sans">{selectedProductContent?.script}</pre>
                         {selectedProductContent?.script && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <select 
                                        value={targetLanguage} 
                                        onChange={(e) => setTargetLanguage(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
                                        aria-label={t('contentGenerator.selectLanguage')}
                                    >
                                        {languages.map(lang => <option key={lang.code} value={lang.code}>{t(lang.nameKey)}</option>)}
                                    </select>
                                    <Button 
                                        onClick={handleTranslate} 
                                        isLoading={isTranslating} 
                                        disabled={isTranslating}
                                        icon={<Languages className="h-4 w-4" />}
                                    >
                                        {isTranslating ? t('contentGenerator.translating') : t('contentGenerator.translate')}
                                    </Button>
                                </div>

                                {translatedScript && (
                                    <div className="mt-4">
                                        <Button variant="ghost" size="sm" onClick={() => setShowTranslation(!showTranslation)} className="text-gray-300">
                                            {t(showTranslation ? 'contentGenerator.hideTranslation' : 'contentGenerator.showTranslation')}
                                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showTranslation ? 'rotate-180' : ''}`}/>
                                        </Button>
                                        {showTranslation && (
                                            <div className="mt-2 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                            <h4 className="font-semibold text-gray-200 mb-2">{t('contentGenerator.translation')}</h4>
                                            <pre className="whitespace-pre-wrap font-sans text-gray-300">{translatedScript}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </GenerationSection>

                    <GenerationSection
                        title={t('contentGenerator.videoTitles')}
                        onGenerate={() => handleGeneration(GenerationType.TITLES)}
                        isLoading={loadingStates[GenerationType.TITLES]}
                        isGenerated={!!selectedProductContent?.titles}
                        isGeneratingAll={isGeneratingAll}
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
                        isGeneratingAll={isGeneratingAll}
                    >
                        <pre className="whitespace-pre-wrap font-sans">{selectedProductContent?.seoDescription}</pre>
                    </GenerationSection>

                     <GenerationSection
                        title={t('contentGenerator.captionsHashtags')}
                        onGenerate={() => handleGeneration(GenerationType.CAPTIONS)}
                        isLoading={loadingStates[GenerationType.CAPTIONS]}
                        isGenerated={!!selectedProductContent?.captions}
                        isGeneratingAll={isGeneratingAll}
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