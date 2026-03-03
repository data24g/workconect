import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
            outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500',
            ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
        };

        const sizes = {
            default: 'px-4 py-2.5 text-sm',
            sm: 'px-3 py-1.5 text-xs',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
