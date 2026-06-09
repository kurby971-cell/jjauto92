-- ============================================================
-- JJAUTO92 - Schéma complet Supabase
-- J & J Automobiles - 1 Allée de Lorraine, 92000 Nanterre
-- Location de véhicules premium
-- ============================================================

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- TYPES ENUM
-- ============================================================

CREATE TYPE vehicle_category AS ENUM (
  'economy',
  'compact',
  'standard',
  'suv',
  'premium',
  'luxury',
  'utility'
);

CREATE TYPE fuel_type AS ENUM (
  'essence',
  'diesel',
  'electrique',
  'hybride',
  'hybride_rechargeable'
);

CREATE TYPE transmission_type AS ENUM (
  'manuelle',
  'automatique'
);

CREATE TYPE vehicle_status AS ENUM (
  'disponible',
  'en_location',
  'en_maintenance',
  'hors_service'
);

CREATE TYPE reservation_status AS ENUM (
  'pending',      -- En attente de confirmation / paiement
  'confirmed',    -- Confirmée et payée
  'active',       -- Véhicule remis au client
  'completed',    -- Véhicule restitué, contrat clôturé
  'cancelled',    -- Annulée
  'no_show'       -- Client ne s'est pas présenté
);

CREATE TYPE reservation_source AS ENUM (
  'web',
  'telephone',
  'admin',
  'partenaire'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded'
);

CREATE TYPE payment_type AS ENUM (
  'reservation',     -- Paiement de la location
  'supplement',      -- Supplément (km, carburant, dommage...)
  'remboursement',   -- Remboursement au client
  'penalite'         -- Pénalité (annulation tardive, no-show...)
);

CREATE TYPE deposit_status AS ENUM (
  'pending',              -- En attente d'autorisation
  'authorized',           -- Pré-autorisée sur la carte
  'captured',             -- Prélevée (dommages)
  'partially_captured',   -- Partiellement prélevée
  'released',             -- Libérée
  'expired'               -- Pré-autorisation expirée (7j Stripe max)
);

CREATE TYPE document_type AS ENUM (
  'permis_recto',
  'permis_verso',
  'cni_recto',
  'cni_verso',
  'passeport',
  'justificatif_domicile',
  'contrat_location',
  'etat_lieux_depart',
  'etat_lieux_retour',
  'facture',
  'proces_verbal',
  'autre'
);

CREATE TYPE unavailability_reason AS ENUM (
  'reservation',
  'maintenance',
  'reparation',
  'controle_technique',
  'nettoyage',
  'accident',
  'autre'
);

CREATE TYPE fuel_level AS ENUM (
  'vide',
  'quart',
  'demi',
  'trois_quarts',
  'plein'
);


-- ============================================================
-- FONCTION UTILITAIRE: Mise à jour automatique de updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLE: vehicles
-- Parc automobile - évolutif de 2 à 50 véhicules
-- ============================================================

