'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useOffline } from '@/lib/offline-context'
import MapView from '@/components/MapView'
import Dashboard from '@/components/Dashboard'
import BottomNav from '@/components/BottomNav'
import SyncIndicator from '@/components/SyncIndicator'
import NewHuntModal from '@/components/NewHuntModal'

type View = 'dashboard' | 'map' | 'profile'

export default function Home() {
  const { user, loading } = useAuth()
  const { isOnline, pendingChanges, isSyncing } = useOffline()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [showNewHunt, setShowNewHunt] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-forest-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-hunt-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-50 flex flex-col">
      {/* Status Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-forest-900">JaktLogg</h1>
          <div className="flex items-center gap-2">
            <SyncIndicator
              isOnline={isOnline}
              isSyncing={isSyncing}
              pendingChanges={pendingChanges}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard onNewHunt={() => setShowNewHunt(true)} />
            </motion.div>
          )}
          {currentView === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100vh-120px)]"
            >
              <MapView />
            </motion.div>
          )}
          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewHunt={() => setShowNewHunt(true)}
      />

      {/* New Hunt Modal */}
      <AnimatePresence>
        {showNewHunt && (
          <NewHuntModal onClose={() => setShowNewHunt(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProfileView() {
  const { user, signOut, firstName, isPrimaryUser } = useAuth()
  const { pendingChanges, syncData, isOnline } = useOffline()
  const router = useRouter()

  const handleSignOut = async () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    await signOut()
    router.push('/login')
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={firstName}
              className="w-16 h-16 rounded-full border-2 border-hunt-200"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-forest-900">{firstName}</h2>
            <p className="text-forest-600 text-sm">{user?.email}</p>
            {isPrimaryUser && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-hunt-100 text-hunt-700 text-xs font-medium rounded-full">
                Eier
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
      >
        <h3 className="font-semibold text-forest-900">Synkronisering</h3>

        <div className="flex items-center justify-between">
          <span className="text-forest-600">Status</span>
          <span className={isOnline ? 'online-badge' : 'offline-badge'}>
            {isOnline ? 'Tilkoblet' : 'Frakoblet'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-forest-600">Ventende endringer</span>
          <span className="font-medium text-forest-900">{pendingChanges}</span>
        </div>

        {pendingChanges > 0 && isOnline && (
          <button
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(30)
              syncData()
            }}
            className="w-full bg-hunt-600 hover:bg-hunt-700 text-white font-medium py-3 rounded-xl transition-colors active:scale-[0.98]"
          >
            Synkroniser nå
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleSignOut}
          className="w-full bg-gray-100 hover:bg-gray-200 text-forest-900 font-medium py-3 rounded-xl transition-colors active:scale-[0.98]"
        >
          Logg ut
        </button>
      </motion.div>
    </div>
  )
}
