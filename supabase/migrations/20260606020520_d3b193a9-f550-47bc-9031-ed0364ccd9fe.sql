
DROP POLICY IF EXISTS "Anyone can view approved or sold listings" ON public.listings;
CREATE POLICY "Anyone can view approved sold or frozen listings"
ON public.listings FOR SELECT
USING (status IN ('approved','sold','frozen'));
