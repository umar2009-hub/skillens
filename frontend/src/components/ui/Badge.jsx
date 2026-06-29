import React from 'react';
import { cn } from '@/utils/cn';

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md",
      {
        'border-transparent bg-primary/20 text-primary-foreground shadow-sm shadow-primary/20': variant === 'default',
        'border-transparent bg-secondary/50 text-secondary-foreground': variant === 'secondary',
        'border-transparent bg-destructive/20 text-destructive-foreground': variant === 'destructive',
        'border-white/10 text-foreground': variant === 'outline',
      },
      className
    )} {...props} />
  )
}
