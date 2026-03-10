import { db } from "@/db";
import { groups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth, isGroupAdmin, isSiteAdmin } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
    with: {
      creator: { columns: { id: true, name: true, pictureUrl: true } },
      memberships: {
        with: { user: { columns: { id: true, name: true, pictureUrl: true } } },
      },
      pageGroups: {
        with: { page: { columns: { id: true, title: true, pictureUrl: true, parentPageId: true } } },
      },
    },
  });
  if (!group) return err("Group not found", 404);
  return ok(group);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireAuth();
    const [admin, siteAdmin] = await Promise.all([isGroupAdmin(userId, id), isSiteAdmin(userId)]);
    if (!admin && !siteAdmin) return err("Forbidden", 403);

    const body = await parseBody<{ name?: string; description?: string; logoUrl?: string }>(req);

    const [updated] = await db
      .update(groups)
      .set({
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      })
      .where(eq(groups.id, id))
      .returning();

    return ok(updated);
  } catch (res) {
    return res as Response;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireAuth();
    const [admin, siteAdmin] = await Promise.all([isGroupAdmin(userId, id), isSiteAdmin(userId)]);
    if (!admin && !siteAdmin) return err("Forbidden", 403);

    await db.delete(groups).where(eq(groups.id, id));
    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}
