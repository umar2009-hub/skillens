import React from 'react';

export function Tooltip({ children, content }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
        {content}
      </div>
    </div>
  )
}
