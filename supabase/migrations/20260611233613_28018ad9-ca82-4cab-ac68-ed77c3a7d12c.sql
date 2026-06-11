-- 1) Remove stale role column from profiles. Roles live exclusively in public.user_roles.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 2) Tighten DICOM storage policies so the general "<uid>/..." path policies
--    cannot overlap with the recon-inputs convention. Recon-inputs files are
--    governed by dedicated policies that enforce folder[1]='recon-inputs' and
--    folder[2]=auth.uid().
DROP POLICY IF EXISTS "Users can view own DICOM files"   ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own DICOM files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own DICOM files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own DICOM files" ON storage.objects;

CREATE POLICY "Users can view own DICOM files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'dicom-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND COALESCE((storage.foldername(name))[1], '') <> 'recon-inputs'
);

CREATE POLICY "Users can upload own DICOM files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dicom-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND COALESCE((storage.foldername(name))[1], '') <> 'recon-inputs'
);

CREATE POLICY "Users can update own DICOM files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'dicom-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND COALESCE((storage.foldername(name))[1], '') <> 'recon-inputs'
);

CREATE POLICY "Users can delete own DICOM files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'dicom-uploads'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND COALESCE((storage.foldername(name))[1], '') <> 'recon-inputs'
);