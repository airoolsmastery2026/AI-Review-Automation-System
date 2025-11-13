export enum Page {
    DASHBOARD = 'Dashboard',
    AUTOMATION = 'Automation',
    PRODUCT_SCOUT = 'Product Scout',
    PROMPT_TEMPLATES = 'Prompt Templates',
    CONTENT_GENERATOR = 'Content Generator',
    STUDIO = 'Studio',
    RENDER_QUEUE = 'Render Queue',
    CONNECTIONS = 'Connections',
    ANALYTICS = 'Analytics',
    SYSTEM_STATUS = 'System Status',
    PROJECT_ROADMAP = 'Project Roadmap',
    APP_GUIDE = 'App Guide',
    FINANCE = 'Finance',
}

export interface Product {
    id: string;
    name: string;
    description: string;
    features: string;
    affiliateLink: string;
    commission?: number;
    rating?: number;
    conversions?: number;
}

export interface GeneratedContent {
    script?: string;
    titles?: string[];
    selectedTitle?: string;
    seoDescription?: string;
    captions?: {
        caption: string;
        hashtags: string[];
    };
    sources?: any[];
}

export interface ProductFinancials {
    productionCost: number;
    affiliateRevenue: number;
    publishedAt: string;
}

export interface ProductWithContent extends Product {
    content: GeneratedContent;
    financials?: ProductFinancials;
    performance?: PlatformPerformance[];
}

export enum GenerationType {
    SCRIPT = 'script',
    TITLES = 'titles',
    DESCRIPTION = 'description',
    CAPTIONS = 'captions'
}

export type IdeaStatus = 'Generated' | 'In Production' | 'Published';

export interface VideoIdea {
    id: number;
    title: string;
    category: string;
    status: IdeaStatus;
}

export interface PlatformPerformance {
    platform: 'YouTube' | 'TikTok' | 'Instagram';
    views: number;
    likes: number;
    shares: number;
}

export type RenderStatus = 'Queued' | 'Rendering' | 'Completed' | 'Failed';
export type AIModel = 'Sora 2' | 'VEO 3.1' | 'VEO 3.1 HQ' | 'Suno' | 'Dreamina' | 'KlingAI' | 'ElevenLabs Voice AI' | 'Gemini TTS';

export type VideoModelSelection = 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview';
export type AudioVoiceSelection = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export type TextModelSelection = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export type VideoResolution = '720p' | '1080p';
export type VideoAspectRatio = '9:16' | '16:9';


export interface RenderJob {
  id: number;
  productName: string;
  status: RenderStatus;
  progress: number;
  createdAt: string;
  models: AIModel[];
  operationName?: string;
  videoUrl?: string;
  audioData?: string;
  resolution?: VideoResolution;
  aspectRatio?: VideoAspectRatio;
}

export type ScoutStatus = 'pending' | 'approved' | 'declined' | 'skipped' | 'auto-producing';

export interface ScoutedProduct extends Product {
    status: ScoutStatus;
    foundAt: number; // Timestamp
    opportunityScore?: number;
    rpmPotential?: 'Low' | 'Medium' | 'High';
    affiliateScore?: number;
}

export interface Trend {
    topic: string;
    description: string;
}

export interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    context?: object;
}

export type ConnectionStatus = 'Configured' | 'Not Configured';

export interface Connection {
    id: string;
    nameKey: string;
    status: ConnectionStatus;
}

export interface AccountConnection {
    id: string; // Composite key: `${platformId}_${timestamp}`
    platformId: string;
    username: string;
    credentials: Record<string, string>;
    connectedAt: string;
    isActive?: boolean;
    commissionEstimate?: string;
}


export type ConnectionHealthStatus = 'Connected' | 'Refreshing' | 'Disconnected' | 'Error';

export interface ConnectionHealth {
    id: string;
    nameKey: string;
    status: ConnectionHealthStatus;
    lastChecked: string;
}

export interface AffiliateHealth {
    connectionId: string;
    platformId: string;
    username: string;
    status: 'OK' | 'Warning' | 'Error';
    message: string;
    lastChecked: string;
}

export type RoadmapStatus = 'Planned' | 'In Progress' | 'Completed';

export interface RoadmapTask {
    id: string;
    titleKey: string;
    descriptionKey: string;
    status: RoadmapStatus;
    tags: string[];
}

export interface ChangelogEntry {
    version: string;
    date: string;
    changeKeys: string[];
}

export interface AgentSettings {
    enabled: boolean;
    frequencyMinutes: number;
    defaultTopic: string;
}

export interface AutomationSettings {
    masterEnabled: boolean;
    scoutAgent: AgentSettings;
    autoApproveThreshold: number;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

export interface Platform {
    id: string;
    nameKey: string;
    docsUrl: string;
    signupUrl: string;
    neonColor: string;
    categoryKey: string;
    guideKey: string;
    credentials: { id: string; labelKey: string; placeholderKey: string; type: 'text' | 'password' }[];
}

declare global {
    interface AIStudio {
        openSelectKey: () => Promise<void>;
        hasSelectedApiKey: () => Promise<boolean>;
    }

    interface Window {
        aistudio?: AIStudio;
    }
}