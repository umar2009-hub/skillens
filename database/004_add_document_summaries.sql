-- Create document_summaries table
CREATE TABLE IF NOT EXISTS public.document_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  executive_summary TEXT,
  key_concepts JSONB,
  topics JSONB,
  difficulty_level TEXT,
  estimated_study_time JSONB,
  model_name TEXT,
  processing_time_ms INTEGER,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id)
);

-- Enable Row Level Security
ALTER TABLE public.document_summaries ENABLE ROW LEVEL SECURITY;

-- Document Summaries Policies
CREATE POLICY "Users can view own document summaries" 
ON public.document_summaries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document summaries" 
ON public.document_summaries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document summaries" 
ON public.document_summaries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own document summaries" 
ON public.document_summaries FOR DELETE 
USING (auth.uid() = user_id);
