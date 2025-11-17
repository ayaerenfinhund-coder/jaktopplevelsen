'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import Navbar from '@/components/layout/Navbar'
import TripMap from '@/components/map/TripMap'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus, MapPin, Target, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { trips, loading: tripsLoading } = useTrips(user?.uid)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 to-earth-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest-600"></div>
      </div>
    )
  }

  // Calculate statistics
  const totalTrips = trips.length
  const totalHarvested = trips.reduce(
    (sum, trip) => sum + trip.gameHarvested.reduce((s, g) => s + g.count, 0),
    0
  )
  const lastTrip = trips[0]
  const thisYearTrips = trips.filter(
    (t) => new Date(t.date).getFullYear() === new Date().getFullYear()
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest-900">
              Hei, {user.displayName || 'Jeger'}!
            </h1>
            <p className="text-gray-600">Her er oversikten over dine jaktturer</p>
          </div>
          <Link href="/trips/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Ny jakttur
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Totalt turer</p>
                <p className="text-3xl font-bold text-forest-800">{totalTrips}</p>
              </div>
              <MapPin className="w-10 h-10 text-forest-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Felt vilt</p>
                <p className="text-3xl font-bold text-forest-800">{totalHarvested}</p>
              </div>
              <Target className="w-10 h-10 text-forest-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Turer i år</p>
                <p className="text-3xl font-bold text-forest-800">{thisYearTrips}</p>
              </div>
              <Calendar className="w-10 h-10 text-forest-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Siste tur</p>
                <p className="text-lg font-bold text-forest-800">
                  {lastTrip
                    ? format(new Date(lastTrip.date), 'dd. MMM', { locale: nb })
                    : 'Ingen'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-forest-600" />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-forest-800 mb-4">Dine jaktområder</h2>
          {tripsLoading ? (
            <div className="h-[500px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest-600"></div>
            </div>
          ) : trips.length > 0 ? (
            <TripMap trips={trips} onTripClick={(trip) => router.push(`/trips/${trip.id}`)} />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Ingen jaktturer logget ennå</p>
                <Link href="/trips/new">
                  <Button>Logg din første tur</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-forest-800">Siste jaktturer</h2>
            <Link href="/trips" className="text-forest-600 hover:text-forest-700 text-sm font-medium">
              Se alle →
            </Link>
          </div>
          {tripsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : trips.length > 0 ? (
            <div className="space-y-4">
              {trips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-forest-300 hover:bg-forest-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-forest-800">{trip.title}</h3>
                      <p className="text-sm text-gray-600">{trip.location.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(trip.date), 'EEEE, dd. MMMM yyyy', { locale: nb })}
                      </p>
                    </div>
                    <div className="text-right">
                      {trip.gameHarvested.length > 0 && (
                        <span className="inline-block px-2 py-1 bg-forest-100 text-forest-800 rounded text-sm">
                          {trip.gameHarvested.reduce((sum, g) => sum + g.count, 0)} felt
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Du har ikke logget noen jaktturer ennå.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
