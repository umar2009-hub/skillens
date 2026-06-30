-- Add extraction metadata columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS character_count INTEGER,
ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER,
ADD COLUMN IF NOT EXISTS language TEXT;
