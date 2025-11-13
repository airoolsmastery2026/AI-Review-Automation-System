

import { Type, Operation, VideoGenerationReferenceType, type VideoGenerationReferenceImage } from "@google/genai";
import type { Product, Trend, ScoutedProduct, ConnectionStatus, TextModelSelection, VideoModelSelection, AudioVoiceSelection, VideoResolution, VideoAspectRatio } from '../../../types';
import { logger } from './loggingService';

const BACKEND_URL = '/api/proxy'; // Use a relative path for Vercel serverless functions

const callBackend = async (endpoint: string, body: object): Promise<any> => {
    try {
        const apiKey = localStorage.getItem('gemini_api_key_override');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        }

        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ endpoint, ...body }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        logger.error(`Failed to call backend at ${endpoint}`, { error: error.message });
        // The "connection refused" error typically manifests as "Failed to fetch" in browsers.
        if (error.message.includes('Failed to fetch')) {
            throw new Error(`Could not connect to the backend service. If you are developing locally, please ensure the proxy server is running ('node server.js') and try again.`);
        }
        throw error;
    }
};

const generateContentWithProxy = async (params: { model: string, contents: any, config?: any }, identifier: string): Promise<any> => {
    logger.info(`Proxying Gemini API call for: ${identifier}`);
    const response = await callBackend('gemini', { params, type: identifier });
    return response;
};

const analyzeRpmPotential = async (productName: string, topic: string, model: TextModelSelection): Promise<'Low' | 'Medium' | 'High'> => {
    const prompt = `As a YouTube monetization expert, assess the RPM (Revenue Per Mille) for a YouTube Shorts video about "${productName}", a product in the "${topic}" niche. Consider factors like advertiser appeal, audience demographics, and topic saturation. Your entire response must be a single word: Low, Medium, or High.`;
    
    try {
        const response = await generateContentWithProxy({
            model: model,
            contents: prompt
        }, `Analyze RPM for ${productName}`);

        const cleanedResponse = response.text.trim();
        if (cleanedResponse === 'Low' || cleanedResponse === 'Medium' || cleanedResponse === 'High') {
            return cleanedResponse;
        }
        logger.warn(`Unexpected response for RPM analysis: "${cleanedResponse}". Defaulting to Medium.`);
        return 'Medium';
    } catch (error) {
        logger.error(`Error in analyzeRpmPotential, defaulting to Medium.`, { error });
        return 'Medium';
    }
}

export const scoutForProducts = async (topic: string, model: TextModelSelection): Promise<ScoutedProduct[]> => {
    const prompt = `
Act as an expert affiliate marketing researcher specializing in the digital product and AI tool space. 
Your task is to identify 5 newly trending or high-potential digital products or AI tools related to "${topic}".
For each product, provide the following information formatted as a valid JSON array that adheres to the provided schema.

- **name**: The official product name.
- **description**: A short, compelling one-sentence hook for a YouTube Shorts video (max 150 characters).
- **features**: A single string listing 3-4 key features, separated by commas.
- **affiliateLink**: A realistic-looking affiliate link (e.g., "https://product.com?ref=aivideo").
- **commission**: An estimated commission percentage (numeric value).
- **rating**: A user rating out of 5 (numeric, can have one decimal place).
- **conversions**: An estimated number of monthly conversions for a typical affiliate.

Focus on products that have launched or gained significant traction in the last 3-6 months.
`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING, description: "A unique ID for the product, can be the product name in camelCase." },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                features: { type: Type.STRING },
                affiliateLink: { type: Type.STRING },
                commission: { type: Type.NUMBER },
                rating: { type: Type.NUMBER },
                conversions: { type: Type.INTEGER },
            },
            required: ["id", "name", "description", "features", "affiliateLink", "commission", "rating", "conversions"]
        }
    };

    let baseProducts: Product[] = [];
    
    try {
        const response = await generateContentWithProxy({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }, `Scout for products on "${topic}"`);
        
        if (response.text.startsWith("Error:")) {
            logger.error("scoutForProducts received an error response from backend.", { responseText: response.text });
            return [];
        }
        
        const jsonText = response.text.trim();
        baseProducts = JSON.parse(jsonText);
    } catch (error) {
        logger.error("Error parsing JSON from scoutForProducts", { error });
        return [];
    }

    const enrichedProducts: ScoutedProduct[] = await Promise.all(baseProducts.map(async (p): Promise<ScoutedProduct> => {
        const rpmPotential = await analyzeRpmPotential(p.name, topic, model);
        const affiliateScore = (p.commission || 0) * (p.conversions || 0) / 1000;

        const rpmValue = { 'Low': 30, 'Medium': 60, 'High': 90 }[rpmPotential];
        
        const normalizedAffiliateScore = Math.min(affiliateScore, 100);

        const opportunityScore = Math.round((normalizedAffiliateScore * 0.6) + (rpmValue * 0.4));

        return {
            ...p,
            status: 'pending',
            foundAt: Date.now(),
            rpmPotential,
            affiliateScore: parseFloat(affiliateScore.toFixed(2)),
            opportunityScore
        };
    }));
    
    logger.info(`Enriched ${enrichedProducts.length} products with financial analysis.`, { topic });
    return enrichedProducts;
};

