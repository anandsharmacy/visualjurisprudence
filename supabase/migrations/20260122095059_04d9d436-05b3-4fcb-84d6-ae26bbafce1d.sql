-- Add last_hearing_date column to legal_cases table
ALTER TABLE public.legal_cases 
ADD COLUMN last_hearing_date DATE;