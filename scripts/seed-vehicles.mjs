// Exécute la migration 002 sur Supabase :
//   - DDL via l'API pg-meta (ALTER TABLE)
//   - DML via l'admin client @supabase/supabase-js (DELETE, INSERT)
//
// Usage : node --env-file=.env.local scripts/seed-vehicles.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises.')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── DDL via pg-meta (expose par Supabase sur /pg/query avec service_role) ───
async function runDDL(label, sql) {
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res.ok) {
    console.log(`  ✓ DDL — ${label}`)
    return true
  }

  const text = await res.text()
  console.warn(`  ⚠ DDL non exécuté via pg-meta (${res.status}) — ${label}`)
  console.warn(`    → À exécuter manuellement dans le SQL Editor Supabase :`)
  console.warn(`    ${sql.trim()}`)
  return false
}

// ── DML ──────────────────────────────────────────────────────────────────────
async function deleteDemoVehicles() {
  const DEMO_SLUGS = [
    'volkswagen-golf-8-2023',
    'peugeot-3008-2022',
    'mercedes-classe-a-2023',
    'renault-zoe-2023',
  ]

  const { error, count } = await db
    .from('vehicles')
    .delete({ count: 'exact' })
    .in('slug', DEMO_SLUGS)

  if (error) throw new Error(`DELETE failed: ${error.message}`)
  console.log(`  ✓ ${count ?? '?'} véhicule(s) de démo supprimé(s)`)
}

async function insertVehicles(hasWeekendRate) {
  const polo = {
    brand: 'Volkswagen',
    model: 'Polo GTI DSG7',
    year: 2024,
    license_plate: 'XX-000-XX',
    color: 'Gris Ascot',
    category: 'premium',
    fuel_type: 'essence',
    transmission: 'automatique',
    seats: 5,
    doors: 5,
    daily_rate: 130.00,
    ...(hasWeekendRate ? { weekend_rate: 300.00 } : {}),
    weekly_rate: 650.00,
    monthly_rate: 1900.00,
    deposit_amount: 2000.00,
    mileage_included_per_day: 200,
    excess_mileage_rate: 0.30,
    status: 'disponible',
    current_mileage: 0,
    is_active: true,
    photos: [],
    features: [
      'DSG7 double embrayage',
      'TSI 207 ch',
      'Digital Cockpit 10.25"',
      'App-Connect (CarPlay/Android Auto)',
      'Sièges sport GTI Clark',
      'Jantes 18" Aberdeen',
      'Phares LED Matrix',
      'Régulateur adaptatif',
      'Climatisation auto bi-zone',
      'Freinage d\'urgence AEB',
    ],
    description:
      'La Volkswagen Polo GTI DSG7 2024 allie performances sportives et confort quotidien. ' +
      'Moteur TSI 207 ch, boîte DSG7 à double embrayage et finition GTI exclusive pour une conduite plaisir sans compromis.',
    slug: 'polo-gti-dsg7',
    location: 'Nanterre',
  }

  const clio = {
    brand: 'Renault',
    model: 'Clio 6 Alpine Hybride E-Tech',
    year: 2025,
    license_plate: 'XX-001-XX',
    color: 'Bleu Alpine',
    category: 'premium',
    fuel_type: 'hybride',
    transmission: 'automatique',
    seats: 5,
    doors: 5,
    daily_rate: 85.00,
    ...(hasWeekendRate ? { weekend_rate: 220.00 } : {}),
    weekly_rate: 480.00,
    monthly_rate: 1600.00,
    deposit_amount: 1500.00,
    mileage_included_per_day: 200,
    excess_mileage_rate: 0.25,
    status: 'disponible',
    current_mileage: 0,
    is_active: true,
    photos: [],
    features: [
      'Full Hybrid E-Tech 145 ch',
      'Boîte auto multi-modes crabots',
      'OpenR Link 10" Google intégré',
      'Navigation Google embarquée',
      'Sièges baquets sport Alpine',
      'Charge sans fil',
      'Vue 360° caméras',
      'Régulateur adaptatif',
      'Climatisation auto',
      'Pack Alpine exclusif',
    ],
    description:
      'La Renault Clio 6 Alpine Hybride E-Tech 2025 incarne l\'élégance sportive à la française. ' +
      'Technologie hybride Full E-Tech, finition Alpine exclusive et équipements haut de gamme pour une conduite efficiente et raffinée.',
    slug: 'clio-alpine-e-tech',
    location: 'Nanterre',
  }

  const { error } = await db.from('vehicles').insert([polo, clio])
  if (error) throw new Error(`INSERT failed: ${error.message}`)

  console.log(`  ✓ 2 véhicule(s) inséré(s)`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== Migration 002 — Véhicules réels ===\n')

  // DDL : ajoute colonne weekend_rate
  const hasWeekendRate = await runDDL(
    'ALTER TABLE vehicles ADD COLUMN weekend_rate',
    "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS weekend_rate NUMERIC(10,2);"
  )

  console.log()

  // DML
  await deleteDemoVehicles()
  await insertVehicles(hasWeekendRate)

  console.log('\n✓ Migration terminée.\n')
  console.log('⚠ Pensez à mettre à jour license_plate avec les vraies plaques.')
}

main().catch((err) => {
  console.error('\n✗ Erreur :', err.message)
  process.exit(1)
})
