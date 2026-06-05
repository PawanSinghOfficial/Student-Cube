
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS offer_price NUMERIC,
  ADD COLUMN IF NOT EXISTS offer_status TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_conv_type ON public.messages(conversation_id, message_type);
