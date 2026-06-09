'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const FR_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'Email not confirmed': 'Veuillez confirmer votre adresse email avant de vous connecter.',
  'Too many requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
}

function translateError(msg: string) {
  return FR_ERRORS[msg] ?? msg
}

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Forgot password
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(translateError(authError.message))
      setLoading(false)
      return
    }

    const isAdmin = data.user?.app_metadata?.role === 'admin'
    const destination = next || (isAdmin ? '/admin' : '/mon-compte')
    router.push(destination)
    router.refresh()
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setResetSent(true)
    setResetLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#C9A84C] rounded-xl flex items-center justify-center">
              <span className="text-[#0D1B2A] font-black text-base select-none">JJ</span>
            </div>
            <div className="text-left">
              <p className="text-[#0D1B2A] font-black text-lg leading-none">JJ AUTO 92</p>
              <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest">Location premium</p>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0D1B2A] mt-4">Connexion à votre espace</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos réservations et documents.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          {!showReset ? (
            <>
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="vous@exemple.fr"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#B8963E] disabled:opacity-50 text-[#0D1B2A] font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-widest transition-colors"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {loading ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between text-sm">
                <button
                  onClick={() => setShowReset(true)}
                  className="text-gray-500 hover:text-[#0D1B2A] transition-colors text-xs"
                >
                  Mot de passe oublié ?
                </button>
                <Link href="/inscription" className="text-[#C9A84C] font-semibold hover:underline text-xs">
                  Créer un compte →
                </Link>
              </div>
            </>
          ) : (
            /* Reset password */
            <>
              <button
                onClick={() => setShowReset(false)}
                className="flex items-center gap-1 text-gray-500 hover:text-[#0D1B2A] text-xs mb-5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour à la connexion
              </button>

              <h2 className="font-extrabold text-[#0D1B2A] text-lg mb-1">Réinitialiser le mot de passe</h2>
              <p className="text-gray-500 text-sm mb-5">
                Saisissez votre email pour recevoir un lien de réinitialisation.
              </p>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-xl text-sm">
                  <p className="font-semibold">Email envoyé !</p>
                  <p className="mt-1 text-emerald-600">Vérifiez votre boîte de réception et vos spams.</p>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="votre@email.fr"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
                  />
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-[#0D1B2A] hover:bg-[#1a2d45] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Envoi…' : 'Envoyer le lien'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Problème de connexion ?{' '}
          <a href="tel:+33761422192" className="text-[#C9A84C] hover:underline">07 61 42 21 92</a>
        </p>
      </div>
    </div>
  )
}
