import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Star, BadgeCheck, Calendar, Tag, MessageSquare } from "lucide-react";

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

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
}

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [{ data: p }, { data: l }, { data: r }] = await Promise.all([
        supabase.rpc("get_public_profile", { _user_id: userId }),
        supabase
          .from("listings")
          .select("id, title, price, image_urls, status")
          .eq("user_id", userId)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("id, reviewer_id, rating, comment, created_at")
          .eq("seller_id", userId)
          .order("created_at", { ascending: false }),
      ]);
      const reviewsData = r || [];
      // Fetch reviewer names
      const reviewerIds = Array.from(new Set(reviewsData.map((rv) => rv.reviewer_id)));
      let nameMap: Record<string, string> = {};
      if (reviewerIds.length > 0) {
        const namePromises = reviewerIds.map((rid) =>
          supabase.rpc("get_public_profile", { _user_id: rid }).then(({ data }) => {
            const prof = data?.[0];
            nameMap[rid] = prof?.first_name || prof?.username || "User";
          })
        );
        await Promise.all(namePromises);
      }
      setProfile(p?.[0] || null);
      setListings(l || []);
      setReviews(reviewsData.map((rv) => ({ ...rv, reviewer_name: nameMap[rv.reviewer_id] || "User" })));
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
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

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
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  {reviews.length > 0 ? (
                    <>
                      <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                      <span>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                    </>
                  ) : (
                    <span>No ratings yet</span>
                  )}
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

        <Card className="p-6 mb-6">
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

        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet for this seller.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {(r.reviewer_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{r.reviewer_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
                      />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PublicProfilePage;
