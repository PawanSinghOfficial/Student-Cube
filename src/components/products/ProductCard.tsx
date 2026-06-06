import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Clock, Eye, Maximize2, GitCompare, Check } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  college: string;
  condition: "new" | "like-new" | "good" | "fair";
  tags?: string[];
  seller: {
    id?: string;
    name: string;
    isDealer: boolean;
    isVerified: boolean;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  views: number;
  isFeatured?: boolean;
  isSold?: boolean;
  isReserved?: boolean;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showCompare?: boolean;
  matchedTags?: string[];
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

export function ProductCard({ product, onQuickView, showCompare = true, matchedTags = [] }: ProductCardProps) {
  const { addToCompare, removeFromCompare, isInCompare, compareProducts, maxProducts } = useCompare();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const inCompare = isInCompare(product.id);
  const wishlisted = isWishlisted(product.id);
  
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
    } else if (compareProducts.length < maxProducts) {
      addToCompare(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card variant="product" className="group h-full relative">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isFeatured && (
              <Badge variant="featured" className="text-xs">Featured</Badge>
            )}
            {discount > 0 && (
              <Badge variant="accent" className="text-xs">{discount}% OFF</Badge>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${wishlisted ? "bg-background text-destructive" : "bg-background/80 hover:bg-background"}`}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
            </Button>
            {onQuickView && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 hover:bg-background h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            {showCompare && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${inCompare ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background/80 hover:bg-background"}`}
                onClick={handleCompareClick}
                disabled={!inCompare && compareProducts.length >= maxProducts}
              >
                {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
              </Button>
            )}
          </div>
          
          {/* Sold overlay */}
          {product.isSold && (
            <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">SOLD OUT</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Category & Condition */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
            <Badge variant={conditionColors[product.condition]} className="text-xs">
              {conditionLabels[product.condition]}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {matchedTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {matchedTags.slice(0, 3).map((t) => (
                <Badge key={t} variant="accent" className="text-[10px] px-1.5 py-0 capitalize">
                  #{t}
                </Badge>
              ))}
            </div>
          )}



          {/* College & Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{product.college}</span>
          </div>

          {/* Seller info */}
          {product.seller.id ? (
            <div
              role="link"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/profile/${product.seller.id}`; }}
              className="flex items-center gap-2 hover:text-primary cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">{product.seller.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm text-muted-foreground hover:text-primary">{product.seller.name}</span>
              {product.seller.isDealer && <Badge variant="dealer" className="text-[10px] px-1.5 py-0.5">Dealer</Badge>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">{product.seller.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm text-muted-foreground">{product.seller.name}</span>
              {product.seller.isDealer && <Badge variant="dealer" className="text-[10px] px-1.5 py-0.5">Dealer</Badge>}
            </div>
          )}

          {/* Price */}
          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {product.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {product.createdAt}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
