import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SkillLens</span>
          </Link>
          <div className="flex gap-4 items-center">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">Features</a>
            <Link to={ROUTES.DASHBOARD}>
              <Button size="sm" className="font-semibold shadow-primary/25">Open App</Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 py-12 bg-background/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="text-lg font-bold text-white">SkillLens</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">The AI Adaptive Learning Intelligence Platform.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://github.com/umar2009-hub/skillens/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Report an Issue</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SkillLens Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://github.com/umar2009-hub/skillens" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
