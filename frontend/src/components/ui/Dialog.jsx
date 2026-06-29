import React from 'react';

export function Dialog({ children, isOpen }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
