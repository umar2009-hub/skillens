import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, TrendingDown, Target, Zap, Clock, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function QuizReport({ documentId, sessionId, getAnalytics }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError("Failed to generate AI analytics report");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [getAnalytics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <h3 className="text-2xl font-bold mb-2">Analyzing Your Session...</h3>
        <p className="text-muted-foreground">The AI is generating your personalized learning report.</p>
      </div>
    );
  }

  if (error || !analytics) {
    return <div className="text-red-500 text-center py-20">{error}</div>;
  }

  const { attempts, analytics: aiReport } = analytics;

  const total = attempts.length;
  const correct = attempts.filter(a => a.is_correct).length;
  const accuracy = Math.round((correct / total) * 100);
  const avgTime = Math.round(attempts.reduce((acc, a) => acc + a.time_taken, 0) / total);

  // Group by difficulty
  const difficulties = attempts.reduce((acc, a) => {
    acc[a.difficulty] = (acc[a.difficulty] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-muted-foreground text-lg">{aiReport.motivational_feedback}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <Target className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-3xl font-bold">{accuracy}%</span>
          <span className="text-sm text-muted-foreground">Accuracy</span>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <Clock className="w-8 h-8 text-orange-500 mb-2" />
          <span className="text-3xl font-bold">{avgTime}s</span>
          <span className="text-sm text-muted-foreground">Avg Response Time</span>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <Zap className="w-8 h-8 text-purple-500 mb-2" />
          <span className="text-3xl font-bold">{aiReport.estimated_revision_time_minutes}m</span>
          <span className="text-sm text-muted-foreground">Est. Revision Time</span>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Strengths
          </h3>
          <ul className="space-y-2">
            {aiReport.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-400/80 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" /> Weaknesses
          </h3>
          <ul className="space-y-2">
            {aiReport.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-red-400/80 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Topics to Revise */}
      <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" /> Learning Pattern & Recommendations
        </h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {aiReport.learning_pattern}
        </p>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {aiReport.confidence_analysis}
        </p>
        <div className="space-y-4">
          <h4 className="font-semibold text-white/90">Topics to Revise:</h4>
          <div className="flex flex-wrap gap-2">
            {aiReport.topics_to_revise.map((t, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
