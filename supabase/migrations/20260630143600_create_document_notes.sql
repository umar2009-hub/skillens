CREATE TABLE IF NOT EXISTS public.document_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  overview TEXT,
  estimated_study_time TEXT,
  difficulty TEXT,
  learning_outcomes JSONB,
  prerequisites JSONB,
  revision_priority TEXT,
  total_topics INTEGER,
  sections JSONB,
  processing_time_ms INTEGER,
  status TEXT DEFAULT 'processing',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  model_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.document_notes ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own document notes" 
  ON public.document_notes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert document notes" 
  ON public.document_notes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can update document notes" 
  ON public.document_notes FOR UPDATE 
  USING (true);
