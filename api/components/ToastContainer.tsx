
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNotifier } from '../contexts/NotificationContext';
import { Toast } from './common/Toast';

export const ToastContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotifier();

    return (
        <div className="fixed inset-0 z-[100] flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <Toast
                            key={notification.id}
                            notification={notification}
                            onDismiss={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
