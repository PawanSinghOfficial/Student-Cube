import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Star, BadgeCheck, Calendar, Tag } from "lucide-react";

interface PublicProfile {
  user_id: string;
  first_name: string;
  username: string;
  created_at: string;
}

interface ListingRow {
  id: string;
  title: string;
  price: number;
  image_urls: string[];
  status: string;
}

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.rpc("get_public_profile", { _user_id: userId }),
        supabase
          .from("listings")
          .select("id, title, price, image_urls, status")
          .eq("user_id", userId)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
      ]);
      setProfile(p?.[0] || null);
      setListings(l || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (user?.id === userId) return <Navigate to="/profile" replace />;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Seller not found</h1>
        </div>
      </Layout>
    );
  }

  const displayName = profile.first_name || profile.username || "Seller";
  const initial = displayName.charAt(0).toUpperCase();
  const joinDate = new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground">{initial}</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <BadgeCheck className="h-5 w-5 text-success" />
              </div>
              <p className="text-muted-foreground">@{profile.username || "seller"}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="font-medium text-foreground">N/A</span>
                  <span>(no ratings yet)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Joined {joinDate}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" /> {listings.length} active
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Active Listings</h2>
          {listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">This seller has no active listings.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((l) => (
                <Link key={l.id} to={`/product/${l.id}`} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
                    <img
                      src={l.image_urls?.[0] || "/placeholder.svg"}
                      alt={l.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-primary">{l.title}</p>
                  <p className="text-sm text-primary font-semibold">₹{l.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PublicProfilePage;
