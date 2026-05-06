import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard, Product } from "@/components/products/ProductCard";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { CompareBar } from "@/components/products/CompareBar";
import { CATEGORIES, GGSIPU_COLLEGES } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  List,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

const conditions = [
  { id: "new", label: "New" },
  { id: "like-new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
];

const priceRanges = [
  { id: "0-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-1000", label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { id: "1000-2500", label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { id: "2500+", label: "Above ₹2,500", min: 2500, max: Infinity },
];

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const BrowsePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .in("status", ["approved", "sold"])
        .order("created_at", { ascending: false });

      if (!listings) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const userIds = Array.from(new Set(listings.map((l) => l.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, username")
        .in("user_id", userIds);

      const mapped: Product[] = listings.map((l) => {
        const p = profiles?.find((pr) => pr.user_id === l.user_id);
        return {
          id: l.id,
          title: l.title,
          price: l.price,
          originalPrice: l.original_price ?? undefined,
          image: l.image_urls?.[0] || "/placeholder.svg",
          category: l.category,
          college: l.college,
          condition: l.condition as Product["condition"],
          seller: {
            id: l.user_id,
            name: p?.first_name || p?.username || "Seller",
            isDealer: false,
            isVerified: true,
          },
          createdAt: timeAgo(l.created_at),
          views: 0,
          isSold: l.status === "sold",
        };
      });

      setProducts(mapped);
      setLoading(false);
    };
    load();
  }, []);

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCollege(null);
    setSelectedConditions([]);
    setSelectedPriceRange(null);
    setSearchQuery("");
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedCollege,
    selectedConditions.length > 0,
    selectedPriceRange,
  ].filter(Boolean).length;

  const filteredProducts = products.filter((product) => {
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && product.category !== CATEGORIES.find((c) => c.id === selectedCategory)?.name) return false;
    if (selectedConditions.length > 0 && !selectedConditions.includes(product.condition)) return false;
    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.id === selectedPriceRange);
      if (range && (product.price < range.min || product.price > range.max)) return false;
    }
    if (selectedCollege && !product.college.toLowerCase().includes(selectedCollege.toLowerCase().split(" - ")[0])) return false;
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Products</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading…" : `${filteredProducts.length} products available from GGSIPU students`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for books, calculators, drafters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>

          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && <Badge variant="accent" className="ml-2">{activeFiltersCount}</Badge>}
          </Button>

          <div className="flex gap-2">
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="rounded-none">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="rounded-none">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">Clear All</Button>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Condition</h4>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition) => (
                    <Badge
                      key={condition.id}
                      variant={selectedConditions.includes(condition.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCondition(condition.id)}
                    >
                      {condition.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(selectedPriceRange === range.id ? null : range.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedPriceRange === range.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">College</h4>
                <select
                  value={selectedCollege || ""}
                  onChange={(e) => setSelectedCollege(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">All Colleges</option>
                  {GGSIPU_COLLEGES.map((college) => (
                    <option key={college} value={college}>{college.split(" - ")[0]}</option>
                  ))}
                </select>
              </div>
            </Card>
          </aside>

          <div className="flex-1">
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                  </Badge>
                )}
                {selectedConditions.map((condition) => (
                  <Badge key={condition} variant="secondary" className="gap-1">
                    {conditions.find((c) => c.id === condition)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCondition(condition)} />
                  </Badge>
                ))}
                {selectedPriceRange && (
                  <Badge variant="secondary" className="gap-1">
                    {priceRanges.find((r) => r.id === selectedPriceRange)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedPriceRange(null)} />
                  </Badge>
                )}
              </div>
            )}

            {loading ? (
              <Card className="p-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              </Card>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No products found</h3>
                  <p>Try adjusting your filters or check back later for new listings</p>
                </div>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </Card>
            )}
          </div>
        </div>

        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={(open) => !open && setQuickViewProduct(null)}
        />
        <CompareBar />
      </div>
    </Layout>
  );
};

export default BrowsePage;
