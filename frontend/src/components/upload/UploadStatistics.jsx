import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, Files, Lightbulb, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <Card className="p-4 bg-background/40 border-white/5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary/70" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-mono">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
};

export function UploadStatistics() {
  const { user } = useAuth();
  const [docCount, setDocCount] = useState('--');
  const [pageCount, setPageCount] = useState('--');

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('page_count')
          .eq('user_id', user.id);

        if (!error && data) {
          setDocCount(data.length);
          const totalPages = data.reduce((sum, doc) => sum + (doc.page_count || 0), 0);
          setPageCount(totalPages);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, [user]);

  const stats = [
    { label: 'PDFs Uploaded', value: docCount, icon: FileText },
    { label: 'Pages Processed', value: pageCount, icon: Files },
    { label: 'AI Notes Generated', value: '--', icon: Lightbulb },
    { label: 'Study Hours Saved', value: '--', icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
