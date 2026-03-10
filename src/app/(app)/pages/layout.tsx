import { db } from "@/db";
import { pages } from "@/db/schema";
import { asc } from "drizzle-orm";
import { PagesSidebar, type SidebarPage } from "@/components/pages/PagesSidebar";
import { PagesMobileNav } from "@/components/pages/PagesMobileNav";

async function getPageTree(): Promise<SidebarPage[]> {
  const flat = await db
    .select({ id: pages.id, title: pages.title, parentPageId: pages.parentPageId })
    .from(pages)
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  const map = new Map(flat.map((p) => [p.id, { ...p, children: [] as SidebarPage[] }]));
  const roots: SidebarPage[] = [];
  for (const page of map.values()) {
    if (page.parentPageId) {
      map.get(page.parentPageId)?.children.push(page);
    } else {
      roots.push(page);
    }
  }
  return roots;
}

export default async function PagesLayout({ children }: { children: React.ReactNode }) {
  const tree = await getPageTree();

  return (
    <div>
      {/* Mobile trigger — hidden on desktop */}
      <div className="lg:hidden mb-4">
        <PagesMobileNav tree={tree} />
      </div>

      {/* Desktop layout */}
      <div className="flex gap-6 items-start">
        <aside className="hidden lg:block w-52 shrink-0 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <PagesSidebar tree={tree} />
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
