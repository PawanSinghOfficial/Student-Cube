
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (user_id uuid, first_name text, username text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, first_name, username, created_at
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;
