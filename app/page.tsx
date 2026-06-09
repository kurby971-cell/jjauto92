// Fallback si app/(public)/page.tsx entre en conflit de route.
// Si Next.js remonte une erreur de route dupliquée, supprimez ce fichier —
// la page d'accueil réelle est dans app/(public)/page.tsx avec son layout.
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import FleetSection from '@/components/home/FleetSection'
import TrustSection from '@/components/home/TrustSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'

export default function RootPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FleetSection />
        <TrustSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
