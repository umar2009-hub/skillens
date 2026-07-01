import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { PersonalAIMentor } from '@/components/document/PersonalAIMentor';

export function AIMentor() {
  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">AI Mentor</h2>
          <p className="text-muted-foreground text-sm">Your personal tutor, available 24/7. Powered by your global Learning DNA.</p>
        </div>
      </div>
      
      <div className="flex-1 w-full relative z-10">
        <PersonalAIMentor documentId="global" fullHeight={true} />
      </div>
    </motion.div>
  )
}
