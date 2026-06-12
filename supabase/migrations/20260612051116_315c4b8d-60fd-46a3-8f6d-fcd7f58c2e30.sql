
CREATE OR REPLACE FUNCTION public.finalize_sold_on_contact_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verified = true AND COALESCE(OLD.verified, false) = false THEN
    UPDATE public.listings l
    SET status = 'sold'
    WHERE l.id = NEW.listing_id
      AND l.status = 'frozen'
      AND EXISTS (
        SELECT 1
        FROM public.messages m
        JOIN public.conversations c ON c.id = m.conversation_id
        WHERE c.listing_id = NEW.listing_id
          AND c.buyer_id = NEW.buyer_id
          AND m.message_type = 'offer'
          AND m.offer_status = 'accepted'
      );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_finalize_sold_on_contact_verification ON public.contact_unlocks;
CREATE TRIGGER trg_finalize_sold_on_contact_verification
AFTER UPDATE OF verified ON public.contact_unlocks
FOR EACH ROW
EXECUTE FUNCTION public.finalize_sold_on_contact_verification();
