import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="w-full border rounded-md">
      {items.map((item, i) => (
        <div key={i} className="border-b last:border-b-0">
          <button
            className="flex w-full justify-between items-center py-4 px-5 font-medium hover:underline"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.title}
            <span>{openIndex === i ? '-' : '+'}</span>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-muted-foreground text-sm">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
