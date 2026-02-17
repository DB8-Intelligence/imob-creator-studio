
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS language_style text DEFAULT 'formal',
  ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'medio';
