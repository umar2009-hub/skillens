import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <LayoutDashboard size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Welcome to your Dashboard</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Get an overview of your learning progress, recent quizzes, and AI interactions. Upload a document to start learning.
          </p>
        </Card>
      </div>
    </motion.div>
  )
}
