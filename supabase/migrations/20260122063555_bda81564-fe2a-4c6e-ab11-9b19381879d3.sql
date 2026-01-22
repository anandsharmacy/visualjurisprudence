-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  years_of_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_expertise junction table for expertise areas
CREATE TABLE public.user_expertise (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, expertise)
);

-- Create legal_cases table for storing cases
CREATE TABLE public.legal_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  citation TEXT NOT NULL,
  year INTEGER NOT NULL,
  court TEXT NOT NULL,
  verdict TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can read/update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User expertise policies
CREATE POLICY "Users can view their own expertise"
  ON public.user_expertise FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expertise"
  ON public.user_expertise FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expertise"
  ON public.user_expertise FOR DELETE
  USING (auth.uid() = user_id);

-- Legal cases policies: all authenticated users can read, only creator can modify
CREATE POLICY "Authenticated users can view all cases"
  ON public.legal_cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cases"
  ON public.legal_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own cases"
  ON public.legal_cases FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own cases"
  ON public.legal_cases FOR DELETE
  USING (auth.uid() = created_by);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_cases_updated_at
  BEFORE UPDATE ON public.legal_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample cases
INSERT INTO public.legal_cases (name, citation, year, court, verdict, summary, tags) VALUES
  ('Assoc. for Democratic Reforms v. Union of India', '(2024) 5 SCC 1', 2024, 'Supreme Court', 'Allowed', 'Landmark ruling striking down the Electoral Bonds Scheme as unconstitutional for violating right to information.', ARRAY['Constitutional Law']),
  ('V. Senthil Balaji v. State', '2023 SCC OnLine SC 934', 2023, 'Supreme Court', 'Dismissed', 'Regarding powers of ED for police custody; petition dismissed, upholding ED''s powers under PMLA.', ARRAY['Criminal Law', 'PMLA']),
  ('In Re: Article 370 of the Constitution', '2023 INSC 1058', 2023, 'Supreme Court', 'Allowed', 'Upheld the abrogation of Article 370, stating it was a temporary provision.', ARRAY['Constitutional Law']),
  ('Supriyo v. Union of India', '(2023) 15 SCC 1', 2023, 'Supreme Court', 'Dismissed', 'Declined to recognize same-sex marriage under existing laws, leaving legislative reform to Parliament.', ARRAY['Constitutional Law', 'Civil Rights']),
  ('Bilkis Yakub Rasool v. State of Gujarat', '2024 INSC 23', 2024, 'Supreme Court', 'Allowed', 'Supreme Court quashed the remission granted to convicts, ordering them to return to custody.', ARRAY['Criminal Law']),
  ('State of Punjab v. Davinder Singh', '(2024) 6 SCC 1', 2024, 'Supreme Court', 'Allowed', 'Seven-judge bench upheld sub-classification within Scheduled Castes for reservation purposes.', ARRAY['Constitutional Law', 'Reservation']);