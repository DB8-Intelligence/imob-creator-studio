
-- Add new columns to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS property_type text DEFAULT 'apartamento',
  ADD COLUMN IF NOT EXISTS property_standard text DEFAULT 'medio',
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS investment_value numeric,
  ADD COLUMN IF NOT EXISTS built_area_m2 numeric,
  ADD COLUMN IF NOT EXISTS highlights text;
