export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface Trip {
  id: string
  userId: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: {
    name: string
    coordinates: [number, number] // [lng, lat]
  }
  weather: string
  temperature: number
  gameType: string[]
  gameHarvested: {
    type: string
    count: number
    weight?: number
  }[]
  photos: string[]
  notes: string
  companions: string[]
  equipment: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TripFormData {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  locationName: string
  coordinates: [number, number]
  weather: string
  temperature: number
  gameType: string[]
  gameHarvested: {
    type: string
    count: number
    weight?: number
  }[]
  notes: string
  companions: string[]
  equipment: string[]
}

export type GameType =
  | 'elg' // Moose
  | 'hjort' // Deer
  | 'rådyr' // Roe deer
  | 'villsvin' // Wild boar
  | 'rype' // Ptarmigan
  | 'skogsfugl' // Forest birds
  | 'and' // Duck
  | 'gås' // Goose
  | 'hare' // Hare
  | 'rev' // Fox
  | 'other'

export const GAME_TYPES: { value: GameType; label: string }[] = [
  { value: 'elg', label: 'Elg' },
  { value: 'hjort', label: 'Hjort' },
  { value: 'rådyr', label: 'Rådyr' },
  { value: 'villsvin', label: 'Villsvin' },
  { value: 'rype', label: 'Rype' },
  { value: 'skogsfugl', label: 'Skogsfugl' },
  { value: 'and', label: 'And' },
  { value: 'gås', label: 'Gås' },
  { value: 'hare', label: 'Hare' },
  { value: 'rev', label: 'Rev' },
  { value: 'other', label: 'Annet' },
]

export const WEATHER_CONDITIONS = [
  'Sol',
  'Delvis skyet',
  'Overskyet',
  'Lett regn',
  'Regn',
  'Snø',
  'Tåke',
  'Vind',
]
