require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for potential large payloads

// This is a proxy, so we create a new instance for each request to ensure
// we're using the latest API key if it's managed dynamically.
const getGenAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });


// Endpoint to handle general Gemini content generation
app.post('/api/gemini', async (req, res) => {
    const { params } = req.body;
    if (!params) {
        return res.status(400).json({ error: 'Missing parameters in request body' });
    }

    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent(params);
        // Using response.text as per guidelines for direct text output
        res.json({ text: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'An error occurred while calling the Gemini API', details: error.message });
    }
});

// Endpoint to start video generation
app.post('/api/generate-video', async (req, res) => {
    const { script } = req.body;
    if (!script) {
        return res.status(400).json({ error: 'Missing script in request body' });
    }

    try {
        const ai = getGenAI();
        const operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: script,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16' // Optimized for Shorts/TikTok
            }
        });
        res.json(operation);
    } catch (error) {
        console.error('Video Generation Error:', error);
        if (error.message.includes('API key not valid') || error.message.includes('not found') || error.message.includes('Requested entity was not found')) {
             return res.status(401).json({ error: 'API key not valid or not found. Please select a valid key.', details: error.message });
        }
        res.status(500).json({ error: 'An error occurred while starting video generation', details: error.message });
    }
});

// Endpoint to check video generation status
app.post('/api/video-status', async (req, res) => {
    const { operationName } = req.body;
    if (!operationName) {
        return res.status(400).json({ error: 'Missing operationName in request body' });
    }
    
    try {
        const ai = getGenAI();
        const operation = await ai.operations.getVideosOperation({ operation: { name: operationName } });
        res.json(operation);
    } catch (error) {
        console.error('Video Status Check Error:', error);
        if (error.message.includes('API key not valid') || error.message.includes('not found') || error.message.includes('Requested entity was not found')) {
             return res.status(401).json({ error: 'API key not valid or not found. Please select a valid key.', details: error.message });
        }
        res.status(500).json({ error: 'An error occurred while checking video status', details: error.message });
    }
});


app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
