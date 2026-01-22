-- Create table for user view history
CREATE TABLE public.user_view_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by user
CREATE INDEX idx_user_view_history_user_id ON public.user_view_history(user_id);
CREATE INDEX idx_user_view_history_viewed_at ON public.user_view_history(user_id, viewed_at DESC);

-- Create unique constraint to prevent duplicate entries for same user-case combo
CREATE UNIQUE INDEX idx_user_view_history_unique ON public.user_view_history(user_id, case_id);

-- Enable Row Level Security
ALTER TABLE public.user_view_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own history"
ON public.user_view_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
ON public.user_view_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history"
ON public.user_view_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
ON public.user_view_history
FOR DELETE
USING (auth.uid() = user_id);