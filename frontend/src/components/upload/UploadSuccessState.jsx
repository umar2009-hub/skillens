import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit3, Layers, HelpCircle, MessageSquare, PieChart, Clock, BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useDocumentSummary } from '@/hooks/useDocumentSummary';

const Confetti = () => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#10b981', '#3b82f6'];
    const newPieces = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
      duration: 1.5 + Math.random() * 1.5
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-4 rounded-sm"
          style={{ backgroundColor: p.color, left: `${p.x}%`, top: '-5%' }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ 
            y: '100vh', 
            rotate: p.rotation + 360,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

export function UploadSuccessState({ onReset, documentId }) {
  const navigate = useNavigate();
  const { summary, loading } = useDocumentSummary(documentId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto relative"
    >
      <Confetti />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl rounded-full" />
      
      <Card className="relative p-5 sm:p-8 md:p-10 bg-background/80 backdrop-blur-xl border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <Check size={32} strokeWidth={3} />
          </motion.div>
          <h3 className="text-3xl font-bold text-white mb-2">Analysis Complete</h3>
          <p className="text-muted-foreground text-lg">Your learning package is ready.</p>
        </div>

        {/* AI Summary Block */}
        {!loading && summary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 text-left space-y-6"
          >
            {/* Executive Summary */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <BrainCircuit size={64} />
              </div>
              <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Layers size={18} /> Executive Summary
              </h4>
              <p className="text-white/80 leading-relaxed relative z-10">
                {summary.executive_summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Study Time & Difficulty */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Learning Profile</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Clock size={16} className="text-blue-400" />
                      <span className="text-sm">Est. Study Time</span>
                    </div>
                    <span className="font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                      {summary.estimated_study_time?.hours}h {summary.estimated_study_time?.minutes}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <HelpCircle size={16} className="text-orange-400" />
                      <span className="text-sm">Difficulty</span>
                    </div>
                    <span className="font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                      {summary.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Key Topics Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.topics?.slice(0, 6).map((topic, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State for Summary */}
        {loading && (
          <div className="mb-10 text-center py-10">
             <div className="w-8 h-8 mx-auto border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
             <p className="text-muted-foreground text-sm">Fetching insights...</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
          <Button 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 text-base"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Continue to Dashboard
          </Button>
          {onReset && (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto h-12 px-8 text-base border-white/10 hover:bg-white/5"
              onClick={onReset}
            >
              Upload Another PDF
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
