'use client'

import { useEffect, useState } from 'react'
import type { Vehicle } from '@/lib/types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vehicules')
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { vehicles, loading, error }
}
