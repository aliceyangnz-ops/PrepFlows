import { defineConfig } from "drizzle-kit";
import path from "path";

// Prefer SUPABASE_DB_URL (direct connection, no pooler) for migrations.
// Falls back to DATABASE_URL (Replit PostgreSQL) when Supabase is not yet configured.
const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DB_URL or DATABASE_URL must be set. " +
      "Set SUPABASE_DB_URL to the Supabase direct connection string for migrations.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
