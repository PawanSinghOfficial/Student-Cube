ALTER TABLE public.contact_unlocks
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS buyer_email text;