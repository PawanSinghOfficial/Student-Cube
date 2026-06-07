import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Package, AlertTriangle, CheckCircle, XCircle, Eye, Loader2, IndianRupee, Flag } from "lucide-react";
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
  report_count?: number;
}

interface ReportRow {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  status: string;
  created_at: string;
  listing?: { id: string; title: string; status: string; image_urls: string[]; user_id: string } | null;
  reporter?: { username: string; first_name: string } | null;
}

interface UnlockRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  amount: number;
  verified: boolean;
  created_at: string;
  upi_reference: string | null;
  listing_title?: string;
  buyer_username?: string;
}

const AdminPage = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ users: 0, active: 0, pending: 0 });
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: listingsData }, { data: reportsData }] = await Promise.all([
      supabase.from("listings").select("id, user_id, title, description, category, college, price, original_price, condition, status, image_urls, video_url, approved_at, created_at, updated_at, tags").order("created_at", { ascending: false }),
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
    ]);

    if (listingsData) {
      const userIds = [...new Set(listingsData.map((l: any) => l.user_id))];
      const [{ data: profiles }, { data: emails }] = await Promise.all([
        supabase.from("profiles").select("user_id, username, first_name").in("user_id", userIds),
        supabase.rpc("get_user_emails_for_admin", { _user_ids: userIds as any }),
      ]);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });
      (emails as any[] | null)?.forEach((e: any) => {
        profileMap[e.user_id] = { ...(profileMap[e.user_id] || {}), email: e.email };
      });

      // Compute report counts
      const reportCount: Record<string, number> = {};
      reportsData?.forEach((r: any) => {
        reportCount[r.listing_id] = (reportCount[r.listing_id] || 0) + 1;
      });

      const enriched = listingsData.map((l: any) => ({
        ...l,
        profiles: profileMap[l.user_id] || null,
        report_count: reportCount[l.id] || 0,
      }));
      setListings(enriched);
      setStats({
        users: userIds.length,
        active: listingsData.filter((l: any) => l.status === "approved").length,
        pending: listingsData.filter((l: any) => l.status === "pending").length,
      });
    }

    if (reportsData) {
      const reporterIds = [...new Set(reportsData.map((r: any) => r.reporter_id))];
      const listingIds = [...new Set(reportsData.map((r: any) => r.listing_id))];
      const [{ data: rps }, { data: ls }] = await Promise.all([
        reporterIds.length
          ? supabase.from("profiles").select("user_id, username, first_name").in("user_id", reporterIds)
          : Promise.resolve({ data: [] as any }),
        listingIds.length
          ? supabase.from("listings").select("id, title, status, image_urls, user_id").in("id", listingIds)
          : Promise.resolve({ data: [] as any }),
      ]);
      const rpMap: Record<string, any> = {};
      rps?.forEach((p: any) => { rpMap[p.user_id] = p; });
      const lsMap: Record<string, any> = {};
      ls?.forEach((l: any) => { lsMap[l.id] = l; });
      setReports(reportsData.map((r: any) => ({ ...r, reporter: rpMap[r.reporter_id] || null, listing: lsMap[r.listing_id] || null })));
    }

    // Contact unlocks (payment verification queue)
    const { data: unlockData } = await supabase
      .from("contact_unlocks")
      .select("id, listing_id, buyer_id, amount, verified, created_at, upi_reference")
      .order("created_at", { ascending: false });
    if (unlockData) {
      const lIds = [...new Set(unlockData.map((u: any) => u.listing_id))];
      const bIds = [...new Set(unlockData.map((u: any) => u.buyer_id))];
      const [{ data: ls }, { data: bs }] = await Promise.all([
        lIds.length ? supabase.from("listings").select("id, title").in("id", lIds) : Promise.resolve({ data: [] as any }),
        bIds.length ? supabase.from("profiles").select("user_id, username").in("user_id", bIds) : Promise.resolve({ data: [] as any }),
      ]);
      const lMap: Record<string, any> = {};
      ls?.forEach((l: any) => { lMap[l.id] = l; });
      const bMap: Record<string, any> = {};
      bs?.forEach((b: any) => { bMap[b.user_id] = b; });
      setUnlocks(unlockData.map((u: any) => ({
        ...u,
        listing_title: lMap[u.listing_id]?.title || "Unknown listing",
        buyer_username: bMap[u.buyer_id]?.username || "user",
      })));
    }

    setLoading(false);
  };

  const handleVerifyUnlock = async (unlockId: string, verified: boolean) => {
    setVerifyingId(unlockId);
    const { error } = await supabase
      .from("contact_unlocks")
      .update({ verified, verified_at: verified ? new Date().toISOString() : null })
      .eq("id", unlockId);
    setVerifyingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: verified ? "Payment verified" : "Verification revoked" });
    fetchAll();
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAction = async (listingId: string, action: "approved" | "rejected") => {
    setActionLoading(listingId);
    const updateData: any = { status: action };
    if (action === "approved") updateData.approved_at = new Date().toISOString();
    const { error } = await supabase.from("listings").update(updateData).eq("id", listingId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: action === "approved" ? "Listing Approved" : "Listing Rejected" });
      fetchAll();
      if (selectedListing?.id === listingId) setSelectedListing(null);
    }
    setActionLoading(null);
  };

  const handleBulk = async (action: "approved" | "rejected") => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const updateData: any = { status: action };
    if (action === "approved") updateData.approved_at = new Date().toISOString();
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("listings").update(updateData).in("id", ids);
    setBulkLoading(false);
    if (error) toast({ title: "Bulk update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: `${ids.length} listing(s) ${action}` });
      setSelectedIds(new Set());
      fetchAll();
    }
  };

  const handleDelete = async (listingId: string) => {
    setActionLoading(listingId);
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Listing Deleted" });
      fetchAll();
      if (selectedListing?.id === listingId) setSelectedListing(null);
    }
    setActionLoading(null);
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Report ${status}` }); fetchAll(); }
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
  const pendingReports = reports.filter((r) => r.status === "pending");

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllPending = () => {
    if (selectedIds.size === pendingListings.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pendingListings.map((l) => l.id)));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="accent" className="mb-2">Admin Portal</Badge>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Sellers", value: stats.users },
            { icon: Package, label: "Total Listings", value: listings.length },
            { icon: CheckCircle, label: "Approved", value: stats.active },
            { icon: Flag, label: "Open Reports", value: pendingReports.length },
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
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pending <Badge variant="pending" className="ml-2">{pendingListings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
              <TabsTrigger value="reports">
                Reports <Badge variant="destructive" className="ml-2">{pendingReports.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {pendingListings.length > 0 && (
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={selectedIds.size === pendingListings.length && pendingListings.length > 0}
                          onCheckedChange={toggleAllPending}
                        />
                        Select all ({selectedIds.size}/{pendingListings.length})
                      </label>
                    )}
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={bulkLoading}
                        onClick={() => handleBulk("approved")}
                      >
                        {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Approve {selectedIds.size}
                      </Button>
                      <Button variant="destructive" size="sm" disabled={bulkLoading} onClick={() => handleBulk("rejected")}>
                        <XCircle className="h-4 w-4 mr-2" /> Reject {selectedIds.size}
                      </Button>
                    </div>
                  )}
                </div>
                {pendingListings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending listings</p>
                ) : (
                  <div className="space-y-3">
                    {pendingListings.map((listing) => (
                      <ListingRow
                        key={listing.id}
                        listing={listing}
                        selected={selectedIds.has(listing.id)}
                        onToggleSelect={() => toggleId(listing.id)}
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
            </TabsContent>

            <TabsContent value="processed">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Processed Listings</h2>
                {otherListings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nothing here yet</p>
                ) : (
                  <div className="space-y-3">
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
                )}
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Reported Listings</h2>
                {reports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reports yet</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map((r) => {
                      const ls = listings.find((l) => l.id === r.listing_id);
                      return (
                        <div key={r.id} className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
                          {r.listing?.image_urls?.[0] ? (
                            <img src={r.listing.image_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover border border-border shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{r.listing?.title || "(deleted listing)"}</p>
                              <Badge variant={r.status === "pending" ? "pending" : r.status === "actioned" ? "success" : "outline"} className="text-xs capitalize">
                                {r.status}
                              </Badge>
                              {ls && ls.report_count! > 1 && (
                                <Badge variant="destructive" className="text-xs gap-1">
                                  <Flag className="h-3 w-3" /> {ls.report_count} reports
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Reason:</span> {r.reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by @{r.reporter?.username || "anon"} • {timeAgo(r.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0 flex-wrap">
                            {ls && (
                              <Button variant="ghost" size="icon" onClick={() => setSelectedListing(ls)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {ls && ls.status === "pending" && (
                              <Button
                                variant="default"
                                size="icon"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={async () => { await handleAction(ls.id, "approved"); await updateReportStatus(r.id, "actioned"); }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {ls && (
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={async () => { await handleAction(ls.id, "rejected"); await updateReportStatus(r.id, "actioned"); }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {r.status === "pending" && (
                              <Button variant="outline" size="sm" onClick={() => updateReportStatus(r.id, "dismissed")}>
                                Dismiss
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedListing && (
              <>
                <DialogHeader><DialogTitle>{selectedListing.title}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3 my-4">
                  {selectedListing.image_urls.map((url, i) => (
                    <img key={i} src={url} alt={`Product ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-border" />
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={statusVariant(selectedListing.status) as any}>
                      {selectedListing.status.charAt(0).toUpperCase() + selectedListing.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">{conditionLabel(selectedListing.condition)}</Badge>
                    <Badge variant="outline">{selectedListing.category}</Badge>
                    {selectedListing.report_count! > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <Flag className="h-3 w-3" /> {selectedListing.report_count} report(s)
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <IndianRupee className="h-5 w-5" />{selectedListing.price}
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
                  {selectedListing.video_url && (
                    <div>
                      <p className="text-sm font-medium mb-2">Video Proof</p>
                      <video src={selectedListing.video_url} controls className="w-full rounded-lg border border-border" />
                    </div>
                  )}
                  {selectedListing.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(selectedListing.id, "approved")} disabled={!!actionLoading}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => handleAction(selectedListing.id, "rejected")} disabled={!!actionLoading}>
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
  listing, selected, onToggleSelect, onView, onApprove, onReject, onDelete, actionLoading, timeAgo, statusVariant,
}: {
  listing: Listing;
  selected?: boolean;
  onToggleSelect?: () => void;
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
      {onToggleSelect && (
        <Checkbox checked={!!selected} onCheckedChange={onToggleSelect} />
      )}
      {listing.image_urls[0] ? (
        <img src={listing.image_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover border border-border shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{listing.title}</p>
          {(listing.report_count || 0) > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Flag className="h-3 w-3" /> {listing.report_count}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          by @{listing.profiles?.username || "unknown"} • {listing.college} • {timeAgo(listing.created_at)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold">₹{listing.price}</span>
          {statusVariant && (
            <Badge variant={statusVariant(listing.status) as any} className="text-xs">{listing.status}</Badge>
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
