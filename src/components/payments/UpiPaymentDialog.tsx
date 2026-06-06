import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ShieldCheck, Clock, Smartphone, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UPI_ID = "pawansingh.24@ibl";

interface UpiPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  purpose: string;
  onPaymentComplete?: () => void;
}

export const UpiPaymentDialog = ({
  open,
  onOpenChange,
  amount,
  purpose,
  onPaymentComplete,
}: UpiPaymentDialogProps) => {
  const { toast } = useToast();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=IPU%20KA%20ADDA&am=${amount}&cu=INR&tn=${encodeURIComponent(purpose)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({ title: "UPI ID Copied!", description: "Paste it in your UPI app to pay." });
  };

  const handlePaymentDone = () => {
    setPaymentConfirmed(true);
    toast({ title: "Payment Submitted!", description: "We'll verify your payment shortly." });
    onPaymentComplete?.();
    setTimeout(() => {
      onOpenChange(false);
      setPaymentConfirmed(false);
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl p-0 border-0 overflow-hidden bg-[#0b0512] text-white"
      >
        <DialogTitle className="sr-only">Secure Checkout</DialogTitle>
        <DialogDescription className="sr-only">{purpose}</DialogDescription>

        {/* Ambient gradient backdrop */}
        <div
          className="relative"
          style={{
            backgroundImage:
              "radial-gradient(1200px 500px at 10% -10%, rgba(120,40,180,0.35), transparent 60%), radial-gradient(900px 400px at 110% 10%, rgba(60,30,140,0.35), transparent 60%), linear-gradient(180deg, #0c0616 0%, #0a0414 100%)",
          }}
        >
          {/* Brand header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-50 to-amber-200 flex items-center justify-center shadow-md">
              <span className="font-serif font-bold text-[#1a0b2e] text-lg tracking-tight">IK</span>
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

          <div className="grid md:grid-cols-2 gap-5 p-5 md:p-6 pt-3">
            {/* LEFT — Scan & Pay card */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm p-6 md:p-7 flex flex-col items-center">
              <h3 className="font-serif text-2xl md:text-3xl text-white">Scan &amp; Pay</h3>
              <p className="text-sm text-white/50 mt-1 text-center max-w-[240px]">
                Use any UPI app to scan the code below
              </p>

              <div className="mt-6 p-4 bg-white rounded-2xl shadow-2xl">
                <QRCodeSVG
                  value={upiUrl}
                  size={220}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <div className="mt-6 text-center">
                <div className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                  Total Amount
                </div>
                <div className="mt-2 font-serif text-3xl md:text-4xl text-white">
                  INR {amount.toFixed(2)}
                </div>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-emerald-400 uppercase">
                  {purpose}
                </div>
              </div>
            </div>

            {/* RIGHT — Checkout details */}
            <div className="flex flex-col">
              <h3 className="font-serif text-3xl md:text-4xl text-white">Checkout</h3>
              <p className="text-sm text-white/55 mt-1">
                Complete your payment to unlock contact access.
              </p>

              <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6 space-y-5">
                {/* Purpose */}
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2">
                    Purpose
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-black/40 border border-white/5 px-4 py-3">
                    <QrCode className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/80 truncate">{purpose}</span>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2">
                    Amount
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-black/40 border border-white/5 px-4 py-3">
                    <span className="text-sm text-white/60">Total payable</span>
                    <span className="font-serif text-xl text-white">INR {amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* UPI ID */}
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-fuchsia-300/80 uppercase mb-2">
                    UPI Payment ID
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 px-4 py-3">
                    <Smartphone className="h-4 w-4 text-white/40 shrink-0" />
                    <span className="flex-1 font-mono text-sm text-white/80 truncate">{UPI_ID}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUpiId}
                      className="text-white/70 hover:text-white hover:bg-white/10 h-8"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                  </div>
                </div>

                {/* Confirm button */}
                {paymentConfirmed ? (
                  <div className="w-full rounded-xl bg-emerald-500/15 border border-emerald-400/30 py-4 flex items-center justify-center gap-2 text-emerald-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Payment Submitted</span>
                  </div>
                ) : (
                  <Button
                    onClick={handlePaymentDone}
                    className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 text-base font-medium"
                  >
                    Complete Secure Payment
                  </Button>
                )}
              </div>

              {/* Footer trust bullets */}
              <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Access unlocked once payment is verified</p>
                    <p className="text-xs text-white/50">Contact details unlock automatically after successful verification.</p>
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
