'use client'

import { useState, useRef } from 'react'

export interface PhotoItem {
  url: string
  label: string
  is_primary: boolean
}

interface Props {
  vehicleId: string | null
  photos: PhotoItem[]
  onPhotosChange: (photos: PhotoItem[]) => void
  onPendingFiles: (files: File[]) => void
}

export default function PhotoGallery({ vehicleId, photos, onPhotosChange, onPendingFiles }: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [pendingPreviews, setPendingPreviews] = useState<{ file: File; previewUrl: string }[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Effective photo list for display
  const pendingAsPhotos: PhotoItem[] = pendingPreviews.map(p => ({
    url: p.previewUrl, label: '', is_primary: false,
  }))
  const allPhotos = [...photos, ...pendingAsPhotos]

  async function handleFiles(fileList: FileList) {
    setUploadError(null)
    const files = Array.from(fileList).filter(f => f.size <= 8 * 1024 * 1024)
    if (files.length < fileList.length) setUploadError('Certains fichiers dépassent 8 Mo et ont été ignorés.')

    if (!vehicleId) {
      // Create mode — store locally
      const previews = files.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
      const next = [...pendingPreviews, ...previews]
      setPendingPreviews(next)
      onPendingFiles(next.map(p => p.file))
      return
    }

    // Edit mode — upload immediately
    setUploading(true)
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/photos`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onPhotosChange(data.photos)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  async function persistOrder(newPhotos: PhotoItem[]) {
    if (!vehicleId) return
    await fetch(`/api/admin/vehicles/${vehicleId}/photos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: newPhotos }),
    })
  }

  // Drag & drop
  function onDragStart(i: number) { setDragIndex(i) }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIndex(i) }
  function onDragEnd() { setDragIndex(null); setDragOverIndex(null) }

  function onDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) { onDragEnd(); return }

    const isPendingDrag = dragIndex >= photos.length
    const isPendingTarget = targetIndex >= photos.length

    if (isPendingDrag || isPendingTarget) {
      // Reorder inside pending (create mode only)
      const arr = [...allPhotos]
      const [removed] = arr.splice(dragIndex, 1)
      arr.splice(targetIndex, 0, removed)
      const newPending = arr.slice(photos.length).map((p, idx) => {
        const match = pendingPreviews.find(pp => pp.previewUrl === p.url)
        return match ?? { file: new File([], ''), previewUrl: p.url }
      })
      setPendingPreviews(newPending)
      onPendingFiles(newPending.map(p => p.file))
    } else {
      const arr = [...photos]
      const [removed] = arr.splice(dragIndex, 1)
      arr.splice(targetIndex, 0, removed)
      const normalized = arr.map((p, i) => ({ ...p, is_primary: i === 0 }))
      onPhotosChange(normalized)
      persistOrder(normalized)
    }
    onDragEnd()
  }

  function deletePhoto(i: number) {
    const isPending = i >= photos.length
    if (isPending) {
      const pi = i - photos.length
      const next = pendingPreviews.filter((_, idx) => idx !== pi)
      setPendingPreviews(next)
      onPendingFiles(next.map(p => p.file))
    } else {
      const next = photos.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, is_primary: idx === 0 }))
      onPhotosChange(next)
      persistOrder(next)
    }
    setDeleteConfirm(null)
  }

  return (
    <div>
      {/* Upload zone */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-[#C9A84C] text-gray-500 hover:text-[#0D1B2A] rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? 'Envoi en cours…' : 'Ajouter des photos'}
        </button>
        <span className="text-xs text-gray-400">JPG, PNG, WebP · max 8 Mo par photo · multiple sélection possible</span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }} />
      </div>

      {uploadError && (
        <p className="text-amber-600 text-xs mb-3">{uploadError}</p>
      )}

      {allPhotos.length === 0 ? (
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm cursor-pointer hover:border-[#C9A84C] transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Aucune photo — cliquez pour en ajouter
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allPhotos.map((photo, i) => {
            const isPending = i >= photos.length
            const isDragging = dragIndex === i
            const isOver = dragOverIndex === i && dragIndex !== i

            return (
              <div
                key={`${photo.url}-${i}`}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={() => onDrop(i)}
                onDragEnd={onDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                  isOver ? 'border-[#C9A84C] scale-[0.97]' : 'border-transparent'
                } ${isDragging ? 'opacity-30 scale-95' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full aspect-[4/3] object-cover" draggable={false} />

                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-[#C9A84C] text-[#0D1B2A] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    Principale
                  </span>
                )}

                {isPending && (
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[10px] font-bold text-center py-1">
                    En attente d'envoi
                  </div>
                )}

                {/* Delete */}
                {deleteConfirm === i ? (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
                    <p className="text-white text-xs font-bold text-center">Supprimer ?</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => deletePhoto(i)}
                        className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">Oui</button>
                      <button type="button" onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-white text-gray-700 text-xs font-bold rounded-lg">Non</button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Drag hint */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-px opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
                  {[0,1,2,3,4,5].map(j => <span key={j} className="w-px h-3 bg-white rounded-full" />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {allPhotos.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          Glissez pour réordonner · La première photo est la photo principale
        </p>
      )}
    </div>
  )
}
