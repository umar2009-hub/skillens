-- Add missing columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_stage TEXT DEFAULT 'Uploaded';
