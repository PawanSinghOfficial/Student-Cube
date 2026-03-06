import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Package, CreditCard, AlertTriangle, CheckCircle, XCircle, Eye, Loader2, IndianRupee, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  college: string;
  price: number;
  original_price: number | null;
  condition: string;
  status: string;
  image_urls: string[];
  video_url: string | null;
  created_at: string;
  profiles?: { username: string; email: string; first_name: string } | null;
}

const AdminPage = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, active: 0, pending: 0 });

  const fetchListings = async () => {
    setLoading(true);
    // Fetch all listings with seller profile info
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch profiles for each listing's user_id
      const userIds = [...new Set(data.map((l: any) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, email, first_name")
        .in("user_id", userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });

      const enriched = data.map((l: any) => ({
        ...l,
        profiles: profileMap[l.user_id] || null,
      }));

      setListings(enriched);
      setStats({
        users: userIds.length,
        active: data.filter((l: any) => l.status === "approved").length,
        pending: data.filter((l: any) => l.status === "pending").length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAction = async (listingId: string, action: "approved" | "rejected") => {
    setActionLoading(listingId);
    const updateData: any = { status: action };
    if (action === "approved") updateData.approved_at = new Date().toISOString();

    const { error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", listingId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: action === "approved" ? "Listing Approved" : "Listing Rejected" });
      fetchListings();
      if (selectedListing?.id === listingId) setSelectedListing(null);
    }
    setActionLoading(null);
  };

  const handleDelete = async (listingId: string) => {
    setActionLoading(listingId);
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing Deleted" });
      fetchListings();
      if (selectedListing?.id === listingId) setSelectedListing(null);
    }
    setActionLoading(null);
  };

  const conditionLabel = (c: string) =>
    ({ new: "New", "like-new": "Like New", good: "Good", fair: "Fair" }[c] || c);

  const statusVariant = (s: string) =>
    s === "approved" ? "success" : s === "rejected" ? "destructive" : "pending";

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const pendingListings = listings.filter((l) => l.status === "pending");
  const otherListings = listings.filter((l) => l.status !== "pending");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="accent" className="mb-2">Admin Portal</Badge>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Sellers", value: stats.users },
            { icon: Package, label: "Total Listings", value: listings.length },
            { icon: CheckCircle, label: "Approved", value: stats.active },
            { icon: AlertTriangle, label: "Pending", value: stats.pending },
          ].map((stat) => (
            <Card key={stat.label} variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending Listings */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Pending Approvals</h2>
                <Badge variant="pending">{pendingListings.length} pending</Badge>
              </div>
              {pendingListings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending listings</p>
              ) : (
                <div className="space-y-4">
                  {pendingListings.map((listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      onView={() => setSelectedListing(listing)}
                      onApprove={() => handleAction(listing.id, "approved")}
                      onReject={() => handleAction(listing.id, "rejected")}
                      actionLoading={actionLoading}
                      timeAgo={timeAgo}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* All Other Listings */}
            {otherListings.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Processed Listings</h2>
                <div className="space-y-4">
                  {otherListings.map((listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      onView={() => setSelectedListing(listing)}
                      onDelete={() => handleDelete(listing.id)}
                      actionLoading={actionLoading}
                      timeAgo={timeAgo}
                      statusVariant={statusVariant}
                    />
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedListing && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedListing.title}</DialogTitle>
                </DialogHeader>

                {/* Images */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  {selectedListing.image_urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Product ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-border"
                    />
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(selectedListing.status) as any}>
                      {selectedListing.status.charAt(0).toUpperCase() + selectedListing.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">{conditionLabel(selectedListing.condition)}</Badge>
                    <Badge variant="outline">{selectedListing.category}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-lg font-bold">
                    <IndianRupee className="h-5 w-5" />
                    {selectedListing.price}
                    {selectedListing.original_price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">₹{selectedListing.original_price}</span>
                    )}
                  </div>

                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Seller:</span> @{selectedListing.profiles?.username || "unknown"} ({selectedListing.profiles?.first_name})</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedListing.profiles?.email}</p>
                    <p><span className="text-muted-foreground">College:</span> {selectedListing.college}</p>
                    <p><span className="text-muted-foreground">Submitted:</span> {timeAgo(selectedListing.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
                  </div>

                  {/* Video */}
                  {selectedListing.video_url && (
                    <div>
                      <p className="text-sm font-medium mb-2">Video Proof</p>
                      <video
                        src={selectedListing.video_url}
                        controls
                        className="w-full rounded-lg border border-border"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {selectedListing.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(selectedListing.id, "approved")}
                        disabled={!!actionLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleAction(selectedListing.id, "rejected")}
                        disabled={!!actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

function ListingRow({
  listing,
  onView,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
  timeAgo,
  statusVariant,
}: {
  listing: Listing;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  actionLoading: string | null;
  timeAgo: (d: string) => string;
  statusVariant?: (s: string) => string;
}) {
  const isLoading = actionLoading === listing.id;
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
      {/* Thumbnail */}
      {listing.image_urls[0] ? (
        <img src={listing.image_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover border border-border shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{listing.title}</p>
        <p className="text-sm text-muted-foreground">
          by @{listing.profiles?.username || "unknown"} • {listing.college} • {timeAgo(listing.created_at)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold">₹{listing.price}</span>
          {statusVariant && (
            <Badge variant={statusVariant(listing.status) as any} className="text-xs">
              {listing.status}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={onView}><Eye className="h-4 w-4" /></Button>
        {onApprove && (
          <Button variant="default" size="icon" onClick={onApprove} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        {onReject && (
          <Button variant="destructive" size="icon" onClick={onReject} disabled={isLoading}>
            <XCircle className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="icon" onClick={onDelete} disabled={isLoading}>
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
