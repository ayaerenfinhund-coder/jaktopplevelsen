'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import Navbar from '@/components/layout/Navbar'
import TripForm from '@/components/trips/TripForm'
import { TripFormData } from '@/types'

export default function NewTripPage() {
  const { user, loading: authLoading } = useAuth()
  const { addTrip } = useTrips(user?.uid)
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

  const handleSubmit = async (data: TripFormData, photos: File[]) => {
    await addTrip(data, photos)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-8">Logg ny jakttur</h1>
        <TripForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
