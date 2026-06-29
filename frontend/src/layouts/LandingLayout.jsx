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
            <Link to={ROUTES.HOME} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">Features</Link>
            <Link to={ROUTES.HOME} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">Pricing</Link>
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
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="text-lg font-bold text-white">SkillLens</span>
            </div>
            <p className="text-sm text-muted-foreground">The AI Adaptive Learning Intelligence Platform.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Features</li>
              <li>Integrations</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} SkillLens Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
