'use client'

import { useState } from 'react'
import type { VehiclePhoto } from '@/lib/types'

interface Props {
  photos: VehiclePhoto[]
  brand: string
  model: string
}

export default function VehicleGallery({ photos, brand, model }: Props) {
  const [current, setCurrent] = useState(
    () => Math.max(0, photos.findIndex((p) => p.is_primary))
  )

  const alt = `${brand} ${model}`

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-video lg:aspect-[21/8] rounded-2xl bg-gradient-to-br from-navy-800 to-navy flex flex-col items-center justify-center gap-3">
        <svg className="w-16 h-16 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p className="text-gold/40 text-xs tracking-widest uppercase font-semibold">Photos bientôt disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full aspect-video lg:aspect-[21/8] rounded-2xl overflow-hidden bg-navy group">
        <img
          key={current}
          src={photos[current].url}
          alt={photos[current].label || alt}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Label overlay */}
        {photos[current].label && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-navy/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              {photos[current].label}
            </span>
          </div>
        )}

        {/* Nav arrows (only if multiple photos) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy/60 hover:bg-navy/90 text-white flex items-center justify-center transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
              aria-label="Photo précédente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={() => setCurrent((i) => (i + 1) % photos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy/60 hover:bg-navy/90 text-white flex items-center justify-center transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
              aria-label="Photo suivante"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-navy/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm tabular-nums">
            {current + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative shrink-0 w-20 h-14 lg:w-24 lg:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === current
                  ? 'border-gold shadow-md scale-105'
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
              aria-label={photo.label || `Photo ${i + 1}`}
            >
              <img
                src={photo.url}
                alt={photo.label || `${alt} — photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
