import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card } from '@/components/ui/Card';
import { BrainCircuit, Clock, Trophy, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const dummyQuestions = [
  {
    id: 1,
    question: "Which of the following hooks should be used for data fetching in React?",
    options: ["useFetch", "useEffect", "useState", "useData"],
    correct: 1
  },
  {
    id: 2,
    question: "What is the virtual DOM?",
    options: ["A direct copy of the real DOM", "A lightweight javascript representation of the DOM", "A browser extension", "A React component"],
    correct: 1
  }
];

export function Quiz() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleStart = () => setStarted(true);

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === dummyQuestions[currentQ].correct) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentQ < dummyQuestions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  return (
    <motion.div {...pageTransition} className="max-w-3xl mx-auto py-8">
      {!started ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-6 text-white shadow-xl shadow-primary/30">
            <BrainCircuit size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">React Mastery Quiz</h2>
          <p className="text-muted-foreground max-w-sm mb-8 text-lg">
            Test your knowledge based on the "React Internals" document you uploaded. 10 questions, 5 minutes.
          </p>
          <div className="flex gap-6 mb-8 text-sm font-medium text-white/70 bg-white/5 px-6 py-3 rounded-full border border-white/10">
            <span className="flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> 100 XP</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-blue-400"/> 5 Mins</span>
          </div>
          <Button size="lg" onClick={handleStart} className="w-full sm:w-auto px-12 h-14 text-lg">Start Quiz</Button>
        </Card>
      ) : showResult ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Card className="p-12 border-primary/30 bg-primary/5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20">
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground text-lg mb-8">You earned +100 XP</p>
            
            <div className="flex justify-center items-end gap-2 mb-10">
              <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                {Math.round((score / dummyQuestions.length) * 100)}%
              </span>
              <span className="text-xl text-muted-foreground mb-2 pb-1">Score</span>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>Retake Quiz</Button>
              <Button size="lg">Review Answers</Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Question {currentQ + 1} of {dummyQuestions.length}</span>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Clock size={14} className="text-orange-400 animate-pulse" /> 04:59
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-purple-500"
              initial={{ width: `${(currentQ / dummyQuestions.length) * 100}%` }}
              animate={{ width: `${((currentQ + 1) / dummyQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 md:p-10">
                <h3 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
                  {dummyQuestions[currentQ].question}
                </h3>
                
                <div className="space-y-4">
                  {dummyQuestions[currentQ].options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = i === dummyQuestions[currentQ].correct;
                    const showStatus = selected !== null;
                    
                    let bgClass = "bg-white/5 hover:bg-white/10 border-white/10 text-muted-foreground hover:text-white";
                    if (showStatus) {
                      if (isCorrect) bgClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                      else if (isSelected) bgClass = "bg-red-500/20 border-red-500/50 text-red-400";
                      else bgClass = "bg-white/5 border-white/5 text-muted-foreground opacity-50";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={showStatus}
                        className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${bgClass}`}
                      >
                        <span className="font-medium">{opt}</span>
                        {showStatus && isCorrect && <CheckCircle2 size={20} className="text-emerald-400" />}
                        {showStatus && isSelected && !isCorrect && <XCircle size={20} className="text-red-400" />}
                        {!showStatus && <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-primary transition-colors" />}
                      </button>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
