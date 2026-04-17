-- Allow authenticated users to read all avatars (display in forum/collab UI)
DROP POLICY IF EXISTS "Authenticated read avatars" ON storage.objects;
CREATE POLICY "Authenticated read avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
