CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'quiz', 'flashcards', 'reading', 'mentor'
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage study sessions"
  ON public.study_sessions FOR ALL
  USING (true)
  WITH CHECK (true);
