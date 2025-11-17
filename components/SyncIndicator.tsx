'use client'

import { motion } from 'framer-motion'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

interface SyncIndicatorProps {
  isOnline: boolean
  isSyncing: boolean
  pendingChanges: number
}

export default function SyncIndicator({
  isOnline,
  isSyncing,
  pendingChanges,
}: SyncIndicatorProps) {
  if (isSyncing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={14} className="text-yellow-600" />
        </motion.div>
        <span className="text-xs font-medium text-yellow-700">Synkroniserer</span>
      </motion.div>
    )
  }

  if (!isOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-full"
      >
        <CloudOff size={14} className="text-red-600" />
        <span className="text-xs font-medium text-red-700">Frakoblet</span>
      </motion.div>
    )
  }

  if (pendingChanges > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 border border-orange-200 rounded-full"
      >
        <Cloud size={14} className="text-orange-600" />
        <span className="text-xs font-medium text-orange-700">
          {pendingChanges} ventende
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-full"
    >
      <Cloud size={14} className="text-green-600" />
      <span className="text-xs font-medium text-green-700">Synkronisert</span>
    </motion.div>
  )
}
