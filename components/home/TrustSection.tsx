const valueProps = [
  {
    label: 'Assurance incluse',
    desc: 'Tous risques sur chaque véhicule',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    label: 'Livraison possible',
    desc: 'À domicile ou sur votre lieu de travail',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17H5a2 2 0 01-2-2V6a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-3m-3 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    label: 'Véhicules récents',
    desc: 'Flotte régulièrement renouvelée',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
  },
  {
    label: 'Tarifs transparents',
    desc: 'Aucun frais caché, caution remboursée',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

const features = [
  {
    title: 'Assurance tous risques',
    desc: 'Chaque véhicule est couvert par une assurance complète. Conduisez l\'esprit tranquille.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    title: 'Assistance 24h/7j',
    desc: 'Notre équipe est joignable à toute heure pour vous accompagner en cas d\'imprévu.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Tarifs transparents',
    desc: 'Pas de frais cachés. Le prix affiché est le prix payé. Caution remboursée à la restitution.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    title: 'Prise en charge rapide',
    desc: 'Réservez en ligne et récupérez votre véhicule en moins de 15 minutes.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    title: 'Flotte impeccable',
    desc: 'Chaque véhicule est inspecté et nettoyé avant chaque location. Propreté garantie.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    title: 'Service personnalisé',
    desc: 'Une équipe à votre écoute pour adapter chaque location à vos besoins spécifiques.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    ),
  },
]

export default function TrustSection() {
  return (
    <section id="confiance" className="bg-navy py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Value props */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-20 lg:pb-24 border-b border-navy-700">
          {valueProps.map(({ label, desc, icon }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div className="text-gold">{icon}</div>
              <div>
                <div className="text-white font-bold text-sm sm:text-base">{label}</div>
                <div className="text-gray-500 text-xs mt-1">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features header */}
        <div className="text-center mt-20 mb-12">
          <span className="text-gold text-[11px] font-bold uppercase tracking-[0.2em]">Nos engagements</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
            Pourquoi choisir JJ AUTO 92 ?
          </h2>
          <div className="w-14 h-1 bg-gold mx-auto mt-5" />
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="group flex gap-5 bg-navy-800 hover:bg-navy-700 rounded-2xl p-6 transition-colors cursor-default"
            >
              <div className="text-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{title}</h3>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA phone */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-gray-400 text-sm">Une question avant de réserver ?</p>
          <a
            href="tel:+33761422192"
            className="inline-flex items-center gap-2.5 bg-gold hover:bg-gold/90 text-navy font-extrabold text-sm px-6 py-3 rounded-full transition-colors tracking-widest uppercase"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            07 61 42 21 92
          </a>
        </div>
      </div>
    </section>
  )
}
