"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, GripVertical, Minus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

interface FlatPage {
  id: string;
  title: string;
  parentPageId: string | null;
  sortOrder: number;
  children?: FlatPage[];
}

function buildTree(pages: FlatPage[]): FlatPage[] {
  const map = new Map(pages.map((p) => [p.id, { ...p, children: [] as FlatPage[] }]));
  const roots: FlatPage[] = [];
  for (const page of map.values()) {
    if (page.parentPageId) {
      map.get(page.parentPageId)?.children?.push(page);
    } else {
      roots.push(page);
    }
  }
  return roots;
}

/** Returns the set of all descendant IDs of a given page (to prevent circular reparenting). */
function getDescendantIds(pageId: string, allPages: FlatPage[]): Set<string> {
  const result = new Set<string>();
  const queue = [pageId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const p of allPages) {
      if (p.parentPageId === id) {
        result.add(p.id);
        queue.push(p.id);
      }
    }
  }
  return result;
}

function PageRow({
  page,
  allPages,
  depth,
  onReparent,
  onUnparent,
}: {
  page: FlatPage;
  allPages: FlatPage[];
  depth: number;
  onReparent: (pageId: string, newParentId: string) => Promise<void>;
  onUnparent: (pageId: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasChildren = (page.children?.length ?? 0) > 0;

  const descendants = getDescendantIds(page.id, allPages);
  const parentOptions = allPages.filter(
    (p) => p.id !== page.id && !descendants.has(p.id)
  );

  async function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSaving(true);
    if (val === "") {
      await onUnparent(page.id);
    } else {
      await onReparent(page.id, val);
    }
    setSaving(false);
  }

  return (
    <>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted group"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
        {hasChildren ? (
          <button onClick={() => setExpanded((v) => !v)} className="text-muted-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="flex-1 text-sm font-medium">{page.title}</span>
        <div className="flex items-center gap-2">
          <select
            value={page.parentPageId ?? ""}
            onChange={handleSelectChange}
            disabled={saving}
            className="h-7 text-xs rounded border border-border bg-background px-2 py-0 text-foreground disabled:opacity-50"
          >
            <option value="">— root —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      {expanded && hasChildren && page.children?.map((child) => (
        <PageRow
          key={child.id}
          page={child}
          allPages={allPages}
          depth={depth + 1}
          onReparent={onReparent}
          onUnparent={onUnparent}
        />
      ))}
    </>
  );
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<FlatPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((data) => setPages(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleReparent(pageId: string, newParentId: string) {
    const res = await fetch(`/api/pages/${pageId}/parent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentPageId: newParentId }),
    });
    if (res.ok) {
      toast.success("Parent updated");
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, parentPageId: newParentId } : p))
      );
    } else {
      toast.error("Failed to update parent");
    }
  }

  async function handleUnparent(pageId: string) {
    const res = await fetch(`/api/pages/${pageId}/parent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentPageId: null }),
    });
    if (res.ok) {
      toast.success("Moved to root");
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, parentPageId: null } : p))
      );
    } else {
      toast.error("Failed to move page");
    }
  }

  const tree = buildTree(pages);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Page Hierarchy</h1>
          <p className="text-muted-foreground text-sm mt-1">Admin — rearrange page structure</p>
        </div>
        <div className="border rounded-lg divide-y">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : tree.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No pages yet.</div>
          ) : (
            <div className="p-2">
              {tree.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  allPages={pages}
                  depth={0}
                  onReparent={handleReparent}
                  onUnparent={handleUnparent}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
