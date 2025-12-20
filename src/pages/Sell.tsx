import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, GGSIPU_COLLEGES } from "@/data/mockData";
import { Upload, Camera, IndianRupee, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SellPage = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Listing Submitted!",
      description: "Your listing is pending admin approval. You'll be notified once approved.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <Badge variant="accent" className="mb-4">Become a Seller</Badge>
          <h1 className="text-3xl font-bold text-foreground">List Your Item</h1>
          <p className="text-muted-foreground mt-2">Fill in the details to sell your college accessories</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div className="space-y-2">
              <Label>Product Photos *</Label>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50 cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input id="title" placeholder="e.g., Engineering Mathematics B.S. Grewal" required />
            </div>

            {/* Category & College */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select id="category" className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">Your College *</Label>
                <select id="college" className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background" required>
                  <option value="">Select college</option>
                  {GGSIPU_COLLEGES.map((college) => <option key={college} value={college}>{college.split(" - ")[0]}</option>)}
                </select>
              </div>
            </div>

            {/* Price & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="price" type="number" placeholder="Enter price" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <select id="condition" className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background" required>
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Describe your item in detail..." rows={4} required />
            </div>

            {/* Video Proof */}
            <div className="space-y-2">
              <Label>Video Proof (Required for approval)</Label>
              <div className="p-4 rounded-lg border-2 border-dashed border-border bg-secondary/50 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Upload a video showing the item functioning</p>
              </div>
            </div>

            {/* Info */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Listing Fee: ₹9</p>
                  <p className="text-muted-foreground">After admin approval, pay ₹9 to get your "Dealer" badge and full visibility.</p>
                </div>
              </div>
            </Card>

            <Button type="submit" variant="accent" size="xl" className="w-full">
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit for Review
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default SellPage;
