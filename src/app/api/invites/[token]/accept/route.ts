import { db } from "@/db";
import { groupInvites, groupMemberships, groups } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ok, err } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const userId = await requireAuth();
    const { token } = await params;

    const invite = await db.query.groupInvites.findFirst({
      where: and(eq(groupInvites.token, token), eq(groupInvites.status, "pending")),
    });

    if (!invite) return err("Invite not found or already used", 404);
    if (new Date() > invite.expiresAt) return err("Invite has expired", 410);

    // Insert membership if not already a member
    await db
      .insert(groupMemberships)
      .values({ userId, groupId: invite.groupId, role: "member" })
      .onConflictDoNothing();

    // Mark invite accepted
    await db
      .update(groupInvites)
      .set({ status: "accepted" })
      .where(eq(groupInvites.id, invite.id));

    const group = await db.query.groups.findFirst({
      where: eq(groups.id, invite.groupId),
      columns: { id: true, name: true },
    });

    return ok({ groupId: invite.groupId, groupName: group?.name ?? "" });
  } catch (res) {
    if (res instanceof Response) return res;
    console.error("[POST /api/invites/[token]/accept]", res);
    return err("Failed to accept invite", 500);
  }
}
