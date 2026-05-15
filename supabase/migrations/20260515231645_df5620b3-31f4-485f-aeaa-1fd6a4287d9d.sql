
-- Make pure compute RPCs run as the caller (no elevated rights needed)
ALTER FUNCTION public.compute_visual_chain_recommendation(jsonb) SECURITY INVOKER;
ALTER FUNCTION public.compute_rsvp_recommendation(jsonb) SECURITY INVOKER;

-- Lock down EXECUTE: deny anon, allow only authenticated callers
REVOKE ALL ON FUNCTION public.compute_visual_chain_recommendation(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.compute_rsvp_recommendation(jsonb) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.compute_visual_chain_recommendation(jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.compute_rsvp_recommendation(jsonb) TO authenticated, service_role;
