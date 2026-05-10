
-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- No INSERT policy: only triggers (SECURITY DEFINER) can insert.

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: new chat message -> notify recipient
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient UUID;
  v_listing_id UUID;
  v_listing_title TEXT;
BEGIN
  SELECT
    CASE WHEN c.buyer_id = NEW.sender_id THEN c.seller_id ELSE c.buyer_id END,
    c.listing_id
  INTO v_recipient, v_listing_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  SELECT title INTO v_listing_title FROM public.listings WHERE id = v_listing_id;

  IF v_recipient IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      v_recipient,
      'message',
      'New message',
      COALESCE('Re: ' || v_listing_title, 'You received a new message'),
      '/chat?conversation=' || NEW.conversation_id::text
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- Trigger: listing status change -> notify seller
CREATE OR REPLACE FUNCTION public.notify_listing_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'listing_approved',
      'Listing approved',
      'Your listing "' || NEW.title || '" is now live.',
      '/product/' || NEW.id::text
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'listing_rejected',
      'Listing rejected',
      COALESCE('Your listing "' || NEW.title || '" was rejected. ' || NEW.admin_notes,
               'Your listing "' || NEW.title || '" was rejected.'),
      '/profile'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_listing_status
AFTER UPDATE OF status ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.notify_listing_status();

-- Trigger: new review -> notify seller
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.seller_id IS NOT NULL AND NEW.seller_id <> NEW.reviewer_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.seller_id,
      'review',
      'New review received',
      'You got a ' || NEW.rating || '-star review.',
      '/profile/' || NEW.seller_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.notify_new_review();
