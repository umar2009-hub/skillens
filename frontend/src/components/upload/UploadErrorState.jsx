import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function UploadErrorState({ error, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="text-red-400" size={16} />
          </div>
          <p className="text-sm text-red-200/90 flex-1">{error}</p>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-red-400/70 hover:text-red-400 p-1"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
