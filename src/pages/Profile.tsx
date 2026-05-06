import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, ShoppingBag, Tag, Star, CreditCard, Gift, Settings, LogOut, Loader2, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/WishlistContext";

const ProfilePage = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ first_name: string; username: string; email: string } | null>(null);
  const [listingsCount, setListingsCount] = useState(0);
  const [myListings, setMyListings] = useState<Array<{ id: string; title: string; price: number; status: string; image_urls: string[] }>>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState<Array<{ id: string; title: string; price: number; image_urls: string[]; status: string }>>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const ids = Array.from(wishlistIds);
      if (ids.length === 0) {
        setWishlistItems([]);
        return;
      }
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, image_urls, status")
        .in("id", ids);
      setWishlistItems(data || []);
    };
    fetchWishlist();
  }, [wishlistIds]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const [{ data: profileData }, { data: listingsData, count }] = await Promise.all([
        supabase.from("profiles").select("first_name, username, email").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("listings")
          .select("id, title, price, status, image_urls", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (profileData) setProfile(profileData);
      setListingsCount(count || 0);
      setMyListings(listingsData || []);
      setProfileLoading(false);
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleMarkSold = async (listingId: string) => {
    if (!user) return;
    const { error } = await supabase.from("listings").update({ status: "sold" }).eq("id", listingId).eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed to mark sold", description: error.message, variant: "destructive" });
      return;
    }
    setMyListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: "sold" } : l)));
    toast({ title: "Marked as sold" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const isGuest = !user;
  const displayName = profile?.first_name || user?.email?.split("@")[0] || "Guest User";
  const username = profile?.username || "guest";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-foreground">{initial}</span>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {isGuest ? (
                    <Badge variant="pending">Not Verified</Badge>
                  ) : (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{username}</p>
                {!isGuest && (
                  <p className="text-sm text-muted-foreground mt-1">{profile?.email || user?.email}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 text-accent" /><span className="font-medium">0.0</span></div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{listingsCount} items listed</span>
                </div>
              </div>
              {isGuest ? (
                <Button variant="accent" onClick={() => navigate("/auth")}>Sign In</Button>
              ) : (
                <Button variant="outline">Edit Profile</Button>
              )}
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: ShoppingBag, label: "Purchases", value: "0" },
              { icon: Tag, label: "Listings", value: String(listingsCount) },
              { icon: CreditCard, label: "Wallet", value: "₹0" },
              { icon: Gift, label: "Points", value: "0" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 text-center">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-3 h-12">
                <User className="h-5 w-5" /> My Profile
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate("/sell")}>
                <Tag className="h-5 w-5" /> My Listings
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12">
                <Gift className="h-5 w-5" /> Referral Code
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12">
                <Settings className="h-5 w-5" /> Settings
              </Button>
            </div>
            {!isGuest && (
              <Button variant="destructive" className="w-full mt-4 gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            )}
          </Card>

          {!isGuest && myListings.length > 0 && (
            <Card className="p-6 mt-6">
              <h2 className="font-bold text-lg mb-4">My Listings</h2>
              <div className="space-y-3">
                {myListings.map((l) => (
                  <div key={l.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                    <Link to={`/product/${l.id}`} className="shrink-0">
                      <img src={l.image_urls?.[0] || "/placeholder.svg"} alt={l.title} className="w-16 h-16 object-cover rounded-lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${l.id}`} className="font-medium hover:text-primary line-clamp-1">{l.title}</Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-primary font-semibold">₹{l.price.toLocaleString()}</span>
                        <Badge variant={l.status === "sold" ? "destructive" : l.status === "approved" ? "success" : "pending"} className="text-xs capitalize">
                          {l.status}
                        </Badge>
                      </div>
                    </div>
                    {l.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkSold(l.id)}>
                        Mark Sold
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!isGuest && (
            <Card className="p-6 mt-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive fill-current" /> My Wishlist
              </h2>
              {wishlistItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items in your wishlist yet. Tap the heart on any product to save it.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlistItems.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Link to={`/product/${l.id}`} className="shrink-0">
                        <img src={l.image_urls?.[0] || "/placeholder.svg"} alt={l.title} className="w-16 h-16 object-cover rounded-lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${l.id}`} className="font-medium hover:text-primary line-clamp-1">{l.title}</Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-primary font-semibold">₹{l.price.toLocaleString()}</span>
                          {l.status === "sold" && <Badge variant="destructive" className="text-xs">Sold</Badge>}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => toggleWishlist(l.id)}>
                        <Heart className="h-4 w-4 fill-current text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
