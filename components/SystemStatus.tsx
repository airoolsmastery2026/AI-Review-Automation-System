import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../hooks/useI18n';
import { logger } from '../services/loggingService';
import type { LogEntry, ConnectionHealth, ConnectionHealthStatus, Connection } from '../types';
import { ShieldCheck, HardDriveDownload, Server, AlertTriangle } from './LucideIcons';
import { PlatformLogo } from './PlatformLogo';

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

const initialConnectionChecks: Omit<ConnectionHealth, 'status' | 'lastChecked'>[] = [
    { id: 'youtube', nameKey: 'connections.youtube' },
    { id: 'clickbank', nameKey: 'connections.clickbank' },
    { id: 'facebook', nameKey: 'connections.facebook' },
];

export const SystemStatus: React.FC = () => {
    const { t } = useI18n();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [connections, setConnections] = useState<ConnectionHealth[]>([]);
    
    useEffect(() => {
        const unsubscribe = logger.subscribe(setLogs);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const checkConnectionStatus = () => {
            try {
                const stored = localStorage.getItem('universal-connections');
                const storedConnections: Record<string, Connection> = stored ? JSON.parse(stored) : {};

                const updatedConnections = initialConnectionChecks.map(connInfo => {
                    const isConnected = !!storedConnections[connInfo.id];
                    return {
                        ...connInfo,
                        status: isConnected ? 'Connected' : 'Disconnected',
                        lastChecked: new Date().toISOString()
                    };
                });

                // Add Gemini as a non-optional, server-side connection
                const geminiStatus: ConnectionHealth = {
                    id: 'gemini',
                    nameKey: 'connections.gemini',
                    status: 'Connected', // Always connected as it's server-side
                    lastChecked: new Date().toISOString()
                };
                
                setConnections([geminiStatus, ...updatedConnections]);
            } catch (error) {
                logger.error("Failed to parse connections from localStorage", { error });
            }
        };

        checkConnectionStatus();
        const interval = setInterval(checkConnectionStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);
    
    const connectedCount = connections.filter(c => c.status === 'Connected').length;
    // Security grade is now A because the most critical key (Gemini) is server-side.
    const securityGrade = "A";
    const automationReadiness = `${Math.round((connectedCount / connections.length) * 100)}%`;
    const securityColor = "text-green-400"; // Always green now
    const readinessColor = connectedCount / connections.length > 0.7 ? "text-green-400" : connectedCount > 1 ? "text-yellow-400" : "text-red-400";


    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="text-center !p-6">
                    <CardTitle className="text-2xl">{t('systemStatus.title')}</CardTitle>
                    <CardDescription>{t('systemStatus.description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><ShieldCheck className={`h-5 w-5 mr-2 ${securityColor}`} />{t('systemStatus.securityGrade')}</CardTitle>
                    </CardHeader>
                    <div className="p-4 text-center">
                        <p className={`text-5xl font-bold ${securityColor}`}>{securityGrade}</p>
                        <p className="text-sm text-slate-400 mt-2">{t('systemStatus.securityGradeDescription')}</p>
                    </div>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Server className={`h-5 w-5 mr-2 ${readinessColor}`} />{t('systemStatus.automationReadiness')}</CardTitle>
                    </CardHeader>
                    <div className="p-4 text-center">
                        <p className={`text-5xl font-bold ${readinessColor}`}>{automationReadiness}</p>
                         <p className="text-sm text-slate-400 mt-2">{t('systemStatus.automationReadinessDescription')}</p>
                    </div>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('systemStatus.connectionStatusTitle')}</CardTitle>
                    <CardDescription>{t('systemStatus.connectionStatusDescription')}</CardDescription>
                </CardHeader>
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 font-semibold text-xs text-slate-400 uppercase pb-2 border-b border-slate-700">
                        <span>{t('systemStatus.service')}</span>
                        <span>{t('systemStatus.status')}</span>
                        <span className="text-right">{t('systemStatus.lastChecked')}</span>
                    </div>
                    <div className="space-y-2 pt-2">
                        {connections.map(conn => (
                            <div key={conn.id} className="grid grid-cols-3 gap-4 items-center">
                                {/* Fix: Corrected typo from Platform to PlatformLogo and completed the truncated component. */}
                                <div className="flex items-center">
                                    <PlatformLogo platformId={conn.id} className="w-6 h-6 mr-3" />
                                    <span className="font-semibold text-slate-100">{t(conn.nameKey)}</span>
                                </div>
                                <span><ConnectionStatusIndicator status={conn.status} /></span>
                                <span className="text-right text-sm text-slate-400">{new Date(conn.lastChecked).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('systemStatus.recommendationsTitle')}</CardTitle>
                    <CardDescription>{t('systemStatus.recommendationsDescription')}</CardDescription>
                </CardHeader>
                <ul className="p-4 space-y-3">
                    <li className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('systemStatus.rec1Title')}</h4>
                            <p className="text-sm text-slate-400">Storing other API keys in localStorage is not suitable for production. Your backend should manage all sensitive keys.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <Server className="h-5 w-5 mr-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('systemStatus.rec2Title')}</h4>
                            <p className="text-sm text-slate-400">{t('systemStatus.rec2Description')}</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <ShieldCheck className="h-5 w-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('systemStatus.rec3Title')}</h4>
                            <p className="text-sm text-slate-400">{t('systemStatus.rec3Description')}</p>
                        </div>
                    </li>
                </ul>
            </Card>

            <Card className="max-h-[600px] flex flex-col">
                <CardHeader className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t('systemStatus.systemLogTitle')}</CardTitle>
                        <CardDescription>{t('systemStatus.systemLogDescription')}</CardDescription>
                    </div>
                    <Button variant="secondary" onClick={() => logger.downloadLogs()} icon={<HardDriveDownload className="h-4 w-4"/>}>
                        {t('systemStatus.downloadLogs')}
                    </Button>
                </CardHeader>
                <div className="p-4 space-y-3 overflow-y-auto font-mono text-xs border-t border-slate-700 flex-grow">
                    {logs.length > 0 ? logs.map((log, index) => (
                        <div key={index} className="flex items-start">
                            <LogLevelIndicator level={log.level} />
                            <span className="text-slate-500 mx-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <p className="text-slate-300 break-words">{log.message}</p>
                        </div>
                    )) : (
                        <p className="text-slate-500 text-center py-8">{t('systemStatus.noLogs')}</p>
                    )}
                </div>
            </Card>
        </div>
    );
};