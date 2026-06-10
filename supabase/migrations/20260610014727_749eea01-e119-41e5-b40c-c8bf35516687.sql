
-- Add referral fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Function to generate a unique 8-char alphanumeric referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Backfill referral codes for existing profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE user_id = r.user_id;
  END LOOP;
END $$;

-- Update handle_new_user to assign referral code and capture referred_by from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referred_by UUID;
  v_ref_code TEXT;
BEGIN
  v_ref_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_ref_code IS NOT NULL AND length(v_ref_code) > 0 THEN
    SELECT user_id INTO v_referred_by FROM public.profiles WHERE referral_code = upper(v_ref_code) LIMIT 1;
  END IF;

  INSERT INTO public.profiles (user_id, email, first_name, username, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    public.generate_referral_code(),
    v_referred_by
  );
  RETURN NEW;
END;
$$;

-- Allow public read of (user_id, referral_code) so codes can be validated/looked up; already covered by existing profile policies typically. Skip changes to policies.
