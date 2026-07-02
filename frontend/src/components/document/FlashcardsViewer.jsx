import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, RotateCw, 
  Brain, HelpCircle, Check, X, Search, Loader2, BookOpen, AlertCircle, Sparkles, Filter, Layers
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function FlashcardsViewer({ 
  documentId, flashcards, progress, loading, error, recordProgress, getHint, explainFurther 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // AI states
  const [hint, setHint] = useState(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);

  // Swipe states
  const [dragStart, setDragStart] = useState(0);

  // Derived filtered cards
  const filteredCards = useMemo(() => {
    if (!flashcards?.cards) return [];
    return flashcards.cards.filter(card => {
      const matchesSearch = !searchQuery || 
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDifficulty = difficultyFilter === 'All' || card.difficulty === difficultyFilter;
      
      return matchesSearch && matchesDifficulty;
    });
  }, [flashcards, searchQuery, difficultyFilter]);

  const currentCard = filteredCards[currentIndex];
  
  // Progress lookups
  const cardProgress = useMemo(() => {
    if (!currentCard || !progress) return {};
    return progress.find(p => p.flashcard_id === currentCard.id) || {};
  }, [currentCard, progress]);

  // Session stats
  const stats = useMemo(() => {
    if (!flashcards?.cards) return null;
    const total = flashcards.cards.length;
    const mastered = progress.filter(p => p.confidence === 'knew_it').length;
    const needsRevision = progress.filter(p => p.confidence === 'needs_revision').length;
    const bookmarked = progress.filter(p => p.bookmarked).length;
    const reviewed = mastered + needsRevision;
    const completion = total ? Math.round((reviewed / total) * 100) : 0;
    
    return { total, mastered, needsRevision, bookmarked, reviewed, completion };
  }, [flashcards, progress]);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in search
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'KeyB') {
        handleBookmark();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length]);

  // Reset AI states on card change
  useEffect(() => {
    setHint(null);
    setExplanation(null);
    setIsFlipped(false);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleDragEnd = (e, info) => {
    if (info.offset.x < -50) handleNext();
    if (info.offset.x > 50) handlePrev();
  };

  const handleConfidence = async (confidenceValue) => {
    if (!currentCard) return;
    await recordProgress(currentCard.id, { confidence: confidenceValue });
    // Auto advance if they marked it
    setTimeout(handleNext, 400);
  };

  const handleBookmark = async () => {
    if (!currentCard) return;
    const isBookmarked = cardProgress.bookmarked;
    await recordProgress(currentCard.id, { bookmarked: !isBookmarked });
  };

  const handleGetHint = async () => {
    if (!currentCard || hint) return;
    setIsHintLoading(true);
    try {
      const h = await getHint(currentCard.question, currentCard.topic);
      setHint(h);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleGetExplanation = async () => {
    if (!currentCard || explanation) return;
    setIsExplanationLoading(true);
    try {
      const exp = await explainFurther(currentCard.question, currentCard.answer, currentCard.topic);
      setExplanation(exp);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const api = (await import('@/services/api')).default;
      await api.post(`/documents/${documentId}/retry`, { module: 'flashcards' }, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
    } catch (err) {
      console.error("Retry failed", err);
    }
  };

  if (loading && !flashcards) {
    return (
      <Card className="w-full bg-background/60 border-white/10 p-10 flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-muted-foreground">Checking document flashcards...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-red-500/5 border-red-500/20 p-10 flex flex-col items-center justify-center min-h-[500px]">
        <AlertCircle className="text-red-400 mb-4" size={32} />
        <p className="text-white font-medium mb-2">Failed to load flashcards</p>
        <p className="text-red-400/80 text-sm text-center">{error}</p>
      </Card>
    );
  }

  if (flashcards?.status === 'processing' || flashcards?.status === 'pending') {
    return (
      <Card className="w-full bg-background/60 border-white/10 p-12 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-600/5 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Creating Adaptive Flashcards</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            We are extracting key concepts and generating an adaptive spaced-repetition deck just for you.
          </p>
          <div className="mt-8 relative w-64 h-40">
             <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
             <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl translate-x-4 translate-y-4 -z-10 animate-pulse" style={{ animationDelay: '200ms' }} />
          </div>
        </div>
      </Card>
    );
  }

  if (flashcards?.status === 'failed') {
    return (
      <Card className="w-full bg-background/60 border-white/10 p-10 flex flex-col items-center justify-center min-h-[500px]">
        <AlertCircle className="text-red-400 mb-4" size={48} />
        <p className="text-white font-medium mb-2">Flashcard Generation Failed</p>
        <p className="text-red-400/80 text-sm text-center mb-6">{flashcards?.error_message || 'An unknown error occurred.'}</p>
        <button onClick={handleRetry} className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
          Retry Generation
        </button>
      </Card>
    );
  }

  if (!flashcards?.cards || flashcards.cards.length === 0) {
    return (
      <Card className="w-full bg-background/60 border-white/10 p-10 flex flex-col items-center justify-center min-h-[500px]">
        <Layers className="text-white/20 mb-4" size={48} />
        <p className="text-white font-medium mb-2">No flashcards available yet</p>
        <p className="text-muted-foreground text-sm text-center">
          Flashcards are either generating or none were found in the document.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Session Progress Header */}
      {stats && (
        <Card className="p-4 bg-gradient-to-br from-white/5 to-transparent border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Completion</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{stats.completion}%</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${stats.completion}%` }} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-emerald-400/80 uppercase tracking-wider font-semibold mb-1">Mastered</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.mastered}</p>
          </div>
          <div>
            <p className="text-xs text-orange-400/80 uppercase tracking-wider font-semibold mb-1">Needs Rev.</p>
            <p className="text-2xl font-bold text-orange-400">{stats.needsRevision}</p>
          </div>
          <div>
            <p className="text-xs text-blue-400/80 uppercase tracking-wider font-semibold mb-1">Bookmarked</p>
            <p className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              {stats.bookmarked} <Bookmark size={14} />
            </p>
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-muted-foreground" />
          <select 
            className="bg-white/5 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:border-primary/50"
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentIndex(0);
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            type="text" 
            placeholder="Search cards..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p>No cards match your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          
          {/* Card Viewer */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] perspective-1000 my-8 select-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0, rotateY: isFlipped ? 180 : 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full h-full preserve-3d cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                
                {/* FRONT OF CARD */}
                <Card className="absolute w-full h-full backface-hidden bg-background/80 backdrop-blur-xl border-white/10 flex flex-col p-5 sm:p-8 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        currentCard.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                        currentCard.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {currentCard.difficulty}
                      </span>
                      {currentCard.topic && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                          {currentCard.topic}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                      {cardProgress.bookmarked ? <BookmarkCheck className="text-blue-400" size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                      {currentCard.question}
                    </h2>
                  </div>

                  <div className="mt-auto flex justify-between items-center text-muted-foreground">
                    <span className="text-xs flex items-center gap-1"><BookOpen size={12}/> {currentIndex + 1} / {filteredCards.length}</span>
                    <span className="text-xs flex items-center gap-1"><RotateCw size={12} className="animate-[spin_4s_linear_infinite]" /> Tap to flip</span>
                  </div>
                </Card>

                {/* BACK OF CARD */}
                <Card className="absolute w-full h-full backface-hidden bg-background/90 backdrop-blur-xl border-primary/20 flex flex-col p-5 sm:p-8 rotate-y-180 overflow-y-auto custom-scrollbar">
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-primary/80 font-bold mb-3">Answer</h4>
                      <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                        {currentCard.answer}
                      </p>
                    </div>

                    {currentCard.concept_explanation && (
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl max-w-2xl mx-auto">
                        <p className="text-sm text-white/80 leading-relaxed">
                          {currentCard.concept_explanation}
                        </p>
                      </div>
                    )}

                    {currentCard.memory_trick && (
                      <div className="flex items-start gap-3 bg-pink-500/5 border border-pink-500/10 p-4 rounded-xl max-w-2xl mx-auto text-left w-full">
                        <Brain className="text-pink-400 shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="text-xs uppercase font-bold text-pink-400 mb-1">Memory Trick</p>
                          <p className="text-sm text-pink-100/90">{currentCard.memory_trick}</p>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </Card>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Controls */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext} 
                disabled={currentIndex === filteredCards.length - 1}
                className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* AI Action & Confidence (Only show when flipped) */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  <button 
                    onClick={() => handleConfidence('needs_revision')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                      cardProgress.confidence === 'needs_revision' 
                      ? 'bg-orange-500/20 border-orange-500/30 text-orange-300'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <X size={14} className="text-orange-400 sm:w-4 sm:h-4" /> Needs Revision
                  </button>
                  <button 
                    onClick={() => handleConfidence('knew_it')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                      cardProgress.confidence === 'knew_it' 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <Check size={14} className="text-emerald-400 sm:w-4 sm:h-4" /> I Knew This
                  </button>
                  
                  <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />
                  
                  <button 
                    onClick={handleGetExplanation}
                    disabled={isExplanationLoading}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-primary/10 border border-primary/20 text-primary-300 hover:bg-primary/20 transition-colors"
                  >
                    {isExplanationLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Explain Further
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint Button (Only show when NOT flipped) */}
            <AnimatePresence>
              {!isFlipped && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <button 
                    onClick={handleGetHint}
                    disabled={isHintLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    {isHintLoading ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} className="text-yellow-400" />}
                    Need a Hint?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* AI Overlays */}
          <AnimatePresence>
            {!isFlipped && hint && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 w-full max-w-2xl bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3"
              >
                <HelpCircle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">AI Hint</h4>
                  <p className="text-sm text-yellow-100/90 leading-relaxed">{hint}</p>
                </div>
              </motion.div>
            )}

            {isFlipped && explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 w-full bg-primary/10 border border-primary/20 p-6 rounded-xl flex items-start gap-4"
              >
                <Sparkles className="text-primary shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Deep AI Explanation</h4>
                  <div className="text-sm text-white/90 leading-relaxed space-y-4">
                    {explanation.split('\n').map((para, i) => para && <p key={i}>{para}</p>)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
      
    </div>
  );
}
