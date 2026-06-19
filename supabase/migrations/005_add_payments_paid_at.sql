-- ============================================================
-- MIGRATION 005 — Ajoute payments.paid_at
--
-- CONTEXTE : Le webhook Stripe payment_intent.succeeded écrit
-- paid_at lors de la confirmation d'un paiement. Cette colonne
-- était absente du schéma initial, ce qui faisait échouer
-- silencieusement le UPDATE (status 'succeeded' jamais persisté).
-- ============================================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN payments.paid_at IS
  'Date/heure à laquelle le paiement a été confirmé par Stripe (payment_intent.succeeded).';