CREATE TABLE vehicles (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identification
  brand                       TEXT NOT NULL,
  model                       TEXT NOT NULL,
  year                        SMALLINT NOT NULL
                                CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM NOW())::SMALLINT + 1),
  license_plate               TEXT NOT NULL UNIQUE,
  vin                         TEXT UNIQUE,  -- Numéro de châssis (17 caractères)
  color                       TEXT NOT NULL,

  -- Classification
  category                    vehicle_category NOT NULL,
  fuel_type                   fuel_type NOT NULL,
  transmission                transmission_type NOT NULL DEFAULT 'automatique',
  seats                       SMALLINT NOT NULL DEFAULT 5 CHECK (seats BETWEEN 2 AND 9),
  doors                       SMALLINT NOT NULL DEFAULT 5 CHECK (doors BETWEEN 2 AND 5),

  -- Tarification
  daily_rate                  NUMERIC(10,2) NOT NULL CHECK (daily_rate > 0),
  deposit_amount              NUMERIC(10,2) NOT NULL DEFAULT 500.00 CHECK (deposit_amount >= 0),
  mileage_included_per_day    INTEGER NOT NULL DEFAULT 200 CHECK (mileage_included_per_day >= 0),
  excess_mileage_rate         NUMERIC(10,2) NOT NULL DEFAULT 0.25 CHECK (excess_mileage_rate >= 0),

  -- État opérationnel
  status                      vehicle_status NOT NULL DEFAULT 'disponible',
  current_mileage             INTEGER NOT NULL DEFAULT 0 CHECK (current_mileage >= 0),
  is_active                   BOOLEAN NOT NULL DEFAULT true,

  -- Documents réglementaires
  insurance_policy_number     TEXT,
  insurance_expiry            DATE,
  technical_inspection_date   DATE,  -- Date du prochain CT
  registration_document_url   TEXT,  -- Carte grise (Supabase Storage)

  -- Médias
  photos                      JSONB NOT NULL DEFAULT '[]',
  -- ex: [{"url": "...", "label": "Vue avant", "is_primary": true}]

  -- Équipements inclus
  features                    JSONB NOT NULL DEFAULT '[]',
  -- ex: ["Climatisation", "GPS intégré", "Bluetooth", "Caméra de recul"]

  -- SEO / Affichage
  description                 TEXT,
  slug                        TEXT UNIQUE,  -- ex: "peugeot-308-2023"

  -- Localisation
  location                    TEXT NOT NULL DEFAULT 'Nanterre'
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_active_status ON vehicles(is_active, status);

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE vehicles IS 'Parc automobile JJAUTO92 - évolutif 2 à 50 véhicules';
COMMENT ON COLUMN vehicles.photos IS 'Array JSON: [{url, label, is_primary}]';
COMMENT ON COLUMN vehicles.features IS 'Array JSON des équipements inclus';
COMMENT ON COLUMN vehicles.deposit_amount IS 'Montant de la caution en euros';


-- ============================================================
-- TABLE: customers
-- Clients - données personnelles soumises au RGPD
-- ============================================================

CREATE TABLE customers (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Lien Supabase Auth (NULL si créé par admin sans compte)
  auth_user_id                  UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Identité
  first_name                    TEXT NOT NULL,
  last_name                     TEXT NOT NULL,
  email                         TEXT NOT NULL UNIQUE,
  phone                         TEXT NOT NULL,
  date_of_birth                 DATE,

  -- Adresse
  address_street                TEXT,
  address_city                  TEXT,
  address_postal_code           TEXT,
  address_country               TEXT NOT NULL DEFAULT 'France',

  -- Permis de conduire
  driving_license_number        TEXT,
  driving_license_expiry        DATE,
  driving_license_country       TEXT DEFAULT 'France',
  driving_license_category      TEXT DEFAULT 'B',  -- A, B, BE, C...

  -- Pièce d'identité
  id_document_type              TEXT CHECK (id_document_type IN ('cni', 'passeport', 'titre_sejour')),
  id_document_number            TEXT,
  id_document_expiry            DATE,

  -- Intégration Stripe
  stripe_customer_id            TEXT UNIQUE,

  -- Vérification KYC
  is_verified                   BOOLEAN NOT NULL DEFAULT false,
  verified_at                   TIMESTAMPTZ,
  verified_by                   UUID,  -- auth.users id de l'admin

  -- Gestion des risques
  is_blacklisted                BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason              TEXT,
  blacklisted_at                TIMESTAMPTZ,
  blacklisted_by                UUID,

  -- RGPD - Consentements et droits
  rgpd_consent_date             TIMESTAMPTZ,   -- Consentement traitement données
  marketing_consent             BOOLEAN NOT NULL DEFAULT false,
  marketing_consent_date        TIMESTAMPTZ,
  data_deletion_requested       BOOLEAN NOT NULL DEFAULT false,
  data_deletion_requested_at    TIMESTAMPTZ,
  data_deletion_scheduled_at    TIMESTAMPTZ,   -- Date de suppression planifiée

  -- Notes internes (non communiquées au client)
  admin_notes                   TEXT,

  -- Statistiques dénormalisées (mise à jour par trigger)
  total_reservations            INTEGER NOT NULL DEFAULT 0 CHECK (total_reservations >= 0),
  total_spent                   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0)
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customers_stripe_customer_id ON customers(stripe_customer_id);
CREATE INDEX idx_customers_is_blacklisted ON customers(is_blacklisted);
CREATE INDEX idx_customers_driving_license_number ON customers(driving_license_number);
CREATE INDEX idx_customers_is_verified ON customers(is_verified);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE customers IS 'Clients JJAUTO92 - données personnelles soumises au RGPD';
COMMENT ON COLUMN customers.auth_user_id IS 'Lien vers auth.users Supabase - NULL si création admin';
COMMENT ON COLUMN customers.data_deletion_scheduled_at IS 'Date de suppression RGPD planifiée après demande';


