import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card } from '@/components/ui/Card';
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const processingSteps = [
  "Reading document",
  "Extracting core concepts",
  "Generating smart notes",
  "Preparing adaptive quiz",
  "Structuring revision plan"
];

export function Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(0);

  const handleUpload = () => {
    setIsUploading(true);
    setStep(0);
    // Simulate processing steps
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 2000); // Wait a bit at the end
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Upload Material</h2>
          <p className="text-muted-foreground">Add PDFs or documents to generate your custom learning plan.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isUploading ? (
          <motion.div key="dropzone" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}>
            <div className="relative group cursor-pointer" onClick={handleUpload}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative flex flex-col items-center justify-center p-20 text-center border-dashed border-2 border-white/20 bg-background/50 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300 rounded-[2rem]">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-primary shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <UploadCloud size={40} className="group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Click or drag file to this area</h3>
                <p className="text-muted-foreground max-w-sm mb-8 text-lg">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.
                </p>
                <div className="flex gap-4 items-center text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText size={16}/> PDF</span>
                  <span className="flex items-center gap-1"><FileText size={16}/> DOCX</span>
                  <span className="flex items-center gap-1"><FileText size={16}/> TXT</span>
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-12">
            <Card className="p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step + 1) / processingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40" />
                <Sparkles size={40} className="text-primary animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-8">AI is analyzing your document</h3>
              
              <div className="space-y-4 max-w-sm mx-auto text-left">
                {processingSteps.map((s, i) => (
                  <div key={i} className={`flex items-center gap-4 transition-opacity duration-300 ${i > step ? 'opacity-30' : 'opacity-100'}`}>
                    {i < step ? (
                      <CheckCircle2 className="text-emerald-400" size={20} />
                    ) : i === step ? (
                      <Loader2 className="text-primary animate-spin" size={20} />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className={`font-medium ${i === step ? 'text-white' : 'text-muted-foreground'}`}>{s}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
