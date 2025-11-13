import * as React from 'react';
import { Page, type Product, type ProductWithContent, type GeneratedContent, type RenderJob, type ScoutedProduct, type AutomationSettings } from './types';
import { slugToPage } from './utils/navigation';
import { Sidebar } from './api/components/Sidebar';
import { Header } from './api/components/Header';
import { Starfield } from './api/components/common/Starfield';
import { ToastContainer } from './api/components/ToastContainer';

// Import Page Components
import { Dashboard } from './api/components/Dashboard';
import { Automation } from './api/components/Automation';
import { ProductScout } from './api/components/ProductScout';
import { PromptTemplates } from './api/components/PromptTemplates';
import { ContentGenerator } from './api/components/ContentGenerator';
import { Studio } from './api/components/Studio';
import { RenderQueue } from './api/components/RenderQueue';
import { Connections } from './api/components/Connections';
import { Analytics } from './api/Analytics';
import { SystemStatus } from './api/components/SystemStatus';
import { ProjectRoadmap } from './api/components/ProjectRoadmap';
import { AppGuide } from './api/AppGuide';
import { Finance } from './api/components/Finance';

// --- MOCK DATA ---
const MOCK_PRODUCTS: Product[] = [
    { id: 'veo_3_1', name: 'VEO 3.1 Suite', description: 'Next-gen AI video model.', features: 'Text-to-video, Image-to-video, High-fidelity', affiliateLink: 'https://gemini.google.com/veo', commission: 20, rating: 4.9, conversions: 1500 },
    { id: 'kling_ai', name: 'KlingAI Video Tool', description: 'AI video generator with cinematic quality.', features: 'Realistic physics, Dynamic scenes, 1080p output', affiliateLink: 'https://kling.kuaishou.com', commission: 15, rating: 4.7, conversions: 900 },
];

const MOCK_RENDER_JOBS: RenderJob[] = [
    { id: 1, productName: 'VEO 3.1 Suite', status: 'Completed', progress: 100, createdAt: new Date(Date.now() - 15 * 60000).toISOString(), models: ['VEO 3.1', 'Gemini TTS'], videoUrl: '#', aspectRatio: '9:16', resolution: '1080p', audioData: '' },
    { id: 2, productName: 'KlingAI Video Tool', status: 'Rendering', progress: 65, createdAt: new Date().toISOString(), models: ['VEO 3.1 HQ', 'Gemini TTS'], operationName: 'op-12345', aspectRatio: '16:9', resolution: '720p', audioData: '' },
];
// --- END MOCK DATA ---

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = React.useState<Page>(Page.DASHBOARD);
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);

    // --- Application State ---
    const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
    const [generatedContent, setGeneratedContent] = React.useState<Record<string, GeneratedContent>>({});
    const [publishedProducts, setPublishedProducts] = React.useState<string[]>(['veo_3_1']);
    const [renderJobs, setRenderJobs] = React.useState<RenderJob[]>(MOCK_RENDER_JOBS);
    const [pendingProducts, setPendingProducts] = React.useState<ScoutedProduct[]>([]);
    const [productToAutoGenerate, setProductToAutoGenerate] = React.useState<string | null>(null);
    const [automationSettings, setAutomationSettings] = React.useState<AutomationSettings>({
        masterEnabled: true,
        scoutAgent: { enabled: true, frequencyMinutes: 60, defaultTopic: 'AI tools' },
        autoApproveThreshold: 75,
    });

    // --- State-derived data ---
    const productsWithContent: ProductWithContent[] = React.useMemo(() => products.map(p => ({
        ...p,
        content: generatedContent[p.id] || {},
        ...(publishedProducts.includes(p.id) && { 
            financials: { productionCost: Math.random() * 10 + 5, affiliateRevenue: Math.random() * 100 + 20, publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString() },
            performance: [{ platform: 'YouTube', views: Math.floor(Math.random() * 100000), likes: Math.floor(Math.random() * 5000), shares: Math.floor(Math.random() * 1000) }]
        })
    })), [products, generatedContent, publishedProducts]);

    // --- Mouse tracking for Starfield ---
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    React.useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            setMousePosition({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // --- Hash-based routing ---
    React.useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            const page = slugToPage(hash) || Page.DASHBOARD;
            setCurrentPage(page);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Set initial page
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // --- State update callbacks ---
    const handleContentUpdate = (productId: string, newContent: Partial<GeneratedContent>) => {
        setGeneratedContent(prev => ({
            ...prev,
            [productId]: { ...prev[productId], ...newContent }
        }));
    };
    
    const handleApproveAndGenerate = (product: Product) => {
        if (!products.some(p => p.id === product.id)) {
            setProducts(prev => [...prev, product]);
        }
        setProductToAutoGenerate(product.id);
    };

    const handleAddRenderJob = (job: Omit<RenderJob, 'id'>) => {
        setRenderJobs(prev => [...prev, { ...job, id: Date.now() }]);
    };
    
    const handlePublishProduct = async (productId: string) => {
        await new Promise(res => setTimeout(res, 500)); // simulate API call
        setPublishedProducts(prev => [...new Set([...prev, productId])]);
    };

    // --- Page Renderer ---
    const renderCurrentPage = () => {
        switch (currentPage) {
            case Page.DASHBOARD:
                return <Dashboard productsWithContent={productsWithContent} renderJobs={renderJobs} />;
            case Page.AUTOMATION:
                return <Automation settings={automationSettings} onSettingsChange={setAutomationSettings} />;
            case Page.PRODUCT_SCOUT:
                return <ProductScout onApproveAndGenerate={handleApproveAndGenerate} pendingProducts={pendingProducts} setPendingProducts={setPendingProducts} />;
            case Page.PROMPT_TEMPLATES:
                return <PromptTemplates />;
            case Page.CONTENT_GENERATOR:
                return <ContentGenerator products={products} generatedContent={generatedContent} onContentUpdate={handleContentUpdate} productToAutoGenerate={productToAutoGenerate} onGenerationComplete={() => setProductToAutoGenerate(null)} />;
            case Page.STUDIO:
                return <Studio productsWithContent={productsWithContent} onAddRenderJob={handleAddRenderJob} onPublishProduct={handlePublishProduct} />;
            case Page.RENDER_QUEUE:
                return <RenderQueue jobs={renderJobs} setJobs={setRenderJobs} />;
            case Page.CONNECTIONS:
                return <Connections />;
            case Page.ANALYTICS:
                return <Analytics productsWithContent={productsWithContent} />;
            case Page.FINANCE:
                return <Finance productsWithContent={productsWithContent} />;
            case Page.SYSTEM_STATUS:
                return <SystemStatus />;
            case Page.PROJECT_ROADMAP:
                return <ProjectRoadmap />;
            case Page.APP_GUIDE:
                return <AppGuide />;
            default:
                return <Dashboard productsWithContent={productsWithContent} renderJobs={renderJobs} />;
        }
    };

    return (
        <>
            <Starfield mouseX={mousePosition.x} mouseY={mousePosition.y} />
            <ToastContainer />
            <div className="relative h-screen flex overflow-hidden">
                <Sidebar currentPage={currentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
                <div className="flex flex-col w-0 flex-1 overflow-hidden">
                    <Header toggleSidebar={() => setSidebarOpen(true)} />
                    <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-950/50">
                        <div className="py-6 px-4 sm:px-6 lg:px-8">
                            {renderCurrentPage()}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default App;
