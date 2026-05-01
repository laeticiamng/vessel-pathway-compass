-- Web Vitals tracking table
CREATE TABLE public.web_vitals (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metric TEXT NOT NULL CHECK (metric IN ('LCP','CLS','INP','FCP','TTFB')),
  value DOUBLE PRECISION NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good','needs-improvement','poor')),
  navigation_type TEXT,
  path TEXT NOT NULL,
  session_id TEXT,
  connection_type TEXT,
  user_agent TEXT,
  app_version TEXT
);

CREATE INDEX idx_web_vitals_metric_created ON public.web_vitals (metric, created_at DESC);
CREATE INDEX idx_web_vitals_path_created ON public.web_vitals (path, created_at DESC);

ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) may insert a measurement
CREATE POLICY "Anyone can insert web vitals"
  ON public.web_vitals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read web vitals"
  ON public.web_vitals FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- No update/delete policies → table is append-only

COMMENT ON TABLE public.web_vitals IS 'Real User Monitoring (RUM) for Core Web Vitals. Append-only.';