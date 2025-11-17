'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Trip, TripFormData } from '@/types'

export function useTrips(userId: string | undefined) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setTrips([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tripsData: Trip[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          tripsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as Trip)
        })
        setTrips(tripsData)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const addTrip = async (tripData: TripFormData, photos: File[]) => {
    if (!userId) throw new Error('User not authenticated')

    setError(null)
    try {
      // Upload photos first
      const photoUrls: string[] = []
      for (const photo of photos) {
        const photoRef = ref(storage, `trips/${userId}/${Date.now()}_${photo.name}`)
        await uploadBytes(photoRef, photo)
        const url = await getDownloadURL(photoRef)
        photoUrls.push(url)
      }

      const newTrip = {
        userId,
        title: tripData.title,
        description: tripData.description,
        date: tripData.date,
        startTime: tripData.startTime,
        endTime: tripData.endTime,
        location: {
          name: tripData.locationName,
          coordinates: tripData.coordinates,
        },
        weather: tripData.weather,
        temperature: tripData.temperature,
        gameType: tripData.gameType,
        gameHarvested: tripData.gameHarvested,
        photos: photoUrls,
        notes: tripData.notes,
        companions: tripData.companions,
        equipment: tripData.equipment,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await addDoc(collection(db, 'trips'), newTrip)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add trip'
      setError(message)
      throw err
    }
  }

  const updateTrip = async (tripId: string, tripData: Partial<TripFormData>) => {
    if (!userId) throw new Error('User not authenticated')

    setError(null)
    try {
      const tripRef = doc(db, 'trips', tripId)
      await updateDoc(tripRef, {
        ...tripData,
        updatedAt: Timestamp.now(),
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update trip'
      setError(message)
      throw err
    }
  }

  const deleteTrip = async (tripId: string) => {
    if (!userId) throw new Error('User not authenticated')

    setError(null)
    try {
      await deleteDoc(doc(db, 'trips', tripId))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete trip'
      setError(message)
      throw err
    }
  }

  return {
    trips,
    loading,
    error,
    addTrip,
    updateTrip,
    deleteTrip,
  }
}
