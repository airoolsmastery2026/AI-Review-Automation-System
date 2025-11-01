import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { 
    ExternalLink,
    Server,
} from './LucideIcons';
import { useI18n } from '../hooks/useI18n';
import { PlatformLogo } from './PlatformLogo';
import { logger } from '../services/loggingService';
import type { Connection, ConnectionStatus } from '../types';
import { checkConnections } from '../services/geminiService';
import { Spinner } from './common/Spinner';

interface Platform {
    id: string;
    nameKey: string;
    icon: React.ReactNode;
    docsUrl: string;
    docsKey: string;
    envVars: string[];
}

const platforms: Record<string, Platform> = {
    youtube: { id: "youtube", nameKey: "connections.youtube", icon: <PlatformLogo platformId="youtube" />, docsUrl: 'https://console.cloud.google.com/apis/credentials', docsKey: 'connections.docs_youtube', envVars: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'] },
    tiktok: { id: "tiktok", nameKey: "connections.tiktok", icon: <PlatformLogo platformId="tiktok" />, docsUrl: 'https://developers.tiktok.com/doc/login-kit-web/', docsKey: 'connections.docs_tiktok', envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'] },
    facebook: { id: "facebook", nameKey: "connections.facebook", icon: <PlatformLogo platformId="facebook" />, docsUrl: 'https://developers.facebook.com/docs/graph-api/get-started', docsKey: 'connections.docs_facebook', envVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'] },
    instagram: { id: "instagram", nameKey: "connections.instagram", icon: <PlatformLogo platformId="instagram" />, docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started', docsKey: 'connections.docs_instagram', envVars: ['INSTAGRAM_USER_ACCESS_TOKEN'] },
    telegram: { id: "telegram", nameKey: "connections.telegram", icon: <PlatformLogo platformId="telegram" />, docsUrl: 'https://core.telegram.org/bots#6-botfather', docsKey: 'connections.docs_telegram', envVars: ['TELEGRAM_BOT_TOKEN'] },
    clickbank: { id: "clickbank", nameKey: "connections.clickbank", icon: <PlatformLogo platformId="clickbank" />, docsUrl: 'https://support.clickbank.com/hc/en-us/articles/115015505708', docsKey: 'connections.docs_clickbank', envVars: ['CLICKBANK_API_KEY', 'CLICKBANK_DEVELOPER_KEY'] },
    amazon: { id: "amazon", nameKey: "connections.amazon", icon: <PlatformLogo platformId="amazon" />, docsUrl: 'https://affiliate-program.amazon.com/help/topic/t100', docsKey: 'connections.docs_amazon', envVars: ['AMAZON_ASSOCIATE_TAG', 'AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY'] },
    shopify: { id: "shopify", nameKey: "connections.shopify", icon: <PlatformLogo platformId="shopify" />, docsUrl: 'https://shopify.dev/docs/apps/auth/oauth/getting-started', docsKey: 'connections.docs_shopify', envVars: ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET_KEY', 'SHOPIFY_STORE_URL'] },
    accesstrade: { id: "accesstrade", nameKey: "connections.accesstrade", icon: <PlatformLogo platformId="accesstrade" />, docsUrl: 'https://pub.accesstrade.vn/tools/api_key', docsKey: 'connections.docs_accesstrade', envVars: ['ACCESSTRADE_ACCESS_KEY', 'ACCESSTRADE_SECRET_KEY'] },
    masoffer: { id: "masoffer", nameKey: "connections.masoffer", icon: <PlatformLogo platformId="masoffer" />, docsUrl: 'https://pub.masoffer.com/docs', docsKey: 'connections.docs_masoffer', envVars: ['MASOFFER_API_KEY'] },
    ecomobi: { id: "ecomobi", nameKey: "connections.ecomobi", icon: <PlatformLogo platformId="ecomobi" />, docsUrl: 'https://ecomobi.com/docs/api', docsKey: 'connections.docs_ecomobi', envVars: ['ECOMOBI_API_KEY'] },
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

const StatusIndicator: React.FC<{status: ConnectionStatus}> = ({ status }) => {
    const { t } = useI18n();
    const baseClass = 'w-3 h-3 rounded-full';
    const statusConfig = {
        'Configured': {
            className: 'bg-green-500',
            title: t('connections.status_Configured')
        },
        'Not Configured': {
            className: 'bg-red-500',
            title: t('connections.status_Not Configured')
        }
    }
    const config = statusConfig[status];
    return <div className={`${baseClass} ${config.className}`} title={config.title}></div>
};

const PlatformCard: React.FC<{
    platform: Platform, 
    connectionStatus: ConnectionStatus,
}> = ({ platform, connectionStatus }) => {
    const { t } = useI18n();

    return (
        <div className="relative w-full text-center group flex flex-col items-center justify-center p-4 rounded-lg glass-card">
             <div className="absolute top-2 right-2">
                <StatusIndicator status={connectionStatus} />
            </div>
            {platform.icon}
            <span className="mt-2 font-semibold text-sm text-gray-200">{t(platform.nameKey)}</span>
            <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-gray-500 hover:text-primary-400 transition-colors flex items-center" title={t(platform.docsKey)}>
               {t('connections.viewDocs')} <ExternalLink className="h-3 w-3 ml-1" />
            </a>
        </div>
    );
};

export const Connections: React.FC = () => {
    const { t } = useI18n();
    const [connections, setConnections] = useState<Record<string, Connection>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatuses = async () => {
            setIsLoading(true);
            try {
                const statuses = await checkConnections();
                const connectionData: Record<string, Connection> = {};
                for (const platformId in platforms) {
                    connectionData[platformId] = {
                        id: platformId,
                        nameKey: platforms[platformId].nameKey,
                        status: statuses[platformId]?.status || 'Not Configured',
                    }
                }
                setConnections(connectionData);
            } catch (error) {
                logger.error("Failed to fetch connection statuses.", { error });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatuses();
    }, []);
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="text-center !p-6">
                    <CardTitle className="text-2xl">{t('connections.hubTitle')}</CardTitle>
                    <CardDescription>{t('connections.hubDescription')}</CardDescription>
                </CardHeader>
            </Card>

            <Card className="border-l-4 border-primary-500">
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary-500/10">
                            <Server className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                            <CardTitle>{t('connections.vercelSetupTitle')}</CardTitle>
                            <CardDescription>{t('connections.vercelSetupDescription')}</CardDescription>
                        </div>
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
                            <p className="text-xs text-gray-400">{t('connections.geminiDescription')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-semibold text-green-300">{t('connections.status_Configured')}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            ) : (
                platformCategories.map(category => (
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
                                        connectionStatus={connections[platform.id]?.status || 'Not Configured'}
                                    />
                                );
                            })}
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};