
-- 1. Listings INSERT must force status='pending'
DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
CREATE POLICY "Users can insert own listings"
ON public.listings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Constrain status values
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('pending','approved','rejected','sold'));

-- 2. Hide admin_notes from authenticated/anon (admins read via service role; app code doesn't read it)
REVOKE SELECT (admin_notes) ON public.listings FROM authenticated;
REVOKE SELECT (admin_notes) ON public.listings FROM anon;
GRANT SELECT (admin_notes) ON public.listings TO service_role;

-- 3. Conversations INSERT must validate seller matches listing owner and differs from buyer
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
  buyer_id = auth.uid()
  AND buyer_id <> seller_id
  AND seller_id = (SELECT user_id FROM public.listings WHERE id = listing_id)
);

-- 4. Messages UPDATE: restrict mutable columns via trigger
CREATE OR REPLACE FUNCTION public.guard_messages_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.message_type IS DISTINCT FROM OLD.message_type
     OR NEW.offer_price IS DISTINCT FROM OLD.offer_price THEN
    RAISE EXCEPTION 'Only read_at and offer_status may be updated on messages';
  END IF;

  IF NEW.offer_status IS DISTINCT FROM OLD.offer_status THEN
    IF OLD.message_type <> 'offer'
       OR COALESCE(OLD.offer_status, 'pending') <> 'pending'
       OR NEW.offer_status NOT IN ('accepted','declined') THEN
      RAISE EXCEPTION 'Invalid offer status transition';
    END IF;
    SELECT c.seller_id INTO v_seller
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id;
    IF v_seller IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Only the seller can accept or decline an offer';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_messages_update ON public.messages;
CREATE TRIGGER trg_guard_messages_update
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.guard_messages_update();
