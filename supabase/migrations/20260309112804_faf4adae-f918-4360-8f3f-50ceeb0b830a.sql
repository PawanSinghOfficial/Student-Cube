
-- Allow conversation participants to view each other's profiles
CREATE POLICY "Conversation participants can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT buyer_id FROM public.conversations WHERE seller_id = auth.uid()
      UNION
      SELECT seller_id FROM public.conversations WHERE buyer_id = auth.uid()
    )
  );
