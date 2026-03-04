import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Session pooler (port 5432) supports prepared statements
// Transaction pooler (port 6543) requires prepare: false
const isTransactionPooler = connectionString.includes(":6543");

// Singleton pattern: reuse the client across hot reloads in dev
// to avoid exhausting the Supabase session pooler connection limit
const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };

const client =
  globalForDb._pgClient ??
  postgres(connectionString, {
    prepare: !isTransactionPooler,
    connect_timeout: 10,
    max: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });
