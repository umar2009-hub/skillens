import React from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-card/60 text-card-foreground shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:bg-card/80", className)} {...props} />
  )
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
