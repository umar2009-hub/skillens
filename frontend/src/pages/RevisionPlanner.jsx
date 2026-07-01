import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, LayoutList, Target } from 'lucide-react';
import { pageTransition } from '@/constants/animations';
import { revisionService } from '@/services/revision.service';
import { StatCard } from '@/components/analytics/StatCard';
import { TodayPlanCard } from '@/components/revision/TodayPlanCard';
import { UpcomingRevisionCard } from '@/components/revision/UpcomingRevisionCard';
import { CoachMessage } from '@/components/revision/CoachMessage';
import { RevisionCalendar } from '@/components/revision/RevisionCalendar';

export function RevisionPlanner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const result = await revisionService.getRevisionPlan();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleAction = async (topic, action) => {
    try {
      setActionLoading(true);
      await revisionService.recordAction(topic, action);
      // Re-fetch the plan after recording action
      await fetchPlan();
    } catch (err) {
      console.error(err);
      // Optional: Add toast notification for error
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Calculating optimal schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDays size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to load plan</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={fetchPlan} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, today, upcoming, calendar, coach } = data;

  if (today.length === 0 && upcoming.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">No Learning Data Yet</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          The intelligent revision planner needs data to build your schedule. Complete quizzes and review flashcards to unlock personalized revision plans.
        </p>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Revision Planner</h1>
          <p className="text-muted-foreground">Your intelligent, spaced-repetition study schedule.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Plan & Coach */}
        <div className="lg:col-span-2 space-y-6">
          <CoachMessage message={coach} />

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="text-primary" size={20} />
              Today's Focus
            </h2>
            
            {today.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-muted-foreground">You're all caught up for today! Great job.</p>
              </div>
            ) : (
              <div className={`space-y-4 ${actionLoading ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                {today.map((topic, i) => (
                  <TodayPlanCard 
                    key={i} 
                    topic={topic.topic} 
                    priority={topic.priority} 
                    reason={topic.reason} 
                    time={topic.averageTime}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming & Calendar */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <StatCard 
                title="Time Needed" 
                value={`${summary.estimatedTimeMinutes}m`} 
                icon={Clock} 
                colorClass="text-blue-500 bg-blue-500" 
              />
              <StatCard 
                title="Total Topics" 
                value={summary.totalTopicsToday + summary.totalTopicsUpcoming} 
                icon={LayoutList} 
                colorClass="text-purple-500 bg-purple-500" 
              />
          </div>

          <RevisionCalendar data={calendar} />

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="text-white/70" size={20} />
              Upcoming
            </h2>
            <div className="space-y-3 bg-black/40 backdrop-blur-sm border border-white/5 p-4 rounded-xl">
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No upcoming revisions scheduled yet.</p>
              ) : (
                upcoming.map((topic, i) => (
                  <UpcomingRevisionCard 
                    key={i}
                    topic={topic.topic}
                    priority={topic.priority}
                    upcomingDays={topic.upcomingDays}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
