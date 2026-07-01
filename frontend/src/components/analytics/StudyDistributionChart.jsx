import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export function StudyDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
        <p className="text-muted-foreground text-sm">Not enough data to calculate distribution</p>
      </div>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/5">
      <CardContent className="p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-6">Study Distribution</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="label"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
