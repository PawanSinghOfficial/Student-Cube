import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { UpiPaymentDialog } from "@/components/payments/UpiPaymentDialog";
import { RecentlyViewedSection } from "@/components/products/RecentlyViewedSection";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import {
  Heart, Share2, MapPin, Clock, Eye, Shield, MessageCircle, CreditCard,
  AlertTriangle, ChevronLeft, ChevronRight, Star, BadgeCheck, Phone, Mail,
  CheckCircle, Copy, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ListingFull {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  college: string;
  price: number;
  original_price: number | null;
  condition: string;
  image_urls: string[];
  video_url: string | null;
  status: string;
  created_at: string;
  seller_username: string;
  seller_full_name: string;
}

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { isWishlisted: isInWishlist, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [product, setProduct] = useState<ListingFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data: l } = await supabase.from("listings").select("id, user_id, title, description, category, college, price, original_price, condition, status, image_urls, video_url, created_at, updated_at").eq("id", id).maybeSingle();
      if (!l) {
        setProduct(null);
        setLoading(false);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name, username")
        .eq("user_id", l.user_id)
        .maybeSingle();
      const full: ListingFull = {
        ...(l as any),
        seller_username: p?.username || "seller",
        seller_full_name: p?.first_name || p?.username || "Seller",
      } as ListingFull;
      setProduct(full);
      setLoading(false);
      addToRecentlyViewed({
        id: l.id,
        title: l.title,
        price: l.price,
        originalPrice: l.original_price ?? undefined,
        image: l.image_urls?.[0] || "/placeholder.svg",
        category: l.category,
        college: l.college,
        condition: l.condition as any,
        seller: { name: p?.username || "Seller", isDealer: false, isVerified: true },
        createdAt: timeAgo(l.created_at),
        views: 0,
      });
    };
    load();
  }, [id, addToRecentlyViewed]);

  useEffect(() => {
    if (!id || !user || !product || product.user_id === user.id) {
      setCanReview(false);
      return;
    }
    const check = async () => {
      const [{ data: convo }, { data: existing }] = await Promise.all([
        supabase
          .from("conversations")
          .select("id")
          .eq("buyer_id", user.id)
          .eq("seller_id", product.user_id)
          .eq("listing_id", id)
          .maybeSingle(),
        supabase
          .from("reviews")
          .select("id")
          .eq("reviewer_id", user.id)
          .eq("listing_id", id)
          .maybeSingle(),
      ]);
      setCanReview(!!convo);
      setAlreadyReviewed(!!existing);
    };
    check();
  }, [id, user, product]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/browse"><Button>Back to Browse</Button></Link>
        </div>
      </Layout>
    );
  }

  const images = product.image_urls?.length ? product.image_urls : ["/placeholder.svg"];
  const isOwnListing = user?.id === product.user_id;
  const isSold = product.status === "sold";

  const handleMarkSold = async () => {
    if (!user || !isOwnListing) return;
    const { error } = await supabase.from("listings").update({ status: "sold" }).eq("id", product.id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed to mark sold", description: error.message, variant: "destructive" });
      return;
    }
    setProduct({ ...product, status: "sold" });
    toast({ title: "Listing marked as sold", description: "Your listing now shows a SOLD badge." });
  };

  const handleContactSeller = () => setShowPaymentDialog(true);
  const handlePaymentComplete = () => {
    setContactUnlocked(true);
    toast({ title: "Contact Access Granted!", description: "You can now view seller contact details and chat freely." });
  };
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} Copied!`, description: `${text} has been copied to clipboard.` });
  };
  const wishlisted = product ? isInWishlist(product.id) : false;
  const handleWishlist = () => {
    if (product) toggleWishlist(product.id);
  };
  const handleChatClick = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to chat with the seller.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (isOwnListing) {
      toast({ title: "This is your listing", description: "You cannot start a chat on your own listing.", variant: "destructive" });
      return;
    }
    navigate(`/chat?listing=${id}`);
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img src={images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {discount > 0 && !isSold && <Badge variant="accent">{discount}% OFF</Badge>}
              </div>
              {isSold && (
                <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
                  <Badge variant="destructive" className="text-2xl px-6 py-3">SOLD</Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 right-4 bg-background/80 hover:bg-background ${wishlisted ? "text-destructive" : ""}`}
                onClick={handleWishlist}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {product.video_url && (
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary">
                <video
                  src={product.video_url}
                  controls
                  preload="metadata"
                  playsInline
                  controlsList="nodownload"
                  className="w-full h-auto block bg-black"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="px-4 py-2 text-xs text-muted-foreground">Seller's video proof</div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="success">{product.condition}</Badge>
            </div>

            <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.original_price.toLocaleString()}</span>
                  <Badge variant="accent">Save ₹{(product.original_price - product.price).toLocaleString()}</Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Posted {timeAgo(product.created_at)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{product.college}</span>
            </div>

            <Card className="p-4">
              <Link
                to={isOwnListing ? "/profile" : `/profile/${product.user_id}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{(contactUnlocked || isOwnListing ? product.seller_full_name : product.seller_username).charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold hover:text-primary">{contactUnlocked || isOwnListing ? product.seller_full_name : `@${product.seller_username}`}</span>
                    <BadgeCheck className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span>View seller profile</span>
                  </div>
                </div>
              </Link>
            </Card>

            <Card className="p-4 bg-accent/10 border-accent/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-accent">Safety Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    Currently 80% of transactions complete safely. Always verify the product before making payment.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {isSold ? (
                <Card className="p-4 bg-destructive/10 border-destructive/30 text-center">
                  <p className="font-semibold text-destructive">This item is sold</p>
                  <p className="text-sm text-muted-foreground mt-1">The seller is no longer accepting offers.</p>
                </Card>
              ) : contactUnlocked ? (
                <Button variant="success" size="xl" className="w-full" disabled>
                  <CheckCircle className="h-5 w-5 mr-2" />Contact Unlocked
                </Button>
              ) : (
                <Button variant="accent" size="xl" className="w-full" onClick={handleContactSeller} disabled={isOwnListing}>
                  <Phone className="h-5 w-5 mr-2" />Contact Seller - ₹9
                </Button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" onClick={handleChatClick} disabled={isOwnListing || isSold}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isSold ? "Sold" : isOwnListing ? "Your listing" : "Chat with Seller"}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />Share
                </Button>
              </div>
              {isOwnListing && !isSold && (
                <Button variant="destructive" size="lg" className="w-full" onClick={handleMarkSold}>
                  Mark as Sold
                </Button>
              )}
              {canReview && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => setShowReviewDialog(true)}
                  disabled={alreadyReviewed}
                >
                  <Star className="h-4 w-4" />
                  {alreadyReviewed ? "You've reviewed this seller" : "Leave a Review"}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-success" />Verified Seller
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-success" />Secure Payment
              </div>
            </div>
          </div>
        </div>

        <Card className="mt-12 p-6">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {product.description || `This is a high-quality ${product.category.toLowerCase()} item in ${product.condition} condition.`}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Product Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-secondary rounded-lg"><span className="text-sm text-muted-foreground">Category</span><p className="font-medium">{product.category}</p></div>
            <div className="p-3 bg-secondary rounded-lg"><span className="text-sm text-muted-foreground">Condition</span><p className="font-medium capitalize">{product.condition.replace("-", " ")}</p></div>
            <div className="p-3 bg-secondary rounded-lg"><span className="text-sm text-muted-foreground">College</span><p className="font-medium">{product.college}</p></div>
            <div className="p-3 bg-secondary rounded-lg"><span className="text-sm text-muted-foreground">Posted</span><p className="font-medium">{timeAgo(product.created_at)}</p></div>
          </div>
        </Card>

        <RecentlyViewedSection
          products={recentlyViewed}
          excludeId={id}
          onClear={clearRecentlyViewed}
          title="Recently Viewed"
        />
      </div>

      <UpiPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={9}
        purpose="Contact Access Fee - IPU KA ADDA"
        onPaymentComplete={handlePaymentComplete}
      />

      {product && (
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          sellerId={product.user_id}
          listingId={product.id}
          onSubmitted={() => setAlreadyReviewed(true)}
        />
      )}
    </Layout>
  );
};

export default ProductDetail;
