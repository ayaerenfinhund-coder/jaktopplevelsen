'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus, Search, Filter, MapPin, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth()
  const { trips, loading: tripsLoading, deleteTrip } = useTrips(user?.uid)
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')

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

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterType || trip.gameType.includes(filterType)
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (tripId: string) => {
    if (confirm('Er du sikker på at du vil slette denne turen?')) {
      await deleteTrip(tripId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-forest-900">Mine jaktturer</h1>
          <Link href="/trips/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Ny jakttur
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Søk etter tur eller lokasjon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 appearance-none"
              >
                <option value="">Alle vilttyper</option>
                <option value="elg">Elg</option>
                <option value="hjort">Hjort</option>
                <option value="rådyr">Rådyr</option>
                <option value="rype">Rype</option>
                <option value="and">And</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trips List */}
        {tripsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-32 bg-white rounded-xl"></div>
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <Link href={`/trips/${trip.id}`} className="flex-1">
                      <h3 className="text-xl font-semibold text-forest-800 hover:text-forest-600">
                        {trip.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{trip.location.name}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {format(new Date(trip.date), 'EEEE, dd. MMMM yyyy', { locale: nb })}
                        </span>
                      </div>
                      {trip.description && (
                        <p className="text-gray-600 mt-2 line-clamp-2">{trip.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {trip.gameType.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-forest-100 text-forest-800 rounded text-xs"
                          >
                            {type}
                          </span>
                        ))}
                        {trip.gameHarvested.length > 0 && (
                          <span className="px-2 py-1 bg-earth-100 text-earth-800 rounded text-xs font-medium">
                            {trip.gameHarvested.reduce((sum, g) => sum + g.count, 0)} felt
                          </span>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {trip.photos.length > 0 && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="flex gap-2 overflow-x-auto">
                      {trip.photos.slice(0, 4).map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Trip photo ${i + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                      {trip.photos.length > 4 && (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                          +{trip.photos.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || filterType ? 'Ingen turer funnet' : 'Ingen jaktturer ennå'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType
                ? 'Prøv å endre søkekriteriene'
                : 'Start med å logge din første jakttur'}
            </p>
            {!searchTerm && !filterType && (
              <Link href="/trips/new">
                <Button>Logg første tur</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
