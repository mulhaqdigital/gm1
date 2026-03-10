/**
 * Nexara Group — Corporate Seed Script
 * Resets all data and repopulates with a realistic conglomerate:
 *   1. Nexara Media
 *   2. Nexara Engineering
 *   3. Nexara Finance
 *   4. Nexara University
 *   5. Nexara Digital
 *
 * Run: npx tsx scripts/seed.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
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
// Data definitions
// ---------------------------------------------------------------------------

const USERS = [
  // ── Corporate HQ ──────────────────────────────────────────────────────────
  { email: "victoria.osei@nexara.com",      password: "Password123!", name: "Victoria Osei",      isAdmin: true  },

  // ── Nexara Media ──────────────────────────────────────────────────────────
  { email: "marcus.chen@nexara.com",        password: "Password123!", name: "Marcus Chen"         },
  { email: "priya.sharma@nexara.com",       password: "Password123!", name: "Priya Sharma"        },
  { email: "lucas.fernandez@nexara.com",    password: "Password123!", name: "Lucas Fernandez"     },
  { email: "amara.diallo@nexara.com",       password: "Password123!", name: "Amara Diallo"        },
  { email: "yuki.tanaka@nexara.com",        password: "Password123!", name: "Yuki Tanaka"         },

  // ── Nexara Engineering ────────────────────────────────────────────────────
  { email: "james.obrien@nexara.com",       password: "Password123!", name: "James O'Brien"       },
  { email: "fatima.alhassan@nexara.com",    password: "Password123!", name: "Fatima Al-Hassan"    },
  { email: "raj.patel@nexara.com",          password: "Password123!", name: "Raj Patel"           },
  { email: "elena.volkov@nexara.com",       password: "Password123!", name: "Elena Volkov"        },
  { email: "kwame.asante@nexara.com",       password: "Password123!", name: "Kwame Asante"        },

  // ── Nexara Finance ────────────────────────────────────────────────────────
  { email: "sophie.beaumont@nexara.com",    password: "Password123!", name: "Sophie Beaumont"     },
  { email: "david.kim@nexara.com",          password: "Password123!", name: "David Kim"           },
  { email: "nadia.ibrahim@nexara.com",      password: "Password123!", name: "Nadia Ibrahim"       },
  { email: "carlos.rivera@nexara.com",      password: "Password123!", name: "Carlos Rivera"       },
  { email: "mei.lin@nexara.com",            password: "Password123!", name: "Mei Lin"             },

  // ── Nexara University ─────────────────────────────────────────────────────
  { email: "thomas.okafor@nexara.com",      password: "Password123!", name: "Prof. Thomas Okafor" },
  { email: "ingrid.hansen@nexara.com",      password: "Password123!", name: "Dr. Ingrid Hansen"   },
  { email: "aisha.nkrumah@nexara.com",      password: "Password123!", name: "Dr. Aisha Nkrumah"  },
  { email: "miguel.santos@nexara.com",      password: "Password123!", name: "Miguel Santos"       },
  { email: "zoe.williams@nexara.com",       password: "Password123!", name: "Zoe Williams"        },

  // ── Nexara Digital ────────────────────────────────────────────────────────
  { email: "alex.petrov@nexara.com",        password: "Password123!", name: "Alex Petrov"         },
  { email: "sakura.yamamoto@nexara.com",    password: "Password123!", name: "Sakura Yamamoto"     },
  { email: "omar.hassan@nexara.com",        password: "Password123!", name: "Omar Hassan"         },
  { email: "isabela.costa@nexara.com",      password: "Password123!", name: "Isabela Costa"       },
  { email: "ethan.park@nexara.com",         password: "Password123!", name: "Ethan Park"          },
];

// User index helpers
const U = {
  victoria: 0,
  // Media
  marcus: 1, priya: 2, lucas: 3, amara: 4, yuki: 5,
  // Engineering
  james: 6, fatima: 7, raj: 8, elena: 9, kwame: 10,
  // Finance
  sophie: 11, david: 12, nadia: 13, carlos: 14, mei: 15,
  // University
  thomas: 16, ingrid: 17, aisha: 18, miguel: 19, zoe: 20,
  // Digital
  alex: 21, sakura: 22, omar: 23, isabela: 24, ethan: 25,
};

const GROUPS = [
  {
    name: "Nexara Media",
    description: "Broadcasting, film production, publishing, and public relations",
  },
  {
    name: "Nexara Engineering",
    description: "Civil, mechanical, software R&D, and infrastructure operations",
  },
  {
    name: "Nexara Finance",
    description: "Investment banking, insurance, accounting, and risk management",
  },
  {
    name: "Nexara University",
    description: "Higher education, research institutes, and academic administration",
  },
  {
    name: "Nexara Digital",
    description: "Cybersecurity, data analytics, cloud services, and e-commerce",
  },
];

const LABELS = ["Policy", "Technical", "Academic", "Financial", "Creative", "Operations", "Research"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createOrGetUser(email: string, password: string, name: string): Promise<string> {
  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (created?.user) {
    console.log(`  ✅ Created: ${name} <${email}>`);
    return created.user.id;
  }

  if (createErr?.message?.includes("already been registered")) {
    const { data: list } = await adminClient.auth.admin.listUsers({ perPage: 500 });
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      console.log(`  ♻️  Exists:  ${name} <${email}>`);
      return existing.id;
    }
  }

  throw new Error(`Failed to create/find user ${email}: ${createErr?.message}`);
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

async function reset() {
  console.log("\n🗑️  Resetting database…");

  // Delete app data (FK order)
  await db.delete(schema.groupInvites);
  await db.delete(schema.pageGroups);
  await db.delete(schema.groupMemberships);
  await db.delete(schema.pages);
  await db.delete(schema.groups);
  await db.delete(schema.labels);

  // Delete all Supabase auth users (profiles cascade automatically)
  const { data: userList } = await adminClient.auth.admin.listUsers({ perPage: 500 });
  const existingUsers = userList?.users ?? [];
  for (const user of existingUsers) {
    await adminClient.auth.admin.deleteUser(user.id);
    console.log(`  🗑️  Deleted auth user: ${user.email}`);
  }

  // Also wipe any orphan profiles
  await db.delete(schema.profiles);

  console.log("  ✅ Reset complete\n");
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  await reset();

  console.log("👤 Creating users…");
  const ids: string[] = [];
  for (const u of USERS) {
    const id = await createOrGetUser(u.email, u.password, u.name);
    ids.push(id);
  }

  // Wait for the Supabase trigger to create profiles
  console.log("\n  ⏳ Waiting for profile trigger…");
  await new Promise((r) => setTimeout(r, 2000));

  // Mark Victoria as site admin
  await db
    .insert(schema.profiles)
    .values({ id: ids[U.victoria], name: USERS[U.victoria].name, isAdmin: true })
    .onConflictDoUpdate({ target: schema.profiles.id, set: { isAdmin: true } });
  console.log("  ✅ Victoria Osei marked as site admin");

  // ---------------------------------------------------------------------------
  // Labels
  // ---------------------------------------------------------------------------
  console.log("\n🏷️  Creating labels…");
  const labelRows = await db
    .insert(schema.labels)
    .values(LABELS.map((name) => ({ name })))
    .onConflictDoNothing()
    .returning();
  console.log(`  ✅ ${labelRows.length} labels created`);

  const labelMap: Record<string, string> = {};
  for (const l of labelRows) labelMap[l.name] = l.id;

  // ---------------------------------------------------------------------------
  // Groups
  // ---------------------------------------------------------------------------
  console.log("\n🏢 Creating groups…");
  const groupRows = await db
    .insert(schema.groups)
    .values(GROUPS.map((g) => ({ ...g, createdBy: ids[U.victoria] })))
    .returning();
  console.log(`  ✅ ${groupRows.length} groups created`);

  const [mediaGroup, engGroup, finGroup, uniGroup, digitalGroup] = groupRows;

  // ---------------------------------------------------------------------------
  // Memberships
  // ---------------------------------------------------------------------------
  console.log("\n👥 Creating memberships…");

  const memberships: { userId: string; groupId: string; role: "admin" | "member" }[] = [
    // Victoria is admin of every group
    ...groupRows.map((g) => ({ userId: ids[U.victoria], groupId: g.id, role: "admin" as const })),

    // ── Media ────────────────────────────────────────────────────────────────
    { userId: ids[U.marcus],  groupId: mediaGroup.id, role: "admin"  },
    { userId: ids[U.priya],   groupId: mediaGroup.id, role: "member" },
    { userId: ids[U.lucas],   groupId: mediaGroup.id, role: "member" },
    { userId: ids[U.amara],   groupId: mediaGroup.id, role: "member" },
    { userId: ids[U.yuki],    groupId: mediaGroup.id, role: "member" },

    // ── Engineering ──────────────────────────────────────────────────────────
    { userId: ids[U.james],   groupId: engGroup.id,   role: "admin"  },
    { userId: ids[U.fatima],  groupId: engGroup.id,   role: "member" },
    { userId: ids[U.raj],     groupId: engGroup.id,   role: "member" },
    { userId: ids[U.elena],   groupId: engGroup.id,   role: "member" },
    { userId: ids[U.kwame],   groupId: engGroup.id,   role: "member" },

    // ── Finance ──────────────────────────────────────────────────────────────
    { userId: ids[U.sophie],  groupId: finGroup.id,   role: "admin"  },
    { userId: ids[U.david],   groupId: finGroup.id,   role: "member" },
    { userId: ids[U.nadia],   groupId: finGroup.id,   role: "member" },
    { userId: ids[U.carlos],  groupId: finGroup.id,   role: "member" },
    { userId: ids[U.mei],     groupId: finGroup.id,   role: "member" },

    // ── University ───────────────────────────────────────────────────────────
    { userId: ids[U.thomas],  groupId: uniGroup.id,   role: "admin"  },
    { userId: ids[U.ingrid],  groupId: uniGroup.id,   role: "member" },
    { userId: ids[U.aisha],   groupId: uniGroup.id,   role: "member" },
    { userId: ids[U.miguel],  groupId: uniGroup.id,   role: "member" },
    { userId: ids[U.zoe],     groupId: uniGroup.id,   role: "member" },

    // ── Digital ──────────────────────────────────────────────────────────────
    { userId: ids[U.alex],    groupId: digitalGroup.id, role: "admin"  },
    { userId: ids[U.sakura],  groupId: digitalGroup.id, role: "member" },
    { userId: ids[U.omar],    groupId: digitalGroup.id, role: "member" },
    { userId: ids[U.isabela], groupId: digitalGroup.id, role: "member" },
    { userId: ids[U.ethan],   groupId: digitalGroup.id, role: "member" },

    // ── Cross-division (realistic overlaps) ──────────────────────────────────
    // Raj (Engineering) also contributes to Digital
    { userId: ids[U.raj],     groupId: digitalGroup.id, role: "member" },
    // David (Finance) also reviews Engineering spend
    { userId: ids[U.david],   groupId: engGroup.id,   role: "member" },
    // Miguel (University) publishes via Media
    { userId: ids[U.miguel],  groupId: mediaGroup.id, role: "member" },
    // Sakura (Digital) advises University on cybersecurity
    { userId: ids[U.sakura],  groupId: uniGroup.id,   role: "member" },
    // Mei (Finance) manages University endowment
    { userId: ids[U.mei],     groupId: uniGroup.id,   role: "member" },
    // Yuki (Media PR) assists Digital marketing
    { userId: ids[U.yuki],    groupId: digitalGroup.id, role: "member" },
  ];

  await db.insert(schema.groupMemberships).values(memberships).onConflictDoNothing();
  console.log(`  ✅ ${memberships.length} memberships created`);

  // ---------------------------------------------------------------------------
  // Pages — Nexara Media
  // ---------------------------------------------------------------------------
  console.log("\n📄 Creating pages…");

  const [mediaHome] = await db.insert(schema.pages).values({
    title: "Nexara Media Hub",
    description: "Central knowledge base for all Nexara Media divisions and departments",
    sortOrder: 0, createdBy: ids[U.victoria],
  }).returning();

  const [broadcasting, film, publishing, pr] = await db.insert(schema.pages).values([
    { title: "Broadcasting", description: "TV channels, radio networks, and streaming operations", sortOrder: 0, parentPageId: mediaHome.id, labelId: labelMap["Operations"], createdBy: ids[U.marcus] },
    { title: "Film Production", description: "Feature films, documentaries, and short-form content", sortOrder: 1, parentPageId: mediaHome.id, labelId: labelMap["Creative"], createdBy: ids[U.lucas] },
    { title: "Publishing", description: "Print and digital publishing division", sortOrder: 2, parentPageId: mediaHome.id, labelId: labelMap["Creative"], createdBy: ids[U.amara] },
    { title: "Public Relations", description: "Corporate communications and media relations", sortOrder: 3, parentPageId: mediaHome.id, labelId: labelMap["Policy"], createdBy: ids[U.yuki] },
  ]).returning();

  await db.insert(schema.pages).values([
    { title: "Broadcast Standards & Compliance", description: "Regulatory frameworks and content guidelines", sortOrder: 0, parentPageId: broadcasting.id, labelId: labelMap["Policy"], createdBy: ids[U.priya] },
    { title: "Channel Operations Manual", description: "Day-to-day broadcast runbook", sortOrder: 1, parentPageId: broadcasting.id, labelId: labelMap["Operations"], createdBy: ids[U.priya] },
    { title: "Streaming Platform Guide", description: "OTT delivery, encoding specs, and CDN configuration", sortOrder: 2, parentPageId: broadcasting.id, labelId: labelMap["Technical"], createdBy: ids[U.marcus] },

    { title: "Pre-Production Checklist", description: "Script approvals, location scouting, and budgeting", sortOrder: 0, parentPageId: film.id, labelId: labelMap["Operations"], createdBy: ids[U.lucas] },
    { title: "Post-Production Workflow", description: "Editing, VFX, sound design, and DCP delivery", sortOrder: 1, parentPageId: film.id, labelId: labelMap["Technical"], createdBy: ids[U.lucas] },
    { title: "Film Festival Strategy", description: "Submission calendar and distribution partnerships", sortOrder: 2, parentPageId: film.id, labelId: labelMap["Creative"], createdBy: ids[U.marcus] },

    { title: "Editorial Guidelines", description: "Style guide, fact-checking policy, and tone of voice", sortOrder: 0, parentPageId: publishing.id, labelId: labelMap["Policy"], createdBy: ids[U.amara] },
    { title: "Digital Content Strategy", description: "SEO, content calendar, and audience analytics", sortOrder: 1, parentPageId: publishing.id, labelId: labelMap["Creative"], createdBy: ids[U.amara] },

    { title: "Crisis Communications Playbook", description: "Step-by-step guide for managing media crises", sortOrder: 0, parentPageId: pr.id, labelId: labelMap["Policy"], createdBy: ids[U.yuki] },
    { title: "Press Release Templates", description: "Approved templates for all announcement types", sortOrder: 1, parentPageId: pr.id, labelId: labelMap["Creative"], createdBy: ids[U.yuki] },
  ]);

  // ---------------------------------------------------------------------------
  // Pages — Nexara Engineering
  // ---------------------------------------------------------------------------

  const [engHome] = await db.insert(schema.pages).values({
    title: "Nexara Engineering Hub",
    description: "Technical documentation, standards, and project management for all engineering teams",
    sortOrder: 1, createdBy: ids[U.victoria],
  }).returning();

  const [civil, software, mechanical, infra] = await db.insert(schema.pages).values([
    { title: "Civil Engineering", description: "Structural design, project planning, and site operations", sortOrder: 0, parentPageId: engHome.id, labelId: labelMap["Technical"], createdBy: ids[U.fatima] },
    { title: "Software R&D", description: "Internal tools, product development, and research projects", sortOrder: 1, parentPageId: engHome.id, labelId: labelMap["Technical"], createdBy: ids[U.raj] },
    { title: "Mechanical Engineering", description: "Manufacturing processes, quality assurance, and equipment", sortOrder: 2, parentPageId: engHome.id, labelId: labelMap["Technical"], createdBy: ids[U.elena] },
    { title: "Infrastructure & Ops", description: "Facilities management, energy systems, and IT backbone", sortOrder: 3, parentPageId: engHome.id, labelId: labelMap["Operations"], createdBy: ids[U.kwame] },
  ]).returning();

  const [gettingStartedEng] = await db.insert(schema.pages).values([
    { title: "Safety & Compliance Standards", description: "ISO certifications, HSE policies, and audit procedures", sortOrder: 0, parentPageId: civil.id, labelId: labelMap["Policy"], createdBy: ids[U.fatima] },
    { title: "Structural Design Guidelines", description: "Engineering specifications and drawing standards", sortOrder: 1, parentPageId: civil.id, labelId: labelMap["Technical"], createdBy: ids[U.fatima] },
    { title: "Project Management Framework", description: "Gantt, milestone tracking, and contractor management", sortOrder: 2, parentPageId: civil.id, labelId: labelMap["Operations"], createdBy: ids[U.james] },

    { title: "Developer Onboarding", description: "Environment setup, repos, and first-week checklist", sortOrder: 0, parentPageId: software.id, labelId: labelMap["Technical"], createdBy: ids[U.raj] },
    { title: "API & Architecture Reference", description: "System design docs, ADRs, and API contracts", sortOrder: 1, parentPageId: software.id, labelId: labelMap["Technical"], createdBy: ids[U.raj] },
    { title: "Release & Deployment Guide", description: "CI/CD pipeline, versioning, and rollback procedures", sortOrder: 2, parentPageId: software.id, labelId: labelMap["Technical"], createdBy: ids[U.raj] },

    { title: "Equipment Maintenance Schedule", description: "Preventive maintenance calendar and service logs", sortOrder: 0, parentPageId: mechanical.id, labelId: labelMap["Operations"], createdBy: ids[U.elena] },
    { title: "Quality Assurance Protocols", description: "QA checklists, defect tracking, and sign-off process", sortOrder: 1, parentPageId: mechanical.id, labelId: labelMap["Policy"], createdBy: ids[U.elena] },

    { title: "Data Centre Operations", description: "Server racks, cooling, power, and uptime SLAs", sortOrder: 0, parentPageId: infra.id, labelId: labelMap["Technical"], createdBy: ids[U.kwame] },
    { title: "Network & Security Baseline", description: "Firewall rules, VPN setup, and access control", sortOrder: 1, parentPageId: infra.id, labelId: labelMap["Technical"], createdBy: ids[U.kwame] },
  ]).returning();

  // Grandchildren under Developer Onboarding
  await db.insert(schema.pages).values([
    { title: "Local Dev Environment Setup", description: "Docker, env vars, and IDE configuration", sortOrder: 0, parentPageId: gettingStartedEng.id, labelId: labelMap["Technical"], createdBy: ids[U.raj] },
    { title: "Code Review Standards", description: "PR etiquette, review checklist, and merge policy", sortOrder: 1, parentPageId: gettingStartedEng.id, labelId: labelMap["Policy"], createdBy: ids[U.james] },
  ]);

  // ---------------------------------------------------------------------------
  // Pages — Nexara Finance
  // ---------------------------------------------------------------------------

  const [finHome] = await db.insert(schema.pages).values({
    title: "Nexara Finance Hub",
    description: "Financial policies, reporting standards, and investment frameworks across the group",
    sortOrder: 2, createdBy: ids[U.victoria],
  }).returning();

  const [investment, insurance, accounting, risk] = await db.insert(schema.pages).values([
    { title: "Investment Banking", description: "M&A advisory, capital markets, and deal flow management", sortOrder: 0, parentPageId: finHome.id, labelId: labelMap["Financial"], createdBy: ids[U.david] },
    { title: "Insurance Division", description: "Corporate and personal insurance product lines", sortOrder: 1, parentPageId: finHome.id, labelId: labelMap["Financial"], createdBy: ids[U.mei] },
    { title: "Accounting & Reporting", description: "Group financial statements, tax compliance, and audit", sortOrder: 2, parentPageId: finHome.id, labelId: labelMap["Financial"], createdBy: ids[U.carlos] },
    { title: "Risk Management", description: "Enterprise risk register, controls, and mitigation strategy", sortOrder: 3, parentPageId: finHome.id, labelId: labelMap["Policy"], createdBy: ids[U.nadia] },
  ]).returning();

  await db.insert(schema.pages).values([
    { title: "Deal Sourcing & Pipeline", description: "CRM workflow, due diligence checklist, and term sheets", sortOrder: 0, parentPageId: investment.id, labelId: labelMap["Operations"], createdBy: ids[U.david] },
    { title: "Valuation Models", description: "DCF, comparable comps, and LBO model templates", sortOrder: 1, parentPageId: investment.id, labelId: labelMap["Financial"], createdBy: ids[U.david] },
    { title: "Regulatory Compliance — Banking", description: "BASEL III, KYC/AML, and reporting obligations", sortOrder: 2, parentPageId: investment.id, labelId: labelMap["Policy"], createdBy: ids[U.sophie] },

    { title: "Insurance Product Catalogue", description: "Coverage types, exclusions, and premium schedules", sortOrder: 0, parentPageId: insurance.id, labelId: labelMap["Financial"], createdBy: ids[U.mei] },
    { title: "Claims Processing Procedures", description: "End-to-end claims workflow and escalation matrix", sortOrder: 1, parentPageId: insurance.id, labelId: labelMap["Operations"], createdBy: ids[U.mei] },

    { title: "Group Reporting Calendar", description: "Monthly, quarterly, and annual reporting deadlines", sortOrder: 0, parentPageId: accounting.id, labelId: labelMap["Operations"], createdBy: ids[U.carlos] },
    { title: "IFRS Accounting Policies", description: "Standard accounting policies adopted by Nexara Group", sortOrder: 1, parentPageId: accounting.id, labelId: labelMap["Policy"], createdBy: ids[U.carlos] },
    { title: "Tax Strategy & Transfer Pricing", description: "Intra-group pricing policy and tax optimisation framework", sortOrder: 2, parentPageId: accounting.id, labelId: labelMap["Financial"], createdBy: ids[U.sophie] },

    { title: "Enterprise Risk Register", description: "Top-25 risks with likelihood, impact, and owners", sortOrder: 0, parentPageId: risk.id, labelId: labelMap["Policy"], createdBy: ids[U.nadia] },
    { title: "Business Continuity Plan", description: "DR scenarios, RTO/RPO targets, and recovery playbooks", sortOrder: 1, parentPageId: risk.id, labelId: labelMap["Operations"], createdBy: ids[U.nadia] },
  ]);

  // ---------------------------------------------------------------------------
  // Pages — Nexara University
  // ---------------------------------------------------------------------------

  const [uniHome] = await db.insert(schema.pages).values({
    title: "Nexara University Hub",
    description: "Academic governance, research output, and student administration resources",
    sortOrder: 3, createdBy: ids[U.victoria],
  }).returning();

  const [scienceFaculty, artsFaculty, research, adminUni] = await db.insert(schema.pages).values([
    { title: "Faculty of Science & Technology", description: "Engineering, computing, mathematics, and life sciences", sortOrder: 0, parentPageId: uniHome.id, labelId: labelMap["Academic"], createdBy: ids[U.ingrid] },
    { title: "Faculty of Arts & Humanities", description: "Languages, history, philosophy, and creative arts", sortOrder: 1, parentPageId: uniHome.id, labelId: labelMap["Academic"], createdBy: ids[U.aisha] },
    { title: "Research Institute", description: "Interdisciplinary research centres and grant management", sortOrder: 2, parentPageId: uniHome.id, labelId: labelMap["Research"], createdBy: ids[U.miguel] },
    { title: "Academic Administration", description: "Enrolment, student services, and accreditation", sortOrder: 3, parentPageId: uniHome.id, labelId: labelMap["Operations"], createdBy: ids[U.zoe] },
  ]).returning();

  await db.insert(schema.pages).values([
    { title: "Curriculum & Course Catalogue", description: "Approved modules, credit structures, and prerequisites", sortOrder: 0, parentPageId: scienceFaculty.id, labelId: labelMap["Academic"], createdBy: ids[U.ingrid] },
    { title: "Lab Safety Protocols", description: "COSHH regulations, PPE requirements, and emergency procedures", sortOrder: 1, parentPageId: scienceFaculty.id, labelId: labelMap["Policy"], createdBy: ids[U.ingrid] },
    { title: "Postgraduate Research Guide", description: "Thesis submission, supervisor allocation, and viva procedures", sortOrder: 2, parentPageId: scienceFaculty.id, labelId: labelMap["Academic"], createdBy: ids[U.thomas] },

    { title: "Arts Programme Overview", description: "Degree structures, studio hours, and assessment criteria", sortOrder: 0, parentPageId: artsFaculty.id, labelId: labelMap["Academic"], createdBy: ids[U.aisha] },
    { title: "Archives & Special Collections", description: "Rare manuscripts, digital archives, and access procedures", sortOrder: 1, parentPageId: artsFaculty.id, labelId: labelMap["Operations"], createdBy: ids[U.aisha] },

    { title: "Grant Application Framework", description: "Internal and external funding sources and application templates", sortOrder: 0, parentPageId: research.id, labelId: labelMap["Research"], createdBy: ids[U.miguel] },
    { title: "Research Ethics Policy", description: "IRB procedures, informed consent, and data privacy in research", sortOrder: 1, parentPageId: research.id, labelId: labelMap["Policy"], createdBy: ids[U.thomas] },
    { title: "Published Papers Repository", description: "Open-access index of Nexara University research output", sortOrder: 2, parentPageId: research.id, labelId: labelMap["Research"], createdBy: ids[U.miguel] },

    { title: "Student Enrolment Guide", description: "Application portal, document requirements, and offer letters", sortOrder: 0, parentPageId: adminUni.id, labelId: labelMap["Operations"], createdBy: ids[U.zoe] },
    { title: "Accreditation & Quality Assurance", description: "QAA standards, periodic review, and external examiner reports", sortOrder: 1, parentPageId: adminUni.id, labelId: labelMap["Policy"], createdBy: ids[U.zoe] },
  ]);

  // ---------------------------------------------------------------------------
  // Pages — Nexara Digital
  // ---------------------------------------------------------------------------

  const [digitalHome] = await db.insert(schema.pages).values({
    title: "Nexara Digital Hub",
    description: "Technology strategy, security policies, and platform documentation for Nexara Digital",
    sortOrder: 4, createdBy: ids[U.victoria],
  }).returning();

  const [cyber, data, cloud, ecommerce] = await db.insert(schema.pages).values([
    { title: "Cybersecurity", description: "Threat intelligence, incident response, and security architecture", sortOrder: 0, parentPageId: digitalHome.id, labelId: labelMap["Technical"], createdBy: ids[U.sakura] },
    { title: "Data Analytics", description: "Business intelligence, data pipelines, and ML model governance", sortOrder: 1, parentPageId: digitalHome.id, labelId: labelMap["Technical"], createdBy: ids[U.omar] },
    { title: "Cloud Services", description: "Multi-cloud strategy, IaC standards, and platform engineering", sortOrder: 2, parentPageId: digitalHome.id, labelId: labelMap["Technical"], createdBy: ids[U.isabela] },
    { title: "E-Commerce Platform", description: "Storefront, payments, logistics, and customer experience", sortOrder: 3, parentPageId: digitalHome.id, labelId: labelMap["Operations"], createdBy: ids[U.ethan] },
  ]).returning();

  await db.insert(schema.pages).values([
    { title: "Security Incident Response Plan", description: "Severity tiers, CSIRT contacts, and escalation runbook", sortOrder: 0, parentPageId: cyber.id, labelId: labelMap["Policy"], createdBy: ids[U.sakura] },
    { title: "Penetration Testing Policy", description: "Scope definitions, authorisation process, and report templates", sortOrder: 1, parentPageId: cyber.id, labelId: labelMap["Technical"], createdBy: ids[U.sakura] },
    { title: "Zero-Trust Architecture Guide", description: "Identity-first security model and network segmentation standards", sortOrder: 2, parentPageId: cyber.id, labelId: labelMap["Technical"], createdBy: ids[U.alex] },

    { title: "Data Governance Framework", description: "Data ownership, classification tiers, and retention policies", sortOrder: 0, parentPageId: data.id, labelId: labelMap["Policy"], createdBy: ids[U.omar] },
    { title: "Analytics Engineering Handbook", description: "dbt models, warehouse conventions, and testing standards", sortOrder: 1, parentPageId: data.id, labelId: labelMap["Technical"], createdBy: ids[U.omar] },
    { title: "ML Model Registry", description: "Model cards, versioning, bias audits, and deployment approvals", sortOrder: 2, parentPageId: data.id, labelId: labelMap["Research"], createdBy: ids[U.alex] },

    { title: "Cloud Cost Optimisation Playbook", description: "FinOps practices, budget alerts, and rightsizing guide", sortOrder: 0, parentPageId: cloud.id, labelId: labelMap["Financial"], createdBy: ids[U.isabela] },
    { title: "Infrastructure as Code Standards", description: "Terraform modules, naming conventions, and review gates", sortOrder: 1, parentPageId: cloud.id, labelId: labelMap["Technical"], createdBy: ids[U.isabela] },

    { title: "Storefront Design System", description: "Component library, accessibility standards, and theming", sortOrder: 0, parentPageId: ecommerce.id, labelId: labelMap["Creative"], createdBy: ids[U.ethan] },
    { title: "Payment & Fraud Prevention", description: "Payment gateway integration, PCI-DSS compliance, and fraud rules", sortOrder: 1, parentPageId: ecommerce.id, labelId: labelMap["Policy"], createdBy: ids[U.ethan] },
    { title: "Logistics & Fulfilment Guide", description: "Warehouse integration, shipping SLAs, and returns process", sortOrder: 2, parentPageId: ecommerce.id, labelId: labelMap["Operations"], createdBy: ids[U.ethan] },
  ]);

  // ---------------------------------------------------------------------------
  // Corporate-wide top-level pages
  // ---------------------------------------------------------------------------

  const [corpHandbook] = await db.insert(schema.pages).values({
    title: "Nexara Group Handbook",
    description: "Group-wide policies, values, and governance applicable across all divisions",
    sortOrder: 5, createdBy: ids[U.victoria],
  }).returning();

  await db.insert(schema.pages).values([
    { title: "Code of Ethics & Conduct", description: "Our shared values, integrity standards, and reporting channels", sortOrder: 0, parentPageId: corpHandbook.id, labelId: labelMap["Policy"], createdBy: ids[U.victoria] },
    { title: "Data Protection & Privacy Policy", description: "GDPR compliance, data subject rights, and DPO contact", sortOrder: 1, parentPageId: corpHandbook.id, labelId: labelMap["Policy"], createdBy: ids[U.victoria] },
    { title: "Diversity, Equity & Inclusion", description: "DEI commitments, reporting, and employee resource groups", sortOrder: 2, parentPageId: corpHandbook.id, labelId: labelMap["Policy"], createdBy: ids[U.victoria] },
    { title: "ESG & Sustainability Report", description: "Environmental targets, social impact, and governance disclosures", sortOrder: 3, parentPageId: corpHandbook.id, labelId: labelMap["Policy"], createdBy: ids[U.victoria] },
    { title: "Group IT Acceptable Use Policy", description: "Approved tools, BYOD rules, and remote work security", sortOrder: 4, parentPageId: corpHandbook.id, labelId: labelMap["Technical"], createdBy: ids[U.alex] },
  ]);

  console.log("  ✅ Pages created with up to 3-level hierarchy");

  // ---------------------------------------------------------------------------
  // Page ↔ Group links
  // ---------------------------------------------------------------------------
  console.log("\n🔗 Linking pages to groups…");

  // Re-fetch all pages to get IDs
  const allPages = await db.select().from(schema.pages);
  const byTitle = (t: string) => allPages.find((p) => p.title === t)!.id;

  const pageGroupLinks = [
    // Media pages → Media group
    { pageId: byTitle("Nexara Media Hub"),              groupId: mediaGroup.id },
    { pageId: byTitle("Broadcasting"),                   groupId: mediaGroup.id },
    { pageId: byTitle("Film Production"),                groupId: mediaGroup.id },
    { pageId: byTitle("Publishing"),                     groupId: mediaGroup.id },
    { pageId: byTitle("Public Relations"),               groupId: mediaGroup.id },
    { pageId: byTitle("Broadcast Standards & Compliance"), groupId: mediaGroup.id },
    { pageId: byTitle("Channel Operations Manual"),      groupId: mediaGroup.id },
    { pageId: byTitle("Streaming Platform Guide"),       groupId: mediaGroup.id },
    { pageId: byTitle("Pre-Production Checklist"),       groupId: mediaGroup.id },
    { pageId: byTitle("Post-Production Workflow"),       groupId: mediaGroup.id },
    { pageId: byTitle("Film Festival Strategy"),         groupId: mediaGroup.id },
    { pageId: byTitle("Editorial Guidelines"),           groupId: mediaGroup.id },
    { pageId: byTitle("Digital Content Strategy"),       groupId: mediaGroup.id },
    { pageId: byTitle("Crisis Communications Playbook"), groupId: mediaGroup.id },
    { pageId: byTitle("Press Release Templates"),        groupId: mediaGroup.id },

    // Engineering pages → Engineering group
    { pageId: byTitle("Nexara Engineering Hub"),         groupId: engGroup.id },
    { pageId: byTitle("Civil Engineering"),              groupId: engGroup.id },
    { pageId: byTitle("Software R&D"),                   groupId: engGroup.id },
    { pageId: byTitle("Mechanical Engineering"),         groupId: engGroup.id },
    { pageId: byTitle("Infrastructure & Ops"),           groupId: engGroup.id },
    { pageId: byTitle("Safety & Compliance Standards"),  groupId: engGroup.id },
    { pageId: byTitle("Structural Design Guidelines"),   groupId: engGroup.id },
    { pageId: byTitle("Project Management Framework"),   groupId: engGroup.id },
    { pageId: byTitle("Developer Onboarding"),           groupId: engGroup.id },
    { pageId: byTitle("API & Architecture Reference"),   groupId: engGroup.id },
    { pageId: byTitle("Release & Deployment Guide"),     groupId: engGroup.id },
    { pageId: byTitle("Equipment Maintenance Schedule"), groupId: engGroup.id },
    { pageId: byTitle("Quality Assurance Protocols"),    groupId: engGroup.id },
    { pageId: byTitle("Data Centre Operations"),         groupId: engGroup.id },
    { pageId: byTitle("Network & Security Baseline"),    groupId: engGroup.id },
    { pageId: byTitle("Local Dev Environment Setup"),    groupId: engGroup.id },
    { pageId: byTitle("Code Review Standards"),          groupId: engGroup.id },

    // Finance pages → Finance group
    { pageId: byTitle("Nexara Finance Hub"),             groupId: finGroup.id },
    { pageId: byTitle("Investment Banking"),             groupId: finGroup.id },
    { pageId: byTitle("Insurance Division"),             groupId: finGroup.id },
    { pageId: byTitle("Accounting & Reporting"),         groupId: finGroup.id },
    { pageId: byTitle("Risk Management"),                groupId: finGroup.id },
    { pageId: byTitle("Deal Sourcing & Pipeline"),       groupId: finGroup.id },
    { pageId: byTitle("Valuation Models"),               groupId: finGroup.id },
    { pageId: byTitle("Regulatory Compliance — Banking"),groupId: finGroup.id },
    { pageId: byTitle("Insurance Product Catalogue"),    groupId: finGroup.id },
    { pageId: byTitle("Claims Processing Procedures"),   groupId: finGroup.id },
    { pageId: byTitle("Group Reporting Calendar"),       groupId: finGroup.id },
    { pageId: byTitle("IFRS Accounting Policies"),       groupId: finGroup.id },
    { pageId: byTitle("Tax Strategy & Transfer Pricing"),groupId: finGroup.id },
    { pageId: byTitle("Enterprise Risk Register"),       groupId: finGroup.id },
    { pageId: byTitle("Business Continuity Plan"),       groupId: finGroup.id },

    // University pages → University group
    { pageId: byTitle("Nexara University Hub"),          groupId: uniGroup.id },
    { pageId: byTitle("Faculty of Science & Technology"),groupId: uniGroup.id },
    { pageId: byTitle("Faculty of Arts & Humanities"),   groupId: uniGroup.id },
    { pageId: byTitle("Research Institute"),             groupId: uniGroup.id },
    { pageId: byTitle("Academic Administration"),        groupId: uniGroup.id },
    { pageId: byTitle("Curriculum & Course Catalogue"),  groupId: uniGroup.id },
    { pageId: byTitle("Lab Safety Protocols"),           groupId: uniGroup.id },
    { pageId: byTitle("Postgraduate Research Guide"),    groupId: uniGroup.id },
    { pageId: byTitle("Arts Programme Overview"),        groupId: uniGroup.id },
    { pageId: byTitle("Archives & Special Collections"), groupId: uniGroup.id },
    { pageId: byTitle("Grant Application Framework"),    groupId: uniGroup.id },
    { pageId: byTitle("Research Ethics Policy"),         groupId: uniGroup.id },
    { pageId: byTitle("Published Papers Repository"),    groupId: uniGroup.id },
    { pageId: byTitle("Student Enrolment Guide"),        groupId: uniGroup.id },
    { pageId: byTitle("Accreditation & Quality Assurance"), groupId: uniGroup.id },

    // Digital pages → Digital group
    { pageId: byTitle("Nexara Digital Hub"),             groupId: digitalGroup.id },
    { pageId: byTitle("Cybersecurity"),                  groupId: digitalGroup.id },
    { pageId: byTitle("Data Analytics"),                 groupId: digitalGroup.id },
    { pageId: byTitle("Cloud Services"),                 groupId: digitalGroup.id },
    { pageId: byTitle("E-Commerce Platform"),            groupId: digitalGroup.id },
    { pageId: byTitle("Security Incident Response Plan"),groupId: digitalGroup.id },
    { pageId: byTitle("Penetration Testing Policy"),     groupId: digitalGroup.id },
    { pageId: byTitle("Zero-Trust Architecture Guide"),  groupId: digitalGroup.id },
    { pageId: byTitle("Data Governance Framework"),      groupId: digitalGroup.id },
    { pageId: byTitle("Analytics Engineering Handbook"), groupId: digitalGroup.id },
    { pageId: byTitle("ML Model Registry"),              groupId: digitalGroup.id },
    { pageId: byTitle("Cloud Cost Optimisation Playbook"), groupId: digitalGroup.id },
    { pageId: byTitle("Infrastructure as Code Standards"), groupId: digitalGroup.id },
    { pageId: byTitle("Storefront Design System"),       groupId: digitalGroup.id },
    { pageId: byTitle("Payment & Fraud Prevention"),     groupId: digitalGroup.id },
    { pageId: byTitle("Logistics & Fulfilment Guide"),   groupId: digitalGroup.id },

    // Corporate handbook → all groups
    { pageId: byTitle("Nexara Group Handbook"),          groupId: mediaGroup.id },
    { pageId: byTitle("Nexara Group Handbook"),          groupId: engGroup.id },
    { pageId: byTitle("Nexara Group Handbook"),          groupId: finGroup.id },
    { pageId: byTitle("Nexara Group Handbook"),          groupId: uniGroup.id },
    { pageId: byTitle("Nexara Group Handbook"),          groupId: digitalGroup.id },

    // Cross-division: IT Policy visible to Digital + Engineering
    { pageId: byTitle("Group IT Acceptable Use Policy"), groupId: digitalGroup.id },
    { pageId: byTitle("Group IT Acceptable Use Policy"), groupId: engGroup.id },

    // Business Continuity Plan also visible to all groups
    { pageId: byTitle("Business Continuity Plan"),       groupId: digitalGroup.id },
    { pageId: byTitle("Business Continuity Plan"),       groupId: engGroup.id },
    { pageId: byTitle("Business Continuity Plan"),       groupId: mediaGroup.id },
    { pageId: byTitle("Business Continuity Plan"),       groupId: uniGroup.id },

    // Data Governance also visible to Finance and University
    { pageId: byTitle("Data Governance Framework"),      groupId: finGroup.id },
    { pageId: byTitle("Data Governance Framework"),      groupId: uniGroup.id },

    // ML Model Registry also visible to University (Research)
    { pageId: byTitle("ML Model Registry"),              groupId: uniGroup.id },

    // Developer Onboarding also visible to Digital
    { pageId: byTitle("Developer Onboarding"),           groupId: digitalGroup.id },
  ];

  await db.insert(schema.pageGroups).values(pageGroupLinks).onConflictDoNothing();
  console.log(`  ✅ ${pageGroupLinks.length} page-group links created`);

  await sql.end();

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    ✅  NEXARA GROUP SEEDED                       ║
╠══════════════════════════════════════════════════════════════════╣
║  All passwords: Password123!                                     ║
╠══════════════════════════════╦═══════════════════════════════════╣
║  Email                       ║  Role / Division                  ║
╠══════════════════════════════╬═══════════════════════════════════╣
║  victoria.osei@nexara.com    ║  CEO — Site Admin (all groups)    ║
╠══════════════════════════════╬═══════════════════════════════════╣
║  marcus.chen@nexara.com      ║  Media Director (admin)           ║
║  priya.sharma@nexara.com     ║  Head of Broadcasting             ║
║  lucas.fernandez@nexara.com  ║  Film Producer                    ║
║  amara.diallo@nexara.com     ║  Senior Journalist                ║
║  yuki.tanaka@nexara.com      ║  PR Manager (+Digital)            ║
╠══════════════════════════════╬═══════════════════════════════════╣
║  james.obrien@nexara.com     ║  Chief Engineer (admin)           ║
║  fatima.alhassan@nexara.com  ║  Civil Engineering Lead           ║
║  raj.patel@nexara.com        ║  Software R&D Lead (+Digital)     ║
║  elena.volkov@nexara.com     ║  Mechanical Engineer              ║
║  kwame.asante@nexara.com     ║  Infrastructure Manager           ║
╠══════════════════════════════╬═══════════════════════════════════╣
║  sophie.beaumont@nexara.com  ║  CFO (admin)                      ║
║  david.kim@nexara.com        ║  Investment Analyst (+Eng)        ║
║  nadia.ibrahim@nexara.com    ║  Risk Manager                     ║
║  carlos.rivera@nexara.com    ║  Chief Accountant                 ║
║  mei.lin@nexara.com          ║  Insurance Director (+Uni)        ║
╠══════════════════════════════╬═══════════════════════════════════╣
║  thomas.okafor@nexara.com    ║  Vice Chancellor (admin)          ║
║  ingrid.hansen@nexara.com    ║  Faculty of Science Dean          ║
║  aisha.nkrumah@nexara.com    ║  Faculty of Arts Dean             ║
║  miguel.santos@nexara.com    ║  Research Director (+Media)       ║
║  zoe.williams@nexara.com     ║  Admin Director                   ║
╠══════════════════════════════╬═══════════════════════════════════╣
║  alex.petrov@nexara.com      ║  CTO (admin)                      ║
║  sakura.yamamoto@nexara.com  ║  Cybersecurity Lead (+Uni)        ║
║  omar.hassan@nexara.com      ║  Data Analytics Lead              ║
║  isabela.costa@nexara.com    ║  Cloud Services Manager           ║
║  ethan.park@nexara.com       ║  E-Commerce Director              ║
╚══════════════════════════════╩═══════════════════════════════════╝
`);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
