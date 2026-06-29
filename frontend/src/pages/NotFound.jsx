import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] aspect-square bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page not found</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link to={ROUTES.HOME}>
          <Button size="lg" className="px-8 shadow-primary/20">Go back home</Button>
        </Link>
      </motion.div>
    </div>
  )
}
