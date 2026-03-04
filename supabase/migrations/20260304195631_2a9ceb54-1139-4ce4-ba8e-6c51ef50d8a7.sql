
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'forum_reply', 'expert_response', 'follow_up_reminder', 'case_update'
  title text NOT NULL,
  body text,
  reference_type text, -- 'forum_post', 'expert_request', 'case', 'patient'
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- System/triggers can insert notifications (via security definer functions)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Index for fast lookup
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);

-- Trigger function: notify on forum reply
CREATE OR REPLACE FUNCTION public.notify_forum_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is a reply (has parent_id), notify the parent author
  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, reference_type, reference_id)
    SELECT fp.user_id, 'forum_reply', 'New reply to your post', NEW.title, 'forum_post', NEW.id
    FROM public.forum_posts fp
    WHERE fp.id = NEW.parent_id AND fp.user_id != NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_forum_reply_notification
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_forum_reply();

-- Trigger function: notify on expert response
CREATE OR REPLACE FUNCTION public.notify_expert_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, reference_type, reference_id)
  SELECT er.requester_id, 'expert_response', 'Expert responded to your request', er.title, 'expert_request', er.id
  FROM public.expert_requests er
  WHERE er.id = NEW.request_id AND er.requester_id != NEW.expert_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_expert_response_notification
  AFTER INSERT ON public.expert_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expert_response();

-- Trigger function: notify on case event (follow-up reminders)
CREATE OR REPLACE FUNCTION public.notify_case_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.event_type = 'follow_up' THEN
    INSERT INTO public.notifications (user_id, type, title, body, reference_type, reference_id)
    VALUES (NEW.created_by, 'follow_up_reminder', 'Follow-up reminder', NEW.title, 'case', NEW.case_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_case_event_notification
  AFTER INSERT ON public.case_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_case_event();
