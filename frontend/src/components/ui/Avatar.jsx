import React from 'react';
import { cn } from '@/utils/cn';

export const Avatar = React.forwardRef(({ className, src, fallback, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>
      {src ? (
        <img className="aspect-square h-full w-full object-cover" src={src} alt="avatar" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          <span className="text-sm font-medium">{fallback || '?'}</span>
        </div>
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"
