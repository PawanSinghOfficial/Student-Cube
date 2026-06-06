
CREATE TABLE public.contact_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  amount integer NOT NULL DEFAULT 9,
  upi_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);

GRANT SELECT, INSERT ON public.contact_unlocks TO authenticated;
GRANT ALL ON public.contact_unlocks TO service_role;

ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers create their own unlock"
ON public.contact_unlocks FOR INSERT TO authenticated
WITH CHECK (
  buyer_id = auth.uid()
  AND buyer_id <> (SELECT user_id FROM public.listings WHERE id = listing_id)
);

CREATE POLICY "Buyers view their own unlocks"
ON public.contact_unlocks FOR SELECT TO authenticated
USING (buyer_id = auth.uid());

CREATE POLICY "Admins view all unlocks"
ON public.contact_unlocks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_contact_unlocks_buyer ON public.contact_unlocks(buyer_id);
