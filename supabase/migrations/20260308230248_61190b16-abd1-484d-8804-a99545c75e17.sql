CREATE POLICY "Deny all access to authenticated users"
ON public.stripe_webhook_events
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);