import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../hooks/useI18n';
import { logger } from '../services/loggingService';
import type { LogEntry } from '../types';
import { ShieldCheck, HardDriveDownload, Server, AlertTriangle } from './LucideIcons';

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

export const TechnicalAudit: React.FC = () => {
    const { t } = useI18n();
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const unsubscribe = logger.subscribe(setLogs);
        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, []);
    
    const securityGrade = "C-";
    const automationReadiness = "35%";

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="text-center !p-6">
                    <CardTitle className="text-2xl">{t('technicalAudit.title')}</CardTitle>
                    <CardDescription>{t('technicalAudit.description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-400" />{t('technicalAudit.securityGrade')}</CardTitle>
                    </CardHeader>
                    <div className="p-4 text-center">
                        <p className="text-5xl font-bold text-red-400">{securityGrade}</p>
                        <p className="text-sm text-slate-400 mt-2">{t('technicalAudit.securityGradeDescription')}</p>
                    </div>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Server className="h-5 w-5 mr-2 text-yellow-400" />{t('technicalAudit.automationReadiness')}</CardTitle>
                    </CardHeader>
                    <div className="p-4 text-center">
                        <p className="text-5xl font-bold text-yellow-400">{automationReadiness}</p>
                         <p className="text-sm text-slate-400 mt-2">{t('technicalAudit.automationReadinessDescription')}</p>
                    </div>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('technicalAudit.recommendationsTitle')}</CardTitle>
                    <CardDescription>{t('technicalAudit.recommendationsDescription')}</CardDescription>
                </CardHeader>
                <ul className="p-4 space-y-3">
                    <li className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('technicalAudit.rec1Title')}</h4>
                            <p className="text-sm text-slate-400">{t('technicalAudit.rec1Description')}</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <Server className="h-5 w-5 mr-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('technicalAudit.rec2Title')}</h4>
                            <p className="text-sm text-slate-400">{t('technicalAudit.rec2Description')}</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <ShieldCheck className="h-5 w-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-200">{t('technicalAudit.rec3Title')}</h4>
                            <p className="text-sm text-slate-400">{t('technicalAudit.rec3Description')}</p>
                        </div>
                    </li>
                </ul>
            </Card>

            <Card className="max-h-[600px] flex flex-col">
                <CardHeader className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t('technicalAudit.systemLogTitle')}</CardTitle>
                        <CardDescription>{t('technicalAudit.systemLogDescription')}</CardDescription>
                    </div>
                    <Button variant="secondary" onClick={() => logger.downloadLogs()} icon={<HardDriveDownload className="h-4 w-4"/>}>
                        {t('technicalAudit.downloadLogs')}
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
                        <p className="text-slate-500 text-center py-8">{t('technicalAudit.noLogs')}</p>
                    )}
                </div>
            </Card>

        </div>
    );
};
