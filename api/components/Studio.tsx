
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductWithContent, RenderJob, VideoModelSelection, AudioVoiceSelection, VideoResolution, VideoAspectRatio } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { AlertTriangle, Upload, X, KeyRound, ExternalLink, Palette, Film, Mic2, Image, Users, Images, Info } from './LucideIcons';
import { useNotifier } from '../../contexts/NotificationContext';
import { generateVideo, generateSpeech } from './services/geminiService';
import { logger } from './services/loggingService';
import { ThumbnailGeneratorModal } from './ThumbnailGeneratorModal';

interface StudioProps {
    productsWithContent: ProductWithContent[];
    onAddRenderJob: (job: Omit<RenderJob, 'id'>) => void;
    onPublishProduct: (productId: string) => Promise<void>;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key_override';

const ApiKeyModal: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
    const { t } = useI18n();
    const [isOpening, setIsOpening] = React.useState(false);
    
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
                        <KeyRound className="h-8 w-8" />
                    </div>
                </div>
                <CardTitle className="text-xl">{t('studio.apiKeyRequiredTitle')}</CardTitle>
                <CardDescription>{t('studio.apiKeyRequiredDescription')}</CardDescription>
            </CardHeader>
            <div className="p-4 text-center">
                <p className="text-sm text-gray-400 mb-4">
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-300">
                        {t('studio.apiKeyRequiredLink')}
                    </a>
                </p>
                <Button onClick={handleSelectKey} isLoading={isOpening}>
                    {t('studio.selectApiKeyButton')}
                </Button>
            </div>
        </Card>
    );
};

