'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  FileText,
  Share2,
  Instagram,
  Download,
  Loader,
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useAuth } from '@/lib/auth-context'

interface ExportModalProps {
  hunt?: any
  hunts: any[]
  onClose: () => void
}

export default function ExportModal({ hunt, hunts, onClose }: ExportModalProps) {
  const { firstName } = useAuth()
  const [exportType, setExportType] = useState<
    'pdf' | 'share' | 'instagram' | null
  >(null)
  const [loading, setLoading] = useState(false)

  const generatePDF = async () => {
    setLoading(true)
    if ('vibrate' in navigator) navigator.vibrate(50)

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Header
      pdf.setFillColor(22, 101, 52) // hunt-800
      pdf.rect(0, 0, pageWidth, 40, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('JaktLogg', 20, 25)

      if (hunt) {
        // Single hunt report
        pdf.setFontSize(12)
        pdf.text(hunt.title || 'Jakttur', pageWidth - 20, 25, { align: 'right' })

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        let yPos = 55

        // Hunt details
        pdf.setFont('helvetica', 'bold')
        pdf.text('Detaljer', 20, yPos)
        yPos += 10

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.text(`Dato: ${format(new Date(hunt.date), 'PPP', { locale: nb })}`, 20, yPos)
        yPos += 7
        pdf.text(`Område: ${hunt.location}`, 20, yPos)
        yPos += 7
        pdf.text(`Antall bilder: ${hunt.photos?.length || 0}`, 20, yPos)
        yPos += 7
        pdf.text(`GPS-punkter: ${hunt.path?.length || 0}`, 20, yPos)
        yPos += 15

        // Notes
        if (hunt.notes) {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(14)
          pdf.text('Notater', 20, yPos)
          yPos += 10

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          const lines = pdf.splitTextToSize(hunt.notes, pageWidth - 40)
          pdf.text(lines, 20, yPos)
          yPos += lines.length * 7 + 10
        }

        // Stats
        if (hunt.path && hunt.path.length >= 2) {
          let totalDistance = 0
          for (let i = 1; i < hunt.path.length; i++) {
            totalDistance += haversineDistance(
              hunt.path[i - 1].lat,
              hunt.path[i - 1].lng,
              hunt.path[i].lat,
              hunt.path[i].lng
            )
          }

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(14)
          pdf.text('Statistikk', 20, yPos)
          yPos += 10

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.text(`Total distanse: ${totalDistance.toFixed(2)} km`, 20, yPos)
        }
      } else {
        // Season summary
        pdf.setFontSize(12)
        pdf.text('Sesongrapport', pageWidth - 20, 25, { align: 'right' })

        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        let yPos = 55

        pdf.setFont('helvetica', 'bold')
        pdf.text(`${firstName}s Jaktsesong`, 20, yPos)
        yPos += 15

        // Overall stats
        const totalHunts = hunts.length
        const totalPhotos = hunts.reduce(
          (acc, h) => acc + (h.photos?.length || 0),
          0
        )
        let totalDistance = 0
        hunts.forEach((h) => {
          if (h.path && h.path.length >= 2) {
            for (let i = 1; i < h.path.length; i++) {
              totalDistance += haversineDistance(
                h.path[i - 1].lat,
                h.path[i - 1].lng,
                h.path[i].lat,
                h.path[i].lng
              )
            }
          }
        })

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.text(`Totalt antall jaktturer: ${totalHunts}`, 20, yPos)
        yPos += 7
        pdf.text(`Totalt antall bilder: ${totalPhotos}`, 20, yPos)
        yPos += 7
        pdf.text(`Total distanse gått: ${totalDistance.toFixed(2)} km`, 20, yPos)
        yPos += 15

        // List hunts
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(14)
        pdf.text('Alle jaktturer', 20, yPos)
        yPos += 10

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        hunts.forEach((h) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage()
            yPos = 20
          }
          const date = format(new Date(h.date), 'dd.MM.yyyy')
          pdf.text(`• ${date} - ${h.title || 'Jakttur'} (${h.location})`, 20, yPos)
          yPos += 7
        })
      }

      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Generert av JaktLogg - ${format(new Date(), 'PPP', { locale: nb })}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )

      // Save PDF
      const fileName = hunt
        ? `jakttur_${hunt.id.slice(-6)}.pdf`
        : `jaktsesong_${format(new Date(), 'yyyy')}.pdf`
      pdf.save(fileName)

      if ('vibrate' in navigator) navigator.vibrate([50, 30, 100])
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Kunne ikke generere PDF')
    } finally {
      setLoading(false)
    }
  }

  const generateShareCard = async () => {
    setLoading(true)
    if ('vibrate' in navigator) navigator.vibrate(50)

    try {
      // Create a shareable card
      const cardElement = document.createElement('div')
      cardElement.style.cssText = `
        width: 600px;
        height: 400px;
        background: linear-gradient(135deg, #166534 0%, #22c55e 100%);
        padding: 40px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: white;
        border-radius: 24px;
        position: absolute;
        left: -9999px;
      `

      if (hunt) {
        cardElement.innerHTML = `
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h1 style="font-size: 32px; font-weight: bold; margin: 0;">${hunt.title || 'Jakttur'}</h1>
              <p style="font-size: 18px; opacity: 0.9; margin: 8px 0 0 0;">${hunt.location}</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
              <div style="text-align: center;">
                <p style="font-size: 36px; font-weight: bold; margin: 0;">${hunt.photos?.length || 0}</p>
                <p style="font-size: 14px; opacity: 0.8; margin: 4px 0 0 0;">Bilder</p>
              </div>
              <div style="text-align: center;">
                <p style="font-size: 36px; font-weight: bold; margin: 0;">${hunt.path?.length || 0}</p>
                <p style="font-size: 14px; opacity: 0.8; margin: 4px 0 0 0;">GPS-punkter</p>
              </div>
              <div style="text-align: center;">
                <p style="font-size: 36px; font-weight: bold; margin: 0;">${format(new Date(hunt.date), 'dd.MM')}</p>
                <p style="font-size: 14px; opacity: 0.8; margin: 4px 0 0 0;">Dato</p>
              </div>
            </div>
            <div style="text-align: center; opacity: 0.7;">
              <p style="font-size: 12px; margin: 0;">Delt fra JaktLogg</p>
            </div>
          </div>
        `
      } else {
        const totalPhotos = hunts.reduce((acc, h) => acc + (h.photos?.length || 0), 0)
        cardElement.innerHTML = `
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h1 style="font-size: 32px; font-weight: bold; margin: 0;">${firstName}s Jaktsesong</h1>
              <p style="font-size: 18px; opacity: 0.9; margin: 8px 0 0 0;">${format(new Date(), 'yyyy')}</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
              <div style="text-align: center;">
                <p style="font-size: 36px; font-weight: bold; margin: 0;">${hunts.length}</p>
                <p style="font-size: 14px; opacity: 0.8; margin: 4px 0 0 0;">Jaktturer</p>
              </div>
              <div style="text-align: center;">
                <p style="font-size: 36px; font-weight: bold; margin: 0;">${totalPhotos}</p>
                <p style="font-size: 14px; opacity: 0.8; margin: 4px 0 0 0;">Bilder</p>
              </div>
              <div style="text-align: center;">
                <p style="font-size: 36px; font-weight: bold; margin: 0;">⭐</p>
                <p style="font-size: 14px; opacity: 0.8; margin: 4px 0 0 0;">Sesong</p>
              </div>
            </div>
            <div style="text-align: center; opacity: 0.7;">
              <p style="font-size: 12px; margin: 0;">Delt fra JaktLogg</p>
            </div>
          </div>
        `
      }

      document.body.appendChild(cardElement)

      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: null,
      })

      document.body.removeChild(cardElement)

      // Download the image
      const link = document.createElement('a')
      link.download = hunt
        ? `jakttur_${hunt.id.slice(-6)}.png`
        : `jaktsesong_${format(new Date(), 'yyyy')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      if ('vibrate' in navigator) navigator.vibrate([50, 30, 100])
    } catch (error) {
      console.error('Share card generation failed:', error)
      alert('Kunne ikke generere delingskort')
    } finally {
      setLoading(false)
    }
  }

  const generateInstagramImage = async () => {
    setLoading(true)
    if ('vibrate' in navigator) navigator.vibrate(50)

    try {
      // Create Instagram-ready square image
      const cardElement = document.createElement('div')
      cardElement.style.cssText = `
        width: 1080px;
        height: 1080px;
        background: linear-gradient(180deg, #0f2617 0%, #166534 50%, #22c55e 100%);
        padding: 80px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: white;
        position: absolute;
        left: -9999px;
      `

      if (hunt) {
        cardElement.innerHTML = `
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; text-align: center;">
            <h1 style="font-size: 72px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 4px;">
              ${hunt.title || 'Jakttur'}
            </h1>
            <p style="font-size: 28px; margin: 20px 0 60px 0; opacity: 0.9;">${hunt.location}</p>
            <div style="background: rgba(255,255,255,0.15); border-radius: 32px; padding: 40px;">
              <p style="font-size: 96px; font-weight: bold; margin: 0;">${hunt.photos?.length || 0}</p>
              <p style="font-size: 24px; opacity: 0.8; margin: 10px 0 0 0;">ØYEBLIKK FANGET</p>
            </div>
            <p style="font-size: 18px; margin-top: 60px; opacity: 0.6;">@JaktLogg</p>
          </div>
        `
      } else {
        const totalPhotos = hunts.reduce((acc, h) => acc + (h.photos?.length || 0), 0)
        cardElement.innerHTML = `
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; text-align: center;">
            <h1 style="font-size: 72px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 4px;">
              Jaktsesong
            </h1>
            <p style="font-size: 28px; margin: 20px 0 60px 0; opacity: 0.9;">${format(new Date(), 'yyyy')}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div style="background: rgba(255,255,255,0.15); border-radius: 32px; padding: 40px;">
                <p style="font-size: 72px; font-weight: bold; margin: 0;">${hunts.length}</p>
                <p style="font-size: 20px; opacity: 0.8; margin: 10px 0 0 0;">TURER</p>
              </div>
              <div style="background: rgba(255,255,255,0.15); border-radius: 32px; padding: 40px;">
                <p style="font-size: 72px; font-weight: bold; margin: 0;">${totalPhotos}</p>
                <p style="font-size: 20px; opacity: 0.8; margin: 10px 0 0 0;">BILDER</p>
              </div>
            </div>
            <p style="font-size: 18px; margin-top: 60px; opacity: 0.6;">@JaktLogg</p>
          </div>
        `
      }

      document.body.appendChild(cardElement)

      const canvas = await html2canvas(cardElement, {
        scale: 1,
        backgroundColor: null,
      })

      document.body.removeChild(cardElement)

      // Download the image
      const link = document.createElement('a')
      link.download = hunt
        ? `instagram_jakttur_${hunt.id.slice(-6)}.png`
        : `instagram_jaktsesong_${format(new Date(), 'yyyy')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      if ('vibrate' in navigator) navigator.vibrate([50, 30, 100])
    } catch (error) {
      console.error('Instagram image generation failed:', error)
      alert('Kunne ikke generere Instagram-bilde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-forest-900">
            Eksporter & Del
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <ExportOption
            icon={<FileText size={24} />}
            title="PDF-rapport"
            description="Detaljert rapport med statistikk"
            onClick={generatePDF}
            loading={loading && exportType === 'pdf'}
            onStart={() => setExportType('pdf')}
          />

          <ExportOption
            icon={<Share2 size={24} />}
            title="Delingskort"
            description="Visuelt sammendragskort"
            onClick={generateShareCard}
            loading={loading && exportType === 'share'}
            onStart={() => setExportType('share')}
          />

          <ExportOption
            icon={<Instagram size={24} />}
            title="Instagram-bilde"
            description="1080x1080 optimalisert for sosiale medier"
            onClick={generateInstagramImage}
            loading={loading && exportType === 'instagram'}
            onStart={() => setExportType('instagram')}
          />
        </div>

        <div className="p-4 bg-gray-50 text-center">
          <p className="text-xs text-forest-500">
            {hunt
              ? `Eksporterer: ${hunt.title || 'Jakttur'}`
              : `Eksporterer sesongrapport (${hunts.length} turer)`}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ExportOption({
  icon,
  title,
  description,
  onClick,
  loading,
  onStart,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  loading: boolean
  onStart: () => void
}) {
  return (
    <button
      onClick={() => {
        onStart()
        onClick()
      }}
      disabled={loading}
      className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
    >
      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader size={24} className="text-hunt-600" />
          </motion.div>
        ) : (
          <div className="text-hunt-600">{icon}</div>
        )}
      </div>
      <div className="text-left">
        <p className="font-medium text-forest-900">{title}</p>
        <p className="text-sm text-forest-500">{description}</p>
      </div>
      <Download size={18} className="ml-auto text-forest-400" />
    </button>
  )
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
