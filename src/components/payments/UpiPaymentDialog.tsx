import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ShieldCheck, Clock, Upload, Loader2, Tag, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

interface UpiPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  purpose: string;
  onPaymentComplete?: (data: { screenshotUrl: string; promoCode: string | null; email: string }) => void;
}

const UPI_ID = "pawansingh.24@ibl";
const PAYEE_NAME = "IPU KA ADDA";

export const UpiPaymentDialog = ({
  open,
  onOpenChange,
  amount,
  purpose,
  onPaymentComplete,
}: UpiPaymentDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-fill email from logged-in user
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user, open]);

  // Dynamic UPI QR with ₹ amount baked in
  const qrUrl = useMemo(() => {
    const upiString =
      `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
      `&pn=${encodeURIComponent(PAYEE_NAME)}` +
      `&am=${encodeURIComponent(amount.toFixed(2))}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(purpose)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=0&data=${encodeURIComponent(upiString)}`;
  }, [amount, purpose]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setScreenshotFile(f);
    setScreenshotPreview(URL.createObjectURL(f));
  };

  // Valid promo codes — add here in future
  const VALID_PROMO_CODES: string[] = [];

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast({ title: "Enter a promo code", variant: "destructive" });
      return;
    }
    if (!VALID_PROMO_CODES.includes(code)) {
      setPromoApplied(null);
      toast({ title: "hey buddy ye to invalid hai 😝", variant: "destructive" });
      return;
    }
    setPromoApplied(code);
    toast({ title: "Promo code applied", description: `${code} has been applied successfully.` });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    if (!screenshotFile) {
      toast({ title: "Payment screenshot required", description: "Please upload a screenshot of your payment.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const ext = screenshotFile.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("payment-screenshots")
        .upload(path, screenshotFile, { upsert: false });
      if (upErr) throw upErr;
      setPaymentConfirmed(true);
      toast({ title: "Payment Submitted!", description: "We'll verify your payment shortly." });
      onPaymentComplete?.({
        screenshotUrl: path,
        promoCode: promoApplied || promoCode.trim().toUpperCase() || null,
        email: email.trim() || user.email || "",
      });
      setTimeout(() => {
        onOpenChange(false);
        setPaymentConfirmed(false);
        setScreenshotFile(null);
        setScreenshotPreview(null);
        setPromoCode("");
        setPromoApplied(null);
      }, 1800);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 border-0 overflow-hidden bg-[#0b0512] text-white max-h-[92vh] overflow-y-auto">
        <DialogTitle className="sr-only">Secure Checkout</DialogTitle>
        <DialogDescription className="sr-only">{purpose}</DialogDescription>

        <div
          className="relative"
          style={{
            backgroundImage:
              "radial-gradient(1200px 500px at 10% -10%, rgba(120,40,180,0.35), transparent 60%), radial-gradient(900px 400px at 110% 10%, rgba(60,30,140,0.35), transparent 60%), linear-gradient(180deg, #0c0616 0%, #0a0414 100%)",
          }}
        >
          {/* Brand header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="h-11 w-11 rounded-xl bg-white/95 flex items-center justify-center shadow-md overflow-hidden p-1">
              <img src={logo} alt="IPU KA ADDA" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl md:text-2xl tracking-tight text-white">
                  Secure Checkout
                </h2>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
              </div>
              <p className="text-[10px] md:text-xs tracking-[0.18em] text-white/40 uppercase">
                Powered by IPU&nbsp;KA&nbsp;ADDA
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-5 md:p-6 pt-3">
            {/* LEFT — Scan & Pay */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm p-5 md:p-6 flex flex-col items-center">
              <h3 className="font-serif text-2xl md:text-3xl text-white">Scan &amp; Pay</h3>
              <p className="text-xs text-white/50 mt-1 text-center max-w-[240px]">
                Use any UPI app to scan and pay INR {amount.toFixed(2)}
              </p>

              <div className="mt-4 p-3 bg-white rounded-2xl shadow-2xl">
                <img
                  src={qrUrl}
                  alt={`UPI Payment QR for INR ${amount}`}
                  className="w-[220px] h-[220px] object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <div className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                  Total Amount
                </div>
                <div className="mt-1 font-serif text-3xl md:text-4xl text-white">
                  INR {amount.toFixed(2)}
                </div>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-emerald-400 uppercase">
                  {purpose}
                </div>
              </div>
            </div>

            {/* RIGHT — Checkout */}
            <div className="flex flex-col">
              <h3 className="font-serif text-2xl md:text-3xl text-white">Checkout</h3>
              <p className="text-xs text-white/55 mt-1">
                Complete your payment to unlock contact access.
              </p>

              <div className="mt-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 md:p-5 space-y-4">
                {/* Email (auto-filled) */}
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2">Email</div>
                  <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 px-3 py-2">
                    <Mail className="h-4 w-4 text-white/40 shrink-0" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="border-0 bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0 px-1 h-8"
                    />
                  </div>
                </div>

                {/* Promo code (optional) with Apply */}
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2">
                    Promo Code <span className="text-white/30 normal-case tracking-normal">(optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 px-3 py-2 flex-1">
                      <Tag className="h-4 w-4 text-white/40 shrink-0" />
                      <Input
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoApplied(null);
                        }}
                        placeholder="Enter promo code"
                        maxLength={32}
                        className="border-0 bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0 px-1 h-8"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleApplyPromo}
                      variant="secondary"
                      className="h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      {promoApplied ? "Applied" : "Apply"}
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-[11px] text-emerald-300 mt-1.5">
                      Code <span className="font-semibold">{promoApplied}</span> will be verified by admin.
                    </p>
                  )}
                </div>

                {/* Screenshot upload */}
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-fuchsia-300/80 uppercase mb-2">
                    Payment Verification
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl bg-black/40 border border-dashed border-white/15 hover:border-white/30 transition-colors px-4 py-5 flex flex-col items-center justify-center gap-2"
                  >
                    {screenshotPreview ? (
                      <>
                        <img src={screenshotPreview} alt="Preview" className="max-h-28 rounded-md" />
                        <span className="text-xs text-emerald-300">Click to change screenshot</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-white/50" />
                        <span className="text-sm text-white/70">Upload Payment Screenshot</span>
                        <span className="text-[10px] text-white/40">PNG / JPG · max 5MB</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Submit */}
                {paymentConfirmed ? (
                  <div className="w-full rounded-xl bg-emerald-500/15 border border-emerald-400/30 py-4 flex items-center justify-center gap-2 text-emerald-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Payment Submitted</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !screenshotFile}
                    className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 text-base font-medium disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      `Complete Secure Payment · INR ${amount.toFixed(2)}`
                    )}
                  </Button>
                )}
              </div>

              {/* Trust */}
              <div className="mt-3 rounded-2xl bg-white/[0.03] border border-white/10 p-3 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Access unlocked once payment is verified</p>
                    <p className="text-xs text-white/50">Contact details unlock automatically after admin verification.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">UPI payment verified within 24 hours</p>
                    <p className="text-xs text-white/50">Your transaction is safe and verified manually by our team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
