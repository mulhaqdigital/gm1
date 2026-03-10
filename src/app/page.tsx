import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageCard } from "@/components/pages/PageCard";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";
import {
  ArrowRight,
  Users,
  FileText,
  Check,
  MessageSquare,
  Inbox,
  FolderOpen,
  Shield,
  LogIn,
  UserCheck,
} from "lucide-react";

async function getPublicPages() {
  return db.query.pages.findMany({
    where: isNull(pages.parentPageId),
    orderBy: desc(pages.createdAt),
    limit: 8,
    with: { label: true },
  });
}

export default async function Home() {
  const publicPages = await getPublicPages();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28 px-4 text-center">
        {/* Subtle gradient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--muted)) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-3xl mx-auto space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Now in beta · Free to join
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Organize your team.<br />
            Share what matters.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            GM1 brings your groups, knowledge, and community together — so teams
            spend less time searching and more time doing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button size="lg" className="w-full sm:w-auto px-8" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/?showLogin=1">Sign in</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required
          </p>
        </div>
      </section>

      {/* Problem hook — 3 pain points */}
      <section className="border-y bg-muted/40 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10">
            Sound familiar?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Lost in chats",
                body: "Important decisions get buried in Slack threads and forgotten within days.",
              },
              {
                icon: Inbox,
                title: "Scattered in inboxes",
                body: "Critical docs live in personal drives and emails nobody else can find.",
              },
              {
                icon: FolderOpen,
                title: "No shared home",
                body: "Teams lack a single place that keeps everyone aligned and up to date.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div className="h-10 w-10 rounded-lg border bg-background flex items-center justify-center shadow-sm">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 lg:py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-14 sm:space-y-20 lg:space-y-24">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your community needs.
            </h2>
          </div>

          {/* Feature 1: Groups — text left, mockup right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground border bg-muted/40 px-3 py-1 rounded-full">
                <Users className="h-3.5 w-3.5" />
                Groups
              </div>
              <h3 className="text-3xl font-bold tracking-tight leading-snug">
                One home for every team.
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Create a group for any team or project. Invite members, assign
                roles, and keep everything connected in one place.
              </p>
              <ul className="space-y-3">
                {[
                  "Public or private groups",
                  "Member roles and permissions",
                  "Linked pages per group",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-foreground" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Groups UI mockup */}
            <div className="rounded-2xl border bg-card shadow-lg overflow-hidden ring-1 ring-border/50">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/30">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">gm1.app/groups/design-team</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-base">Design Team</p>
                    <p className="text-xs text-muted-foreground mt-1">Product · 4 members</p>
                  </div>
                  <span className="text-xs border px-2.5 py-0.5 rounded-full text-muted-foreground bg-muted/40">
                    Public
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Members</p>
                  {[
                    { name: "Alex Kim", role: "Admin", initials: "AK", color: "#6366f1" },
                    { name: "Jordan Lee", role: "Member", initials: "JL", color: "#0ea5e9" },
                    { name: "Sam Park", role: "Member", initials: "SP", color: "#10b981" },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center gap-3 py-1">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: m.color }}
                      >
                        {m.initials}
                      </div>
                      <span className="text-sm flex-1">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.role}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Pages</p>
                  {["Getting Started", "Design System", "Q2 Roadmap"].map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Pages — mockup left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Pages UI mockup */}
            <div className="rounded-2xl border bg-card shadow-lg overflow-hidden ring-1 ring-border/50 order-2 lg:order-1">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/30">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">gm1.app/pages/getting-started</span>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-xs text-muted-foreground">
                  Design Team <span className="mx-1">/</span> Getting Started
                </p>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Getting Started</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs border px-2.5 py-0.5 rounded-full text-muted-foreground bg-muted/40">guide</span>
                    <span className="text-xs border px-2.5 py-0.5 rounded-full text-muted-foreground bg-muted/40">onboarding</span>
                  </div>
                </div>
                <div className="space-y-2 py-1">
                  <div className="h-2.5 bg-muted rounded-full w-full" />
                  <div className="h-2.5 bg-muted rounded-full w-5/6" />
                  <div className="h-2.5 bg-muted rounded-full w-4/6" />
                  <div className="h-2.5 bg-muted rounded-full w-full" />
                  <div className="h-2.5 bg-muted rounded-full w-3/6" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Sub-pages</p>
                  {[
                    "Step 1: Create a group",
                    "Step 2: Invite your team",
                    "Step 3: Write your first page",
                  ].map((sp) => (
                    <div key={sp} className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg bg-muted/50 text-muted-foreground">
                      <FileText className="h-3 w-3 shrink-0" />
                      {sp}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground border bg-muted/40 px-3 py-1 rounded-full">
                <FileText className="h-3.5 w-3.5" />
                Pages
              </div>
              <h3 className="text-3xl font-bold tracking-tight leading-snug">
                Knowledge that actually stays organized.
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Write pages, nest them into hierarchies, attach labels, and link
                them to groups. Your docs grow with your team — without falling apart.
              </p>
              <ul className="space-y-3">
                {[
                  "Nested sub-pages",
                  "Labels for filtering",
                  "Attach pages to groups",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-foreground" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/40 py-14 sm:py-20 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Up and running in minutes.
            </h2>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {/* Connector line (desktop only) */}
            <div className="hidden sm:block absolute top-6 left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-px bg-border" />

            {[
              {
                n: "1",
                icon: Users,
                title: "Create your group",
                body: "Set up a group, invite members, and assign roles.",
              },
              {
                n: "2",
                icon: FileText,
                title: "Publish pages",
                body: "Write pages, organize with labels, link to groups.",
              },
              {
                n: "3",
                icon: ArrowRight,
                title: "Discover & collaborate",
                body: "Browse, find what your team built, build on it.",
              },
            ].map(({ n, icon: Icon, title, body }) => (
              <div key={n} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 h-12 w-12 rounded-full bg-background border-2 border-border shadow-sm flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles & Access */}
      <section className="py-14 sm:py-20 lg:py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Access & Roles</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              The right access for everyone.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Sign in with email or Google. Every user gets a role — from guest to site admin.
            </p>
          </div>

          {/* Sign-in methods */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[
              {
                icon: LogIn,
                title: "Email & Password",
                body: "Sign up with your email, confirm via link, then access your dashboard.",
              },
              {
                icon: UserCheck,
                title: "Google OAuth",
                body: "One click with your Google account — no password required.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-4 border rounded-xl bg-card px-6 py-5 sm:max-w-xs w-full shadow-sm">
                <div className="h-9 w-9 rounded-lg border bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "Guest",
                accentBg: "bg-border",
                badgeCls: "bg-muted text-muted-foreground",
                checkCls: "text-muted-foreground",
                how: "Not signed in",
                perms: ["Browse public pages", "View public groups", "Read shared content"],
              },
              {
                role: "Member",
                accentBg: "bg-blue-500",
                badgeCls: "bg-blue-500/10 text-blue-600",
                checkCls: "text-blue-500",
                how: "Sign up & join a group",
                perms: ["Access your dashboard", "View group content", "Create & edit pages"],
              },
              {
                role: "Group Admin",
                accentBg: "bg-violet-500",
                badgeCls: "bg-violet-500/10 text-violet-600",
                checkCls: "text-violet-500",
                how: "Assigned by a group admin",
                perms: ["Manage group members", "Edit group settings", "Rearrange page hierarchy"],
              },
              {
                role: "Site Admin",
                accentBg: "bg-amber-500",
                badgeCls: "bg-amber-500/10 text-amber-600",
                checkCls: "text-amber-500",
                how: "Set in the database",
                perms: ["Full platform access", "Access /admin routes", "Manage all groups & pages"],
              },
            ].map(({ role, accentBg, badgeCls, checkCls, how, perms }) => (
              <div key={role} className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
                <div className={`h-1 ${accentBg}`} />
                <div className="p-5 flex flex-col gap-5 flex-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${badgeCls}`}>
                    <Shield className="h-3 w-3" />
                    {role}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">How you get it</p>
                    <p className="text-sm text-muted-foreground">{how}</p>
                  </div>
                  <ul className="space-y-2">
                    {perms.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${checkCls}`} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Protected routes note */}
          <div className="rounded-xl border bg-muted/30 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-10 w-10 rounded-lg border bg-background flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">Protected routes</p>
              <p className="text-sm text-muted-foreground">
                Unauthenticated users who visit <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/dashboard</code>,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/groups/new</code>,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/pages/new</code>, or{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/admin</code>{" "}
                are automatically redirected to the login page and returned to their destination after signing in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public pages showcase */}
      {publicPages.length > 0 && (
        <section className="py-14 sm:py-20 lg:py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Explore
                </p>
                <h2 className="text-3xl font-bold tracking-tight">See what&apos;s being built</h2>
                <p className="text-muted-foreground">
                  Browse pages shared by teams and communities on GM1.
                </p>
              </div>
              <Link
                href="/pages"
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors shrink-0"
              >
                View all pages <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {publicPages.map((page) => (
                <PageCard key={page.id} page={page} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA — inverted */}
      <section className="bg-foreground text-background py-14 sm:py-20 lg:py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-snug">
            Your team&apos;s knowledge,<br />finally organized.
          </h2>
          <p className="text-lg opacity-70">Free to use, easy to grow.</p>
          <Button
            size="lg"
            variant="secondary"
            className="px-10 text-foreground"
            asChild
          >
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
          <p className="text-xs opacity-50">No credit card required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
