import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export function RevisionCalendar({ data }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/5">
      <CardContent className="p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">7-Day Outlook</h4>
        <div className="flex justify-between items-end h-32 gap-2">
          {data.map((day, i) => {
            const heightPct = Math.max((day.count / maxCount) * 100, 5); // min height 5%
            const isToday = i === 0;
            const dateObj = new Date(day.date);
            
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div 
                  className={`w-full rounded-t-md transition-all relative ${isToday ? 'bg-primary' : 'bg-white/20 group-hover:bg-primary/50'}`}
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                    {day.count} topics
                  </div>
                </div>
                <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
