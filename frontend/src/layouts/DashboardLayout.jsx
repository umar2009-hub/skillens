import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, MessageSquare, PieChart, BrainCircuit, Settings, LogOut, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', to: ROUTES.DASHBOARD },
  { icon: Upload, label: 'Upload', to: ROUTES.UPLOAD },
  { icon: MessageSquare, label: 'AI Mentor', to: ROUTES.MENTOR },
  { icon: PieChart, label: 'Analytics', to: ROUTES.ANALYTICS },
  { icon: BrainCircuit, label: 'Quiz', to: ROUTES.QUIZ },
];

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl hidden md:flex flex-col relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
              S
            </div>
            <span className="text-lg font-bold tracking-tight text-white">SkillLens</span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5">
          <div className="px-2 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Main Menu</div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className="relative group">
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/5"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors z-10",
                  isActive ? "text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}>
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={cn(isActive ? "text-primary" : "opacity-70 group-hover:opacity-100 transition-opacity")} />
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </div>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/5 flex flex-col gap-1.5">
          <Link to={ROUTES.SETTINGS} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-white/5 hover:text-white">
            <Settings size={18} className="opacity-70" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={18} className="opacity-70" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative">
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium md:hidden text-white">SkillLens</h1>
            <div className="hidden md:block text-sm font-medium text-muted-foreground capitalize">
              {location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-medium text-sm cursor-pointer shadow-sm ring-2 ring-background hover:ring-white/20 transition-all">
              U
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
