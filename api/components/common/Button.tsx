


import * as React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    icon,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
        secondary: 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600',
        ghost: 'hover:bg-gray-700/60 text-gray-300',
    };

    const sizeClasses = {
        default: 'text-sm px-4 py-2',
        sm: 'text-xs px-3 py-1.5',
        lg: 'text-base px-8 py-3'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};