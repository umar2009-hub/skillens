import React from 'react';
import { motion } from 'framer-motion';
import { Ghost } from 'lucide-react';

export function EmptyState({ icon: Icon = Ghost, title = "No Data Found", description = "We couldn't find any data to display here.", action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 md:p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5"
    >
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </motion.div>
  );
}
