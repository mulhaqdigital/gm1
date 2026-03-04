import { db } from "@/db";
import { groupMemberships } from "@/db/schema";
import { ok, err } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const userId = await requireAuth();

    await db
      .insert(groupMemberships)
      .values({ userId, groupId, role: "member" })
      .onConflictDoNothing();

    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}
