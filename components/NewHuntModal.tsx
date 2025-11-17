'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, MapPin, Play, Square, Save } from 'lucide-react'
import { useOffline } from '@/lib/offline-context'
import { useAuth } from '@/lib/auth-context'

interface NewHuntModalProps {
  onClose: () => void
}

export default function NewHuntModal({ onClose }: NewHuntModalProps) {
  const { user } = useAuth()
  const { saveHunt, queuePhoto } = useOffline()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [path, setPath] = useState<Array<{ lat: number; lng: number; timestamp: number }>>([])
  const [photos, setPhotos] = useState<Array<{ file: File; lat: number; lng: number }>>([])
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported')
      return
    }

    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50])
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        }
        setPath((prev) => [...prev, newPoint])
        setCurrentPosition({ lat: newPoint.lat, lng: newPoint.lng })
      },
      (err) => console.error('Tracking error:', err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
    if ('vibrate' in navigator) navigator.vibrate([30, 20, 30])
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !currentPosition) return

    if ('vibrate' in navigator) navigator.vibrate(30)

    Array.from(files).forEach((file) => {
      setPhotos((prev) => [
        ...prev,
        { file, lat: currentPosition.lat, lng: currentPosition.lng },
      ])
    })
  }

  const handleSave = async () => {
    if (!title || !location || !user) return

    setSaving(true)
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 100])

    try {
      // Save hunt data
      const huntId = await saveHunt({
        userId: user.uid,
        title,
        date: new Date().toISOString(),
        location,
        path,
        photos: [],
        notes,
      })

      // Queue photos for upload
      for (const photo of photos) {
        await queuePhoto(huntId, photo.file, photo.lat, photo.lng)
      }

      // Success haptic
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])

      onClose()
    } catch (error) {
      console.error('Failed to save hunt:', error)
      alert('Kunne ikke lagre jaktturen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-forest-900">Ny jakttur</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-forest-700 block mb-1">
              Tittel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. Morgentur i Nordmarka"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hunt-500 focus:border-hunt-500 transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-forest-700 block mb-1">
              Område
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="F.eks. Nordmarka, Oslo"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hunt-500 focus:border-hunt-500 transition-all"
            />
          </div>

          {/* GPS Tracking */}
          <div>
            <label className="text-sm font-medium text-forest-700 block mb-2">
              GPS-sporing
            </label>
            <div className="flex items-center gap-3">
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="flex items-center gap-2 px-4 py-3 bg-hunt-600 hover:bg-hunt-700 text-white rounded-xl font-medium transition-colors active:scale-[0.98]"
                >
                  <Play size={18} />
                  Start sporing
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors active:scale-[0.98]"
                >
                  <Square size={18} />
                  Stopp sporing
                </button>
              )}

              {path.length > 0 && (
                <span className="text-sm text-forest-600">
                  {path.length} punkter registrert
                </span>
              )}
            </div>

            {currentPosition && (
              <div className="mt-2 flex items-center gap-1 text-xs text-forest-500">
                <MapPin size={12} />
                <span>
                  {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          {/* Photo Capture */}
          <div>
            <label className="text-sm font-medium text-forest-700 block mb-2">
              Bilder
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors active:scale-[0.98]"
            >
              <Camera size={18} />
              Ta bilde
            </button>

            {/* Photo previews */}
            {photos.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                {photos.map((photo, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={URL.createObjectURL(photo.file)}
                      alt={`Photo ${index + 1}`}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <button
                      onClick={() => {
                        setPhotos((prev) => prev.filter((_, i) => i !== index))
                        if ('vibrate' in navigator) navigator.vibrate(20)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-forest-700 block mb-1">
              Notater
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Legg til notater om jaktturen..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hunt-500 focus:border-hunt-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleSave}
            disabled={!title || !location || saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-hunt-600 hover:bg-hunt-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors active:scale-[0.98] disabled:active:scale-100"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Save size={18} />
              </motion.div>
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Lagrer...' : 'Lagre jakttur'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
