import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed border-2 m-6 mt-0">
          <SettingsIcon size={32} className="mb-4 text-primary opacity-50" />
          <p>Settings options will be available here.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
