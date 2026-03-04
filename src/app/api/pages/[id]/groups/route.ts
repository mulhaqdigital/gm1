import { db } from "@/db";
import { pageGroups } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

// Update group links for a page — any authenticated user
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAuth();

    const body = await parseBody<{ groupIds: string[] }>(req);
    if (!Array.isArray(body.groupIds)) return err("groupIds must be an array", 400);

    await db.delete(pageGroups).where(eq(pageGroups.pageId, id));
    if (body.groupIds.length > 0) {
      await db.insert(pageGroups).values(
        body.groupIds.map((gid) => ({ pageId: id, groupId: gid }))
      );
    }

    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}

// Add a single group link — any authenticated user
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAuth();

    const body = await parseBody<{ groupId: string }>(req);
    if (!body.groupId) return err("groupId is required", 400);

    // Insert, ignore if already linked
    await db.insert(pageGroups).values({ pageId: id, groupId: body.groupId }).onConflictDoNothing();

    return ok({ success: true });
  } catch (res) {
    return res as Response;
  }
}
