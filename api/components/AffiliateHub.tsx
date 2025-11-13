
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Button } from './common/Button';
import { useI18n } from '../../contexts/I18nContext';
import { logger } from './services/loggingService';
import { useNotifier } from '../../contexts/NotificationContext';
import { checkUrlStatus } from './services/geminiService';
import { platforms, LOCAL_STORAGE_KEY } from './data/connections';
import type { AccountConnection } from '../../types';
import { RefreshCw } from './LucideIcons';

const AFFILIATE_REPORT_KEY = 'affiliate_hub_report_v4';
const AFFILIATE_LAST_CHECK_KEY = 'affiliate_hub_last_check_v4';

export const AffiliateHub: React.FC = () => {
    const { t } = useI18n();
    const notifier = useNotifier();
    const [report, setReport] = React.useState<string | null>(null);
    const [lastCheck, setLastCheck] = React.useState<string | null>(null);
    const [isChecking, setIsChecking] = React.useState(false);

    const handleCheckStatus = React.useCallback(async () => {
        setIsChecking(true);
        logger.info("Starting Affiliate & Social Hub status check.");

        let reportContent = `📊 Báo cáo Affiliate & Social Media Hub hàng ngày\n\n`;
        
        const affiliatePlatforms = platforms.filter(p => 
            p.categoryKey.includes('affiliate') || p.categoryKey.includes('social')
        );

        let allConnections: AccountConnection[] = [];
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                allConnections = JSON.parse(stored);
            }
        } catch (e) {
            logger.error("Failed to parse connections for affiliate check", { error: e });
        }
        
        for (const p of affiliatePlatforms) {
            try {
                const urlResponse = await checkUrlStatus(p.signupUrl);
                let status = urlResponse.ok ? "✅ Hoạt động" : "⚠️ Lỗi / Thay đổi link";

                const isSocial = p.categoryKey.includes('social');
                if (isSocial) {
                    const platformConnection = allConnections.find(c => c.platformId === p.id);
                    const hasValidToken = platformConnection && Object.values(platformConnection.credentials).some(val => typeof val === 'string' && val.length > 10);
                    if (!hasValidToken) {
                        status += " | ❌ Token chưa thiết lập hoặc không hợp lệ";
                    }
                }
                reportContent += `${status}: ${t(p.nameKey)}\n`;
            } catch (e: any) {
                reportContent += `❌ ${t(p.nameKey)}: Không truy cập được (${e.message})\n`;
            }
        }

        const now = new Date();
        setReport(reportContent);
        setLastCheck(now.toISOString());
        localStorage.setItem(AFFILIATE_REPORT_KEY, reportContent);
        localStorage.setItem(AFFILIATE_LAST_CHECK_KEY, now.getTime().toString());
        
        notifier.success(t('notifications.affiliateCheckComplete'));
        logger.info("Affiliate Hub check finished.", { report: reportContent });

        // --- Send notifications ---
        const telegramBotConnection = allConnections.find(c => c.platformId === 'telegram_bot');
        const adminEmailConnection = allConnections.find(c => c.platformId === 'admin_email');

        if (telegramBotConnection?.credentials.botToken && telegramBotConnection?.credentials.chatId) {
            try {
                await fetch(`https://api.telegram.org/bot${telegramBotConnection.credentials.botToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: telegramBotConnection.credentials.chatId,
                        text: reportContent,
                    }),
                });
                logger.info("Affiliate report sent to Telegram.");
            } catch (e) {
                logger.error("Failed to send affiliate report to Telegram.", { error: e });
            }
        }

        if (adminEmailConnection?.credentials.email) {
            logger.info(`Simulating email report sent to ${adminEmailConnection.credentials.email}.`);
            // In a real app, you would integrate an email service here.
        }

        setIsChecking(false);
    }, [t, notifier]);

    React.useEffect(() => {
        const savedReport = localStorage.getItem(AFFILIATE_REPORT_KEY);
        const savedLastCheck = localStorage.getItem(AFFILIATE_LAST_CHECK_KEY);
        if (savedReport) setReport(savedReport);
        if (savedLastCheck) {
            setLastCheck(new Date(parseInt(savedLastCheck)).toISOString());
        }

        const lastCheckTimestamp = parseInt(savedLastCheck || '0');
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - lastCheckTimestamp > oneDay) {
            handleCheckStatus();
        }
    }, [handleCheckStatus]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('connections.affiliateHubTitle')}</CardTitle>
                <CardDescription>{t('connections.affiliateHubDescription')}</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-4">
                <Button onClick={handleCheckStatus} isLoading={isChecking} icon={<RefreshCw className="h-4 w-4"/>}>
                    {isChecking ? t('connections.checking') : t('connections.runCheckNow')}
                </Button>
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('connections.lastReportTitle')}</h3>
                    <Card className="bg-gray-900/50 p-4">
                        {report ? (
                            <>
                                <p className="text-xs text-gray-500 mb-2">{t('connections.reportDate', { date: new Date(lastCheck || Date.now()).toLocaleString(t('localeCode')) })}</p>
                                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">{report}</pre>
                            </>
                        ) : (
                            <p className="text-gray-500">{t('connections.noReport')}</p>
                        )}
                    </Card>
                </div>
            </div>
        </Card>
    );
};
