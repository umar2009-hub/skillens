import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, Files, Lightbulb, Clock } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    setTimeout(() => {
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
  }, [value, delay]);

  return (
    <Card className="p-4 bg-background/40 border-white/5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary/70" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-mono">{count}{label.includes('Hours') && count > 0 ? '+' : ''}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
};

export function UploadStatistics() {
  const stats = [
    { label: 'PDFs Uploaded', value: 12, icon: FileText, delay: 0 },
    { label: 'Pages Processed', value: 345, icon: Files, delay: 200 },
    { label: 'AI Notes Generated', value: 89, icon: Lightbulb, delay: 400 },
    { label: 'Study Hours Saved', value: 45, icon: Clock, delay: 600 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
