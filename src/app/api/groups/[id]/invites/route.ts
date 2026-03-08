import { db } from "@/db";
import { groupInvites, groups, profiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth, isGroupAdmin, isSiteAdmin } from "@/lib/permissions";
import { sendGroupInviteEmail } from "@/lib/email";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: groupId } = await params;

    if (!await isGroupAdmin(userId, groupId) && !await isSiteAdmin(userId)) {
      return err("Forbidden", 403);
    }

    const invites = await db.query.groupInvites.findMany({
      where: and(eq(groupInvites.groupId, groupId), eq(groupInvites.status, "pending")),
      columns: { id: true, email: true, status: true, expiresAt: true, createdAt: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    return ok(invites);
  } catch (res) {
    if (res instanceof Response) return res;
    return err("Failed to fetch invites", 500);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: groupId } = await params;

    if (!await isGroupAdmin(userId, groupId) && !await isSiteAdmin(userId)) {
      return err("Forbidden", 403);
    }

    const body = await parseBody<{ email: string }>(req);
    const email = body.email?.trim().toLowerCase();
    if (!email) return err("Email is required", 400);

    // Check for existing pending invite
    const existing = await db.query.groupInvites.findFirst({
      where: and(
        eq(groupInvites.groupId, groupId),
        eq(groupInvites.email, email),
        eq(groupInvites.status, "pending")
      ),
    });
    if (existing) return err("An invite for this email is already pending", 409);

    // Fetch group name and inviter name for the email
    const [group, inviter] = await Promise.all([
      db.query.groups.findFirst({ where: eq(groups.id, groupId), columns: { name: true } }),
      db.query.profiles.findFirst({ where: eq(profiles.id, userId), columns: { name: true } }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invite] = await db
      .insert(groupInvites)
      .values({ groupId, invitedBy: userId, email, expiresAt })
      .returning({
        id: groupInvites.id,
        email: groupInvites.email,
        token: groupInvites.token,
        status: groupInvites.status,
        expiresAt: groupInvites.expiresAt,
        createdAt: groupInvites.createdAt,
      });

    // Send email (non-blocking — don't fail the request if email fails)
    sendGroupInviteEmail({
      toEmail: invite.email,
      inviterName: inviter?.name ?? "Someone",
      groupName: group?.name ?? "a group",
      token: invite.token,
      expiresAt: invite.expiresAt,
    }).catch((e) => console.error("[sendGroupInviteEmail]", e));

    // Don't expose token in the response
    const { token: _token, ...safeInvite } = invite;
    return ok(safeInvite, 201);
  } catch (res) {
    if (res instanceof Response) return res;
    console.error("[POST /api/groups/[id]/invites]", res);
    return err("Failed to create invite", 500);
  }
}
