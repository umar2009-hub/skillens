import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { pageTransition } from '@/constants/animations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LayoutDashboard, Flame, BrainCircuit, Clock, ArrowRight, Target, CalendarDays, FileText, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ROUTES } from '@/constants/routes';
import { analyticsService } from '@/services/analytics.service';
import { revisionService } from '@/services/revision.service';
import { StatCard } from '@/components/analytics/StatCard';
import { TodayPlanCard } from '@/components/revision/TodayPlanCard';
import { EmptyState } from '@/components/ui/EmptyState';
import api from '@/services/api';
import { supabase } from '@/lib/supabase';

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    analytics: null,
    revision: null,
    documents: [],
    user: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const [analyticsData, revisionData, documentsRes] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        revisionService.getRevisionPlan().catch(() => null), // fail gracefully if no quizzes taken
        api.get('/documents').catch(() => ({ data: [] }))
      ]);

      setData({
        analytics: analyticsData,
        revision: revisionData,
        documents: documentsRes.data?.slice(0, 5) || [], // get latest 5
        user
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevisionAction = async (topic, action) => {
    try {
      setActionLoading(true);
      await revisionService.recordAction(topic, action);
      const newPlan = await revisionService.getRevisionPlan();
      setData(prev => ({ ...prev, revision: newPlan }));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading your intelligence hub...</p>
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Error Loading Dashboard" description={error} />;
  }

  const { analytics, revision, documents, user } = data;
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

  // Primary Action Logic
  let primaryAction = { label: 'Upload Document', to: ROUTES.UPLOAD, icon: ArrowRight };
  if (revision?.today?.length > 0) {
    primaryAction = { label: 'Start Revision', to: ROUTES.REVISION, icon: Target };
  } else if (documents.length > 0) {
    primaryAction = { label: 'Take a Quiz', to: ROUTES.QUIZ, icon: BrainCircuit };
  }

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back, {firstName}!</h2>
          <p className="text-muted-foreground">
            {revision?.today?.length > 0 
              ? `You have ${revision.today.length} topics scheduled for revision today.` 
              : "You're all caught up! Let's learn something new today."}
          </p>
        </div>
        <button 
          onClick={() => navigate(primaryAction.to)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-primary text-white hover:bg-primary/90 h-12 px-6 shadow-lg shadow-primary/20 gap-2"
        >
          {primaryAction.label}
          <primaryAction.icon size={18} />
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Average Accuracy" 
          value={`${analytics?.overview?.averageAccuracy || 0}%`} 
          icon={LayoutDashboard} 
          colorClass="text-blue-400 bg-blue-500/10 border-blue-500/20" 
        />
        <StatCard 
          title="Active Streak" 
          value={`${analytics?.overview?.currentStreak || 0} Days`} 
          icon={Flame} 
          colorClass="text-orange-400 bg-orange-500/10 border-orange-500/20" 
        />
        <StatCard 
          title="Quizzes Taken" 
          value={analytics?.overview?.totalQuizzes || 0} 
          icon={BrainCircuit} 
          colorClass="text-purple-400 bg-purple-500/10 border-purple-500/20" 
        />
        <StatCard 
          title="Study Time" 
          value={`${analytics?.overview?.totalStudyHours || 0}h`} 
          icon={Clock} 
          colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Today's Priority (Revision Planner Snippet) */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Today's Focus</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Highest priority revision topics.</p>
            </div>
            <Link to={ROUTES.REVISION} className="text-sm text-primary hover:underline flex items-center gap-1">
              View Planner <ChevronRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {revision?.today?.length > 0 ? (
              <div className={`space-y-3 mt-4 ${actionLoading ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                {revision.today.slice(0, 2).map((topic, i) => (
                  <TodayPlanCard 
                    key={i} 
                    topic={topic.topic} 
                    priority={topic.priority} 
                    reason={topic.reason} 
                    time={topic.averageTime}
                    onAction={handleRevisionAction}
                  />
                ))}
                {revision.today.length > 2 && (
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    + {revision.today.length - 2} more topics scheduled today
                  </p>
                )}
              </div>
            ) : (
               <EmptyState 
                 icon={Target} 
                 title="No Revisions Today" 
                 description="You have no topics scheduled for review today. Great job keeping up!" 
                 action={
                   <Link to={ROUTES.QUIZ} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-colors">
                     Take a Quiz
                   </Link>
                 }
               />
            )}
          </CardContent>
        </Card>

        {/* Learning DNA Radar */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Learning DNA Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Your core strengths based on quiz data.</p>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
            {analytics?.dna?.radarData?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.dna.radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: '#888888', fontSize: 11 }} />
                  <Radar name="Accuracy" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
               <EmptyState icon={BrainCircuit} title="Insufficient Data" description="Complete more quizzes to unlock your Learning DNA snapshot." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Link to={ROUTES.DOCUMENTS} className="text-sm text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc, i) => (
                  <Link key={i} to={`/documents/${doc.id}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none text-white truncate">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState 
                 icon={FileText} 
                 title="No Documents" 
                 description="Upload your first study material." 
                 action={<Link to={ROUTES.UPLOAD} className="text-sm text-primary hover:underline">Upload Now</Link>}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline (From Analytics) */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Study Trend</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Quizzes and reviews over the last 7 days.</p>
          </CardHeader>
          <CardContent className="h-[300px]">
             {analytics?.activity?.dailyTrend?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.activity.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fff' }} 
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <EmptyState icon={CalendarDays} title="No Activity" description="No study sessions recorded in the last 7 days." />
             )}
          </CardContent>
        </Card>
      </div>

    </motion.div>
  )
}
