import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Smartphone } from "lucide-react";
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

  // Generate UPI deep link
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=IPU%20KA%20ADDA&am=${amount}&cu=INR&tn=${encodeURIComponent(purpose)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({
      title: "UPI ID Copied!",
      description: "Paste it in your UPI app to make payment.",
    });
  };

  const handlePaymentDone = () => {
    setPaymentConfirmed(true);
    toast({
      title: "Payment Submitted!",
      description: "We'll verify your payment shortly.",
    });
    onPaymentComplete?.();
    setTimeout(() => {
      onOpenChange(false);
      setPaymentConfirmed(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Pay ₹{amount}</DialogTitle>
          <DialogDescription className="text-center">
            {purpose}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-xl shadow-md">
            <QRCodeSVG
              value={upiUrl}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* Amount Badge */}
          <Badge variant="accent" className="text-lg px-4 py-2">
            ₹{amount}
          </Badge>

          {/* UPI ID */}
          <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg w-full">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-mono text-sm">{UPI_ID}</span>
            <Button variant="ghost" size="sm" onClick={handleCopyUpiId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center space-y-1">
            <p>Scan QR code with any UPI app</p>
            <p className="text-xs">GPay, PhonePe, Paytm, BHIM, etc.</p>
          </div>

          {/* Confirm Button */}
          {paymentConfirmed ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Payment Submitted!</span>
            </div>
          ) : (
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={handlePaymentDone}
            >
              I've Made the Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
