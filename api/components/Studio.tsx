import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductWithContent, RenderJob, VideoModelSelection, AudioVoiceSelection } from '../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../hooks/useI18n';
// Fix: Import the newly added `Image` icon.
import { AlertTriangle, Upload, X, KeyRound, ExternalLink, Palette, Film, Mic2, Image, Users } from './LucideIcons';
import { useNotifier } from '../contexts/NotificationContext';
import { generateVideo, generateSpeech } from '../services/geminiService';
import { logger } from '../services/loggingService';
import { ThumbnailGeneratorModal } from './ThumbnailGeneratorModal';

const ApiKeyModal: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
    const { t } = useI18n();
    const [isOpening, setIsOpening] = useState(false);
    
    const handleSelectKey = async () => {
        setIsOpening(true);
        try {
            if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
                await window.aistudio.openSelectKey();
                onKeySelected();
            } else {
                logger.error("aistudio.openSelectKey() is not available.");
                alert("API key selection feature is not available in this environment.");
            }
        } catch (error) {
            logger.error("Error opening API key selection dialog", { error });
        } finally {
            setIsOpening(false);
        }
    };

    return (
        <Card>
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary-500/10 text-primary-400">
                        <KeyRound className="h-8 w-8"/>
                    </div>
                </div>
                <CardTitle>{t('studio.apiKeyRequiredTitle')}</CardTitle>
                <CardDescription>{t('studio.apiKeyRequiredDescription')}</CardDescription>
            </CardHeader>
            <div className="p-4 text-center border-t border-gray-700 space-y-4">
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:underline inline-flex items-center">
                    {t('studio.apiKeyRequiredLink')} <ExternalLink className="w-4 h-4 ml-1" />
                </a>
                <Button onClick={handleSelectKey} isLoading={isOpening} className="w-full">
                    {t('studio.selectApiKeyButton')}
                </Button>
            </div>
        </Card>
    );
};

const extractSpeakers = (script: string): string[] => {
    const speakerRegex = /^([a-zA-Z0-9]+):/gm;
    const matches = script.match(speakerRegex);
    if (!matches) return [];
    const speakers = matches.map(match => match.slice(0, -1));
    return [...new Set(speakers)]; // Return unique speakers
};

