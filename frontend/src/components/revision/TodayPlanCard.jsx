import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle2, Clock, FastForward, Info } from 'lucide-react';

export function TodayPlanCard({ topic, priority, reason, time, onAction }) {
  const getPriorityColor = (p) => {
    switch (p) {
      case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/5 overflow-hidden transition-all hover:bg-black/60 group relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-white">{topic}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(priority)}`}>
              {priority}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
              <Clock size={12} />
              <span>~{time}m</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info size={14} className="text-primary/70" />
            <span>{reason}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onAction(topic, 'skipped')}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <FastForward size={16} />
            Skip
          </button>
          <button 
            onClick={() => onAction(topic, 'completed')}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <CheckCircle2 size={16} />
            Complete
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
