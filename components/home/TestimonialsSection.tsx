// Pour ajouter un avis, insérez un objet dans ce tableau :
// { name: 'Prénom N.', city: 'Ville', rating: 5, date: 'Juin 2026',
//   source: 'Getaround' | 'Google' | 'Direct', text: '...' }
const reviews: {
  name: string
  city: string
  rating: number
  date: string
  source: 'Getaround' | 'Google' | 'Direct'
  text: string
}[] = []

const sourceLabels: Record<string, string> = {
  Getaround: 'Avis vérifié Getaround',
  Google: 'Avis vérifié Google',
  Direct: 'Avis client direct',
}

const sourceColors: Record<string, string> = {
  Getaround: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Google: 'bg-blue-50 text-blue-700 border-blue-200',
  Direct: 'bg-gold/10 text-amber-700 border-amber-200',
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-gold' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section id="avis" className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-gold text-[11px] font-bold uppercase tracking-[0.2em]">Avis clients</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mt-3 leading-tight">
            Ce que disent nos clients
          </h2>
          <div className="w-14 h-1 bg-gold mx-auto mt-5" />
        </div>

        {reviews.length > 0 ? (
          <>
            {/* Review cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map(({ name, city, rating, date, source, text }) => (
                <div
                  key={`${name}-${date}`}
                  className="relative bg-gray-50 hover:bg-gray-100 rounded-2xl p-8 transition-colors"
                >
                  <div className="absolute top-5 right-7 text-8xl font-serif text-gold/10 leading-none select-none pointer-events-none">
                    &#8220;
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Stars count={rating} />
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${sourceColors[source]}`}>
                      {sourceLabels[source]}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed">
                    &ldquo;{text}&rdquo;
                  </p>

                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-gold font-bold text-sm shrink-0">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-navy text-sm">{name}</p>
                        <p className="text-gray-400 text-xs">{city}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">{date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Google */}
            <div className="text-center mt-12">
              <a
                href="https://g.page/r/write-a-review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-navy hover:text-navy text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Laisser un avis Google
              </a>
            </div>
          </>
        ) : (
          /* Placeholder — affiché tant que reviews[] est vide */
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 bg-gray-50 rounded-2xl py-16 px-8 text-center border border-gray-100">
            <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>

            <div>
              <p className="text-navy font-bold text-lg">Avis clients bientôt disponibles</p>
              <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                Vous avez loué un véhicule avec nous ? Partagez votre expérience sur Google — ça nous aide énormément.
              </p>
            </div>

            <a
              href="https://g.page/r/write-a-review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-navy/90 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Laisser un avis Google
            </a>
          </div>
        )}

      </div>
    </section>
  )
}
