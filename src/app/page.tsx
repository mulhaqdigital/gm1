import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { PageCard } from "@/components/pages/PageCard";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";
import { ArrowRight } from "lucide-react";

async function getPublicPages() {
  return db.query.pages.findMany({
    where: isNull(pages.parentPageId),
    orderBy: desc(pages.createdAt),
    limit: 8,
  });
}

export default async function Home() {
  const publicPages = await getPublicPages();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">GM1</h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Groups. Pages. People. A platform for discovery and collaboration.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Public pages */}
      {publicPages.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Public Pages</h2>
            <Link
              href="/pages"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {publicPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
