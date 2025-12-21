import { Link } from "react-router-dom";
import { Product } from "@/components/products/ProductCard";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, Trash2 } from "lucide-react";

interface RecentlyViewedSectionProps {
  products: Product[];
  excludeId?: string;
  onClear?: () => void;
  title?: string;
  showClearButton?: boolean;
}

export function RecentlyViewedSection({
  products,
  excludeId,
  onClear,
  title = "Recently Viewed",
  showClearButton = true,
}: RecentlyViewedSectionProps) {
  const filteredProducts = excludeId
    ? products.filter((p) => p.id !== excludeId)
    : products;

  if (filteredProducts.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({filteredProducts.length} items)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showClearButton && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Link to="/browse">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredProducts.slice(0, 5).map((product) => (
          <ProductCard key={product.id} product={product} showCompare={false} />
        ))}
      </div>
    </section>
  );
}
