import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function CoachMessage({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MessageSquare size={100} />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-primary" />
            <h3 className="font-bold text-white">AI Coach Message</h3>
          </div>
          <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
