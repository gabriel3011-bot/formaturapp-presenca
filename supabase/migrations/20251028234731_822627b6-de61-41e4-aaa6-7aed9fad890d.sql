-- Add UPDATE policy for members table
CREATE POLICY "Authenticated users can update members"
ON public.members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add length constraint to justification column
ALTER TABLE public.attendance 
ALTER COLUMN justification TYPE VARCHAR(1000);