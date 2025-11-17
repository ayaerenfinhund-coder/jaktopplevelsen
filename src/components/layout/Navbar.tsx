'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import { Menu, X, TreePine, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-forest-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <TreePine className="w-8 h-8" />
              <span className="text-xl font-bold">Jaktopplevelsen</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md hover:bg-forest-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/trips"
                  className="px-3 py-2 rounded-md hover:bg-forest-600 transition-colors"
                >
                  Mine turer
                </Link>
                <Link
                  href="/trips/new"
                  className="px-3 py-2 rounded-md hover:bg-forest-600 transition-colors"
                >
                  Ny tur
                </Link>
                <div className="flex items-center space-x-2 ml-4">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.displayName || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-white hover:bg-forest-600"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logg ut
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="outline" className="border-white text-white hover:bg-forest-600">
                  Logg inn
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-forest-600"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-forest-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md hover:bg-forest-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/trips"
                  className="block px-3 py-2 rounded-md hover:bg-forest-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Mine turer
                </Link>
                <Link
                  href="/trips/new"
                  className="block px-3 py-2 rounded-md hover:bg-forest-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Ny tur
                </Link>
                <div className="px-3 py-2 text-sm text-forest-200">
                  {user.displayName || user.email}
                </div>
                <button
                  onClick={() => {
                    signOut()
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-forest-600"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Logg ut
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block px-3 py-2 rounded-md hover:bg-forest-600"
                onClick={() => setMenuOpen(false)}
              >
                Logg inn
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
