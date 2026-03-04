
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialty text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
