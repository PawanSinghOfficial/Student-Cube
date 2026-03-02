import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RewardTimer {
  isActive: boolean;
  remainingMs: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useRewardTimer(): RewardTimer {
  const { user } = useAuth();
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!user) {
      setExpiryTime(null);
      return;
    }

    const fetchReward = async () => {
      const { data } = await supabase
        .from("user_rewards")
        .select("reward_expiry_time")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.reward_expiry_time) {
        const expiry = new Date(data.reward_expiry_time);
        if (expiry > new Date()) {
          setExpiryTime(expiry);
        }
      }
    };

    fetchReward();
  }, [user]);

  useEffect(() => {
    if (!expiryTime) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const remaining = expiryTime.getTime() - Date.now();
      setRemainingMs(Math.max(0, remaining));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isActive: remainingMs > 0,
    remainingMs,
    hours,
    minutes,
    seconds,
  };
}
