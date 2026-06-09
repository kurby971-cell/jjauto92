import { Suspense } from 'react'
import type { Metadata } from 'next'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Créer un compte — JJ AUTO 92',
  description: 'Créez votre espace client JJ AUTO 92 pour gérer vos réservations et documents.',
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-gray-50 animate-pulse" />}>
      <SignupForm />
    </Suspense>
  )
}
