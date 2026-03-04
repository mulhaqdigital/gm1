import { db } from "@/db";
import { labels } from "@/db/schema";
import { ilike, eq } from "drizzle-orm";
import { ok, err, parseBody } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const rows = await db.query.labels.findMany({
    where: q ? ilike(labels.name, `%${q}%`) : undefined,
    limit: 20,
    columns: { id: true, name: true },
  });
  return ok(rows);
}

export async function POST(req: Request) {
  const body = await parseBody<{ name: string }>(req);
  if (!body.name?.trim()) return err("Name is required", 400);
  const name = body.name.trim();

  await db.insert(labels).values({ name }).onConflictDoNothing();
  const label = await db.query.labels.findFirst({
    where: eq(labels.name, name),
    columns: { id: true, name: true },
  });
  return ok(label, 201);
}
