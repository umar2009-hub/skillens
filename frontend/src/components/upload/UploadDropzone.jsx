import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

// A simple CSS particle effect using absolute positioning
const Sparkles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/60 rounded-full"
          initial={{ 
            x: Math.random() * 400 - 200, 
            y: Math.random() * 400 - 200, 
            opacity: 0 
          }}
          animate={{ 
            y: [null, Math.random() * -100 - 50],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            repeat: Infinity, 
            delay: Math.random() * 2 
          }}
        />
      ))}
    </div>
  );
};

const FlowchartIllustration = () => (
  <svg width="240" height="80" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 mx-auto">
    {/* PDF Node */}
    <rect x="10" y="20" width="40" height="40" rx="8" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>
    <path d="M25 35H35M25 40H35M25 45H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Line 1 */}
    <path d="M50 40H80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse text-primary/50" />
    <polygon points="80,36 86,40 80,44" fill="currentColor" className="text-primary/50" />

    {/* AI Brain Node */}
    <circle cx="106" cy="40" r="20" fill="var(--color-primary, #6366f1)" fillOpacity="0.1" stroke="var(--color-primary, #6366f1)" strokeWidth="2"/>
    <path d="M106 32C102 32 100 35 100 38C100 42 112 40 112 44C112 47 109 50 106 50" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Lines branching out */}
    <path d="M126 40H150" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse text-primary/50" />
    <path d="M150 40V25H160" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse text-primary/50" />
    <path d="M150 40V55H160" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse text-primary/50" />
    
    <polygon points="160,21 166,25 160,29" fill="currentColor" className="text-primary/50" />
    <polygon points="160,51 166,55 160,59" fill="currentColor" className="text-primary/50" />
    
    {/* Output Nodes */}
    <rect x="170" y="15" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>
    <rect x="170" y="45" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>
    
    <rect x="174" y="22" width="12" height="2" rx="1" fill="currentColor" />
    <rect x="174" y="27" width="8" height="2" rx="1" fill="currentColor" />
    <circle cx="180" cy="55" r="4" fill="currentColor" />
  </svg>
);

const FeatureChips = () => (
  <div className="flex flex-wrap justify-center gap-3 mt-8">
    {['PDF Only', 'Maximum 50 MB', 'Multiple PDFs', 'AI Analysis', 'Private & Secure'].map((chip, idx) => (
      <div key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground shadow-sm">
        <CheckCircle2 size={12} className="text-primary" />
        {chip}
      </div>
    ))}
  </div>
);

export function UploadDropzone({ onFilesSelected, onError }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFiles = (files) => {
    const validFiles = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') {
        onError('Unsupported file type. Please upload PDFs only.');
        hasError = true;
      } else if (file.size > 50 * 1024 * 1024) {
        onError(`File ${file.name} is too large. Maximum size is 50MB.`);
        hasError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (!hasError && validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        whileHover={{ scale: 1.01 }}
        animate={{ scale: isDragActive ? 1.02 : 1 }}
        className="relative group w-full cursor-pointer"
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Animated Glow Border/Background */}
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2rem] blur-xl transition-opacity duration-500 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
        
        {/* Main Dropzone Card */}
        <div className={`relative flex flex-col items-center justify-center py-16 px-6 md:px-12 text-center rounded-[2rem] border-2 transition-all duration-300 bg-background/60 backdrop-blur-xl overflow-hidden ${
          isDragActive 
            ? 'border-primary shadow-[0_0_40px_rgba(99,102,241,0.2)] bg-primary/5' 
            : 'border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5'
        }`}>
          
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            multiple
            onChange={handleChange}
          />
          
          <div className="relative z-10 flex flex-col items-center text-primary w-full">
            <FlowchartIllustration />
            
            <h3 className="text-2xl font-bold mb-3 text-white">Select or drag your PDF here</h3>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              We'll instantly break down your material into interactive notes, flashcards, and quizzes.
            </p>
            
            <FeatureChips />
          </div>
          
          {/* Decorative elements */}
          {(isDragActive || true) && <Sparkles />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
