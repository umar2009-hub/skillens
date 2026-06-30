import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { UploadCard } from './UploadCard';

export function UploadQueue({ files, onRemoveFile, status }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 mt-8">
      <AnimatePresence mode="popLayout">
        {files.map((file, idx) => (
          <UploadCard 
            key={`${file.name}-${idx}`} 
            file={file} 
            onRemove={onRemoveFile} 
            status={status}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
