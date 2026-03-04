import { db } from "@/db";
import { groupMemberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ok } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const userId = await requireAuth();

    await db
      .delete(groupMemberships)
      .where(and(eq(groupMemberships.userId, userId), eq(groupMemberships.groupId, groupId)));

    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}
