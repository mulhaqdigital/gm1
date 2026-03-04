import { db } from "@/db";
import { groups, groupMemberships } from "@/db/schema";
import { ilike, or, desc } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q");

  const rows = await db.query.groups.findMany({
    orderBy: desc(groups.createdAt),
    limit: 50,
    ...(search && {
      where: or(
        ilike(groups.name, `%${search}%`),
        ilike(groups.description, `%${search}%`)
      ),
    }),
    with: {
      memberships: { columns: { userId: true } },
    },
  });

  return ok(rows);
}

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await parseBody<{ name: string; description?: string; logoUrl?: string }>(req);

    if (!body.name?.trim()) return err("Name is required", 400);

    const [group] = await db
      .insert(groups)
      .values({ name: body.name, description: body.description, logoUrl: body.logoUrl, createdBy: userId })
      .returning();

    // Creator becomes admin automatically
    await db.insert(groupMemberships).values({ userId, groupId: group.id, role: "admin" });

    return ok(group, 201);
  } catch (res) {
    return res as Response;
  }
}
