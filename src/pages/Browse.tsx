import { useState, useEffect, useRef, useCallback } from "react";
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

const PAGE_SIZE = 12;

const BrowsePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchSeqRef = useRef(0);


  // Debounce search query for server-side filtering
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      const seq = ++fetchSeqRef.current;
      if (replace) setLoading(true);
      else setLoadingMore(true);

      let q = supabase
        .from("listings")
        .select("id, user_id, title, description, category, college, price, original_price, condition, status, image_urls, video_url, tags, created_at, updated_at")
        .in("status", ["approved", "sold", "frozen"])
        .order("created_at", { ascending: false })
        .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

      const term = debouncedSearch.trim();
      if (term) {
        const safe = term.replace(/[,()]/g, " ").toLowerCase();
        // Match title OR description OR a tag containing the term
        q = q.or(
          `title.ilike.*${safe}*,description.ilike.*${safe}*,tags.cs.{${safe}}`
        );
      }
      if (selectedTag) q = q.contains("tags", [selectedTag]);
      if (selectedCategory) {
        const catName = CATEGORIES.find((c) => c.id === selectedCategory)?.name;
        if (catName) q = q.eq("category", catName);
      }
      if (selectedConditions.length > 0) q = q.in("condition", selectedConditions);
      if (selectedPriceRange) {
        const range = priceRanges.find((r) => r.id === selectedPriceRange);
        if (range) {
          q = q.gte("price", range.min);
          if (range.max !== Infinity) q = q.lte("price", range.max);
        }
      }
      if (selectedCollege) {
        const collegeKey = selectedCollege.split(" - ")[0];
        q = q.ilike("college", `%${collegeKey}%`);
      }


      const { data: listings } = await q;

      // Stale response guard
      if (seq !== fetchSeqRef.current) return;

      const rows = listings || [];
      const userIds = Array.from(new Set(rows.map((l) => l.user_id)));
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("user_id, first_name, username").in("user_id", userIds)
        : { data: [] as Array<{ user_id: string; username: string; first_name: string }> };

      if (seq !== fetchSeqRef.current) return;

      const mapped: Product[] = rows.map((l: any) => {
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
          tags: (l.tags as string[]) || [],
          seller: {
            id: l.user_id,
            name: p?.username || "Seller",
            isDealer: false,
            isVerified: true,
          },
          createdAt: timeAgo(l.created_at),
          views: 0,
          isSold: l.status === "sold",
          isReserved: l.status === "frozen",
        };
      });

      setProducts((prev) => (replace ? mapped : [...prev, ...mapped]));
      setHasMore(rows.length === PAGE_SIZE);
      setPage(pageIndex);
      setLoading(false);
      setLoadingMore(false);
    },
    [debouncedSearch, selectedCategory, selectedConditions, selectedPriceRange, selectedCollege, selectedTag]
  );

  // Load popular tags (top 12 by recent frequency)
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("tags")
        .in("status", ["approved", "sold"])
        .order("created_at", { ascending: false })
        .limit(200);
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        (r.tags || []).forEach((t: string) => {
          if (!t) return;
          counts[t] = (counts[t] || 0) + 1;
        });
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);
      setPopularTags(sorted);
    })();
  }, []);


  // Reset and refetch from page 0 whenever filters change
  useEffect(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          fetchPage(page + 1, false);
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [page, hasMore, loading, loadingMore, fetchPage]);

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
    setSelectedTag(null);
    setSearchQuery("");
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedCollege,
    selectedConditions.length > 0,
    selectedPriceRange,
    selectedTag,
  ].filter(Boolean).length;

  const searchTermLower = debouncedSearch.trim().toLowerCase();


  const filteredProducts = products;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Products</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading…" : `Showing ${filteredProducts.length}${hasMore ? "+" : ""} products from GGSIPU students`}
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

        {popularTags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Popular tags:</span>
            {popularTags.map((t) => {
              const active = selectedTag === t;
              return (
                <Badge
                  key={t}
                  variant={active ? "default" : "outline"}
                  className="cursor-pointer capitalize hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedTag(active ? null : t)}
                >
                  #{t}
                </Badge>
              );
            })}
          </div>
        )}



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
                {selectedTag && (
                  <Badge variant="default" className="gap-1 capitalize">
                    #{selectedTag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTag(null)} />
                  </Badge>
                )}
              </div>
            )}

            {loading ? (
              <Card className="p-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              </Card>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                  {filteredProducts.map((product) => {
                    const matched = new Set<string>();
                    if (selectedTag) matched.add(selectedTag);
                    if (searchTermLower) {
                      (product.tags || []).forEach((t) => {
                        if (t.toLowerCase().includes(searchTermLower)) matched.add(t);
                      });
                    }
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={setQuickViewProduct}
                        matchedTags={Array.from(matched)}
                      />
                    );
                  })}
                </div>

                <div ref={sentinelRef} className="py-8 flex justify-center text-sm text-muted-foreground">
                  {loadingMore ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : hasMore ? (
                    <span className="opacity-60">Scroll for more</span>
                  ) : (
                    <span>No more listings</span>
                  )}
                </div>
              </>
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
