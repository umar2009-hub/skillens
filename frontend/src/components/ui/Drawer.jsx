import React from 'react';
import { cn } from '@/utils/cn';

export function Drawer({ isOpen, onClose, children, side = 'right' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "fixed z-50 h-full bg-background shadow-lg transition-transform",
        side === 'right' ? "right-0 w-80" : "left-0 w-80"
      )}>
        <button onClick={onClose} className="absolute right-4 top-4">X</button>
        <div className="p-6 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
