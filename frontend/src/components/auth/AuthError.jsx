import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthError({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 overflow-hidden"
        >
          <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-red-200/90 leading-relaxed">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
