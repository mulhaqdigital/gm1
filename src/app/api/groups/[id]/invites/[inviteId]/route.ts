import { db } from "@/db";
import { groupInvites } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ok, err } from "@/lib/api";
import { requireAuth, isGroupAdmin, isSiteAdmin } from "@/lib/permissions";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; inviteId: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: groupId, inviteId } = await params;

    if (!await isGroupAdmin(userId, groupId) && !await isSiteAdmin(userId)) {
      return err("Forbidden", 403);
    }

    const [deleted] = await db
      .delete(groupInvites)
      .where(and(eq(groupInvites.id, inviteId), eq(groupInvites.groupId, groupId)))
      .returning({ id: groupInvites.id });

    if (!deleted) return err("Invite not found", 404);
    return ok({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    return err("Failed to cancel invite", 500);
  }
}
