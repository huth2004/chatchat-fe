'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

export const inputVariants = cva(
  'flex w-full rounded-2xl border bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/20 dark:border-slate-700 dark:focus:border-indigo-400 dark:focus:bg-slate-900',
        error:
          'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/50 dark:bg-rose-950/20 dark:text-rose-200',
        glass:
          'border-white/20 bg-white/60 backdrop-blur-md focus:bg-white/90 focus:ring-indigo-500/30 dark:border-slate-700/50 dark:bg-slate-800/60 dark:focus:bg-slate-800/90',
      },
      inputSize: {
        sm: 'h-9 px-3 text-xs rounded-xl',
        md: 'h-11 px-4 text-sm',
        lg: 'h-13 px-5 text-base rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, error, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, inputSize }),
              leftIcon && 'pl-10',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="px-1 text-xs font-medium text-rose-500 animate-slide-up">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';