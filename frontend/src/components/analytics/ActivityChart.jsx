import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function ActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
        <p className="text-muted-foreground text-sm">No activity data yet</p>
      </div>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/5">
      <CardContent className="p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-6">Recent Activity</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
