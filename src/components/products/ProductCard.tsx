import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Clock, Eye } from "lucide-react";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  college: string;
  condition: "new" | "like-new" | "good" | "fair";
  seller: {
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
}

interface ProductCardProps {
  product: Product;
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

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`}>
      <Card variant="product" className="group h-full">
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
          
          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              // Add to wishlist logic
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
          
          {/* Sold overlay */}
          {product.isSold && (
            <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">SOLD OUT</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category & Condition */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
            <Badge variant={conditionColors[product.condition]} className="text-xs">
              {conditionLabels[product.condition]}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* College & Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{product.college}</span>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {product.seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{product.seller.name}</span>
            {product.seller.isDealer && (
              <Badge variant="dealer" className="text-[10px] px-1.5 py-0.5">Dealer</Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
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
