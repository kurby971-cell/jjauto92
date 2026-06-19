'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address_street: string
  address_city: string
  address_postal_code: string
}

interface Props {
  customer: Customer | null
  userEmail: string
}

export default function ProfilForm({ customer, userEmail }: Props) {
  const [form, setForm] = useState({
    first_name: customer?.first_name ?? '',
    last_name: customer?.last_name ?? '',
    phone: customer?.phone ?? '',
    address_street: customer?.address_street ?? '',
    address_city: customer?.address_city ?? '',
    address_postal_code: customer?.address_postal_code ?? '',
  })

  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [profileError, setProfileError] = useState('')

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwError, setPwError] = useState('')

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileStatus('saving')
    setProfileError('')

    const res = await fetch('/api/mon-compte/profil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setProfileStatus('saved')
      setTimeout(() => setProfileStatus('idle'), 3000)
    } else {
      const data = await res.json().catch(() => ({}))
      setProfileError(data.error ?? 'Erreur lors de la mise à jour')
      setProfileStatus('error')
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwStatus('saving')
    setPwError('')

    if (pwForm.next !== pwForm.confirm) {
      setPwError('Les mots de passe ne correspondent pas.')
      setPwStatus('error')
      return
    }
    if (pwForm.next.length < 8) {
      setPwError('Le mot de passe doit contenir au moins 8 caractères.')
      setPwStatus('error')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })

    if (error) {
      setPwError(error.message)
      setPwStatus('error')
    } else {
      setPwStatus('saved')
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwStatus('idle'), 3000)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-colors'

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-extrabold text-[#0D1B2A] mb-1">Informations personnelles</h2>
        <p className="text-sm text-gray-500 mb-5">Votre adresse email ({userEmail}) ne peut pas être modifiée ici.</p>

        {profileStatus === 'saved' && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profil mis à jour avec succès.
          </div>
        )}
        {profileStatus === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Prénom</label>
              <input type="text" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} className={inputClass} placeholder="Jean" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nom</label>
              <input type="text" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} className={inputClass} placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Téléphone</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} placeholder="06 00 00 00 00" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Adresse</label>
            <input type="text" value={form.address_street} onChange={(e) => set('address_street', e.target.value)} className={inputClass} placeholder="1 rue de la Paix" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Code postal</label>
              <input type="text" value={form.address_postal_code} onChange={(e) => set('address_postal_code', e.target.value)} className={inputClass} placeholder="75001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Ville</label>
              <input type="text" value={form.address_city} onChange={(e) => set('address_city', e.target.value)} className={inputClass} placeholder="Paris" />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={profileStatus === 'saving'}
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8963E] disabled:opacity-50 text-[#0D1B2A] font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-widest transition-colors"
            >
              {profileStatus === 'saving' ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-extrabold text-[#0D1B2A] mb-1">Changer le mot de passe</h2>
        <p className="text-sm text-gray-500 mb-5">Le nouveau mot de passe doit contenir au moins 8 caractères.</p>

        {pwStatus === 'saved' && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mot de passe modifié avec succès.
          </div>
        )}
        {pwStatus === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nouveau mot de passe</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              required
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={pwStatus === 'saving'}
            className="flex items-center gap-2 bg-[#0D1B2A] hover:bg-[#1a2d45] disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-widest transition-colors"
          >
            {pwStatus === 'saving' ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>

      {/* RGPD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-extrabold text-[#0D1B2A] mb-1">Vos droits RGPD</h2>
        <p className="text-sm text-gray-500 mb-4">
          Conformément au RGPD, vous pouvez demander la suppression de votre compte et de toutes vos données personnelles.
        </p>
        <a
          href="mailto:contact@jjautomobiles.fr?subject=Demande de suppression de compte RGPD"
          className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Demander la suppression de mon compte
        </a>
        <p className="text-xs text-gray-400 mt-3">
          Consultez notre{' '}
          <a href="/confidentialite" className="underline hover:text-gray-600">politique de confidentialité</a>
          {' '}pour plus d'informations.
        </p>
      </div>
    </div>
  )
}
