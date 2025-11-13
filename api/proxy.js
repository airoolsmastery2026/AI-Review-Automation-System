const { GoogleGenAI, Modality, VideoGenerationReferenceType } = require('@google/genai');

// Vercel handles environment variables, which we access via process.env
const getGenAI = (req) => {
    const apiKey = req.headers['x-api-key'] || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set in Vercel and no override provided.");
    }
    return new GoogleGenAI({ apiKey });
};

const PLATFORM_ENV_MAP = {
    // Social
    youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
    tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    instagram: ['INSTAGRAM_USER_ACCESS_TOKEN'],
    x: ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
    pinterest: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET'],
    telegram: ['TELEGRAM_BOT_TOKEN'],
    // Global Affiliate
    clickbank: ['CLICKBANK_API_KEY', 'CLICKBANK_DEVELOPER_KEY'],
    amazon: ['AMAZON_ASSOCIATE_TAG', 'AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY'],
    shopify: ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET_KEY', 'SHOPIFY_STORE_URL'],
    impact: ['IMPACT_ACCOUNT_SID', 'IMPACT_AUTH_TOKEN'],
    partnerstack: ['PARTNERSTACK_PUBLIC_KEY', 'PARTNERSTACK_SECRET_KEY'],
    digistore24: ['DIGISTORE24_API_KEY'],
    // VN Affiliate
    lazada: ['LAZADA_APP_KEY', 'LAZADA_APP_SECRET'],
    shopee: ['SHOPEE_PARTNER_ID', 'SHOPEE_API_KEY'],
    tiki: ['TIKI_CLIENT_ID', 'TIKI_CLIENT_SECRET'],
};

// This is the main handler for all requests to /api/proxy
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { endpoint, ...body } = req.body;

    try {
        if (!endpoint) {
            return res.status(400).json({ error: 'Missing endpoint in request body' });
        }

        const ai = getGenAI(req);

        if (endpoint === 'gemini') {
            const { params } = body;
            const response = await ai.models.generateContent(params);
            return res.status(200).json({ 
                text: response.text,
                groundingMetadata: response.candidates?.[0]?.groundingMetadata 
            });
        } else if (endpoint === 'generate-video') {
            const { script, model, resolution, aspectRatio, startImage, endImage, referenceImages } = body;
            
            const videoParams = {
                model,
                prompt: script,
                config: {
                    numberOfVideos: 1,
                    resolution: resolution || '720p',
                    aspectRatio: aspectRatio || '9:16'
                }
            };

            if (startImage) {
                videoParams.image = { imageBytes: startImage.data, mimeType: startImage.mimeType };
            }
            if (endImage) {
                videoParams.config.lastFrame = { imageBytes: endImage.data, mimeType: endImage.mimeType };
            }
             if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
                videoParams.config.referenceImages = referenceImages.map(img => ({
                    image: { imageBytes: img.data, mimeType: img.mimeType },
                    referenceType: VideoGenerationReferenceType.ASSET
                }));
                 // Override config based on multi-reference rules from documentation
                videoParams.model = 'veo-3.1-generate-preview';
                videoParams.config.resolution = '720p';
                videoParams.config.aspectRatio = '16:9';
            }
            
            const operation = await ai.models.generateVideos(videoParams);
            return res.status(200).json(operation);
        } else if (endpoint === 'generate-speech') {
             const { script, voice, speakerVoiceConfig } = body;

             const speechConfigPayload = {};
             if (speakerVoiceConfig && Array.isArray(speakerVoiceConfig) && speakerVoiceConfig.length > 0) {
                 speechConfigPayload.multiSpeakerVoiceConfig = {
                     speakerVoiceConfigs: speakerVoiceConfig.map(svc => ({
                         speaker: svc.speaker,
                         voiceConfig: { prebuiltVoiceConfig: { voiceName: svc.voice } }
                     }))
                 };
             } else {
                 speechConfigPayload.voiceConfig = { prebuiltVoiceConfig: { voiceName: voice } };
             }

             const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: script }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: speechConfigPayload,
                },
            });
            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            return res.status(200).json({ audioData });
        } else if (endpoint === 'generate-thumbnail') {
            const { prompt } = body;
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '16:9' }
            });
            const imageData = response.generatedImages[0].image.imageBytes;
            return res.status(200).json({ imageData });
        } else if (endpoint === 'video-status') {
            const { operationName } = body;
            const operation = await ai.operations.getVideosOperation({ operation: { name: operationName } });
            return res.status(200).json(operation);
        } else if (endpoint === 'download-video') {
            const { videoUrl } = body;
            const apiKey = req.headers['x-api-key'] || process.env.API_KEY;
            if (!apiKey) throw new Error('API key is required for download.');
            const fetchRes = await fetch(`${videoUrl}&key=${apiKey}`);
            if (!fetchRes.ok) throw new Error(`Failed to fetch video: ${fetchRes.statusText}`);
            res.setHeader('Content-Type', 'video/mp4');
            fetchRes.body.pipe(res);
            return;
        } else if (endpoint === 'check-connections') {
            const statuses = {};
            for (const [platform, envVars] of Object.entries(PLATFORM_ENV_MAP)) {
                statuses[platform] = {
                    status: envVars.every(v => process.env[v]) ? 'Configured' : 'Not Configured'
                };
            }
            return res.status(200).json(statuses);
        } else if (endpoint === 'check-url') {
            const { url } = body;
            if (!url) {
                return res.status(400).json({ error: 'Missing url in request body' });
            }
            try {
                const response = await fetch(url, { method: 'HEAD' });
                return res.status(200).json({ ok: response.ok, status: response.status, statusText: response.statusText });
            } catch (fetchError) {
                return res.status(200).json({ ok: false, status: 503, statusText: fetchError.message });
            }
        } else {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
    } catch (error) {
        console.error(`API Proxy Error at endpoint [${endpoint}]:`, error);
        const errorMessage = error.message || 'An unknown error occurred';
        let statusCode = 500;

        if (errorMessage.includes("API key not valid") || errorMessage.includes("not found") || errorMessage.includes("Requested entity was not found") || errorMessage.includes("permission") || errorMessage.includes("billing")) {
            statusCode = 401;
        }
        
        return res.status(statusCode).json({ error: `An error occurred at endpoint: ${endpoint}`, details: errorMessage });
    }
};