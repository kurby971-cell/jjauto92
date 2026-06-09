'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Consent {
  necessary: true
  analytics: boolean
  marketing: boolean
  savedAt: number
}

const STORAGE_KEY = 'jjauto_cookie_consent'
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

function loadConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: Consent = JSON.parse(raw)
    if (Date.now() - parsed.savedAt > SIX_MONTHS_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveConsent(analytics: boolean, marketing: boolean) {
  const consent: Consent = {
    necessary: true,
    analytics,
    marketing,
    savedAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const consent = loadConsent()
    if (!consent) setVisible(true)
  }, [])

  if (!visible) return null

  function acceptAll() {
    saveConsent(true, true)
    setVisible(false)
  }

  function rejectAll() {
    saveConsent(false, false)
    setVisible(false)
  }

  function saveCustom() {
    saveConsent(analytics, marketing)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      aria-modal="true"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4"
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl">

        {!showCustom ? (
          /* Main banner */
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" aria-hidden="true">🍪</span>
                  <h2 className="font-extrabold text-[#0D1B2A] text-base">Ce site utilise des cookies</h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies analytiques pour améliorer notre service.{' '}
                  <Link href="/politique-de-confidentialite" className="underline hover:text-[#C9A84C] transition-colors">
                    En savoir plus
                  </Link>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Tout refuser
                </button>
                <button
                  onClick={() => setShowCustom(true)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Personnaliser
                </button>
                <button
                  onClick={acceptAll}
                  className="px-5 py-2.5 text-xs font-extrabold bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A] rounded-xl transition-colors whitespace-nowrap uppercase tracking-widest"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Custom preferences panel */
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-[#0D1B2A]">Paramètres des cookies</h2>
              <button
                onClick={() => setShowCustom(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Retour"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary — always on */}
              <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-[#0D1B2A]">Cookies nécessaires</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Indispensables au fonctionnement du site (session, authentification, panier). Ne peuvent pas être désactivés.
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Toujours actifs</span>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-[#0D1B2A]">Cookies analytiques</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Nous aident à comprendre comment vous utilisez notre site pour l'améliorer (pages vues, durée de visite).
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics((v) => !v)}
                  className={`shrink-0 mt-0.5 relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] ${
                    analytics ? 'bg-[#C9A84C]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      analytics ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#0D1B2A]">Cookies marketing</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permettent de vous montrer des publicités personnalisées en fonction de vos centres d'intérêt.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={marketing}
                  onClick={() => setMarketing((v) => !v)}
                  className={`shrink-0 mt-0.5 relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] ${
                    marketing ? 'bg-[#C9A84C]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      marketing ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={rejectAll}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Tout refuser
              </button>
              <button
                onClick={saveCustom}
                className="flex-1 px-4 py-2.5 text-xs font-extrabold bg-[#0D1B2A] hover:bg-[#1a2d45] text-white rounded-xl transition-colors"
              >
                Enregistrer mes préférences
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2.5 text-xs font-extrabold bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A] rounded-xl transition-colors"
              >
                Tout accepter
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-3 text-center">
              Votre choix est valable 6 mois · Conforme aux recommandations{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                CNIL
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
