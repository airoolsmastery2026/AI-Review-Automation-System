import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../hooks/useI18n';
import { logger } from '../services/loggingService';
import type { LogEntry, ConnectionHealth, ConnectionHealthStatus } from '../types';
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

const initialConnections: ConnectionHealth[] = [
    { id: 'gemini', nameKey: 'connections.gemini', status: 'Disconnected', lastChecked: new Date().toISOString() },
    { id: 'youtube', nameKey: 'connections.youtube', status: 'Disconnected', lastChecked: new Date().toISOString() },
    { id: 'clickbank', nameKey: 'connections.clickbank', status: 'Disconnected', lastChecked: new Date().toISOString() },
    { id: 'facebook', nameKey: 'connections.facebook', status: 'Disconnected', lastChecked: new Date().toISOString() },
];

export const SystemStatus: React.FC = () => {
    const { t } = useI18n();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [connections, setConnections] = useState<ConnectionHealth[]>(initialConnections);

    useEffect(() => {
        const unsubscribe = logger.subscribe(setLogs);
        return () => unsubscribe();
    }, []);

    // Simulate real-time polling for connection status
    useEffect(() => {
        const interval = setInterval(() => {
            setConnections(prev => prev.map(conn => {
                // Randomly simulate status changes to mimic a real backend
                const rand = Math.random();
                let newStatus: ConnectionHealthStatus = conn.status;
                if (conn.status === 'Disconnected' && rand > 0.8) newStatus = 'Connected';
                else if (conn.status === 'Connected' && rand > 0.95) newStatus = 'Refreshing';
                else if (conn.status === 'Refreshing') newStatus = 'Connected';
                else if (conn.status === 'Connected' && rand < 0.02) newStatus = 'Error';
                else if (conn.status === 'Error' && rand > 0.5) newStatus = 'Disconnected';
                
                return { ...conn, status: newStatus, lastChecked: new Date().toISOString() };
            }));
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);
    
    const securityGrade = "C-";
    const automationReadiness = "35%";

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
                        <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-400" />{t('systemStatus.securityGrade')}</CardTitle>
                    </CardHeader>
                    <div className="p-4 text-center">
                        <p className="text-5xl font-bold text-red-400">{securityGrade}</p>
                        <p className="text-sm text-slate-400 mt-2">{t('systemStatus.securityGradeDescription')}</p>
                    </div>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Server className="h-5 w-5 mr-2 text-yellow-400" />{t('systemStatus.automationReadiness')}</CardTitle>
                    </CardHeader>
                    <div className="p-4 text-center">
                        <p className="text-5xl font-bold text-yellow-400">{automationReadiness}</p>
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
                                <div className="flex items-center">
                                    <PlatformLogo platformId={conn.id} className="w-6 h-6 mr-3" />
                                    <span className="font-medium text-slate-200">{t(conn.nameKey)}</span>
                                </div>
                                <ConnectionStatusIndicator status={conn.status} />
                                <span className="text-right text-sm text-slate-500">{new Date(conn.lastChecked).toLocaleTimeString()}</span>
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
                        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('systemStatus.rec1Title')}</h4>
                            <p className="text-sm text-slate-400">{t('systemStatus.rec1Description')}</p>
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