-- ============================================================
-- Migration 004 — Support suppression de réservations
-- À appliquer via : Supabase Dashboard › SQL Editor
-- ============================================================
--
-- CONTEXTE : Les FK payments.reservation_id et deposits.reservation_id
-- ont été créées avec ON DELETE RESTRICT, bloquant la suppression
-- directe d'une réservation depuis le dashboard admin.
--
-- SOLUTION : Passer ces FK en ON DELETE CASCADE.
-- vehicle_unavailability et documents sont déjà correctement configurés :
--   - vehicle_unavailability.reservation_id → ON DELETE CASCADE (auto-suppression)
--   - documents.reservation_id              → ON DELETE SET NULL (conservation RGPD)
-- ============================================================

-- ── Payments ────────────────────────────────────────────────
ALTER TABLE payments
  DROP CONSTRAINT payments_reservation_id_fkey;

ALTER TABLE payments
  ADD CONSTRAINT payments_reservation_id_fkey
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;

-- ── Deposits ────────────────────────────────────────────────
ALTER TABLE deposits
  DROP CONSTRAINT deposits_reservation_id_fkey;

ALTER TABLE deposits
  ADD CONSTRAINT deposits_reservation_id_fkey
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
