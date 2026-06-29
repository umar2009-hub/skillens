import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Sparkles, Send, Bot, User, BookOpen, Lightbulb } from 'lucide-react';
import { Input } from '@/components/ui/Input';

const suggestedPrompts = [
  { icon: BookOpen, text: "Summarize chapter 3" },
  { icon: Lightbulb, text: "Explain React Hooks simply" },
  { icon: Sparkles, text: "Generate a practice quiz" },
];

export function AIMentor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Mentor. I've analyzed your recent uploads. What would you like to focus on today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "That's a great question. Based on the 'Machine Learning Fundamentals' document you uploaded, neural networks are designed to simulate the human brain's interconnected neuron structure. \n\nWould you like me to generate a quick quiz on this topic to test your understanding?",
        sources: ["Machine Learning Fundamentals.pdf", "Page 12"]
      }]);
    }, 2000);
  };

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">AI Mentor</h2>
          <p className="text-muted-foreground text-sm">Your personal tutor, available 24/7.</p>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden bg-background/40 border-white/5 relative z-10 shadow-2xl">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 text-primary mt-1">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md' 
                      : 'bg-white/5 text-foreground border border-white/10 rounded-tl-sm shadow-md'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.sources && (
                    <div className="flex gap-2 mt-2">
                      {msg.sources.map((src, idx) => (
                         <span key={idx} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1">
                           <BookOpen size={10} /> {src}
                         </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shrink-0 border border-white/10 text-white mt-1 shadow-sm">
                    U
                  </div>
                )}
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 text-primary mt-1">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm shadow-md flex gap-1 items-center h-12">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2 justify-center">
            {suggestedPrompts.map((prompt, i) => (
              <button 
                key={i}
                onClick={() => handleSend(prompt.text)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
              >
                <prompt.icon size={14} className="text-primary" />
                {prompt.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex gap-2 relative max-w-3xl mx-auto"
          >
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 rounded-2xl pl-4 pr-12 h-14 bg-white/5 border-white/10 text-base shadow-inner focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50" 
              placeholder="Ask a question about your study materials..." 
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white disabled:opacity-50 disabled:bg-white/10 hover:brightness-110 transition-all shadow-md"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-3">AI Mentor can make mistakes. Consider verifying important information.</p>
        </div>
      </Card>
    </motion.div>
  )
}
