import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, MessageSquare, PieChart, BrainCircuit, Settings, LogOut } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-md hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-lg font-bold text-primary">SkillLens</span>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className={cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors", isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground text-muted-foreground")}>
                <Icon size={18} />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link to={ROUTES.SETTINGS} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <button className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-red-400 hover:bg-red-500/10">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <h1 className="text-sm font-medium md:hidden">SkillLens</h1>
          <div className="flex items-center gap-4 ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
              U
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
