
import { GoogleGenAI, Type } from "@google/genai";
import type { Product, Trend } from '../types';
import { logger } from './loggingService';

// Fix: Initialize the GoogleGenAI client once, sourcing the API key directly from environment variables as per guidelines.
const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

if (!ai) {
    const msg = "Gemini API key not found in process.env.API_KEY. AI features will be mocked.";
    console.warn(msg);
    logger.warn(msg);
}

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentWithRetry = async (params: { model: string, contents: any, config?: any }, identifier: string): Promise<string> => {
    if (!ai) {
       await sleep(500); // Simulate API call
       const mockedResponse = `This is a mocked response for ${identifier}. Prompt: "${String(params.contents).substring(0, 100)}..."`;
       logger.warn('Gemini API mocked response generated.', { identifier });
       return mockedResponse;
    }

    for (let i = 0; i < RETRY_COUNT; i++) {
        try {
            logger.info(`Gemini API call attempt #${i + 1} for: ${identifier}`);
            const response = await ai.models.generateContent(params);
            logger.info(`Gemini API call successful for: ${identifier}`);
            return response.text;
        } catch (error: any) {
            logger.error(`Gemini API call failed for: ${identifier}`, { attempt: i + 1, error: error.message });
            if (i === RETRY_COUNT - 1) {
                return `Error: Could not generate content for ${identifier} after ${RETRY_COUNT} attempts. Please check your API key and network connection.`;
            }
            await sleep(RETRY_DELAY_MS * (i + 1)); // Exponential backoff
        }
    }
    return `Error: Unexpected failure to generate content for ${identifier}.`;
};

export const scoutForProducts = async (topic: string): Promise<Product[]> => {
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

    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { id: 'mockProduct1', name: `Mock AI Tool for ${topic}`, description: 'A great mock tool.', features: 'Feature A, Feature B', affiliateLink: 'https://mock.link/1', commission: 50, rating: 4.5, conversions: 1500 },
            { id: 'mockProduct2', name: `Mock Digital Course for ${topic}`, description: 'Learn all about mock things.', features: 'Module 1, Module 2', affiliateLink: 'https://mock.link/2', commission: 40, rating: 4.8, conversions: 2200 },
        ];
    }

    try {
        const responseText = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }, `Scout for products on "${topic}"`);
        
        if (responseText.startsWith("Error:")) {
            logger.error("scoutForProducts received an error response from Gemini.", { responseText });
            return [];
        }
        
        const jsonText = responseText.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        logger.error("Error parsing JSON from scoutForProducts", { error });
        return [];
    }
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

    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { topic: 'Mock Trend: AI Video Tools', description: 'This is a mocked trend description because the API key is not configured.' },
            { topic: 'Mock Trend: Sustainable Tech', description: 'Another mocked trend for eco-friendly gadgets.' },
        ];
    }

    try {
        const responseText = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }, "Hunt for trends");

        if (responseText.startsWith("Error:")) {
            logger.error("huntForTrends received an error response from Gemini.", { responseText });
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
5. Call to Action (CTA) – encourage viewers to try via affiliate link

Product data:
- product_name: ${product.name}
- description: ${product.description}
- main_features: ${product.features}
- affiliate_link: ${product.affiliateLink}

Tone: friendly, engaging, natural.
Language: English.
Avoid over-promotional language.
`;
    return generateContentWithRetry({
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
    const response = await generateContentWithRetry({
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
    return generateContentWithRetry({
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
    const response = await generateContentWithRetry({
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
