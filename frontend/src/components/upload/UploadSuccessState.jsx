import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit3, Layers, HelpCircle, MessageSquare, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const Confetti = () => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#10b981', '#3b82f6'];
    const newPieces = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // Keep more centered
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

const generatedFeatures = [
  { id: 'notes', label: 'Smart Notes', icon: Edit3 },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'mentor', label: 'AI Mentor', icon: MessageSquare },
  { id: 'analytics', label: 'Learning Analytics', icon: PieChart },
];

export function UploadSuccessState({ onReset }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto relative"
    >
      <Confetti />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl rounded-full" />
      
      <Card className="relative p-8 md:p-12 text-center bg-background/80 backdrop-blur-xl border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="w-20 h-20 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <Check size={40} strokeWidth={3} />
        </motion.div>
        
        <h3 className="text-3xl font-bold text-white mb-2">SkillLens understood your document.</h3>
        <p className="text-muted-foreground text-lg mb-10">
          Your learning package is ready.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {generatedFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium text-white/90 text-left">{feature.label}</span>
              </motion.div>
            )
          })}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 text-base"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Continue to Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-12 px-8 text-base border-white/10 hover:bg-white/5"
            onClick={onReset}
          >
            Upload Another PDF
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
