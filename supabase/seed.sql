-- ============================================================
-- JJAUTO92 - Données de démonstration (seed)
-- À exécuter APRÈS schema.sql
-- ============================================================

-- ============================================================
-- VÉHICULES DE DÉMONSTRATION
-- ============================================================

INSERT INTO vehicles (
  brand, model, year, license_plate, vin, color,
  category, fuel_type, transmission, seats, doors,
  daily_rate, deposit_amount, mileage_included_per_day, excess_mileage_rate,
  status, current_mileage, is_active,
  insurance_policy_number, technical_inspection_date,
  photos, features, description, slug, location
) VALUES
(
  'Volkswagen', 'Golf 8', 2023, 'AA-123-BB', 'WVW123456789012345', 'Gris Platine',
  'compact', 'essence', 'manuelle', 5, 5,
  65.00, 800.00, 250, 0.25,
  'disponible', 28450, true,
  'POL-VW-2023-001', '2025-10-15',
  '[{"url": "/vehicles/golf8-1.jpg", "label": "Vue avant", "is_primary": true}, {"url": "/vehicles/golf8-2.jpg", "label": "Intérieur"}]',
  '["Climatisation automatique", "GPS intégré", "Bluetooth", "Caméra de recul", "Régulateur de vitesse"]',
  'La Volkswagen Golf 8 est le choix idéal pour vos déplacements en Île-de-France. Confortable et économique.',
  'volkswagen-golf-8-2023', 'Nanterre'
),
(
  'Peugeot', '3008', 2022, 'CC-456-DD', 'VF3CC45678901234', 'Blanc Nacré',
  'suv', 'diesel', 'automatique', 5, 5,
  95.00, 1000.00, 300, 0.30,
  'disponible', 41200, true,
  'POL-PG-2022-001', '2024-12-20',
  '[{"url": "/vehicles/3008-1.jpg", "label": "Vue avant", "is_primary": true}, {"url": "/vehicles/3008-2.jpg", "label": "Coffre"}]',
  '["Climatisation tri-zone", "GPS 3D connected", "Bluetooth", "Caméra 360°", "Toit panoramique", "Sièges chauffants", "Régulateur adaptatif"]',
  'Le Peugeot 3008 SUV alliant espace, confort et technologie pour vos voyages en famille ou en affaires.',
  'peugeot-3008-2022', 'Nanterre'
),
(
  'Mercedes-Benz', 'Classe A', 2023, 'EE-789-FF', 'WDD177012345678', 'Noir Obsidienne',
  'premium', 'essence', 'automatique', 5, 5,
  120.00, 1500.00, 200, 0.40,
  'disponible', 15300, true,
  'POL-MB-2023-001', '2026-03-10',
  '[{"url": "/vehicles/classea-1.jpg", "label": "Vue avant", "is_primary": true}, {"url": "/vehicles/classea-2.jpg", "label": "Tableau de bord MBUX"}]',
  '["Climatisation automatique", "MBUX Navigation", "Bluetooth", "Ambient Light 64 couleurs", "Sièges sport cuir", "Keyless Go", "Assistance au stationnement"]',
  'La Mercedes Classe A incarne l''élégance et la technologie premium. MBUX, finitions haut de gamme et conduite plaisir.',
  'mercedes-classe-a-2023', 'Nanterre'
),
(
  'Renault', 'Zoé', 2023, 'GG-012-HH', 'VF1AGVYB123456789', 'Bleu Iron',
  'economy', 'electrique', 'automatique', 5, 5,
  55.00, 500.00, 200, 0.20,
  'disponible', 22100, true,
  'POL-RN-2023-001', '2026-01-05',
  '[{"url": "/vehicles/zoe-1.jpg", "label": "Vue avant", "is_primary": true}]',
  '["Climatisation", "GPS", "Bluetooth", "Charge rapide DC 50kW", "Autonomie 395 km WLTP"]',
  'La Renault Zoé 100% électrique pour une mobilité écoresponsable. Autonomie 395 km, charge rapide incluse.',
  'renault-zoe-2023', 'Nanterre'
);

-- ============================================================
-- RÈGLE TARIFAIRE: Supplément weekend
-- ============================================================

INSERT INTO pricing_rules (name, category, multiplier, is_active, description) VALUES
  ('Tarif Weekend', NULL, 1.15, true, 'Supplément de 15% pour les locations commençant le vendredi ou samedi');

INSERT INTO pricing_rules (name, category, start_date, end_date, multiplier, is_active, description) VALUES
  ('Haute Saison Été 2026', NULL, '2026-07-01', '2026-08-31', 1.25, true,
   'Supplément de 25% en haute saison estivale');
