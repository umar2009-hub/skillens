import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div className="w-full">
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={cn("px-4 py-2 font-medium text-sm transition-colors border-b-2", active === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs[active]?.content}
      </div>
    </div>
  )
}
