

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformLogo } from './PlatformLogo';
import { useI18n } from '../../hooks/useI18n';
import { Button } from './common/Button';
import { ExternalLink, KeyRound, Save, X, Trash, User, FilePenLine, BookOpen, AlertTriangle, Percent } from './LucideIcons';
import { logger } from '../../services/loggingService';
import { useNotifier } from '../../contexts/NotificationContext';
import type { AccountConnection, Platform } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { platforms, LOCAL_STORAGE_KEY } from './data/connections';
import { AffiliateHub } from '../../AffiliateHub';

const ToggleSwitch: React.FC<{
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-medium text-gray-300">
            {label}
        </label>
        <div className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={id}
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </div>
    </div>
);

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
    const notifier = useNotifier();
    const isEditing = !!existingConnection;
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [commission, setCommission] = useState('');

    useEffect(() => {
        const initialData: Record<string, string> = { username: existingConnection?.username || '' };
        platform.credentials.forEach(cred => {
            initialData[cred.id] = existingConnection?.credentials[cred.id] || '';
        });
        setFormData(initialData);
        setIsActive(existingConnection?.isActive ?? true);
        setCommission(existingConnection?.commissionEstimate || '');
    }, [existingConnection, platform]);

    const handleSave = async () => {
        const username = formData.username;
        const credentials = { ...formData };
        if(platform.categoryKey !== 'connections.category_global_settings') {
            delete credentials.username;
        }
        
        if (!username && platform.categoryKey !== 'connections.category_global_settings') {
             notifier.error(t('connections.fillAllFields'));
             return;
        }
        if (Object.values(credentials).some(v => !v)) {
            notifier.error(t('connections.fillAllFields'));
            return;
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const connectionData: AccountConnection = {
            id: existingConnection?.id || `${platform.id}_${Date.now()}`,
            platformId: platform.id,
            username: username || platform.id, // Use platform ID for global settings
            credentials,
            connectedAt: existingConnection?.connectedAt || new Date().toISOString(),
            isActive,
            commissionEstimate: commission,
        };
        onSave(connectionData);
        setIsSaving(false);

        if (isEditing) {
            notifier.success(t('notifications.connectionSaved'));
            onClose();
        } else {
            notifier.success(t('notifications.connectionSaved'));
            const clearedData: Record<string, string> = { username: '' };
            platform.credentials.forEach(cred => { clearedData[cred.id] = ''; });
            setFormData(clearedData);
            setCommission('');
            setIsActive(true);
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
                className="glass-card w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <PlatformLogo platformId={platform.id} className="w-8 h-8"/>
                        <h2 className="text-xl font-bold text-gray-100">{t(isEditing ? 'connections.editConnectionTitle' : 'connections.newConnectionTitle')} - {t(platform.nameKey)}</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X className="w-5 h-5"/></Button>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0">
                    <div className="flex items-start p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <BookOpen className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5"/>
                        <div>
                            <p className="text-sm font-semibold text-gray-200">{t('connections.guideTitle')}</p>
                            <p className="text-sm text-gray-300 mt-1">{t(platform.guideKey)}</p>
                        </div>
                    </div>

                    <div className="flex items-start p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5"/>
                        <p className="text-sm text-yellow-200">{t('connections.credentialsInfo')}</p>
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
                    
                    {platform.categoryKey !== 'connections.category_global_settings' && (
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
                    )}
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
                    <div className="border-t border-gray-700 pt-4 space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('connections.commissionEstimate')}</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                                <input
                                    type="text"
                                    value={commission}
                                    onChange={e => setCommission(e.target.value)}
                                    placeholder="e.g., 20"
                                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <ToggleSwitch id="active-status" label={t('connections.statusActive')} checked={isActive} onChange={setIsActive} />
                    </div>
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-b-xl">
                    <div className="flex items-center">
                        <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4"/>}>
                                {t('connections.viewDocs')}
                            </Button>
                        </a>
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
    const notifier = useNotifier();
    
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
        logger.info(`Saved connection for ${connection.username} on ${connection.platformId}`);
    };

    const handleRemoveConnection = (accountId: string) => {
        const accountToRemove = accounts.find(acc => acc.id === accountId);
        if (!accountToRemove) return;

        const platform = platforms.find(p => p.id === accountToRemove.platformId);
        const name = platform ? t(platform.nameKey) : 'this account';
        
        if (window.confirm(t('connections.confirmRemove', { platform: name, username: accountToRemove.username }))) {
            const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
            saveAccounts(updatedAccounts);
            notifier.success(t('notifications.connectionRemoved'));
            logger.info(`Removed connection ${accountId}`);
            setIsModalOpen(false);
            setEditingConnection(null);
        }
    };

    // Fix: Rewrote the `reduce` function with explicit typing to resolve an issue where
    // the accumulator was not being correctly typed, leading to a downstream error with `.map`.
    const groupedPlatforms = platforms.reduce<Record<string, Platform[]>>((acc, platform) => {
        const key = platform.categoryKey;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(platform);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">{t('connections.hubTitle')}</h1>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{t('connections.hubDescription_v2')}</p>
            </div>
            
            <AffiliateHub />

            {Object.entries(groupedPlatforms).map(([categoryKey, platformGroup]) => (
                <div key={categoryKey}>
                    <h2 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">{t(categoryKey)}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {platformGroup.map(platform => {
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
                </div>
            ))}

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
                                            {new Date(account.connectedAt).toLocaleString(t('localeCode') || 'en-US')}
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
                        platformAccounts={accounts.filter(acc => acc.platformId === selectedPlatform.id && acc.id !== editingConnection?.id)}
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