const ImageUpload: React.FC<{
    label: string;
    image: string | null;
    onImageChange: (image: string | null) => void;
}> = ({ label, image, onImageChange }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const notifier = useNotifier();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                notifier.error("Image size should not exceed 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => onImageChange(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex items-center space-x-3">
            <div 
                className="w-16 h-16 bg-gray-800/50 rounded-md flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => inputRef.current?.click()}
                title={`Upload ${label}`}
            >
                {image ? (
                    <img src={image} alt="preview" className="w-full h-full object-cover rounded-md" />
                ) : (
                    <Upload className="w-6 h-6 text-gray-500" />
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-300">{label}</p>
                {image && (
                     <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 text-xs px-2 py-1 mt-1" onClick={() => onImageChange(null)}>
                         <X className="w-3 h-3 mr-1" /> Remove
                     </Button>
                )}
            </div>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
        </div>
    );
};

export const Studio: React.FC<StudioProps> = ({ productsWithContent, onAddRenderJob, onPublishProduct }) => {
    const { t } = useI18n();
    const notifier = useNotifier();
    
    // API Key State
    const [isApiKeySelected, setIsApiKeySelected] = React.useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = React.useState(true);
    const [apiKey, setApiKey] = React.useState('');

    // Form State
    const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
    const [videoModel, setVideoModel] = React.useState<VideoModelSelection>('veo-3.1-fast-generate-preview');
    const [audioVoice, setAudioVoice] = React.useState<AudioVoiceSelection>('Kore');
    const [resolution, setResolution] = React.useState<VideoResolution>('720p');
    const [aspectRatio, setAspectRatio] = React.useState<VideoAspectRatio>('9:16');
    const [speakerVoices, setSpeakerVoices] = React.useState<Record<string, AudioVoiceSelection>>({});
    const [startImage, setStartImage] = React.useState<string | null>(null);
    const [referenceImages, setReferenceImages] = React.useState<(string | null)[]>([null, null, null]);
    
    // UI State
    const [isLoading, setIsLoading] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [isThumbnailModalOpen, setIsThumbnailModalOpen] = React.useState(false);
    const [thumbnailImage, setThumbnailImage] = React.useState<string | null>(null);
    const [isConfirmingPublish, setIsConfirmingPublish] = React.useState(false);

    const availableProducts = productsWithContent.filter(p => p.content.script && p.content.selectedTitle);
    const selectedProduct = productsWithContent.find(p => p.id === selectedProductId);
    const speakers = React.useMemo(() => {
        if (!selectedProduct?.content.script) return [];
        const matches = selectedProduct.content.script.matchAll(/^([A-Za-z0-9_]+):/gm);
        return [...new Set(Array.from(matches, m => m[1]))];
    }, [selectedProduct]);

    React.useEffect(() => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;
        setApiKey(key);
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
    };

    React.useEffect(() => {
        const defaultVoices: AudioVoiceSelection[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
        const initialVoices: Record<string, AudioVoiceSelection> = {};
        speakers.forEach((speaker, index) => {
            initialVoices[speaker] = speakerVoices[speaker] || defaultVoices[index % defaultVoices.length];
        });
        setSpeakerVoices(initialVoices);
    }, [speakers]);
    
    React.useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setIsApiKeySelected(hasKey);
                } catch (error) {
                    logger.error("Error checking for API key", { error });
                    setIsApiKeySelected(false);
                }
            } else {
                 setIsApiKeySelected(true); // Default to true if aistudio is not present (e.g., local dev with .env)
            }
            setIsCheckingApiKey(false);
        };
        checkApiKey();
    }, []);

    const handleImageUpload = (index: number, image: string | null) => {
        setReferenceImages(prev => {
            const newImages = [...prev];
            newImages[index] = image;
            return newImages;
        });
    };
    
    const handleCreateVideo = async () => {
        if (!selectedProduct || !selectedProduct.content.script) {
            notifier.error("Please select a product with a script.");
            return;
        }

        setIsLoading(true);
        let audioData: string | undefined;

        // --- Step 1: Generate Audio ---
        try {
            const speakerConfig = speakers.length > 1 ? Object.entries(speakerVoices).map(([speaker, voice]) => ({ speaker, voice: voice as AudioVoiceSelection })) : undefined;
            audioData = await generateSpeech(selectedProduct.content.script, audioVoice, speakerConfig);
            logger.info("Speech generation successful for video creation.", { productId: selectedProduct.id });
        } catch (error: any) {
            logger.error("Failed to generate speech for video", { error });
            if (error.message.includes("API key not valid") || error.message.includes("permission") || error.message.includes("billing")) {
                notifier.error(`Audio generation failed: API key is invalid or lacks permissions. Please check your setup.`);
            } else {
                notifier.error(`Audio generation failed: ${error.message}. Please check the script or try again.`);
            }
            setIsLoading(false);
            return; // Stop the process if audio fails
        }

        if (!audioData) {
            notifier.error("Audio generation did not return any data. Cannot proceed with video creation.");
            setIsLoading(false);
            return;
        }

        // --- Step 2: Generate Video ---
        try {
            const finalReferenceImages = referenceImages.filter((img): img is string => img !== null);
            const effectiveVideoModel = finalReferenceImages.length > 1 ? 'veo-3.1-generate-preview' : videoModel;
            const effectiveResolution = finalReferenceImages.length > 1 ? '720p' : resolution;
            const effectiveAspectRatio = finalReferenceImages.length > 1 ? '16:9' : aspectRatio;

            const operation = await generateVideo(selectedProduct.content.script, effectiveVideoModel, effectiveResolution, effectiveAspectRatio, startImage, null, finalReferenceImages);

            const newJob: Omit<RenderJob, 'id'> = {
                productName: selectedProduct.name,
                status: 'Rendering',
                progress: 10,
                createdAt: new Date().toISOString(),
                models: [effectiveVideoModel.startsWith('veo-3.1-generate') ? 'VEO 3.1 HQ' : 'VEO 3.1', 'Gemini TTS'],
                operationName: operation.name,
                audioData, // Use the generated audio data
                resolution: effectiveResolution,
                aspectRatio: effectiveAspectRatio
            };
            onAddRenderJob(newJob);
            notifier.success(`Video job for "${selectedProduct.name}" has been sent to the Render Queue.`);
        } catch (error: any) {
            logger.error("Failed to create video", { error });
            if (error.message.includes("Requested entity was not found") || error.message.includes("API key not valid") || error.message.includes("permission") || error.message.includes("billing")) {
                notifier.error(t('studio.apiKeyErrorMessage'));
                setIsApiKeySelected(false);
            } else {
                notifier.error(`Video creation failed: ${error.message}. Check your inputs or API status.`);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePublish = async () => {
        if (!selectedProductId) return;
        setIsPublishing(true);
        await onPublishProduct(selectedProductId);
        setIsPublishing(false);
        setIsConfirmingPublish(false);
        notifier.success(`"${selectedProduct?.name}" has been marked as published.`);
    };

    if (isCheckingApiKey) {
        return <div className="flex justify-center items-center h-64"><p>Checking API Key...</p></div>;
    }

    if (!isApiKeySelected && !apiKey) {
        return <ApiKeyModal onKeySelected={() => setIsApiKeySelected(true)} />;
    }

    const availableVoices: AudioVoiceSelection[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('studio.title')}</CardTitle>
                        <CardDescription>{t('studio.description')}</CardDescription>
                    </CardHeader>
                    <div className="p-4 border-t border-gray-700">
                        <label htmlFor="product-select" className="block text-sm font-medium text-gray-300 mb-2">{t('studio.selectProduct')}</label>
                        <select
                            id="product-select"
                            className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-50"
                            value={selectedProductId || ''}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="" disabled>{availableProducts.length > 0 ? t('studio.selectProduct') : t('studio.noProductsReady')}</option>
                            {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </Card>

                {selectedProduct && (
                    <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Google Gemini API Key</CardTitle>
                        </CardHeader>
                        <div className="p-4">
                            <div className="space-y-2">
                                <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300">
                                    API Key (Overrides Default)
                                </label>
                                <input
                                    id="api-key-input"
                                    type="password"
                                    value={apiKey}
                                    onChange={handleApiKeyChange}
                                    placeholder="Enter your API key"
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-start p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-4">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5"/>
                                <p className="text-sm text-yellow-200">
                                    <strong>Security Warning:</strong> Your key is stored in your browser's local storage. Do not use this feature in a public or shared environment. The recommended approach is to use the integrated API key selection for production.
                                </p>
                            </div>
                        </div>
                    </Card>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader className="flex items-center space-x-2"><Film className="w-5 h-5 text-primary-400" /><CardTitle>{t('studio.videoOptions')}</CardTitle></CardHeader>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="video-model" className="block text-sm font-medium text-gray-300 mb-2">{t('studio.videoModel')}</label>
                                        <select
                                            id="video-model"
                                            value={videoModel}
                                            onChange={(e) => setVideoModel(e.target.value as VideoModelSelection)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            disabled={referenceImages.filter(Boolean).length > 1}
                                        >
                                            <option value="veo-3.1-fast-generate-preview">VEO 3.1 Fast</option>
                                            <option value="veo-3.1-generate-preview">VEO 3.1 HQ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="resolution" className="block text-sm font-medium text-gray-300 mb-2">{t('studio.resolution')}</label>
                                        <select
                                            id="resolution"
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value as VideoResolution)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            disabled={referenceImages.filter(Boolean).length > 1}
                                        >
                                            <option value="720p">720p</option>
                                            <option value="1080p">1080p</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">{t('studio.aspectRatio')}</label>
                                        <select
                                            id="aspect-ratio"
                                            value={aspectRatio}
                                            onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            disabled={referenceImages.filter(Boolean).length > 1}
                                        >
                                            <option value="9:16">9:16 (Portrait)</option>
                                            <option value="16:9">16:9 (Landscape)</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <CardHeader className="flex items-center space-x-2"><Mic2 className="w-5 h-5 text-primary-400" /><CardTitle>{t('studio.audioOptions')}</CardTitle></CardHeader>
                                <div className="p-4 space-y-4">
                                     {speakers.length <= 1 ? (
                                        <div>
                                            <label htmlFor="audio-voice" className="block text-sm font-medium text-gray-300 mb-2">{t('studio.audioVoice')}</label>
                                            <select
                                                id="audio-voice"
                                                value={audioVoice}
                                                onChange={(e) => setAudioVoice(e.target.value as AudioVoiceSelection)}
                                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            >
                                                {availableVoices.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <h4 className="text-sm font-medium text-gray-300">{t('studio.multiSpeakerTitle')}</h4>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-3">{t('studio.multiSpeakerDesc')}</p>
                                            <div className="space-y-2">
                                                {speakers.map(speaker => (
                                                    <div key={speaker} className="flex items-center justify-between">
                                                        <label htmlFor={`speaker-voice-${speaker}`} className="text-sm font-medium text-gray-200">{speaker}:</label>
                                                        <select
                                                            id={`speaker-voice-${speaker}`}
                                                            value={speakerVoices[speaker] || ''}
                                                            onChange={(e) => setSpeakerVoices(prev => ({ ...prev, [speaker]: e.target.value as AudioVoiceSelection }))}
                                                            className="w-1/2 bg-gray-700/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                        >
                                                            {availableVoices.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                             <Card>
                                <CardHeader className="flex items-center space-x-2"><Images className="w-5 h-5 text-primary-400" /><CardTitle>{t('studio.imageReferenceTitle')}</CardTitle></CardHeader>
                                <CardDescription className="px-4 -mt-2 text-xs">{t('studio.imageReferenceDesc')}</CardDescription>
                                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <ImageUpload label={t('studio.startImage')} image={startImage} onImageChange={setStartImage} />
                                     {[0, 1, 2].map(i => (
                                         <ImageUpload key={i} label={t('studio.referenceImages') + ` ${i+1}`} image={referenceImages[i]} onImageChange={(img) => handleImageUpload(i, img)} />
                                     ))}
                                 </div>
                             </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Actions</CardTitle>
                                 </CardHeader>
                                 <div className="p-4 space-y-3">
                                     <Button onClick={() => setIsThumbnailModalOpen(true)} className="w-full" variant="secondary" icon={<Palette className="w-4 h-4" />}>{t('studio.generateThumbnail')}</Button>
                                     <Button onClick={handleCreateVideo} isLoading={isLoading} className="w-full" size="lg">{isLoading ? t('studio.creatingVideo') : t('studio.createVideo')}</Button>
                                     <Button onClick={() => setIsConfirmingPublish(true)} disabled={isPublishing || !!selectedProduct?.financials?.publishedAt} className="w-full" variant="secondary">{selectedProduct?.financials?.publishedAt ? t('studio.published') : t('studio.publishNow')}</Button>
                                 </div>
                             </Card>
                        </div>
                    </div>
                    </>
                )}
            </div>
            <ThumbnailGeneratorModal 
                isOpen={isThumbnailModalOpen}
                onClose={() => setIsThumbnailModalOpen(false)}
                onAccept={(img) => { setThumbnailImage(img); setIsThumbnailModalOpen(false); }}
                initialPrompt={selectedProduct?.content.selectedTitle || ''}
            />
            <AnimatePresence>
                {isConfirmingPublish && (
                     <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsConfirmingPublish(false)}
                    >
                         <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="glass-card w-full max-w-md p-6 rounded-lg"
                            onClick={e => e.stopPropagation()}
                        >
                             <CardTitle>{t('studio.confirmTitle')}</CardTitle>
                             <p className="text-gray-400 text-sm my-4">{t('studio.confirmMessage', { productName: selectedProduct?.name || '' })}</p>
                             <div className="flex justify-end space-x-2">
                                 <Button variant="secondary" onClick={() => setIsConfirmingPublish(false)}>{t('studio.cancel')}</Button>
                                 <Button onClick={handlePublish} isLoading={isPublishing}>{t('studio.confirmPublish')}</Button>
                             </div>
                         </motion.div>
                     </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
