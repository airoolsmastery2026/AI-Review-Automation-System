import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { Download } from './LucideIcons';
import type { RenderJob } from '../types';
import { useI18n } from '../hooks/useI18n';
import { getVideoOperationStatus, downloadVideo } from '../services/geminiService';
import { logger } from '../services/loggingService';

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

// Helper function to write strings into a DataView
const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

// Helper function to convert raw PCM audio data (from base64) into a valid WAV Blob
const createWavBlob = (base64Audio: string): Blob => {
    // Constants for WAV header (assuming 24kHz, 16-bit mono PCM from Gemini TTS)
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    // Decode base64 to Uint8Array for PCM data
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const pcmData = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        pcmData[i] = binaryString.charCodeAt(i);
    }
    const dataSize = pcmData.length;

    // Create a 44-byte buffer for the WAV header
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // file-size - 8
    writeString(view, 8, 'WAVE');
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size (16 for PCM)
    view.setUint16(20, 1, true);  // audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Combine header and PCM data into a single Blob
    return new Blob([view, pcmData], { type: 'audio/wav' });
};


export const RenderQueue: React.FC<RenderQueueProps> = ({ jobs, setJobs }) => {
    const { t } = useI18n();
    const activePolls = useRef<Set<string>>(new Set()).current;
    const [downloadingJobId, setDownloadingJobId] = useState<number | null>(null);
    const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});

    useEffect(() => {
        const pollStatus = async (job: RenderJob) => {
            if (!job.operationName || activePolls.has(job.operationName)) return;

            activePolls.add(job.operationName);
            try {
                const operation = await getVideoOperationStatus(job.operationName);
                if (operation.done) {
                    const videoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;
                    setJobs(prev => prev.map(j => 
                        j.id === job.id ? { ...j, status: 'Completed', progress: 100, videoUrl } : j
                    ));
                     logger.info(`Video job for "${job.productName}" completed.`, { videoUrl });
                } else {
                     setJobs(prev => prev.map(j => 
                        j.id === job.id ? { ...j, progress: Math.min(j.progress + 10, 95) } : j
                    ));
                }
            } catch (error) {
                logger.error(`Polling failed for job "${job.productName}"`, { error });
                 setJobs(prev => prev.map(j => 
                    j.id === job.id ? { ...j, status: 'Failed' } : j
                ));
            } finally {
                 activePolls.delete(job.operationName);
            }
        };

        const interval = setInterval(() => {
            jobs.forEach(job => {
                if (job.status === 'Rendering' && job.progress < 100) {
                    pollStatus(job);
                }
            });
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [jobs, setJobs, activePolls]);

    // Effect to create playable Blob URLs for audio data
    useEffect(() => {
        jobs.forEach(job => {
            if (job.audioData && !audioUrls[job.id]) {
                try {
                    const wavBlob = createWavBlob(job.audioData);
                    const url = URL.createObjectURL(wavBlob);
                    setAudioUrls(prev => ({ ...prev, [job.id]: url }));
                } catch (error) {
                    logger.error(`Failed to create WAV blob for job ${job.id}`, { error });
                }
            }
        });

        // Cleanup object URLs on component unmount
        return () => {
            Object.values(audioUrls).forEach(URL.revokeObjectURL);
        };
    }, [jobs, audioUrls]);


    const handleDownload = async (job: RenderJob) => {
        if (!job.videoUrl) {
            logger.error("Download failed: Video URL is missing.", { job });
            return;
        }

        setDownloadingJobId(job.id);
        try {
            const blob = await downloadVideo(job.videoUrl);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${job.productName.replace(/ /g, '_')}_video.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            logger.info(`Video for "${job.productName}" downloaded successfully.`);
        } catch (error) {
            logger.error(`Error downloading video for "${job.productName}"`, { error });
        } finally {
            setDownloadingJobId(null);
        }
    };

    const handleAudioDownload = (job: RenderJob) => {
        if (!job.audioData) return;
        try {
            const blob = createWavBlob(job.audioData);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${job.productName.replace(/ /g, '_')}_audio.wav`;
            a.click();
            window.URL.revokeObjectURL(url);
            logger.info(`Audio for "${job.productName}" downloaded successfully.`);
        } catch (error) {
            logger.error(`Error downloading audio for "${job.productName}"`, { error });
        }
    }

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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.audio')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('renderQueue.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {jobs.length > 0 ? jobs.map(job => (
                            <tr key={job.id} className="hover:bg-gray-800/40">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{job.productName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[job.status]}`}>
                                        {t(`renderQueue.${job.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mr-3">
                                            <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${job.progress}%` }}></div>
                                        </div>
                                        <span className="w-24 text-right text-xs">{job.status === 'Rendering' ? getProgressText(job.progress, t) : `${job.progress}%`}</span>
                                    </div>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex flex-wrap gap-1">
                                        {job.models.map(model => (
                                            <span key={model} className={`px-2 py-0.5 text-xs rounded border ${modelColors[model] || 'border-gray-500'}`}>{model}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                     {audioUrls[job.id] && (
                                        <audio controls className="h-8 w-48" src={audioUrls[job.id]}></audio>
                                     )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {job.audioData && (
                                            <Button size="sm" variant="ghost" onClick={() => handleAudioDownload(job)}>
                                                <Download className="h-4 w-4 mr-2" />
                                                {t('renderQueue.downloadAudio')}
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            disabled={job.status !== 'Completed'}
                                            isLoading={downloadingJobId === job.id}
                                            onClick={() => handleDownload(job)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            {t('renderQueue.download')}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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