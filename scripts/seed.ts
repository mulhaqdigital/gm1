/**
 * Seed the database with sample data.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (Settings → API → service_role)
 *
 * Run: npx tsx scripts/seed.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema/index";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error("❌ Missing env vars. Ensure .env.local has:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  console.error("   DATABASE_URL");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const isTransactionPooler = DATABASE_URL.includes(":6543");
const sql = postgres(DATABASE_URL, { prepare: !isTransactionPooler, connect_timeout: 10, max: 3 });
const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Sample data definitions
// ---------------------------------------------------------------------------

const USERS = [
  { email: "alice@example.com", password: "Password123!", name: "Alice Admin", isAdmin: true },
  { email: "bob@example.com",   password: "Password123!", name: "Bob Builder" },
  { email: "carol@example.com", password: "Password123!", name: "Carol Designer" },
  { email: "dave@example.com",  password: "Password123!", name: "Dave Dev" },
];

const GROUPS = [
  { name: "Engineering",   description: "The folks who build things" },
  { name: "Design",        description: "UX, UI, and everything in between" },
  { name: "Marketing",     description: "Growth, content, and brand" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createOrGetUser(email: string, password: string, name: string) {
  // Try to create; if already exists, look them up
  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (created?.user) {
    console.log(`  ✅ Created user: ${email}`);
    return created.user.id;
  }

  if (createErr?.message?.includes("already been registered")) {
    const { data: list } = await adminClient.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      console.log(`  ♻️  User already exists: ${email}`);
      return existing.id;
    }
  }

  throw new Error(`Failed to create/find user ${email}: ${createErr?.message}`);
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 Seeding database…\n");

  // 1. Create auth users (trigger auto-creates profiles)
  console.log("👤 Creating users…");
  const userIds: string[] = [];
  for (const u of USERS) {
    const id = await createOrGetUser(u.email, u.password, u.name);
    userIds.push(id);
  }

  // Small delay so trigger has time to fire
  await new Promise((r) => setTimeout(r, 1500));

  // 2. Mark alice as site admin
  await db
    .insert(schema.profiles)
    .values({ id: userIds[0], name: USERS[0].name, isAdmin: true })
    .onConflictDoUpdate({ target: schema.profiles.id, set: { isAdmin: true } });
  console.log("  ✅ Alice marked as site admin");

  // 3. Create groups
  console.log("\n🏢 Creating groups…");
  const groupRows = await db
    .insert(schema.groups)
    .values(
      GROUPS.map((g, i) => ({
        name: g.name,
        description: g.description,
        createdBy: userIds[0], // alice creates all groups
      }))
    )
    .onConflictDoNothing()
    .returning();

  // If all already existed, fetch them
  let groups = groupRows;
  if (groups.length === 0) {
    groups = await db.select().from(schema.groups);
    console.log("  ♻️  Groups already exist, using existing");
  } else {
    console.log(`  ✅ Created ${groups.length} groups`);
  }

  const [engGroup, designGroup, mktGroup] = groups;

  // 4. Create memberships
  console.log("\n👥 Creating memberships…");
  const memberships = [
    // Alice is admin of all groups
    { userId: userIds[0], groupId: engGroup.id,    role: "admin"  as const },
    { userId: userIds[0], groupId: designGroup.id, role: "admin"  as const },
    { userId: userIds[0], groupId: mktGroup.id,    role: "admin"  as const },
    // Bob in Engineering (admin) + Marketing (member)
    { userId: userIds[1], groupId: engGroup.id,    role: "admin"  as const },
    { userId: userIds[1], groupId: mktGroup.id,    role: "member" as const },
    // Carol in Design (admin)
    { userId: userIds[2], groupId: designGroup.id, role: "admin"  as const },
    // Dave in Engineering (member) + Design (member)
    { userId: userIds[3], groupId: engGroup.id,    role: "member" as const },
    { userId: userIds[3], groupId: designGroup.id, role: "member" as const },
  ];

  await db.insert(schema.groupMemberships).values(memberships).onConflictDoNothing();
  console.log(`  ✅ Created ${memberships.length} memberships`);

  // 5. Create pages with hierarchy
  console.log("\n📄 Creating pages…");

  // Top-level pages
  const [docsPage, handbookPage, roadmapPage] = await db
    .insert(schema.pages)
    .values([
      { title: "Documentation",  description: "All technical documentation",        sortOrder: 0, createdBy: userIds[0] },
      { title: "Team Handbook",  description: "How we work, values and processes",  sortOrder: 1, createdBy: userIds[0] },
      { title: "Product Roadmap",description: "Quarterly and annual planning",      sortOrder: 2, createdBy: userIds[0] },
    ])
    .returning();

  // Children of Documentation
  const [gettingStartedPage, apiDocsPage, deployPage] = await db
    .insert(schema.pages)
    .values([
      { title: "Getting Started", description: "Onboarding guide for new engineers", sortOrder: 0, parentPageId: docsPage.id, createdBy: userIds[1] },
      { title: "API Reference",   description: "REST API endpoints and schemas",     sortOrder: 1, parentPageId: docsPage.id, createdBy: userIds[1] },
      { title: "Deployment Guide",description: "How to deploy to Vercel and beyond", sortOrder: 2, parentPageId: docsPage.id, createdBy: userIds[3] },
    ])
    .returning();

  // Children of Team Handbook
  await db.insert(schema.pages).values([
    { title: "Code of Conduct",   description: "Our shared expectations",           sortOrder: 0, parentPageId: handbookPage.id, createdBy: userIds[0] },
    { title: "Meeting Norms",     description: "How we run meetings",               sortOrder: 1, parentPageId: handbookPage.id, createdBy: userIds[2] },
    { title: "Design Principles", description: "Core visual and UX principles",     sortOrder: 2, parentPageId: handbookPage.id, createdBy: userIds[2] },
  ]);

  // Grandchildren of Getting Started
  await db.insert(schema.pages).values([
    { title: "Local Setup",    description: "Run the project locally",       sortOrder: 0, parentPageId: gettingStartedPage.id, createdBy: userIds[1] },
    { title: "First PR Guide", description: "Ship your first pull request",  sortOrder: 1, parentPageId: gettingStartedPage.id, createdBy: userIds[3] },
  ]);

  console.log("  ✅ Created pages with 3-level hierarchy");

  // 6. Link pages to groups
  console.log("\n🔗 Linking pages to groups…");
  await db.insert(schema.pageGroups).values([
    { pageId: docsPage.id,          groupId: engGroup.id    },
    { pageId: gettingStartedPage.id,groupId: engGroup.id    },
    { pageId: apiDocsPage.id,       groupId: engGroup.id    },
    { pageId: deployPage.id,        groupId: engGroup.id    },
    { pageId: handbookPage.id,      groupId: designGroup.id },
    { pageId: handbookPage.id,      groupId: mktGroup.id    },
    { pageId: roadmapPage.id,       groupId: mktGroup.id    },
    { pageId: roadmapPage.id,       groupId: engGroup.id    },
  ]).onConflictDoNothing();
  console.log("  ✅ Linked pages to groups");

  await sql.end();

  console.log(`
✅ Seed complete!

Test accounts (password: Password123!):
  alice@example.com  — site admin
  bob@example.com    — Engineering admin, Marketing member
  carol@example.com  — Design admin
  dave@example.com   — Engineering + Design member
`);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
