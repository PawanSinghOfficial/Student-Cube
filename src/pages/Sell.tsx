import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, GGSIPU_COLLEGES } from "@/data/mockData";
import { Upload, Camera, IndianRupee, Info, CheckCircle, X, Loader2, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const DRAFT_KEY = "sell_draft_v1";
const EMPTY_FORM = { title: "", category: "", college: "", price: "", originalPrice: "", condition: "", description: "" };

const SellPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) return { ...EMPTY_FORM, ...JSON.parse(raw) };
    } catch {}
    return EMPTY_FORM;
  });
  const [draftSaved, setDraftSaved] = useState(false);
  const isFirstRender = useRef(true);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const hasContent = Object.values(formData).some((v) => v && String(v).trim() !== "");
    const t = setTimeout(() => {
      if (hasContent) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        setDraftSaved(true);
        const hide = setTimeout(() => setDraftSaved(false), 1500);
        return () => clearTimeout(hide);
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [formData]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(EMPTY_FORM);
    toast({ title: "Draft cleared" });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;
    const newFiles = files.slice(0, remaining);
    
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to list an item.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (images.length === 0) {
      toast({ title: "Images required", description: "Please add at least one product photo.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("listings").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("listings").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      // Upload video if provided
      let videoUrl: string | null = null;
      if (videoFile) {
        const ext = videoFile.name.split(".").pop();
        const path = `${user.id}/videos/${crypto.randomUUID()}.${ext}`;
        const { error: vErr } = await supabase.storage.from("listings").upload(path, videoFile);
        if (vErr) throw vErr;
        const { data: vUrlData } = supabase.storage.from("listings").getPublicUrl(path);
        videoUrl = vUrlData.publicUrl;
      }

      // Insert listing
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        college: formData.college,
        price: parseInt(formData.price),
        original_price: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        condition: formData.condition,
        image_urls: imageUrls,
        video_url: videoUrl,
      });

      if (error) throw error;

      toast({
        title: "Listing Submitted!",
        description: "Your listing is pending admin approval. You'll be notified once approved.",
      });

      // Reset form
      setFormData({ title: "", category: "", college: "", price: "", originalPrice: "", condition: "", description: "" });
      setImages([]);
      setImagePreviews([]);
      setVideoFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit listing.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
              <Label>Product Photos * (up to 4)</Label>
              <div className="grid grid-cols-4 gap-3">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50 cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Engineering Mathematics B.S. Grewal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category & College */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">Your College *</Label>
                <select
                  id="college"
                  className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  required
                >
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
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    className="pl-10"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <select
                  id="condition"
                  className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  required
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Original Price */}
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (₹) <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="Original MRP"
                  className="pl-10"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Video Proof */}
            <div className="space-y-2">
              <Label>Video Proof (Required for approval)</Label>
              <div
                onClick={() => videoInputRef.current?.click()}
                className="p-4 rounded-lg border-2 border-dashed border-border bg-secondary/50 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {videoFile ? videoFile.name : "Upload a video showing the item functioning"}
                </p>
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
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

            <Button type="submit" variant="accent" size="xl" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default SellPage;
