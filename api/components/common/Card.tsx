

import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    return (
        <div className={`glass-card rounded-lg shadow-lg ${className}`} {...props}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className='' }) => {
    return (
        <div className={`border-b border-gray-700 p-4 ${className}`}>
            {children}
        </div>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}
export const CardTitle: React.FC<CardTitleProps> = ({ children, className='' }) => {
    return (
        <h2 className={`text-lg font-semibold text-gray-100 ${className}`}>
            {children}
        </h2>
    );
};

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className='' }) => {
    return (
        <p className={`text-sm text-gray-400 mt-1 ${className}`}>
            {children}
        </p>
    );
};