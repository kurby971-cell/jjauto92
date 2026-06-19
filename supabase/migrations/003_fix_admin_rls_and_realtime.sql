-- ============================================================
-- Migration 003 — Fix admin RLS policies + enable Realtime
-- À appliquer via : Supabase Dashboard › SQL Editor
-- ============================================================
--
-- PROBLÈME : toutes les policies *_admin_all utilisaient
--   auth.jwt() ->> 'role'
-- qui retourne toujours 'authenticated' (rôle PostgreSQL Supabase),
-- jamais 'admin'. Le rôle applicatif est dans app_metadata :
--   auth.jwt() -> 'app_metadata' ->> 'role'
--
-- CONSÉQUENCE : le client browser admin ne passait jamais les RLS,
-- bloquant notamment les souscriptions Supabase Realtime (les events
-- postgres_changes sont filtrés par SELECT RLS côté serveur Realtime).
-- ============================================================

-- ── Vehicles ────────────────────────────────────────────────
DROP POLICY IF EXISTS "vehicles_admin_all" ON vehicles;
CREATE POLICY "vehicles_admin_all" ON vehicles
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Customers ───────────────────────────────────────────────
DROP POLICY IF EXISTS "customers_admin_all" ON customers;
CREATE POLICY "customers_admin_all" ON customers
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Reservations ────────────────────────────────────────────
DROP POLICY IF EXISTS "reservations_admin_all" ON reservations;
CREATE POLICY "reservations_admin_all" ON reservations
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Payments ────────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_admin_all" ON payments;
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Deposits ────────────────────────────────────────────────
DROP POLICY IF EXISTS "deposits_admin_all" ON deposits;
CREATE POLICY "deposits_admin_all" ON deposits
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Documents ───────────────────────────────────────────────
DROP POLICY IF EXISTS "documents_admin_all" ON documents;
CREATE POLICY "documents_admin_all" ON documents
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Vehicle Unavailability ───────────────────────────────────
DROP POLICY IF EXISTS "unavailability_admin_all" ON vehicle_unavailability;
CREATE POLICY "unavailability_admin_all" ON vehicle_unavailability
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Rental Options ──────────────────────────────────────────
DROP POLICY IF EXISTS "rental_options_admin_all" ON rental_options;
CREATE POLICY "rental_options_admin_all" ON rental_options
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Pricing Rules ───────────────────────────────────────────
DROP POLICY IF EXISTS "pricing_rules_admin_all" ON pricing_rules;
CREATE POLICY "pricing_rules_admin_all" ON pricing_rules
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Supabase Realtime ───────────────────────────────────────
-- Active la réplication CDC sur reservations pour que
-- postgres_changes soit livré au client browser admin.
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
