import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GGSIPU_COLLEGES } from "@/data/mockData";

export interface ProfileEditable {
  first_name: string;
  username: string;
  college: string;
  bio: string;
  avatar_url: string;
}

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(60),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "Only letters, numbers, _ and . allowed"),
  college: z.string().min(1, "Select a college"),
  bio: z.string().max(300, "Bio must be under 300 characters").optional().default(""),
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  initial: ProfileEditable;
  onSaved: (p: ProfileEditable) => void;
}

export function EditProfileDialog({ open, onOpenChange, userId, initial, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileEditable>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
    setUploading(false);
  };

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);

    if (form.username.toLowerCase() !== initial.username.toLowerCase()) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("username", form.username)
        .neq("user_id", userId)
        .maybeSingle();
      if (existing) {
        toast({ title: "Username taken", description: "Pick a different username", variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: parsed.data.first_name,
        username: parsed.data.username,
        college: parsed.data.college,
        bio: parsed.data.bio || "",
        avatar_url: form.avatar_url,
      })
      .eq("user_id", userId);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated" });
    onSaved({ ...parsed.data, bio: parsed.data.bio || "", avatar_url: form.avatar_url });
    onOpenChange(false);
  };

  const initial_letter = (form.first_name || form.username || "U").charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {form.avatar_url ? <AvatarImage src={form.avatar_url} /> : null}
              <AvatarFallback className="text-2xl">{initial_letter}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Change Photo"}
                </div>
                <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} maxLength={60} />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} maxLength={30} />
          </div>

          <div>
            <Label>College</Label>
            <Select value={form.college} onValueChange={(v) => setForm({ ...form, college: v })}>
              <SelectTrigger><SelectValue placeholder="Select your college" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {GGSIPU_COLLEGES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio">About Me</Label>
            <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={300} placeholder="Tell other students about yourself..." />
            <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || uploading}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
