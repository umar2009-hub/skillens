import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Sparkles, Edit3, Layout, HelpCircle, PieChart, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const steps = [
  { id: 'upload', label: 'Uploading', icon: UploadCloud },
  { id: 'read', label: 'Reading PDF', icon: FileText },
  { id: 'extract', label: 'Extracting Concepts', icon: Sparkles },
  { id: 'notes', label: 'Generating Notes', icon: Edit3 },
  { id: 'flashcards', label: 'Creating Flashcards', icon: Layout },
  { id: 'quiz', label: 'Creating Quiz', icon: HelpCircle },
  { id: 'analytics', label: 'Preparing Analytics', icon: PieChart },
  { id: 'mentor', label: 'Preparing AI Mentor', icon: MessageSquare },
  { id: 'ready', label: 'Ready', icon: CheckCircle2 }
];

export function ProcessingTimeline({ currentStepIndex, liveMessage }) {
  return (
    <Card className="p-6 md:p-8 w-full bg-background/80 border-white/10 backdrop-blur-md h-full">
      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/10" />
        
        {/* Animated fill line */}
        <motion.div 
          className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-primary to-purple-500"
          initial={{ height: '0%' }}
          animate={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <div className="space-y-6 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-start md:items-center gap-6">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                    isCompleted 
                      ? 'bg-primary border-primary text-white scale-95' 
                      : isCurrent 
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110' 
                        : 'bg-background border-white/20 text-muted-foreground'
                  }`}
                >
                  <Icon size={20} className={isCurrent ? "animate-pulse" : ""} />
                </div>
                
                <div className="flex-1 pt-1 md:pt-0">
                  <h4 className={`text-base font-medium transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'text-white' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </h4>
                  <AnimatePresence mode="wait">
                    {isCurrent && liveMessage && (
                      <motion.div 
                        key={liveMessage}
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-primary/80 mt-1 font-medium"
                      >
                        {liveMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
