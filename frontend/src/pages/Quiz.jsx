import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card } from '@/components/ui/Card';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Quiz() {
  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quizzes</h2>
      </div>
      <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
          <BrainCircuit size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h3>
        <p className="text-muted-foreground max-w-sm mb-8">
          Generate an AI-powered quiz based on your uploaded documents to see what you've learned.
        </p>
        <Button size="lg">Generate New Quiz</Button>
      </Card>
    </motion.div>
  )
}
