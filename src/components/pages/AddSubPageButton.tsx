"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, SearchX } from "lucide-react";

type Tab = "new" | "existing";

interface PageOption {
  id: string;
  title: string;
  parentPageId: string | null;
}

export function AddSubPageButton({
  parentPageId,
  existingChildIds,
}: {
  parentPageId: string;
  existingChildIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("new");

  // "Create new" state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // "Add existing" state
  const [allPages, setAllPages] = useState<PageOption[]>([]);
  const [search, setSearch] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setTitle("");
      setDescription("");
      setSearch("");
      setTab("new");
    }
  }

  async function switchToExisting() {
    setTab("existing");
    if (allPages.length > 0) return;
    setLoadingPages(true);
    const res = await fetch("/api/pages?all=true");
    const data: PageOption[] = await res.json();
    setAllPages(data);
    setLoadingPages(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, parentPageId }),
    });
    if (!res.ok) {
      toast.error("Failed to create sub-page");
      setCreating(false);
      return;
    }
    toast.success("Sub-page created");
    handleOpenChange(false);
    router.refresh();
  }

  async function handleAddExisting(pageId: string) {
    setAdding(pageId);
    const res = await fetch(`/api/pages/${pageId}/parent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentPageId }),
    });
    if (!res.ok) {
      toast.error("Failed to add page");
      setAdding(null);
      return;
    }
    toast.success("Page added as sub-page");
    handleOpenChange(false);
    router.refresh();
  }

  const excluded = new Set([parentPageId, ...existingChildIds]);
  const filtered = allPages.filter(
    (p) => !excluded.has(p.id) && p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New sub-page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">

        <div className="px-6 pt-5 pb-6 space-y-4">
        <DialogHeader>
          <DialogTitle>Add sub-page</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          <button
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "new"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("new")}
          >
            Create new
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "existing"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={switchToExisting}
          >
            Add existing
          </button>
        </div>

        {/* Create new */}
        {tab === "new" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subpage-title">Title</Label>
              <Input
                id="subpage-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subpage-desc">Description</Label>
              <Input
                id="subpage-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Add existing */}
        {tab === "existing" && (
          <div className="space-y-3">
            <Input
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {loadingPages ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <SearchX className="h-7 w-7 opacity-30" />
                  <p className="text-sm">No pages found</p>
                </div>
              ) : (
                filtered.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted"
                  >
                    <span className="text-sm">{p.title}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={adding === p.id}
                      onClick={() => handleAddExisting(p.id)}
                    >
                      {adding === p.id ? "Adding…" : "Add"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
