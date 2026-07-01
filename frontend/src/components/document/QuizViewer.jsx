import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Loader2, Play, Brain, CheckCircle2, XCircle, Clock, BookOpen, Layers } from 'lucide-react';
import { QuizReport } from './QuizReport';
import { cn } from '@/utils/cn';

export function QuizViewer({ documentId, quizData, loading, error, session, startSession, submitAttempt, finishSession, getAnalytics }) {
  const [gameState, setGameState] = useState('idle'); // idle, active, report
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('Medium');
  const [streak, setStreak] = useState(0); // positive for correct, negative for incorrect
  const [questions, setQuestions] = useState([]);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  const [completedQuestions, setCompletedQuestions] = useState(0);
  const [askedIds, setAskedIds] = useState(new Set());
  
  const totalAvailable = quizData?.questions?.length || 0;
  const TOTAL_QUESTIONS_PER_SESSION = Math.min(10, totalAvailable > 0 ? totalAvailable : 10);

  useEffect(() => {
    if (quizData?.questions && gameState === 'idle') {
      // Group by difficulty
      const grouped = {
        Easy: [], Medium: [], Hard: [], Challenge: []
      };
      quizData.questions.forEach(q => {
        if (grouped[q.difficulty]) grouped[q.difficulty].push(q);
      });
      setQuestions(grouped);
    }
  }, [quizData, gameState]);

  const handleStart = async () => {
    await startSession();
    setGameState('active');
    setQuestionStartTime(Date.now());
  };

  const getNextQuestion = () => {
    let pool = questions[difficulty] || [];
    let unaskedPool = pool.filter(q => !askedIds.has(q.id));
    
    if (unaskedPool.length === 0) {
      // Fallback to any difficulty if current difficulty pool is exhausted
      pool = Object.values(questions).flat();
      unaskedPool = pool.filter(q => !askedIds.has(q.id));
    }
    
    if (unaskedPool.length === 0) return null;
    return unaskedPool[Math.floor(Math.random() * unaskedPool.length)];
  };

  const currentQuestion = useMemo(() => getNextQuestion(), [difficulty, completedQuestions, questions, askedIds]);

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleConfidence = (conf) => {
    setConfidence(conf);
    // Now evaluate
    evaluateAnswer(conf);
  };

  const evaluateAnswer = async (conf) => {
    let correct = false;
    if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') {
      correct = selectedAnswer === currentQuestion.correct_answer;
    } else {
      // Simplified for other types - assume match or short answer check
      correct = selectedAnswer?.toLowerCase().trim() === currentQuestion.correct_answer?.toLowerCase().trim();
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    // Save attempt
    await submitAttempt({
      questionId: currentQuestion.id,
      selectedAnswer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect: correct,
      difficulty,
      topic: currentQuestion.topic,
      questionType: currentQuestion.type,
      timeTaken,
      confidence: conf
    });

    // Adapt difficulty
    let newStreak = correct ? Math.max(1, streak + 1) : Math.min(-1, streak - 1);
    let newDifficulty = difficulty;

    if (newStreak >= 2) {
      if (difficulty === 'Easy') newDifficulty = 'Medium';
      else if (difficulty === 'Medium') newDifficulty = 'Hard';
      else if (difficulty === 'Hard') newDifficulty = 'Challenge';
      newStreak = 0;
    } else if (newStreak <= -2) {
      if (difficulty === 'Challenge') newDifficulty = 'Hard';
      else if (difficulty === 'Hard') newDifficulty = 'Medium';
      else if (difficulty === 'Medium') newDifficulty = 'Easy';
      newStreak = 0;
    }

    // Confidence overrides
    if (!correct && conf === 'Very Confident') {
      // Punish hubris
      if (difficulty === 'Challenge') newDifficulty = 'Medium';
      else if (difficulty === 'Hard') newDifficulty = 'Easy';
      newStreak = 0;
    }

    setStreak(newStreak);
    setDifficulty(newDifficulty);
  };

  const nextQuestion = async () => {
    if (completedQuestions + 1 >= TOTAL_QUESTIONS_PER_SESSION) {
      setAskedIds(prev => new Set(prev).add(currentQuestion.id));
      await finishSession();
      setGameState('report');
    } else {
      setAskedIds(prev => new Set(prev).add(currentQuestion.id));
      setCompletedQuestions(c => c + 1);
      setSelectedAnswer(null);
      setConfidence(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setQuestionStartTime(Date.now());
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Generating Quiz Bank...</p>
      </div>
    );
  }

  if (error || quizData?.status === 'failed') {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Quiz Generation Failed</h3>
        <p className="text-red-400/80">{error || quizData?.error_message}</p>
      </div>
    );
  }

  if (!quizData || quizData.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">AI is building your personalized quiz bank...</p>
      </div>
    );
  }

  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Adaptive AI Quiz</h2>
        <p className="text-muted-foreground max-w-lg mb-8">
          This isn't a normal quiz. The AI will adapt to your knowledge level in real-time. It analyzes your confidence and correctness to find the perfect difficulty curve.
        </p>
        <Button size="lg" onClick={handleStart} className="px-8">
          <Play className="w-4 h-4 mr-2" /> Start Session
        </Button>
      </div>
    );
  }

  if (gameState === 'report') {
    return <QuizReport documentId={documentId} sessionId={session?.id} getAnalytics={getAnalytics} />;
  }

  // Active Game State
  if (!currentQuestion) return <div>No questions available.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium px-3 py-1 bg-white/5 rounded-full border border-white/10">
            {completedQuestions + 1} / {TOTAL_QUESTIONS_PER_SESSION}
          </span>
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
            difficulty === 'Easy' && 'bg-green-500/20 text-green-400',
            difficulty === 'Medium' && 'bg-blue-500/20 text-blue-400',
            difficulty === 'Hard' && 'bg-orange-500/20 text-orange-400',
            difficulty === 'Challenge' && 'bg-red-500/20 text-red-400'
          )}>
            {difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          <span>Topic: {currentQuestion.topic}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 rounded-full mb-12 overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(completedQuestions / TOTAL_QUESTIONS_PER_SESSION) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#111] border border-white/10 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-medium mb-8 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {!showFeedback ? (
            <div className="space-y-4">
              {currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false' ? (
                (currentQuestion.options || (currentQuestion.type === 'true_false' ? ['True', 'False'] : [])).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(opt)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      selectedAnswer === opt 
                        ? "border-primary bg-primary/10" 
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    {opt}
                  </button>
                ))
              ) : (
                <input
                  type="text"
                  placeholder="Type your answer..."
                  className="w-full bg-transparent border-b border-white/20 p-4 text-xl outline-none focus:border-primary transition-colors"
                  value={selectedAnswer || ''}
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-xl border flex items-start gap-4",
                isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
              )}>
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                )}
                <div>
                  <h4 className={cn("text-lg font-bold mb-2", isCorrect ? "text-green-500" : "text-red-500")}>
                    {isCorrect ? 'Correct!' : 'Not quite.'}
                  </h4>
                  {!isCorrect && (
                    <p className="text-white/80 mb-4">
                      The correct answer is: <strong className="text-white">{currentQuestion.correct_answer}</strong>
                    </p>
                  )}
                  <p className="text-white/70 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 bg-white/5" onClick={() => window.scrollTo(0,0)}>
                  <BookOpen className="w-4 h-4 mr-2" /> Study Guide
                </Button>
                <Button variant="outline" className="flex-1 bg-white/5" onClick={() => window.scrollTo(0,0)}>
                  <Layers className="w-4 h-4 mr-2" /> Flashcard
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        {!showFeedback ? (
          selectedAnswer ? (
            <div className="w-full flex flex-col gap-4">
              <p className="text-center text-muted-foreground text-sm font-medium">How confident are you?</p>
              <div className="grid grid-cols-4 gap-4">
                {['Guessing', 'Unsure', 'Confident', 'Very Confident'].map(conf => (
                  <Button key={conf} variant="outline" className="bg-white/5 hover:bg-white/10" onClick={() => handleConfidence(conf)}>
                    {conf}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Button disabled className="opacity-50">Select an answer</Button>
          )
        ) : (
          <Button size="lg" onClick={nextQuestion}>
            {completedQuestions + 1 >= TOTAL_QUESTIONS_PER_SESSION ? 'Finish Quiz' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  );
}
