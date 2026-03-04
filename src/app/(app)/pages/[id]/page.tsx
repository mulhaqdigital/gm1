import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberAvatars } from "@/components/groups/MemberAvatars";
import { PageCard } from "@/components/pages/PageCard";
import { PageCover } from "@/components/pages/PageCover";
import { AddSubPageButton } from "@/components/pages/AddSubPageButton";
import { ManageGroupsButton } from "@/components/pages/ManageGroupsButton";
import { EditLabelButton } from "@/components/pages/EditLabelButton";
import { ChevronRight, Users } from "lucide-react";
import { getAvatarColor } from "@/lib/avatar-color";

async function getPage(id: string) {
  return db.query.pages.findFirst({
    where: eq(pages.id, id),
    with: {
      parent: { columns: { id: true, title: true } },
      children: {
        orderBy: [pages.sortOrder],
        with: {
          pageGroups: {
            with: {
              group: {
                with: {
                  memberships: {
                    with: { user: { columns: { id: true, name: true, pictureUrl: true } } },
                    limit: 8,
                  },
                },
              },
            },
          },
        },
      },
      creator: { columns: { id: true, name: true, pictureUrl: true } },
      label: { columns: { id: true, name: true } },
      pageGroups: {
        with: {
          group: {
            with: {
              memberships: {
                with: { user: { columns: { id: true, name: true, pictureUrl: true } } },
                limit: 12,
              },
            },
          },
        },
      },
    },
  });
}

export default async function PageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPage(id);
  if (!page) notFound();

  const allMembers: { id: string; name: string; pictureUrl?: string | null }[] = [];
  const seen = new Set<string>();
  page.pageGroups?.forEach((pg) => {
    pg.group?.memberships?.forEach((m) => {
      if (!seen.has(m.user.id)) {
        seen.add(m.user.id);
        allMembers.push(m.user);
      }
    });
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/pages" className="hover:text-foreground transition-colors">Pages</Link>
        {page.parent && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/pages/${page.parent.id}`} className="hover:text-foreground transition-colors">
              {page.parent.title}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{page.title}</span>
      </nav>

      {/* Sidebar + Content split */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-64 shrink-0 space-y-5">

          {/* Cover image */}
          <div className="w-full aspect-square rounded-xl overflow-hidden border">
            {page.pictureUrl ? (
              <Image src={page.pictureUrl} alt={page.title} width={256} height={256} className="object-cover w-full h-full" />
            ) : (
              <PageCover title={page.title} className="w-full h-full flex items-center justify-center" />
            )}
          </div>

          {/* Groups */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">Groups</p>
            {page.pageGroups?.map((pg) => {
              const memberCount = pg.group.memberships?.length ?? 0;
              return (
                <Link key={pg.group.id} href={`/groups/${pg.group.id}`}>
                  <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <Avatar className="h-9 w-9 rounded-md shrink-0">
                      <AvatarImage src={pg.group.logoUrl ?? undefined} />
                      <AvatarFallback className="rounded-md text-sm font-semibold text-white" style={{ background: getAvatarColor(pg.group.name) }}>
                        {pg.group.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{pg.group.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            <div className="px-2 pt-1">
              <ManageGroupsButton
                pageId={page.id}
                linkedGroups={page.pageGroups?.map((pg) => ({ id: pg.group.id, name: pg.group.name })) ?? []}
              />
            </div>
          </div>

          {/* All members */}
          {allMembers.length > 0 && (
            <div className="space-y-1 px-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Members</p>
              <div className="flex items-center gap-2">
                <MemberAvatars members={allMembers} max={8} />
                <span className="text-xs text-muted-foreground">{allMembers.length}</span>
              </div>
            </div>
          )}

          {/* Creator */}
          {page.creator && (
            <p className="text-xs text-muted-foreground px-2">
              Created by <span className="font-medium text-foreground">{page.creator.name}</span>
            </p>
          )}
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Title + label + description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight">{page.title}</h1>
            <EditLabelButton pageId={page.id} label={page.label ?? null} />
            {page.description && (
              <p className="text-muted-foreground">{page.description}</p>
            )}
          </div>

          {/* Sub-pages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sub-pages
              </h2>
              <AddSubPageButton
                parentPageId={page.id}
                existingChildIds={page.children?.map((c) => c.id) ?? []}
              />
            </div>
            {page.children?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {page.children.map((child) => (
                  <PageCard key={child.id} page={child} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sub-pages yet.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
