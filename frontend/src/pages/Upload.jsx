import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/constants/animations';
import { Card } from '@/components/ui/Card';
import { Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Upload() {
  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Upload Documents</h2>
      </div>
      <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 bg-muted/20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
          <UploadIcon size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Drag and drop your files</h3>
        <p className="text-muted-foreground max-w-sm mb-8">
          Upload PDFs, documents or slides. Our AI will analyze them and prepare your custom learning experience.
        </p>
        <Button size="lg">Select Files</Button>
      </Card>
    </motion.div>
  )
}
