import { db } from "@/db";
import { groups } from "@/db/schema";
import { ilike, or, desc } from "drizzle-orm";
import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getGroups(q?: string) {
  return db.query.groups.findMany({
    orderBy: desc(groups.createdAt),
    limit: 50,
    ...(q && {
      where: or(ilike(groups.name, `%${q}%`), ilike(groups.description, `%${q}%`)),
    }),
    with: { memberships: { columns: { userId: true } } },
  });
}

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const groupList = await getGroups(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm mt-1">Discover and join groups</p>
        </div>
        <Button asChild>
          <Link href="/groups/new">
            <Plus className="h-4 w-4 mr-1" />
            New Group
          </Link>
        </Button>
      </div>

      {groupList.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          No groups found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupList.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
