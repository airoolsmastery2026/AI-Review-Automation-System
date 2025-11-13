
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { logger } from './services/loggingService';
import type { LogEntry, ConnectionHealth, ConnectionHealthStatus, AccountConnection, AffiliateHealth } from '../../types';
import { ShieldCheck, HardDriveDownload, Server, AlertTriangle, Check, X, RefreshCw } from './LucideIcons';
import { PlatformLogo } from './PlatformLogo';
import { LOCAL_STORAGE_KEY, platforms as allPlatforms } from './data/connections';
import { useNotifier } from '../../contexts/NotificationContext';
import { checkUrlStatus } from './services/geminiService';

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
    const [logs, setLogs] = React.useState<LogEntry[]>([]);
    const [connections, setConnections] = React.useState<ConnectionHealth[]>([]);
    const [affiliateHealth, setAffiliateHealth] = React.useState<AffiliateHealth[]>([]);
    const [isCheckingAffiliates, setIsCheckingAffiliates] = React.useState(false);
    
    React.useEffect(() => {
        const unsubscribe = logger.subscribe(setLogs);
        return () => unsubscribe();
    }, []);

    // Effect for core connection status
    React.useEffect(() => {
        // Mocking core service connections for display
        const coreServices: ConnectionHealth[] = [
            { id: 'gemini_api', nameKey: 'connections.gemini', status: 'Connected', lastChecked: new Date().toISOString() },
        ];
        setConnections(coreServices);

        const savedHealth = localStorage.getItem(LOG_STORAGE_KEY);
        if (savedHealth) {
            try {
                setAffiliateHealth(JSON.parse(savedHealth));
            } catch (e) {
                logger.error("Failed to parse affiliate health from storage.", { error: e });
            }
        }
    }, []);

    const handleCheckAffiliates = async () => {
        setIsCheckingAffiliates(true);
        logger.info("Manual affiliate health check initiated.");
        
        let allUserConnections: AccountConnection[] = [];
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) allUserConnections = JSON.parse(stored);
        } catch (e) { logger.error("Failed to parse user connections for health check.", { error: e }); }

        const affiliatePlatforms = allPlatforms.filter(p => p.categoryKey.startsWith('connections.category_affiliate'));
        const healthResults: AffiliateHealth[] = [];

        for (const platform of affiliatePlatforms) {
            const userConnections = allUserConnections.filter(c => c.platformId === platform.id);
            if (userConnections.length > 0) {
                for (const conn of userConnections) {
                    const urlResponse = await checkUrlStatus(platform.signupUrl);
                    healthResults.push({
                        connectionId: conn.id,
                        platformId: conn.platformId,
                        username: conn.username,
                        status: urlResponse.ok ? 'OK' : 'Warning',
                        message: urlResponse.ok ? `Signup URL is active (${urlResponse.status})` : `Signup URL may be down or changed (${urlResponse.status})`,
                        lastChecked: new Date().toISOString()
                    });
                }
            }
        }

        setAffiliateHealth(healthResults);
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(healthResults));
        localStorage.setItem(LAST_CHECK_STORAGE_KEY, new Date().getTime().toString());
        notifier.success(t('systemStatus.runCheckNow') + ' ' + t('projectRoadmap.completed').toLowerCase());
        setIsCheckingAffiliates(false);
    };

    const connectedAccountsCount = React.useMemo(() => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as AccountConnection[]).length : 0;
        } catch {
            return 0;
        }
    }, []);

    const securityScore = Math.min(100, 20 + connectedAccountsCount * 10);
    const readinessScore = Math.min(100, 10 + connectedAccountsCount * 8);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{t('systemStatus.title')}</CardTitle>
                    <CardDescription>{t('systemStatus.description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('systemStatus.securityGrade')}</CardTitle>
                        <CardDescription>{t('systemStatus.securityGradeDescription')}</CardDescription>
                    </CardHeader>
                    <div className="p-4 text-center text-5xl font-bold text-green-400">{securityScore}%</div>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('systemStatus.automationReadiness')}</CardTitle>
                        <CardDescription>{t('systemStatus.automationReadinessDescription')}</CardDescription>
                    </CardHeader>
                    <div className="p-4 text-center text-5xl font-bold text-blue-400">{readinessScore}%</div>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{t('systemStatus.affiliateHealthTitle')}</CardTitle>
                            <CardDescription>{t('systemStatus.affiliateHealthDescription')}</CardDescription>
                        </div>
                        <Button onClick={handleCheckAffiliates} isLoading={isCheckingAffiliates} icon={<RefreshCw className="h-4 w-4" />}>
                            {isCheckingAffiliates ? t('systemStatus.checking') : t('systemStatus.runCheckNow')}
                        </Button>
                    </div>
                </CardHeader>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('connections.tablePlatform')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status Details</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{t('systemStatus.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                           {affiliateHealth.length > 0 ? affiliateHealth.map(health => (
                               <tr key={health.connectionId}>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="flex items-center">
                                           <PlatformLogo platformId={health.platformId} className="w-6 h-6 mr-3" />
                                           <span className="text-sm font-medium text-gray-100">{health.username}</span>
                                       </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <p className="text-sm text-gray-300">{health.message}</p>
                                       <p className="text-xs text-gray-500">{t('systemStatus.lastCheckedAt', { time: new Date(health.lastChecked).toLocaleTimeString() })}</p>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right"><AffiliateStatusIcon status={health.status} /></td>
                               </tr>
                           )) : (
                               <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">{t('systemStatus.noAffiliatesConnected')}</td></tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('systemStatus.recommendationsTitle')}</CardTitle>
                    <CardDescription>{t('systemStatus.recommendationsDescription')}</CardDescription>
                </CardHeader>
                <ul className="p-4 divide-y divide-gray-700">
                    <li className="py-3 flex items-start"><AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" /><div><h4 className="font-semibold text-gray-200">{t('systemStatus.rec1Title')}</h4><p className="text-sm text-gray-400">{t('systemStatus.rec1Description')}</p></div></li>
                    <li className="py-3 flex items-start"><Server className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" /><div><h4 className="font-semibold text-gray-200">{t('systemStatus.rec2Title')}</h4><p className="text-sm text-gray-400">{t('systemStatus.rec2Description')}</p></div></li>
                    <li className="py-3 flex items-start"><ShieldCheck className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" /><div><h4 className="font-semibold text-gray-200">{t('systemStatus.rec3Title')}</h4><p className="text-sm text-gray-400">{t('systemStatus.rec3Description')}</p></div></li>
                </ul>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{t('systemStatus.systemLogTitle')}</CardTitle>
                            <CardDescription>{t('systemStatus.systemLogDescription')}</CardDescription>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => logger.downloadLogs()} icon={<HardDriveDownload className="h-4 w-4" />}>
                            {t('systemStatus.downloadLogs')}
                        </Button>
                    </div>
                </CardHeader>
                <div className="p-4 font-mono text-xs text-gray-300 space-y-2 max-h-96 overflow-y-auto">
                    {logs.length > 0 ? logs.map(log => (
                        <div key={log.timestamp + log.message} className="flex items-start">
                            <LogLevelIndicator level={log.level} />
                            <span className="text-gray-500 mx-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span>{log.message}</span>
                        </div>
                    )) : <p>{t('systemStatus.noLogs')}</p>}
                </div>
            </Card>
        </div>
    );
};
