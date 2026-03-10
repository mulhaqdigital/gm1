import { db } from "@/db";
import { PageCard } from "@/components/pages/PageCard";
import { EditLabelDialog } from "@/components/labels/EditLabelDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getPages() {
  return db.query.pages.findMany({
    limit: 50,
    with: { label: true },
  });
}

export default async function PagesPage() {
  const pageList = await getPages();

  // Group by label
  const grouped = new Map<string, { label: { id: string; name: string } | null; pages: typeof pageList }>();
  for (const page of pageList) {
    const key = page.label?.name ?? "__unlabeled__";
    if (!grouped.has(key)) {
      grouped.set(key, { label: page.label ?? null, pages: [] });
    }
    grouped.get(key)!.pages.push(page);
  }

  // Sort: labeled groups alphabetically, unlabeled last
  const sections = [...grouped.entries()]
    .sort(([a], [b]) => {
      if (a === "__unlabeled__") return 1;
      if (b === "__unlabeled__") return -1;
      return a.localeCompare(b);
    })
    .map(([, v]) => v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground text-sm mt-1">All public pages</p>
        </div>
        <Button asChild>
          <Link href="/pages/new">
            <Plus className="h-4 w-4 mr-1" />
            New Page
          </Link>
        </Button>
      </div>

      {pageList.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          No pages yet.
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.label?.id ?? "__unlabeled__"}>
              <div className="flex items-center gap-2 mb-3 group">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {section.label?.name ?? "Unlabeled"}
                </h2>
                {section.label && <EditLabelDialog label={section.label} />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.pages.map((page) => (
                  <PageCard key={page.id} page={page} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
