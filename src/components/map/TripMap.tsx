'use client'

import { useMemo } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl'
import { MapPin } from 'lucide-react'
import { Trip } from '@/types'
import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

interface TripMapProps {
  trips: Trip[]
  onTripClick?: (trip: Trip) => void
}

export default function TripMap({ trips, onTripClick }: TripMapProps) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const bounds = useMemo(() => {
    if (trips.length === 0) return null

    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity

    trips.forEach((trip) => {
      const [lng, lat] = trip.location.coordinates
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    })

    return {
      longitude: (minLng + maxLng) / 2,
      latitude: (minLat + maxLat) / 2,
      zoom: 7,
    }
  }, [trips])

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={
          bounds || {
            longitude: 10.75,
            latitude: 59.91,
            zoom: 6,
          }
        }
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
      >
        <NavigationControl position="top-right" />
        {trips.map((trip) => (
          <Marker
            key={trip.id}
            longitude={trip.location.coordinates[0]}
            latitude={trip.location.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedTrip(trip)
              onTripClick?.(trip)
            }}
          >
            <MapPin
              className="w-6 h-6 text-forest-600 cursor-pointer hover:text-forest-700 transition-colors"
              fill="currentColor"
            />
          </Marker>
        ))}
        {selectedTrip && (
          <Popup
            longitude={selectedTrip.location.coordinates[0]}
            latitude={selectedTrip.location.coordinates[1]}
            anchor="top"
            onClose={() => setSelectedTrip(null)}
            closeOnClick={false}
          >
            <div className="p-2">
              <h3 className="font-semibold text-forest-800">{selectedTrip.title}</h3>
              <p className="text-sm text-gray-600">{selectedTrip.date}</p>
              <p className="text-sm text-gray-600">{selectedTrip.location.name}</p>
              {selectedTrip.gameHarvested.length > 0 && (
                <p className="text-sm font-medium text-forest-700 mt-1">
                  Felt: {selectedTrip.gameHarvested.map((g) => `${g.count} ${g.type}`).join(', ')}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
