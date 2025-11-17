'use client'

import { useState, useCallback, useRef } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl'
import { MapPin } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

interface LocationPickerProps {
  initialCoordinates?: [number, number]
  onLocationSelect: (coordinates: [number, number], locationName: string) => void
}

export default function LocationPicker({
  initialCoordinates,
  onLocationSelect,
}: LocationPickerProps) {
  const [marker, setMarker] = useState<[number, number] | null>(
    initialCoordinates || null
  )
  const [locationName, setLocationName] = useState('')
  const mapRef = useRef<any>(null)

  const handleMapClick = useCallback(
    async (event: any) => {
      const { lng, lat } = event.lngLat
      const coords: [number, number] = [lng, lat]
      setMarker(coords)

      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        )
        const data = await response.json()
        const placeName = data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        setLocationName(placeName)
        onLocationSelect(coords, placeName)
      } catch (error) {
        const fallbackName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        setLocationName(fallbackName)
        onLocationSelect(coords, fallbackName)
      }
    },
    [onLocationSelect]
  )

  return (
    <div className="space-y-2">
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: initialCoordinates?.[0] || 10.75,
            latitude: initialCoordinates?.[1] || 59.91,
            zoom: 8,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/outdoors-v12"
          onClick={handleMapClick}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
            trackUserLocation
            onGeolocate={(e) => {
              const coords: [number, number] = [e.coords.longitude, e.coords.latitude]
              setMarker(coords)
              handleMapClick({ lngLat: { lng: coords[0], lat: coords[1] } })
            }}
          />
          {marker && (
            <Marker longitude={marker[0]} latitude={marker[1]} anchor="bottom">
              <MapPin className="w-8 h-8 text-forest-600" fill="currentColor" />
            </Marker>
          )}
        </Map>
      </div>
      {locationName && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Valgt lokasjon:</span> {locationName}
        </p>
      )}
      <p className="text-xs text-gray-500">
        Klikk på kartet for å velge jaktsted, eller bruk GPS-knappen for din posisjon
      </p>
    </div>
  )
}
