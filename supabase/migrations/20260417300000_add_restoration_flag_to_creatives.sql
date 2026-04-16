-- Add restoration tracking to creatives_gallery
ALTER TABLE public.creatives_gallery
  ADD COLUMN IF NOT EXISTS restoration_applied boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_image_url  text;