const voiceOptions: AudioVoiceSelection[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const Studio: React.FC<{
    productsWithContent: ProductWithContent[];
    onAddRenderJob: (job: Omit<RenderJob, 'id'>) => void;
    onPublishProduct: (productId: string) => Promise<void>;
}> = ({ productsWithContent, onAddRenderJob, onPublishProduct }) => {
    const { t } = useI18n();
    const notifier = useNotifier();

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [creatingVideo, setCreatingVideo] = useState(false);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
    
    const [videoModel, setVideoModel] = useState<VideoModelSelection>('veo-3.1-fast-generate-preview');
    const [referenceImages, setReferenceImages] = useState<string[]>([]);
    
    const [audioVoice, setAudioVoice] = useState<AudioVoiceSelection>('Kore');
    const [speakerVoices, setSpeakerVoices] = useState<Record<string, AudioVoiceSelection>>({});

    const readyToPublish = useMemo(() => productsWithContent.filter(p => 
        p.content.script && p.content.selectedTitle
    ), [productsWithContent]);

    const selectedProduct = useMemo(() => {
        return readyToPublish.find(p => p.id === selectedProductId);
    }, [selectedProductId, readyToPublish]);

    const speakers = useMemo(() => {
        if (selectedProduct?.content.script) {
            const extracted = extractSpeakers(selectedProduct.content.script);
            if (extracted.length > 0) {
                setSpeakerVoices(prev => {
                    const newVoices: Record<string, AudioVoiceSelection> = {};
                    extracted.forEach((speaker, i) => {
                        newVoices[speaker] = prev[speaker] || voiceOptions[i % voiceOptions.length];
                    });
                    return newVoices;
                });
            }
            return extracted;
        }
        return [];
    }, [selectedProduct]);

    useEffect(() => {
        if (readyToPublish.length > 0 && !selectedProductId) {
            setSelectedProductId(readyToPublish[0].id);
        }
        if (selectedProductId && !readyToPublish.find(p => p.id === selectedProductId)) {
            setSelectedProductId(readyToPublish.length > 0 ? readyToPublish[0].id : null);
        }
    }, [readyToPublish, selectedProductId]);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio?.hasSelectedApiKey) {
                setHasApiKey(await window.aistudio.hasSelectedApiKey());
            } else {
                setHasApiKey(false); // Fallback for environments without aistudio
            }
        };
        checkApiKey();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Fix: Explicitly type `file` as `File` to resolve errors where `file.size` and `file.name` were
        // accessed on an `unknown` type. This also ensures `file` is assignable to `Blob` for `readAsDataURL`.
        const imagePromises = Array.from(files).slice(0, 3 - referenceImages.length).map((file: File) => {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                notifier.warn(`Image ${file.name} is larger than 4MB and was skipped.`);
                return null;
            }
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(imagePromises).then(results => {
            const validResults = results.filter((r): r is string => r !== null);
            const newImages = [...referenceImages, ...validResults].slice(0, 3);
            setReferenceImages(newImages);
            if (newImages.length > 1) {
                setVideoModel('veo-3.1-generate-preview');
            }
        });
        e.target.value = ''; // Reset file input
    };

    const handleRemoveImage = (index: number) => {
        const newImages = referenceImages.filter((_, i) => i !== index);
        setReferenceImages(newImages);
        if (newImages.length <= 1 && videoModel === 'veo-3.1-generate-preview') {
            setVideoModel('veo-3.1-fast-generate-preview');
        }
    };
    
    const handleCreateVideo = async () => {
        if (!selectedProduct?.content.script) return;

        setCreatingVideo(true);
        try {
            const isMultiSpeaker = speakers.length > 1;
            // Fix: Cast `voice` to `AudioVoiceSelection` as TypeScript fails to infer it correctly from `Object.entries`.
            const speakerConfig = isMultiSpeaker ? Object.entries(speakerVoices).map(([speaker, voice]) => ({ speaker, voice: voice as AudioVoiceSelection })) : undefined;

            const [audioData, videoOperation] = await Promise.all([
                generateSpeech(selectedProduct.content.script, audioVoice, speakerConfig),
                generateVideo(selectedProduct.content.script, videoModel, referenceImages)
            ]);
            
            onAddRenderJob({
                productName: selectedProduct.name,
                status: 'Rendering',
                progress: 5,
                createdAt: new Date().toISOString(),
                models: [videoModel === 'veo-3.1-generate-preview' ? 'VEO 3.1 HQ' : 'VEO 3.1', 'Gemini TTS'],
                operationName: videoOperation.name,
                audioData: audioData,
            });
            notifier.success(`Video creation started for "${selectedProduct.name}"`);

        } catch (error: any) {
            logger.error("Failed to create video or audio", { error });
            notifier.error(`Creation failed: ${error.message}`);
             if (error.message?.includes("Requested entity was not found")) {
                setHasApiKey(false);
                notifier.error(t('studio.apiKeyErrorMessage'));
            }
        } finally {
            setCreatingVideo(false);
        }
    };

    if (!hasApiKey) {
        return <ApiKeyModal onKeySelected={() => setHasApiKey(true)} />;
    }

    if (readyToPublish.length === 0) {
        return (
            <Card>
                <CardHeader className="text-center p-8">
                    <CardTitle>{t('studio.noProductsReady')}</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <ThumbnailGeneratorModal
                isOpen={isThumbnailModalOpen}
                onClose={() => setIsThumbnailModalOpen(false)}
                onAccept={(imageData) => {
                    // Here you would typically save this to your product's state
                    console.log("Accepted thumbnail data:", imageData.substring(0, 50) + "...");
                    setIsThumbnailModalOpen(false);
                    notifier.success("Thumbnail accepted!");
                }}
                initialPrompt={selectedProduct?.content.selectedTitle || `A cinematic shot of ${selectedProduct?.name}`}
            />
            <Card>
                 <CardHeader>
                    <CardTitle>{t('studio.title')}</CardTitle>
                    <CardDescription>{t('studio.description')}</CardDescription>
                </CardHeader>
                <div className="p-4 border-t border-gray-700">
                     <label htmlFor="product-select" className="block text-sm font-medium text-gray-300 mb-2">{t('studio.selectProduct')}</label>
                    <select
                        id="product-select"
                        className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm text-gray-50"
                        value={selectedProductId || ''}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        {readyToPublish.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </Card>

            {selectedProduct && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Configuration */}
                    <div className="space-y-6">
                        <Card>
                             <CardHeader className="flex items-center space-x-3"><Film className="w-5 h-5 text-primary-400" /><CardTitle>{t('studio.videoOptions')}</CardTitle></CardHeader>
                             <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('studio.videoModel')}</label>
                                    <select value={videoModel} onChange={e => setVideoModel(e.target.value as VideoModelSelection)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500">
                                        <option value="veo-3.1-fast-generate-preview">VEO 3.1 Fast</option>
                                        <option value="veo-3.1-generate-preview" disabled={referenceImages.length <= 1}>VEO 3.1 HQ (Multi-Image)</option>
                                    </select>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">{t('studio.imageReferenceTitle')}</h4>
                                    <p className="text-xs text-gray-400 mb-2">{t('studio.imageReferenceDesc')}</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {referenceImages.map((img, i) => (
                                            <div key={i} className="relative group aspect-square">
                                                <img src={img} alt={`Reference ${i+1}`} className="w-full h-full object-cover rounded-md"/>
                                                <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                                            </div>
                                        ))}
                                        {referenceImages.length < 3 && (
                                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:bg-gray-800/50">
                                                <Upload className="w-6 h-6 text-gray-400"/>
                                                <span className="text-xs text-gray-500 mt-1">Upload</span>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange}/>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                         <Card>
                            <CardHeader className="flex items-center space-x-3"><Mic2 className="w-5 h-5 text-primary-400" /><CardTitle>{t('studio.audioOptions')}</CardTitle></CardHeader>
                            <div className="p-4 space-y-4">
                                {speakers.length > 1 ? (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-1">{t('studio.multiSpeakerTitle')}</h4>
                                        <p className="text-xs text-gray-400 mb-3">{t('studio.multiSpeakerDesc')}</p>
                                        <div className="space-y-2">
                                            {speakers.map(speaker => (
                                                <div key={speaker} className="flex items-center justify-between">
                                                    <span className="text-gray-300 flex items-center"><Users className="w-4 h-4 mr-2 text-gray-500"/>{speaker}</span>
                                                    <select value={speakerVoices[speaker]} onChange={e => setSpeakerVoices(prev => ({ ...prev, [speaker]: e.target.value as AudioVoiceSelection }))} className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500">
                                                        {voiceOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('studio.audioVoice')}</label>
                                        <select value={audioVoice} onChange={e => setAudioVoice(e.target.value as AudioVoiceSelection)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500">
                                            {voiceOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Preview & Actions */}
                     <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Script Preview</CardTitle>
                                <CardDescription>This script will be used for video and audio generation.</CardDescription>
                            </CardHeader>
                            <div className="p-4 max-h-96 overflow-y-auto bg-gray-800/30">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">{selectedProduct.content.script}</pre>
                            </div>
                        </Card>
                        <Card>
                             <CardHeader className="flex items-center space-x-3"><Image className="w-5 h-5 text-primary-400" /><CardTitle>Thumbnail</CardTitle></CardHeader>
                            <div className="p-4">
                                <Button onClick={() => setIsThumbnailModalOpen(true)} variant="secondary" className="w-full" icon={<Palette className="w-4 h-4"/>}>
                                    {t('studio.generateThumbnail')}
                                </Button>
                            </div>
                        </Card>
                        <div className="space-y-2">
                            <Button onClick={handleCreateVideo} isLoading={creatingVideo} size="lg" className="w-full">
                                {creatingVideo ? t('studio.creatingVideo') : t('studio.createVideo')}
                            </Button>
                            <Button variant="secondary" size="lg" className="w-full" onClick={() => onPublishProduct(selectedProduct.id)} disabled={selectedProduct.financials !== undefined}>
                                {selectedProduct.financials ? t('studio.published') : t('studio.publishNow')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
