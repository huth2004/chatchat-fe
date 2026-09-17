'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

export const cardVariants = cva(
  'rounded-3xl border transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none',
        glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/40 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/5',
        gradient: 'bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-100/50 dark:border-slate-800',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = ({ className, variant, padding, ...props }: CardProps) => {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />;
};