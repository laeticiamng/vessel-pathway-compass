
-- Step 1: Remove duplicate notification triggers (keep only trg_notify_*)
DROP TRIGGER IF EXISTS on_case_event ON case_events;
DROP TRIGGER IF EXISTS trg_case_event_notification ON case_events;
DROP TRIGGER IF EXISTS on_expert_response ON expert_responses;
DROP TRIGGER IF EXISTS trg_expert_response_notification ON expert_responses;
DROP TRIGGER IF EXISTS on_forum_reply ON forum_posts;
DROP TRIGGER IF EXISTS trg_forum_reply_notification ON forum_posts;

-- Step 2: Create dicom-uploads bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('dicom-uploads', 'dicom-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for dicom-uploads
CREATE POLICY "Users can view own DICOM files" ON storage.objects FOR SELECT
  USING (bucket_id = 'dicom-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own DICOM files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dicom-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own DICOM files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'dicom-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own DICOM files" ON storage.objects FOR DELETE
  USING (bucket_id = 'dicom-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Step 3: RLS policy for admin to read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );
