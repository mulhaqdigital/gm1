import { db } from "@/db";
import { pages, labels } from "@/db/schema";
import { isNull, desc, eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

async function resolveLabel(labelId?: string, labelName?: string): Promise<string> {
  if (labelId) return labelId;
  const name = labelName!.trim();
  // Upsert avoids a TOCTOU race between concurrent requests creating the same label
  const [row] = await db
    .insert(labels)
    .values({ name })
    .onConflictDoUpdate({ target: labels.name, set: { name } })
    .returning({ id: labels.id });
  return row.id;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // ?all=true — flat list of all pages (used for reparenting pickers)
  if (searchParams.get("all") === "true") {
    const allPages = await db.query.pages.findMany({
      columns: { id: true, title: true, parentPageId: true },
      orderBy: [desc(pages.sortOrder), desc(pages.createdAt)],
    });
    return ok(allPages);
  }

  // Default — root-level pages with children/groups
  const rootPages = await db.query.pages.findMany({
    where: isNull(pages.parentPageId),
    orderBy: [desc(pages.sortOrder), desc(pages.createdAt)],
    with: {
      children: { columns: { id: true, title: true, pictureUrl: true } },
      label: { columns: { id: true, name: true } },
      pageGroups: {
        with: { group: { columns: { id: true, name: true, logoUrl: true } } },
      },
    },
  });
  return ok(rootPages);
}

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await parseBody<{
      title: string;
      description?: string;
      pictureUrl?: string;
      parentPageId?: string;
      labelId?: string;
      labelName?: string;
    }>(req);

    if (!body.title?.trim()) return err("Title is required", 400);

    const resolvedLabelId =
      body.labelId || body.labelName
        ? await resolveLabel(body.labelId, body.labelName)
        : undefined;

    const [page] = await db
      .insert(pages)
      .values({
        title: body.title,
        description: body.description,
        pictureUrl: body.pictureUrl,
        parentPageId: body.parentPageId ?? null,
        labelId: resolvedLabelId ?? null,
        createdBy: userId,
      })
      .returning();

    return ok(page, 201);
  } catch (res) {
    return res as Response;
  }
}
