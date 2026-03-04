/**
 * Test Supabase connection: API (auth) + Database.
 * Run: npx tsx scripts/test-supabase.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

async function testSupabaseApi() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    return false;
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error("❌ Supabase API error:", error.message);
      return false;
    }
    console.log("✅ Supabase API (auth) connection OK");
    return true;
  } catch (e) {
    console.error("❌ Supabase API error:", e);
    return false;
  }
}

async function testDatabase() {
  if (!DATABASE_URL) {
    console.error("❌ Missing DATABASE_URL in .env.local");
    return false;
  }
  try {
    const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });
    const result = await sql`SELECT 1 as ok`;
    await sql.end();
    if (result?.[0]?.ok === 1) {
      console.log("✅ Database (Postgres) connection OK");
      return true;
    }
    console.error("❌ Database returned unexpected result");
    return false;
  } catch (e) {
    console.error("❌ Database error:", e instanceof Error ? e.message : e);
    return false;
  }
}

async function main() {
  console.log("Testing Supabase connection...\n");
  const apiOk = await testSupabaseApi();
  const dbOk = await testDatabase();
  console.log("");
  if (apiOk && dbOk) {
    console.log("All connections OK.");
    process.exit(0);
  }
  if (!apiOk) console.log("Fix NEXT_PUBLIC_SUPABASE_* in .env.local and Supabase project settings.");
  if (!dbOk) {
    console.log("Database: use the Transaction pooler URL from Supabase Dashboard → Settings → Database.");
    console.log("If the project was paused, resume it in the dashboard.");
  }
  process.exit(1);
}

main();
