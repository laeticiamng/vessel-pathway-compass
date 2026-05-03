
-- 1. Stripe webhook events: explicit anon deny
DROP POLICY IF EXISTS "Deny anon access to stripe webhook events" ON public.stripe_webhook_events;
CREATE POLICY "Deny anon access to stripe webhook events"
ON public.stripe_webhook_events
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Subscriptions: block client-side writes (only service role can write)
DROP POLICY IF EXISTS "Block client subscription inserts" ON public.subscriptions;
CREATE POLICY "Block client subscription inserts"
ON public.subscriptions
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client subscription updates" ON public.subscriptions;
CREATE POLICY "Block client subscription updates"
ON public.subscriptions
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client subscription deletes" ON public.subscriptions;
CREATE POLICY "Block client subscription deletes"
ON public.subscriptions
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (false);

-- 3. Web vitals: restrict insert to authenticated users
DROP POLICY IF EXISTS "Anyone can insert web vitals" ON public.web_vitals;
CREATE POLICY "Authenticated users can insert web vitals"
ON public.web_vitals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
