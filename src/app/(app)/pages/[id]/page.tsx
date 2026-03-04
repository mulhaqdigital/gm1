import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MemberAvatars } from "@/components/groups/MemberAvatars";
import { PageCard } from "@/components/pages/PageCard";
import { PageCover } from "@/components/pages/PageCover";
import { AddSubPageButton } from "@/components/pages/AddSubPageButton";
import { ManageGroupsButton } from "@/components/pages/ManageGroupsButton";
import { EditLabelButton } from "@/components/pages/EditLabelButton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-8">

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

      {/* Profile card — image left, meta right */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-start">

        {/* Square thumbnail */}
        <div className="shrink-0 w-full sm:w-36 h-48 sm:h-36 rounded-xl overflow-hidden border">
          {page.pictureUrl ? (
            <Image src={page.pictureUrl} alt={page.title} width={144} height={144} className="object-cover w-full h-full" />
          ) : (
            <PageCover title={page.title} className="w-full h-full flex items-center justify-center" />
          )}
        </div>

        {/* Meta */}
        <div className="flex-1 space-y-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold leading-tight">{page.title}</h1>
            {page.description && (
              <p className="text-muted-foreground mt-1">{page.description}</p>
            )}
          </div>

          {/* Label */}
          <EditLabelButton pageId={page.id} label={page.label ?? null} />

          {/* Linked groups */}
          <div className="flex flex-wrap items-center gap-2">
            {page.pageGroups?.map((pg) => (
              <Link key={pg.group.id} href={`/groups/${pg.group.id}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                  {pg.group.name}
                </Badge>
              </Link>
            ))}
            <ManageGroupsButton
              pageId={page.id}
              linkedGroups={page.pageGroups?.map((pg) => ({ id: pg.group.id, name: pg.group.name })) ?? []}
            />
          </div>

          {/* Members */}
          {allMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <MemberAvatars members={allMembers} max={10} />
              <span className="text-sm text-muted-foreground">{allMembers.length} members</span>
            </div>
          )}

          {/* Creator */}
          {page.creator && (
            <p className="text-xs text-muted-foreground">
              Created by <span className="font-medium text-foreground">{page.creator.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Sub-pages grid */}
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {page.children.map((child) => (
              <PageCard key={child.id} page={child} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No sub-pages yet.</p>
        )}
      </div>

    </div>
  );
}
