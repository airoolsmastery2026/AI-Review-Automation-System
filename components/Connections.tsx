

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformLogo } from './PlatformLogo';
import { useI18n } from '../hooks/useI18n';
import { Button } from './common/Button';
import { ExternalLink, KeyRound, Save, X, Info, Trash, User, FilePenLine, CheckCircle } from './LucideIcons';
import { logger } from '../services/loggingService';
import type { AccountConnection } from '../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';

interface Platform {
    id: string;
    nameKey: string;
    docsUrl: string;
    neonColor: string;
    category: 'social' | 'affiliate_global' | 'affiliate_vn';
    credentials: { id: string; labelKey: string; placeholderKey: string; type: 'text' | 'password' }[];
}

const platforms: Platform[] = [
    // Social Media
    { id: "youtube", nameKey: "connections.youtube", docsUrl: 'https://console.cloud.google.com/apis/credentials', neonColor: '#FF0000', category: 'social', credentials: [{ id: 'clientId', labelKey: 'connections.clientId', placeholderKey: 'connections.clientIdPlaceholder', type: 'text' }, { id: 'clientSecret', labelKey: 'connections.clientSecret', placeholderKey: 'connections.clientSecretPlaceholder', type: 'password' }] },
    { id: "tiktok", nameKey: "connections.tiktok", docsUrl: 'https://developers.tiktok.com/doc/login-kit-web/', neonColor: '#25F4EE', category: 'social', credentials: [{ id: 'clientKey', labelKey: 'connections.clientKey', placeholderKey: 'connections.clientKeyPlaceholder', type: 'text' }, { id: 'clientSecret', labelKey: 'connections.clientSecret', placeholderKey: 'connections.clientSecretPlaceholder', type: 'password' }] },
    { id: "facebook", nameKey: "connections.facebook", docsUrl: 'https://developers.facebook.com/docs/graph-api/get-started', neonColor: '#1877F2', category: 'social', credentials: [{ id: 'appId', labelKey: 'connections.appId', placeholderKey: 'connections.appIdPlaceholder', type: 'text' }, { id: 'appSecret', labelKey: 'connections.appSecret', placeholderKey: 'connections.appSecretPlaceholder', type: 'password' }] },
    { id: "instagram", nameKey: "connections.instagram", docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started', neonColor: '#d6249f', category: 'social', credentials: [{ id: 'accessToken', labelKey: 'connections.accessToken', placeholderKey: 'connections.accessTokenPlaceholder', type: 'password' }] },
    { id: "x", nameKey: "connections.x", docsUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0', neonColor: '#FFFFFF', category: 'social', credentials: [{ id: 'clientId', labelKey: 'connections.clientId', placeholderKey: 'connections.clientIdPlaceholder', type: 'text' }, { id: 'clientSecret', labelKey: 'connections.clientSecret', placeholderKey: 'connections.clientSecretPlaceholder', type: 'password' }] },
    { id: "pinterest", nameKey: "connections.pinterest", docsUrl: 'https://developers.pinterest.com/docs/getting-started/authentication/', neonColor: '#E60023', category: 'social', credentials: [{ id: 'appId', labelKey: 'connections.appId', placeholderKey: 'connections.appIdPlaceholder', type: 'text' }, { id: 'appSecret', labelKey: 'connections.appSecret', placeholderKey: 'connections.appSecretPlaceholder', type: 'password' }] },
    { id: "telegram", nameKey: "connections.telegram", docsUrl: 'https://core.telegram.org/bots#6-botfather', neonColor: '#2AABEE', category: 'social', credentials: [{ id: 'botToken', labelKey: 'connections.botToken', placeholderKey: 'connections.botTokenPlaceholder', type: 'password' }] },
    { id: "zalo", nameKey: "connections.zalo", docsUrl: 'https://developers.zalo.me/docs/api/official-account-api/xac-thuc-va-uy-quyen/official-account-access-token-post-4307', neonColor: '#0068FF', category: 'social', credentials: [{ id: 'appId', labelKey: 'connections.appId', placeholderKey: 'connections.appIdPlaceholder', type: 'text' }, { id: 'secretKey', labelKey: 'connections.secretKey', placeholderKey: 'connections.secretKeyPlaceholder', type: 'password' }] },

    // Affiliate Global
    { id: "clickbank", nameKey: "connections.clickbank", docsUrl: 'https://support.clickbank.com/hc/en-us/articles/115015505708', neonColor: '#F7941D', category: 'affiliate_global', credentials: [{ id: 'apiKey', labelKey: 'connections.apiKey', placeholderKey: 'connections.apiKeyPlaceholder', type: 'password' }] },
    { id: "amazon", nameKey: "connections.amazon", docsUrl: 'https://affiliate-program.amazon.com/help/topic/t100', neonColor: '#FF9900', category: 'affiliate_global', credentials: [{ id: 'accessKey', labelKey: 'connections.accessKey', placeholderKey: 'connections.accessKeyPlaceholder', type: 'text' }, { id: 'secretKey', labelKey: 'connections.secretKey', placeholderKey: 'connections.secretKeyPlaceholder', type: 'password' }] },
    { id: "shopify", nameKey: "connections.shopify", docsUrl: 'https://shopify.dev/docs/apps/auth/oauth/getting-started', neonColor: '#7AB55C', category: 'affiliate_global', credentials: [{ id: 'apiKey', labelKey: 'connections.apiKey', placeholderKey: 'connections.apiKeyPlaceholder', type: 'password' }, { id: 'apiSecret', labelKey: 'connections.apiSecret', placeholderKey: 'connections.apiSecretPlaceholder', type: 'password' }] },
    { id: "impact", nameKey: "connections.impact", docsUrl: 'https://developer.impact.com/impact-api-started-guide/', neonColor: '#F05D38', category: 'affiliate_global', credentials: [{ id: 'accountSid', labelKey: 'connections.accountSid', placeholderKey: 'connections.accountSidPlaceholder', type: 'text' }, { id: 'authToken', labelKey: 'connections.authToken', placeholderKey: 'connections.authTokenPlaceholder', type: 'password' }] },
    { id: "partnerstack", nameKey: "connections.partnerstack", docsUrl: 'https://developers.partnerstack.com/reference/introduction', neonColor: '#4B40EE', category: 'affiliate_global', credentials: [{ id: 'publicKey', labelKey: 'connections.publicKey', placeholderKey: 'connections.publicKeyPlaceholder', type: 'text' }, { id: 'secretKey', labelKey: 'connections.secretKey', placeholderKey: 'connections.secretKeyPlaceholder', type: 'password' }] },
    { id: "digistore24", nameKey: "connections.digistore24", docsUrl: 'https://dev.digistore24.com/', neonColor: '#007BFF', category: 'affiliate_global', credentials: [{ id: 'apiKey', labelKey: 'connections.apiKey', placeholderKey: 'connections.apiKeyPlaceholder', type: 'password' }] },
    
    // Affiliate VN
    { id: "lazada", nameKey: "connections.lazada", docsUrl: 'https://open.lazada.com/doc/doc.htm?spm=a2o9m.11193494.0.0.1f733535j2q0zP&source=search&docId=108298&treeId=1', neonColor: '#0F146D', category: 'affiliate_vn', credentials: [{ id: 'appKey', labelKey: 'connections.appKey', placeholderKey: 'connections.appKeyPlaceholder', type: 'text' }, { id: 'appSecret', labelKey: 'connections.appSecret', placeholderKey: 'connections.appSecretPlaceholder', type: 'password' }] },
    { id: "shopee", nameKey: "connections.shopee", docsUrl: 'https://open.shopee.com/documents/v2/v2.1/introduction?module=83&type=2', neonColor: '#EE4D2D', category: 'affiliate_vn', credentials: [{ id: 'partnerId', labelKey: 'connections.partnerId', placeholderKey: 'connections.partnerIdPlaceholder', type: 'text' }, { id: 'apiKey', labelKey: 'connections.apiKey', placeholderKey: 'connections.apiKeyPlaceholder', type: 'password' }] },
    { id: "tiki", nameKey: "connections.tiki", docsUrl: 'https://open.tiki.vn/', neonColor: '#1A94FF', category: 'affiliate_vn', credentials: [{ id: 'clientId', labelKey: 'connections.clientId', placeholderKey: 'connections.clientIdPlaceholder', type: 'text' }, { id: 'clientSecret', labelKey: 'connections.clientSecret', placeholderKey: 'connections.clientSecretPlaceholder', type: 'password' }] },
];

export const LOCAL_STORAGE_KEY = 'ai-automation-user-connections';

const ConnectionModal: React.FC<{
    platform: Platform;
    existingConnection: AccountConnection | null;
    platformAccounts: AccountConnection[];
    onClose: () => void;
    onSave: (connection: AccountConnection) => void;
    onDelete: (connectionId: string) => void;
    onEdit: (connection: AccountConnection) => void;
}> = ({ platform, existingConnection, platformAccounts, onClose, onSave, onDelete, onEdit }) => {
    const { t } = useI18n();
    const isEditing = !!existingConnection;
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isJustSaved, setIsJustSaved] = useState(false);

    useEffect(() => {
        const initialData: Record<string, string> = { username: existingConnection?.username || '' };
        platform.credentials.forEach(cred => {
            initialData[cred.id] = existingConnection?.credentials[cred.id] || '';
        });
        setFormData(initialData);
    }, [existingConnection, platform]);

    const handleSave = async () => {
        const username = formData.username;
        const credentials = { ...formData };
        delete credentials.username;
        
        if (!username || Object.values(credentials).some(v => !v)) {
            alert(t('connections.fillAllFields'));
            return;
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const connectionData: AccountConnection = {
            id: existingConnection?.id || `${platform.id}_${Date.now()}`,
            platformId: platform.id,
            username,
            credentials,
            connectedAt: existingConnection?.connectedAt || new Date().toISOString(),
        };
        onSave(connectionData);
        setIsSaving(false);

        if (isEditing) {
            onClose();
        } else {
            const clearedData: Record<string, string> = { username: '' };
            platform.credentials.forEach(cred => { clearedData[cred.id] = ''; });
            setFormData(clearedData);
            setIsJustSaved(true);
            setTimeout(() => setIsJustSaved(false), 2500);
        }
    };
    
    const handleDelete = () => {
        if (existingConnection) {
            onDelete(existingConnection.id);
        }
    };
    
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="glass-card w-full max-w-lg rounded-xl shadow-2xl flex flex-col"
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
            >
                <div>
                     <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <PlatformLogo platformId={platform.id} className="w-8 h-8"/>
                            <h2 className="text-xl font-bold text-gray-100">{t(isEditing ? 'connections.editConnectionTitle' : 'connections.newConnectionTitle')} - {t(platform.nameKey)}</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X className="w-5 h-5"/></Button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-start p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                            <Info className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0 mt-0.5"/>
                            <p className="text-sm text-primary-200">{t('connections.credentialsInfo')}</p>
                        </div>

                        {platformAccounts.length > 0 && !isEditing && (
                            <div className="space-y-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-300">{t('connections.alreadyConnected')}</h4>
                                <ul className="divide-y divide-gray-600">
                                    {platformAccounts.map(acc => (
                                        <li key={acc.id} className="py-2 flex justify-between items-center">
                                            <span className="text-gray-200">{acc.username}</span>
                                            <Button size="sm" variant="ghost" onClick={() => onEdit(acc)} icon={<FilePenLine className="w-4 h-4" />}>
                                                {t('connections.editAction')}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('connections.usernameLabel')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                                <input
                                    type="text"
                                    value={formData.username || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder={t('connections.usernamePlaceholder')}
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        {platform.credentials.map(field => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t(field.labelKey)}</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                                    <input
                                        type={field.type}
                                        value={formData[field.id] || ''}
                                        onChange={e => setFormData(prev => ({...prev, [field.id]: e.target.value}))}
                                        placeholder={t(field.placeholderKey)}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-b-xl">
                        <div className="flex items-center">
                            <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4"/>}>
                                    {t('connections.viewDocs')}
                                </Button>
                            </a>
                             {isJustSaved && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-400 text-sm flex items-center ml-4">
                                    <CheckCircle className="w-4 h-4 mr-2"/>
                                    <span>{t('connections.savedMessage')}</span>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            {isEditing && (
                                <Button variant="secondary" onClick={handleDelete} className="text-red-400 hover:bg-red-500/10 hover:border-red-500/20" icon={<Trash className="w-4 h-4"/>}>
                                    {t('connections.delete')}
                                </Button>
                            )}
                            <Button onClick={handleSave} isLoading={isSaving} icon={<Save className="w-4 h-4"/>}>
                                {isSaving ? t('connections.saving') : (isEditing ? t('connections.update') : t('connections.addAnother'))}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PlatformCard: React.FC<{
    platform: Platform;
    accounts: AccountConnection[];
    onClick: () => void;
}> = ({ platform, accounts, onClick }) => {
    const { t } = useI18n();
    const connectionCount = accounts.length;
    const isConnected = connectionCount > 0;

    return (
        <motion.div
            onClick={onClick}
            className={`relative group glass-card rounded-2xl p-4 border border-gray-700 transition-all duration-300 cursor-pointer ${!isConnected && 'opacity-60 hover:opacity-100'}`}
            whileHover={{ y: -5, boxShadow: `0 0 15px 5px ${platform.neonColor}30`, borderColor: `${platform.neonColor}80`}}
            layout
        >
           <div className="flex justify-center mb-3">
                <PlatformLogo platformId={platform.id} className="w-12 h-12" />
           </div>
           <h3 className="font-semibold text-lg text-center text-gray-100">{t(platform.nameKey)}</h3>
           <div className="text-center text-sm mt-1 h-5">
               {isConnected ? (
                   <p className="text-green-400 font-medium">{t('connections.connectedCount', { count: connectionCount.toString() })}</p>
               ) : (
                   <p className="text-gray-500">{t('connections.notConfigured')}</p>
               )}
           </div>
           {isConnected && (
                <div className="absolute top-2 right-2 p-1 bg-green-500/20 rounded-full border border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
            )}
        </motion.div>
    );
};

export const Connections: React.FC = () => {
    const { t } = useI18n();
    const [accounts, setAccounts] = useState<AccountConnection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
    const [editingConnection, setEditingConnection] = useState<AccountConnection | null>(null);
    
    useEffect(() => {
        try {
            const savedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedAccounts) {
                setAccounts(JSON.parse(savedAccounts));
            }
        } catch (error) {
            logger.error("Failed to load connections from localStorage", { error });
        }
    }, []);

    const saveAccounts = useCallback((updatedAccounts: AccountConnection[]) => {
        try {
            setAccounts(updatedAccounts);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));
        } catch (error) {
            logger.error("Failed to save connections to localStorage", { error });
        }
    }, []);
    
    const handleCardClick = (platform: Platform) => {
        setSelectedPlatform(platform);
        setEditingConnection(null);
        setIsModalOpen(true);
    };

    const handleManageClick = (account: AccountConnection) => {
        const platform = platforms.find(p => p.id === account.platformId);
        if(platform) {
            setSelectedPlatform(platform);
            setEditingConnection(account);
            setIsModalOpen(true);
        }
    };

    const handleSaveConnection = (connection: AccountConnection) => {
        const isUpdating = accounts.some(acc => acc.id === connection.id);
        const updatedAccounts = isUpdating 
            ? accounts.map(acc => (acc.id === connection.id ? connection : acc))
            : [...accounts, connection];
        saveAccounts(updatedAccounts);
    };

    const handleRemoveConnection = (accountId: string) => {
        const accountToRemove = accounts.find(acc => acc.id === accountId);
        if (!accountToRemove) return;

        const platform = platforms.find(p => p.id === accountToRemove.platformId);
        const name = platform ? t(platform.nameKey) : 'this account';
        
        if (window.confirm(t('connections.confirmRemove', { platform: name }))) {
            const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
            saveAccounts(updatedAccounts);
            logger.info(`Removed connection ${accountId}`);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">{t('connections.hubTitle')}</h1>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{t('connections.hubDescription_v2')}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {platforms.map(platform => {
                    const platformAccounts = accounts.filter(a => a.platformId === platform.id);
                    return (
                        <PlatformCard 
                            key={platform.id}
                            platform={platform}
                            accounts={platformAccounts}
                            onClick={() => handleCardClick(platform)}
                        />
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('connections.historyTitle')}</CardTitle>
                    <CardDescription>{t('connections.historyDescription')}</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('connections.tablePlatform')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('connections.tableUsername')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('connections.tableConnectedAt')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{t('connections.tableActions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {accounts.length > 0 ? accounts.map(account => {
                                const platform = platforms.find(p => p.id === account.platformId);
                                if (!platform) return null;
                                return (
                                    <tr key={account.id} className="hover:bg-gray-800/40">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <PlatformLogo platformId={platform.id} className="w-6 h-6 mr-3" />
                                                <span className="text-sm font-medium text-gray-100">{t(platform.nameKey)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{account.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(account.connectedAt).toLocaleString(t('localeCode', {localeCode: 'vi-VN'}) || 'en-US')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleManageClick(account)} title={t('connections.manageAction')}>
                                                    <FilePenLine className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => handleRemoveConnection(account.id)} title={t('connections.delete')}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                        {t('connections.noAccountsConnected')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AnimatePresence>
                {isModalOpen && selectedPlatform && (
                    <ConnectionModal
                        platform={selectedPlatform}
                        existingConnection={editingConnection}
                        platformAccounts={accounts.filter(acc => acc.platformId === selectedPlatform.id)}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveConnection}
                        onDelete={handleRemoveConnection}
                        onEdit={(connection) => setEditingConnection(connection)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};