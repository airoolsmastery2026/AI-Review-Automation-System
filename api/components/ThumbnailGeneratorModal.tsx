
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './common/Button';
import { X, Palette } from './LucideIcons';
import { generateThumbnail } from './services/geminiService';
import { Spinner } from './common/Spinner';
import { useNotifier } from '../../contexts/NotificationContext';
import { logger } from './services/loggingService';

interface ThumbnailGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (imageData: string) => void;
    initialPrompt: string;
}

export const ThumbnailGeneratorModal: React.FC<ThumbnailGeneratorModalProps> = ({ isOpen, onClose, onAccept, initialPrompt }) => {
    const { t } = useI18n();
    const notifier = useNotifier();
    const [prompt, setPrompt] = React.useState(initialPrompt);
    const [isLoading, setIsLoading] = React.useState(false);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedImage(null);
        try {
            const imageDataUrl = await generateThumbnail(prompt);
            setGeneratedImage(imageDataUrl);
        } catch (error: any) {
            logger.error('Thumbnail generation failed', { error });
            notifier.error(`Thumbnail generation failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        if (generatedImage) {
            onAccept(generatedImage);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="glass-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <Palette className="w-6 h-6 text-primary-400" />
                                <h2 className="text-xl font-bold text-gray-100">{t('studio.generateThumbnailTitle')}</h2>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></Button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="thumbnail-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('studio.promptLabel')}
                                    </label>
                                    <textarea
                                        id="thumbnail-prompt"
                                        rows={8}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={t('studio.promptPlaceholder')}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans text-sm"
                                    />
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    isLoading={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? t('studio.generatingThumbnail') : t('studio.generateThumbnail')}
                                </Button>
                            </div>
                            <div className="flex items-center justify-center w-full h-72 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600">
                                {isLoading && <Spinner />}
                                {!isLoading && generatedImage && (
                                    <img src={generatedImage} alt="Generated thumbnail" className="w-full h-full object-contain rounded-md" />
                                )}
                                {!isLoading && !generatedImage && (
                                    <p className="text-gray-500">{t('studio.generateThumbnailDescription')}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end p-4 bg-gray-900/40 rounded-b-xl space-x-2">
                             <Button variant="secondary" onClick={onClose}>
                                {t('studio.cancel')}
                            </Button>
                            <Button onClick={handleAccept} disabled={!generatedImage || isLoading}>
                                {t('studio.acceptThumbnail')}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
