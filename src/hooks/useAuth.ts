'use client'

import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { User } from '@/types'

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

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      throw err
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up'
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
    signIn,
    signUp,
    signOut,
  }
}
