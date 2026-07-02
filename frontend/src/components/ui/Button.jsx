import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? motion.div : motion.button;
  return (
    <Comp
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "select-none inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        {
          'bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:brightness-110': variant === 'primary',
          'bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary/100 backdrop-blur-md': variant === 'secondary',
          'border border-white/10 bg-background/50 shadow-sm hover:bg-white/5 hover:text-accent-foreground backdrop-blur-md': variant === 'outline',
          'hover:bg-white/5 hover:text-accent-foreground': variant === 'ghost',
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3 text-xs': size === 'sm',
          'h-12 rounded-xl px-8 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"
