'use client'

import { useState } from 'react'

export interface FaqQuestion {
  q: string
  a: string
}

export interface FaqCategory {
  id: string
  title: string
  icon: string
  questions: FaqQuestion[]
}

export default function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

      {/* Sidebar navigation */}
      <aside className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-28">
          <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4 px-2">Catégories</p>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-navy text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Questions */}
      <div className="lg:col-span-3 space-y-12">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="text-navy font-extrabold text-xl">{cat.title}</h2>
            </div>
            <div className="space-y-3">
              {cat.questions.map((item, i) => {
                const key = `${cat.id}-${i}`
                const isOpen = open === key
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-colors ${isOpen ? 'border-gold/40' : 'border-gray-100'}`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-navy text-sm leading-snug">{item.q}</span>
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full border-2 border-gold flex items-center justify-center text-gold transition-transform duration-200 ${isOpen ? 'rotate-45 bg-gold text-navy' : ''}`}
                      >
                        <svg className={`w-3.5 h-3.5 ${isOpen ? 'text-navy' : 'text-gold'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                    >
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                        <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
