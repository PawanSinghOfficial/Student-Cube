
-- Allow 'frozen' status on listings
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('pending','approved','rejected','sold','frozen'));

-- Extend the messages-update guard to allow deal_freeze responses by the recipient
CREATE OR REPLACE FUNCTION public.guard_messages_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
  v_buyer uuid;
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
    IF OLD.message_type NOT IN ('offer','deal_freeze')
       OR COALESCE(OLD.offer_status, 'pending') <> 'pending'
       OR NEW.offer_status NOT IN ('accepted','declined') THEN
      RAISE EXCEPTION 'Invalid status transition';
    END IF;

    SELECT c.seller_id, c.buyer_id INTO v_seller, v_buyer
    FROM public.conversations c WHERE c.id = NEW.conversation_id;

    IF OLD.message_type = 'offer' THEN
      IF v_seller IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Only the seller can accept or decline an offer';
      END IF;
    ELSIF OLD.message_type = 'deal_freeze' THEN
      IF auth.uid() = OLD.sender_id
         OR auth.uid() NOT IN (v_seller, v_buyer) THEN
        RAISE EXCEPTION 'Only the other party can respond to a deal freeze request';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
