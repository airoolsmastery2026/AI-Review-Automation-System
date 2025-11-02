import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

interface ClockState {
    label: string;
    timezone: string;
    color: string;
}

const initialClocks: ClockState[] = [
    { label: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, color: 'text-cyan-400' },
    { label: 'New York', timezone: 'America/New_York', color: 'text-pink-400' },
    { label: 'London', timezone: 'Europe/London', color: 'text-green-400' },
    { label: 'Tokyo', timezone: 'Asia/Tokyo', color: 'text-yellow-400' }
];

export const WorldClock: React.FC = () => {
    const { t } = useI18n();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [clocks] = useState<ClockState[]>(initialClocks);

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    return (
        <div className="hidden md:flex items-center space-x-4 bg-gray-800/30 px-3 py-1.5 rounded-lg border border-gray-700/50">
            {clocks.map((clock, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{clock.label}</span>
                    <span className={`font-mono text-sm font-semibold ${clock.color}`}>
                        {currentTime.toLocaleTimeString(t('localeCode') || 'en-US', { ...timeOptions, timeZone: clock.timezone })}
                    </span>
                </div>
            ))}
        </div>
    );
};
