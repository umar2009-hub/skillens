import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar, Target } from 'lucide-react';

export function UpcomingRevisionCard({ topic, upcomingDays, priority }) {
  const getPriorityColor = (p) => {
    switch (p) {
      case 'Critical': return 'text-rose-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/30 rounded-lg">
          <Target size={16} className={getPriorityColor(priority)} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-white truncate max-w-[180px]" title={topic}>{topic}</h4>
          <p className="text-xs text-muted-foreground">Priority: {priority}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-white/80">
        <Calendar size={12} />
        <span>In {upcomingDays} {upcomingDays === 1 ? 'day' : 'days'}</span>
      </div>
    </div>
  );
}
