import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SpinningWheel } from "./SpinningWheel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export function SpinWheelDialog() {
  const { user, isFirstLogin, setIsFirstLogin } = useAuth();
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const [wonHours, setWonHours] = useState<number | null>(null);

  const handleResult = async (hours: number) => {
    setWonHours(hours);

    // Fire confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });

    if (!user) return;

    const now = new Date();
    const expiry = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const { error } = await supabase.from("user_rewards").insert({
      user_id: user.id,
      reward_duration_hours: hours,
      reward_start_time: now.toISOString(),
      reward_expiry_time: expiry.toISOString(),
      wheel_used: true,
    });

    if (error) {
      console.error("Failed to save reward:", error);
      toast({ title: "Error", description: "Failed to save your reward. It may have already been claimed.", variant: "destructive" });
    }
  };

  const handleClaim = () => {
    setClaimed(true);
    setIsFirstLogin(false);
    toast({
      title: "Reward Activated! 🎉",
      description: `You have ${wonHours === 24 ? "1 day" : `${wonHours} hours`} of free listings. Happy selling!`,
    });
  };

  if (!isFirstLogin || claimed) return null;

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-center text-2xl font-bold">
          🎡 Spin the Wheel!
        </DialogTitle>
        <p className="text-center text-muted-foreground mb-2">
          Welcome! Spin to unlock <strong>free listing time</strong> — no listing fees for a limited period!
        </p>

        <SpinningWheel onResult={handleResult} />

        {wonHours !== null && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleClaim} size="lg" className="w-full">
              Claim & Start Timer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