-- ============================================================
-- SÉQUENCE ET FONCTION: Numéro de réservation lisible
-- Format: JJ-2026-0001
-- ============================================================

CREATE SEQUENCE reservation_number_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'JJ-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
         LPAD(nextval('reservation_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLE: reservations
-- Cœur du système - gestion des locations
-- ============================================================

CREATE TABLE reservations (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Référence lisible unique
  reservation_number        TEXT NOT NULL UNIQUE DEFAULT generate_reservation_number(),

  -- Relations
  customer_id               UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id                UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,

  -- Période de location
  start_date                DATE NOT NULL,
  end_date                  DATE NOT NULL,
  pickup_time               TIME NOT NULL DEFAULT '09:00',
  return_time               TIME NOT NULL DEFAULT '18:00',

  -- Durée calculée automatiquement
  total_days                INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,

  -- Statut et origine
  status                    reservation_status NOT NULL DEFAULT 'pending',
  source                    reservation_source NOT NULL DEFAULT 'web',

  -- Tarification (snapshot au moment de la réservation)
  daily_rate_snapshot       NUMERIC(10,2) NOT NULL,   -- Tarif figé à la date de résa
  base_amount               NUMERIC(10,2) NOT NULL CHECK (base_amount >= 0),
  options_amount            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (options_amount >= 0),
  discount_amount           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  discount_reason           TEXT,
  total_amount              NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  deposit_amount            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),

  -- Options souscrites (référence aux codes de rental_options)
  options                   JSONB NOT NULL DEFAULT '{}',
  -- ex: {"assurance_premium": true, "conducteur_supplementaire": 1, "gps": true, "siege_bebe": 1}

  -- Lieux de prise en charge et restitution
  pickup_location           TEXT NOT NULL DEFAULT '1 Allée de Lorraine, 92000 Nanterre',
  return_location           TEXT NOT NULL DEFAULT '1 Allée de Lorraine, 92000 Nanterre',

  -- État au départ (rempli lors de la remise des clés)
  mileage_start             INTEGER CHECK (mileage_start >= 0),
  fuel_level_start          fuel_level,
  damage_report_start       JSONB,
  -- ex: {"photos": ["url1", "url2"], "description": "Égratignure aile avant droite", "signed_at": "..."}

  -- État au retour (rempli lors de la restitution)
  mileage_end               INTEGER CHECK (mileage_end >= 0),
  fuel_level_end            fuel_level,
  damage_report_end         JSONB,
  excess_mileage_charge     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (excess_mileage_charge >= 0),
  fuel_charge               NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (fuel_charge >= 0),
  damage_charge             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (damage_charge >= 0),

  -- Gestion annulation
  cancelled_at              TIMESTAMPTZ,
  cancellation_reason       TEXT,
  cancelled_by              UUID,  -- auth.users id (client ou admin)
  cancellation_fee          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cancellation_fee >= 0),

  -- Traçabilité admin
  confirmed_at              TIMESTAMPTZ,
  confirmed_by              UUID,
  completed_at              TIMESTAMPTZ,
  completed_by              UUID,
  admin_notes               TEXT,

  -- Contraintes métier
  CONSTRAINT chk_dates CHECK (end_date > start_date),
  CONSTRAINT chk_mileage CHECK (
    mileage_end IS NULL OR mileage_start IS NULL OR mileage_end >= mileage_start
  ),
  CONSTRAINT chk_total_amount CHECK (
    total_amount = base_amount + options_amount - discount_amount
  )
);

CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_vehicle_id ON reservations(vehicle_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_date ON reservations(start_date);
CREATE INDEX idx_reservations_end_date ON reservations(end_date);
CREATE INDEX idx_reservations_number ON reservations(reservation_number);
-- Index composite pour les requêtes de disponibilité (critique pour les perfs)
CREATE INDEX idx_reservations_availability ON reservations(vehicle_id, status, start_date, end_date);
-- Index pour le dashboard admin (réservations actives et à venir)
CREATE INDEX idx_reservations_active ON reservations(status, start_date)
  WHERE status IN ('pending', 'confirmed', 'active');

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE reservations IS 'Réservations de véhicules JJAUTO92';
COMMENT ON COLUMN reservations.reservation_number IS 'Référence lisible format JJ-YYYY-NNNN';
COMMENT ON COLUMN reservations.daily_rate_snapshot IS 'Tarif journalier figé au moment de la réservation';
COMMENT ON COLUMN reservations.options IS 'JSON des options souscrites avec quantités';
COMMENT ON COLUMN reservations.damage_report_start IS 'État des lieux départ: {photos, description, signed_at}';
COMMENT ON COLUMN reservations.damage_report_end IS 'État des lieux retour: {photos, description, signed_at}';


-- ============================================================
-- TABLE: payments
-- Paiements Stripe - historique complet des transactions
-- ============================================================

CREATE TABLE payments (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  reservation_id              UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  customer_id                 UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

  -- Identifiants Stripe
  stripe_payment_intent_id    TEXT UNIQUE,
  stripe_charge_id            TEXT UNIQUE,
  stripe_invoice_id           TEXT,

  -- Montants
  amount                      NUMERIC(10,2) NOT NULL CHECK (amount != 0),
  currency                    TEXT NOT NULL DEFAULT 'eur' CHECK (LENGTH(currency) = 3),

  -- Classification
  status                      payment_status NOT NULL DEFAULT 'pending',
  type                        payment_type NOT NULL DEFAULT 'reservation',

  -- Remboursement
  refund_amount               NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
  refund_reason               TEXT,
  refunded_at                 TIMESTAMPTZ,
  stripe_refund_id            TEXT,

  -- Informations complémentaires
  description                 TEXT,
  failure_reason              TEXT,   -- Message d'erreur Stripe en cas d'échec
  metadata                    JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT chk_refund_lte_amount CHECK (refund_amount <= ABS(amount))
);

CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_type ON payments(type);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE payments IS 'Transactions Stripe - paiements, suppléments et remboursements';
COMMENT ON COLUMN payments.amount IS 'Montant en euros - négatif pour les remboursements';
COMMENT ON COLUMN payments.metadata IS 'Métadonnées Stripe ou internes additionnelles';


-- ============================================================
-- TABLE: deposits
-- Cautions - pré-autorisations Stripe
-- ============================================================

CREATE TABLE deposits (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations (une caution par réservation)
  reservation_id              UUID NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE RESTRICT,
  customer_id                 UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

  -- Identifiants Stripe
  stripe_payment_intent_id    TEXT UNIQUE,
  stripe_setup_intent_id      TEXT UNIQUE,      -- Pour la pré-autorisation sans débit
  stripe_payment_method_id    TEXT,             -- Carte enregistrée pour la caution

  -- Montants
  amount                      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency                    TEXT NOT NULL DEFAULT 'eur',
  captured_amount             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (captured_amount >= 0),

  -- Statut
  status                      deposit_status NOT NULL DEFAULT 'pending',

  -- Pré-autorisation
  authorized_at               TIMESTAMPTZ,
  -- Les pré-autorisations Stripe expirent après 7 jours maximum
  authorization_expiry        TIMESTAMPTZ,

  -- Capture (si dommages ou extras constatés au retour)
  captured_at                 TIMESTAMPTZ,
  capture_reason              TEXT,
  captured_by                 UUID,  -- auth.users id de l'admin

  -- Libération de la caution
  released_at                 TIMESTAMPTZ,
  released_by                 UUID,
  release_notes               TEXT,

  CONSTRAINT chk_captured_lte_amount CHECK (captured_amount <= amount)
);

CREATE INDEX idx_deposits_reservation_id ON deposits(reservation_id);
CREATE INDEX idx_deposits_customer_id ON deposits(customer_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_stripe_payment_intent_id ON deposits(stripe_payment_intent_id);
-- Index pour identifier les pré-autorisations qui approchent de l'expiration
CREATE INDEX idx_deposits_expiry ON deposits(authorization_expiry)
  WHERE status = 'authorized';

CREATE TRIGGER deposits_updated_at
  BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE deposits IS 'Cautions via pré-autorisation Stripe';
COMMENT ON COLUMN deposits.authorization_expiry IS 'Expiration de la pré-autorisation Stripe (7j max)';
COMMENT ON COLUMN deposits.stripe_setup_intent_id IS 'SetupIntent pour enregistrer la carte sans débit immédiat';


-- ============================================================
-- TABLE: documents
-- Documents clients - contraintes RGPD appliquées
-- ============================================================

CREATE TABLE documents (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  customer_id                 UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  reservation_id              UUID REFERENCES reservations(id) ON DELETE SET NULL,

  -- Classification du document
  type                        document_type NOT NULL,

  -- Fichier (stocké dans Supabase Storage)
  file_path                   TEXT NOT NULL,    -- Chemin dans le bucket Storage
  file_name                   TEXT NOT NULL,    -- Nom original du fichier
  file_size                   INTEGER CHECK (file_size > 0),  -- Taille en octets
  mime_type                   TEXT,             -- ex: image/jpeg, application/pdf

  -- Vérification par l'admin
  uploaded_by                 TEXT NOT NULL DEFAULT 'customer'
                                CHECK (uploaded_by IN ('customer', 'admin')),
  is_verified                 BOOLEAN NOT NULL DEFAULT false,
  verified_at                 TIMESTAMPTZ,
  verified_by                 UUID,  -- auth.users id de l'admin

  -- Validité du document
  document_expiry             DATE,  -- Date d'expiration (permis, CNI, passeport...)

  -- RGPD - Conservation légale
  -- Obligation : 3 ans après la fin du contrat (art. L110-4 Code de commerce)
  rgpd_retention_until        TIMESTAMPTZ,
  is_deleted_rgpd             BOOLEAN NOT NULL DEFAULT false,
  rgpd_deleted_at             TIMESTAMPTZ,

  -- Notes internes
  notes                       TEXT
);

CREATE INDEX idx_documents_customer_id ON documents(customer_id);
CREATE INDEX idx_documents_reservation_id ON documents(reservation_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_is_verified ON documents(is_verified);
-- Index RGPD: identifier les documents à supprimer
CREATE INDEX idx_documents_rgpd_retention ON documents(rgpd_retention_until)
  WHERE is_deleted_rgpd = false;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE documents IS 'Documents clients - durée de conservation RGPD: 3 ans après fin contrat';
COMMENT ON COLUMN documents.file_path IS 'Chemin dans le bucket Supabase Storage';
COMMENT ON COLUMN documents.rgpd_retention_until IS 'Date limite légale de conservation (3 ans après fin contrat)';


-- ============================================================
-- TABLE: vehicle_unavailability
-- Calendrier des indisponibilités véhicules
-- ============================================================

CREATE TABLE vehicle_unavailability (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  vehicle_id                UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  reservation_id            UUID REFERENCES reservations(id) ON DELETE CASCADE,
  -- NULL si indisponibilité manuelle (maintenance, CT, etc.)

  -- Période
  start_date                DATE NOT NULL,
  end_date                  DATE NOT NULL,

  -- Raison
  reason                    unavailability_reason NOT NULL DEFAULT 'autre',
  description               TEXT,  -- Détail libre (ex: "Vidange + révision 30 000 km")

  -- Traçabilité
  created_by                UUID,  -- auth.users id de l'admin (NULL si auto via trigger)

  CONSTRAINT chk_unavailability_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_unavailability_vehicle_id ON vehicle_unavailability(vehicle_id);
CREATE INDEX idx_unavailability_reservation_id ON vehicle_unavailability(reservation_id);
-- Index composite critique pour les requêtes de disponibilité
CREATE INDEX idx_unavailability_dates ON vehicle_unavailability(vehicle_id, start_date, end_date);
-- Index pour le calendrier d'indisponibilités (CURRENT_DATE interdit dans un prédicat d'index Supabase)
CREATE INDEX idx_unavailability_future ON vehicle_unavailability(start_date, end_date);

CREATE TRIGGER vehicle_unavailability_updated_at
  BEFORE UPDATE ON vehicle_unavailability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE vehicle_unavailability IS 'Calendrier des indisponibilités - alimenté manuellement et par trigger';
COMMENT ON COLUMN vehicle_unavailability.reservation_id IS 'NULL pour indisponibilités manuelles (maintenance, CT...)';


-- ============================================================
-- TABLE: rental_options
-- Catalogue des options et services additionnels
-- ============================================================

CREATE TABLE rental_options (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  code                      TEXT NOT NULL UNIQUE,   -- Clé utilisée dans reservations.options JSON
  name                      TEXT NOT NULL,
  description               TEXT,
  price_per_day             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_per_day >= 0),
  price_fixed               NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_fixed >= 0),
  is_active                 BOOLEAN NOT NULL DEFAULT true,
  sort_order                INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_rental_options_is_active ON rental_options(is_active);
CREATE INDEX idx_rental_options_sort ON rental_options(sort_order) WHERE is_active = true;

CREATE TRIGGER rental_options_updated_at
  BEFORE UPDATE ON rental_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE rental_options IS 'Catalogue des options - le code correspond aux clés dans reservations.options';


-- ============================================================
-- TABLE: pricing_rules
-- Règles de surcharge tarifaire (haute saison, weekends...)
-- ============================================================

CREATE TABLE pricing_rules (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name                      TEXT NOT NULL,

  -- Applicabilité (NULL = tous les véhicules / toutes les catégories)
  vehicle_id                UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  category                  vehicle_category,

  -- Période de validité
  start_date                DATE,
  end_date                  DATE,

  -- Coefficients
  multiplier                NUMERIC(4,2) NOT NULL DEFAULT 1.0 CHECK (multiplier > 0),
  -- ex: 1.20 = +20% en haute saison, 0.85 = -15% promotion

  -- Durée minimale de location
  min_days                  INTEGER DEFAULT 1 CHECK (min_days >= 1),

  is_active                 BOOLEAN NOT NULL DEFAULT true,
  description               TEXT,

  CONSTRAINT chk_pricing_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_pricing_rules_is_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date) WHERE is_active = true;

CREATE TRIGGER pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- FONCTION: Vérifier la disponibilité d'un véhicule
-- Retourne TRUE si le véhicule est disponible sur la période
-- Utilisée avant toute création ou modification de réservation
-- ============================================================

CREATE OR REPLACE FUNCTION is_vehicle_available(
  p_vehicle_id              UUID,
  p_start_date              DATE,
  p_end_date                DATE,
  p_exclude_reservation_id  UUID DEFAULT NULL  -- Pour exclure la résa courante lors d'une modif
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Vérifier les conflits avec des réservations existantes
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE vehicle_id = p_vehicle_id
      AND status NOT IN ('cancelled', 'no_show')
      AND id IS DISTINCT FROM p_exclude_reservation_id
      AND start_date < p_end_date    -- Chevauchement: start < end adverse ET end > start adverse
      AND end_date > p_start_date
  ) THEN
    RETURN false;
  END IF;

  -- 2. Vérifier les indisponibilités manuelles (maintenance, CT, etc.)
  IF EXISTS (
    SELECT 1 FROM vehicle_unavailability
    WHERE vehicle_id = p_vehicle_id
      AND (reservation_id IS NULL OR reservation_id IS DISTINCT FROM p_exclude_reservation_id)
      AND start_date < p_end_date
      AND end_date > p_start_date
  ) THEN
    RETURN false;
  END IF;

  -- 3. Vérifier que le véhicule est actif
  IF NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE id = p_vehicle_id AND is_active = true AND status != 'hors_service'
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION is_vehicle_available IS
  'Vérifie disponibilité véhicule sur une période - utilisée avant création/modif de réservation';


-- ============================================================
-- TRIGGER: Synchronisation réservation → vehicle_unavailability
-- Maintient automatiquement le calendrier d'indisponibilités
-- ============================================================

CREATE OR REPLACE FUNCTION sync_reservation_to_unavailability()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer l'entrée d'indisponibilité liée à cette réservation
  DELETE FROM vehicle_unavailability WHERE reservation_id = NEW.id;

  -- Recréer uniquement si la réservation est active (confirmed ou active)
  IF NEW.status IN ('confirmed', 'active') THEN
    INSERT INTO vehicle_unavailability (vehicle_id, reservation_id, start_date, end_date, reason)
    VALUES (NEW.vehicle_id, NEW.id, NEW.start_date, NEW.end_date, 'reservation');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservation_sync_unavailability
  AFTER INSERT OR UPDATE OF status, vehicle_id, start_date, end_date ON reservations
  FOR EACH ROW EXECUTE FUNCTION sync_reservation_to_unavailability();


-- ============================================================
-- TRIGGER: Mise à jour des statistiques client après paiement
-- ============================================================

CREATE OR REPLACE FUNCTION update_customer_stats_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.type = 'reservation' THEN
    UPDATE customers
    SET
      total_reservations = total_reservations + 1,
      total_spent = total_spent + NEW.amount
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_update_customer_stats
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats_on_payment();


-- ============================================================
-- TRIGGER: Calcul automatique de rgpd_retention_until
-- Déclenché à la complétion d'une réservation (statut = completed)
-- Durée légale : 3 ans après la fin du contrat
-- ============================================================

CREATE OR REPLACE FUNCTION set_document_rgpd_retention()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE documents
    SET rgpd_retention_until = (NEW.end_date + INTERVAL '3 years')
    WHERE reservation_id = NEW.id
      AND rgpd_retention_until IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservation_set_rgpd_retention
  AFTER UPDATE OF status ON reservations
  FOR EACH ROW EXECUTE FUNCTION set_document_rgpd_retention();


-- ============================================================
-- VUE: Disponibilité véhicules (lecture calendrier)
-- ============================================================

CREATE OR REPLACE VIEW vehicle_availability AS
SELECT
  v.id              AS vehicle_id,
  v.brand,
  v.model,
  v.year,
  v.license_plate,
  v.category,
  v.daily_rate,
  v.deposit_amount,
  v.status,
  v.is_active,
  v.features,
  v.photos,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'start',  vu.start_date,
          'end',    vu.end_date,
          'reason', vu.reason
        ) ORDER BY vu.start_date
      )
      FROM vehicle_unavailability vu
      WHERE vu.vehicle_id = v.id
        AND vu.end_date >= CURRENT_DATE
    ),
    '[]'::jsonb
  ) AS future_unavailabilities
