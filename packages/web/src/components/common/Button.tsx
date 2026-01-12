import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'bumble';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-h-[44px] touch-manipulation';

    const variants = {
        primary: 'bg-black text-white font-bold hover:bg-gray-900 shadow-md hover:shadow-lg hover:scale-[1.02] focus:ring-black rounded-xl',
        secondary: 'bg-bumble-yellow text-bumble-black font-bold hover:bg-yellow-400 shadow-sm hover:shadow-md hover:scale-[1.01] focus:ring-yellow-500 rounded-xl',
        outline: 'border-2 border-black dark:border-white bg-transparent text-black dark:text-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black focus:ring-black dark:focus:ring-white rounded-xl',
        danger: 'bg-red-600 text-white font-bold hover:bg-red-700 focus:ring-red-500 rounded-xl',
        ghost: 'bg-transparent text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white focus:ring-gray-500 rounded-xl',
        bumble: 'bg-black text-white font-bold hover:bg-gray-900 shadow-md hover:shadow-lg hover:scale-[1.02] focus:ring-black rounded-xl', // Keep for backward compatibility
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
