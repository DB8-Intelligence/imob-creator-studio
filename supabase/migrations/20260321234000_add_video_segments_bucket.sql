insert into storage.buckets (id, name, public)
select 'video-segments', 'video-segments', true
where not exists (select 1 from storage.buckets where id = 'video-segments');

create policy "Members can view video segment objects"
  on storage.objects for select
  using (
    bucket_id = 'video-segments'
  );

create policy "Authenticated users can upload video segment objects"
  on storage.objects for insert
  with check (
    bucket_id = 'video-segments'
    and auth.role() = 'authenticated'
  );
