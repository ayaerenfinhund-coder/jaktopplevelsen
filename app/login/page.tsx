'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { user, loading, error, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      // Haptic feedback on successful action
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50])
      }
    } catch (err) {
      // Error is handled in context
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-50 to-hunt-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-hunt-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-forest-600 font-medium">Laster...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-hunt-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="JaktLogg"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-forest-900 tracking-tight">
            JaktLogg
          </h1>
          <p className="mt-2 text-forest-600 text-sm">
            Din digitale jaktopplevelse
          </p>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-forest-900 font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 border border-gray-200 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Logg inn med Google
          </button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-xs text-forest-400"
        >
          Sikker innlogging med Google
        </motion.p>
      </motion.div>
    </div>
  )
}
