import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LayoutDashboard, Flame, BookOpen, BrainCircuit, Clock, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Dummy Data
const dnaData = [
  { subject: 'Math', A: 120, fullMark: 150 },
  { subject: 'Science', A: 98, fullMark: 150 },
  { subject: 'History', A: 86, fullMark: 150 },
  { subject: 'CompSci', A: 140, fullMark: 150 },
  { subject: 'Art', A: 85, fullMark: 150 },
  { subject: 'Literature', A: 65, fullMark: 150 },
];

const activityData = [
  { name: 'Mon', hours: 2 },
  { name: 'Tue', hours: 3 },
  { name: 'Wed', hours: 1 },
  { name: 'Thu', hours: 4 },
  { name: 'Fri', hours: 2 },
  { name: 'Sat', hours: 5 },
  { name: 'Sun', hours: 3 },
];

const recentTasks = [
  { title: "React Context API Quiz", score: "90%", time: "2 hours ago" },
  { title: "Uploaded: Machine Learning Fundamentals.pdf", type: "document", time: "5 hours ago" },
  { title: "Chatted with AI Mentor about Neural Networks", type: "chat", time: "Yesterday" },
];

export function Dashboard() {
  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back, Alex!</h2>
          <p className="text-muted-foreground">Here's what's happening with your learning journey today.</p>
        </div>
        <Link to={ROUTES.UPLOAD} className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all bg-white text-black hover:bg-white/90 h-10 px-4 py-2 shadow-sm">
          Upload New Document
        </Link>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Learning Score", value: "847", change: "+12%", icon: LayoutDashboard, color: "text-blue-400" },
          { title: "Study Streak", value: "12 Days", change: "+2 days", icon: Flame, color: "text-orange-400" },
          { title: "Quizzes Completed", value: "34", change: "8 this week", icon: BrainCircuit, color: "text-purple-400" },
          { title: "Study Hours", value: "48.5h", change: "+4.2h this week", icon: Clock, color: "text-green-400" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:border-primary/30 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</span>
                  <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Learning Activity Chart */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Learning Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Your study hours over the past week.</p>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                  itemStyle={{ color: '#fff' }} 
                />
                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning DNA Radar */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Learning DNA</CardTitle>
            <p className="text-sm text-muted-foreground">Your strengths across different subjects.</p>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dnaData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12 }} />
                <Radar name="Knowledge" dataKey="A" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {task.score ? <BrainCircuit size={18} className="text-purple-400" /> : task.type === 'document' ? <BookOpen size={18} className="text-blue-400" /> : <MessageSquare size={18} className="text-green-400" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.time}</p>
                  </div>
                  {task.score && <div className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{task.score}</div>}
                </div>
              ))}
            </div>
            <Link to={ROUTES.ANALYTICS} className="mt-6 flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all activity <ArrowRight size={16} className="ml-1" />
            </Link>
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Areas</CardTitle>
            <p className="text-sm text-muted-foreground">Topics that need your attention.</p>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[
                  { topic: "Asynchronous JavaScript", progress: 35 },
                  { topic: "React useEffect Dependencies", progress: 42 },
                  { topic: "Database Indexing", progress: 60 }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{item.topic}</span>
                      <span className="text-muted-foreground">{item.progress}% mastery</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
             </div>
             <Link to={ROUTES.QUIZ} className="mt-8 flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full justify-center p-3 rounded-lg bg-primary/10 hover:bg-primary/20">
               Generate Quiz on Weak Topics
             </Link>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  )
}
