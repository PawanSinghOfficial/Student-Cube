
-- 1) Hide admin_notes on listings from clients (admin path can use service_role / RPC)
REVOKE SELECT (admin_notes) ON public.listings FROM anon, authenticated;

-- 2) Restrict message UPDATE to only read_at and offer_status columns
REVOKE UPDATE ON public.messages FROM anon, authenticated;
GRANT UPDATE (read_at, offer_status) ON public.messages TO authenticated;

-- 3) Hide email column on profiles from clients (self gets email from auth.user session)
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;

-- 4) Admin-only RPC to fetch emails for a set of users
CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin(_user_ids uuid[])
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.email
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND p.user_id = ANY(_user_ids);
$$;

REVOKE ALL ON FUNCTION public.get_user_emails_for_admin(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_emails_for_admin(uuid[]) TO authenticated;

-- 5) Storage: only original uploader can overwrite their files
CREATE POLICY "Users can update own chat images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'chat-images' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'chat-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own listing files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = (auth.uid())::text)
  WITH CHECK (bucket_id = 'listings' AND (storage.foldername(name))[1] = (auth.uid())::text);
