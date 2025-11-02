

import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
import type { Notification } from '../types';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString();
        const newNotification = { ...notification, id };
        setNotifications(prev => [newNotification, ...prev]);

        setTimeout(() => {
            removeNotification(id);
        }, notification.duration || 5000);
    }, [removeNotification]);

    const value = useMemo(() => ({ notifications, addNotification, removeNotification }), [notifications, addNotification, removeNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifier = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifier must be used within a NotificationProvider');
    }
    
    // Helper functions for different notification types
    return {
        ...context,
        success: (message: string) => context.addNotification({ message, type: 'success' }),
        error: (message: string) => context.addNotification({ message, type: 'error' }),
        info: (message: string) => context.addNotification({ message, type: 'info' }),
        warn: (message: string) => context.addNotification({ message, type: 'warning' }),
    };
};