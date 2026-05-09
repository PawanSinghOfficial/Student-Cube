CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX idx_reports_status ON public.reports(status);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert reports"
ON public.reports FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Reporters can view own reports"
ON public.reports FOR SELECT TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reports"
ON public.reports FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));