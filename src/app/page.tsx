import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageCard } from "@/components/pages/PageCard";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";
import { ArrowRight, Users, FileText } from "lucide-react";

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
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Organize your team.<br />Share what matters.
          </h1>
          <p className="text-xl text-muted-foreground">
            GM1 brings your groups, knowledge, and community together — so teams
            spend less time searching and more time doing.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button size="lg" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem hook */}
      <section className="bg-muted py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            Knowledge shouldn&apos;t live in silos.
          </h2>
          <p className="text-lg text-muted-foreground">
            Your team&apos;s best thinking is scattered across chats, docs, and
            inboxes. GM1 gives every group a home, every idea a page, and every
            person a way to find what they need.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            Everything your community needs.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Users className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Groups</h3>
                <p className="text-muted-foreground">
                  Create groups for teams or projects. Control membership and
                  keep the right people connected.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Pages</h3>
                <p className="text-muted-foreground">
                  Write, organize, and link knowledge as pages. Nest them, label
                  them, attach to groups.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Up and running in minutes.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-muted-foreground/40">1</p>
              <h3 className="font-semibold text-lg">Create your group</h3>
              <p className="text-sm text-muted-foreground">
                Set up a group, invite members, assign roles.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-muted-foreground/40">2</p>
              <h3 className="font-semibold text-lg">Publish pages</h3>
              <p className="text-sm text-muted-foreground">
                Write pages, organize with labels, link to groups.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-muted-foreground/40">3</p>
              <h3 className="font-semibold text-lg">Discover &amp; collaborate</h3>
              <p className="text-sm text-muted-foreground">
                Browse, find what your team built, build on it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public pages showcase */}
      {publicPages.length > 0 && (
        <section className="bg-muted/40 py-20 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Explore
                </p>
                <h2 className="text-2xl font-bold">See what&apos;s being built</h2>
                <p className="text-muted-foreground">
                  Browse pages shared by teams and communities on GM1.
                </p>
              </div>
              <Link
                href="/pages"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors shrink-0"
              >
                View all pages <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {publicPages.map((page) => (
                <PageCard key={page.id} page={page} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Your team&apos;s knowledge, finally organized.
          </h2>
          <p className="text-lg text-muted-foreground">Free to use, easy to grow.</p>
          <Button size="lg" asChild>
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
