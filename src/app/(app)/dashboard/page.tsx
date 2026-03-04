import { db } from "@/db";
import { groupMemberships, pageGroups, pages } from "@/db/schema";
import { eq, inArray, isNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { GroupCard } from "@/components/groups/GroupCard";
import { PageCard } from "@/components/pages/PageCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { myGroups: [], pageGrid: [] };

  const myMemberships = await db.query.groupMemberships.findMany({
    where: eq(groupMemberships.userId, user.id),
    with: {
      group: { with: { memberships: { columns: { userId: true } } } },
    },
  });

  const myGroups = myMemberships.map((m) => ({
    ...m.group,
    myRole: m.role,
    memberCount: m.group.memberships.length,
  }));

  const pageGrid = await db.query.pages.findMany({
    where: isNull(pages.parentPageId),
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
    limit: 50,
  });

  return { myGroups, pageGrid };
}

export default async function DashboardPage() {
  const { myGroups, pageGrid } = await getDashboard();

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Groups</h2>
          <Button size="sm" asChild>
            <Link href="/groups/new">
              <Plus className="h-4 w-4 mr-1" />
              New Group
            </Link>
          </Button>
        </div>
        {myGroups.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>You haven&apos;t joined any groups yet.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/groups">Browse groups</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pages</h2>
          <Button size="sm" variant="outline" asChild>
            <Link href="/pages/new">
              <Plus className="h-4 w-4 mr-1" />
              New Page
            </Link>
          </Button>
        </div>
        {pageGrid.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>No pages yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pageGrid.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
