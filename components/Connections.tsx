import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { 
    ExternalLink,
    HardDriveUpload,
    Copy,
    Check,
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
    // Social Media
    youtube: { id: "youtube", nameKey: "connections.youtube", icon: <PlatformLogo platformId="youtube" />, docsUrl: 'https://console.cloud.google.com/apis/credentials', docsKey: 'connections.docs_youtube', envVars: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'] },
    tiktok: { id: "tiktok", nameKey: "connections.tiktok", icon: <PlatformLogo platformId="tiktok" />, docsUrl: 'https://developers.tiktok.com/doc/login-kit-web/', docsKey: 'connections.docs_tiktok', envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'] },
    facebook: { id: "facebook", nameKey: "connections.facebook", icon: <PlatformLogo platformId="facebook" />, docsUrl: 'https://developers.facebook.com/docs/graph-api/get-started', docsKey: 'connections.docs_facebook', envVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'] },
    instagram: { id: "instagram", nameKey: "connections.instagram", icon: <PlatformLogo platformId="instagram" />, docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started', docsKey: 'connections.docs_instagram', envVars: ['INSTAGRAM_USER_ACCESS_TOKEN'] },
    x: { id: "x", nameKey: "connections.x", icon: <PlatformLogo platformId="x" />, docsUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0', docsKey: 'connections.docs_x', envVars: ['X_CLIENT_ID', 'X_CLIENT_SECRET'] },
    pinterest: { id: "pinterest", nameKey: "connections.pinterest", icon: <PlatformLogo platformId="pinterest" />, docsUrl: 'https://developers.pinterest.com/docs/getting-started/authentication/', docsKey: 'connections.docs_pinterest', envVars: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET'] },
    telegram: { id: "telegram", nameKey: "connections.telegram", icon: <PlatformLogo platformId="telegram" />, docsUrl: 'https://core.telegram.org/bots#6-botfather', docsKey: 'connections.docs_telegram', envVars: ['TELEGRAM_BOT_TOKEN'] },
    
    // Affiliate Global
    clickbank: { id: "clickbank", nameKey: "connections.clickbank", icon: <PlatformLogo platformId="clickbank" />, docsUrl: 'https://support.clickbank.com/hc/en-us/articles/115015505708', docsKey: 'connections.docs_clickbank', envVars: ['CLICKBANK_API_KEY', 'CLICKBANK_DEVELOPER_KEY'] },
    amazon: { id: "amazon", nameKey: "connections.amazon", icon: <PlatformLogo platformId="amazon" />, docsUrl: 'https://affiliate-program.amazon.com/help/topic/t100', docsKey: 'connections.docs_amazon', envVars: ['AMAZON_ASSOCIATE_TAG', 'AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY'] },
    shopify: { id: "shopify", nameKey: "connections.shopify", icon: <PlatformLogo platformId="shopify" />, docsUrl: 'https://shopify.dev/docs/apps/auth/oauth/getting-started', docsKey: 'connections.docs_shopify', envVars: ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET_KEY', 'SHOPIFY_STORE_URL'] },
    impact: { id: "impact", nameKey: "connections.impact", icon: <PlatformLogo platformId="impact" />, docsUrl: 'https://developer.impact.com/impact-api-started-guide/', docsKey: 'connections.docs_impact', envVars: ['IMPACT_ACCOUNT_SID', 'IMPACT_AUTH_TOKEN'] },
    partnerstack: { id: "partnerstack", nameKey: "connections.partnerstack", icon: <PlatformLogo platformId="partnerstack" />, docsUrl: 'https://developers.partnerstack.com/reference/introduction', docsKey: 'connections.docs_partnerstack', envVars: ['PARTNERSTACK_PUBLIC_KEY', 'PARTNERSTACK_SECRET_KEY'] },
    
    // Affiliate VN
    lazada: { id: "lazada", nameKey: "connections.lazada", icon: <PlatformLogo platformId="lazada" />, docsUrl: 'https://open.lazada.com/doc/doc.htm?spm=a2o9m.11193494.0.0.1f733535j2q0zP&source=search&docId=108298&treeId=1', docsKey: 'connections.docs_lazada', envVars: ['LAZADA_APP_KEY', 'LAZADA_APP_SECRET'] },
    shopee: { id: "shopee", nameKey: "connections.shopee", icon: <PlatformLogo platformId="shopee" />, docsUrl: 'https://open.shopee.com/documents/v2/v2.1/introduction?module=83&type=2', docsKey: 'connections.docs_shopee', envVars: ['SHOPEE_PARTNER_ID', 'SHOPEE_API_KEY'] },
    tiki: { id: "tiki", nameKey: "connections.tiki", icon: <PlatformLogo platformId="tiki" />, docsUrl: 'https://open.tiki.vn/', docsKey: 'connections.docs_tiki', envVars: ['TIKI_CLIENT_ID', 'TIKI_CLIENT_SECRET'] },
};

const platformCategories = [
    {
        nameKey: 'connections.category_social',
        platforms: ['youtube', 'tiktok', 'x', 'pinterest', 'facebook', 'instagram', 'telegram']
    },
    {
        nameKey: 'connections.category_affiliate_global',
        platforms: ['amazon', 'clickbank', 'shopify', 'impact', 'partnerstack']
    },
    {
        nameKey: 'connections.category_affiliate_vn',
        platforms: ['lazada', 'shopee', 'tiki']
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

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const { t } = useI18n();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-gray-600 text-gray-400 hover:text-gray-100 transition-colors"
            title={t(copied ? 'connections.copied' : 'connections.copy')}
        >
            {copied ? (
                <Check className="h-3 w-3 text-green-400" />
            ) : (
                <Copy className="h-3 w-3" />
            )}
        </button>
    );
};

const PlatformCard: React.FC<{
    platform: Platform,
    connectionStatus: ConnectionStatus,
}> = ({ platform, connectionStatus }) => {
    const { t } = useI18n();
    const isConfigured = connectionStatus === 'Configured';
    const borderColor = isConfigured ? 'border-green-500/40 hover:border-green-500/70' : 'border-gray-700/50 hover:border-primary-500/70';

    const handleCopyAll = () => {
        const text = platform.envVars.map(v => `${v}=`).join('\n');
        navigator.clipboard.writeText(text);
    };

    return (
        <div className={`relative flex flex-col p-4 rounded-lg glass-card h-full border ${borderColor} transition-colors duration-300`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {platform.icon}
                    <span className="font-semibold text-base text-gray-100">{t(platform.nameKey)}</span>
                </div>
                <StatusIndicator status={connectionStatus} />
            </div>
            <div className="mt-4 flex-grow">
                <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">{t('connections.requiredEnvVars')}</p>
                <div className="space-y-1.5">
                    {platform.envVars.map(envVar => (
                        <div key={envVar} className="flex items-center justify-between bg-gray-900/60 rounded-md p-1.5 pl-2">
                            <code className="text-xs text-yellow-300 truncate">{envVar}</code>
                            <CopyButton textToCopy={envVar} />
                        </div>
                    ))}
                </div>
            </div>
             <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between space-x-2">
                 <Button variant="ghost" size="sm" onClick={handleCopyAll} title={t('connections.copyAll')}>
                    <Copy className="h-3 w-3 mr-1.5"/>
                    {t('connections.copyAll')}
                </Button>
                <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center font-semibold" title={t(platform.docsKey)}>
                   {t('connections.viewDocs')} <ExternalLink className="h-4 w-4 ml-1.5" />
                </a>
             </div>
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
                            <HardDriveUpload className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                            <CardTitle>{t('connections.vercelSetupTitle')}</CardTitle>
                            <CardDescription>{t('connections.vercelSetupDescription_V2')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                 <div className="p-4 border-t border-gray-700">
                    <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="secondary" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2"/>
                            {t('connections.vercelSetupLink')}
                        </Button>
                    </a>
                </div>
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