import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-bold text-primary mb-2">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full px-4 py-3 border rounded-xl bg-secondary border-default focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-primary transition-all text-sm text-primary ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
