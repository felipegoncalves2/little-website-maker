-- Fix security issue: Enable RLS on anexosjustify table
ALTER TABLE public.anexosjustify ENABLE ROW LEVEL SECURITY;

-- Add basic policy for anexosjustify (adjust as needed for your business logic)
CREATE POLICY "Allow authenticated users full access to anexosjustify" 
ON public.anexosjustify 
FOR ALL 
USING (auth.role() = 'authenticated');

-- The other warnings (extension in public and auth OTP expiry) are not critical 
-- and can be addressed separately if needed