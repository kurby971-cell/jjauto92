'use client'

import { useState, useRef } from 'react'

const DOC_TYPES = [
  { key: 'permis_recto', label: 'Permis de conduire (recto)', required: true },
  { key: 'permis_verso', label: 'Permis de conduire (verso)', required: true },
  { key: 'cni_passeport', label: "Carte d'identité ou passeport", required: true },
]

interface Props {
  customerId: string
  reservationId: string
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function DocumentUploadSection({ customerId, reservationId }: Props) {
  const [states, setStates] = useState<Record<string, UploadState>>(
    Object.fromEntries(DOC_TYPES.map((d) => [d.key, 'idle']))
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function handleUpload(docKey: string, file: File) {
    setStates((s) => ({ ...s, [docKey]: 'uploading' }))
    setErrors((e) => ({ ...e, [docKey]: '' }))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docKey)
    formData.append('customerId', customerId)
    formData.append('reservationId', reservationId)

    const res = await fetch('/api/mon-compte/documents/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      setStates((s) => ({ ...s, [docKey]: 'done' }))
    } else {
      const data = await res.json().catch(() => ({}))
      setErrors((e) => ({ ...e, [docKey]: data.error ?? 'Erreur lors de l\'upload' }))
      setStates((s) => ({ ...s, [docKey]: 'error' }))
    }
  }

  const allDone = DOC_TYPES.every((d) => states[d.key] === 'done')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-extrabold text-[#0D1B2A] mb-1">Documents requis</h2>
      <p className="text-sm text-gray-500 mb-5">
        Transmettez vos documents pour validation avant la prise en charge du véhicule.
      </p>

      {allDone && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Tous vos documents ont été transmis. Notre équipe les vérifiera sous 24h.
        </div>
      )}

      <div className="space-y-3">
        {DOC_TYPES.map((doc) => {
          const state = states[doc.key]
          const err = errors[doc.key]

          return (
            <div key={doc.key} className="flex items-center gap-4">
              {/* Status icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                state === 'done' ? 'bg-emerald-100' :
                state === 'uploading' ? 'bg-blue-100' :
                state === 'error' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {state === 'done' && (
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {state === 'uploading' && (
                  <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {(state === 'idle' || state === 'error') && (
                  <svg className={`w-4 h-4 ${state === 'error' ? 'text-red-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0D1B2A]">
                  {doc.label}
                  {doc.required && <span className="text-red-400 ml-1">*</span>}
                </p>
                {err && <p className="text-xs text-red-500 mt-0.5">{err}</p>}
              </div>

              {state !== 'done' ? (
                <>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    ref={(el) => { inputRefs.current[doc.key] = el }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(doc.key, file)
                    }}
                  />
                  <button
                    onClick={() => inputRefs.current[doc.key]?.click()}
                    disabled={state === 'uploading'}
                    className="shrink-0 text-xs font-bold px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                  >
                    {state === 'uploading' ? 'Upload…' : state === 'error' ? 'Réessayer' : 'Ajouter'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setStates((s) => ({ ...s, [doc.key]: 'idle' }))
                    inputRefs.current[doc.key]?.click()
                  }}
                  className="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Modifier
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-5 text-xs text-gray-400">
        Formats acceptés : JPG, PNG, PDF · Max 10 MB par fichier
      </p>
    </div>
  )
}
