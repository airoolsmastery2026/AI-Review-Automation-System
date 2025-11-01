import { Type, Operation } from "@google/genai";
import type { Product, Trend, ScoutedProduct, ConnectionStatus } from '../types';
import { logger } from './loggingService';

const BACKEND_URL = '/api/proxy'; // Use a relative path for Vercel serverless functions

const callBackend = async (endpoint: string, body: object): Promise<any> => {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Pass the original endpoint and body to the single proxy function
            body: JSON.stringify({ endpoint, ...body }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        logger.error(`Failed to call backend at ${endpoint}`, { error: error.message });
        if (endpoint === '/api/gemini') {
            return { text: `Error: Could not connect to the backend service. Is it running? Details: ${error.message}` };
        }
        throw error;
    }
};

const generateContentWithProxy = async (params: { model: string, contents: any, config?: any }, identifier: string): Promise<string> => {
    logger.info(`Proxying Gemini API call for: ${identifier}`);
    const response = await callBackend('/gemini', { params, type: identifier });
    return response.text;
};

const analyzeRpmPotential = async (productName: string, topic: string): Promise<'Low' | 'Medium' | 'High'> => {
    const prompt = `Analyze the RPM (Revenue Per Mille / ad revenue) potential for a YouTube Shorts video about a product called "${productName}" in the niche "${topic}". 
    Consider audience value to advertisers and general interest.
    Respond with only one word: Low, Medium, or High.`;
    
    // In a real backend setup, we don't need to mock this. If the backend call fails, it will throw an error.
    // For now, let's keep a simple fallback for robustness.
    try {
        const responseText = await generateContentWithProxy({
            model: "gemini-2.5-flash",
            contents: prompt
        }, `Analyze RPM for ${productName}`);

        const cleanedResponse = responseText.trim();
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

export const scoutForProducts = async (topic: string): Promise<ScoutedProduct[]> => {
    const prompt = `
Act as an expert affiliate marketing researcher. Find 5 trending and high-converting digital products or AI tools related to the topic: "${topic}".
For each product, provide a concise name, a compelling description for a YouTube video, a list of 3-4 key features (as a string), a plausible-looking affiliate link, an estimated commission percentage (as a number), a user rating out of 5 (as a number), and an estimated number of conversions.
Ensure the response is a valid JSON array matching the provided schema.
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
        const responseText = await generateContentWithProxy({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }, `Scout for products on "${topic}"`);
        
        if (responseText.startsWith("Error:")) {
            logger.error("scoutForProducts received an error response from backend.", { responseText });
            return [];
        }
        
        const jsonText = responseText.trim();
        baseProducts = JSON.parse(jsonText);
    } catch (error) {
        logger.error("Error parsing JSON from scoutForProducts", { error });
        return [];
    }

    // Enrich products with financial analysis
    const enrichedProducts: ScoutedProduct[] = await Promise.all(baseProducts.map(async (p): Promise<ScoutedProduct> => {
        const rpmPotential = await analyzeRpmPotential(p.name, topic);
        const affiliateScore = (p.commission || 0) * (p.conversions || 0) / 1000; // Simplified score

        const rpmValue = { 'Low': 30, 'Medium': 60, 'High': 90 }[rpmPotential];
        
        // Normalize affiliate score to be roughly in the same range as RPM
        const normalizedAffiliateScore = Math.min(affiliateScore, 100);

        const opportunityScore = Math.round((normalizedAffiliateScore * 0.6) + (rpmValue * 0.4)); // 60% affiliate, 40% RPM

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

export const huntForTrends = async (): Promise<Trend[]> => {
    const prompt = `
Act as a market trend analyst specializing in digital products and affiliate marketing.
Identify 5 current, high-potential trending topics or niches for creating review videos (like YouTube Shorts).
For each trend, provide a concise topic name and a short, compelling description explaining why it's trending.

Ensure the response is a valid JSON array of objects, where each object has "topic" and "description" keys.
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
        const responseText = await generateContentWithProxy({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }, "Hunt for trends");

        if (responseText.startsWith("Error:")) {
            logger.error("huntForTrends received an error response from backend.", { responseText });
            return [];
        }

        const jsonText = responseText.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        logger.error("Error parsing JSON from huntForTrends", { error });
        return [];
    }
};


export const generateReviewScript = async (product: Product): Promise<string> => {
    const prompt = `
You are an expert YouTube content creator specializing in AI tools and digital products.
Write a short 60-second video script for a product review (YouTube Shorts format).

Structure:
1. Hook – grab attention immediately
2. Intro – what the product does
3. 3 Key Features – short, impactful
4. Real-world benefits – why it matters
5. Social Proof – Weave in user testimonials or social proof. Mention its high rating or popularity to build trust.
6. Call to Action (CTA) – encourage viewers to try via affiliate link

Product data:
- product_name: ${product.name}
- description: ${product.description}
- main_features: ${product.features}
- affiliate_link: ${product.affiliateLink}
- social_proof_data: This product has a user rating of ${product.rating || 'excellent'} out of 5 from over ${product.conversions || 'thousands of'} users. Use this information to create compelling social proof.

Tone: friendly, engaging, natural.
Language: English.
Avoid over-promotional language.
`;
    return generateContentWithProxy({
        model: 'gemini-2.5-flash',
        contents: prompt
    }, `Generate script for ${product.name}`);
};

export const generateVideoTitles = async (productName: string): Promise<string[]> => {
    const prompt = `
Generate 5 catchy video titles (under 50 characters)
for a YouTube Shorts review of the product: "${productName}".

Include curiosity or emotional hooks, e.g.:
“This AI app blew my mind!”, “The future of editing is here!”

Format the output as a numbered list. Do not add any extra text or explanations.
`;
    const response = await generateContentWithProxy({
        model: 'gemini-2.5-flash',
        contents: prompt
    }, `Generate titles for ${productName}`);
    
    if (response.startsWith("Error:")) return [response];

    return response.split('\n').filter(line => line.trim().match(/^\d+\./)).map(line => line.replace(/^\d+\.\s*/, '').trim());
};

export const generateSeoDescription = async (productName: string): Promise<string> => {
    const prompt = `
Write a YouTube SEO-friendly video description for a product review: "${productName}".

Include:
- Brief intro about the tool
- 3 key reasons to use it
- Affiliate link section
- SEO keywords related to AI, automation, review, productivity

Keep it concise, informative, and optimized for search.
Use [YOUR AFFILIATE LINK HERE] as a placeholder.
`;
    return generateContentWithProxy({
        model: 'gemini-2.5-flash',
        contents: prompt
    }, `Generate SEO description for ${productName}`);
};

export const generateCaptionsAndHashtags = async (productName: string): Promise<{ caption: string, hashtags: string[] }> => {
    const prompt = `
Create a short caption (under 200 characters) and 10 relevant hashtags
for a YouTube Shorts or TikTok video about the product: "${productName}".

Style: modern, catchy, and natural.
Language: English.
Example tone: "This AI tool just made content creation effortless! #AITools #Productivity"

IMPORTANT: Format the output strictly as follows, with each on a new line:
Caption: [Your generated caption here]
Hashtags: [Your generated hashtags here, separated by spaces]
`;
    const response = await generateContentWithProxy({
        model: 'gemini-2.5-flash',
        contents: prompt
    }, `Generate captions for ${productName}`);

    if (response.startsWith("Error:")) {
        return { caption: response, hashtags: [] };
    }

    const lines = response.split('\n');
    const captionLine = lines.find(line => line.toLowerCase().startsWith('caption:')) || '';
    const hashtagsLine = lines.find(line => line.toLowerCase().startsWith('hashtags:')) || '';

    const caption = captionLine.replace(/caption:/i, '').trim();
    const hashtags = hashtagsLine.replace(/hashtags:/i, '').trim().split(/\s+/).filter(h => h.startsWith('#'));

    return { caption, hashtags };
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    const prompt = `
Translate the following text into ${targetLanguage}.
Provide only the translated text, without any introductory phrases or explanations.

Text to translate:
---
${text}
---
`;
    return generateContentWithProxy({
        model: 'gemini-2.5-flash',
        contents: prompt
    }, `Translate text to ${targetLanguage}`);
};

export const generateVideo = async (script: string): Promise<Operation | { name: string, done: false }> => {
    logger.info("Starting video generation via backend proxy.");
    try {
        const operation = await callBackend('/generate-video', { script });
        logger.info("Video generation operation started via backend.", { operationName: operation.name });
        return operation;
    } catch (error: any) {
        logger.error("Failed to start video generation via backend.", { error: error.message });
        throw error;
    }
};

export const generateSpeech = async (script: string): Promise<string> => {
    logger.info("Starting speech generation via backend proxy.");
    try {
        const response = await callBackend('/generate-speech', { script });
        logger.info("Speech generation successful.");
        return response.audioData; // The backend will return { audioData: 'base64...' }
    } catch (error: any) {
        logger.error("Failed to generate speech via backend.", { error: error.message });
        throw error;
    }
};

export const getVideoOperationStatus = async (operationName: string): Promise<Operation> => {
    logger.info(`Polling video operation status via backend for: ${operationName}`);
     try {
        return await callBackend('/video-status', { operationName });
    } catch (error: any) {
         logger.error(`Failed to get video operation status from backend for ${operationName}`, { error: error.message });
        throw error;
    }
};

export const downloadVideo = async (videoUrl: string): Promise<Blob> => {
    logger.info("Starting video download via backend proxy.");
    try {
        // This fetch is different; it expects a blob, not JSON.
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: '/download-video', videoUrl }),
        });

        if (!response.ok) {
            // Try to parse error JSON, but fall back if it's not JSON
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
       return await callBackend('/check-connections', {});
    } catch (error: any) {
        logger.error("Failed to check connection statuses.", { error: error.message });
        throw error;
    }
};