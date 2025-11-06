
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { TemplateIcon } from './Icons';
import { useI18n } from '../../hooks/useI18n';
import { logger } from '../../services/loggingService';

type TemplateType = 'script' | 'titles' | 'description' | 'captions';

interface PromptTemplate {
    id: string;
    name: string;
    type: TemplateType;
    content: string;
}

const initialTemplates: PromptTemplate[] = [
    { 
        id: '1', 
        name: 'Automatic Review Script', 
        type: 'script', 
        content: `You are an expert YouTube content creator specializing in AI tools and digital products.
Write a short 60-second video script for a product review (YouTube Shorts format).

Structure:
1. Hook – grab attention immediately
2. Intro – what the product does
3. 3 Key Features – short, impactful
4. Real-world benefits – why it matters
5. Social Proof – Weave in user testimonials or social proof. Mention its high rating or popularity to build trust.
6. Call to Action (CTA) – encourage viewers to try via affiliate link

Product data:
{{product_name}}, {{description}}, {{main_features}}, {{affiliate_link}}, {{rating}}, {{conversions}}

Tone: friendly, engaging, natural.
Avoid over-promotional language.` 
    },
    { 
        id: '2', 
        name: 'Caption & Hashtag Generator', 
        type: 'captions', 
        content: `Create a short caption (under 200 characters) and 10 relevant hashtags
for a YouTube Shorts or TikTok video about the product: {{product_name}}.

Style: modern, catchy, and natural.
Language: English.
Example tone: "This AI tool just made content creation effortless! #AITools #Productivity"` 
    },
    { 
        id: '3', 
        name: 'YouTube SEO Description', 
        type: 'description', 
        content: `Write a YouTube SEO-friendly video description for a product review: {{product_name}}.

Include:
- Brief intro about the tool
- 3 key reasons to use it
- Affiliate link section
- SEO keywords related to AI, automation, review, productivity

Keep it concise, informative, and optimized for search.` 
    },
    { 
        id: '4', 
        name: 'Video Title Generator', 
        type: 'titles', 
        content: `Generate 5 catchy video titles (under 50 characters)
for a YouTube Shorts review of the product: {{product_name}}.

Include curiosity or emotional hooks, e.g.:
“This AI app blew my mind!”, “The future of editing is here!”` 
    },
    { 
        id: '5', 
        name: 'Google Sites Page Content', 
        type: 'description', 
        content: `Write web content for a Google Sites landing page that lists all AI review videos.

Sections to include:
- About the channel (mission and goals)
- Featured AI tools (list format)
- Latest reviews (dynamic section)
- Join community / contact

Tone: professional, clear, and inspiring.
Language: English.` 
    },
];


export const PromptTemplates: React.FC = () => {
    const [templates, setTemplates] = useState(initialTemplates);
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { t } = useI18n();
    
    const typeStyles: Record<TemplateType, { color: string, label: string }> = {
        script: { color: 'bg-blue-500/20 text-blue-300', label: t('promptTemplates.script') },
        titles: { color: 'bg-green-500/20 text-green-300', label: t('promptTemplates.titles') },
        description: { color: 'bg-yellow-500/20 text-yellow-300', label: t('promptTemplates.description_type') },
        captions: { color: 'bg-purple-500/20 text-purple-300', label: t('promptTemplates.captions') },
    }

    const handleSelectTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setIsCreating(false);
    }

    const handleCreateNew = () => {
        setIsCreating(true);
        setSelectedTemplate({ id: `temp_${Date.now()}`, name: '', type: 'script', content: '' });
    }

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        try {
            if (isCreating) {
                setTemplates(prev => [...prev, selectedTemplate]);
            } else {
                setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
            }
            setSelectedTemplate(null);
            setIsCreating(false);
        } catch (e) {
            logger.error("Failed to save template", { error: e });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                 <Button onClick={handleCreateNew} className="w-full">{t('promptTemplates.createButton')}</Button>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('promptTemplates.templates')}</CardTitle>
                    </CardHeader>
                     <ul className="divide-y divide-gray-700 p-2">
                        {templates.map(template => (
                             <li key={template.id} onClick={() => handleSelectTemplate(template)} className={`p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 ${selectedTemplate?.id === template.id ? 'bg-gray-700/50' : ''}`}>
                                <div className="flex justify-between items-center">
                                     <p className="font-semibold text-gray-200">{template.name}</p>
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeStyles[template.type].color}`}>{typeStyles[template.type].label}</span>
                                </div>
                                <p className="text-sm text-gray-400 truncate mt-1">{template.content}</p>
                            </li>
                        ))}
                    </ul>
                 </Card>
            </div>
            <div className="lg:col-span-2">
                {selectedTemplate ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{isCreating ? t('promptTemplates.createTitle') : t('promptTemplates.editTitle')}</CardTitle>
                            <CardDescription>{t('promptTemplates.description')}</CardDescription>
                        </CardHeader>
                        <div className="p-6 space-y-4">
                             <div>
                                <label htmlFor="template-name" className="block text-sm font-medium text-gray-300 mb-1">{t('promptTemplates.nameLabel')}</label>
                                <input 
                                    type="text" 
                                    id="template-name" 
                                    value={selectedTemplate.name}
                                    onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="template-type" className="block text-sm font-medium text-gray-300 mb-1">{t('promptTemplates.typeLabel')}</label>
                                <select 
                                    id="template-type"
                                    value={selectedTemplate.type}
                                    onChange={(e) => setSelectedTemplate({...selectedTemplate, type: e.target.value as TemplateType})}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500">
                                    <option value="script">{t('promptTemplates.script')}</option>
                                    <option value="titles">{t('promptTemplates.titles')}</option>
                                    <option value="description">{t('promptTemplates.description_type')}</option>
                                    <option value="captions">{t('promptTemplates.captions')}</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="template-content" className="block text-sm font-medium text-gray-300 mb-1">{t('promptTemplates.contentLabel')}</label>
                                <textarea 
                                    id="template-content"
                                    rows={10}
                                    value={selectedTemplate.content}
                                    onChange={(e) => setSelectedTemplate({...selectedTemplate, content: e.target.value})}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                                    placeholder={t('promptTemplates.placeholder')}
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('promptTemplates.helpText')}</p>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setSelectedTemplate(null)}>{t('promptTemplates.cancel')}</Button>
                                <Button onClick={handleSave} isLoading={isSaving}>{t('promptTemplates.save')}</Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-700">
                        <div className="text-center">
                            <TemplateIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-400">{t('promptTemplates.selectPrompt')}</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};