'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, ALLOWED_EMAILS, PRIMARY_USER_EMAIL } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  firstName: string
  isPrimaryUser: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is allowed
        if (ALLOWED_EMAILS.includes(firebaseUser.email || '')) {
          setUser(firebaseUser)
          setError(null)
        } else {
          // User not allowed, sign them out
          await firebaseSignOut(auth)
          setUser(null)
          setError('Access denied. Your account is not authorized.')
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await signInWithPopup(auth, googleProvider)

      // Check if the user's email is allowed
      if (!ALLOWED_EMAILS.includes(result.user.email || '')) {
        await firebaseSignOut(auth)
        throw new Error('Access denied. Your account is not authorized.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (err) {
      setError('Failed to sign out')
    }
  }

  // Extract first name from display name or email
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

  // Check if current user is the primary user (Wilfred)
  const isPrimaryUser = user?.email === PRIMARY_USER_EMAIL

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signOut,
        firstName,
        isPrimaryUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
