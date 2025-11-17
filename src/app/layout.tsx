import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jaktopplevelsen - Logg dine jaktturer',
  description: 'Den ultimate appen for å logge og spore dine jaktopplevelser',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#15803d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
