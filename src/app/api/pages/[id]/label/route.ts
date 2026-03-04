import { db } from "@/db";
import { pages, labels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAuth();

    const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
    if (!page) return err("Page not found", 404);

    const body = await parseBody<{ labelId?: string; labelName?: string }>(req);

    if (!body.labelId && !body.labelName?.trim()) return err("labelId or labelName is required", 400);

    let resolvedLabelId: string;
    if (body.labelId) {
      resolvedLabelId = body.labelId;
    } else {
      const name = body.labelName!.trim();
      const existing = await db.query.labels.findFirst({ where: eq(labels.name, name) });
      if (existing) {
        resolvedLabelId = existing.id;
      } else {
        const [created] = await db.insert(labels).values({ name }).returning();
        resolvedLabelId = created.id;
      }
    }

    await db.update(pages).set({ labelId: resolvedLabelId }).where(eq(pages.id, id));

    return ok({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[PATCH /api/pages/:id/label]", e);
    return err("Internal server error", 500);
  }
}