FROM vehicles v
WHERE v.is_active = true;

COMMENT ON VIEW vehicle_availability IS 'Vue des véhicules avec leur calendrier d''indisponibilités futures';


-- ============================================================
-- VUE: Dashboard admin - réservations en cours et à venir
-- ============================================================

CREATE OR REPLACE VIEW admin_reservations_dashboard AS
SELECT
  r.id,
  r.reservation_number,
  r.status,
  r.start_date,
  r.end_date,
  r.total_days,
  r.total_amount,
  r.deposit_amount,
  r.pickup_time,
  r.return_time,
  r.source,
  -- Client
  c.first_name  || ' ' || c.last_name  AS customer_name,
  c.email       AS customer_email,
  c.phone       AS customer_phone,
  c.is_verified AS customer_verified,
  -- Véhicule
  v.brand || ' ' || v.model AS vehicle_name,
  v.license_plate,
  v.category,
  -- Paiement
  (
    SELECT status FROM payments p
    WHERE p.reservation_id = r.id AND p.type = 'reservation'
    ORDER BY p.created_at DESC LIMIT 1
  ) AS payment_status,
  -- Caution
  d.status      AS deposit_status,
  d.amount      AS deposit_authorized_amount,
  r.created_at
FROM reservations r
JOIN customers c  ON c.id = r.customer_id
JOIN vehicles v   ON v.id = r.vehicle_id
LEFT JOIN deposits d ON d.reservation_id = r.id
ORDER BY r.start_date ASC;

