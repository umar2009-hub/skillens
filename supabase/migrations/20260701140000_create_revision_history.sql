CREATE TABLE IF NOT EXISTS public.revision_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'skipped', 'postponed')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.revision_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revision history"
  ON public.revision_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revision history"
  ON public.revision_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revision history"
  ON public.revision_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage revision history"
  ON public.revision_history FOR ALL
  USING (true)
  WITH CHECK (true);
