import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { UpiPaymentDialog } from "@/components/payments/UpiPaymentDialog";
import { RecentlyViewedSection } from "@/components/products/RecentlyViewedSection";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Eye,
  Shield,
  MessageCircle,
  CreditCard,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
  Phone,
  Mail,
  CheckCircle,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  // Track product view
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = [product.image, product.image, product.image];

  const handleContactSeller = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setContactUnlocked(true);
    toast({
      title: "Contact Access Granted!",
      description: "You can now view seller contact details and chat freely.",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied!`,
      description: `${text} has been copied to clipboard.`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted
        ? "Item removed from your wishlist"
        : "You'll be notified of price changes",
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation arrows */}
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

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.isFeatured && <Badge variant="featured">Featured</Badge>}
                {discount > 0 && <Badge variant="accent">{discount}% OFF</Badge>}
              </div>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 right-4 bg-background/80 hover:bg-background ${isWishlisted ? "text-destructive" : ""}`}
                onClick={handleWishlist}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Thumbnails */}
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
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Category & Condition */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="success">{product.condition}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <Badge variant="accent">Save ₹{(product.originalPrice - product.price).toLocaleString()}</Badge>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {product.views} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Posted {product.createdAt}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {product.college}
              </span>
            </div>

            {/* Seller Card */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{product.seller.name}</span>
                    {product.seller.isDealer && <Badge variant="dealer">Dealer</Badge>}
                    {product.seller.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span>4.8 (23 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Contact Details - Shown after payment */}
              {contactUnlocked && product.seller.phone && product.seller.email && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Contact Access Unlocked!</span>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{product.seller.phone}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(product.seller.phone!, "Phone number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="font-medium">{product.seller.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(product.seller.email!, "Email address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Warning */}
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

            {/* Actions */}
            <div className="space-y-3">
              {contactUnlocked ? (
                <Button variant="success" size="xl" className="w-full" disabled>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Contact Unlocked
                </Button>
              ) : (
                <Button variant="accent" size="xl" className="w-full" onClick={handleContactSeller}>
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Seller - ₹9
                </Button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {contactUnlocked ? "Free Chat" : "Quick Chat"}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-success" />
                Verified Seller
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-success" />
                Secure Payment
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-12 p-6">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-muted-foreground">
            This is a high-quality {product.category.toLowerCase()} item in {product.condition} condition. 
            Perfect for engineering students at {product.college}. The seller has verified ownership 
            with video proof and the admin has approved this listing.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Product Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Category</span>
              <p className="font-medium">{product.category}</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Condition</span>
              <p className="font-medium capitalize">{product.condition.replace("-", " ")}</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">College</span>
              <p className="font-medium">{product.college}</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Posted</span>
              <p className="font-medium">{product.createdAt}</p>
            </div>
          </div>
        </Card>

        {/* Recently Viewed Section */}
        <RecentlyViewedSection
          products={recentlyViewed}
          excludeId={id}
          onClear={clearRecentlyViewed}
          title="Recently Viewed"
        />
      </div>

      {/* UPI Payment Dialog */}
      <UpiPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={9}
        purpose="Contact Access Fee - IPU KA ADDA"
        onPaymentComplete={handlePaymentComplete}
      />
    </Layout>
  );
};

export default ProductDetail;
