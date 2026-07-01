import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Target, TrendingDown, TrendingUp } from 'lucide-react';

export function TopicStrengthCard({ title, topics, type = 'strong' }) {
  const isStrong = type === 'strong';
  
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/5 h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          {isStrong ? <TrendingUp className="text-emerald-500" size={20} /> : <TrendingDown className="text-rose-500" size={20} />}
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        </div>
        
        {(!topics || topics.length === 0) ? (
          <div className="flex items-center justify-center py-8 border border-dashed border-white/10 rounded-xl">
            <p className="text-muted-foreground text-sm">Complete more quizzes to identify topics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={14} className={isStrong ? 'text-emerald-400' : 'text-rose-400'} />
                    <span className="font-medium text-white truncate max-w-[200px]" title={topic.topic}>
                      {topic.topic}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${isStrong ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Math.round(topic.score)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isStrong ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(Math.max(topic.score, 5), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
