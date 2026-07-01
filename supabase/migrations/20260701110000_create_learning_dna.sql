-- Create the Learning DNA table
CREATE TABLE IF NOT EXISTS public.user_learning_dna (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE, -- NULL means global stats
  
  -- Core Metrics (0-100 scale where applicable)
  knowledge_score INTEGER DEFAULT 0,
  accuracy_score INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  
  -- Engagement Metrics
  study_time INTEGER DEFAULT 0, -- in seconds
  average_response_time INTEGER DEFAULT 0, -- in seconds
  learning_velocity INTEGER DEFAULT 0, -- trend indicator (-100 to +100)
  
  -- Topic Mastery (JSON arrays of topic strings)
  topics_mastered JSONB DEFAULT '[]'::jsonb,
  topics_to_improve JSONB DEFAULT '[]'::jsonb,
  revision_priority JSONB DEFAULT '[]'::jsonb,
  
  -- Activity Counters
  documents_completed INTEGER DEFAULT 0,
  flashcards_reviewed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  
  -- Timestamps for context
  last_quiz_score INTEGER,
  last_study_session TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Enforce one global record per user, and one record per document per user
  UNIQUE NULLS NOT DISTINCT (user_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_learning_dna ENABLE ROW LEVEL SECURITY;

-- Users can read their own DNA
CREATE POLICY "Users can view own learning dna" 
  ON public.user_learning_dna FOR SELECT 
  USING (auth.uid() = user_id);

-- Service role can manage all DNA (since calculations happen on backend)
CREATE POLICY "Service role can manage learning dna" 
  ON public.user_learning_dna FOR ALL 
  USING (true)
  WITH CHECK (true);
