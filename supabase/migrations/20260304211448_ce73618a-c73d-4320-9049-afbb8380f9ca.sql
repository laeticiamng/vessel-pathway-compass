
-- Create forum_votes table
CREATE TABLE public.forum_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes
CREATE POLICY "Authenticated can view votes"
ON public.forum_votes
FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own votes
CREATE POLICY "Users can insert own votes"
ON public.forum_votes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
ON public.forum_votes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
ON public.forum_votes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
