import SearchForm from './SearchForm'

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden">

      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse at 15% 75%, rgba(201,168,76,0.14) 0%, transparent 55%)',
            'radial-gradient(ellipse at 85% 25%, rgba(201,168,76,0.09) 0%, transparent 50%)',
            'linear-gradient(145deg, #0D1B2A 0%, #162535 45%, #0a1318 100%)',
          ].join(', '),
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top gold accent line */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 w-full">

        {/* Text content */}
        <div className="max-w-2xl mb-10">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 text-gold text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Location de véhicules · Île-de-France · 92
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
            Conduisez{' '}
            <span className="text-gold">l&apos;Excellence</span>
            <br />
            en Île-de-France
          </h1>

          {/* Gold divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px w-16 bg-gold" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
            Véhicules soigneusement sélectionnés, service impeccable.
            Réservez en quelques clics — conduisez dès aujourd&apos;hui.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-5 mt-7">
            {[
              'Assurance incluse',
              'Assistance 24h/7j',
              'Sans frais cachés',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-gold shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Search form */}
        <div className="max-w-4xl">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Réserver un véhicule
          </p>
          <SearchForm />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 text-gray-600 animate-bounce">
        <span className="text-[10px] tracking-widest uppercase">Défiler</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </section>
  )
}
