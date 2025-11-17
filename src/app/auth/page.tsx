'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/auth/AuthForm'
import { TreePine } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 to-earth-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-earth-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <TreePine className="w-10 h-10 text-forest-600" />
          <span className="text-2xl font-bold text-forest-800">Jaktopplevelsen</span>
        </Link>
        <AuthForm />
      </div>
    </div>
  )
}
