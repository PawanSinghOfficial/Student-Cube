
-- 1. Profiles: stop exposing email to conversation participants. 
-- Drop the broad participant SELECT policy; chat code will use the get_public_profile RPC instead.
DROP POLICY IF EXISTS "Conversation participants can view profiles" ON public.profiles;

-- 2. Reviews: lock down UPDATE so reviewer cannot reassign seller_id/listing_id.
DROP POLICY IF EXISTS "Reviewers can update own review" ON public.reviews;
CREATE POLICY "Reviewers can update own review"
  ON public.reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (
    reviewer_id = auth.uid()
    AND seller_id = (SELECT r.seller_id FROM public.reviews r WHERE r.id = reviews.id)
    AND listing_id = (SELECT r.listing_id FROM public.reviews r WHERE r.id = reviews.id)
  );

-- 3. user_roles: explicit INSERT/UPDATE/DELETE policies restricted to admins; block self-elevation.
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Storage: scope listings uploads to the uploader's own folder.
DROP POLICY IF EXISTS "Authenticated users can upload listing files" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Storage: prevent listing/enumerating files via SELECT on storage.objects.
-- Public buckets still serve files via public URL without needing a SELECT policy.
DROP POLICY IF EXISTS "Anyone can view listing files" ON storage.objects;
DROP POLICY IF EXISTS "Chat images are publicly viewable" ON storage.objects;
