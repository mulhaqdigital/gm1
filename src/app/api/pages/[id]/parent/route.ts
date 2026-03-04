import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

// Rearrange page in hierarchy — any authenticated user
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAuth();

    const body = await parseBody<{ parentPageId: string | null; sortOrder?: number }>(req);

    // Guard against circular references
    if (body.parentPageId === id) return err("A page cannot be its own parent", 400);

    const [updated] = await db
      .update(pages)
      .set({
        parentPageId: body.parentPageId,
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      })
      .where(eq(pages.id, id))
      .returning();

    return ok(updated);
  } catch (res) {
    return res as Response;
  }
}
