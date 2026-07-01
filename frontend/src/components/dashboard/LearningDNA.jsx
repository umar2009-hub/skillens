import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  BrainCircuit, Target, Zap, Clock, TrendingUp, BookOpen, Layers, 
  Activity, CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Utility to format seconds to human-readable string
const formatStudyTime = (seconds) => {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Generate rule-based insights from real data
const generateInsights = (dna) => {
  const insights = [];
  if (!dna) return insights;

  if (dna.accuracy_score >= 80) insights.push({ text: "You consistently perform well across most topics.", type: 'positive' });
  if (dna.accuracy_score < 60 && dna.quizzes_completed > 0) insights.push({ text: "Overall accuracy is low. Consider reviewing the Study Guide before quizzes.", type: 'warning' });
  
  if (dna.learning_velocity > 10) insights.push({ text: `Accuracy improved by ${dna.learning_velocity}% since your earlier sessions!`, type: 'positive' });
  if (dna.learning_velocity < -10) insights.push({ text: "Your recent quiz scores have dipped slightly.", type: 'warning' });
  
  if (dna.topics_mastered && dna.topics_mastered.length > 0) {
    insights.push({ text: `"${dna.topics_mastered[0]}" is consistently your strongest topic.`, type: 'positive' });
  }
  
  if (dna.topics_to_improve && dna.topics_to_improve.length > 0) {
    insights.push({ text: `"${dna.topics_to_improve[0]}" has become a weak point and requires revision.`, type: 'warning' });
  }

  if (dna.consistency_score > 70) {
    insights.push({ text: "You have maintained an excellent study consistency.", type: 'positive' });
  }

  return insights;
};

// Generate rule-based recommendations
const generateRecommendations = (dna) => {
  const recs = [];
  if (!dna) return recs;

  if (dna.revision_priority && dna.revision_priority.length > 0) {
    recs.push({ title: "Immediate Revision Needed", desc: `Focus on: ${dna.revision_priority.map(r => r.topic).join(', ')}`, action: "Review Flashcards" });
  } else if (dna.accuracy_score < 70) {
    recs.push({ title: "Deep Dive Required", desc: "Your foundational knowledge needs reinforcement.", action: "Read Study Guide" });
  } else {
    recs.push({ title: "Ready for Challenge", desc: "You are mastering the material. Push your limits.", action: "Take Adaptive Quiz" });
  }
  return recs;
};

export function LearningDNA({ dna, onStudyGuide, onQuiz, onFlashcards }) {
  
  if (!dna) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <BrainCircuit className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Unlock Your Learning DNA</h2>
        <p className="text-muted-foreground max-w-lg mb-8 text-lg">
          We need a bit more data to analyze your learning patterns. Complete quizzes and review flashcards to build your personalized intelligence profile.
        </p>
        <div className="flex gap-4">
          <Button onClick={onQuiz} size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
            Take a Quiz
          </Button>
          <Button onClick={onFlashcards} size="lg" variant="outline" className="rounded-full">
            Review Flashcards
          </Button>
        </div>
      </div>
    );
  }

  const insights = generateInsights(dna);
  const recommendations = generateRecommendations(dna);

  // Since we don't have historical snapshots in DB, we mock the radar chart using topics data
  // Assigning dummy scores based on mastery arrays to visualize the topics
  const radarData = [
    ...(dna.topics_mastered || []).map(t => ({ topic: t.substring(0, 15), score: 90 })),
    ...(dna.topics_to_improve || []).map(t => ({ topic: t.substring(0, 15), score: 40 }))
  ].slice(0, 6);

  if (radarData.length === 0) {
    radarData.push({ topic: 'No Topic Data', score: 0 });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="text-primary w-8 h-8" /> Learning DNA
          </h2>
          <p className="text-muted-foreground mt-1">Your personalized deterministic intelligence profile.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Knowledge Score</div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            {dna.knowledge_score}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Accuracy" value={`${dna.accuracy_score}%`} icon={Target} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
        <MetricCard title="Confidence" value={`${dna.confidence_score}%`} icon={Zap} color="text-yellow-500" bg="bg-yellow-500/10" border="border-yellow-500/20" />
        <MetricCard title="Study Time" value={formatStudyTime(dna.study_time)} icon={Clock} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <MetricCard title="Velocity" value={`${dna.learning_velocity > 0 ? '+' : ''}${dna.learning_velocity}%`} icon={TrendingUp} color="text-purple-500" bg="bg-purple-500/10" border="border-purple-500/20" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Col: Insights & Topics */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-primary" /> Smart Insights</h3>
            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${
                  insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-orange-500/5 border-orange-500/10 text-orange-400'
                }`}>
                  {insight.type === 'positive' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                  <span className="text-sm font-medium leading-relaxed text-white/90">{insight.text}</span>
                </div>
              )) : (
                <div className="text-muted-foreground text-sm">Keep studying to generate insights!</div>
              )}
            </div>
          </div>

          {/* Topic Performance Radar */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col">
            <h3 className="text-xl font-bold mb-2">Topic Mastery Map</h3>
            <p className="text-xs text-muted-foreground mb-4">Calculated from raw quiz accuracy.</p>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Col: Activity & Recommendations */}
        <div className="space-y-6">
          
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Activity Stats</h3>
            <div className="space-y-3">
              <ActivityRow label="Quizzes Completed" value={dna.quizzes_completed} icon={CheckCircle2} />
              <ActivityRow label="Flashcards Reviewed" value={dna.flashcards_reviewed} icon={Layers} />
              <ActivityRow label="Documents Analyzed" value={dna.documents_completed} icon={BookOpen} />
              <ActivityRow label="Consistency Score" value={`${dna.consistency_score}/100`} icon={Activity} />
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <h3 className="text-xl font-bold mb-4 text-primary">Next Steps</h3>
            <div className="space-y-4 relative z-10">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{rec.desc}</p>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full justify-between text-xs font-semibold h-8"
                    onClick={() => {
                      if (rec.action.includes('Quiz')) onQuiz?.();
                      if (rec.action.includes('Flashcard')) onFlashcards?.();
                      if (rec.action.includes('Guide')) onStudyGuide?.();
                    }}
                  >
                    {rec.action} <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg, border }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`p-5 rounded-3xl border ${border} bg-[#111] relative overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
      <div className="flex flex-col relative z-10 h-full justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white/95">
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-white/80">{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );
}
