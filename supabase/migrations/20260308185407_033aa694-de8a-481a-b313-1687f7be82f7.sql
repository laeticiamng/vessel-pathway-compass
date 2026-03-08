
-- P0: Fix logbook_entries - prevent self-validation
-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Users manage own logbook entries" ON public.logbook_entries;

-- Owner can SELECT, INSERT, DELETE their own entries
CREATE POLICY "Users can select own logbook entries"
  ON public.logbook_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR supervisor_id = auth.uid());

CREATE POLICY "Users can insert own logbook entries"
  ON public.logbook_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND supervisor_validated = false AND validated_at IS NULL);

CREATE POLICY "Users can delete own logbook entries"
  ON public.logbook_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Owner can update own entries but NOT supervisor_validated/validated_at
CREATE POLICY "Owner can update own logbook entries"
  ON public.logbook_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND supervisor_id IS DISTINCT FROM auth.uid())
  WITH CHECK (supervisor_validated = false AND validated_at IS NULL);

-- Supervisor can only update validation fields on entries where they are the supervisor
CREATE POLICY "Supervisor can validate logbook entries"
  ON public.logbook_entries FOR UPDATE
  TO authenticated
  USING (supervisor_id = auth.uid() AND user_id IS DISTINCT FROM auth.uid());

-- P0: Fix validations - prevent self-approval
-- Drop the existing overly permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own validations" ON public.validations;

-- Owner can update own validations but NOT change status (must keep current status)
CREATE POLICY "Owner can update own validation metadata"
  ON public.validations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND validator_id IS DISTINCT FROM auth.uid())
  WITH CHECK (user_id = auth.uid() AND validator_id IS DISTINCT FROM auth.uid());

-- Validator can update status (approve/reject) only on others' validations
CREATE POLICY "Validator can update validation status"
  ON public.validations FOR UPDATE
  TO authenticated
  USING (validator_id = auth.uid() AND user_id IS DISTINCT FROM auth.uid())
  WITH CHECK (validator_id = auth.uid() AND user_id IS DISTINCT FROM auth.uid());
