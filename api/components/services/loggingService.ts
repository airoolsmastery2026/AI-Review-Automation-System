
import type { LogEntry } from '../../../types';

class LoggingService {
    private logs: LogEntry[] = [];
    private subscribers: ((logs: LogEntry[]) => void)[] = [];
    private readonly maxLogs: number = 200;

    constructor() {
        this.info("Logging service initialized.");
    }

    private notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.getLogs()));
    }

    log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: object) {
        if (this.logs.length >= this.maxLogs) {
            this.logs.shift(); // Remove the oldest log to prevent memory leaks
        }
        this.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        });
        this.notifySubscribers();
    }

    info(message: string, context?: object) {
        this.log('INFO', message, context);
    }

    warn(message: string, context?: object) {
        this.log('WARN', message, context);
    }

    error(message: string, context?: object) {
        this.log('ERROR', message, context);
    }

    getLogs(): LogEntry[] {
        // Return a copy to prevent mutation, newest first
        return [...this.logs].reverse();
    }
    
    subscribe(callback: (logs: LogEntry[]) => void): () => void {
        this.subscribers.push(callback);
        // Immediately notify with current logs
        callback(this.getLogs()); 
        
        // Return an unsubscribe function
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    downloadLogs() {
        try {
            const dataStr = JSON.stringify(this.logs, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', `system_log_${new Date().toISOString().replace(/:/g, '-')}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.info("System logs downloaded successfully.");
        } catch (err) {
            this.error("Failed to download system logs.", { error: err });
        }
    }
}

// Singleton instance
export const logger = new LoggingService();
