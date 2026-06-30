import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { UploadQueue } from '@/components/upload/UploadQueue';
import { ProcessingTimeline } from '@/components/upload/ProcessingTimeline';
import { UploadSuccessState } from '@/components/upload/UploadSuccessState';
import { UploadErrorState } from '@/components/upload/UploadErrorState';
import { RecentUploads } from '@/components/upload/RecentUploads';
import { UploadStatistics } from '@/components/upload/UploadStatistics';
import { AIConfidencePanel } from '@/components/upload/AIConfidencePanel';
import { Button } from '@/components/ui/Button';
import { Upload as UploadIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadService } from '@/services/upload.service';
import toast from 'react-hot-toast';

const mockMessages = [
  "Initializing AI Engine...",
  "Reading page 2 of 15...",
  "Detected 12 concepts...",
  "Reading page 7 of 15...",
  "Extracting important definitions...",
  "Generating 34 flashcards...",
  "Building 10 quiz questions...",
  "Generating 58 flashcards...",
  "Building 20 quiz questions...",
  "Preparing personalized learning profile...",
  "Finalizing outputs..."
];

export function Upload() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | success
  const [processingStep, setProcessingStep] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]); // store successful docs

  const handleFilesSelected = (newFiles) => {
    setError(null);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleError = (msg) => {
    setError(msg);
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove));
  };

  const handleStartUpload = async () => {
    if (files.length === 0) return;
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }
    
    setStatus('uploading');
    setError(null);

    // 1. Perform Real Upload to Supabase
    const successfulUploads = [];
    try {
      // Process files sequentially to maintain order and simplify error handling
      for (const file of files) {
        const doc = await uploadService.uploadDocument(file, user.id);
        successfulUploads.push(doc);
      }
      setUploadedDocs(successfulUploads);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Upload failed. Please try again.');
      setStatus('idle');
      return; // Stop here if upload fails
    }

    // 2. Upload Successful -> Transition to Processing Animation
    setStatus('processing');
    setProcessingStep(0);

    let step = 0;
    let msgIndex = 0;
    const maxSteps = 8; // 0 to 8
    
    setLiveMessage(mockMessages[0]);

    const interval = setInterval(() => {
      step++;
      setProcessingStep(step);
      
      msgIndex = (msgIndex + 1) % mockMessages.length;
      setLiveMessage(mockMessages[msgIndex]);
      
      if (step >= maxSteps) {
        clearInterval(interval);
        setTimeout(() => {
          setStatus('success');
          setLiveMessage("");
        }, 1000);
      }
    }, 1800);
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProcessingStep(0);
    setError(null);
    setLiveMessage("");
    setUploadedDocs([]);
  };

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto relative min-h-[80vh]">
      
      {/* Premium Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center -z-10">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-primary/30 to-purple-600/10 blur-[100px] absolute -top-40"
        />
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-8 pt-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">Teach SkillLens</h2>
        <p className="text-base md:text-lg text-muted-foreground">
          Upload your study material and let SkillLens understand, organize, and personalize your learning.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
            className="space-y-6"
          >
            <UploadErrorState error={error} onDismiss={() => setError(null)} />
            <UploadDropzone onFilesSelected={handleFilesSelected} onError={handleError} />
            <UploadQueue files={files} onRemoveFile={handleRemoveFile} status="ready" />
            
            {files.length > 0 && (
              <div className="flex justify-center pt-2">
                <Button 
                  onClick={handleStartUpload} 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 transition-all"
                >
                  <UploadIcon className="mr-2" />
                  Process Document{files.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
            
            <div className="pt-8">
              <UploadStatistics />
              <RecentUploads />
            </div>
          </motion.div>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <motion.div 
            key="processing" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            className="space-y-8"
          >
            <UploadQueue files={files} onRemoveFile={() => {}} status={status} />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 lg:col-span-8">
                <ProcessingTimeline currentStepIndex={processingStep} liveMessage={liveMessage} />
              </div>
              <div className="md:col-span-5 lg:col-span-4">
                <AIConfidencePanel isProcessing={status === 'processing'} />
              </div>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div key="success" className="pt-8">
            <UploadSuccessState onReset={handleReset} />
            <div className="mt-20">
              <RecentUploads />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
