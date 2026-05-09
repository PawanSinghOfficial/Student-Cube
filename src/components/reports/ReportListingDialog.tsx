import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Flag, Loader2 } from "lucide-react";

const REASONS = [
  "Fake or misleading listing",
  "Prohibited / illegal item",
  "Inappropriate content",
  "Suspected scam",
  "Duplicate listing",
  "Other",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
}

export function ReportListingDialog({ open, onOpenChange, listingId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      listing_id: listingId,
      reason: fullReason,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to report", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report submitted", description: "Thanks — our admins will review this listing." });
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" /> Report Listing
          </DialogTitle>
          <DialogDescription>
            Help us keep IPU KA ADDA safe. Tell us what's wrong with this listing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Reason</Label>
            <div className="grid grid-cols-1 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    reason === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="details" className="mb-2 block">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add any context that helps us review this report…"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
