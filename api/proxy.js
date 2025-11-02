
const { GoogleGenAI, Modality } = require('@google/genai');

// Vercel handles environment variables, which we access via process.env
const getGenAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set in Vercel.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    // Vercel automatically enables CORS for same-origin, but we can set headers if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { endpoint, ...body } = req.body;

    try {
        const ai = getGenAI();

        switch (endpoint) {
            case '/gemini': {
                const { params } = body;
                if (!params) {
                    return res.status(400).json({ error: 'Missing parameters for /gemini' });
                }
                const response = await ai.models.generateContent(params);
                return res.status(200).json({ text: response.text });
            }

            case '/generate-video': {
                const { script, image, model } = body; // image will be { data: '...', mimeType: '...' }
                if (!script) {
                    return res.status(400).json({ error: 'Missing script for /generate-video' });
                }
                
                const videoParams = {
                    model: model || 'veo-3.1-fast-generate-preview',
                    prompt: script,
                    config: {
                        numberOfVideos: 1,
                        resolution: '720p',
                        aspectRatio: '9:16'
                    }
                };
            
                if (image && image.data && image.mimeType) {
                    videoParams.image = {
                        imageBytes: image.data,
                        mimeType: image.mimeType
                    };
                }
            
                const operation = await ai.models.generateVideos(videoParams);
                return res.status(200).json(operation);
            }

            case '/generate-speech': {
                const { script, voice } = body;
                if (!script) {
                    return res.status(400).json({ error: 'Missing script for /generate-speech' });
                }
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: script }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' } },
                        },
                    },
                });
                const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                return res.status(200).json({ audioData });
            }
            
            case '/generate-thumbnail': {
                const { prompt } = body;
                if (!prompt) {
                    return res.status(400).json({ error: 'Missing prompt for /generate-thumbnail' });
                }
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });

                // Find the image part in the response
                const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (imagePart && imagePart.inlineData) {
                    const imageData = imagePart.inlineData.data; // This is the base64 string
                    return res.status(200).json({ imageData });
                } else {
                    return res.status(500).json({ error: 'Failed to generate thumbnail image from AI response' });
                }
            }

            case '/video-status': {
                const { operationName } = body;
                if (!operationName) {
                    return res.status(400).json({ error: 'Missing operationName for /video-status' });
                }
                const operation = await ai.operations.getVideosOperation({ operation: { name: operationName } });
                return res.status(200).json(operation);
            }

            case '/download-video': {
                const { videoUrl } = body;
                if (!videoUrl) {
                    return res.status(400).json({ error: 'Missing videoUrl for /download-video' });
                }
                try {
                    const videoResponse = await fetch(`${videoUrl}&key=${process.env.API_KEY}`);
                    if (!videoResponse.ok) {
                        throw new Error(`Failed to fetch video from source: ${videoResponse.statusText}`);
                    }
                    
                    res.setHeader('Content-Type', 'video/mp4');
                    res.setHeader('Content-Disposition', `attachment; filename="generated_video.mp4"`);
                    
                    const { Readable } = require('stream');
                    const readableNodeStream = Readable.fromWeb(videoResponse.body);
                    return readableNodeStream.pipe(res);
                } catch (error) {
                    console.error('Video download error:', error);
                    return res.status(500).json({ error: 'Failed to download video', details: error.message });
                }
            }

            case '/check-connections': {
                const statuses = {};
                for (const platformId in PLATFORM_ENV_MAP) {
                    const keys = PLATFORM_ENV_MAP[platformId];
                    const isConfigured = keys.every(key => process.env[key]);
                    statuses[platformId] = { status: isConfigured ? 'Configured' : 'Not Configured' };
                }
                return res.status(200).json(statuses);
            }

            default:
                return res.status(404).json({ error: `Endpoint not found: ${endpoint}` });
        }
    } catch (error) {
        console.error(`Error processing endpoint ${endpoint}:`, error);
        if (error.message.includes('API key not valid') || error.message.includes('not found') || error.message.includes('Requested entity was not found') || error.message.includes('billing')) {
            return res.status(401).json({ error: 'API key not valid, not found, or billing not enabled. Please check your key in Vercel environment variables.', details: error.message });
        }
        return res.status(500).json({ error: 'An internal server error occurred', details: error.message });
    }
};