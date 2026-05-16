-- =============================================================================
-- KitchenCommand — Supabase post-schema setup
--
-- Run this script once in the Supabase SQL editor AFTER running:
--   pnpm --filter @workspace/db run push
--
-- This script:
--   1. Enables Realtime on the kitchen-ops tables
--   2. Sets REPLICA IDENTITY FULL so UPDATE/DELETE payloads include old rows
--   3. Enables Row Level Security (RLS) on all app tables
--   4. Creates permissive "allow all" policies for now (tighten when auth lands)
-- =============================================================================

-- ── 1. Realtime publication ──────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE kitchen_functions;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_members;
ALTER PUBLICATION supabase_realtime ADD TABLE prep_items;
ALTER PUBLICATION supabase_realtime ADD TABLE broadcast_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE connector_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_records;

-- ── 2. Full replica identity (required for DELETE payloads in Realtime) ──────

ALTER TABLE kitchen_functions    REPLICA IDENTITY FULL;
ALTER TABLE staff_members        REPLICA IDENTITY FULL;
ALTER TABLE prep_items           REPLICA IDENTITY FULL;
ALTER TABLE broadcast_messages   REPLICA IDENTITY FULL;
ALTER TABLE connector_configs    REPLICA IDENTITY FULL;
ALTER TABLE sync_records         REPLICA IDENTITY FULL;

-- ── 3. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE kitchen_functions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;

-- ── 4. Permissive policies (replace with workspace-scoped rules when auth lands)

CREATE POLICY "kitchen_functions_allow_all"  ON kitchen_functions  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "staff_members_allow_all"      ON staff_members      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "prep_items_allow_all"         ON prep_items         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "broadcast_messages_allow_all" ON broadcast_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "connector_configs_allow_all"  ON connector_configs  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sync_records_allow_all"       ON sync_records       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "webhook_events_allow_all"     ON webhook_events     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workspaces_allow_all"         ON workspaces         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "profiles_allow_all"           ON profiles           FOR ALL USING (true) WITH CHECK (true);

-- ── 5. Auth bridge: profiles.id → auth.users(id) ────────────────────────────
-- Drizzle cannot reference the auth schema directly; this constraint is
-- applied here after table creation.  Safe to run multiple times (IF NOT EXISTS).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
      AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- ── Done ─────────────────────────────────────────────────────────────────────
-- TODO (when auth is enabled):
--   - Replace "allow all" policies with auth.uid()-scoped policies
--   - Add workspace_id checks to multi-tenant policies
--   - Add a trigger to auto-create a profile row on auth.users insert
