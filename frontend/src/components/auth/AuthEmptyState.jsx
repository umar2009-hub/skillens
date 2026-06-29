import React from 'react';
import { motion } from 'framer-motion';

export function AuthEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {Icon && <Icon size={24} />}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
