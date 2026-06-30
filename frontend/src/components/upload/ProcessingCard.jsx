import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Loader2, CheckCircle2, Clock, Activity, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProcessingCard({ docStats }) {
  const [elapsed, setElapsed] = useState(0);
  const [activityLog, setActivityLog] = useState([]);
  
  // Real stats mapped from backend
  const status = docStats?.status || 'uploading';
  const processingStage = docStats?.processing_stage || 'Uploading document...';
  const progress = docStats?.processing_progress || 0;

  // Realtime elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Activity Log Manager
  useEffect(() => {
    if (!status || !processingStage) return;

    setActivityLog(prev => {
      // Don't add duplicate stages consecutively
      if (prev.length > 0 && prev[prev.length - 1].stage === processingStage) {
        // If status changed to completed for the exact same stage name, update it
        if (prev[prev.length - 1].status !== status) {
          const newPrev = [...prev];
          if (status === 'completed' || status === 'failed' || status === 'summary_failed') {
            newPrev[newPrev.length - 1].status = status === 'completed' ? 'completed' : 'failed';
          }
          return newPrev;
        }
        return prev;
      }

      // Mark the previous one as completed if we moved to a new stage
      const updatedPrev = prev.map(item => 
        item.status === 'pending' ? { ...item, status: 'completed' } : item
      );

      // Add new stage
      const newItem = {
        id: Date.now(),
        stage: processingStage,
        status: (status === 'failed' || status === 'summary_failed') ? 'failed' : (status === 'completed' ? 'completed' : 'pending')
      };

      return [...updatedPrev, newItem];
    });
  }, [status, processingStage]);

  // Derived styling
  const isFailed = status === 'failed' || status === 'summary_failed';
  const isCompleted = status === 'completed';

  // Reassuring Toasts
  useEffect(() => {
    if (isCompleted || isFailed) {
      toast.dismiss('processing-toast');
      return;
    }

    const messages = [
      "Hang tight! Our AI is reading your document...",
      "Good things take time. We're structuring your knowledge.",
      "Almost there! Generating smart insights...",
      "Please be patient, we are organizing your study material.",
      "Deep diving into the core concepts...",
      "Reading every single word (so you don't have to!)..."
    ];

    let messageIndex = 0;
    let interval;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        toast(messages[messageIndex % messages.length], {
          icon: '💡',
          id: 'processing-toast',
          duration: 4000,
          style: {
            background: '#1a1a2e', // Premium dark background
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        });
        messageIndex++;
      }, 8000);
    }, 6000);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      toast.dismiss('processing-toast');
    };
  }, [isCompleted, isFailed]);

  return (
    <Card className="w-full bg-background/60 border-white/10 p-6 md:p-8 backdrop-blur-md overflow-hidden relative shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Main Status */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isFailed ? 'bg-red-500/10' : 'bg-primary/10'}`}>
              {isFailed ? (
                <Activity className="text-red-400" size={28} />
              ) : isCompleted ? (
                <CheckCircle2 className="text-emerald-400" size={28} />
              ) : (
                <Activity className="text-primary animate-pulse" size={28} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {isFailed ? 'Processing Failed' : 'AI Processing'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {processingStage}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-white">{progress}% Complete</span>
              <span className="text-muted-foreground font-mono flex items-center gap-1.5">
                <Clock size={14} />
                {formatTime(elapsed)} elapsed
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className={`h-full ${isFailed ? 'bg-red-500' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Activity Log */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
          <h4 className="text-sm font-medium text-white mb-5 flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            Recent Activity
          </h4>
          
          <div className="space-y-4 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {activityLog.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5">
                    {log.status === 'completed' ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : log.status === 'failed' ? (
                      <Activity size={16} className="text-red-400 shrink-0" />
                    ) : (
                      <Loader2 size={16} className="text-primary animate-spin shrink-0" />
                    )}
                  </div>
                  <span className={`text-sm leading-tight ${log.status === 'pending' ? 'text-white' : 'text-muted-foreground'}`}>
                    {log.stage}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </Card>
  );
}
