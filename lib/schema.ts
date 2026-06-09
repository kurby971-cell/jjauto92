export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jjautomobiles.fr'
export const BUSINESS_ID = `${SITE_URL}/#business`

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['CarRental', 'LocalBusiness'],
    '@id': BUSINESS_ID,
    name: 'JJ AUTO 92',
    legalName: 'J & J Automobiles SAS',
    description: 'Location de véhicules premium en Île-de-France. Assurance incluse, livraison possible, véhicules récents, assistance 24h/7j.',
    url: SITE_URL,
    telephone: '+33761422192',
    email: 'contact@jjautomobiles.fr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1 Allée de Lorraine',
      addressLocality: 'Nanterre',
      postalCode: '92000',
      addressCountry: 'FR',
      addressRegion: 'Île-de-France',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8936,
      longitude: 2.2079,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '09:00',
        closes: '14:00',
      },
    ],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Credit Card, Debit Card',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Île-de-France',
    },
  }
}

interface VehicleSchemaInput {
  slug: string | null
  id: string
  brand: string
  model: string
  year: number
  description: string | null
  daily_rate: number
  deposit_amount: number
  category: string
  fuel_type: string
  seats: number
  photos: Array<{ url: string }>
}

export function vehicleProductSchema(vehicle: VehicleSchemaInput) {
  const slug = vehicle.slug ?? vehicle.id
  const url = `${SITE_URL}/vehicules/${slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Location ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: vehicle.description ?? `Louez la ${vehicle.brand} ${vehicle.model} ${vehicle.year} en Île-de-France chez JJ AUTO 92. Assurance incluse.`,
    image: vehicle.photos.map((p) => p.url),
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: vehicle.daily_rate.toFixed(2),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: vehicle.daily_rate.toFixed(2),
        priceCurrency: 'EUR',
        unitText: 'jour',
      },
      availability: 'https://schema.org/InStock',
      seller: {
        '@id': BUSINESS_ID,
      },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Catégorie', value: vehicle.category },
      { '@type': 'PropertyValue', name: 'Carburant', value: vehicle.fuel_type },
      { '@type': 'PropertyValue', name: 'Nombre de places', value: vehicle.seats },
      { '@type': 'PropertyValue', name: 'Caution', value: `${vehicle.deposit_amount}€` },
    ],
  }
}
