

import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductScout } from './components/ProductScout';
import { ContentGenerator } from './components/ContentGenerator';
import { Publisher } from './components/Publisher';
import { Analytics } from './components/Analytics';
import { Dashboard } from './components/Dashboard';
import { Automation } from './components/Automation';
import { Connections } from './components/Connections';
import { PromptTemplates } from './components/PromptTemplates';
import { Footer } from './components/common/Footer';
import { RenderQueue } from './components/RenderQueue';
import { AppGuide } from './components/AppGuide';
import { LlamaCoderGuide } from './components/LlamaCoderGuide';
import { SystemStatus } from './components/SystemStatus';
import { ProjectRoadmap } from './components/ProjectRoadmap';
import type { Product, GeneratedContent, VideoIdea, RenderJob } from './types';
import { Page } from './types';

const mockIdeas: VideoIdea[] = [
  { id: 1, title: "Top 10 Tech Gadgets of 2023", category: "Tech", status: "Generated" },
  { id: 2, title: "Fitness Equipment Buyers Guide", category: "Health", status: "In Production" },
  { id: 3, title: "Home Office Setup Tips", category: "Lifestyle", status: "Published" },
];

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
    const [products, setProducts] = useState<Product[]>([]);
    const [generatedContent, setGeneratedContent] = useState<Record<string, GeneratedContent>>({});
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>(mockIdeas);
    const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
    const [productToAutoGenerate, setProductToAutoGenerate] = useState<string | null>(null);

    const addProduct = useCallback((newProduct: Product) => {
        setProducts(prev => {
            if (prev.find(p => p.id === newProduct.id)) {
                return prev;
            }
            return [...prev, newProduct];
        });
    }, []);

    const handleApproveAndGenerate = useCallback((product: Product) => {
        addProduct(product);
        setProductToAutoGenerate(product.id);
        setCurrentPage(Page.CONTENT_GENERATOR);
    }, [addProduct]);

    const updateGeneratedContent = useCallback((productId: string, newContent: Partial<GeneratedContent>) => {
        setGeneratedContent(prev => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                ...newContent
            }
        }));
    }, []);
    
    const addRenderJob = useCallback((newJob: Omit<RenderJob, 'id'>) => {
        setRenderJobs(prev => [{ ...newJob, id: Date.now() }, ...prev]);
        setCurrentPage(Page.RENDER_QUEUE);
    }, []);

    const productsWithContent = useMemo(() => {
        return products.map(p => ({
            ...p,
            content: generatedContent[p.id] || {}
        }));
    }, [products, generatedContent]);

    const renderPage = () => {
        switch (currentPage) {
            case Page.DASHBOARD:
                return <Dashboard videoIdeas={videoIdeas} renderJobs={renderJobs} />;
            case Page.AUTOMATION:
                return <Automation videoIdeas={videoIdeas} setVideoIdeas={setVideoIdeas} />;
            case Page.PRODUCT_SCOUT:
                return <ProductScout onApproveAndGenerate={handleApproveAndGenerate} onAddRenderJob={addRenderJob} />;
            case Page.PROMPT_TEMPLATES:
                return <PromptTemplates />;
            case Page.CONTENT_GENERATOR:
                return <ContentGenerator
                          products={products}
                          generatedContent={generatedContent}
                          onContentUpdate={updateGeneratedContent}
                          productToAutoGenerate={productToAutoGenerate}
                          onGenerationComplete={() => setProductToAutoGenerate(null)}
                        />;
            case Page.PUBLISHER:
                return <Publisher productsWithContent={productsWithContent} onAddRenderJob={addRenderJob} />;
            case Page.RENDER_QUEUE:
                return <RenderQueue jobs={renderJobs} setJobs={setRenderJobs} />;
            case Page.CONNECTIONS:
                return <Connections />;
            case Page.ANALYTICS:
                return <Analytics />;
            case Page.SYSTEM_STATUS:
                return <SystemStatus />;
            case Page.PROJECT_ROADMAP:
                return <ProjectRoadmap />;
            case Page.APP_GUIDE:
                return <AppGuide />;
            case Page.LLAMA_CODER_GUIDE:
                return <LlamaCoderGuide />;
            default:
                return <Dashboard videoIdeas={videoIdeas} renderJobs={renderJobs} />;
        }
    };

    return (
        <div className="flex h-screen bg-transparent text-gray-100">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;