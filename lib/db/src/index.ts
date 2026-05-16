import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Prefer SUPABASE_POOLER_URL (transaction pooler) for runtime connections —
// it handles connection limits better than a direct connection.
// Falls back to DATABASE_URL (Replit PostgreSQL) when Supabase is not yet configured.
const connectionString =
  process.env.SUPABASE_POOLER_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "SUPABASE_POOLER_URL or DATABASE_URL must be set. " +
      "Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
