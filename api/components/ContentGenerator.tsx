import * as React from 'react';
import type { Product, GeneratedContent, TextModelSelection } from '../../types';
import { GenerationType } from '../../types';
import {
    generateReviewScript,
    generateVideoTitles,
    generateSeoDescription,
    generateCaptionsAndHashtags,
    translateText
} from './services/geminiService';
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Spinner } from './common/Spinner';
import { useI18n } from '../../contexts/I18nContext';
import { Languages, ChevronDown, Edit, Save, X, ExternalLink } from './LucideIcons';

interface ContentGeneratorProps {
    products: Product[];
    generatedContent: Record<string, GeneratedContent>;
    onContentUpdate: (productId: string, newContent: Partial<GeneratedContent>) => void;
    productToAutoGenerate: string | null;
    onGenerationComplete: () => void;
}

const GenerationSection: React.FC<{
    title: string;
    type: GenerationType;
    children: React.ReactNode;
    onGenerate: () => void;
    onSaveEdit: (newText: string | { caption: string, hashtags: string[] }) => void;
    isLoading: boolean;
    isGenerated: boolean;
    isGeneratingAll: boolean;
    content: any;
}> = ({ title, type, children, onGenerate, onSaveEdit, isLoading, isGenerated, isGeneratingAll, content }) => {
    const { t } = useI18n();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editText, setEditText] = React.useState('');

    const handleEdit = () => {
        if (type === GenerationType.CAPTIONS) {
            setEditText(content.caption);
        } else {
            setEditText(content);
        }
        setIsEditing(true);
    };

    const handleSave = () => {
        if (type === GenerationType.CAPTIONS) {
            onSaveEdit({ caption: editText, hashtags: content.hashtags });
        } else {
            onSaveEdit(editText);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const canEdit = type === GenerationType.SCRIPT || type === GenerationType.DESCRIPTION || type === GenerationType.CAPTIONS;

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {isGenerated ? t('contentGenerator.generatedSuccess') : t('contentGenerator.generateDescription', { type: title.toLowerCase() })}
                    </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    {isGenerated && !isEditing && canEdit && (
                         <Button variant="secondary" size="sm" onClick={handleEdit} icon={<Edit className="w-4 h-4"/>}>
                            {t('contentGenerator.edit')}
                        </Button>
                    )}
                    <Button onClick={onGenerate} isLoading={isLoading} disabled={isLoading || isGeneratingAll}>
                        {isLoading ? t('contentGenerator.generating') : isGenerated ? t('contentGenerator.regenerate') : t('contentGenerator.generate')}
                    </Button>
                </div>
            </CardHeader>
            {(isLoading || isGeneratingAll) && !isGenerated && <div className="flex justify-center p-8"><Spinner/></div>}
            {isGenerated && (
                <div className="prose prose-sm max-w-none p-4 bg-gray-800/50 rounded-b-lg text-gray-300 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-invert">
                    {isEditing ? (
                        <div className="space-y-2">
                             <textarea 
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 font-sans text-sm"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={type === GenerationType.SCRIPT ? 10 : 5}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={handleCancel} icon={<X className="w-4 h-4"/>}>{t('contentGenerator.cancel')}</Button>
                                <Button size="sm" onClick={handleSave} icon={<Save className="w-4 h-4"/>}>{t('contentGenerator.save')}</Button>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            )}
        </Card>
    );
};

const ModelSelector: React.FC<{
    selectedModel: TextModelSelection;
    onModelChange: (model: TextModelSelection) => void;
}> = ({ selectedModel, onModelChange }) => {
    const { t } = useI18n();
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('modelSelector.title')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-gray-800/50 border border-gray-600 rounded-lg">
                <button
                    onClick={() => onModelChange('gemini-2.5-flash')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${selectedModel === 'gemini-2.5-flash' ? 'bg-primary-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                >
                    <p className="font-semibold">{t('modelSelector.fast_label')}</p>
                    <p className="text-xs text-primary-200/80 hidden sm:block">{t('modelSelector.fast_description')}</p>
                </button>
                <button
                    onClick={() => onModelChange('gemini-2.5-pro')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${selectedModel === 'gemini-2.5-pro' ? 'bg-primary-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                >
                    <p className="font-semibold">{t('modelSelector.quality_label')}</p>
                    <p className="text-xs text-primary-200/80 hidden sm:block">{t('modelSelector.quality_description')}</p>
                </button>
            </div>
        </div>
    );
};

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ products, generatedContent, onContentUpdate, productToAutoGenerate, onGenerationComplete }) => {
    const [selectedProductId, setSelectedProductId] = React.useState<string | null>(products.length > 0 ? products[0].id : null);
    const [loadingStates, setLoadingStates] = React.useState<Record<GenerationType, boolean>>({
        [GenerationType.SCRIPT]: false,
        [GenerationType.TITLES]: false,
        [GenerationType.DESCRIPTION]: false,
        [GenerationType.CAPTIONS]: false,
    });
    const [isGeneratingAll, setIsGeneratingAll] = React.useState(false);
    const { t } = useI18n();
    const [targetLanguage, setTargetLanguage] = React.useState('vi');
    const [translatedScript, setTranslatedScript] = React.useState<string | null>(null);
    const [isTranslating, setIsTranslating] = React.useState(false);
    const [customLanguage, setCustomLanguage] = React.useState('');
    const [showTranslation, setShowTranslation] = React.useState(false);
    const [selectedTextModel, setSelectedTextModel] = React.useState<TextModelSelection>('gemini-2.5-flash');
    const [useGrounding, setUseGrounding] = React.useState(true);

    React.useEffect(() => {
        setTranslatedScript(null);
        setShowTranslation(false);
    }, [selectedProductId]);

    const handleGeneration = React.useCallback(async (type: GenerationType, overrideProduct?: Product) => {
        const product = overrideProduct || products.find(p => p.id === selectedProductId);
        if (!product) return;

        setLoadingStates(prev => ({ ...prev, [type]: true }));

        try {
            switch (type) {
                case GenerationType.SCRIPT: {
                    const { script, sources } = await generateReviewScript(product, selectedTextModel, useGrounding);
                    onContentUpdate(product.id, { script, sources });
                    break;
                }
                case GenerationType.TITLES: {
                    const titles = await generateVideoTitles(product.name, selectedTextModel);
                    onContentUpdate(product.id, { titles, selectedTitle: titles[0] || '' });
                    break;
                }
                case GenerationType.DESCRIPTION: {
                    const seoDescription = await generateSeoDescription(product.name, selectedTextModel);
                    onContentUpdate(product.id, { seoDescription });
                    break;
                }
                case GenerationType.CAPTIONS: {
                    const captions = await generateCaptionsAndHashtags(product.name, selectedTextModel);
                    onContentUpdate(product.id, { captions });
                    break;
                }
            }
        } catch (error) {
            console.error(`Error generating ${type}:`, error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [type]: false }));
        }
    }, [selectedProductId, products, onContentUpdate, selectedTextModel, useGrounding]);

    const handleGenerateAll = React.useCallback(async (overrideProduct?: Product) => {
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

    React.useEffect(() => {
        if (productToAutoGenerate) {
            const product = products.find(p => p.id === productToAutoGenerate);
            if (product) {
                setSelectedProductId(product.id);
                handleGenerateAll(product);
            }
            onGenerationComplete();
        }
    }, [productToAutoGenerate, products, handleGenerateAll, onGenerationComplete]);

    const handleSaveEdit = (type: GenerationType, newContent: any) => {
        if (!selectedProductId) return;
        
        switch(type) {
            case GenerationType.SCRIPT:
                onContentUpdate(selectedProductId, { script: newContent });
                break;
            case GenerationType.DESCRIPTION:
                onContentUpdate(selectedProductId, { seoDescription: newContent });
                break;
            case GenerationType.CAPTIONS:
                onContentUpdate(selectedProductId, { captions: newContent });
                break;
        }
    }

    const selectedProductContent = selectedProductId ? generatedContent[selectedProductId] : undefined;

    const handleTranslate = async () => {
        if (!selectedProductContent?.script) return;
        setIsTranslating(true);
        try {
            let languageToTranslate: string;
            if (targetLanguage === 'custom') {
                languageToTranslate = customLanguage;
            } else {
                const languageName = languages.find(l => l.code === targetLanguage)?.nameKey || 'contentGenerator.vietnamese';
                languageToTranslate = t(languageName);
            }

            const translation = await translateText(selectedProductContent.script, languageToTranslate, selectedTextModel);
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
        { code: 'custom', nameKey: 'contentGenerator.customLanguage' },
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
                        <>
                            <ModelSelector selectedModel={selectedTextModel} onModelChange={setSelectedTextModel} />
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
                        </>
                    )}
                </div>
            </Card>

            {selectedProductId && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="use-grounding"
                            checked={useGrounding}
                            onChange={(e) => setUseGrounding(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="use-grounding" className="text-sm font-medium text-gray-300">
                            {t('contentGenerator.useGrounding')}
                        </label>
                    </div>
                    
                    <GenerationSection
                        type={GenerationType.SCRIPT}
                        title={t('contentGenerator.videoScript')}
                        onGenerate={() => handleGeneration(GenerationType.SCRIPT)}
                        onSaveEdit={(newText) => handleSaveEdit(GenerationType.SCRIPT, newText)}
                        isLoading={loadingStates[GenerationType.SCRIPT]}
                        isGenerated={!!selectedProductContent?.script}
                        isGeneratingAll={isGeneratingAll}
                        content={selectedProductContent?.script}
                    >
                        <pre className="whitespace-pre-wrap font-sans">{selectedProductContent?.script}</pre>
                        {selectedProductContent?.sources && selectedProductContent.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700 not-prose">
                                <h4 className="text-sm font-semibold text-gray-200 mb-2">{t('contentGenerator.groundingSources')}</h4>
                                <ul className="space-y-1">
                                    {selectedProductContent.sources.map((source: any, index: number) => (
                                        <li key={index} className="flex items-center">
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:underline truncate">
                                                <ExternalLink className="w-3 h-3 inline-block mr-1" />
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                         {selectedProductContent?.script && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-xs text-gray-400 not-prose italic mb-2">{t('contentGenerator.scriptTip')}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select 
                                        value={targetLanguage} 
                                        onChange={(e) => setTargetLanguage(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
                                        aria-label={t('contentGenerator.selectLanguage')}
                                    >
                                        {languages.map(lang => <option key={lang.code} value={lang.code}>{t(lang.nameKey)}</option>)}
                                    </select>
                                    {targetLanguage === 'custom' && (
                                        <input
                                            type="text"
                                            value={customLanguage}
                                            onChange={(e) => setCustomLanguage(e.target.value)}
                                            placeholder={t('contentGenerator.customLanguagePlaceholder')}
                                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
                                        />
                                    )}
                                    <Button 
                                        onClick={handleTranslate} 
                                        isLoading={isTranslating} 
                                        disabled={isTranslating || (targetLanguage === 'custom' && !customLanguage.trim())}
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
                        type={GenerationType.TITLES}
                        title={t('contentGenerator.videoTitles')}
                        onGenerate={() => handleGeneration(GenerationType.TITLES)}
                        onSaveEdit={() => {}} // Not editable
                        isLoading={loadingStates[GenerationType.TITLES]}
                        isGenerated={!!selectedProductContent?.titles}
                        isGeneratingAll={isGeneratingAll}
                        content={selectedProductContent?.titles}
                    >
                        <div>
                            <p className="text-gray-400 text-sm mb-2">{t('contentGenerator.selectFinalTitle')}</p>
                            <div className="space-y-2">
                                {selectedProductContent?.titles?.map((title, i) => (
                                    <label key={i} className="flex items-center p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                                        <input 
                                            type="radio"
                                            name="selectedTitle"
                                            value={title}
                                            checked={selectedProductContent?.selectedTitle === title}
                                            onChange={() => onContentUpdate(selectedProductId, { selectedTitle: title })}
                                            className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 text-gray-200">{title}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </GenerationSection>

                    <GenerationSection
                        type={GenerationType.DESCRIPTION}
                        title={t('contentGenerator.seoDescription')}
                        onGenerate={() => handleGeneration(GenerationType.DESCRIPTION)}
                        onSaveEdit={(newText) => handleSaveEdit(GenerationType.DESCRIPTION, newText)}
                        isLoading={loadingStates[GenerationType.DESCRIPTION]}
                        isGenerated={!!selectedProductContent?.seoDescription}
                        isGeneratingAll={isGeneratingAll}
                        content={selectedProductContent?.seoDescription}
                    >
                        <pre className="whitespace-pre-wrap font-sans">{selectedProductContent?.seoDescription}</pre>
                    </GenerationSection>

                     <GenerationSection
                        type={GenerationType.CAPTIONS}
                        title={t('contentGenerator.captionsHashtags')}
                        onGenerate={() => handleGeneration(GenerationType.CAPTIONS)}
                        onSaveEdit={(newContent) => handleSaveEdit(GenerationType.CAPTIONS, newContent)}
                        isLoading={loadingStates[GenerationType.CAPTIONS]}
                        isGenerated={!!selectedProductContent?.captions}
                        isGeneratingAll={isGeneratingAll}
                        content={selectedProductContent?.captions}
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