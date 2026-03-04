import { db } from "@/db";
import { groupMemberships, pageGroups, pages } from "@/db/schema";
import { eq, inArray, isNull } from "drizzle-orm";
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

    // Page grid — root pages + pages linked to my groups
    const myGroupIds = myGroups.map((g) => g.id);

    let linkedPageIds: string[] = [];
    if (myGroupIds.length > 0) {
      const linkedPageGroups = await db.query.pageGroups.findMany({
        where: inArray(pageGroups.groupId, myGroupIds),
        columns: { pageId: true },
      });
      linkedPageIds = [...new Set(linkedPageGroups.map((pg) => pg.pageId))];
    }

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
