import { db } from "@/db";
import { groupInvites, groups, profiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ok, err } from "@/lib/api";
import { requireAuth, isGroupAdmin, isSiteAdmin } from "@/lib/permissions";
import { sendGroupInviteEmail } from "@/lib/email";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; inviteId: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: groupId, inviteId } = await params;

    const [admin, siteAdmin] = await Promise.all([isGroupAdmin(userId, groupId), isSiteAdmin(userId)]);
    if (!admin && !siteAdmin) return err("Forbidden", 403);

    const invite = await db.query.groupInvites.findFirst({
      where: and(eq(groupInvites.id, inviteId), eq(groupInvites.groupId, groupId), eq(groupInvites.status, "pending")),
    });

    if (!invite) return err("Invite not found", 404);

    const [group, inviter] = await Promise.all([
      db.query.groups.findFirst({ where: eq(groups.id, groupId), columns: { name: true } }),
      db.query.profiles.findFirst({ where: eq(profiles.id, userId), columns: { name: true } }),
    ]);

    await sendGroupInviteEmail({
      toEmail: invite.email,
      inviterName: inviter?.name ?? "Someone",
      groupName: group?.name ?? "a group",
      token: invite.token,
      expiresAt: invite.expiresAt,
    });

    return ok({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    console.error("[POST /api/groups/[id]/invites/[inviteId]/resend]", res);
    return err("Failed to resend invite", 500);
  }
}
