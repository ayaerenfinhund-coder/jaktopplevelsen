'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TripFormData, GAME_TYPES, WEATHER_CONDITIONS } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LocationPicker from '@/components/map/LocationPicker'
import { Plus, Trash2, Upload } from 'lucide-react'

const tripSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd'),
  description: z.string().optional(),
  date: z.string().min(1, 'Dato er påkrevd'),
  startTime: z.string().min(1, 'Starttid er påkrevd'),
  endTime: z.string().min(1, 'Sluttid er påkrevd'),
  locationName: z.string().min(1, 'Lokasjon er påkrevd'),
  coordinates: z.tuple([z.number(), z.number()]),
  weather: z.string().min(1, 'Vær er påkrevd'),
  temperature: z.number(),
  gameType: z.array(z.string()).min(1, 'Velg minst én vilttype'),
  gameHarvested: z.array(
    z.object({
      type: z.string(),
      count: z.number().min(0),
      weight: z.number().optional(),
    })
  ),
  notes: z.string().optional(),
  companions: z.array(z.string()),
  equipment: z.array(z.string()),
})

interface TripFormProps {
  onSubmit: (data: TripFormData, photos: File[]) => Promise<void>
  initialData?: Partial<TripFormData>
}

export default function TripForm({ onSubmit, initialData }: TripFormProps) {
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [companion, setCompanion] = useState('')
  const [equipment, setEquipment] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      startTime: initialData?.startTime || '06:00',
      endTime: initialData?.endTime || '18:00',
      locationName: initialData?.locationName || '',
      coordinates: initialData?.coordinates || [10.75, 59.91],
      weather: initialData?.weather || '',
      temperature: initialData?.temperature || 10,
      gameType: initialData?.gameType || [],
      gameHarvested: initialData?.gameHarvested || [],
      notes: initialData?.notes || '',
      companions: initialData?.companions || [],
      equipment: initialData?.equipment || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'gameHarvested',
  })

  const selectedGameTypes = watch('gameType')
  const companions = watch('companions')
  const equipmentList = watch('equipment')

  const handleLocationSelect = (coordinates: [number, number], locationName: string) => {
    setValue('coordinates', coordinates)
    setValue('locationName', locationName)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)])
    }
  }

  const handleFormSubmit = async (data: TripFormData) => {
    setLoading(true)
    try {
      await onSubmit(data, photos)
    } finally {
      setLoading(false)
    }
  }

  const addCompanion = () => {
    if (companion.trim()) {
      setValue('companions', [...companions, companion.trim()])
      setCompanion('')
    }
  }

  const addEquipment = () => {
    if (equipment.trim()) {
      setValue('equipment', [...equipmentList, equipment.trim()])
      setEquipment('')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-forest-800 mb-4">Grunnleggende informasjon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Tittel"
              {...register('title')}
              error={errors.title?.message}
              placeholder="F.eks. Elgjakt i Nordmarka"
            />
          </div>
          <Input
            label="Dato"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Starttid"
              type="time"
              {...register('startTime')}
              error={errors.startTime?.message}
            />
            <Input
              label="Sluttid"
              type="time"
              {...register('endTime')}
              error={errors.endTime?.message}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivelse</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            placeholder="Fortell om jakten..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-forest-800 mb-4">Lokasjon</h3>
        <LocationPicker
          initialCoordinates={initialData?.coordinates}
          onLocationSelect={handleLocationSelect}
        />
        {errors.locationName && (
          <p className="text-sm text-red-600 mt-2">{errors.locationName.message}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-forest-800 mb-4">Vær og forhold</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vær</label>
            <select
              {...register('weather')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">Velg vær</option>
              {WEATHER_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
            {errors.weather && (
              <p className="text-sm text-red-600 mt-1">{errors.weather.message}</p>
            )}
          </div>
          <Input
            label="Temperatur (°C)"
            type="number"
            {...register('temperature', { valueAsNumber: true })}
            error={errors.temperature?.message}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-forest-800 mb-4">Vilt</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vilttyper (velg alle som gjelder)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {GAME_TYPES.map((game) => (
              <label key={game.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={game.value}
                  {...register('gameType')}
                  className="rounded border-gray-300 text-forest-600 focus:ring-forest-500"
                />
                <span className="text-sm">{game.label}</span>
              </label>
            ))}
          </div>
          {errors.gameType && (
            <p className="text-sm text-red-600 mt-1">{errors.gameType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Felt vilt</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <select
                {...register(`gameHarvested.${index}.type`)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">Velg type</option>
                {GAME_TYPES.map((game) => (
                  <option key={game.value} value={game.label}>
                    {game.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                {...register(`gameHarvested.${index}.count`, { valueAsNumber: true })}
                placeholder="Antall"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <input
                type="number"
                step="0.1"
                {...register(`gameHarvested.${index}.weight`, { valueAsNumber: true })}
                placeholder="Vekt (kg)"
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: '', count: 0, weight: undefined })}
          >
            <Plus className="w-4 h-4 mr-1" /> Legg til felt vilt
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-forest-800 mb-4">Bilder</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Klikk for å laste opp bilder</p>
          </label>
        </div>
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-forest-800 mb-4">Detaljer</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jaktlag</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={companion}
                onChange={(e) => setCompanion(e.target.value)}
                placeholder="Navn på jaktpartner"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <Button type="button" variant="outline" onClick={addCompanion}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {companions.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 bg-forest-100 text-forest-800 rounded text-sm"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => setValue('companions', companions.filter((_, idx) => idx !== i))}
                    className="ml-1 text-forest-600 hover:text-forest-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utstyr</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="F.eks. Sauer 404, Zeiss kikkert"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <Button type="button" variant="outline" onClick={addEquipment}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {equipmentList.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 bg-earth-100 text-earth-800 rounded text-sm"
                >
                  {e}
                  <button
                    type="button"
                    onClick={() => setValue('equipment', equipmentList.filter((_, idx) => idx !== i))}
                    className="ml-1 text-earth-600 hover:text-earth-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="Andre observasjoner, erfaringer, tips..."
            />
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Lagre jakttur
      </Button>
    </form>
  )
}
