
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Finance } from './components/Finance';
import { Footer } from './components/common/Footer';
import { RenderQueue } from './components/RenderQueue';
import { AppGuide } from './components/AppGuide';
import { SystemStatus } from './components/SystemStatus';
import { ProjectRoadmap } from './components/ProjectRoadmap';
import { Starfield } from './components/common/Starfield';
import { ToastContainer } from './components/ToastContainer';
import type { Product, GeneratedContent, RenderJob, ScoutedProduct, AutomationSettings, ProductWithContent, ProductFinancials, PlatformPerformance } from './types';
import { Page } from './types';
import { scoutForProducts } from './services/geminiService';
import { logger } from './services/loggingService';
import { pageToSlug, slugToPage } from './utils/navigation';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const TWO_HOURS = 2 * 60 * 60 * 1000;

const App: React.FC = () => {
    const getPageFromHash = useCallback((): Page => {
        const hash = window.location.hash.substring(2); // Remove '#/'
        return slugToPage(hash) || Page.DASHBOARD;
    }, []);

    const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash());
    const [products, setProducts] = useState<Product[]>([]);
    const [generatedContent, setGeneratedContent] = useState<Record<string, GeneratedContent>>({});
    const [financials, setFinancials] = useState<Record<string, ProductFinancials>>({});
    const [performanceData, setPerformanceData] = useState<Record<string, PlatformPerformance[]>>({});
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
    const [productToAutoGenerate, setProductToAutoGenerate] = useState<string | null>(null);
    const [pendingProducts, setPendingProducts] = useState<ScoutedProduct[]>([]);
    const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
        masterEnabled: false,
        scoutAgent: {
            enabled: true,
            frequencyMinutes: 240, // 4 hours
            defaultTopic: 'AI video tools'
        },
        autoApproveThreshold: 80,
    });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const lastScoutRun = useRef<number>(0);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPage(getPageFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [getPageFromHash]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    
    const navigateTo = useCallback((page: Page) => {
        const currentHash = window.location.hash.substring(2);
        const newSlug = pageToSlug(page);
        if (currentHash !== newSlug) {
            window.location.hash = `/${newSlug}`;
        } else {
            setCurrentPage(page);
        }
    }, []);

    const addProduct = useCallback((newProduct: Product) => {
        setProducts(prev => {
            if (prev.find(p => p.id === newProduct.id)) {
                return prev;
            }
            logger.info(`Product "${newProduct.name}" added to content pipeline.`);
            return [...prev, newProduct];
        });
    }, []);

    const handleApproveAndGenerate = useCallback((product: Product) => {
        addProduct(product);
        setProductToAutoGenerate(product.id);
        navigateTo(Page.CONTENT_GENERATOR);
        logger.info(`Product "${product.name}" approved for content generation.`);
    }, [addProduct, navigateTo]);

    // Central Automation Engine
    useEffect(() => {
        if (!automationSettings.masterEnabled) {
            return;
        }
    
        const automationInterval = setInterval(async () => {
            const now = Date.now();
            
            // 1. Scout Agent Logic
            if (automationSettings.scoutAgent.enabled) {
                const frequencyMs = automationSettings.scoutAgent.frequencyMinutes * 60 * 1000;
                if (now - lastScoutRun.current > frequencyMs) {
                    lastScoutRun.current = now;
                    logger.info("Automation: Scout Agent starting its run.", { topic: automationSettings.scoutAgent.defaultTopic });
                    const newProducts = await scoutForProducts(automationSettings.scoutAgent.defaultTopic);
                    const scoutedProducts: ScoutedProduct[] = newProducts.map(p => ({
                        ...p,
                        status: 'pending',
                        foundAt: Date.now()
                    }));
                    setPendingProducts(prev => [...prev, ...scoutedProducts]);
                    logger.info(`Automation: Scout Agent found ${scoutedProducts.length} new products.`);
                }
            }
    
            // 2. Product Auto-Processing Logic - Refactored for clarity and correctness
            const productToAutoProduce = pendingProducts.find(p => 
                p.status === 'pending' && (
                    (p.opportunityScore && p.opportunityScore >= automationSettings.autoApproveThreshold) ||
                    (now - p.foundAt >= TWO_HOURS)
                )
            );
    
            if (productToAutoProduce) {
                logger.warn(`Automation: Product "${productToAutoProduce.name}" is being auto-approved.`);
                // Remove it from pending and process it
                setPendingProducts(prev => prev.filter(p => p.id !== productToAutoProduce.id));
                handleApproveAndGenerate(productToAutoProduce);
                addRenderJob({
                    productName: productToAutoProduce.name,
                    status: 'Queued',
                    progress: 0,
                    createdAt: new Date().toISOString(),
                    models: ['VEO 3.1', 'Suno']
                });
            } else {
                // No product to produce, check for skipping inactive ones
                let hasSkipped = false;
                const updatedProducts: ScoutedProduct[] = pendingProducts.map((p): ScoutedProduct => {
                    if (p.status === 'pending' && (now - p.foundAt >= FIFTEEN_MINUTES)) {
                        hasSkipped = true;
                        logger.info(`Automation: Product "${p.name}" was skipped due to inactivity.`);
                        return { ...p, status: 'skipped' };
                    }
                    return p;
                });
                if (hasSkipped) {
                    setPendingProducts(updatedProducts);
                }
            }
    
        }, 60000); // Check every minute
    
        return () => clearInterval(automationInterval);
    
    }, [automationSettings, pendingProducts, handleApproveAndGenerate]);


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
        navigateTo(Page.RENDER_QUEUE);
        logger.info(`New video render job queued for "${newJob.productName}".`);
    }, [navigateTo]);

    const handlePublishProduct = useCallback(async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Simulate financial data
        const productionCost = Math.random() * 5 + 1; // $1 - $6
        const affiliateRevenue = (product.commission || 0) * (product.conversions || 0) * 0.01 * (Math.random() * 0.5 + 0.5); // Simulate some variance

        const newFinancials: ProductFinancials = {
            productionCost: parseFloat(productionCost.toFixed(2)),
            affiliateRevenue: parseFloat(affiliateRevenue.toFixed(2)),
            publishedAt: new Date().toISOString(),
        };

        setFinancials(prev => ({ ...prev, [productId]: newFinancials }));
        logger.info(`Product "${product.name}" published. Financials recorded.`, newFinancials);

        // Simulate performance data collection after a short delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newPerformance: PlatformPerformance[] = [
            { platform: "YouTube", views: Math.floor(Math.random() * 500000) + 1000, likes: Math.floor(Math.random() * 25000) + 50, shares: Math.floor(Math.random() * 5000) + 10 },
            { platform: "TikTok", views: Math.floor(Math.random() * 1000000) + 2000, likes: Math.floor(Math.random() * 100000) + 100, shares: Math.floor(Math.random() * 10000) + 20 },
            { platform: "Instagram", views: Math.floor(Math.random() * 200000) + 500, likes: Math.floor(Math.random() * 15000) + 25, shares: Math.floor(Math.random() * 2000) + 5 },
        ];
        setPerformanceData(prev => ({ ...prev, [productId]: newPerformance }));
        logger.info(`Performance data for "${product.name}" recorded.`, { performance: newPerformance });
    }, [products]);

    const productsWithContent: ProductWithContent[] = useMemo(() => {
        return products.map(p => ({
            ...p,
            content: generatedContent[p.id] || {},
            financials: financials[p.id],
            performance: performanceData[p.id]
        }));
    }, [products, generatedContent, financials, performanceData]);

    const renderPage = () => {
        switch (currentPage) {
            case Page.DASHBOARD:
                return <Dashboard productsWithContent={productsWithContent} renderJobs={renderJobs} />;
            case Page.AUTOMATION:
                return <Automation settings={automationSettings} onSettingsChange={setAutomationSettings} />;
            case Page.PRODUCT_SCOUT:
                return <ProductScout 
                         onApproveAndGenerate={handleApproveAndGenerate}
                         pendingProducts={pendingProducts}
                         setPendingProducts={setPendingProducts}
                       />;
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
                return <Publisher productsWithContent={productsWithContent} onAddRenderJob={addRenderJob} onPublishProduct={handlePublishProduct} />;
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
    
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5
    };


    return (
        <div className="flex h-screen bg-transparent text-gray-100">
            <ToastContainer />
            <Starfield mouseX={mousePosition.x} mouseY={mousePosition.y} />
            <Sidebar currentPage={currentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;
