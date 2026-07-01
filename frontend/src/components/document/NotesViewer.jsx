import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, ChevronUp, Copy, Check, BookOpen, AlertCircle, Loader2,
  Target, Lightbulb, Cog, List, Hash, Book, AlertTriangle, MessageCircle, FileText, Zap, BrainCircuit, Link2, Key
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function NotesViewer({ notes, loading, error }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  
  // View Modes: 'study' (default), 'focus', 'exam', 'revision'
  const [viewMode, setViewMode] = useState('study');
  
  // TOC tracking
  const [activeSectionId, setActiveSectionId] = useState(null);
  const sectionRefs = useRef({});

  // Setup intersection observer for TOC
  useEffect(() => {
    if (!notes?.sections || viewMode === 'focus') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to find the uppermost visible section
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [notes, viewMode]);

  if (loading && !notes) {
    return (
      <Card className="w-full bg-background/60 border-white/10 p-10 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-muted-foreground">Checking document notes...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-red-500/5 border-red-500/20 p-10 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="text-red-400 mb-4" size={32} />
        <p className="text-white font-medium mb-2">Failed to load study notes</p>
        <p className="text-red-400/80 text-sm text-center">{error}</p>
      </Card>
    );
  }

  if (notes?.status === 'processing' || notes?.status === 'pending') {
    return (
      <Card className="w-full bg-background/60 border-white/10 p-12 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Generating Study Guide</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Our AI is analyzing your document and building comprehensive, personalized study notes. This usually takes 15-30 seconds.
          </p>
          <div className="mt-8 space-y-4 w-full max-w-md">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!notes || notes.status !== 'completed' || !notes.sections) {
    const handleRetry = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        const api = (await import('@/services/api')).default;
        await api.post(`/documents/${documentId}/retry`, { module: 'notes' }, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        // Realtime will pick up the 'processing' state change automatically
      } catch (err) {
        console.error("Retry failed", err);
      }
    };

    return (
      <Card className="w-full bg-background/60 border-white/10 p-10 flex flex-col items-center justify-center min-h-[400px]">
        <BookOpen className="text-white/20 mb-4" size={48} />
        <p className="text-white font-medium mb-2">Study guide unavailable</p>
        <p className="text-muted-foreground text-sm text-center mb-6">
          {notes?.status === 'failed' ? 'Notes generation failed due to an error.' : 'Notes are currently unavailable.'}
        </p>
        {notes?.status === 'failed' && (
          <button onClick={handleRetry} className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
            Retry Generation
          </button>
        )}
      </Card>
    );
  }

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    const all = {};
    notes.sections.forEach((_, idx) => { all[idx] = true; });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const scrollToSection = (idx) => {
    const el = sectionRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Ensure it's expanded
      setExpandedSections(prev => ({ ...prev, [idx]: true }));
    }
  };

  const handleCopy = (section, idx) => {
    const text = `## ${section.heading}\n\n${section.concept_explanation}\n\nKey Points:\n${section.key_points?.map(p => `- ${p}`).join('\n') || ''}\n\nImportant Facts:\n${section.important_facts?.map(f => `- ${f}`).join('\n') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const highlightText = (text) => {
    if (!searchQuery || !text) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <mark key={index} className="bg-primary/40 text-white rounded px-1">{part}</mark> : part
    );
  };

  const filteredSections = notes.sections.filter(section => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.heading?.toLowerCase().includes(query) ||
      section.concept_explanation?.toLowerCase().includes(query) ||
      section.key_points?.some(bp => bp.toLowerCase().includes(query)) ||
      section.keywords?.some(kw => kw.toLowerCase().includes(query)) ||
      section.important_facts?.some(f => f.toLowerCase().includes(query)) ||
      section.examples?.some(e => e.toLowerCase().includes(query))
    );
  });

  return (
    <div className={`w-full transition-all duration-500 flex gap-8 ${viewMode === 'focus' ? 'max-w-3xl mx-auto' : 'w-full'}`}>
      
      {/* Floating TOC (Hidden in Focus Mode or Mobile) */}
      {viewMode !== 'focus' && (
        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Table of Contents</h4>
          <nav className="space-y-1 border-l border-white/10 ml-2">
            {notes.sections.map((section, idx) => {
              const isActive = activeSectionId === `section-${idx}`;
              return (
                <button
                  key={idx}
                  onClick={() => scrollToSection(idx)}
                  className={`block w-full text-left pl-4 py-1.5 text-sm transition-colors relative ${
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="toc-indicator"
                      className="absolute left-[-1px] top-0 bottom-0 w-0.5 bg-primary rounded-r"
                    />
                  )}
                  <span className="line-clamp-2">{section.heading}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Top Summary Card */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{notes.title || 'Deep AI Study Notes'}</h1>
              <p className="text-white/80 leading-relaxed mb-4">{notes.overview}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {notes.estimated_study_time && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen size={14} className="text-blue-400" />
                    <span>{notes.estimated_study_time}</span>
                  </div>
                )}
                {notes.total_topics && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <List size={14} className="text-purple-400" />
                    <span>{notes.total_topics} Topics</span>
                  </div>
                )}
                {notes.difficulty && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target size={14} className={
                      notes.difficulty === 'Hard' ? 'text-red-400' :
                      notes.difficulty === 'Medium' ? 'text-orange-400' : 'text-emerald-400'
                    } />
                    <span>{notes.difficulty}</span>
                  </div>
                )}
                {notes.revision_priority && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap size={14} className="text-yellow-400" />
                    <span>Priority: {notes.revision_priority}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {(notes.learning_outcomes?.length > 0 || notes.prerequisites?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              {notes.learning_outcomes?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Learning Outcomes</h4>
                  <ul className="space-y-1">
                    {notes.learning_outcomes.map((outcome, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                        <Check size={14} className="text-emerald-500/50 mt-0.5 shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notes.prerequisites?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Prerequisites</h4>
                  <ul className="space-y-1">
                    {notes.prerequisites.map((req, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                        <Link2 size={14} className="text-orange-500/50 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar hide-scrollbar-mobile">
            {['study', 'focus', 'exam', 'revision'].map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (mode === 'focus') collapseAll();
                  else expandAll();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  viewMode === mode 
                    ? 'bg-primary text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {mode} Mode
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="Search concepts..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) expandAll();
                }}
                className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-primary/50 transition-colors w-full md:w-56"
              />
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredSections.map((section, idx) => {
              const isExpanded = expandedSections[idx] !== false; // Default to expanded
              const isExamMode = viewMode === 'exam';
              const isRevisionMode = viewMode === 'revision';
              
              return (
                <motion.div 
                  key={idx}
                  id={`section-${idx}`}
                  ref={el => sectionRefs.current[idx] = el}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group"
                >
                  {/* Section Header */}
                  <div 
                    className="p-6 flex items-start justify-between cursor-pointer select-none bg-gradient-to-r from-white/[0.02] to-transparent"
                    onClick={() => toggleSection(idx)}
                  >
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          section.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          section.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {section.difficulty || 'Concept'}
                        </span>
                        {section.estimated_reading_time && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <BookOpen size={10} /> {section.estimated_reading_time}
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold text-white group-hover:text-primary transition-colors ${viewMode === 'focus' ? 'text-2xl' : 'text-xl'}`}>
                        {highlightText(section.heading)}
                      </h3>
                      {(!isExpanded || isRevisionMode) && !isExamMode && section.learning_objective && (
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-1 border-l-2 border-primary/30 pl-3">
                          {highlightText(section.learning_objective)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(section, idx); }}
                        className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy Section Markdown"
                      >
                        {copiedId === idx ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                      <div className="p-2 rounded-full bg-white/5 text-white/50 group-hover:bg-white/10 transition-colors">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Section Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                      >
                        <div className={`p-6 space-y-8 ${viewMode === 'focus' ? 'text-lg leading-loose' : 'text-base leading-relaxed'}`}>
                          
                          {/* Main Explanation Block (Hidden in Revision Mode) */}
                          {!isRevisionMode && (
                            <div className="space-y-6">
                              {section.concept_explanation && (
                                <div className="text-white/90">
                                  {highlightText(section.concept_explanation)}
                                </div>
                              )}
                              
                              {(section.why_it_matters || section.how_it_works) && !isExamMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {section.why_it_matters && (
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                      <h4 className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        <Target size={14} /> Why It Matters
                                      </h4>
                                      <p className="text-sm text-white/80">{highlightText(section.why_it_matters)}</p>
                                    </div>
                                  )}
                                  {section.how_it_works && (
                                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                      <h4 className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                                        <Cog size={14} /> How It Works
                                      </h4>
                                      <p className="text-sm text-white/80">{highlightText(section.how_it_works)}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {section.step_by_step_breakdown?.length > 0 && !isExamMode && (
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Step-by-Step Breakdown</h4>
                                  <div className="space-y-3">
                                    {section.step_by_step_breakdown.map((step, i) => (
                                      <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                            {i + 1}
                                          </div>
                                          {i !== section.step_by_step_breakdown.length - 1 && (
                                            <div className="w-px h-full bg-white/10 my-1" />
                                          )}
                                        </div>
                                        <p className="text-sm text-white/80 pb-3">{highlightText(step)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* High Yield Block (Always visible except examples in Exam mode) */}
                          <div className="space-y-6">
                            {section.key_points?.length > 0 && !isRevisionMode && (
                              <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
                                  <Hash size={14} /> Key Takeaways
                                </h4>
                                <ul className="space-y-2">
                                  {section.key_points.map((bp, i) => (
                                    <li key={i} className="text-sm text-white/80 flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                      <span>{highlightText(bp)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {(section.important_facts?.length > 0 || section.definitions?.length > 0) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.important_facts?.length > 0 && (
                                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider mb-3">
                                      <Zap size={14} /> Important Facts
                                    </h4>
                                    <ul className="space-y-2 text-sm text-white/80 list-disc list-inside">
                                      {section.important_facts.map((fact, i) => (
                                        <li key={i}>{highlightText(fact)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {section.definitions?.length > 0 && (
                                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                                      <Book size={14} /> Definitions
                                    </h4>
                                    <ul className="space-y-3">
                                      {section.definitions.map((def, i) => {
                                        const [term, desc] = def.split(':');
                                        return (
                                          <li key={i} className="text-sm">
                                            <span className="font-bold text-emerald-300">{highlightText(term)}:</span> 
                                            <span className="text-white/80">{highlightText(desc)}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Exam Prep Block */}
                            {(isExamMode || !isRevisionMode) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.common_mistakes?.length > 0 && !isExamMode && (
                                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
                                      <AlertTriangle size={14} /> Common Mistakes
                                    </h4>
                                    <ul className="space-y-2 text-sm text-white/80 list-disc list-inside">
                                      {section.common_mistakes.map((mistake, i) => (
                                        <li key={i}>{highlightText(mistake)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {section.memory_trick && (
                                  <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">
                                      <BrainCircuit size={14} /> Memory Trick
                                    </h4>
                                    <p className="text-sm text-white/80">{highlightText(section.memory_trick)}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Viva & Exam Questions (Always in Exam Mode) */}
                            {(section.viva_questions?.length > 0 || section.exam_questions?.length > 0) && (isExamMode || !isRevisionMode) && (
                              <div className="p-5 rounded-xl bg-white/5 border border-white/10 mt-6">
                                <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-4">
                                  <MessageCircle size={14} /> Assessment Preparedness
                                </h4>
                                <div className="space-y-6">
                                  {section.viva_questions?.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium text-muted-foreground mb-2">Common Viva Questions</h5>
                                      <div className="space-y-3">
                                        {section.viva_questions.map((q, i) => (
                                          <div key={i} className="text-sm">
                                            <p className="font-semibold text-white/90">Q: {highlightText(q.question)}</p>
                                            <p className="text-white/60 mt-1 pl-4 border-l-2 border-white/10">A: {highlightText(q.answer)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {section.exam_questions?.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium text-muted-foreground mb-2">Typical Exam Questions</h5>
                                      <div className="space-y-3">
                                        {section.exam_questions.map((q, i) => (
                                          <div key={i} className="text-sm">
                                            <p className="font-semibold text-white/90">Q: {highlightText(q.question)}</p>
                                            <p className="text-white/60 mt-1 pl-4 border-l-2 border-white/10">A: {highlightText(q.answer)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Footer Info */}
                          {section.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                              <Key size={14} className="text-muted-foreground mt-0.5" />
                              {section.keywords.map((kw, i) => (
                                <span key={i} className="text-[11px] font-medium px-2 py-0.5 bg-white/5 rounded text-muted-foreground hover:text-white transition-colors cursor-pointer">
                                  {highlightText(kw)}
                                </span>
                              ))}
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredSections.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center text-muted-foreground">
              <Search size={32} className="mb-4 opacity-50" />
              <p>No sections match your search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
