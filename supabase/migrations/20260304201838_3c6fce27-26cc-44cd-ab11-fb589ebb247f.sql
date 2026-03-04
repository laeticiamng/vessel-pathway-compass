
-- Trigger: notify on forum reply
CREATE TRIGGER on_forum_reply
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  WHEN (NEW.parent_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_forum_reply();

-- Trigger: notify on expert response
CREATE TRIGGER on_expert_response
  AFTER INSERT ON public.expert_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expert_response();

-- Trigger: notify on follow-up case event
CREATE TRIGGER on_case_event
  AFTER INSERT ON public.case_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_case_event();
