
import * as React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from './LucideIcons';

interface ClockState {
    id: number;
    label: string;
    timezone: string;
    color: 'cyan' | 'pink' | 'green' | 'yellow';
}

const initialClocks: ClockState[] = [
    { id: 1, label: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, color: 'cyan' },
    { id: 2, label: 'New York', timezone: 'America/New_York', color: 'pink' },
    { id: 3, label: 'London', timezone: 'Europe/London', color: 'green' },
    { id: 4, label: 'Tokyo', timezone: 'Asia/Tokyo', color: 'yellow' }
];

let timezones: string[] = [];
try {
    timezones = (Intl as any).supportedValuesOf('timeZone');
} catch (e) {
    console.warn("Intl.supportedValuesOf('timeZone') is not supported, using a fallback list.");
    timezones = [
        'UTC', 'GMT', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney'
    ];
}


export const WorldClock: React.FC = () => {
    const { t } = useI18n();
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [clocks, setClocks] = React.useState<ClockState[]>(initialClocks);
    const [isOpen, setIsOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleTimezoneChange = (id: number, newTimezone: string) => {
        setClocks(prevClocks =>
            prevClocks.map(clock =>
                clock.id === id ? { ...clock, timezone: newTimezone, label: newTimezone.split('/').pop()?.replace(/_/g, ' ') || newTimezone } : clock
            )
        );
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    };
     const headerTimeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const representativeClock = clocks[0];

    const colorClasses = {
        cyan: 'border-cyan-400',
        pink: 'border-pink-400',
        green: 'border-green-400',
        yellow: 'border-yellow-400',
    };
    
    const text3dClasses = {
        cyan: 'text-3d-cyan',
        pink: 'text-3d-pink',
        green: 'text-3d-green',
        yellow: 'text-3d-yellow',
    };

    return (
        <div ref={wrapperRef} className="relative hidden md:inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inner-shadow-box flex items-center space-x-2 bg-gray-800/30 px-3 py-1.5 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <p className={`font-mono text-2xl font-bold text-3d ${text3dClasses[representativeClock.color]}`}>
                    {currentTime.toLocaleTimeString(t('localeCode') || 'en-US', { ...headerTimeOptions, timeZone: representativeClock.timezone })}
                </p>
                <span className="text-xs text-gray-400">{representativeClock.label}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 10, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-[640px] glass-card rounded-xl shadow-2xl p-4 z-30"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {clocks.map(clock => {
                                const borderColor = colorClasses[clock.color];
                                return (
                                    <div key={clock.id} className={`bg-gray-900/50 p-3 rounded-lg border-l-4 ${borderColor} flex flex-col justify-between`}>
                                        <div>
                                            <p className="font-semibold text-gray-100">{clock.label}</p>
                                            <p className="font-mono text-3xl font-bold my-2 text-gray-100">
                                                {currentTime.toLocaleTimeString(t('localeCode') || 'en-US', { ...timeOptions, timeZone: clock.timezone })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {currentTime.toLocaleDateString(t('localeCode') || 'en-US', { ...dateOptions, timeZone: clock.timezone })}
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <select
                                                value={clock.timezone}
                                                onChange={(e) => handleTimezoneChange(clock.id, e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm pl-3 pr-8 py-1.5 text-xs text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            >
                                                {timezones.map(tz => (
                                                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
