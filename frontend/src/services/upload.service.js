import { supabase } from '@/lib/supabase';

export const uploadService = {
  uploadDocument: async (file, userId) => {
    try {
      // 1. Upload to Supabase Storage
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      const storagePath = `${userId}/${timestamp}_${sanitizedFilename}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // 2. Insert into documents table
      const { data: dbData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: file.name,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.type || 'application/pdf',
          status: 'uploaded',
          processing_progress: 0,
          processing_stage: 'Uploaded'
        })
        .select()
        .single();

      if (dbError) {
        // If DB insertion fails, optionally clean up storage? (Skipping for now to ensure robustness)
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      return dbData;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
};
