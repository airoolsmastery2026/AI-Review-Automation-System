
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from '../LucideIcons';
import type { Notification } from '../../types';

interface ToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const icons = {
    success: <CheckCircle className="h-6 w-6 text-green-400" />,
    error: <AlertTriangle className="h-6 w-6 text-red-400" />,
    info: <Info className="h-6 w-6 text-blue-400" />,
    warning: <AlertTriangle className="h-6 w-6 text-yellow-400" />,
};

const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
    warning: 'border-yellow-500/30',
};

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`glass-card relative w-full max-w-sm rounded-lg shadow-2xl overflow-hidden border ${borderColors[notification.type]}`}
        >
            <div className="p-4 flex items-start">
                <div className="flex-shrink-0">
                    {icons[notification.type]}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-100">
                        {notification.message}
                    </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={() => onDismiss(notification.id)}
                        className="inline-flex rounded-md text-gray-400 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-800"
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
