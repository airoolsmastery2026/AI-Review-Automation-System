
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { Download, Copy } from './LucideIcons';
import type { RenderJob } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { getVideoOperationStatus, downloadVideo } from './services/geminiService';
import { logger } from './services/loggingService';
import { useNotifier } from '../../contexts/NotificationContext';

interface RenderQueueProps {
    jobs: RenderJob[];
    setJobs: React.Dispatch<React.SetStateAction<RenderJob[]>>;
}

const POLLING_INTERVAL = 10000; // 10 seconds

const statusColors: Record<RenderJob['status'], string> = {
    'Queued': 'bg-gray-600 text-gray-100',
    'Rendering': 'bg-blue-500/20 text-blue-300',
    'Completed': 'bg-green-500/20 text-green-300',
    'Failed': 'bg-red-500/20 text-red-300',
};

const modelColors: Record<string, string> = {
    'Sora 2': 'border-purple-500',
    'VEO 3.1': 'border-blue-500',
    'VEO 3.1 HQ': 'border-indigo-400',
    'Suno': 'border-pink-500',
    'Dreamina': 'border-yellow-500',
    'KlingAI': 'border-green-500',
    'ElevenLabs Voice AI': 'border-cyan-500',
    'Gemini TTS': 'border-teal-500',
};

const getProgressText = (progress: number, t: (key: string) => string): string => {
    if (progress < 30) return t('renderQueue.progress_initializing');
    if (progress < 80) return t('renderQueue.progress_generating');
    if (progress < 100) return t('renderQueue.progress_finalizing');
    return t('renderQueue.Completed');
};

// Helper function to decode base64
const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Helper function to write strings into a DataView
const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

// FIX: Implement the createWavBlob function to correctly create a WAV file from raw PCM data.
// This fixes the error "A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value."
const createWavBlob = (base64Audio: string): Blob => {
    const pcmData = decode(base64Audio);
    const sampleRate = 24000; // Gemini TTS uses 24000Hz
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const fileSize = dataSize + 44; // 44 bytes for the header

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize - 8, true); // file-size - 8
    writeString(view, 8, 'WAVE');
    
    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // sub-chunk size (16 for PCM)
    view.setUint16(20, 1, true); // audio format (1 for PCM)
    view.setUint16(22, numChannels, true); // num channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, byteRate, true); // byte rate
    view.setUint16(32, blockAlign, true); // block align
    view.setUint16(34, bitsPerSample, true); // bits per sample

    // Data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true); // sub-chunk size

    // Write PCM data
    for (let i = 0; i < dataSize; i++) {
        view.setUint8(44 + i, pcmData[i]);
    }

    return new Blob([view], { type: 'audio/wav' });
};

// FIX: Implement and export the RenderQueue component.
// This fixes the error in App.tsx: Module '"./api/components/RenderQueue"' has no exported member 'RenderQueue'.
export const RenderQueue: React.FC<RenderQueueProps> = ({ jobs, setJobs }) => {
    const { t } = useI18n();
    const notifier = useNotifier();
    const [downloading, setDownloading] = React.useState<Record<number, 'video' | 'audio' | false>>({});

    React.useEffect(() => {
        const interval = setInterval(() => {
            jobs.forEach(async (job) => {
                if (job.status === 'Rendering' && job.operationName) {
                    try {
                        const operation = await getVideoOperationStatus(job.operationName);
                        if (operation.done) {
                            const videoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;
                            if (videoUrl) {
                                setJobs(prevJobs => prevJobs.map(j => 
                                    j.id === job.id ? { ...j, status: 'Completed', progress: 100, videoUrl } : j
                                ));
                                logger.info(`Video job for ${job.productName} completed.`);
                                notifier.success(`Video for "${job.productName}" is ready!`);
                            } else {
                                throw new Error("Operation done but no video URL found.");
                            }
                        } else {
                            setJobs(prevJobs => prevJobs.map(j => 
                                j.id === job.id ? { ...j, progress: Math.min(95, j.progress + 5) } : j
                            ));
                        }
                    } catch (error: any) {
                        logger.error(`Failed to poll status for ${job.productName}`, { error });
                        notifier.error(`Polling failed for ${job.productName}: ${error.message}`);
                        setJobs(prevJobs => prevJobs.map(j => 
                            j.id === job.id ? { ...j, status: 'Failed', progress: j.progress } : j
                        ));
                    }
                }
            });
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [jobs, setJobs, notifier, t]);

    const handleDownloadVideo = async (job: RenderJob) => {
        if (!job.videoUrl) return;
        setDownloading(prev => ({ ...prev, [job.id]: 'video' }));
        notifier.info(`Starting download for ${job.productName} video.`);
        try {
            const blob = await downloadVideo(job.videoUrl);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${job.productName.replace(/ /g, '_')}_video.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error: any) {
            logger.error(`Failed to download video for ${job.productName}`, { error });
            notifier.error(`Download failed: ${error.message}`);
        } finally {
            setDownloading(prev => ({ ...prev, [job.id]: false }));
        }
    };
    
    const handleDownloadAudio = (job: RenderJob) => {
        if (!job.audioData) return;
        setDownloading(prev => ({ ...prev, [job.id]: 'audio' }));
        notifier.info(`Preparing audio for ${job.productName}.`);
        try {
            const wavBlob = createWavBlob(job.audioData);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${job.productName.replace(/ /g, '_')}_audio.wav`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } catch (error: any) {
            logger.error(`Failed to create WAV blob for ${job.productName}`, { error });
            notifier.error(`Audio preparation failed: ${error.message}`);
        } finally {
            setDownloading(prev => ({ ...prev, [job.id]: false }));
        }
    };

    const handleCopyOperationName = (opName: string) => {
        navigator.clipboard.writeText(opName);
        notifier.success(t('notifications.copiedToClipboard'));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('renderQueue.title')}</CardTitle>
                <CardDescription>{t('renderQueue.description')}</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.product')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.status')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.progress')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.models')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.created')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {jobs.length > 0 ? jobs.map(job => (
                            <tr key={job.id} className="hover:bg-gray-800/40">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-100">{job.productName}</div>
                                    {job.operationName && (
                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                            <span>OP: {job.operationName.substring(0, 10)}...</span>
                                            <button onClick={() => handleCopyOperationName(job.operationName || '')} className="ml-2 hover:text-gray-200">
                                                <Copy className="w-3 h-3"/>
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[job.status]}`}>
                                        {t(`renderQueue.${job.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${job.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2">{job.progress}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{getProgressText(job.progress, t)}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {job.models.map(model => (
                                            <span key={model} className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${modelColors[model] || 'border-gray-500'}`}>
                                                {model}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(job.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {job.status === 'Completed' && job.videoUrl && (
                                            <Button size="sm" variant="ghost" onClick={() => handleDownloadVideo(job)} isLoading={downloading[job.id] === 'video'}>
                                                <Download className="h-4 w-4 mr-1"/> {t('renderQueue.download')}
                                            </Button>
                                        )}
                                        {job.audioData && (
                                            <Button size="sm" variant="ghost" onClick={() => handleDownloadAudio(job)} isLoading={downloading[job.id] === 'audio'}>
                                                <Download className="h-4 w-4 mr-1"/> {t('renderQueue.audio')}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                    {t('renderQueue.noJobs')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
