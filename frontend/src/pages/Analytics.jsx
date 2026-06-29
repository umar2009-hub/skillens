import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Clock, Brain } from 'lucide-react';

const weeklyData = [
  { name: 'Mon', score: 65 }, { name: 'Tue', score: 72 }, { name: 'Wed', score: 85 },
  { name: 'Thu', score: 78 }, { name: 'Fri', score: 90 }, { name: 'Sat', score: 95 }, { name: 'Sun', score: 88 },
];

const topicData = [
  { name: 'React', value: 400 },
  { name: 'Node.js', value: 300 },
  { name: 'Python', value: 300 },
  { name: 'SQL', value: 200 },
];
const COLORS = ['hsl(var(--primary))', '#8b5cf6', '#10b981', '#f59e0b'];

export function Analytics() {
  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Analytics Overview</h2>
          <p className="text-muted-foreground">Deep insights into your learning patterns and progress.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Average Score", value: "85%", icon: Target, trend: "+5%", color: "text-blue-400" },
          { title: "Time Spent", value: "124h", icon: Clock, trend: "+12h", color: "text-green-400" },
          { title: "Topics Mastered", value: "24", icon: Brain, trend: "+3", color: "text-purple-400" },
          { title: "Learning Rate", value: "Fast", icon: TrendingUp, trend: "Top 10%", color: "text-orange-400" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:border-primary/30">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{stat.trend}</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Performance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Your average quiz scores over the past 7 days.</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--background))", strokeWidth: 2 }} activeDot={{ r: 8, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Topic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Focus</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of your study time.</p>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={topicData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {topicData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Heatmap placeholder */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Activity Intensity</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
