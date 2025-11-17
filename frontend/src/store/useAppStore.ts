import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DogBasic {
  id: string;
  name: string;
  breed: string;
  color: string;
  is_active: boolean;
}

interface AppState {
  // Dogs
  dogs: DogBasic[];
  addDog: (dog: DogBasic) => void;
  updateDog: (id: string, updates: Partial<DogBasic>) => void;
  removeDog: (id: string) => void;

  // Locations
  recentLocations: string[];
  addLocation: (location: string) => void;

  // Last selected values
  lastSelectedDog: string;
  setLastSelectedDog: (dogId: string) => void;
  lastSelectedLocation: string;
  setLastSelectedLocation: (location: string) => void;

  // Auto-sync tracking
  lastAutoSyncTime: number;
  setLastAutoSyncTime: (time: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial dogs
      dogs: [
        { id: 'rolex', name: 'Rolex', breed: 'Dachs', color: '#D4752E', is_active: true },
      ],

      addDog: (dog) =>
        set((state) => ({
          dogs: [...state.dogs, dog],
        })),

      updateDog: (id, updates) =>
        set((state) => ({
          dogs: state.dogs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      removeDog: (id) =>
        set((state) => ({
          dogs: state.dogs.filter((d) => d.id !== id),
        })),

      // Initial locations
      recentLocations: ['Storeberg', 'Tveiter', 'Hanevold'],

      addLocation: (location) =>
        set((state) => {
          if (!state.recentLocations.includes(location)) {
            // Add to beginning, keep max 10 locations
            const updated = [location, ...state.recentLocations].slice(0, 10);
            return { recentLocations: updated };
          }
          return state;
        }),

      // Last selected values
      lastSelectedDog: 'rolex',
      setLastSelectedDog: (dogId) => set({ lastSelectedDog: dogId }),

      lastSelectedLocation: 'Storeberg',
      setLastSelectedLocation: (location) => set({ lastSelectedLocation: location }),

      // Auto-sync tracking
      lastAutoSyncTime: 0,
      setLastAutoSyncTime: (time) => set({ lastAutoSyncTime: time }),
    }),
    {
      name: 'jaktopplevelsen-storage',
    }
  )
);
