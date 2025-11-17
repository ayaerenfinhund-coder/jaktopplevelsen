'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { motion, AnimatePresence } from 'framer-motion'
import { useOffline } from '@/lib/offline-context'
import * as turf from '@turf/turf'
import { Play, Pause, SkipBack, Camera, MapPin } from 'lucide-react'

// Set your Mapbox token here or in environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN'

interface HuntPath {
  id: string
  path: Array<{ lat: number; lng: number; timestamp: number }>
  photos: Array<{
    id: string
    url: string
    lat: number
    lng: number
    thumbnail?: string
    caption?: string
  }>
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedHunt, setSelectedHunt] = useState<HuntPath | null>(null)
  const [isFlying, setIsFlying] = useState(false)
  const [flyProgress, setFlyProgress] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const animationRef = useRef<number | null>(null)
  const { getHunts } = useOffline()
  const [hunts, setHunts] = useState<HuntPath[]>([])
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [10.0, 60.0], // Norway default
      zoom: 8,
      pitch: 0,
      bearing: 0,
    })

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    )

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    )

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Load hunts
  useEffect(() => {
    const loadHunts = async () => {
      const data = await getHunts()
      setHunts(data as HuntPath[])
    }
    loadHunts()
  }, [getHunts])

  // Draw hunt paths on map
  useEffect(() => {
    if (!map.current || hunts.length === 0) return

    const addPaths = () => {
      // Clear existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      hunts.forEach((hunt) => {
        if (hunt.path.length < 2) return

        const coordinates = hunt.path.map((p) => [p.lng, p.lat])

        // Add path line
        if (map.current?.getSource(`path-${hunt.id}`)) {
          map.current?.removeLayer(`path-line-${hunt.id}`)
          map.current?.removeSource(`path-${hunt.id}`)
        }

        map.current?.addSource(`path-${hunt.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        })

        map.current?.addLayer({
          id: `path-line-${hunt.id}`,
          type: 'line',
          source: `path-${hunt.id}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#16a34a',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        })

        // Add photo markers with thumbnails
        hunt.photos.forEach((photo) => {
          const el = document.createElement('div')
          el.className = 'photo-marker'
          el.style.backgroundImage = `url(${photo.thumbnail || photo.url})`

          const marker = new mapboxgl.Marker(el)
            .setLngLat([photo.lng, photo.lat])
            .addTo(map.current!)

          el.addEventListener('click', () => {
            setSelectedPhoto(photo)
            if ('vibrate' in navigator) navigator.vibrate(20)
          })

          markersRef.current.push(marker)
        })
      })
    }

    if (map.current?.loaded()) {
      addPaths()
    } else {
      map.current?.on('load', addPaths)
    }
  }, [hunts])

  // Flythrough animation
  const startFlythrough = (hunt: HuntPath) => {
    if (!map.current || hunt.path.length < 2) return

    setSelectedHunt(hunt)
    setIsFlying(true)
    setFlyProgress(0)

    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate([30, 20, 30])

    const coordinates = hunt.path.map((p) => [p.lng, p.lat])
    const line = turf.lineString(coordinates)
    const totalDistance = turf.length(line, { units: 'kilometers' })

    // Set initial camera
    map.current.setPitch(60)
    map.current.setZoom(15)

    let distance = 0
    const speed = 0.02 // km per frame
    const fps = 60

    const animate = () => {
      if (!map.current || !isFlying) return

      distance += speed
      const progress = Math.min(distance / totalDistance, 1)
      setFlyProgress(progress * 100)

      if (progress >= 1) {
        setIsFlying(false)
        setFlyProgress(100)
        map.current.setPitch(0)
        return
      }

      // Get current position along the line
      const along = turf.along(line, distance, { units: 'kilometers' })
      const center = along.geometry.coordinates as [number, number]

      // Get next position for bearing calculation
      const nextDistance = Math.min(distance + speed * 5, totalDistance)
      const nextAlong = turf.along(line, nextDistance, { units: 'kilometers' })
      const nextCoords = nextAlong.geometry.coordinates as [number, number]

      // Calculate bearing
      const bearing = turf.bearing(center, nextCoords)

      // Smooth camera movement
      map.current.easeTo({
        center,
        bearing,
        pitch: 60,
        duration: 1000 / fps,
        easing: (t) => t,
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const stopFlythrough = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsFlying(false)
    if (map.current) {
      map.current.setPitch(0)
    }
    if ('vibrate' in navigator) navigator.vibrate(30)
  }

  const resetFlythrough = () => {
    stopFlythrough()
    setFlyProgress(0)
    if ('vibrate' in navigator) navigator.vibrate(20)
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Hunt Selection */}
      {hunts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-3 max-w-xs"
        >
          <label className="text-xs font-medium text-forest-600 block mb-2">
            Velg jakttur for flythrough
          </label>
          <select
            onChange={(e) => {
              const hunt = hunts.find((h) => h.id === e.target.value)
              if (hunt) setSelectedHunt(hunt)
            }}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-hunt-500 focus:border-hunt-500"
          >
            <option value="">Velg jakttur...</option>
            {hunts.map((hunt) => (
              <option key={hunt.id} value={hunt.id}>
                {(hunt as any).title || `Jakt ${hunt.id.slice(-6)}`}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Flythrough Controls */}
      {selectedHunt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={resetFlythrough}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={() =>
                isFlying ? stopFlythrough() : startFlythrough(selectedHunt)
              }
              className="p-3 rounded-xl bg-hunt-600 hover:bg-hunt-700 text-white transition-colors active:scale-95"
            >
              {isFlying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-hunt-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${flyProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-xs text-forest-600 mt-1">
                {Math.round(flyProgress)}% fullført
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-2 max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt="Hunt photo"
                className="w-full h-auto rounded-lg"
              />
              {selectedPhoto.caption && (
                <p className="p-3 text-forest-700 text-sm">
                  {selectedPhoto.caption}
                </p>
              )}
              <div className="flex items-center gap-2 px-3 pb-3 text-xs text-forest-500">
                <MapPin size={12} />
                <span>
                  {selectedPhoto.lat.toFixed(6)}, {selectedPhoto.lng.toFixed(6)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
