
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformLogo } from './PlatformLogo';
import { useI18n } from '../hooks/useI18n';
import { Button } from './common/Button';
import { ExternalLink, KeyRound, Save, X, Info, FileText } from './LucideIcons';
import { logger } from '../services/loggingService';

type ConnectionStatus = 'Connected' | 'Refreshing' | 'Disconnected';

interface Platform {
    id: string;
    nameKey: string;
    docsUrl: string;
    neonColor: string;
    category: 'social' | 'affiliate_global' | 'affiliate_vn';
}

interface Connection extends Platform {
    status: ConnectionStatus;
    apiKey?: string;
}

const platforms: Platform[] = [
    // Social Media
    { id: "youtube", nameKey: "connections.youtube", docsUrl: 'https://console.cloud.google.com/apis/credentials', neonColor: '#FF0000', category: 'social' },
    { id: "tiktok", nameKey: "connections.tiktok", docsUrl: 'https://developers.tiktok.com/doc/login-kit-web/', neonColor: '#25F4EE', category: 'social' },
    { id: "facebook", nameKey: "connections.facebook", docsUrl: 'https://developers.facebook.com/docs/graph-api/get-started', neonColor: '#1877F2', category: 'social' },
    { id: "instagram", nameKey: "connections.instagram", docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started', neonColor: '#d6249f', category: 'social' },
    { id: "x", nameKey: "connections.x", docsUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0', neonColor: '#FFFFFF', category: 'social' },
    { id: "pinterest", nameKey: "connections.pinterest", docsUrl: 'https://developers.pinterest.com/docs/getting-started/authentication/', neonColor: '#E60023', category: 'social' },
    { id: "telegram", nameKey: "connections.telegram", docsUrl: 'https://core.telegram.org/bots#6-botfather', neonColor: '#2AABEE', category: 'social' },
    
    // Affiliate Global
    { id: "clickbank", nameKey: "connections.clickbank", docsUrl: 'https://support.clickbank.com/hc/en-us/articles/115015505708', neonColor: '#F7941D', category: 'affiliate_global' },
    { id: "amazon", nameKey: "connections.amazon", docsUrl: 'https://affiliate-program.amazon.com/help/topic/t100', neonColor: '#FF9900', category: 'affiliate_global' },
    { id: "shopify", nameKey: "connections.shopify", docsUrl: 'https://shopify.dev/docs/apps/auth/oauth/getting-started', neonColor: '#7AB55C', category: 'affiliate_global' },
    { id: "impact", nameKey: "connections.impact", docsUrl: 'https://developer.impact.com/impact-api-started-guide/', neonColor: '#F05D38', category: 'affiliate_global' },
    { id: "partnerstack", nameKey: "connections.partnerstack", docsUrl: 'https://developers.partnerstack.com/reference/introduction', neonColor: '#4B40EE', category: 'affiliate_global' },
    { id: "digistore24", nameKey: "connections.digistore24", docsUrl: 'https://dev.digistore24.com/', neonColor: '#007BFF', category: 'affiliate_global' },
    
    // Affiliate VN
    { id: "lazada", nameKey: "connections.lazada", docsUrl: 'https://open.lazada.com/doc/doc.htm?spm=a2o9m.11193494.0.0.1f733535j2q0zP&source=search&docId=108298&treeId=1', neonColor: '#0F146D', category: 'affiliate_vn' },
    { id: "shopee", nameKey: "connections.shopee", docsUrl: 'https://open.shopee.com/documents/v2/v2.1/introduction?module=83&type=2', neonColor: '#EE4D2D', category: 'affiliate_vn' },
    { id: "tiki", nameKey: "connections.tiki", docsUrl: 'https://open.tiki.vn/', neonColor: '#1A94FF', category: 'affiliate_vn' },
];

const NebulaBackground = () => (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="relative w-full h-full">
            <div className="particle-container">
                {Array.from({ length: 100 }).map((_, i) => <div key={i} className="particle"></div>)}
            </div>
        </div>
        <style>{`
            .particle-container {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .particle {
                position: absolute;
                border-radius: 50%;
                background: rgba(200, 220, 255, 0.5);
                animation: float 20s infinite ease-in-out;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-100vh) translateX(calc(100vw * (var(--x-end) - 0.5))); }
            }
            .particle:nth-child(n) {
                width: calc(1px + (var(--size) * 2px));
                height: calc(1px + (var(--size) * 2px));
                top: calc(100% * var(--y-start));
                left: calc(100% * var(--x-start));
                animation-duration: calc(15s + (var(--duration) * 10s));
                animation-delay: calc(var(--delay) * -20s);
                --size: ${Math.random()};
                --y-start: ${Math.random()};
                --x-start: ${Math.random()};
                --x-end: ${Math.random()};
                --duration: ${Math.random()};
                --delay: ${Math.random()};
            }
        `}</style>
    </div>
);


const StatusLED: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const variants = {
        Connected: { background: '#22c55e', scale: [1, 1.2, 1], opacity: [1, 0.7, 1], transition: { duration: 1.5, repeat: Infinity } },
        Refreshing: { background: '#f59e0b', opacity: [0.3, 1, 0.3], transition: { duration: 1, repeat: Infinity } },
        Disconnected: { background: '#ef4444', scale: 1, opacity: 1 },
    };
    return <motion.div className="w-3 h-3 rounded-full border-2 border-gray-900 absolute bottom-2 right-2" animate={variants[status]} />;
};


const PlatformCard: React.FC<{ connection: Connection; onClick: () => void }> = ({ connection, onClick }) => {
    const { t } = useI18n();
    return (
        <motion.button
            onClick={onClick}
            className="relative flex flex-col items-center justify-center w-1/2 mx-auto aspect-square rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            style={{ 
                background: 'radial-gradient(circle, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                transformStyle: 'preserve-3d',
                transform: 'perspective(1000px)'
            }}
            whileHover={{ 
                y: -6, 
                rotateY: 10,
                boxShadow: `0 25px 50px -12px ${connection.neonColor}40`,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
            }}
        >
            <div className="p-2">
                <PlatformLogo platformId={connection.id} className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <p className="font-semibold text-gray-200 mt-1 text-center text-xs sm:text-sm">{t(connection.nameKey)}</p>
            <StatusLED status={connection.status} />
        </motion.button>
    );
};

