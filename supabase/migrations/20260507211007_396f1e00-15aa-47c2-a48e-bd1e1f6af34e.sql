
CREATE TABLE IF NOT EXISTS public.i18n_missing_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL,
  key text NOT NULL,
  route text,
  role text,
  reason text NOT NULL DEFAULT 'missing',
  app_version text,
  occurrences integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  bucket_day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date
);

CREATE UNIQUE INDEX IF NOT EXISTS i18n_missing_keys_uniq
  ON public.i18n_missing_keys (locale, key, COALESCE(route,''), COALESCE(role,''), bucket_day);

CREATE INDEX IF NOT EXISTS i18n_missing_keys_last_seen_idx
  ON public.i18n_missing_keys (last_seen_at DESC);

ALTER TABLE public.i18n_missing_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read i18n misses" ON public.i18n_missing_keys;
CREATE POLICY "admins read i18n misses"
  ON public.i18n_missing_keys
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
