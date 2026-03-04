import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreePage {
  id: string;
  title: string;
  pictureUrl?: string | null;
  children?: TreePage[];
}

interface PageTreeProps {
  pages: TreePage[];
  depth?: number;
}

export function PageTree({ pages, depth = 0 }: PageTreeProps) {
  if (!pages.length) return null;

  return (
    <ul className="space-y-0.5">
      {pages.map((page) => (
        <li key={page.id}>
          <Link
            href={`/pages/${page.id}`}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors",
              depth > 0 && "text-muted-foreground hover:text-foreground"
            )}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{page.title}</span>
            {page.children && page.children.length > 0 && (
              <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground" />
            )}
          </Link>
          {page.children && page.children.length > 0 && (
            <PageTree pages={page.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
