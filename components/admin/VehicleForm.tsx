'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PhotoGallery from './PhotoGallery'
import type { Vehicle, VehicleCategory, FuelType, TransmissionType, VehicleStatus } from '@/lib/types'

// ── Field helpers ────────────────────────────────────────────────────────────
function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-colors'
const selectCls = inputCls + ' bg-white'

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={selectCls} />
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls + ' resize-none'} />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-extrabold text-[#0D1B2A] uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES: { value: VehicleCategory; label: string }[] = [
  { value: 'economy', label: 'Économique' },
  { value: 'compact', label: 'Compacte' },
  { value: 'standard', label: 'Standard' },
  { value: 'suv', label: 'SUV' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxe' },
  { value: 'utility', label: 'Utilitaire' },
]
const FUELS: { value: FuelType; label: string }[] = [
  { value: 'essence', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'hybride', label: 'Hybride' },
  { value: 'hybride_rechargeable', label: 'Hybride rechargeable' },
]
const TRANSMISSIONS: { value: TransmissionType; label: string }[] = [
  { value: 'automatique', label: 'Automatique' },
  { value: 'manuelle', label: 'Manuelle' },
]
const STATUSES: { value: VehicleStatus; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_location', label: 'En location' },
  { value: 'en_maintenance', label: 'En maintenance' },
  { value: 'hors_service', label: 'Hors service' },
]
const COMMON_FEATURES = [
  'Climatisation', 'GPS intégré', 'Bluetooth', 'Caméra de recul',
  'Régulateur de vitesse', 'Aide au stationnement', 'Sièges chauffants',
  'Toit ouvrant', 'CarPlay/Android Auto', 'Chargeur USB',
]

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  vehicle?: Vehicle & { weekly_rate?: number | null; monthly_rate?: number | null }
}

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const isEdit = !!vehicle

  // Identification
  const [brand, setBrand] = useState(vehicle?.brand ?? '')
  const [model, setModel] = useState(vehicle?.model ?? '')
  const [year, setYear] = useState(String(vehicle?.year ?? new Date().getFullYear()))
  const [slug, setSlug] = useState(vehicle?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!vehicle?.slug)
  const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate ?? '')
  const [vin, setVin] = useState(vehicle?.vin ?? '')
  const [color, setColor] = useState(vehicle?.color ?? '')

  // Classification
  const [category, setCategory] = useState<VehicleCategory>(vehicle?.category ?? 'standard')
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuel_type ?? 'essence')
  const [transmission, setTransmission] = useState<TransmissionType>(vehicle?.transmission ?? 'automatique')
  const [seats, setSeats] = useState(String(vehicle?.seats ?? 5))
  const [doors, setDoors] = useState(String(vehicle?.doors ?? 5))

  // Tarification
  const [dailyRate, setDailyRate] = useState(String(vehicle?.daily_rate ?? ''))
  const [weeklyRate, setWeeklyRate] = useState(String(vehicle?.weekly_rate ?? ''))
  const [monthlyRate, setMonthlyRate] = useState(String(vehicle?.monthly_rate ?? ''))
  const [depositAmount, setDepositAmount] = useState(String(vehicle?.deposit_amount ?? 500))
  const [mileagePerDay, setMileagePerDay] = useState(String(vehicle?.mileage_included_per_day ?? 200))
  const [excessRate, setExcessRate] = useState(String(vehicle?.excess_mileage_rate ?? 0.25))

  // État
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status ?? 'disponible')
  const [isActive, setIsActive] = useState(vehicle?.is_active !== false)
  const [currentMileage, setCurrentMileage] = useState(String(vehicle?.current_mileage ?? 0))
  const [location, setLocation] = useState(vehicle?.location ?? 'Nanterre')

  // Documents
  const [insurancePolicy, setInsurancePolicy] = useState(vehicle?.insurance_policy_number ?? '')
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle?.insurance_expiry ?? '')
  const [technicalInspection, setTechnicalInspection] = useState(vehicle?.technical_inspection_date ?? '')

  // Description & équipements
  const [description, setDescription] = useState(vehicle?.description ?? '')
  const [features, setFeatures] = useState<string[]>(vehicle?.features ?? [])
  const [featureInput, setFeatureInput] = useState('')

  // Photos
  const [photos, setPhotos] = useState(vehicle?.photos ?? [])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // UI
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-slug
  useEffect(() => {
    if (slugManual) return
    if (!brand && !model) return
    setSlug(
      `${brand}-${model}-${year}`
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    )
  }, [brand, model, year, slugManual])

  function addFeature(feat?: string) {
    const f = (feat ?? featureInput).trim()
    if (f && !features.includes(f)) setFeatures(prev => [...prev, f])
    if (!feat) setFeatureInput('')
  }

  function removeFeature(f: string) { setFeatures(prev => prev.filter(x => x !== f)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      brand, model, year: Number(year),
      slug: slug || undefined,
      license_plate: licensePlate, vin: vin || null, color,
      category, fuel_type: fuelType, transmission,
      seats: Number(seats), doors: Number(doors),
      daily_rate: Number(dailyRate),
      weekly_rate: weeklyRate ? Number(weeklyRate) : null,
      monthly_rate: monthlyRate ? Number(monthlyRate) : null,
      deposit_amount: Number(depositAmount),
      mileage_included_per_day: Number(mileagePerDay),
      excess_mileage_rate: Number(excessRate),
      status, is_active: isActive,
      current_mileage: Number(currentMileage),
      location,
      insurance_policy_number: insurancePolicy || null,
      insurance_expiry: insuranceExpiry || null,
      technical_inspection_date: technicalInspection || null,
      description: description || null,
      features, photos,
    }

    try {
      if (isEdit) {
        const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else {
        const res = await fetch('/api/admin/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        const { id } = await res.json()
        if (pendingFiles.length > 0) {
          const fd = new FormData()
          pendingFiles.forEach(f => fd.append('files', f))
          await fetch(`/api/admin/vehicles/${id}/photos`, { method: 'POST', body: fd })
        }
      }
      router.push('/admin/vehicules')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Identification ── */}
      <Section title="Identification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Marque" required>
            <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Peugeot" required />
          </Field>
          <Field label="Modèle" required>
            <Input value={model} onChange={e => setModel(e.target.value)} placeholder="3008" required />
          </Field>
          <Field label="Année" required>
            <Input type="number" value={year} onChange={e => setYear(e.target.value)}
              min="2000" max={new Date().getFullYear() + 1} required />
          </Field>
          <Field label="Immatriculation" required>
            <Input value={licensePlate} onChange={e => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="AB-123-CD" required />
          </Field>
          <Field label="Couleur" required>
            <Input value={color} onChange={e => setColor(e.target.value)} placeholder="Blanc nacré" required />
          </Field>
          <Field label="VIN (châssis)">
            <Input value={vin} onChange={e => setVin(e.target.value)} placeholder="VF3..." maxLength={17} />
          </Field>
        </div>
        <Field label="Slug SEO">
          <div className="flex gap-2">
            <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="peugeot-3008-2023" className={inputCls + ' flex-1'} />
            {slugManual && (
              <button type="button" onClick={() => setSlugManual(false)}
                className="px-3 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 shrink-0">
                Auto
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Généré automatiquement depuis Marque + Modèle + Année</p>
        </Field>
      </Section>

      {/* ── Classification ── */}
      <Section title="Classification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie" required>
            <Select value={category} onChange={e => setCategory(e.target.value as VehicleCategory)} required>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Carburant" required>
            <Select value={fuelType} onChange={e => setFuelType(e.target.value as FuelType)} required>
              {FUELS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </Field>
          <Field label="Transmission">
            <Select value={transmission} onChange={e => setTransmission(e.target.value as TransmissionType)}>
              {TRANSMISSIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Places">
              <Select value={seats} onChange={e => setSeats(e.target.value)}>
                {[2,4,5,7,9].map(n => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Portes">
              <Select value={doors} onChange={e => setDoors(e.target.value)}>
                {[2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Tarification ── */}
      <Section title="Tarification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prix / jour (€)" required>
            <Input type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)}
              placeholder="65" min="1" step="0.01" required />
          </Field>
          <Field label="Prix / semaine (€)">
            <Input type="number" value={weeklyRate} onChange={e => setWeeklyRate(e.target.value)}
              placeholder={dailyRate ? String(Math.round(Number(dailyRate) * 6)) : '390'} min="1" step="0.01" />
            <p className="text-xs text-gray-400 mt-1">Optionnel — laisser vide pour utiliser 7 × tarif jour</p>
          </Field>
          <Field label="Prix / mois (€)">
            <Input type="number" value={monthlyRate} onChange={e => setMonthlyRate(e.target.value)}
              placeholder={dailyRate ? String(Math.round(Number(dailyRate) * 20)) : '1300'} min="1" step="0.01" />
            <p className="text-xs text-gray-400 mt-1">Optionnel — laisser vide pour utiliser 30 × tarif jour</p>
          </Field>
          <Field label="Caution (€)">
            <Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
              placeholder="500" min="0" step="0.01" />
          </Field>
          <Field label="Km inclus / jour">
            <Input type="number" value={mileagePerDay} onChange={e => setMileagePerDay(e.target.value)}
              placeholder="200" min="0" />
          </Field>
          <Field label="Km suppl. (€/km)">
            <Input type="number" value={excessRate} onChange={e => setExcessRate(e.target.value)}
              placeholder="0.25" min="0" step="0.01" />
          </Field>
        </div>

      </Section>

      {/* ── État & Localisation ── */}
      <Section title="État & Localisation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Statut">
            <Select value={status} onChange={e => setStatus(e.target.value as VehicleStatus)}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Kilométrage actuel">
            <Input type="number" value={currentMileage} onChange={e => setCurrentMileage(e.target.value)} min="0" />
          </Field>
          <Field label="Localisation">
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Nanterre" />
          </Field>
          <Field label="Actif (visible sur le site)">
            <label className="flex items-center gap-3 cursor-pointer mt-1">
              <div
                onClick={() => setIsActive(!isActive)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${isActive ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5.5 ml-0.5' : 'ml-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700">{isActive ? 'Actif' : 'Inactif'}</span>
            </label>
          </Field>
        </div>
      </Section>

      {/* ── Documents ── */}
      <Section title="Documents réglementaires">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="N° police d'assurance">
            <Input value={insurancePolicy} onChange={e => setInsurancePolicy(e.target.value)} placeholder="ASS-123456" />
          </Field>
          <Field label="Expiration assurance">
            <Input type="date" value={insuranceExpiry} onChange={e => setInsuranceExpiry(e.target.value)} />
          </Field>
          <Field label="Prochain contrôle technique">
            <Input type="date" value={technicalInspection} onChange={e => setTechnicalInspection(e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* ── Description & Équipements ── */}
      <Section title="Description & Équipements">
        <Field label="Description">
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Décrivez le véhicule : points forts, confort, utilisation idéale…"
          />
        </Field>

        <Field label="Équipements inclus">
          {/* Quick-add chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_FEATURES.filter(f => !features.includes(f)).map(f => (
              <button key={f} type="button" onClick={() => addFeature(f)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-[#C9A84C]/10 border border-gray-200 hover:border-[#C9A84C]/40 text-gray-600 hover:text-[#0D1B2A] text-xs font-medium rounded-full transition-colors">
                + {f}
              </button>
            ))}
          </div>
          {/* Custom input */}
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
              placeholder="Équipement personnalisé… (Entrée pour ajouter)"
              className={inputCls + ' flex-1'}
            />
            <button type="button" onClick={() => addFeature()}
              className="px-4 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a2d45] shrink-0">
              Ajouter
            </button>
          </div>
          {/* Tags */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {features.map(f => (
                <span key={f} className="flex items-center gap-1.5 px-3 py-1 bg-[#0D1B2A]/5 text-[#0D1B2A] text-xs font-semibold rounded-full border border-[#0D1B2A]/10">
                  {f}
                  <button type="button" onClick={() => removeFeature(f)}
                    className="w-3.5 h-3.5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
      </Section>

      {/* ── Photos ── */}
      <Section title="Photos">
        <PhotoGallery
          vehicleId={vehicle?.id ?? null}
          photos={photos}
          onPhotosChange={setPhotos}
          onPendingFiles={setPendingFiles}
        />
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#C9A84C] hover:bg-[#B8963E] disabled:opacity-50 text-[#0D1B2A] font-extrabold text-sm rounded-xl uppercase tracking-widest transition-colors"
        >
          {saving && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
          {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le véhicule'}
        </button>
      </div>
    </form>
  )
}
