/**
 * Onboarding Seed Script
 * Creates a "Getting Started" group with nested guide pages.
 * Idempotent — skips if the group already exists.
 *
 * Run: npm run db:seed-onboarding
 *
 * After running, copy the printed ONBOARDING_GROUP_ID into .env.local
 * so new users are auto-joined on signup.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema/index";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL!;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL missing in .env.local");
  process.exit(1);
}

const isTransactionPooler = DATABASE_URL.includes(":6543");
const sql = postgres(DATABASE_URL, { prepare: !isTransactionPooler, connect_timeout: 10, max: 3 });
const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const GROUP_NAME = "Getting Started";

const PAGES = [
  {
    title: "Welcome to GM1",
    description:
      "Welcome! This group is your guide to getting the most out of GM1. Work through the pages below in order — each one covers a core feature of the platform. By the end you'll know how to create groups, build pages, invite your team, and share content.",
    sortOrder: 0,
    children: [
      {
        title: "1. What is GM1?",
        description:
          "GM1 is a collaborative knowledge base where your team organizes information into Groups and Pages.\n\nGroups = spaces for a team, project, or topic.\nPages = documents inside those groups.\n\nAnyone can browse public groups and pages. Sign in to create your own content, join groups, and collaborate with others.\n\nYour starting point is the Dashboard (/dashboard). It shows all the groups you belong to and all pages you have access to.",
        sortOrder: 0,
      },
      {
        title: "2. Creating & Joining Groups",
        description:
          "Groups bring people and pages together around a shared topic or team.\n\nTo create a group:\n• Go to your Dashboard\n• Click 'New Group'\n• Enter a name and optional description\n• You are automatically made the group admin\n\nTo join an existing group:\n• Go to /groups to browse all public groups\n• Click any group to open it\n• Click 'Join group'\n\nAs a group admin you can manage members, set roles, link pages, and invite people by email.",
        sortOrder: 1,
      },
      {
        title: "3. Creating Pages & Sub-pages",
        description:
          "Pages are where your content lives. Every page has a title, a description, an optional cover image, and an optional label.\n\nTo create a page:\n• Click 'New Page' on the Dashboard or in the sidebar\n• Fill in the title and description\n• Optionally pick a label (e.g. Guide, Docs, Notes)\n• Save — the page is now visible at /pages\n\nTo link a page to a group:\n• Open the group page\n• Use the 'Link page' option in the group admin panel\n\nTo create sub-pages (nested structure):\n• Open any existing page\n• Click 'Add sub-page'\n• Sub-pages appear in the page tree sidebar inside the group\n\nGroup admins can drag and reorder pages in the tree view.",
        sortOrder: 2,
      },
      {
        title: "4. Inviting Team Members",
        description:
          "Grow your group by inviting colleagues via email.\n\nTo send an invite:\n• Open your group page\n• Click 'Invite member'\n• Enter their email address and submit\n\nThey receive an email with a sign-up or sign-in link. Once accepted, they join the group as a member.\n\nTo manage roles:\n• Open the Members panel on the group page\n• Any member can be promoted to admin\n• Admins can remove members or change roles at any time\n\nRoles summary:\n• Member — can view and create pages within the group\n• Admin — can manage members, edit group details, and rearrange pages",
        sortOrder: 3,
      },
      {
        title: "5. Sharing Content",
        description:
          "Every page has a public shareable link.\n\nTo share a page:\n• Open the page\n• Click the Share button (top right)\n• The URL is copied to your clipboard — send it to anyone\n\nPages are publicly readable by default, so anyone with the link can view the content without signing in.\n\nTo discover content others have shared:\n• Visit /pages to search all pages by title\n• Visit /groups to browse all groups\n• Use the search bar to filter results",
        sortOrder: 4,
      },
      {
        title: "6. Your Dashboard",
        description:
          "The Dashboard (/dashboard) is your home base in GM1.\n\nWhat you'll find there:\n• Your groups — all groups you have joined or created\n• All pages — root-level pages visible to you\n• Quick actions — 'New Group' and 'New Page' buttons\n\nTips:\n• If you have no groups yet, you'll see a prompt to browse or create one\n• Pages you create appear here even before they're linked to a group\n• Use the sidebar (inside a group) to navigate the full page tree\n\nNext step: head to your Dashboard and create your first group!",
        sortOrder: 5,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding onboarding group…\n");

  // Idempotency check
  const existing = await db.query.groups.findFirst({
    where: eq(schema.groups.name, GROUP_NAME),
  });

  if (existing) {
    console.log(`✅ Group "${GROUP_NAME}" already exists (id: ${existing.id})`);
    console.log(`\nAdd this to your .env.local:\n  ONBOARDING_GROUP_ID=${existing.id}\n`);
    await sql.end();
    return;
  }

  // Create group
  const [group] = await db
    .insert(schema.groups)
    .values({
      name: GROUP_NAME,
      description: "New here? This group walks you through everything you need to know about GM1.",
    })
    .returning();

  console.log(`✅ Created group: "${group.name}" (${group.id})`);

  // Upsert "Guide" label
  let label: schema.Label;
  const existingLabel = await db.query.labels.findFirst({
    where: eq(schema.labels.name, "Guide"),
  });
  if (existingLabel) {
    label = existingLabel;
    console.log(`✅ Using existing label "Guide"`);
  } else {
    [label] = await db.insert(schema.labels).values({ name: "Guide" }).returning();
    console.log(`✅ Created label "Guide"`);
  }

  // Create pages
  for (const rootDef of PAGES) {
    const [rootPage] = await db
      .insert(schema.pages)
      .values({
        title: rootDef.title,
        description: rootDef.description,
        sortOrder: rootDef.sortOrder,
        labelId: label.id,
      })
      .returning();

    await db.insert(schema.pageGroups).values({ pageId: rootPage.id, groupId: group.id });
    console.log(`\n  📄 "${rootPage.title}"`);

    for (const childDef of rootDef.children) {
      const [childPage] = await db
        .insert(schema.pages)
        .values({
          title: childDef.title,
          description: childDef.description,
          parentPageId: rootPage.id,
          sortOrder: childDef.sortOrder,
          labelId: label.id,
        })
        .returning();

      await db.insert(schema.pageGroups).values({ pageId: childPage.id, groupId: group.id });
      console.log(`     └─ "${childPage.title}"`);
    }
  }

  console.log(`\n🎉 Done!\n`);
  console.log(`Add this to your .env.local:`);
  console.log(`  ONBOARDING_GROUP_ID=${group.id}\n`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
