import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function Landing() {
  return (
    <motion.div {...pageTransition} className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
        AI Adaptive Learning <br className="hidden md:block" /> Intelligence Platform
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
        Transform your learning experience with personalized AI mentoring, dynamic quizzes, and deep analytics. SkillLens adapts to you.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to={ROUTES.DASHBOARD}>
          <Button size="lg" className="w-full sm:w-auto font-semibold">Get Started</Button>
        </Link>
        <Link to={ROUTES.HOME}>
          <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">Learn More</Button>
        </Link>
      </div>
    </motion.div>
  )
}
