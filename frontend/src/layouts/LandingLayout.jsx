import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">SkillLens</Link>
          <div className="flex gap-4">
            <Link to={ROUTES.DASHBOARD} className="text-sm font-medium hover:text-primary transition-colors">Go to App</Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SkillLens. All rights reserved.
      </footer>
    </div>
  )
}
