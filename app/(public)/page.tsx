import HeroSection from '@/components/home/HeroSection'
import FleetSection from '@/components/home/FleetSection'
import TrustSection from '@/components/home/TrustSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import JsonLd from '@/components/JsonLd'
import { localBusinessSchema, breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
      ])} />
      <HeroSection />
      <FleetSection />
      <TrustSection />
      <TestimonialsSection />
    </>
  )
}
