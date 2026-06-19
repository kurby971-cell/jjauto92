-- ============================================================
-- Migration 002 — Remplacement des véhicules de démo par les vrais
-- À appliquer via : Supabase Dashboard › SQL Editor
-- ============================================================

-- 1. Ajoute la catégorie "sport" à l'enum (Polo GTI)
ALTER TYPE vehicle_category ADD VALUE IF NOT EXISTS 'sport';

-- 2. Ajoute la colonne weekend_rate (tarif 2 jours consécutifs week-end)
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS weekend_rate NUMERIC(10,2);

COMMENT ON COLUMN vehicles.weekend_rate
  IS 'Tarif week-end (2 jours consécutifs). Null = calcul sur daily_rate × 2.';

-- 3. Supprime les véhicules de démonstration
DELETE FROM vehicles
WHERE slug IN (
  'volkswagen-golf-8-2023',
  'peugeot-3008-2022',
  'mercedes-classe-a-2023',
  'renault-zoe-2023'
);

-- 4. Insère les vrais véhicules
--    license_plate : à mettre à jour avec les vraies plaques d'immatriculation
INSERT INTO vehicles (
  brand, model, year, license_plate, color,
  category, fuel_type, transmission, seats, doors,
  daily_rate, weekend_rate, weekly_rate, monthly_rate,
  deposit_amount, mileage_included_per_day, excess_mileage_rate,
  status, current_mileage, is_active,
  photos, features, description, slug, location
) VALUES
(
  'Volkswagen', 'Polo GTI DSG7', 2024, 'XX-000-XX', 'Gris Ascot',
  'sport', 'essence', 'automatique', 5, 5,
  130.00, 300.00, 650.00, 1900.00,
  2000.00, 200, 0.30,
  'disponible', 0, true,
  '[]'::jsonb,
  '["DSG7 double embrayage", "TSI 207 ch", "Digital Cockpit 10.25\"", "App-Connect (CarPlay/Android Auto)", "Sièges sport GTI Clark", "Jantes 18\" Aberdeen", "Phares LED Matrix", "Régulateur adaptatif", "Climatisation auto bi-zone", "Freinage d''urgence AEB"]'::jsonb,
  'La Volkswagen Polo GTI DSG7 2024 allie performances sportives et confort quotidien. Moteur TSI 207 ch, boîte DSG7 à double embrayage et finition GTI exclusive pour une conduite plaisir sans compromis.',
  'polo-gti-dsg7', 'Nanterre'
),
(
  'Renault', 'Clio 6 Alpine Hybride E-Tech', 2025, 'XX-001-XX', 'Bleu Alpine',
  'premium', 'hybride', 'automatique', 5, 5,
  85.00, 220.00, 480.00, 1600.00,
  1500.00, 200, 0.25,
  'disponible', 0, true,
  '[]'::jsonb,
  '["Full Hybrid E-Tech 145 ch", "Boîte auto multi-modes crabots", "OpenR Link 10\" Google intégré", "Navigation Google embarquée", "Sièges baquets sport Alpine", "Charge sans fil", "Vue 360° caméras", "Régulateur adaptatif", "Climatisation auto", "Pack Alpine exclusif"]'::jsonb,
  'La Renault Clio 6 Alpine Hybride E-Tech 2025 incarne l''élégance sportive à la française. Technologie hybride Full E-Tech, finition Alpine exclusive et équipements haut de gamme pour une conduite efficiente et raffinée.',
  'clio-alpine-e-tech', 'Nanterre'
);
