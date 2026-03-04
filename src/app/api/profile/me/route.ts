import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  try {
    const userId = await requireAuth();
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
    if (!profile) return err("Profile not found", 404);
    return ok(profile);
  } catch (res) {
    return res as Response;
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await parseBody<{ name?: string; phone?: string; pictureUrl?: string }>(req);

    const [updated] = await db
      .update(profiles)
      .set({
        ...(body.name && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.pictureUrl !== undefined && { pictureUrl: body.pictureUrl }),
      })
      .where(eq(profiles.id, userId))
      .returning();

    return ok(updated);
  } catch (res) {
    return res as Response;
  }
}
