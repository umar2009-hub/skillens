import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart as PieChartIcon } from 'lucide-react';

export function Analytics() {
  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Metric {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
          <PieChartIcon size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Data Available Yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Complete quizzes and interact with the AI mentor to populate your analytics dashboard.
        </p>
      </Card>
    </motion.div>
  )
}
