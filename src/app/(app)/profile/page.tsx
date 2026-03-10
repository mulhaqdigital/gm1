"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getAvatarColor } from "@/lib/avatar-color";
import { useLoginDialog } from "@/components/auth/LoginDialogProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { openLoginDialog } = useLoginDialog();
  const [profile, setProfile] = useState<{ name: string; phone: string; pictureUrl: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile/me")
      .then((r) => {
        if (r.status === 401) { openLoginDialog("/profile"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profile/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      toast.success("Profile updated");
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.pictureUrl} />
          <AvatarFallback className="text-xl font-bold text-white" style={{ background: getAvatarColor(name || "?") }}>
            {name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{name || "Your Profile"}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                type="tel"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="destructive" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
