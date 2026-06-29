import React from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthButton({ children, loading, disabled, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className="w-full"
    >
      <Button
        className="w-full relative overflow-hidden group"
        disabled={disabled || loading}
        {...props}
      >
        <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary">
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}
      </Button>
    </motion.div>
  );
}
