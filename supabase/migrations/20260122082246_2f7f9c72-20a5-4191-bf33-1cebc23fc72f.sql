-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all cases" ON public.legal_cases;

-- Create a more explicit policy that properly validates authentication
CREATE POLICY "Authenticated users can view all cases" 
ON public.legal_cases 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);