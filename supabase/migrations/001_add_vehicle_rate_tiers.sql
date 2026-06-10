-- Add weekly and monthly rate columns to vehicles table
-- Apply in Supabase SQL editor: Dashboard > SQL Editor > New query

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS weekly_rate  NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS monthly_rate NUMERIC(10,2);

COMMENT ON COLUMN vehicles.weekly_rate  IS 'Tarif semaine (7 jours consécutifs). Null = pas de tarif semaine.';
COMMENT ON COLUMN vehicles.monthly_rate IS 'Tarif mois (30 jours consécutifs). Null = pas de tarif mensuel.';
