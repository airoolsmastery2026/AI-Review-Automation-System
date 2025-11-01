const { GoogleGenAI } = require('@google/genai');

// Vercel handles environment variables, which we access via process.env
const getGenAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set in Vercel.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
                const { script } = body;
                if (!script) {
                    return res.status(400).json({ error: 'Missing script for /generate-video' });
                }
                const operation = await ai.models.generateVideos({
                    model: 'veo-3.1-fast-generate-preview',
                    prompt: script,
                    config: {
                        numberOfVideos: 1,
                        resolution: '720p',
                        aspectRatio: '9:16'
                    }
                });
                return res.status(200).json(operation);
            }

            case '/video-status': {
                const { operationName } = body;
                if (!operationName) {
                    return res.status(400).json({ error: 'Missing operationName for /video-status' });
                }
                const operation = await ai.operations.getVideosOperation({ operation: { name: operationName } });
                return res.status(200).json(operation);
            }

            default:
                return res.status(404).json({ error: `Endpoint not found: ${endpoint}` });
        }
    } catch (error) {
        console.error(`Error processing endpoint ${endpoint}:`, error);
        // Check for specific API key errors
        if (error.message.includes('API key not valid') || error.message.includes('not found') || error.message.includes('Requested entity was not found')) {
            return res.status(401).json({ error: 'API key not valid, not found, or billing not enabled. Please check your key in Vercel environment variables.', details: error.message });
        }
        return res.status(500).json({ error: 'An internal server error occurred', details: error.message });
    }
};
