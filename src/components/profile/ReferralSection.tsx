import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Share2, Gift, Trophy, Users, IndianRupee, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId: string;
}

const MILESTONES = [
  { count: 25, reward: 50 },
  { count: 50, reward: 100 },
  { count: 75, reward: 150 },
  { count: 100, reward: 300 },
];

export function ReferralSection({ userId }: Props) {
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [successCount, setSuccessCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Fetch own referral code
      const { data: prof } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", userId)
        .maybeSingle();
      setCode(((prof as any)?.referral_code as string) || "");

      // Fetch everyone I've referred
      const { data: referred } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referred_by", userId);

      const ids = (referred || []).map((r: any) => r.user_id);
      if (ids.length === 0) {
        setSuccessCount(0);
        setPendingCount(0);
        setLoading(false);
        return;
      }

      // Successful = referred user has at least one approved/sold listing OR a verified contact_unlock (purchase)
      const [{ data: listings }, { data: unlocks }] = await Promise.all([
        supabase.from("listings").select("user_id").in("user_id", ids).in("status", ["approved", "sold"]),
        supabase.from("contact_unlocks").select("buyer_id").in("buyer_id", ids).eq("verified", true),
      ]);

      const successSet = new Set<string>();
      (listings || []).forEach((l: any) => successSet.add(l.user_id));
      (unlocks || []).forEach((u: any) => successSet.add(u.buyer_id));
      setSuccessCount(successSet.size);
      setPendingCount(ids.length - successSet.size);
      setLoading(false);
    };
    load();
  }, [userId]);

  const referralUrl = `${window.location.origin}/auth?ref=${code}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast({ title: "Referral code copied!" });
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast({ title: "Referral link copied!" });
  };
  const share = async () => {
    const text = `Join IPU ka Adda — GGSIPU's student marketplace! Use my code ${code} to sign up: ${referralUrl}`;
    if (navigator.share) {
      try { await navigator.share({ title: "IPU ka Adda", text, url: referralUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Share text copied!" });
    }
  };

  const totalEarned = MILESTONES.filter((m) => successCount >= m.count).reduce((s, m) => s + m.reward, 0);
  const nextMilestone = MILESTONES.find((m) => successCount < m.count);
  const prevTarget = nextMilestone ? (MILESTONES[MILESTONES.indexOf(nextMilestone) - 1]?.count ?? 0) : 100;
  const progressPct = nextMilestone
    ? Math.min(100, ((successCount - prevTarget) / (nextMilestone.count - prevTarget)) * 100)
    : 100;

  return (
    <Card className="p-6 mt-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none gradient-primary" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-accent" /> Refer & Earn
          </h2>
          <Badge variant="success" className="gap-1">
            <IndianRupee className="h-3 w-3" />{totalEarned} earned
          </Badge>
        </div>

        {/* Code block */}
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 mb-5">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Your Referral Code</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={loading ? "Loading..." : code || "—"}
              readOnly
              className="font-mono text-lg tracking-widest font-bold bg-background"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyCode} disabled={!code} className="gap-2">
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="accent" onClick={share} disabled={!code} className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
          <button
            onClick={copyLink}
            className="text-xs text-primary hover:underline mt-2 inline-block break-all text-left"
            disabled={!code}
          >
            {referralUrl}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-background border p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{successCount}</p>
            <p className="text-[11px] text-muted-foreground uppercase">Successful</p>
          </div>
          <div className="rounded-lg bg-background border p-3 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-[11px] text-muted-foreground uppercase">Pending</p>
          </div>
          <div className="rounded-lg bg-background border p-3 text-center">
            <IndianRupee className="h-5 w-5 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold">₹{totalEarned}</p>
            <p className="text-[11px] text-muted-foreground uppercase">Earned</p>
          </div>
        </div>

        {/* Progress to next milestone */}
        {nextMilestone ? (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium">
                {nextMilestone.count - successCount} more to unlock <span className="text-success font-bold">₹{nextMilestone.reward}</span>
              </span>
              <span className="text-muted-foreground">{successCount} / {nextMilestone.count}</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </div>
        ) : (
          <div className="mb-5 p-3 rounded-lg bg-success/10 border border-success/30 text-success-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-success" />
            <span className="text-sm font-semibold">All milestones unlocked! You're a referral legend 🎉</span>
          </div>
        )}

        {/* Milestone roadmap */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Reward Milestones</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MILESTONES.map((m) => {
              const achieved = successCount >= m.count;
              return (
                <div
                  key={m.count}
                  className={`relative rounded-xl p-4 text-center border-2 transition-all ${
                    achieved
                      ? "bg-gradient-to-br from-success/15 to-success/5 border-success/40 shadow-md"
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="absolute top-2 right-2">
                    {achieved ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className={`text-2xl font-extrabold ${achieved ? "text-success" : "text-foreground"}`}>
                    ₹{m.reward}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">at {m.count} referrals</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 text-center italic">
          A referral counts as successful on the friend's 1st buy or listing.
        </p>
      </div>
    </Card>
  );
}
