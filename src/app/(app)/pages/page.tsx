import { db } from "@/db";
import { pages } from "@/db/schema";
import { isNull } from "drizzle-orm";
import { PageCard } from "@/components/pages/PageCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getPages() {
  return db.query.pages.findMany({
    where: isNull(pages.parentPageId),
    limit: 50,
  });
}

export default async function PagesPage() {
  const pageList = await getPages();

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
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pageList.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
