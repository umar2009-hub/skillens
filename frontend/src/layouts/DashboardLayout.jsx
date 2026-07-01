import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, MessageSquare, PieChart, BrainCircuit, Settings, LogOut, ChevronRight, Library, CalendarDays, Menu, X, Bell, User, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activity.service';

const navigationGroups = [
  {
    label: 'Main',
    links: [
      { icon: LayoutDashboard, label: 'Dashboard', to: ROUTES.DASHBOARD },
    ]
  },
  {
    label: 'Learning',
    links: [
      { icon: Upload, label: 'Upload Document', to: ROUTES.UPLOAD },
      { icon: Library, label: 'My Documents', to: ROUTES.DOCUMENTS },
      { icon: BrainCircuit, label: 'Quiz', to: ROUTES.QUIZ },
    ]
  },
  {
    label: 'Insights',
    links: [
      { icon: CalendarDays, label: 'Revision Planner', to: ROUTES.REVISION },
      { icon: PieChart, label: 'Analytics', to: ROUTES.ANALYTICS },
      { icon: MessageSquare, label: 'AI Mentor', to: ROUTES.MENTOR },
    ]
  }
];

// Reusable Hook for clicking outside
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function DashboardLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const notifRef = useRef();
  const userRef = useRef();

  useOnClickOutside(notifRef, () => setShowNotifications(false));
  useOnClickOutside(userRef, () => setShowUserMenu(false));

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      const data = await activityService.getRecentActivity();
      setActivities(data);
      setLoadingActivities(false);
    };
    fetchActivities();
  }, []);

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SkillLens</span>
        </Link>
        <button 
          className="md:hidden text-muted-foreground hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 no-scrollbar">
        {navigationGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="px-2 mb-1 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">{group.label}</div>
            {group.links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} className="relative group block">
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
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl hidden md:flex flex-col relative z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0a0a0a] border-r border-white/10 flex flex-col z-50 shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative h-full">
        <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="text-sm font-medium text-white capitalize hidden sm:block">
              {(() => {
                const parts = location.pathname.split('/').filter(Boolean);
                const lastPart = parts.pop() || 'Dashboard';
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(lastPart)) return 'Document Details';
                return lastPart.replace(/-/g, ' ');
              })()}
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                {activities.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>}
                <Bell size={16} className="text-muted-foreground" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">Notifications</span>
                      {activities.length > 0 && <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{activities.length} New</span>}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                      {loadingActivities ? (
                        <div className="p-8 flex justify-center">
                          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : activities.length > 0 ? (
                        <div className="flex flex-col">
                          {activities.map((act) => (
                            <Link 
                              key={act.id} 
                              to={act.link}
                              onClick={() => setShowNotifications(false)}
                              className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex gap-3 group"
                            >
                              <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                              <div>
                                <p className="text-sm font-medium text-white mb-0.5 group-hover:text-primary transition-colors">{act.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{act.message}</p>
                                <span className="text-[10px] text-muted-foreground/60 mt-1 block">{new Date(act.timestamp).toLocaleDateString()}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center">
                          <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-50" />
                          <p className="text-sm font-medium text-white">You're all caught up.</p>
                          <p className="text-xs text-muted-foreground mt-1">No recent learning activity.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-medium text-sm cursor-pointer shadow-sm ring-2 ring-background hover:ring-white/20 transition-all"
              >
                {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link onClick={() => setShowUserMenu(false)} to={ROUTES.SETTINGS} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <User size={16} /> Profile
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1">
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
