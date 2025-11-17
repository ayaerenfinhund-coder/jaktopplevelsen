'use client'

import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { User } from '@/types'

const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await firebaseSignOut(auth)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      setError(message)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  }
}
