import { useCompare } from "@/contexts/CompareContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MapPin, Eye, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const conditionLabels = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
};

const conditionColors = {
  new: "success",
  "like-new": "default",
  good: "secondary",
  fair: "outline",
} as const;

export function CompareModal({ open, onOpenChange }: CompareModalProps) {
  const { compareProducts, removeFromCompare } = useCompare();

  if (compareProducts.length < 2) return null;

  const comparisonRows = [
    {
      label: "Price",
      render: (product: typeof compareProducts[0]) => (
        <div>
          <span className="text-xl font-bold text-primary">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="block text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Condition",
      render: (product: typeof compareProducts[0]) => (
        <Badge variant={conditionColors[product.condition]}>
          {conditionLabels[product.condition]}
        </Badge>
      ),
    },
    {
      label: "Category",
      render: (product: typeof compareProducts[0]) => (
        <Badge variant="secondary">{product.category}</Badge>
      ),
    },
    {
      label: "College",
      render: (product: typeof compareProducts[0]) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {product.college}
        </div>
      ),
    },
    {
      label: "Seller",
      render: (product: typeof compareProducts[0]) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {product.seller.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium">{product.seller.name}</span>
            <div className="flex gap-1">
              {product.seller.isDealer && (
                <Badge variant="dealer" className="text-[10px]">Dealer</Badge>
              )}
              {product.seller.isVerified && (
                <Badge variant="success" className="text-[10px]">Verified</Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Views",
      render: (product: typeof compareProducts[0]) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          {product.views}
        </div>
      ),
    },
    {
      label: "Posted",
      render: (product: typeof compareProducts[0]) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {product.createdAt}
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Compare Products</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Product Images & Titles */}
                <thead>
                  <tr>
                    <th className="w-32 p-3 text-left text-sm font-medium text-muted-foreground border-b border-border">
                      Product
                    </th>
                    {compareProducts.map((product) => (
                      <th
                        key={product.id}
                        className="p-3 text-left border-b border-border min-w-[200px]"
                      >
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(product.id)}
                            className="absolute -top-1 -right-1 p-1 bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full aspect-[4/3] object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                            {product.title}
                          </h3>
                          {product.isFeatured && (
                            <Badge variant="featured" className="text-xs">Featured</Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Comparison Rows */}
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr key={row.label} className={index % 2 === 0 ? "bg-secondary/30" : ""}>
                      <td className="p-3 text-sm font-medium text-muted-foreground border-b border-border">
                        {row.label}
                      </td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="p-3 border-b border-border">
                          {row.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Actions Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground">
                      Actions
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="p-3">
                        <div className="flex flex-col gap-2">
                          <Button size="sm" asChild>
                            <Link to={`/product/${product.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button size="sm" variant="secondary" asChild>
                            <Link to={`/chat?product=${product.id}`}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact
                            </Link>
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