COMMENT ON VIEW admin_reservations_dashboard IS 'Vue synthétique pour le dashboard administrateur';


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE vehicles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_options         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules          ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Vehicles: lecture publique (véhicules actifs), admin tout
-- -------------------------------------------------------
CREATE POLICY "vehicles_public_read" ON vehicles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "vehicles_admin_all" ON vehicles
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Customers: client gère son propre profil, admin tout
-- -------------------------------------------------------
CREATE POLICY "customers_own_select" ON customers
  FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "customers_own_update" ON customers
  FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customers_own_insert" ON customers
  FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customers_admin_all" ON customers
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Reservations: client voit ses réservations, admin tout
-- -------------------------------------------------------
CREATE POLICY "reservations_own_select" ON reservations
  FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "reservations_own_insert" ON reservations
  FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "reservations_admin_all" ON reservations
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Payments: client voit ses paiements, admin tout
-- -------------------------------------------------------
CREATE POLICY "payments_own_select" ON payments
  FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "payments_admin_all" ON payments
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Deposits: client voit sa caution, admin tout
-- -------------------------------------------------------
CREATE POLICY "deposits_own_select" ON deposits
  FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "deposits_admin_all" ON deposits
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Documents: client gère ses documents, admin tout
-- -------------------------------------------------------
CREATE POLICY "documents_own_select" ON documents
  FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "documents_own_insert" ON documents
  FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "documents_admin_all" ON documents
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Vehicle Unavailability: lecture publique (calendrier), admin tout
-- -------------------------------------------------------
CREATE POLICY "unavailability_public_read" ON vehicle_unavailability
  FOR SELECT
  USING (true);

