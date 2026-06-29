import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, BrainCircuit, Shield } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden selection:bg-primary/30">
      
      {/* Left Side: Brand & Features (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-[#050505] border-r border-white/5">
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/40 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/40 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            S
          </div>
          <Link to={ROUTES.HOME} className="text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
            SkillLens
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-md mt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight mb-4">
              Unlock Your Learning Potential
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join the next generation of learners using AI to adapt, improve, and master new skills faster than ever before.
            </p>
          </motion.div>

          <div className="space-y-6 pt-8">
             {[
               { icon: BrainCircuit, title: "AI-Powered Paths", desc: "Dynamic curriculum that adapts to you." },
               { icon: Zap, title: "Accelerated Growth", desc: "Identify and conquer your weak points." },
               { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and safe." }
             ].map((feature, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, x: -20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                 className="flex items-start gap-4"
               >
                 <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-primary shrink-0">
                   <feature.icon size={20} />
                 </div>
                 <div>
                   <h3 className="text-white font-medium">{feature.title}</h3>
                   <p className="text-sm text-muted-foreground">{feature.desc}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} SkillLens Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative min-h-[100dvh] md:min-h-screen">
        
        {/* Subtle Grid / Noise */}
        <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50" />
        
        {/* Floating Blobs for right side */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
        </div>

        {/* Mobile Header (Hidden on desktop) */}
        <div className="md:hidden absolute top-6 left-6 z-20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
            S
          </div>
          <Link to={ROUTES.HOME} className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
            SkillLens
          </Link>
        </div>

        {/* Auth Content Area */}
        <div className="w-full max-w-md relative z-10">
           <Outlet />
        </div>

      </div>
    </div>
  )
}
