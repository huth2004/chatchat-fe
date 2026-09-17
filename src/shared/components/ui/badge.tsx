"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const badgeVariants = cva(
  "items-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none",
        secondary:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        success:
          "bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50",
        warning:
          "bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
        error:
          "bg-red-50 text-red-600 border border-red-200/60 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[10px] rounded-full",
        md: "px-3 py-1 text-xs rounded-full",
        lg: "px-4 py-1.5 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
};