CREATE POLICY "unavailability_admin_all" ON vehicle_unavailability
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Rental Options: lecture publique, admin tout
-- -------------------------------------------------------
CREATE POLICY "rental_options_public_read" ON rental_options
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "rental_options_admin_all" ON rental_options
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- -------------------------------------------------------
-- Pricing Rules: admin seulement (données sensibles)
-- -------------------------------------------------------
CREATE POLICY "pricing_rules_admin_all" ON pricing_rules
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');


-- ============================================================
-- DONNÉES INITIALES: Options de location
-- ============================================================

INSERT INTO rental_options (code, name, description, price_per_day, price_fixed, sort_order) VALUES
  ('assurance_premium',         'Assurance Premium',
   'Couverture tous risques sans franchise',                                  15.00,  0.00, 1),
  ('assurance_basique',         'Assurance Basique',
   'Couverture tiers avec franchise réduite à 500€',                           8.00,  0.00, 2),
  ('conducteur_supplementaire', 'Conducteur Supplémentaire',
   'Ajout d''un 2ème conducteur au contrat - permis valide requis',            5.00,  0.00, 3),
  ('gps',                       'GPS Portable',
   'Navigateur GPS portable dernière génération',                               3.00,  0.00, 4),
  ('siege_bebe',                'Siège Bébé',
   'Siège homologué groupe 0-1 (0-13 kg)',                                      4.00,  0.00, 5),
  ('rehausseur',                'Réhausseur Enfant',
   'Réhausseur homologué groupe 2-3 (15-36 kg)',                                3.00,  0.00, 6),
  ('couverture_bris_glace',     'Protection Bris de Glace',
   'Couverture complète bris de glace et pneumatiques',                         5.00,  0.00, 7),
  ('livraison_domicile',        'Livraison à Domicile',
   'Livraison et reprise du véhicule à l''adresse de votre choix (IDF)',        0.00, 50.00, 8),
  ('couverture_vol',            'Protection Vol',
   'Couverture en cas de vol du véhicule (franchise 0€)',                      10.00,  0.00, 9);
