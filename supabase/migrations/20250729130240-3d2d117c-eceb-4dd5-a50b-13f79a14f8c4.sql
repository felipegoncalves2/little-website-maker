-- Fix security issues by setting search_path on functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION validate_justification_length()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(NEW.justification) > 250 THEN
    RAISE EXCEPTION 'Justification cannot exceed 250 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;