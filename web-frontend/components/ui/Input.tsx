import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2 group w-full">
                {label && (
                    <label className="text-sm font-medium text-slate-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`w-full bg-white/5 border border-white/10 text-white rounded-md py-2 px-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none placeholder:text-slate-500 ${className}`}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

Input.displayName = 'Input';
