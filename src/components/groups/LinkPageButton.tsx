"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link2, Unlink, Plus, FileText, SearchX } from "lucide-react";

interface PageOption {
  id: string;
  title: string;
}

export function LinkPageButton({
  groupId,
  linkedPages,
}: {
  groupId: string;
  linkedPages: PageOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [allPages, setAllPages] = useState<PageOption[]>([]);
  const [search, setSearch] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  // New page state
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Local linked state so UI updates immediately
  const [linked, setLinked] = useState<PageOption[]>(linkedPages);

  async function handleOpen(val: boolean) {
    setOpen(val);
    if (val && allPages.length === 0) {
      setLoadingPages(true);
      const res = await fetch("/api/pages?all=true");
      const data = await res.json();
      setAllPages(data);
      setLoadingPages(false);
    }
    if (!val) setSearch("");
  }

  async function handleLink(page: PageOption) {
    setActing(page.id);
    const res = await fetch(`/api/pages/${page.id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    if (!res.ok) {
      toast.error("Failed to link page");
    } else {
      toast.success(`Linked "${page.title}"`);
      setLinked((prev) => [...prev, page]);
      router.refresh();
    }
    setActing(null);
  }

  async function handleUnlink(page: PageOption) {
    setActing(page.id);
    const res = await fetch(`/api/pages/${page.id}/groups`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    if (!res.ok) {
      toast.error("Failed to unlink page");
    } else {
      toast.success(`Unlinked "${page.title}"`);
      setLinked((prev) => prev.filter((p) => p.id !== page.id));
      router.refresh();
    }
    setActing(null);
  }

  async function handleCreateAndLink() {
    if (!newTitle.trim()) return;
    setCreating(true);

    // Create page
    const createRes = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (!createRes.ok) {
      toast.error("Failed to create page");
      setCreating(false);
      return;
    }
    const newPage: PageOption = await createRes.json();

    // Link to group
    const linkRes = await fetch(`/api/pages/${newPage.id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    if (!linkRes.ok) {
      toast.error("Page created but failed to link");
    } else {
      toast.success(`Created and linked "${newPage.title}"`);
      setLinked((prev) => [...prev, newPage]);
      setAllPages((prev) => [...prev, newPage]);
      setNewTitle("");
      router.refresh();
    }
    setCreating(false);
  }

  const linkedIds = new Set(linked.map((p) => p.id));
  const filtered = allPages.filter(
    (p) => !linkedIds.has(p.id) && p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-1" />
          Link page
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">

        <div className="px-6 pt-5 pb-6 space-y-4">
        <DialogHeader>
          <DialogTitle>Manage linked pages</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="linked">
          <TabsList className="w-full">
            <TabsTrigger value="linked" className="flex-1">
              Linked ({linked.length})
            </TabsTrigger>
            <TabsTrigger value="find" className="flex-1">
              Find
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1">
              New page
            </TabsTrigger>
          </TabsList>

          {/* Linked pages — unlink */}
          <TabsContent value="linked">
            <div className="max-h-64 overflow-y-auto space-y-1 mt-2">
              {linked.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No pages linked yet</p>
                </div>
              ) : (
                linked.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted">
                    <span className="text-sm truncate">{p.title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive shrink-0 ml-2"
                      disabled={acting === p.id}
                      onClick={() => handleUnlink(p)}
                    >
                      <Unlink className="h-3.5 w-3.5 mr-1" />
                      {acting === p.id ? "…" : "Unlink"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Find existing pages — link */}
          <TabsContent value="find" className="space-y-2 mt-2">
            <Input
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-56 overflow-y-auto space-y-1">
              {loadingPages ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <SearchX className="h-7 w-7 opacity-30" />
                  <p className="text-sm">No pages found</p>
                </div>
              ) : (
                filtered.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted">
                    <span className="text-sm truncate">{p.title}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={acting === p.id}
                      onClick={() => handleLink(p)}
                      className="shrink-0 ml-2"
                    >
                      {acting === p.id ? "Linking…" : "Link"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Create new page + auto-link */}
          <TabsContent value="new" className="space-y-3 mt-2">
            <Input
              placeholder="Page title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAndLink()}
              autoFocus
            />
            <Button
              className="w-full"
              disabled={!newTitle.trim() || creating}
              onClick={handleCreateAndLink}
            >
              <Plus className="h-4 w-4 mr-1" />
              {creating ? "Creating…" : "Create & link"}
            </Button>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
