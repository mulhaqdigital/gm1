import { db } from "@/db";
import { groupMemberships, pages } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { ok } from "@/lib/api";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  try {
    const userId = await requireAuth();

    // My groups
    const myMemberships = await db.query.groupMemberships.findMany({
      where: eq(groupMemberships.userId, userId),
      with: {
        group: {
          with: {
            memberships: { columns: { userId: true } },
          },
        },
      },
    });

    const myGroups = myMemberships.map((m) => ({
      ...m.group,
      myRole: m.role,
      memberCount: m.group.memberships.length,
    }));

    // Page grid — root pages with linked groups
    const pageGrid = await db.query.pages.findMany({
      where: isNull(pages.parentPageId),
      with: {
        pageGroups: {
          with: { group: { columns: { id: true, name: true, logoUrl: true } } },
        },
      },
      limit: 50,
    });

    return ok({ myGroups, pageGrid });
  } catch (res) {
    return res as Response;
  }
}
