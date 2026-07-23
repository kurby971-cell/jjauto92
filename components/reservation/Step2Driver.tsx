'use client'

import { useState, useRef } from 'react'
import type { ReservationDraft, DriverData, DocumentRefs } from './types'
import DatePickerInput from '@/components/ui/DatePickerInput'

interface Props {
  draft: ReservationDraft
  onComplete: (driver: DriverData, docs: DocumentRefs) => Promise<void>
  onBack: () => void
  loading: boolean
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface DocUpload {
  state: UploadState
  url: string | null
  name: string | null
  error: string | null
}

const EMPTY_UPLOAD: DocUpload = { state: 'idle', url: null, name: null, error: null }

const FIELD_CLASSES = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold placeholder:text-gray-400'

export default function Step2Driver({ draft, onComplete, onBack, loading }: Props) {
  const [form, setForm] = useState<DriverData>(
    draft.driver ?? {
      firstName: '', lastName: '', email: '', phone: '',
      dateOfBirth: '', licenseNumber: '',
    }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof DriverData, string>>>({})

  const [licenseRecto, setLicenseRecto] = useState<DocUpload>({
    ...EMPTY_UPLOAD, url: draft.documents.licenseRecto, state: draft.documents.licenseRecto ? 'done' : 'idle', name: draft.documents.licenseRecto ? 'Document uploadé' : null,
  })
  const [licenseVerso, setLicenseVerso] = useState<DocUpload>({
    ...EMPTY_UPLOAD, url: draft.documents.licenseVerso, state: draft.documents.licenseVerso ? 'done' : 'idle', name: draft.documents.licenseVerso ? 'Document uploadé' : null,
  })
  const [idDoc, setIdDoc] = useState<DocUpload>({
    ...EMPTY_UPLOAD, url: draft.documents.idDocument, state: draft.documents.idDocument ? 'done' : 'idle', name: draft.documents.idDocument ? 'Document uploadé' : null,
  })
  const [idDocVerso, setIdDocVerso] = useState<DocUpload>({
    ...EMPTY_UPLOAD, url: draft.documents.idDocumentVerso, state: draft.documents.idDocumentVerso ? 'done' : 'idle', name: draft.documents.idDocumentVerso ? 'Document uploadé' : null,
  })
  const [idDocType, setIdDocType] = useState<'cni' | 'passeport'>(draft.documents.idDocumentType ?? 'cni')

  const f = (field: keyof DriverData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof DriverData, string>> = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim()) e.lastName = 'Nom requis'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide'
    if (!form.phone.trim()) e.phone = 'Téléphone requis'
    if (!form.dateOfBirth) e.dateOfBirth = 'Date de naissance requise'
    else {
      const age = Math.floor((Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 86_400_000))
      if (age < 21) e.dateOfBirth = 'Âge minimum requis : 21 ans'
    }
    if (!form.licenseNumber.trim()) e.licenseNumber = 'Numéro de permis requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function uploadFile(
    file: File,
    docType: string,
    setter: (u: DocUpload) => void
  ) {
    setter({ state: 'uploading', url: null, name: file.name, error: null })
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', docType)
    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur upload')
      setter({ state: 'done', url: data.url, name: file.name, error: null })
    } catch (err) {
      setter({ state: 'error', url: null, name: file.name, error: (err as Error).message })
    }
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string,
    setter: (u: DocUpload) => void
  ) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file, docType, setter)
    e.target.value = '' // reset so same file can be re-selected
  }

  async function handleSubmit() {
    if (!validate()) return
    await onComplete(form, {
      licenseRecto: licenseRecto.url,
      licenseVerso: licenseVerso.url,
      idDocument: idDoc.url,
      idDocumentVerso: idDocType === 'cni' ? idDocVerso.url : null,
      idDocumentType: idDocType,
    })
  }

  const maxDob = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 21)
    return d.toISOString().split('T')[0]
  })()

  return (
    <div className="space-y-6">

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-5">Informations conducteur</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom *</label>
            <input type="text" value={form.firstName} onChange={f('firstName')} placeholder="Jean" className={FIELD_CLASSES} autoComplete="given-name" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom *</label>
            <input type="text" value={form.lastName} onChange={f('lastName')} placeholder="Dupont" className={FIELD_CLASSES} autoComplete="family-name" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={f('email')} placeholder="jean.dupont@email.fr" className={FIELD_CLASSES} autoComplete="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone *</label>
            <input type="tel" value={form.phone} onChange={f('phone')} placeholder="06 12 34 56 78" className={FIELD_CLASSES} autoComplete="tel" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date de naissance * <span className="text-gray-400 font-normal">(21 ans minimum)</span></label>
            <DatePickerInput
              value={form.dateOfBirth}
              max={maxDob}
              placeholder="JJ Mois AAAA"
              onChange={(v) => {
                setForm(p => ({ ...p, dateOfBirth: v }))
                setErrors(p => ({ ...p, dateOfBirth: undefined }))
              }}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">N° permis de conduire *</label>
            <input type="text" value={form.licenseNumber} onChange={f('licenseNumber')} placeholder="123456789012" className={FIELD_CLASSES} autoComplete="off" />
            {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
          </div>

        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest">Documents d'identité</h3>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Facultatif en ligne</span>
        </div>
        <p className="text-gray-400 text-xs mb-5">Vous pouvez aussi apporter vos documents le jour de la prise en charge.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <UploadZone
            label="Permis recto"
            docType="permis_recto"
            state={licenseRecto}
            onChange={(e) => handleFileChange(e, 'permis_recto', setLicenseRecto)}
            onRemove={() => setLicenseRecto(EMPTY_UPLOAD)}
          />

          <UploadZone
            label="Permis verso"
            docType="permis_verso"
            state={licenseVerso}
            onChange={(e) => handleFileChange(e, 'permis_verso', setLicenseVerso)}
            onRemove={() => setLicenseVerso(EMPTY_UPLOAD)}
          />

          <div className="sm:col-span-2">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs font-semibold text-gray-600">Type de pièce d'identité :</span>
              {(['cni', 'passeport'] as const).map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={idDocType === t}
                    onChange={() => setIdDocType(t)}
                    className="accent-gold"
                  />
                  <span className="text-sm text-navy">{t === 'cni' ? 'CNI' : 'Passeport'}</span>
                </label>
              ))}
            </div>
            {idDocType === 'cni' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UploadZone
                  label="CNI recto"
                  docType="cni_recto"
                  state={idDoc}
                  onChange={(e) => handleFileChange(e, 'cni_recto', setIdDoc)}
                  onRemove={() => setIdDoc(EMPTY_UPLOAD)}
                />
                <UploadZone
                  label="CNI verso"
                  docType="cni_verso"
                  state={idDocVerso}
                  onChange={(e) => handleFileChange(e, 'cni_verso', setIdDocVerso)}
                  onRemove={() => setIdDocVerso(EMPTY_UPLOAD)}
                />
              </div>
            ) : (
              <UploadZone
                label="Page photo du passeport"
                docType="passeport"
                state={idDoc}
                onChange={(e) => handleFileChange(e, 'passeport', setIdDoc)}
                onRemove={() => setIdDoc(EMPTY_UPLOAD)}
              />
            )}
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:text-navy hover:border-navy text-sm font-semibold px-5 py-3.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-widest transition-colors"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Création de la réservation…
            </>
          ) : (
            <>
              Continuer — Paiement
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Upload zone sub-component ─────────────────────────────────
interface UploadZoneProps {
  label: string
  docType: string
  state: DocUpload
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

function UploadZone({ label, docType, state, onChange, onRemove }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isImage = state.name ? /\.(jpg|jpeg|png|webp)$/i.test(state.name) : false

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onChange}
        className="hidden"
      />

      {state.state === 'idle' && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gold hover:bg-gold/5 transition-colors group"
        >
          <svg className="w-6 h-6 text-gray-300 group-hover:text-gold mx-auto mb-1.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="text-xs text-gray-400">Cliquez pour ajouter</p>
          <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, PDF — max 10 Mo</p>
        </button>
      )}

      {state.state === 'uploading' && (
        <div className="w-full border-2 border-dashed border-gold/40 rounded-xl p-4 text-center bg-gold/5">
          <svg className="w-5 h-5 text-gold mx-auto mb-1 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-xs text-gold">Envoi en cours…</p>
        </div>
      )}

      {state.state === 'done' && (
        <div className="w-full border border-emerald-200 bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
          {isImage && state.url ? (
            <img src={state.url} alt="" className="w-12 h-10 object-cover rounded-lg shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-emerald-700 text-xs font-semibold truncate">{state.name}</p>
            <p className="text-emerald-500 text-[10px]">✓ Uploadé avec succès</p>
          </div>
          <button onClick={onRemove} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {state.state === 'error' && (
        <div className="w-full border border-red-200 bg-red-50 rounded-xl p-3">
          <p className="text-red-600 text-xs font-semibold">{state.error}</p>
          <button onClick={() => inputRef.current?.click()} className="text-red-400 text-xs underline mt-1">Réessayer</button>
        </div>
      )}
    </div>
  )
}
