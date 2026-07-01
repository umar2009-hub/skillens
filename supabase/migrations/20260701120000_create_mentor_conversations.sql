CREATE TABLE IF NOT EXISTS public.mentor_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster history retrieval per document
CREATE INDEX IF NOT EXISTS idx_mentor_conv_doc_user ON public.mentor_conversations(document_id, user_id);

-- Enable RLS
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversation history
CREATE POLICY "Users can view own mentor conversations" 
  ON public.mentor_conversations FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own messages, service role can insert model messages
CREATE POLICY "Users can insert own mentor conversations" 
  ON public.mentor_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mentor conversations" 
  ON public.mentor_conversations FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage mentor conversations" 
  ON public.mentor_conversations FOR ALL 
  USING (true)
  WITH CHECK (true);
