-- Add organization field to supply_justifications table
ALTER TABLE public.supply_justifications 
ADD COLUMN organizacao text;

-- Update the validation trigger to allow longer justifications if needed
-- The existing trigger validates 250 characters, keeping that limit