export const huntForTrends = async (model: TextModelSelection): Promise<Trend[]> => {
    const prompt = `
Act as a market trend analyst for digital content creators. 
Identify 5 emerging, high-potential trending topics or niches suitable for YouTube Shorts review videos.
Focus on areas with growing search volume but moderate competition.
For each trend, provide a concise topic name and a brief (1-2 sentences) description explaining its current relevance and potential.

Ensure the response is a valid JSON array matching the provided schema.
`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING },
                description: { type: Type.STRING },
            },
            required: ["topic", "description"]
        }
    };

    try {
        const response = await generateContentWithProxy({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }, "Hunt for trends");

        if (response.text.startsWith("Error:")) {
            logger.error("huntForTrends received an error response from backend.", { responseText: response.text });
            return [];
        }

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        logger.error("Error parsing JSON from huntForTrends", { error });
        return [];
    }
};


export const generateReviewScript = async (product: Product, model: TextModelSelection, useGrounding: boolean): Promise<{ script: string, sources?: any[] }> => {
    const prompt = `
You are an expert copywriter for viral YouTube Shorts. Write a concise and engaging 60-second video script (approximately 150 words) reviewing a digital product.

**Product Information:**
- Product Name: ${product.name}
- Description: ${product.description}
- Key Features: ${product.features}
- Affiliate Link: ${product.affiliateLink}
- Social Proof: Rated ${product.rating || 'excellent'}/5 by over ${product.conversions || 'thousands of'} users.

**Script Structure (Strictly follow this):**
1.  **Hook (3-5 seconds):** Start with a surprising question or a bold statement that grabs immediate attention. Example: "Stop wasting hours on [problem]. This new AI does it in 10 seconds."
2.  **Intro (5-10 seconds):** Briefly introduce "${product.name}" and the main problem it solves.
3.  **Key Features (20-25 seconds):** Showcase 3 key features from the list: ${product.features}. Describe each feature's benefit in a simple, impactful way.
4.  **Social Proof (5-7 seconds):** Naturally integrate the social proof. Example: "It's no wonder over ${product.conversions || 'thousands of'} users gave it a ${product.rating || 'excellent'} out of 5 rating."
5.  **Strong Call to Action (5-10 seconds):** Create a powerful sense of urgency and a clear, direct call to action. Tell viewers to use the affiliate link which is located in the bio or description. Emphasize that using the link is the best way to get the tool and support the channel. Example: "Don't wait on this. I've put the direct link in my bio for you to get it right now. Using that link is a huge help to the channel, so thank you!"

**Tone:** Energetic, trustworthy, and clear.
**Output:** Provide only the raw script text, without any section titles like "Hook:" or "Intro:". The sections should flow naturally into one another.
`;
    const response = await generateContentWithProxy({
        model,
        contents: prompt,
        config: useGrounding ? { tools: [{ googleSearch: {} }] } : undefined,
    }, `Generate script for ${product.name}`);
    
    return {
        script: response.text,
        sources: response.groundingMetadata?.groundingChunks
    };
};

