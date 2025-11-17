'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(6, 'Passord må være minst 6 tegn'),
})

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Navn må være minst 2 tegn'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passordene matcher ikke',
  path: ['confirmPassword'],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, error } = useAuth()
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      router.push('/dashboard')
    } catch {
      // Error is handled by useAuth hook
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true)
    try {
      await signUp(data.email, data.password, data.displayName)
      router.push('/dashboard')
    } catch {
      // Error is handled by useAuth hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
              isLogin
                ? 'border-forest-600 text-forest-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Logg inn
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
              !isLogin
                ? 'border-forest-600 text-forest-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrer
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <Input
              label="E-post"
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            <Input
              label="Passord"
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Logg inn
            </Button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <Input
              label="Navn"
              {...signupForm.register('displayName')}
              error={signupForm.formState.errors.displayName?.message}
            />
            <Input
              label="E-post"
              type="email"
              {...signupForm.register('email')}
              error={signupForm.formState.errors.email?.message}
            />
            <Input
              label="Passord"
              type="password"
              {...signupForm.register('password')}
              error={signupForm.formState.errors.password?.message}
            />
            <Input
              label="Bekreft passord"
              type="password"
              {...signupForm.register('confirmPassword')}
              error={signupForm.formState.errors.confirmPassword?.message}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Registrer
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
