"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageUrl, extractUuid } from "@/lib/slugify";

export interface SidebarPage {
  id: string;
  title: string;
  children: SidebarPage[];
}

function containsActive(page: SidebarPage, id: string | null): boolean {
  if (!id) return false;
  if (page.id === id) return true;
  return page.children.some((c) => containsActive(c, id));
}

function TreeNode({
  page,
  activeId,
  depth = 0,
}: {
  page: SidebarPage;
  activeId: string | null;
  depth?: number;
}) {
  const hasChildren = page.children.length > 0;
  const isActive = page.id === activeId;
  const shouldBeOpen = containsActive(page, activeId);
  const [open, setOpen] = useState(shouldBeOpen);

  useEffect(() => {
    if (shouldBeOpen) setOpen(true);
  }, [shouldBeOpen]);

  return (
    <li className="relative">
      {/* Indent guide line */}
      {depth > 0 && (
        <span
          className="absolute top-0 bottom-0 w-px bg-border"
          style={{ left: `${depth * 12 - 6}px` }}
        />
      )}

      <div className="flex items-center" style={{ paddingLeft: `${depth * 12}px` }}>
        {/* Chevron — rotates on open */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "h-5 w-5 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground transition-colors",
            !hasChildren && "invisible pointer-events-none"
          )}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-150",
              open && "rotate-90"
            )}
          />
        </button>

        {/* Row */}
        <Link
          href={pageUrl(page.id, page.title)}
          className={cn(
            "group flex items-center gap-1.5 px-1.5 py-1 rounded-md text-sm flex-1 min-w-0 transition-colors relative",
            isActive
              ? "text-foreground font-medium bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {/* Active left accent bar */}
          {isActive && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary" />
          )}

          {/* Icon only for leaf nodes */}
          {!hasChildren && (
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-50" />
          )}

          <span className="truncate">{page.title}</span>
        </Link>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <ul className="space-y-0.5 mt-0.5">
          {page.children.map((child) => (
            <TreeNode key={child.id} page={child} activeId={activeId} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function PagesSidebar({ tree }: { tree: SidebarPage[] }) {
  const pathname = usePathname();
  const match = pathname.match(/^\/pages\/([^/]+)/);
  // Extract UUID from slug so isActive comparison works against page.id
  const activeId = match ? (extractUuid(match[1]) ?? match[1]) : null;

  return (
    <nav>
      <div className="flex items-center justify-between px-1 mb-3">
        <Link
          href="/pages"
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          Pages
        </Link>
        <Link
          href="/pages/new"
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="New page"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      {tree.length === 0 ? (
        <p className="text-xs text-muted-foreground px-1">No pages yet.</p>
      ) : (
        /* Fade-out mask at the bottom */
        <div className="relative">
          <ul className="space-y-0.5">
            {tree.map((page) => (
              <TreeNode key={page.id} page={page} activeId={activeId} />
            ))}
          </ul>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
    </nav>
  );
}
