import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Bot, User, Sparkles, BookOpen, Lightbulb, Activity, CheckCircle, GraduationCap } from 'lucide-react';
import { useMentor } from '@/hooks/useMentor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SMART_ACTIONS = [
  { label: 'Explain Simply', icon: <Lightbulb size={14} />, prompt: "Explain this topic as simply as possible, avoiding jargon." },
  { label: 'Summarize', icon: <BookOpen size={14} />, prompt: "Give me a brief summary of the most important points regarding this." },
  { label: 'Why was my answer wrong?', icon: <Activity size={14} />, prompt: "Why was my recent quiz answer wrong? Explain my mistake." },
  { label: 'Generate Question', icon: <CheckCircle size={14} />, prompt: "Generate a practice question for me to test my understanding." },
  { label: 'Interview Prep', icon: <GraduationCap size={14} />, prompt: "Ask me a tough interview question about this topic and evaluate my answer." },
];

export function PersonalAIMentor({ documentId = 'global', fullHeight = false }) {
  const { messages, isStreaming, sendMessage, clearHistory } = useMentor(documentId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleSmartAction = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div className={`flex flex-col ${fullHeight ? 'h-full' : 'h-[500px] md:h-[700px] max-h-[80vh]'} bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white leading-none">Personal AI Mentor</h3>
            <p className="text-xs text-muted-foreground mt-1">Powered by your Learning DNA</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
            <Bot size={48} className="text-emerald-500/50" />
            <div>
              <p className="text-lg text-white font-medium">I'm your AI Mentor!</p>
              <p className="text-sm max-w-sm mt-2">I know your study materials, your weak topics, and your quiz mistakes. Ask me anything!</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md">
              {SMART_ACTIONS.slice(0, 3).map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.prompt)}
                  className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs flex items-center gap-2 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                  <Bot size={16} />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none prose prose-invert prose-emerald max-w-none'
              }`}>
                {msg.role === 'model' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.message || (isStreaming && msg.isTemp ? '...' : '')}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Actions & Input */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="flex overflow-x-auto gap-2 pb-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {SMART_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSmartAction(action.prompt)}
              disabled={isStreaming}
              className="flex-shrink-0 snap-start px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action.icon} <span className="whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask your mentor a question..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
