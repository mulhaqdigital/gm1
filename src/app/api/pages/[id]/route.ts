import { db } from "@/db";
import { pages, pageGroups, groupMemberships } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth, isSiteAdmin } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await db.query.pages.findFirst({
    where: eq(pages.id, id),
    with: {
      parent: { columns: { id: true, title: true } },
      children: {
        orderBy: [pages.sortOrder],
        columns: { id: true, title: true, pictureUrl: true, sortOrder: true },
      },
      creator: { columns: { id: true, name: true, pictureUrl: true } },
      pageGroups: {
        with: {
          group: {
            with: {
              memberships: {
                with: { user: { columns: { id: true, name: true, pictureUrl: true } } },
                limit: 12, // small avatar cluster, not full member list
              },
            },
          },
        },
      },
    },
  });

  if (!page) return err("Page not found", 404);
  return ok(page);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireAuth();

    const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
    if (!page) return err("Page not found", 404);

    const siteAdmin = await isSiteAdmin(userId);
    const isOwner = page.createdBy === userId;
    if (!isOwner && !siteAdmin) return err("Forbidden", 403);

    const body = await parseBody<{
      title?: string;
      description?: string;
      pictureUrl?: string;
      groupIds?: string[];
    }>(req);

    const [updated] = await db
      .update(pages)
      .set({
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.pictureUrl !== undefined && { pictureUrl: body.pictureUrl }),
      })
      .where(eq(pages.id, id))
      .returning();

    // Update group links if provided
    if (body.groupIds !== undefined) {
      await db.delete(pageGroups).where(eq(pageGroups.pageId, id));
      if (body.groupIds.length > 0) {
        await db.insert(pageGroups).values(
          body.groupIds.map((gid) => ({ pageId: id, groupId: gid }))
        );
      }
    }

    return ok(updated);
  } catch (res) {
    return res as Response;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireAuth();

    const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
    if (!page) return err("Page not found", 404);

    const siteAdmin = await isSiteAdmin(userId);
    const isOwner = page.createdBy === userId;
    if (!isOwner && !siteAdmin) return err("Forbidden", 403);

    await db.delete(pages).where(eq(pages.id, id));
    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}
