"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link2 } from "lucide-react";

interface PageOption {
  id: string;
  title: string;
}

export function LinkPageButton({
  groupId,
  linkedPageIds,
}: {
  groupId: string;
  linkedPageIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [allPages, setAllPages] = useState<PageOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  async function handleOpen(val: boolean) {
    setOpen(val);
    if (val && allPages.length === 0) {
      setLoading(true);
      const res = await fetch("/api/pages?all=true");
      const data = await res.json();
      setAllPages(data);
      setLoading(false);
    }
    if (!val) setSearch("");
  }

  async function handleLink(page: PageOption) {
    setAdding(page.id);
    const res = await fetch(`/api/pages/${page.id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    if (!res.ok) {
      toast.error("Failed to link page");
      setAdding(null);
      return;
    }
    toast.success(`Linked "${page.title}"`);
    setAdding(null);
    setOpen(false);
    router.refresh();
  }

  const linked = new Set(linkedPageIds);
  const filtered = allPages.filter(
    (p) => !linked.has(p.id) && p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-1" />
          Link page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a page</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search pages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No pages found.</p>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted">
                <span className="text-sm">{p.title}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={adding === p.id}
                  onClick={() => handleLink(p)}
                >
                  {adding === p.id ? "Linking…" : "Link"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
