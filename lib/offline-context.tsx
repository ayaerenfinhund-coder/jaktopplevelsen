'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface HuntData {
  id: string
  userId: string
  title: string
  date: string
  location: string
  path: Array<{ lat: number; lng: number; timestamp: number }>
  photos: Array<{
    id: string
    url: string
    lat: number
    lng: number
    timestamp: number
    caption?: string
    thumbnail?: string
  }>
  notes: string
  weather?: string
  game?: string[]
  synced: boolean
  createdAt: number
  updatedAt: number
}

interface QueuedAction {
  id: string
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

interface JaktDB extends DBSchema {
  hunts: {
    key: string
    value: HuntData
    indexes: { 'by-date': string; 'by-synced': number }
  }
  queue: {
    key: string
    value: QueuedAction
    indexes: { 'by-timestamp': number }
  }
  offlineMaps: {
    key: string
    value: { id: string; tiles: Blob; area: string; timestamp: number }
  }
}

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  pendingChanges: number
  db: IDBPDatabase<JaktDB> | null
  saveHunt: (hunt: Omit<HuntData, 'id' | 'synced' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateHunt: (id: string, data: Partial<HuntData>) => Promise<void>
  deleteHunt: (id: string) => Promise<void>
  getHunts: () => Promise<HuntData[]>
  getHunt: (id: string) => Promise<HuntData | undefined>
  syncData: () => Promise<void>
  queuePhoto: (huntId: string, photo: File, lat: number, lng: number) => Promise<string>
  downloadOfflineMap: (area: string, bounds: any) => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(0)
  const [db, setDb] = useState<IDBPDatabase<JaktDB> | null>(null)

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const database = await openDB<JaktDB>('jaktlogg-db', 1, {
        upgrade(db) {
          // Create hunts store
          const huntStore = db.createObjectStore('hunts', { keyPath: 'id' })
          huntStore.createIndex('by-date', 'date')
          huntStore.createIndex('by-synced', 'synced')

          // Create queue store for offline actions
          const queueStore = db.createObjectStore('queue', { keyPath: 'id' })
          queueStore.createIndex('by-timestamp', 'timestamp')

          // Create offline maps store
          db.createObjectStore('offlineMaps', { keyPath: 'id' })
        },
      })
      setDb(database)

      // Check pending changes
      const queue = await database.getAll('queue')
      setPendingChanges(queue.length)
    }

    initDB()
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming back online
      if (db && pendingChanges > 0) {
        syncData()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [db, pendingChanges])

  const generateId = () => `hunt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const saveHunt = async (huntData: Omit<HuntData, 'id' | 'synced' | 'createdAt' | 'updatedAt'>) => {
    if (!db) throw new Error('Database not initialized')

    const id = generateId()
    const now = Date.now()
    const hunt: HuntData = {
      ...huntData,
      id,
      synced: false,
      createdAt: now,
      updatedAt: now,
    }

    await db.put('hunts', hunt)

    // Queue for sync
    await db.put('queue', {
      id: `action_${now}`,
      type: 'create',
      data: hunt,
      timestamp: now,
    })

    setPendingChanges((prev) => prev + 1)

    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    return id
  }

  const updateHunt = async (id: string, data: Partial<HuntData>) => {
    if (!db) throw new Error('Database not initialized')

    const hunt = await db.get('hunts', id)
    if (!hunt) throw new Error('Hunt not found')

    const updatedHunt = {
      ...hunt,
      ...data,
      updatedAt: Date.now(),
      synced: false,
    }

    await db.put('hunts', updatedHunt)

    // Queue for sync
    await db.put('queue', {
      id: `action_${Date.now()}`,
      type: 'update',
      data: updatedHunt,
      timestamp: Date.now(),
    })

    setPendingChanges((prev) => prev + 1)
  }

  const deleteHunt = async (id: string) => {
    if (!db) throw new Error('Database not initialized')

    await db.delete('hunts', id)

    // Queue for sync
    await db.put('queue', {
      id: `action_${Date.now()}`,
      type: 'delete',
      data: { id },
      timestamp: Date.now(),
    })

    setPendingChanges((prev) => prev + 1)
  }

  const getHunts = async () => {
    if (!db) return []
    return db.getAll('hunts')
  }

  const getHunt = async (id: string) => {
    if (!db) return undefined
    return db.get('hunts', id)
  }

  const syncData = async () => {
    if (!db || !isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      const queue = await db.getAllFromIndex('queue', 'by-timestamp')

      for (const action of queue) {
        // In production, you would sync with Firebase here
        // For now, we'll just mark as synced locally
        if (action.type === 'create' || action.type === 'update') {
          const hunt = await db.get('hunts', action.data.id)
          if (hunt) {
            await db.put('hunts', { ...hunt, synced: true })
          }
        }
        await db.delete('queue', action.id)
      }

      setPendingChanges(0)

      // Success haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50])
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const queuePhoto = async (huntId: string, photo: File, lat: number, lng: number) => {
    if (!db) throw new Error('Database not initialized')

    // Convert photo to base64 for offline storage
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(photo)
    })

    // Create thumbnail
    const thumbnail = await createThumbnail(base64)

    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const photoData = {
      id: photoId,
      url: base64,
      lat,
      lng,
      timestamp: Date.now(),
      thumbnail,
    }

    const hunt = await db.get('hunts', huntId)
    if (hunt) {
      const updatedHunt = {
        ...hunt,
        photos: [...hunt.photos, photoData],
        updatedAt: Date.now(),
        synced: false,
      }
      await db.put('hunts', updatedHunt)

      // Queue for sync
      await db.put('queue', {
        id: `action_${Date.now()}`,
        type: 'update',
        data: updatedHunt,
        timestamp: Date.now(),
      })

      setPendingChanges((prev) => prev + 1)
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }

    return photoId
  }

  const createThumbnail = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 100
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const scale = Math.max(size / img.width, size / img.height)
          const x = (size - img.width * scale) / 2
          const y = (size - img.height * scale) / 2
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        }
        resolve(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.src = base64
    })
  }

  const downloadOfflineMap = async (area: string, bounds: any) => {
    if (!db) throw new Error('Database not initialized')

    // In production, you would download map tiles here
    // This is a placeholder for the offline map functionality
    const mapData = {
      id: area,
      tiles: new Blob(),
      area,
      timestamp: Date.now(),
    }

    await db.put('offlineMaps', mapData)

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingChanges,
        db,
        saveHunt,
        updateHunt,
        deleteHunt,
        getHunts,
        getHunt,
        syncData,
        queuePhoto,
        downloadOfflineMap,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}
