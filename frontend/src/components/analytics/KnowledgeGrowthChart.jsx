import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function KnowledgeGrowthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
        <p className="text-muted-foreground text-sm">Complete quizzes to track growth</p>
      </div>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/5">
      <CardContent className="p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-6">Knowledge Growth (Accuracy)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`${value}%`, 'Accuracy']}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#000' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
