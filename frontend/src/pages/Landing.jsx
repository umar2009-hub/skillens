import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Brain, Zap, Target, BookOpen, ChevronRight, BarChart3, UploadCloud } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-blob pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[500px] aspect-square bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] aspect-square bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000 pointer-events-none" />

        <motion.div 
          className="relative z-10 max-w-4xl mx-auto glass-card p-8 md:p-16 rounded-[2rem] border border-white/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SkillLens 2.0 is now live
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Unlock your <br className="hidden md:block" />
            <span className="text-gradient-primary">learning potential</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your materials and let our AI create a personalized learning journey. 
            Instant notes, adaptive quizzes, and a 24/7 AI Mentor that actually understands you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.DASHBOARD} className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base group">
                Start Learning for Free
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full text-base">
                See How it Works
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to master any topic</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete suite of AI-powered tools designed to accelerate your learning and retention.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Mentor", desc: "Your personal tutor available 24/7. Ask questions and get deep insights on your exact materials." },
              { icon: Target, title: "Adaptive Quizzes", desc: "Test your knowledge with automatically generated quizzes that adapt to your weak points." },
              { icon: BarChart3, title: "Rich Analytics", desc: "Track your progress over time with beautiful, actionable insights into your learning DNA." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-8 rounded-2xl flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-black/20 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              From PDF to mastery in three simple steps.
            </p>
          </motion.div>

          <div className="space-y-12">
            {[
              { icon: UploadCloud, title: "Upload your materials", desc: "Drop your PDFs, slides, or documents into SkillLens. Our AI instantly analyzes the content." },
              { icon: Zap, title: "AI extracts knowledge", desc: "We automatically generate summaries, key concepts, and structured learning paths." },
              { icon: BookOpen, title: "Learn & Test", desc: "Chat with the AI mentor for clarifications and take adaptive quizzes to solidify your knowledge." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 glass-card p-6 md:p-8 rounded-2xl border border-white/5"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-xl shadow-lg shadow-black/50">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
                    {step.title}
                    <step.icon size={20} className="text-primary/70 hidden sm:block" />
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Features Showcase */}
      <section className="py-24 bg-background relative z-10 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp} className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Designed for <span className="text-primary">deep understanding</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                SkillLens doesn't just summarize text. It builds a comprehensive knowledge graph of your material, automatically identifying key concepts, generating adaptive flashcards, and testing your retention with intelligent quizzes.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Context-aware AI mentoring",
                  "Spaced repetition algorithms",
                  "Automated progress tracking",
                  "Beautiful, distraction-free interface"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-white font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <ChevronRight size={14} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-video rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl flex items-center justify-center group perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 mix-blend-overlay group-hover:opacity-50 transition-opacity duration-700" />
              {/* Animated UI Mockup elements */}
              <div className="relative z-10 w-3/4 h-3/4 border border-white/10 rounded-xl bg-background/80 backdrop-blur-md shadow-2xl p-6 flex flex-col gap-4 transform group-hover:-translate-y-2 group-hover:rotate-1 transition-all duration-500">
                <div className="w-1/3 h-4 bg-white/10 rounded-full animate-pulse" />
                <div className="w-full h-24 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <Brain className="text-primary/50 w-10 h-10 animate-bounce" />
                </div>
                <div className="flex gap-2 h-16">
                  <div className="w-1/2 bg-white/5 rounded-lg border border-white/5" />
                  <div className="w-1/2 bg-white/5 rounded-lg border border-white/5" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/30 blur-[50px] rounded-full" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/30 blur-[50px] rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Ready to transform how you learn?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of students and professionals using SkillLens to learn faster and retain more.
            </p>
            <Link to={ROUTES.DASHBOARD}>
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 shadow-primary/30">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
