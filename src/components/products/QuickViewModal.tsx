import { Product } from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MapPin, Clock, Eye, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const conditionColors = {
  new: "success",
  "like-new": "default",
  good: "secondary",
  fair: "outline",
} as const;

const conditionLabels = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
};

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto bg-secondary">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {product.isFeatured && (
                <Badge variant="featured" className="text-xs">Featured</Badge>
              )}
              {discount > 0 && (
                <Badge variant="accent" className="text-xs">{discount}% OFF</Badge>
              )}
            </div>
            {product.isSold && (
              <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">SOLD OUT</Badge>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 space-y-4">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant={conditionColors[product.condition]}>
                  {conditionLabels[product.condition]}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-semibold leading-tight">
                {product.title}
              </DialogTitle>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-medium text-green-600">
                  Save ₹{(product.originalPrice! - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{product.college}</span>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {product.seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{product.seller.name}</span>
                  {product.seller.isDealer && (
                    <Badge variant="dealer" className="text-[10px]">Dealer</Badge>
                  )}
                  {product.seller.isVerified && (
                    <Badge variant="success" className="text-[10px]">Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {product.views} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {product.createdAt}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" asChild>
                <Link to={`/product/${product.id}`}>
                  View Full Details
                </Link>
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="secondary" className="w-full" asChild>
              <Link to={`/chat?product=${product.id}`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Seller
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
