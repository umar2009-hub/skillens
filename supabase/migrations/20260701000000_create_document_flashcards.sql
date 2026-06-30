CREATE TABLE IF NOT EXISTS public.document_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  processing_time_ms INTEGER,
  status TEXT DEFAULT 'processing',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  model_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for document_flashcards
ALTER TABLE public.document_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document flashcards" 
  ON public.document_flashcards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert document flashcards" 
  ON public.document_flashcards FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can update document flashcards" 
  ON public.document_flashcards FOR UPDATE 
  USING (true);


-- Table for tracking individual user progress on flashcards (Architecture for Learning DNA)
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  flashcard_id TEXT NOT NULL, -- UUID generated in JSON by Gemini
  confidence TEXT, -- 'knew_it', 'needs_revision'
  bookmarked BOOLEAN DEFAULT false,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  mastery_level INTEGER DEFAULT 0, -- numeric representation of mastery
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, document_id, flashcard_id)
);

-- Enable RLS for user_flashcard_progress
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own flashcard progress" 
  ON public.user_flashcard_progress FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
