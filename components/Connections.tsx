import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { 
    ExternalLink, 
    Save,
    Trash,
    HardDriveDownload,
    HardDriveUpload,
    X as XIcon,
    AlertTriangle,
    CheckCircle
} from './LucideIcons';
import { useI18n } from '../hooks/useI18n';
import { PlatformLogo } from './PlatformLogo';
import { logger } from '../services/loggingService';
// Fix: Import Connection and ConnectionStatus from the central types file.
import type { Connection, ConnectionStatus } from '../types';

interface Platform {
    id: string;
    nameKey: string;
    icon: React.ReactNode;
    fields: { name: string, type: 'text' | 'password', placeholder?: string }[];
    docsUrl: string;
    docsKey: string;
}

const platforms: Record<string, Platform> = {
    youtube: { id: "youtube", nameKey: "connections.youtube", icon: <PlatformLogo platformId="youtube" />, fields: [{name: 'CLIENT_ID', type: 'text'}, {name: 'CLIENT_SECRET', type: 'password'}], docsUrl: 'https://console.cloud.google.com/apis/credentials', docsKey: 'connections.docs_youtube' },
    tiktok: { id: "tiktok", nameKey: "connections.tiktok", icon: <PlatformLogo platformId="tiktok" />, fields: [{name: 'CLIENT_KEY', type: 'text'}, {name: 'CLIENT_SECRET', type: 'password'}], docsUrl: 'https://developers.tiktok.com/doc/login-kit-web/', docsKey: 'connections.docs_tiktok' },
    facebook: { id: "facebook", nameKey: "connections.facebook", icon: <PlatformLogo platformId="facebook" />, fields: [{name: 'APP_ID', type: 'text'}, {name: 'APP_SECRET', type: 'password'}], docsUrl: 'https://developers.facebook.com/docs/graph-api/get-started', docsKey: 'connections.docs_facebook' },
    instagram: { id: "instagram", nameKey: "connections.instagram", icon: <PlatformLogo platformId="instagram" />, fields: [{name: 'USER_ACCESS_TOKEN', type: 'password'}], docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started', docsKey: 'connections.docs_instagram' },
    telegram: { id: "telegram", nameKey: "connections.telegram", icon: <PlatformLogo platformId="telegram" />, fields: [{name: 'BOT_TOKEN', type: 'password', placeholder: 'Get from BotFather'}], docsUrl: 'https://core.telegram.org/bots#6-botfather', docsKey: 'connections.docs_telegram' },
    clickbank: { id: "clickbank", nameKey: "connections.clickbank", icon: <PlatformLogo platformId="clickbank" />, fields: [{name: 'API_KEY', type: 'password'}, {name: 'DEVELOPER_KEY', type: 'password'}], docsUrl: 'https://support.clickbank.com/hc/en-us/articles/115015505708', docsKey: 'connections.docs_clickbank' },
    amazon: { id: "amazon", nameKey: "connections.amazon", icon: <PlatformLogo platformId="amazon" />, fields: [{name: 'ASSOCIATE_TAG', type: 'text'}, {name: 'ACCESS_KEY', type: 'text'}, {name: 'SECRET_KEY', type: 'password'}], docsUrl: 'https://affiliate-program.amazon.com/help/topic/t100', docsKey: 'connections.docs_amazon' },
    shopify: { id: "shopify", nameKey: "connections.shopify", icon: <PlatformLogo platformId="shopify" />, fields: [{name: 'API_KEY', type: 'password'}, {name: 'API_SECRET_KEY', type: 'password'}, { name: 'STORE_URL', type: 'text', placeholder: 'your-store.myshopify.com' }], docsUrl: 'https://shopify.dev/docs/apps/auth/oauth/getting-started', docsKey: 'connections.docs_shopify' },
    accesstrade: { id: "accesstrade", nameKey: "connections.accesstrade", icon: <PlatformLogo platformId="accesstrade" />, fields: [{name: 'ACCESS_KEY', type: 'text'}, {name: 'SECRET_KEY', type: 'password'}], docsUrl: 'https://pub.accesstrade.vn/tools/api_key', docsKey: 'connections.docs_accesstrade' },
    masoffer: { id: "masoffer", nameKey: "connections.masoffer", icon: <PlatformLogo platformId="masoffer" />, fields: [{name: 'API_KEY', type: 'password'}], docsUrl: 'https://pub.masoffer.com/docs', docsKey: 'connections.docs_masoffer' },
    ecomobi: { id: "ecomobi", nameKey: "connections.ecomobi", icon: <PlatformLogo platformId="ecomobi" />, fields: [{name: 'API_KEY', type: 'password'}], docsUrl: 'https://ecomobi.com/docs/api', docsKey: 'connections.docs_ecomobi' },
};

const platformCategories = [
    {
        nameKey: 'connections.category_social',
        platforms: ['youtube', 'tiktok', 'facebook', 'instagram', 'telegram']
    },
    {
        nameKey: 'connections.category_affiliate_global',
        platforms: ['amazon', 'clickbank', 'shopify']
    },
    {
        nameKey: 'connections.category_affiliate_vn',
        platforms: ['accesstrade', 'masoffer', 'ecomobi']
    }
];

const STORAGE_KEY = 'universal-connections';

const StatusIndicator: React.FC<{status: ConnectionStatus}> = ({ status }) => {
    const baseClass = 'w-3 h-3 rounded-full';
    switch(status) {
        case 'connected': return <div className={`${baseClass} bg-green-500`}></div>
        case 'refreshing': return <div className={`${baseClass} bg-yellow-500 animate-pulse`}></div>
        case 'disconnected':
        default: return <div className={`${baseClass} bg-red-500`}></div>
    }
};

const ConnectionModal: React.FC<{
    platform: Platform;
    connection: Connection | null;
    onSave: (connectionData: Connection) => Promise<void>;
    onDisconnect: (id: string) => Promise<void>;
    onClose: () => void;
}> = ({ platform, connection, onSave, onDisconnect, onClose }) => {
    const { t } = useI18n();
    const [credentials, setCredentials] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCredentials(connection?.credentials || platform.fields.reduce((acc, f) => ({...acc, [f.name]: ''}), {}));
    }, [connection, platform]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleSave = async () => {
        const isInvalid = platform.fields.some(field => !credentials[field.name]?.trim());
        if (isInvalid) {
            setError(t('connections.allFieldsRequired'));
            return;
        }
        setIsSaving(true);
        try {
            const newConnection = {
                id: platform.id,
                username: `${t(platform.nameKey)} User`,
                status: 'connected' as ConnectionStatus,
                autoMode: true,
                credentials,
            };
            await onSave(newConnection);
            logger.info(`Connection saved for platform: ${platform.id}`);
            onClose();
        } catch (e) {
            logger.error(`Failed to save connection for ${platform.id}`, { error: e });
            setError('Failed to save connection.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDisconnectClick = async () => {
        setIsDisconnecting(true);
        try {
            await onDisconnect(platform.id);
        } catch(e) {
            logger.error(`Failed to disconnect from ${platform.id}`, { error: e });
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleInputChange = (fieldName: string, value: string) => {
        if (error) {
            setError(null);
        }
        setCredentials(prev => ({ ...prev, [fieldName]: value }));
    };

    const isConnected = connection?.status === 'connected' || connection?.status === 'refreshing';
    
    return (
        <div ref={modalRef} className="glass-card w-full max-w-md rounded-lg shadow-2xl p-4 space-y-4">
             <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-base text-gray-100">{t(platform.nameKey)}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                        <StatusIndicator status={connection?.status || 'disconnected'} />
                        <span className="text-xs text-gray-400">{t(`connections.status_${connection?.status || 'disconnected'}`)}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                     <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition-colors" title={t(platform.docsKey)}>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {!isConnected && (
                 <div className="bg-yellow-900/40 border border-yellow-500/30 p-3 rounded-lg">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-3 text-yellow-400" />
                        <h3 className="text-sm font-semibold text-yellow-300">{t('connections.securityWarningTitle')}</h3>
                    </div>
                    <p className="text-xs text-yellow-400/80 mt-1">
                        {t('connections.securityWarningContent')}
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-900/40 border border-red-500/30 p-3 rounded-lg text-center text-sm text-red-300">
                    {error}
                </div>
            )}
            
            {!isConnected && platform.fields.map(field => (
                <div key={field.name}>
                    <label className="text-xs text-gray-400 block font-mono mb-1">{field.name}</label>
                    <input 
                        type={field.type}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-2 py-1.5 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                        value={credentials[field.name] || ''}
                        placeholder={field.placeholder || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                </div>
            ))}

            <div className="flex justify-end space-x-2 pt-2">
                {isConnected ? (
                     <Button size="sm" variant="secondary" onClick={handleDisconnectClick} isLoading={isDisconnecting} icon={<Trash className="h-3 w-3" />}>{t('connections.disconnect')}</Button>
                ) : (
                    <>
                        <Button size="sm" variant="ghost" onClick={onClose}>{t('connections.cancel')}</Button>
                        <Button size="sm" onClick={handleSave} isLoading={isSaving} icon={<Save className="h-3 w-3"/>}>{t('connections.saveAndConnect')}</Button>
                    </>
                )}
            </div>
        </div>
    )
}

const PlatformCard: React.FC<{
    platform: Platform, 
    connection: Connection | null,
    onClick: () => void;
}> = ({ platform, connection, onClick }) => {
    const { t } = useI18n();

    return (
        <button 
            onClick={onClick}
            className="relative w-full text-center group flex flex-col items-center justify-center p-4 rounded-lg glass-card transition-all duration-300 transform hover:-translate-y-1 hover:border-primary-500/50"
        >
             <div className="absolute top-2 right-2" title={t(`connections.status_${connection?.status || 'disconnected'}`)}>
                <StatusIndicator status={connection?.status || 'disconnected'} />
            </div>
            {platform.icon}
            <span className="mt-2 font-semibold text-sm text-gray-200">{t(platform.nameKey)}</span>
        </button>
    );
};

export const Connections: React.FC = () => {
    const { t } = useI18n();
    const [connections, setConnections] = useState<Record<string, Connection>>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                logger.info("Connections loaded from localStorage.");
                return parsed;
            }
            return {};
        } catch (e) {
            logger.error("Failed to load connections from localStorage on init.", { error: e });
            return {};
        }
    });
    const [activePlatformId, setActivePlatformId] = useState<string | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulate token refresh for connected services
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        Object.values(connections).forEach((conn: Connection) => {
            if (conn.status === 'connected') {
                const timer = setTimeout(() => {
                    logger.info(`Simulating token refresh for ${conn.id}.`);
                    setConnections(prev => ({...prev, [conn.id]: { ...conn, status: 'refreshing' }}));
                    const secondTimer = setTimeout(() => {
                         logger.info(`Token for ${conn.id} successfully refreshed.`);
                         const currentConnections = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                         currentConnections[conn.id] = { ...conn, status: 'connected' };
                         localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConnections));
                         setConnections(prev => ({...prev, [conn.id]: { ...conn, status: 'connected' }}));
                    }, 3000);
                    timers.push(secondTimer);
                }, Math.random() * (50000 - 30000) + 30000); // Refresh randomly between 30-50s
                timers.push(timer);
            }
        });
        return () => timers.forEach(clearTimeout);
    }, [connections]);
    
    const saveConnections = (newConnections: Record<string, Connection>) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConnections));
            setConnections(newConnections);
            logger.info("Connections state saved to localStorage.");
        } catch (e) {
            logger.error("Failed to save connections to localStorage.", { error: e });
        }
    };

    const handleSave = async (connData: Connection) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        saveConnections({ ...connections, [connData.id]: connData });
    };
    
    const handleDisconnect = async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const {[id]: _, ...rest} = connections;
        saveConnections(rest);
        setActivePlatformId(null);
        logger.info(`Disconnected from platform: ${id}`);
    };

    const handleBackup = () => {
        try {
            const dataStr = JSON.stringify(connections, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', `connections_backup_${new Date().toISOString().replace(/:/g, '-')}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            logger.info("Connections backed up to JSON file.");
        } catch (err) {
            logger.error("Failed to backup connections.", { error: err });
        }
    };
    
    const handleRestoreClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsRestoring(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (typeof e.target?.result === 'string') {
                    const restoredConnections = JSON.parse(e.target.result) as Record<string, Connection>;
                    saveConnections(restoredConnections);
                    logger.info("Connections successfully restored from file.");
                }
            } catch (err) { 
                logger.error("Failed to restore connections from file.", { error: err });
            } finally {
                setIsRestoring(false);
            }
        };
        reader.onerror = () => {
            logger.error("Error reading restore file.");
            setIsRestoring(false);
        }
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };
    
    const activePlatform = activePlatformId ? platforms[activePlatformId] : null;

    return (
        <>
            <div className="space-y-8">
                <Card>
                    <CardHeader className="text-center !p-6">
                        <CardTitle className="text-2xl">{t('connections.hubTitle')}</CardTitle>
                        <CardDescription>{t('connections.hubDescription')}</CardDescription>
                        <div className="flex justify-center space-x-2 mt-4">
                            <Button variant="secondary" onClick={handleBackup} icon={<HardDriveDownload className="h-4 w-4"/>} title={t('connections.backupTooltip')}>{t('connections.backup')}</Button>
                            <Button variant="secondary" onClick={handleRestoreClick} isLoading={isRestoring} icon={<HardDriveUpload className="h-4 w-4"/>} title={t('connections.restoreTooltip')}>{t('connections.restore')}</Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                        </div>
                    </CardHeader>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('connections.category_ai')}</CardTitle>
                    </CardHeader>
                    <div className="p-4">
                        <div className="glass-card p-4 rounded-lg flex items-center">
                            <PlatformLogo platformId="gemini" className="w-10 h-10" />
                            <div className="ml-4 flex-1">
                                <h3 className="font-bold text-gray-100">{t('connections.gemini')}</h3>
                                <p className="text-xs text-gray-400">Connection is managed by the backend server for enhanced security.</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm font-semibold text-green-300">Connected</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {platformCategories.map(category => (
                    <Card key={category.nameKey}>
                        <CardHeader>
                            <CardTitle>{t(category.nameKey)}</CardTitle>
                        </CardHeader>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {category.platforms.map(platformId => {
                                const platform = platforms[platformId];
                                if (!platform) return null;
                                return (
                                    <PlatformCard
                                        key={platform.id}
                                        platform={platform}
                                        connection={connections[platform.id] || null}
                                        onClick={() => setActivePlatformId(platform.id)}
                                    />
                                );

                            })}
                        </div>
                    </Card>
                ))}
            </div>

            {activePlatform && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setActivePlatformId(null)}
                >
                    <div onClick={e => e.stopPropagation()}>
                        <ConnectionModal 
                            platform={activePlatform}
                            connection={connections[activePlatform.id] || null}
                            onSave={handleSave}
                            onDisconnect={handleDisconnect}
                            onClose={() => setActivePlatformId(null)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
