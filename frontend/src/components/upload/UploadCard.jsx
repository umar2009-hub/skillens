import React from 'react';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { formatBytes } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';

export function UploadCard({ file, onRemove, status = 'ready' }) {
  const estTime = Math.max(5, Math.min(30, Math.floor(file.size / 100000)));

  // Determine badge colors based on status
  const badgeClasses = {
    ready: 'bg-white/10 text-white border-white/20',
    uploading: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    processing: 'bg-primary/10 text-primary border-primary/20 animate-pulse',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const badgeLabels = {
    ready: 'Ready for AI Processing',
    uploading: 'Uploading...',
    processing: 'AI Processing...',
    success: 'Completed',
    failed: 'Failed',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-background/50 border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="text-primary" size={24} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate pr-8">{file.name}</h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              <span>{formatBytes(file.size)}</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
              <span>Just now</span>
              {status === 'ready' && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                  <span>Est: ~{estTime} sec</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-medium tracking-wide ${badgeClasses[status]}`}>
            {badgeLabels[status]}
          </div>

          {status === 'ready' && (
            <button
              onClick={() => onRemove(file)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
