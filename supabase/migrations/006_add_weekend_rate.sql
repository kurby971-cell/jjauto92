-- ============================================================
-- MIGRATION 006 — Ajoute vehicles.weekend_rate
--
-- CONTEXTE : La migration 002 devait ajouter cette colonne via
-- l'API pg-meta (/pg/query), mais cet endpoint renvoie 404 sur ce
-- projet. Le script d'insertion a donc silencieusement omis
-- weekend_rate, laissant le code (reservation/create, lib/types)
-- référencer une colonne qui n'existe pas en base — erreur
-- "column vehicles.weekend_rate does not exist" à la réservation.
-- ============================================================

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS weekend_rate NUMERIC(10,2);

COMMENT ON COLUMN vehicles.weekend_rate
  IS 'Tarif week-end (2 jours consécutifs). Null = calcul sur daily_rate × 2.';

-- Backfill des tarifs week-end pour les véhicules réels (migration 002)
UPDATE vehicles SET weekend_rate = 300.00 WHERE slug = 'polo-gti-dsg7';
UPDATE vehicles SET weekend_rate = 220.00 WHERE slug = 'clio-alpine-e-tech';
