import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Brain, FileText, LayoutList, Layers, HelpCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIConfidencePanel({ isProcessing, realStats }) {
  // Counters for simulated numbers
  const [stats, setStats] = useState({
    pages: 0,
    concepts: 0,
    topics: 0,
    definitions: 0,
    flashcards: 0,
    questions: 0,
    confidence: 0
  });

  useEffect(() => {
    if (!isProcessing) return;

    const actualPages = realStats?.pageCount || 15;

    // Simulate increasing numbers
    const interval = setInterval(() => {
      setStats(prev => ({
        pages: Math.min(actualPages, prev.pages + 1),
        concepts: Math.min(32, prev.concepts + Math.floor(Math.random() * 3)),
        topics: Math.min(8, prev.topics + (Math.random() > 0.7 ? 1 : 0)),
        definitions: Math.min(41, prev.definitions + Math.floor(Math.random() * 4)),
        flashcards: Math.min(58, prev.flashcards + Math.floor(Math.random() * 5)),
        questions: Math.min(20, prev.questions + Math.floor(Math.random() * 2)),
        confidence: Math.min(98, prev.confidence + Math.floor(Math.random() * 8))
      }));
    }, 400);

    return () => clearInterval(interval);
  }, [isProcessing, realStats]);

  const items = [
    { label: 'Pages Detected', value: stats.pages, icon: FileText, target: realStats?.pageCount || 15 },
    { label: 'Words Analyzed', value: realStats ? Math.min(stats.pages * 300, realStats.wordCount) : stats.pages * 300, icon: Brain, target: realStats?.wordCount || 5000 },
    { label: 'Reading Time (m)', value: realStats?.estimatedReadingTime || 25, icon: LayoutList, target: realStats?.estimatedReadingTime || 25 },
    { label: 'Language', value: realStats?.language || 'English', icon: FileText, target: realStats?.language || 'English' },
    { label: 'Est. Flashcards', value: stats.flashcards, icon: Layers, target: 58 },
    { label: 'Quiz Questions', value: stats.questions, icon: HelpCircle, target: 20 },
  ];

  return (
    <Card className="p-6 bg-background/80 border-white/10 backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Activity className="text-purple-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Analysis Engine</h3>
          <p className="text-xs text-muted-foreground">Real-time processing metrics</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon size={14} className="opacity-70" />
              <span>{item.label}</span>
            </div>
            <motion.span 
              key={item.value}
              initial={{ scale: 1.2, color: '#6366f1' }}
              animate={{ scale: 1, color: '#fff' }}
              className="text-sm font-bold font-mono text-white"
            >
              {item.value}
            </motion.span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Processing Confidence</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{stats.confidence}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-400" 
            initial={{ width: 0 }}
            animate={{ width: `${stats.confidence}%` }}
            transition={{ type: "spring", bounce: 0 }}
          />
        </div>
      </div>
    </Card>
  );
}
