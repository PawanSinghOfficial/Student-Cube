import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlistIds: Set<string>;
  isWishlisted: (listingId: string) => boolean;
  toggleWishlist: (listingId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    const { data } = await supabase.from("wishlists").select("listing_id").eq("user_id", user.id);
    setWishlistIds(new Set((data || []).map((w) => w.listing_id)));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleWishlist = useCallback(
    async (listingId: string) => {
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to use your wishlist." });
        navigate("/auth");
        return;
      }
      const isIn = wishlistIds.has(listingId);
      if (isIn) {
        const next = new Set(wishlistIds);
        next.delete(listingId);
        setWishlistIds(next);
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);
        if (error) {
          toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
          refresh();
        } else {
          toast({ title: "Removed from wishlist" });
        }
      } else {
        const next = new Set(wishlistIds);
        next.add(listingId);
        setWishlistIds(next);
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, listing_id: listingId });
        if (error) {
          toast({ title: "Failed to add", description: error.message, variant: "destructive" });
          refresh();
        } else {
          toast({ title: "Added to wishlist" });
        }
      }
    },
    [user, wishlistIds, navigate, toast, refresh]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, isWishlisted: (id) => wishlistIds.has(id), toggleWishlist, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