export const generateVideoTitles = async (productName: string, model: TextModelSelection): Promise<string[]> => {
    const prompt = `
Generate 5 viral-style, high-click-through-rate (CTR) titles for a YouTube Shorts review of "${productName}".

**Requirements:**
- Each title must be under 50 characters.
- Use strong, emotional, or curiosity-driven language.
- Focus on benefits or surprising results.

**Examples:**
- "This AI is INSANE!"
- "My Jaw DROPPED 🤯"
- "99% of people don't know this tool."
- "The AI Tool That Changes Everything"

**Format:**
Your response must be ONLY a numbered list of the 5 titles. Do not include any other text, explanations, or quotation marks around the titles.
`;
    const response = await generateContentWithProxy({
        model: model,
        contents: prompt
    }, `Generate titles for ${productName}`);
    
    if (response.text.startsWith("Error:")) return [response.text];

    return response.text.split('\n').filter(line => line.trim().match(/^\d+\./)).map(line => line.replace(/^\d+\.\s*/, '').trim());
};

export const generateSeoDescription = async (productName: string, model: TextModelSelection): Promise<string> => {
    const prompt = `
You are a YouTube SEO expert. Write an optimized video description for a review of "${productName}".

**Structure to follow:**
1.  **Opening Line:** A concise, engaging sentence that includes "${productName}".
2.  **Product Summary (2-3 lines):** Briefly explain what the product does and who it's for.
3.  **Key Benefits (Bulleted list):** List 3 main benefits of using the tool.
4.  **Call to Action:** A clear CTA directing viewers to the affiliate link. Use the placeholder "[YOUR AFFILIATE LINK HERE]".
5.  **Hashtags:** Include 5-7 relevant SEO keywords as hashtags (e.g., #AI #Productivity #${productName.replace(/\s+/g, '')}).

The entire description should be concise and easy to read.
`;
    const response = await generateContentWithProxy({
        model: model,
        contents: prompt
    }, `Generate SEO description for ${productName}`);
    return response.text;
};

export const generateCaptionsAndHashtags = async (productName: string, model: TextModelSelection): Promise<{ caption: string, hashtags: string[] }> => {
    const prompt = `
You are a social media manager specializing in short-form video content. Create a caption and hashtags for a TikTok/Shorts video about "${productName}".

**Requirements:**
- **Caption:** Under 150 characters. Engaging, includes a call-to-action or question.
- **Hashtags:** A list of 10 relevant hashtags. Include a mix of broad (e.g., #AItools), niche-specific (e.g., #VideoEditingAI), and product-specific (e.g., #${productName.replace(/\s+/g, '')}) tags.

**Output Format (Strictly follow this):**
Caption: [Your generated caption here]
Hashtags: [#hashtag1 #hashtag2 #hashtag3 ...]
`;
    const response = await generateContentWithProxy({
        model: model,
        contents: prompt
    }, `Generate captions for ${productName}`);

    if (response.text.startsWith("Error:")) {
        return { caption: response.text, hashtags: [] };
    }

    const lines = response.text.split('\n');
    const captionLine = lines.find(line => line.toLowerCase().startsWith('caption:')) || '';
    const hashtagsLine = lines.find(line => line.toLowerCase().startsWith('hashtags:')) || '';

    const caption = captionLine.replace(/caption:/i, '').trim();
    const hashtags = hashtagsLine.replace(/hashtags:/i, '').trim().split(/\s+/).filter(h => h.startsWith('#'));

    return { caption, hashtags };
};

export const translateText = async (text: string, targetLanguage: string, model: TextModelSelection): Promise<string> => {
    const prompt = `
Translate the following text into ${targetLanguage}.
Provide only the translated text, without any introductory phrases or explanations.

Text to translate:
---
${text}
---
`;
    const response = await generateContentWithProxy({
        model: model,
        contents: prompt
    }, `Translate text to ${targetLanguage}`);
    return response.text;
};

