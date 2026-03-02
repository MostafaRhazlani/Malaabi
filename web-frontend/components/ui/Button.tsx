import React from 'react';
import { RiLoader4Line } from '@remixicon/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

export function Button({ isLoading, children, className = '', ...props }: ButtonProps) {
    return (
        <button
            className={`w-full relative group overflow-hidden cursor-pointer bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2 rounded-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <RiLoader4Line className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                        {children}
                    </>
                ) : (
                    children
                )}
            </span>
        </button>
    );
}
