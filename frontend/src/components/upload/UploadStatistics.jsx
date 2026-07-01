import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, Files, Lightbulb, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <Card className="p-4 bg-background/40 border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary/70" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-mono">
          {value === '--' ? (
            <span className="opacity-50 animate-pulse text-xl">...</span>
          ) : (
            value
          )}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
};

export function UploadStatistics() {
  const { user } = useAuth();
  const [docCount, setDocCount] = useState('--');
  const [pageCount, setPageCount] = useState('--');
  const [topicsCount, setTopicsCount] = useState('--');
  const [cardsCount, setCardsCount] = useState('--');

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      
      try {
        const [docsRes, notesRes, flashcardsRes] = await Promise.all([
          supabase.from('documents').select('page_count').eq('user_id', user.id),
          supabase.from('document_notes').select('total_topics, sections').eq('user_id', user.id),
          supabase.from('document_flashcards').select('cards').eq('user_id', user.id),
        ]);

        if (!docsRes.error && docsRes.data) {
          setDocCount(docsRes.data.length);
          setPageCount(docsRes.data.reduce((sum, doc) => sum + (doc.page_count || 0), 0));
        } else {
          setDocCount(0);
          setPageCount(0);
        }

        if (!notesRes.error && notesRes.data) {
          const totalTopics = notesRes.data.reduce((sum, note) => {
             return sum + (note.total_topics || (note.sections?.length) || 0);
          }, 0);
          setTopicsCount(totalTopics);
        } else {
          setTopicsCount(0);
        }

        if (!flashcardsRes.error && flashcardsRes.data) {
          const totalCards = flashcardsRes.data.reduce((sum, flashcard) => {
             return sum + (flashcard.cards?.length || 0);
          }, 0);
          setCardsCount(totalCards);
        } else {
          setCardsCount(0);
        }
      } catch (err) {
        console.error('Error fetching upload stats:', err);
        setDocCount(0);
        setPageCount(0);
        setTopicsCount(0);
        setCardsCount(0);
      }
    }
    fetchStats();
  }, [user]);

  const stats = [
    { label: 'PDFs Uploaded', value: docCount, icon: FileText },
    { label: 'Pages Processed', value: pageCount, icon: Files },
    { label: 'AI Topics Extracted', value: topicsCount, icon: Lightbulb },
    { label: 'Flashcards Generated', value: cardsCount, icon: Layers },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
