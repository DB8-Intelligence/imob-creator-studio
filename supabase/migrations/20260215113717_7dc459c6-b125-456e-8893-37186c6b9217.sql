
-- Create bucket for brand template assets (logos, frames)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('brand-assets', 'brand-assets', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets');

-- Allow authenticated users to delete brand assets
CREATE POLICY "Authenticated users can delete brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');

-- Public read access
CREATE POLICY "Brand assets are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');
