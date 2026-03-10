"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageUrl } from "@/lib/slugify";

interface TreePage {
  id: string;
  title: string;
  pictureUrl?: string | null;
  children?: TreePage[];
}

// Matches PageCover's deterministic gradient
const GRADIENTS = [
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#667eea", "#764ba2"],
  ["#f6d365", "#fda085"],
  ["#96fbc4", "#f9f586"],
  ["#fbc2eb", "#a6c1ee"],
  ["#fddb92", "#d1fdff"],
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function getGradient(title: string): string {
  const [from, to] = GRADIENTS[hash(title) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function PageTreeNode({ page }: { page: TreePage }) {
  const hasChildren = !!page.children?.length;
  const [open, setOpen] = useState(true);

  return (
    <li>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "h-5 w-5 shrink-0 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            !hasChildren && "invisible pointer-events-none"
          )}
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-90")}
          />
        </button>

        <Link
          href={pageUrl(page.id, page.title)}
          className="flex items-center gap-2 flex-1 min-w-0 px-1.5 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <span
            className="h-3 w-3 rounded-sm shrink-0"
            style={{ background: getGradient(page.title) }}
          />
          <span className="truncate">{page.title}</span>
        </Link>
      </div>

      {hasChildren && open && (
        <div className="ml-[9px] border-l border-border/60 pl-3 mt-0.5">
          <ul className="space-y-0.5">
            {page.children!.map((child) => (
              <PageTreeNode key={child.id} page={child} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function PageTree({ pages }: { pages: TreePage[] }) {
  if (!pages.length) return null;
  return (
    <ul className="space-y-0.5">
      {pages.map((page) => (
        <PageTreeNode key={page.id} page={page} />
      ))}
    </ul>
  );
}
