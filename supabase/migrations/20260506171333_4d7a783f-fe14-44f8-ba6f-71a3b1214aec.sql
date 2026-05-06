
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, listing_id)
);

CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers who chatted can insert review"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND reviewer_id <> seller_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.buyer_id = auth.uid()
        AND c.seller_id = reviews.seller_id
        AND c.listing_id = reviews.listing_id
    )
  );

CREATE POLICY "Reviewers can update own review"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can delete own review"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (reviewer_id = auth.uid());
