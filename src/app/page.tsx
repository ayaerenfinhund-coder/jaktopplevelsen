'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import { MapPin, Camera, BarChart3, Cloud, TreePine } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

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
            {!loading && (
              <div className="space-x-4">
                {user ? (
                  <Link href="/trips/new">
                    <Button size="lg">
                      <MapPin className="w-5 h-5 mr-2" />
                      Logg ny tur
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button size="lg">Kom i gang</Button>
                    </Link>
                    <Link href="/auth">
                      <Button size="lg" variant="outline">
                        Logg inn
                      </Button>
                    </Link>
                  </>
                )}
              </div>
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
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-forest-600">
                Opprett gratis konto
              </Button>
            </Link>
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