const ConnectionModal: React.FC<{ connection: Connection, onClose: () => void; onSave: (updatedConnection: Connection) => void }> = ({ connection, onClose, onSave }) => {
    const { t } = useI18n();
    const [apiKey, setApiKey] = useState(connection.apiKey || '');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus trap for accessibility
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key !== 'Tab' || !modalRef.current) return;
            
            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSave = async () => {
        setIsSaving(true);
        logger.info(`Attempting to save connection for ${connection.nameKey}`);
        
        // MOCK API CALL - Replace with your actual backend call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // const response = await fetch('/api/save-token', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ userId: 'user123', platform: connection.id, token: apiKey })
        // });

        setIsSaving(false);
        // if (response.ok) {
            logger.info(`Connection for ${connection.nameKey} saved successfully.`);
            onSave({ ...connection, apiKey, status: 'Connected' });
        // } else {
        //     logger.error(`Failed to save connection for ${connection.nameKey}`);
        // }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                ref={modalRef}
                className="glass-card w-full max-w-lg rounded-xl shadow-2xl flex flex-col"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <PlatformLogo platformId={connection.id} className="w-8 h-8"/>
                        <h2 id="modal-title" className="text-xl font-bold text-gray-100">{t(connection.nameKey)}</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal"><X className="w-5 h-5"/></Button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-start p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                        <Info className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0 mt-1"/>
                        <p className="text-sm text-primary-200">{t('connections.vercelSetupDescription_V2')}</p>
                    </div>

                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">{t('connections.requiredEnvVars')}</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                            <input
                                id="api-key"
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder="******************"
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                        <div className="relative">
                           <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-500"/>
                             <textarea
                                id="notes"
                                rows={3}
                                placeholder={`e.g., Main production account`}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-b-xl">
                    <a href={connection.docsUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2"/> {t('connections.viewDocs')}
                        </Button>
                    </a>
                    <div className="flex space-x-2">
                         <Button variant="secondary" onClick={onClose}>{t('publisher.cancel')}</Button>
                         <Button onClick={handleSave} isLoading={isSaving} icon={<Save className="w-4 h-4"/>}>
                             {isSaving ? "Connecting..." : "Save & Connect"}
                         </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const Connections: React.FC = () => {
    const { t } = useI18n();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<Connection | null>(null);

    useEffect(() => {
        // Initial state setup
        const initialConnections = platforms.map(p => ({ ...p, status: 'Disconnected' as ConnectionStatus }));
        setConnections(initialConnections);

        // MOCK API POLLING - Replace with your actual status fetching logic (e.g., WebSockets or polling)
        const intervalId = setInterval(() => {
            setConnections(prev => {
                const randomIndex = Math.floor(Math.random() * prev.length);
                const statuses: ConnectionStatus[] = ['Connected', 'Refreshing', 'Disconnected'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                return prev.map((conn, index) => 
                    index === randomIndex ? { ...conn, status: randomStatus } : conn
                );
            });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const handleSaveConnection = useCallback((updatedConnection: Connection) => {
        setConnections(prev => prev.map(c => c.id === updatedConnection.id ? updatedConnection : c));
        setSelectedPlatform(null);
    }, []);
    
    const categories = [
        { key: 'social', titleKey: 'connections.category_social' },
        { key: 'affiliate_global', titleKey: 'connections.category_affiliate_global' },
        { key: 'affiliate_vn', titleKey: 'connections.category_affiliate_vn' },
    ];

    return (
        <div className="relative min-h-full">
            <NebulaBackground />
            <div className="space-y-8 relative z-10">
                <div className="text-center glass-card p-6 rounded-xl">
                    <h1 className="text-3xl font-bold text-gray-100">{t('connections.hubTitle')}</h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{t('connections.hubDescription')}</p>
                </div>
                
                {categories.map(category => (
                    <div key={category.key}>
                        <h2 className="text-xl font-semibold text-gray-200 mb-4 px-2">{t(category.titleKey)}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" style={{ perspective: '1200px' }}>
                            {connections.filter(c => c.category === category.key).map(connection => (
                                <PlatformCard 
                                    key={connection.id} 
                                    connection={connection}
                                    onClick={() => setSelectedPlatform(connection)} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedPlatform && (
                    <ConnectionModal 
                        connection={selectedPlatform} 
                        onClose={() => setSelectedPlatform(null)}
                        onSave={handleSaveConnection}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
