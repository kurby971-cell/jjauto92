'use client'

interface Props {
  label?: string
  variant?: 'primary' | 'ghost'
}

export default function PrintButton({ label = 'Imprimer / Sauvegarder PDF', variant = 'primary' }: Props) {
  if (variant === 'ghost') {
    return (
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0D1B2A] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-[#0D1B2A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#1a2d45] transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      {label}
    </button>
  )
}
