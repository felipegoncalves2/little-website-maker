-- Create supply_justifications table
CREATE TABLE public.supply_justifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  printer_serial_number TEXT NOT NULL,
  supply_serial_number TEXT NOT NULL,
  last_read_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_read_level NUMERIC NOT NULL,
  justification TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.supply_justifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own justifications" 
ON public.supply_justifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own justifications" 
ON public.supply_justifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own justifications" 
ON public.supply_justifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own justifications" 
ON public.supply_justifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_supply_justifications_updated_at
BEFORE UPDATE ON public.supply_justifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create validation trigger for justification length (250 characters)
CREATE OR REPLACE FUNCTION validate_justification_length()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(NEW.justification) > 250 THEN
    RAISE EXCEPTION 'Justification cannot exceed 250 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_justification_before_insert_update
BEFORE INSERT OR UPDATE ON public.supply_justifications
FOR EACH ROW
EXECUTE FUNCTION validate_justification_length();