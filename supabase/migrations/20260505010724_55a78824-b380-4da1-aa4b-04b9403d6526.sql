DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
CREATE POLICY "Anyone can view approved or sold listings"
ON public.listings
FOR SELECT
TO public
USING (status IN ('approved', 'sold'));