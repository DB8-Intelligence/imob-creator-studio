-- Create storage bucket for property media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-media', 
  'property-media', 
  true, 
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
);

-- Create storage bucket for exported creatives
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creatives', 
  'creatives', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS policies for property-media bucket
CREATE POLICY "Authenticated users can upload property media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-media');

CREATE POLICY "Anyone can view property media"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-media');

CREATE POLICY "Users can update their own property media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own property media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for creatives bucket
CREATE POLICY "Authenticated users can upload creatives"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Anyone can view creatives"
ON storage.objects FOR SELECT
USING (bucket_id = 'creatives');

CREATE POLICY "Users can update their own creatives"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own creatives"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])