'use client'

const STEPS = [
  { n: 1, label: 'Récapitulatif' },
  { n: 2, label: 'Conducteur' },
  { n: 3, label: 'Paiement' },
]

interface Props {
  current: number
}

export default function ProgressBar({ current }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
        {/* Progress line */}
        <div
          className="absolute left-0 top-4 h-0.5 bg-gold z-0 transition-all duration-500"
          style={{ width: current === 1 ? '0%' : current === 2 ? '50%' : '100%' }}
        />

        {STEPS.map(({ n, label }) => {
          const done = n < current
          const active = n === current
          return (
            <div key={n} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                  done
                    ? 'bg-gold text-navy'
                    : active
                    ? 'bg-navy text-gold border-2 border-gold'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-widest hidden sm:block ${
                  active ? 'text-navy' : done ? 'text-gold' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
