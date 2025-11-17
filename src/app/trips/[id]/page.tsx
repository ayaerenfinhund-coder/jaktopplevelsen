'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Trip } from '@/types'
import Navbar from '@/components/layout/Navbar'
import TripMap from '@/components/map/TripMap'
import Button from '@/components/ui/Button'
import { ArrowLeft, Calendar, MapPin, Cloud, Thermometer, Users, Wrench } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import Link from 'next/link'

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchTrip = async () => {
      if (!user) return

      try {
        const tripDoc = await getDoc(doc(db, 'trips', params.id))
        if (tripDoc.exists()) {
          const data = tripDoc.data()
          setTrip({
            id: tripDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as Trip)
        }
      } catch (error) {
        console.error('Error fetching trip:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [user, params.id])

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 to-earth-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest-600"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Tur ikke funnet</h1>
          <Link href="/trips">
            <Button>Tilbake til turer</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-forest-600 hover:text-forest-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Tilbake
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-forest-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
            <div className="flex flex-wrap gap-4 text-forest-100">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {format(new Date(trip.date), 'EEEE, dd. MMMM yyyy', { locale: nb })}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {trip.location.name}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {trip.description && (
              <div>
                <h2 className="text-lg font-semibold text-forest-800 mb-2">Beskrivelse</h2>
                <p className="text-gray-700">{trip.description}</p>
              </div>
            )}

            {/* Time and Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-forest-800 mb-2">Tid</h3>
                <p className="text-gray-700">
                  {trip.startTime} - {trip.endTime}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-forest-800 mb-2">Værforhold</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Cloud className="w-5 h-5 mr-1 text-gray-600" />
                    <span>{trip.weather}</span>
                  </div>
                  <div className="flex items-center">
                    <Thermometer className="w-5 h-5 mr-1 text-gray-600" />
                    <span>{trip.temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game */}
            <div>
              <h2 className="text-lg font-semibold text-forest-800 mb-2">Vilt</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {trip.gameType.map((type) => (
                  <span key={type} className="px-3 py-1 bg-forest-100 text-forest-800 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
              {trip.gameHarvested.length > 0 && (
                <div className="bg-forest-50 rounded-lg p-4">
                  <h3 className="font-semibold text-forest-800 mb-2">Felt vilt</h3>
                  <div className="space-y-2">
                    {trip.gameHarvested.map((game, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="font-medium">{game.type}</span>
                        <div className="text-gray-700">
                          <span className="font-semibold">{game.count}</span> stk
                          {game.weight && <span className="ml-2">({game.weight} kg)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div>
              <h2 className="text-lg font-semibold text-forest-800 mb-2">Lokasjon</h2>
              <TripMap trips={[trip]} />
            </div>

            {/* Photos */}
            {trip.photos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-forest-800 mb-2">Bilder</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {trip.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Trip photo ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Companions */}
            {trip.companions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-forest-800 mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Jaktlag
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trip.companions.map((companion, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-earth-100 text-earth-800 rounded-full"
                    >
                      {companion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {trip.equipment.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-forest-800 mb-2 flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Utstyr
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trip.equipment.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {trip.notes && (
              <div>
                <h2 className="text-lg font-semibold text-forest-800 mb-2">Notater</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
