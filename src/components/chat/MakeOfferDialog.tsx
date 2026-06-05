import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
  sellerId: string;
  listingTitle: string;
  listingPrice: number;
  onSent?: () => void;
}

export function MakeOfferDialog({ open, onOpenChange, listingId, sellerId, listingTitle, listingPrice, onSent }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [price, setPrice] = useState<string>("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    const num = Number(price);
    if (!num || num <= 0 || num > 10_000_000) {
      toast({ title: "Invalid amount", description: "Enter a valid offer price.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      // Find or create conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq("buyer_id", user.id)
        .maybeSingle();

      let convoId = existing?.id;
      if (!convoId) {
        const { data: created, error: convErr } = await supabase
          .from("conversations")
          .insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId })
          .select("id")
          .single();
        if (convErr || !created) throw convErr || new Error("Could not start conversation");
        convoId = created.id;
      }

      const { error: msgErr } = await supabase.from("messages").insert({
        conversation_id: convoId,
        sender_id: user.id,
        content: `Offered ₹${num.toLocaleString()} for "${listingTitle}"`,
        message_type: "offer",
        offer_price: num,
        offer_status: "pending",
      } as any);
      if (msgErr) throw msgErr;

      toast({ title: "Offer sent!", description: "The seller has been notified." });
      onOpenChange(false);
      setPrice("");
      onSent?.();
      navigate(`/chat?listing=${listingId}`);
    } catch (e: any) {
      toast({ title: "Failed to send offer", description: e?.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Make an Offer</DialogTitle>
          <DialogDescription>
            Listed at <span className="font-semibold text-foreground">₹{listingPrice.toLocaleString()}</span>. Propose your price — the seller can accept or decline in chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="offer-price">Your offer (₹)</Label>
          <Input
            id="offer-price"
            type="number"
            min={1}
            placeholder="e.g. 500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>Cancel</Button>
          <Button variant="accent" onClick={handleSubmit} disabled={sending || !price}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
