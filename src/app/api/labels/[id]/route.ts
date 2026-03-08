import { db } from "@/db";
import { labels, pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const { id } = await params;
    const body = await parseBody<{ name: string }>(req);
    if (!body.name?.trim()) return err("Name is required", 400);
    const newName = body.name.trim();

    const conflict = await db.query.labels.findFirst({ where: eq(labels.name, newName) });
    if (conflict && conflict.id !== id) return err("A label with that name already exists", 409);

    const [updated] = await db
      .update(labels)
      .set({ name: newName })
      .where(eq(labels.id, id))
      .returning({ id: labels.id, name: labels.name });

    if (!updated) return err("Label not found", 404);
    return ok(updated);
  } catch (res) {
    if (res instanceof Response) return res;
    return err("Failed to update label", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const { id } = await params;

    // Unlink pages from this label before deleting
    await db.update(pages).set({ labelId: null }).where(eq(pages.labelId, id));
    await db.delete(labels).where(eq(labels.id, id));

    return ok({ success: true });
  } catch (res) {
    if (res instanceof Response) return res;
    return err("Failed to delete label", 500);
  }
}
