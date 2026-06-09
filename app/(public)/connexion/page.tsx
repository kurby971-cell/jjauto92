import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion — JJ AUTO 92',
  description: 'Connectez-vous à votre espace client JJ AUTO 92 pour gérer vos réservations.',
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-gray-50 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
