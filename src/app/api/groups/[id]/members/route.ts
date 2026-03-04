import { db } from "@/db";
import { groupMemberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth, isGroupAdmin, isSiteAdmin } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params;

  const members = await db.query.groupMemberships.findMany({
    where: eq(groupMemberships.groupId, groupId),
    with: { user: { columns: { id: true, name: true, pictureUrl: true } } },
  });

  return ok(members);
}

// Update a member's role
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const userId = await requireAuth();
    const [admin, siteAdmin] = await Promise.all([isGroupAdmin(userId, groupId), isSiteAdmin(userId)]);
    if (!admin && !siteAdmin) return err("Forbidden", 403);

    const body = await parseBody<{ userId: string; role: "admin" | "member" }>(req);

    const [updated] = await db
      .update(groupMemberships)
      .set({ role: body.role })
      .where(and(eq(groupMemberships.groupId, groupId), eq(groupMemberships.userId, body.userId)))
      .returning();

    return ok(updated);
  } catch (res) {
    return res as Response;
  }
}

// Remove a member
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const userId = await requireAuth();
    const [admin, siteAdmin] = await Promise.all([isGroupAdmin(userId, groupId), isSiteAdmin(userId)]);
    if (!admin && !siteAdmin) return err("Forbidden", 403);

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    if (!targetUserId) return err("userId required", 400);

    await db
      .delete(groupMemberships)
      .where(and(eq(groupMemberships.groupId, groupId), eq(groupMemberships.userId, targetUserId)));

    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}
