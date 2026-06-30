import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { UploadSuccessState } from '@/components/upload/UploadSuccessState';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto relative min-h-[80vh] pt-10">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center -z-10">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-500/20 to-purple-600/10 blur-[100px] absolute -top-40" />
      </div>

      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Button>
      </div>

      <UploadSuccessState documentId={id} />
    </motion.div>
  );
}
