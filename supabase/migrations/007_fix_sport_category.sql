-- ============================================================
-- MIGRATION 007 — Ajoute 'sport' à l'enum vehicle_category
--
-- CONTEXTE : La migration 002 devait ajouter cette valeur via
-- l'API pg-meta (/pg/query, 404 sur ce projet — même cause que
-- la migration 006). Le script d'insertion est donc retombé sur
-- category='premium' pour la Polo GTI, alors que lib/types/index.ts
-- déclare déjà 'sport' dans VehicleCategory — mismatch type/DB.
--
-- IMPORTANT : ALTER TYPE ... ADD VALUE ne peut pas être utilisé
-- dans la même transaction que celle qui l'a créé (restriction
-- Postgres). Le COMMIT intermédiaire est nécessaire — ne pas le
-- retirer, sinon l'UPDATE échoue avec "unsafe use of new value".
-- ============================================================

ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'sport';

COMMIT;

UPDATE vehicles SET category = 'sport' WHERE slug = 'polo-gti-dsg7';
