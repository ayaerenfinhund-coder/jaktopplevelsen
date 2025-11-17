'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import { MapPin, Camera, BarChart3, Cloud, TreePine } from 'lucide-react'

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      // Error handled by hook
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <TreePine className="w-16 h-16 mx-auto text-forest-600 mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-forest-900 mb-6">
              Jaktopplevelsen
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Logg dine jaktturer, spor viltet, og del opplevelsene.
              Alt på ett sted.
            </p>
            {!loading && !user && (
              <div className="space-x-4">
                <Button size="lg" onClick={handleGoogleSignIn} loading={signingIn}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Logg inn med Google
                </Button>
              </div>
            )}
            {!loading && user && (
              <Button size="lg" onClick={() => router.push('/trips/new')}>
                <MapPin className="w-5 h-5 mr-2" />
                Logg ny tur
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-forest-900 mb-12">
          Alt du trenger for å dokumentere jakten
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MapPin className="w-12 h-12 mx-auto text-forest-600 mb-4" />
            <h3 className="text-xl font-semibold text-forest-800 mb-2">
              GPS-sporing
            </h3>
            <p className="text-gray-600">
              Marker nøyaktig hvor du jaktet med interaktive kart
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Camera className="w-12 h-12 mx-auto text-forest-600 mb-4" />
            <h3 className="text-xl font-semibold text-forest-800 mb-2">
              Bildegallerier
            </h3>
            <p className="text-gray-600">
              Last opp bilder fra turen og bygg ditt jaktarkiv
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-forest-600 mb-4" />
            <h3 className="text-xl font-semibold text-forest-800 mb-2">
              Statistikk
            </h3>
            <p className="text-gray-600">
              Se detaljert statistikk over dine jaktturer og utbytte
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Cloud className="w-12 h-12 mx-auto text-forest-600 mb-4" />
            <h3 className="text-xl font-semibold text-forest-800 mb-2">
              Værforhold
            </h3>
            <p className="text-gray-600">
              Logg værdata og finn mønstre for bedre jakt
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-forest-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klar til å starte?
          </h2>
          <p className="text-xl mb-8 text-forest-100">
            Bli med tusenvis av jegere som allerede bruker Jaktopplevelsen
          </p>
          {!loading && !user && (
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-forest-600"
              onClick={handleGoogleSignIn}
              loading={signingIn}
            >
              Opprett gratis konto
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-earth-900 text-earth-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <TreePine className="w-8 h-8 mx-auto mb-4" />
          <p className="text-sm">
            © 2024 Jaktopplevelsen. Alle rettigheter reservert.
          </p>
        </div>
      </footer>
    </div>
  )
}
