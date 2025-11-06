


import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../../hooks/useI18n';
import { logger } from '../../services/loggingService';
import type { LogEntry, ConnectionHealth, ConnectionHealthStatus, AccountConnection, AffiliateHealth } from '../../types';
import { ShieldCheck, HardDriveDownload, Server, AlertTriangle, Check, X, RefreshCw } from './LucideIcons';
import { PlatformLogo } from './PlatformLogo';
import { LOCAL_STORAGE_KEY, platforms as allPlatforms } from './data/connections';
import { useNotifier } from '../../contexts/NotificationContext';
import { checkUrlStatus } from '../../services/geminiService';

const LOG_STORAGE_KEY = 'ai-automation-affiliate-health';
const LAST_CHECK_STORAGE_KEY = 'ai-automation-last-affiliate-check';

const LogLevelIndicator: React.FC<{ level: LogEntry['level'] }> = ({ level }) => {
    const levelInfo = {
        INFO: { class: 'bg-blue-500', text: 'I' },
        WARN: { class: 'bg-yellow-500', text: 'W' },
        ERROR: { class: 'bg-red-500', text: 'E' },
    };
    return (
        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${levelInfo[level].class}`}>
            {levelInfo[level].text}
        </div>
    )
}

const ConnectionStatusIndicator: React.FC<{ status: ConnectionHealthStatus }> = ({ status }) => {
    const { t } = useI18n();
    const statusInfo = {
        Connected: { class: 'bg-green-500', textKey: 'systemStatus.status_Connected' },
        Refreshing: { class: 'bg-yellow-500 animate-pulse', textKey: 'systemStatus.status_Refreshing' },
        Disconnected: { class: 'bg-slate-400', textKey: 'systemStatus.status_Disconnected' },
        Error: { class: 'bg-red-500', textKey: 'systemStatus.status_Error' },
    };
    const info = statusInfo[status];
    return (
        <div className="flex items-center">
            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${info.class}`}></div>
            <span className="text-sm text-slate-300">{t(info.textKey)}</span>
        </div>
    );
};

const AffiliateStatusIcon: React.FC<{ status: AffiliateHealth['status'] }> = ({ status }) => {
    const statusInfo = {
        OK: { icon: <Check className="h-5 w-5 text-green-400" />, key: 'systemStatus.status_OK' },
        Warning: { icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />, key: 'systemStatus.status_Warning' },
        Error: { icon: <X className="h-5 w-5 text-red-400" />, key: 'systemStatus.status_Error' },
    };
    const { t } = useI18n();
    return <div title={t(statusInfo[status].key)}>{statusInfo[status].icon}</div>;
}


export const SystemStatus: React.FC = () => {
    const { t } = useI18n();
    const notifier = useNotifier();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [connections, setConnections] = useState<ConnectionHealth[]>([]);
    const [affiliateHealth, setAffiliateHealth] = useState<AffiliateHealth[]>([]);
    const [isCheckingAffiliates, setIsCheckingAffiliates] = useState(false);
    
    useEffect(() => {
        const unsubscribe = logger.subscribe(setLogs);
        return () => unsubscribe();
    }, []);

    // Effect for core connection status
    useEffect(() => {
        const checkConnectionStatus = () => {
            try {
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                const storedAccounts: AccountConnection[] = stored ? JSON.parse(stored) : [];
                const configuredPlatformIds = new Set(storedAccounts.map(acc => acc.platformId));
                const updatedConnections = allPlatforms.map((connInfo): ConnectionHealth => ({
                    ...connInfo,
                    status: configuredPlatformIds.has(connInfo.id) ? 'Connected' : 'Disconnected',
                    lastChecked: new Date().toISOString()
                }));
                const geminiStatus: ConnectionHealth = {
                    id: 'gemini', nameKey: 'connections.gemini', status: 'Connected', lastChecked: new Date().toISOString()
                };
                setConnections([geminiStatus, ...updatedConnections]);
            } catch (error) {
                logger.error("Failed to parse connections from localStorage", { error });
            }
        };

        checkConnectionStatus();
        const interval = setInterval(checkConnectionStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Effect for affiliate health check (runs once on load and on schedule)
    useEffect(() => {
        // Load cached results on mount
        try {
            const cachedResults = localStorage.getItem(LOG_STORAGE_KEY);
            if (cachedResults) {
                setAffiliateHealth(JSON.parse(cachedResults));
            }
        } catch (error) {
            logger.error("Failed to load cached affiliate health", { error });
        }
        
        const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_STORAGE_KEY) || '0');
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - lastCheck > oneDay) {
            runAffiliateCheck();
        }
    }, []);

    const runAffiliateCheck = async () => {
        setIsCheckingAffiliates(true);
        logger.info("Starting daily affiliate status check...");
        
        let storedAccounts: AccountConnection[];
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            storedAccounts = stored ? JSON.parse(stored) : [];
        } catch (error) {
            logger.error("Failed to read affiliate connections for health check.", { error });
            setIsCheckingAffiliates(false);
            return;
        }

        const affiliateConnections = storedAccounts.filter(acc => {
            const platform = allPlatforms.find(p => p.id === acc.platformId);
            return platform?.categoryKey.startsWith('connections.category_affiliate');
        });

        if (affiliateConnections.length === 0) {
            logger.info("No configured affiliate platforms to check.");
            setAffiliateHealth([]);
            setIsCheckingAffiliates(false);
            return;
        }

        const checkPromises = affiliateConnections.map(async (conn): Promise<AffiliateHealth> => {
            const platform = allPlatforms.find(p => p.id === conn.platformId);
            const url = platform?.docsUrl; // Using docsUrl as a proxy for service health
            let result: AffiliateHealth = {
                connectionId: conn.id,
                platformId: conn.platformId,
                username: conn.username,
                status: 'Error',
                message: 'Platform URL not found.',
                lastChecked: new Date().toISOString()
            };
            
            if (url) {
                try {
                    const res = await checkUrlStatus(url);
                    if (res.ok) {
                        result = { ...result, status: 'OK', message: `OK (${res.status})` };
                    } else {
                        result = { ...result, status: 'Warning', message: `HTTP ${res.status}: ${res.statusText}` };
                    }
                } catch (error: any) {
                    result = { ...result, status: 'Error', message: `Network Error: ${error.message}` };
                }
            }
            return result;
        });

        const results = await Promise.all(checkPromises);
        setAffiliateHealth(results);
        
        try {
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(results));
            localStorage.setItem(LAST_CHECK_STORAGE_KEY, Date.now().toString());
        } catch (error) {
            logger.error("Failed to save affiliate health results", { error });
        }

        logger.info("Affiliate status check complete.", { count: results.length });
        notifier.success(t('notifications.affiliateCheckComplete'));
        setIsCheckingAffiliates(false);
    };
    
    const connectedCount = connections.filter(c => c.status === 'Connected').length;
    const securityGrade = "C-"; 
    const automationReadiness = connections.length > 0 ? `${Math.round((connectedCount / connections.length) * 100)}%` : '0%';
    const securityColor = "text-red-400";
    const readinessValue = connections.length > 0 ? connectedCount / connections.length : 0;
    const readinessColor = readinessValue > 0.7 ? "text-green-400" : readinessValue > 0.3 ? "text-yellow-400" : "text-red-400";

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="text-center !p-6">
                    <CardTitle className="text-2xl">{t('systemStatus.title')}</CardTitle>
                    <CardDescription>{t('systemStatus.description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid---END OF FILE---