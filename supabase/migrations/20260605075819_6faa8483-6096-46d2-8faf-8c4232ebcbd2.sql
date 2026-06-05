
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_listings_tags_gin ON public.listings USING GIN (tags);
