'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useOffline } from '@/lib/offline-context'
import { Plus, MapPin, Camera, Calendar, Download, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import ExportModal from './ExportModal'

interface DashboardProps {
  onNewHunt: () => void
}

export default function Dashboard({ onNewHunt }: DashboardProps) {
  const { firstName, isPrimaryUser } = useAuth()
  const { getHunts } = useOffline()
  const [hunts, setHunts] = useState<any[]>([])
  const [showExport, setShowExport] = useState(false)
  const [selectedHuntForExport, setSelectedHuntForExport] = useState<any>(null)

  useEffect(() => {
    const loadHunts = async () => {
      const data = await getHunts()
      setHunts(data.sort((a, b) => b.createdAt - a.createdAt))
    }
    loadHunts()
  }, [getHunts])

  const stats = {
    totalHunts: hunts.length,
    totalPhotos: hunts.reduce((acc, h) => acc + (h.photos?.length || 0), 0),
    totalDistance: hunts.reduce((acc, h) => {
      if (!h.path || h.path.length < 2) return acc
      let dist = 0
      for (let i = 1; i < h.path.length; i++) {
        const lat1 = h.path[i - 1].lat
        const lon1 = h.path[i - 1].lng
        const lat2 = h.path[i].lat
        const lon2 = h.path[i].lng
        dist += haversineDistance(lat1, lon1, lat2, lon2)
      }
      return acc + dist
    }, 0),
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-hunt-600 to-hunt-700 rounded-2xl p-6 text-white shadow-lg"
      >
        <h2 className="text-2xl font-bold">Hei, {firstName}!</h2>
        <p className="mt-1 text-hunt-100 text-sm">
          {isPrimaryUser
            ? 'Velkommen til din JaktLogg'
            : 'Velkommen tilbake til JaktLogg'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalHunts}</p>
            <p className="text-xs text-hunt-200">Jaktturer</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalPhotos}</p>
            <p className="text-xs text-hunt-200">Bilder</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalDistance.toFixed(1)}</p>
            <p className="text-xs text-hunt-200">km gått</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={() => {
            if ('vibrate' in navigator) navigator.vibrate(30)
            onNewHunt()
          }}
          className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-hunt-100 rounded-full flex items-center justify-center">
            <Plus className="text-hunt-600" size={24} />
          </div>
          <span className="text-sm font-medium text-forest-900">Ny jakttur</span>
        </button>

        <button
          onClick={() => {
            if ('vibrate' in navigator) navigator.vibrate(30)
            setShowExport(true)
          }}
          className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center">
            <Download className="text-forest-600" size={24} />
          </div>
          <span className="text-sm font-medium text-forest-900">
            Eksporter rapport
          </span>
        </button>
      </motion.div>

      {/* Recent Hunts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-forest-900 mb-3">
          Siste jaktturer
        </h3>

        {hunts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <MapPin className="mx-auto text-forest-300" size={48} />
            <p className="mt-4 text-forest-600">Ingen jaktturer ennå</p>
            <p className="text-sm text-forest-400 mt-1">
              Start din første jakttur for å begynne å spore
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hunts.slice(0, 5).map((hunt, index) => (
              <motion.div
                key={hunt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                  !hunt.synced ? 'syncing' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-forest-900">
                      {hunt.title || `Jakttur`}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-forest-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {format(new Date(hunt.date), 'PPP', { locale: nb })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera size={12} />
                        {hunt.photos?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {hunt.location}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(20)
                      setSelectedHuntForExport(hunt)
                      setShowExport(true)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Share2 size={18} className="text-forest-500" />
                  </button>
                </div>

                {/* Photo thumbnails */}
                {hunt.photos && hunt.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                    {hunt.photos.slice(0, 4).map((photo: any) => (
                      <img
                        key={photo.id}
                        src={photo.thumbnail || photo.url}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ))}
                    {hunt.photos.length > 4 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-forest-600">
                          +{hunt.photos.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          hunt={selectedHuntForExport}
          hunts={hunts}
          onClose={() => {
            setShowExport(false)
            setSelectedHuntForExport(null)
          }}
        />
      )}
    </div>
  )
}

// Haversine distance calculation
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
