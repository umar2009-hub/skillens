import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { UploadSuccessState } from '@/components/upload/UploadSuccessState';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useDocumentNotes } from '@/hooks/useDocumentNotes';
import { NotesViewer } from '@/components/document/NotesViewer';
import { useDocumentFlashcards } from '@/hooks/useDocumentFlashcards';
import { FlashcardsViewer } from '@/components/document/FlashcardsViewer';
import { useDocumentQuiz } from '@/hooks/useDocumentQuiz';
import { QuizViewer } from '@/components/document/QuizViewer';
import { useLearningDNA } from '@/hooks/useLearningDNA';
import { LearningDNA } from '@/components/dashboard/LearningDNA';
import { PersonalAIMentor } from '@/components/document/PersonalAIMentor';
import { Activity, MessageSquare } from 'lucide-react';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'notes');

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto relative min-h-[80vh] pt-10 px-4 md:px-0">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center -z-10">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-500/20 to-purple-600/10 blur-[100px] absolute -top-40" />
      </div>

      <div className="mb-8 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Button>
      </div>

      <div className="space-y-8 pb-20">
        <UploadSuccessState documentId={id} />
        
        {/* View Tabs */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'notes' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={18} /> Deep AI Notes
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'flashcards' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={18} /> Adaptive Flashcards
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'quiz' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={18} /> Adaptive Quiz
          </button>
          <button
            onClick={() => setActiveTab('dna')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dna' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={18} /> Learning DNA
          </button>
          <button
            onClick={() => setActiveTab('mentor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mentor' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={18} /> AI Mentor
          </button>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'notes' && (
              <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <NotesSection documentId={id} />
              </motion.div>
            )}
            {activeTab === 'flashcards' && (
              <motion.div key="flashcards" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <FlashcardsSection documentId={id} />
              </motion.div>
            )}
            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <QuizSection documentId={id} />
              </motion.div>
            )}
            {activeTab === 'dna' && (
              <motion.div key="dna" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <DNASection documentId={id} setActiveTab={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'mentor' && (
              <motion.div key="mentor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
                <PersonalAIMentor documentId={id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}

function NotesSection({ documentId }) {
  const { notes, loading, error } = useDocumentNotes(documentId);
  return <NotesViewer notes={notes} loading={loading} error={error} />;
}

function FlashcardsSection({ documentId }) {
  const { flashcards, progress, loading, error, recordProgress, getHint, explainFurther } = useDocumentFlashcards(documentId);
  return (
    <FlashcardsViewer 
      documentId={documentId}
      flashcards={flashcards} 
      progress={progress}
      loading={loading} 
      error={error} 
      recordProgress={recordProgress}
      getHint={getHint}
      explainFurther={explainFurther}
    />
  );
}

function QuizSection({ documentId }) {
  const quizHook = useDocumentQuiz(documentId);
  return <QuizViewer documentId={documentId} {...quizHook} />;
}

function DNASection({ documentId, setActiveTab }) {
  const { dna, loading, fetchDocumentDNA } = useLearningDNA();
  
  React.useEffect(() => {
    fetchDocumentDNA(documentId);
  }, [documentId, fetchDocumentDNA]);

  if (loading && !dna) {
    return <div className="text-center py-20 text-muted-foreground">Loading Learning DNA...</div>;
  }

  return (
    <LearningDNA 
      dna={dna}
      onStudyGuide={() => setActiveTab('notes')}
      onQuiz={() => setActiveTab('quiz')}
      onFlashcards={() => setActiveTab('flashcards')}
    />
  );
}
