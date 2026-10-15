// Cette page sert "/" (la copie dans app/(public)/page.tsx est ignorée tant que celle-ci existe).
// Elle reproduit donc le layout public : en-tête, pied de page, bandeau cookies, données structurées.
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CookieBanner from '@/components/layout/CookieBanner'
import HeroSection from '@/components/home/HeroSection'
import FleetSection from '@/components/home/FleetSection'
import TrustSection from '@/components/home/TrustSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import JsonLd from '@/components/JsonLd'
import { localBusinessSchema, breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function RootPage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={breadcrumbListSchema([{ name: 'Accueil', url: SITE_URL }])} />
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FleetSection />
        <TrustSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}
