'use client'

import { motion } from 'framer-motion'
import { Home, Map, Plus, User } from 'lucide-react'

type View = 'dashboard' | 'map' | 'profile'

interface BottomNavProps {
  currentView: View
  onViewChange: (view: View) => void
  onNewHunt: () => void
}

export default function BottomNav({
  currentView,
  onViewChange,
  onNewHunt,
}: BottomNavProps) {
  const handleNavClick = (view: View) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15)
    }
    onViewChange(view)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        <NavButton
          icon={<Home size={24} />}
          label="Hjem"
          isActive={currentView === 'dashboard'}
          onClick={() => handleNavClick('dashboard')}
        />

        <NavButton
          icon={<Map size={24} />}
          label="Kart"
          isActive={currentView === 'map'}
          onClick={() => handleNavClick('map')}
        />

        <button
          onClick={() => {
            if ('vibrate' in navigator) navigator.vibrate([20, 10, 20])
            onNewHunt()
          }}
          className="relative -mt-6"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-hunt-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus size={28} className="text-white" />
          </motion.div>
        </button>

        <NavButton
          icon={<User size={24} />}
          label="Profil"
          isActive={currentView === 'profile'}
          onClick={() => handleNavClick('profile')}
        />

        <div className="w-12" /> {/* Spacer for balance */}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  )
}

function NavButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-2 px-3 transition-colors"
    >
      <motion.div
        animate={{
          color: isActive ? '#16a34a' : '#6b7280',
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      <span
        className={`text-xs font-medium ${
          isActive ? 'text-hunt-600' : 'text-gray-500'
        }`}
      >
        {label}
      </span>

      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 w-8 h-0.5 bg-hunt-600 rounded-full"
          transition={{ duration: 0.3 }}
        />
      )}
    </button>
  )
}
