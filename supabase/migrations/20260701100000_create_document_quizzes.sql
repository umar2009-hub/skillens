CREATE TABLE IF NOT EXISTS public.document_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  processing_time_ms INTEGER,
  status TEXT DEFAULT 'processing',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  model_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for document_quizzes
ALTER TABLE public.document_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document quizzes" 
  ON public.document_quizzes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert document quizzes" 
  ON public.document_quizzes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can update document quizzes" 
  ON public.document_quizzes FOR UPDATE 
  USING (true);


-- Table for tracking quiz sessions
CREATE TABLE IF NOT EXISTS public.user_quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.document_quizzes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress'
);

ALTER TABLE public.user_quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quiz sessions" 
  ON public.user_quiz_sessions FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- Table for tracking individual quiz attempts
CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.document_quizzes(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  difficulty TEXT,
  topic TEXT,
  question_type TEXT,
  time_taken INTEGER,
  confidence TEXT,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quiz attempts" 
  ON public.user_quiz_attempts FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
