
CREATE OR REPLACE FUNCTION public.governance_events_for_user(
  _user uuid,
  _category text DEFAULT NULL,
  _institution uuid DEFAULT NULL,
  _from timestamptz DEFAULT NULL,
  _to timestamptz DEFAULT NULL,
  _recommended text DEFAULT NULL,
  _current text DEFAULT NULL,
  _limit integer DEFAULT 1000,
  _offset integer DEFAULT 0
)
RETURNS SETOF public.governance_events
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND _user <> auth.uid() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT ge.*
  FROM public.governance_events ge
  WHERE ge.event_category IN ('visual_chain','rsvp')
    AND (_category IS NULL OR ge.event_category = _category)
    AND (_institution IS NULL OR ge.institution_id = _institution)
    AND (_from IS NULL OR ge.created_at >= _from)
    AND (_to IS NULL OR ge.created_at <= _to)
    AND (
      _recommended IS NULL
      OR ge.context->>'recommended_layer' = _recommended
      OR ge.context->>'recommended_level' = _recommended
    )
    AND (
      _current IS NULL
      OR ge.context->>'current_layer' = _current
      OR ge.context->>'requested_level' = _current
    )
    AND (
      public.has_role(_user, 'super_admin')
      OR public.has_role(_user, 'admin')
      OR (
        public.has_role(_user, 'hospital_admin')
        AND ge.institution_id IN (SELECT public.user_institution_ids(_user))
      )
    )
  ORDER BY ge.created_at DESC, ge.id DESC
  LIMIT _limit OFFSET _offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.governance_events_count_for_user(
  _user uuid,
  _category text DEFAULT NULL,
  _institution uuid DEFAULT NULL,
  _from timestamptz DEFAULT NULL,
  _to timestamptz DEFAULT NULL,
  _recommended text DEFAULT NULL,
  _current text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _n bigint;
BEGIN
  IF auth.uid() IS NOT NULL AND _user <> auth.uid() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT count(*)::bigint INTO _n
  FROM public.governance_events ge
  WHERE ge.event_category IN ('visual_chain','rsvp')
    AND (_category IS NULL OR ge.event_category = _category)
    AND (_institution IS NULL OR ge.institution_id = _institution)
    AND (_from IS NULL OR ge.created_at >= _from)
    AND (_to IS NULL OR ge.created_at <= _to)
    AND (
      _recommended IS NULL
      OR ge.context->>'recommended_layer' = _recommended
      OR ge.context->>'recommended_level' = _recommended
    )
    AND (
      _current IS NULL
      OR ge.context->>'current_layer' = _current
      OR ge.context->>'requested_level' = _current
    )
    AND (
      public.has_role(_user, 'super_admin')
      OR public.has_role(_user, 'admin')
      OR (
        public.has_role(_user, 'hospital_admin')
        AND ge.institution_id IN (SELECT public.user_institution_ids(_user))
      )
    );

  RETURN _n;
END;
$$;
