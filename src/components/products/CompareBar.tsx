import { useState } from "react";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { X, GitCompare, ChevronUp, ChevronDown } from "lucide-react";
import { CompareModal } from "./CompareModal";

export function CompareBar() {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showModal, setShowModal] = useState(false);

  if (compareProducts.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-b-0 border-border rounded-t-lg px-4 py-1 flex items-center gap-2 text-sm font-medium"
        >
          <GitCompare className="h-4 w-4" />
          Compare ({compareProducts.length})
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Product Thumbnails */}
              <div className="flex-1 flex items-center gap-3 overflow-x-auto">
                {compareProducts.map((product) => (
                  <div
                    key={product.id}
                    className="relative flex items-center gap-2 bg-secondary/50 rounded-lg p-2 pr-8 shrink-0"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="max-w-[120px]">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-primary font-semibold">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-1 right-1 p-1 hover:bg-destructive/20 rounded-full transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: 4 - compareProducts.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-[180px] h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm shrink-0"
                  >
                    Add product
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={clearCompare}>
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowModal(true)}
                  disabled={compareProducts.length < 2}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CompareModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
