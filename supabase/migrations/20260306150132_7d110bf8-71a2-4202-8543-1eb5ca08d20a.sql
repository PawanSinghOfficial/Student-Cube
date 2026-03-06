
-- Create listings table
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  college text NOT NULL,
  price integer NOT NULL,
  original_price integer,
  condition text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  image_urls text[] NOT NULL DEFAULT '{}',
  video_url text,
  admin_notes text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Users can insert their own listings
CREATE POLICY "Users can insert own listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own listings
CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all listings
CREATE POLICY "Admins can view all listings"
  ON public.listings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all listings (approve/reject)
CREATE POLICY "Admins can update all listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete listings
CREATE POLICY "Admins can delete listings"
  ON public.listings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Approved listings visible to everyone (for browse page)
CREATE POLICY "Anyone can view approved listings"
  ON public.listings FOR SELECT
  USING (status = 'approved');

-- Updated_at trigger
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for listing images/videos
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload listing files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listings');

CREATE POLICY "Anyone can view listing files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

CREATE POLICY "Users can delete own listing files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
