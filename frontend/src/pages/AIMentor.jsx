import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AIMentor() {
  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-3xl font-bold tracking-tight">AI Mentor</h2>
      </div>
      <Card className="flex-1 flex flex-col overflow-hidden bg-card/50">
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">How can I help you learn today?</h3>
          <p className="text-muted-foreground max-w-sm">
            Ask questions about your uploaded documents or any topic you want to master.
          </p>
        </div>
        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2 relative">
            <Input className="flex-1 rounded-full px-6 h-12 bg-background border-muted" placeholder="Ask your AI Mentor anything..." />
            <Button size="lg" className="rounded-full w-12 h-12 p-0 flex items-center justify-center absolute right-0 shrink-0">
              <MessageSquare size={20} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
