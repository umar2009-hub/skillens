import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Target, Flame, Brain, Layers, Activity } from 'lucide-react';
import { pageTransition } from '@/constants/animations';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/components/analytics/StatCard';
import { ActivityChart } from '@/components/analytics/ActivityChart';
import { KnowledgeGrowthChart } from '@/components/analytics/KnowledgeGrowthChart';
import { StudyDistributionChart } from '@/components/analytics/StudyDistributionChart';
import { TopicStrengthCard } from '@/components/analytics/TopicStrengthCard';

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getDashboardAnalytics();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Calculating insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to load analytics</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { overview, performance, activity, topics, charts } = data;

  // Stagger container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div {...pageTransition} className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Learning Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your study habits and progress.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Study Time" 
            value={`${overview.totalStudyTimeMinutes} min`} 
            subtitle={`${overview.totalLearningSessions} sessions`}
            icon={Clock} 
            colorClass="text-blue-500 bg-blue-500" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Average Accuracy" 
            value={`${overview.averageQuizAccuracy}%`} 
            subtitle={`From ${overview.quizAttempts} attempts`}
            icon={Target} 
            colorClass="text-emerald-500 bg-emerald-500" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Current Streak" 
            value={`${overview.currentStreak} Days`} 
            subtitle={`Longest: ${overview.longestStreak} days`}
            icon={Flame} 
            colorClass="text-orange-500 bg-orange-500" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Materials Studied" 
            value={overview.pdfsStudied} 
            subtitle={`${overview.flashcardsReviewed} cards reviewed`}
            icon={BookOpen} 
            colorClass="text-purple-500 bg-purple-500" 
          />
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KnowledgeGrowthChart data={performance.knowledgeGrowth} />
        </div>
        <div>
          <StudyDistributionChart data={charts.distribution} />
        </div>
      </div>

      {/* Topics & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart data={activity.recentDays} />
        </div>
        <div className="flex flex-col gap-6">
          <TopicStrengthCard title="Strongest Topics" topics={topics.strongTopics} type="strong" />
          <TopicStrengthCard title="Needs Review" topics={topics.weakTopics} type="weak" />
        </div>
      </div>
    </motion.div>
  );
}