export const generateVideo = async (
    script: string,
    model: VideoModelSelection,
    resolution: VideoResolution,
    aspectRatio: VideoAspectRatio,
    startImage: string | null,
    endImage: string | null,
    referenceImages: string[]
): Promise<Operation<any>> => {
    logger.info("Starting video generation via backend proxy.");

    const toPayload = (base64Image: string | null) => {
        if (!base64Image) return null;
        const parts = base64Image.split(';base64,');
        if (parts.length !== 2) {
            logger.warn("Invalid base64 image format provided.");
            return null;
        }
        const mimeType = parts[0].split(':')[1];
        const data = parts[1];
        return { data, mimeType };
    };

    const payload = {
        script,
        model,
        resolution,
        aspectRatio,
        startImage: toPayload(startImage),
        endImage: toPayload(endImage),
        referenceImages: referenceImages.map(toPayload).filter((p): p is { data: string, mimeType: string } => p !== null),
    };

    try {
        const operation = await callBackend('generate-video', payload);
        logger.info("Video generation operation started via backend.", { operationName: operation.name });
        return operation;
    } catch (error: any) {
        logger.error("Failed to start video generation via backend.", { error: error.message });
        throw error;
    }
};

export const generateSpeech = async (script: string, voice: AudioVoiceSelection, speakerVoiceConfig?: { speaker: string, voice: AudioVoiceSelection }[]): Promise<string> => {
    logger.info("Starting speech generation via backend proxy.");
    try {
        const response = await callBackend('generate-speech', { script, voice, speakerVoiceConfig });
        logger.info("Speech generation successful.");
        return response.audioData; 
    } catch (error: any) {
        logger.error("Failed to generate speech via backend.", { error: error.message });
        throw error;
    }
};

export const generateThumbnail = async (prompt: string): Promise<string> => {
    logger.info("Starting thumbnail generation via backend proxy.");
    try {
        const response = await callBackend('generate-thumbnail', { prompt });
        if (response.imageData) {
            logger.info("Thumbnail generation successful.");
            return `data:image/png;base64,${response.imageData}`;
        }
        throw new Error("imageData not found in backend response.");
    } catch (error: any) {
        logger.error("Failed to generate thumbnail via backend.", { error: error.message });
        throw error;
    }
};

export const getVideoOperationStatus = async (operationName: string): Promise<Operation<any>> => {
    logger.info(`Polling video operation status via backend for: ${operationName}`);
     try {
        return await callBackend('video-status', { operationName });
    } catch (error: any) {
         logger.error(`Failed to get video operation status from backend for ${operationName}`, { error: error.message });
        throw error;
    }
};

export const downloadVideo = async (videoUrl: string): Promise<Blob> => {
    logger.info("Starting video download via backend proxy.");
    try {
        const apiKey = localStorage.getItem('gemini_api_key_override');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        }
        
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ endpoint: 'download-video', videoUrl }),
        });

        if (!response.ok) {
            try {
                 const errorData = await response.json();
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            } catch (e) {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        return await response.blob();
    } catch (error: any) {
        logger.error("Failed to download video via backend.", { error: error.message });
        throw error;
    }
};

export const checkConnections = async (): Promise<Record<string, { status: ConnectionStatus }>> => {
    logger.info("Checking connection statuses from backend.");
    try {
       return await callBackend('check-connections', {});
    } catch (error: any) {
        logger.error("Failed to check connection statuses.", { error: error.message });
        throw error;
    }
};

export const checkUrlStatus = async (url: string): Promise<{ ok: boolean, status: number, statusText: string }> => {
    logger.info(`Checking URL status via proxy: ${url}`);
    try {
        return await callBackend('check-url', { url });
    } catch (error: any) {
        logger.error(`Failed to check URL status for ${url}`, { error: error.message });
        return { ok: false, status: 500, statusText: error.message };
    }
};