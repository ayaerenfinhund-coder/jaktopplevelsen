import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Dog,
  Camera,
  Send,
  RefreshCw,
  CheckCircle,
  Thermometer,
  Wind,
  Target,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  List,
  Image,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { nb } from 'date-fns/locale';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { fetchWeatherFromYr } from '../services/weatherService';
import { useAppStore } from '../store/useAppStore';
import type { Hunt } from '../types';

// Mock-data for demonstrasjon
const mockHunts: Hunt[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Morgenjakt ved Storeberg',
    date: '2024-11-10',
    start_time: '07:00',
    end_time: '11:30',
    location: {
      name: 'Storeberg',
      region: 'Asker',
      country: 'Norge',
      coordinates: [59.89, 10.45],
    },
    weather: {
      temperature: 5,
      humidity: 80,
      wind_speed: 2,
      wind_direction: 'SV',
      precipitation: 'none',
      conditions: 'cloudy',
    },
    game_type: ['roe_deer', 'hare'],
    game_seen: [
      { type: 'roe_deer', count: 2, time: '08:30' },
      { type: 'hare', count: 1, time: '09:15' },
    ],
    game_harvested: [],
    dogs: ['rolex'],
    tracks: [],
    photos: [],
    notes: 'Rolex jobbet utmerket i terrenget rundt vannet',
    tags: ['morgenjakt', 'storeberg'],
    is_favorite: false,
    created_at: '2024-11-10T11:30:00Z',
    updated_at: '2024-11-10T11:30:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Ettermiddagsjakt ved Tveiter',
    date: '2024-11-08',
    start_time: '14:00',
    end_time: '17:30',
    location: {
      name: 'Tveiter',
      region: 'Asker',
      country: 'Norge',
      coordinates: [59.89, 10.45],
    },
    game_type: ['hare'],
    game_seen: [{ type: 'hare', count: 3, time: '15:30' }],
    game_harvested: [{ type: 'hare', count: 1, time: '16:00' }],
    dogs: ['rolex'],
    tracks: [],
    photos: [],
    notes: 'Godt vær og fin jakt',
    tags: ['ettermiddagsjakt', 'hare'],
    is_favorite: false,
    created_at: '2024-11-08T17:30:00Z',
    updated_at: '2024-11-08T17:30:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    title: 'Hanejakt Storeberg',
    date: '2023-10-15',
    start_time: '06:00',
    end_time: '12:00',
    location: {
      name: 'Storeberg',
      region: 'Asker',
      country: 'Norge',
      coordinates: [59.89, 10.45],
    },
    game_type: ['roe_deer'],
    game_seen: [{ type: 'roe_deer', count: 4, time: '08:00' }],
    game_harvested: [{ type: 'roe_deer', count: 1, time: '10:30' }],
    dogs: ['rolex'],
    tracks: [],
    photos: [],
    notes: 'God dag med Rolex',
    tags: ['morgenjakt'],
    is_favorite: false,
    created_at: '2023-10-15T12:00:00Z',
    updated_at: '2023-10-15T12:00:00Z',
  },
];

// Location coordinates for weather lookup
const locationCoords: Record<string, [number, number]> = {
  Storeberg: [59.891, 10.451],
  Tveiter: [59.885, 10.448],
  Hanevold: [59.893, 10.455],
};

// Game types
const gameTypes = [
  { id: 'roe_deer', name: 'Rådyr' },
  { id: 'hare', name: 'Hare' },
  { id: 'moose', name: 'Elg' },
  { id: 'deer', name: 'Hjort' },
  { id: 'grouse', name: 'Rype' },
  { id: 'fox', name: 'Rev' },
];

// Mock GPS tracks from Garmin
interface GarminTrack {
  id: string;
  dogId: string;
  dogName: string;
  date: string;
  startTime: string;
  endTime: string;
  distance_km: number;
  duration_minutes: number;
  coordinates: [number, number][];
  detectedLocation?: string;
}

const mockGarminTracks: GarminTrack[] = [
  {
    id: 'track-today',
    dogId: 'rolex',
    dogName: 'Rolex',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30',
    endTime: '11:15',
    distance_km: 8.3,
    duration_minutes: 225,
    coordinates: [
      [59.891, 10.451],
      [59.892, 10.453],
      [59.893, 10.452],
    ],
    detectedLocation: 'Storeberg',
  },
];

interface WeatherData {
  temperature: number;
  wind_speed: number;
  wind_direction: string;
  conditions: string;
}

// Get hunting season for a date (Aug 20 - Apr 15)
function getHuntingSeason(date: string): string {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  // If before Aug 20, it belongs to previous season
  if (month < 8 || (month === 8 && d.getDate() < 20)) {
    return `${year - 1}/${year}`;
  }
  // Aug 20 - Dec 31 belongs to current/next year season
  return `${year}/${year + 1}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [hunts] = useState<Hunt[]>(mockHunts);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Zustand store for shared state
  const {
    dogs,
    recentLocations,
    lastSelectedDog,
    setLastSelectedDog,
    lastSelectedLocation,
    setLastSelectedLocation,
    addLocation,
    lastAutoSyncTime,
    setLastAutoSyncTime,
  } = useAppStore();

  // Only active dogs for selection
  const activeDogs = dogs.filter((d) => d.is_active);

  // Season filtering
  const [selectedSeason, setSelectedSeason] = useState<string>(() => {
    // Default to current season
    return getHuntingSeason(new Date().toISOString().split('T')[0]);
  });

  // Hurtigregistrering
  const [quickNote, setQuickNote] = useState('');
  const [isSavingQuickNote, setIsSavingQuickNote] = useState(false);
  const [selectedDog, setSelectedDog] = useState(() => {
    return lastSelectedDog || activeDogs[0]?.id || '';
  });
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (lastSelectedLocation && recentLocations.includes(lastSelectedLocation)) {
      return lastSelectedLocation;
    }
    return recentLocations[0] || '';
  });
  const [customLocation, setCustomLocation] = useState('');

  // Viltobservasjoner og skutt
  const [gameSeen, setGameSeen] = useState<Record<string, number>>({});
  const [gameHarvested, setGameHarvested] = useState<Record<string, number>>({});

  // Vær fra yr.no (automatisk)
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // GPS-synk
  const [isSyncing, setIsSyncing] = useState(false);
  const [matchedTrack, setMatchedTrack] = useState<GarminTrack | null>(null);
  const [showTrackConfirm, setShowTrackConfirm] = useState(false);

  // Bilder
  const [photos, setPhotos] = useState<string[]>([]);

  // Vilt-modal
  const [showGameModal, setShowGameModal] = useState(false);

  // Date picker
  const [huntDate, setHuntDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // PWA Install
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Ref for rate limiting (persisted via store)
  const hasInitialSynced = useRef(false);
  const MIN_SYNC_INTERVAL = 1800000; // 30 minutter mellom syncs for å unngå Garmin API block

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === 'accepted') {
      toast.success('App installert!');
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  // Get available seasons from hunts
  const availableSeasons = Array.from(
    new Set(hunts.map((h) => getHuntingSeason(h.date)))
  ).sort().reverse();

  // Hent vær automatisk når sted velges (med geokoding for egendefinerte steder)
  useEffect(() => {
    const fetchWeather = async () => {
      // Bruk customLocation hvis vi er i custom-modus, ellers selectedLocation
      const loc = selectedLocation === '_custom' ? customLocation : selectedLocation;
      if (!loc || loc.length < 2) {
        setWeather(null);
        return;
      }

      // Sjekk om vi har koordinater for dette stedet
      let coords = locationCoords[loc];

      // Hvis ikke, prøv å geokode stedsnavnet
      if (!coords && loc.length > 2) {
        setIsLoadingWeather(true);
        try {
          // Bruk Kartverket stedsnavn-API for å finne koordinater
          const searchUrl = `https://ws.geonorge.no/stedsnavn/v1/navn?sok=${encodeURIComponent(loc)}&maxAnt=1&filtrer=navn`;
          const searchResp = await fetch(searchUrl);
          if (searchResp.ok) {
            const searchData = await searchResp.json();
            if (searchData.navn && searchData.navn.length > 0) {
              const place = searchData.navn[0];
              if (place.representasjonspunkt) {
                coords = [place.representasjonspunkt.nord, place.representasjonspunkt.øst];
              }
            }
          }
        } catch (error) {
          console.error('Kunne ikke geokode sted:', error);
        }
      }

      if (!coords) {
        setIsLoadingWeather(false);
        return;
      }

      setIsLoadingWeather(true);
      try {
        const weatherData = await fetchWeatherFromYr(coords[0], coords[1]);
        if (weatherData) {
          setWeather({
            temperature: weatherData.temperature,
            wind_speed: weatherData.wind_speed,
            wind_direction: weatherData.wind_direction,
            conditions: weatherData.conditions,
          });
        }
      } catch (error) {
        console.error('Kunne ikke hente vær:', error);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    // Debounce for customLocation
    const timer = setTimeout(fetchWeather, selectedLocation === '_custom' ? 800 : 0);
    return () => clearTimeout(timer);
  }, [selectedLocation, customLocation]);

  // Oppdater Zustand store med valg
  useEffect(() => {
    if (selectedDog) {
      setLastSelectedDog(selectedDog);
    }
  }, [selectedDog, setLastSelectedDog]);

  useEffect(() => {
    if (selectedLocation && selectedLocation !== '_custom') {
      setLastSelectedLocation(selectedLocation);
    }
  }, [selectedLocation, setLastSelectedLocation]);

  const currentDogName = activeDogs.find((d) => d.id === selectedDog)?.name || 'Velg hund';
  const todayDate = new Date().toISOString().split('T')[0];

  // Synkroniser med Garmin
  const handleGarminSync = async (silent = false) => {
    if (!selectedDog || isSyncing) return;

    // Rate limiting - sjekk om vi har synket nylig (ikke for initial sync)
    const now = Date.now();
    const timeSinceLastSync = now - lastAutoSyncTime;
    if (lastAutoSyncTime > 0 && timeSinceLastSync < MIN_SYNC_INTERVAL && !silent) {
      const minutesLeft = Math.ceil((MIN_SYNC_INTERVAL - timeSinceLastSync) / 60000);
      toast.error(`Vent ${minutesLeft} min før neste synk`);
      return;
    }

    setLastAutoSyncTime(now);
    setIsSyncing(true);
    try {
      // Simuler API-kall til Garmin Alpha app (1.5s for manuell, 0.5s for automatisk)
      await new Promise((resolve) => setTimeout(resolve, silent ? 500 : 1500));

      const matched = mockGarminTracks.find(
        (track) => track.date === todayDate && track.dogId === selectedDog
      );

      if (matched) {
        setMatchedTrack(matched);
        setShowTrackConfirm(true);

        if (matched.detectedLocation) {
          setSelectedLocation(matched.detectedLocation);
          if (!silent) {
            toast.success(`GPS-spor funnet! Sted: ${matched.detectedLocation}`);
          } else {
            toast.success(`Automatisk synkronisert: ${matched.dogName} på ${matched.detectedLocation}`, {
              duration: 3000,
              icon: '✓',
            });
          }
        } else if (!silent) {
          toast.success(`GPS-spor funnet for ${matched.dogName}!`);
        } else {
          toast.success(`Automatisk synkronisert: ${matched.dogName}`, {
            duration: 3000,
            icon: '✓',
          });
        }
      } else if (!silent) {
        toast.success('Synkronisert - ingen nye spor');
      }
    } catch (error) {
      if (!silent) {
        toast.error('Kunne ikke synkronisere');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Automatisk synkroniser med Garmin KUN ved første innlasting OG hvis det har gått mer enn 30 min
  useEffect(() => {
    // Sjekk om vi har synket nylig (persisted i localStorage)
    const now = Date.now();
    const timeSinceLastSync = now - lastAutoSyncTime;
    const shouldAutoSync = timeSinceLastSync >= MIN_SYNC_INTERVAL || lastAutoSyncTime === 0;

    // Bare synk én gang ved oppstart og hvis rate limit er OK
    if (selectedDog && !matchedTrack && !hasInitialSynced.current && shouldAutoSync) {
      hasInitialSynced.current = true;

      // Vent litt før automatisk synk
      const timer = setTimeout(() => {
        handleGarminSync(true); // Silent sync
      }, 500);

      return () => clearTimeout(timer);
    } else if (selectedDog && !hasInitialSynced.current) {
      // Mark as synced even if we skip due to rate limit
      hasInitialSynced.current = true;
    }
  }, [selectedDog, matchedTrack, lastAutoSyncTime]); // Inkluder lastAutoSyncTime for å sjekke persistert tid

  const handleQuickSave = async () => {
    if (!selectedDog) {
      toast.error('Velg en hund');
      return;
    }
    if (!selectedLocation && !customLocation) {
      toast.error('Velg et sted');
      return;
    }

    setIsSavingQuickNote(true);

    try {
      const finalLocation = selectedLocation === '_custom' ? customLocation : selectedLocation;
      if (selectedLocation === '_custom' && customLocation && !recentLocations.includes(customLocation)) {
        addLocation(customLocation); // Add to global store
        setLastSelectedLocation(customLocation);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const totalSeen = Object.values(gameSeen).reduce((a, b) => a + b, 0);
      const totalHarvested = Object.values(gameHarvested).reduce((a, b) => a + b, 0);

      if (matchedTrack) {
        toast.success(`Jakttur lagret! GPS: ${matchedTrack.distance_km} km`);
      } else if (totalSeen > 0 || totalHarvested > 0) {
        toast.success(`Jakttur lagret! ${totalSeen} sett, ${totalHarvested} felt`);
      } else {
        toast.success('Jakttur lagret!');
      }

      // Reset
      setQuickNote('');
      setCustomLocation('');
      setMatchedTrack(null);
      setShowTrackConfirm(false);
      setGameSeen({});
      setGameHarvested({});
      setPhotos([]);
    } catch (error) {
      toast.error('Kunne ikke lagre');
    } finally {
      setIsSavingQuickNote(false);
    }
  };

  const updateGameCount = (
    setter: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    gameId: string,
    delta: number
  ) => {
    setter((prev) => {
      const current = prev[gameId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [gameId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [gameId]: newValue };
    });
  };

  // Filter hunts by search and season
  const filteredHunts = hunts.filter((hunt) => {
    const matchesSearch =
      hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hunt.location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = getHuntingSeason(hunt.date) === selectedSeason;
    return matchesSearch && matchesSeason;
  });

  const totalSeen = Object.values(gameSeen).reduce((a, b) => a + b, 0);
  const totalHarvested = Object.values(gameHarvested).reduce((a, b) => a + b, 0);

  // Navigate seasons
  const navigateSeason = (direction: 'prev' | 'next') => {
    const currentIndex = availableSeasons.indexOf(selectedSeason);
    if (direction === 'prev' && currentIndex < availableSeasons.length - 1) {
      setSelectedSeason(availableSeasons[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedSeason(availableSeasons[currentIndex - 1]);
    }
  };

  // Calculate season stats
  const seasonStats = {
    total_hunts: filteredHunts.length,
    total_seen: filteredHunts.reduce(
      (acc, h) => acc + h.game_seen.reduce((a, g) => a + g.count, 0),
      0
    ),
    total_harvested: filteredHunts.reduce(
      (acc, h) => acc + h.game_harvested.reduce((a, g) => a + g.count, 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* Registrer jakttur - HOVEDFOKUS */}
      <div className="p-5 bg-background-light rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-text-primary">Registrer jakttur</h1>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              {huntDate.toLocaleDateString('nb-NO', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-1 bg-background-light border border-background-lighter rounded-lg shadow-xl p-3 z-50">
                <input
                  type="date"
                  value={huntDate.toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setHuntDate(new Date(e.target.value));
                    setShowDatePicker(false);
                  }}
                  className="input text-sm"
                />
                <button
                  onClick={() => {
                    setHuntDate(new Date());
                    setShowDatePicker(false);
                  }}
                  className="w-full mt-2 text-xs text-primary-400 hover:text-primary-300"
                >
                  I dag
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hund og Sted */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Hund</label>
            <select
              value={selectedDog}
              onChange={(e) => setSelectedDog(e.target.value)}
              className="select text-sm"
            >
              <option value="">Velg</option>
              {activeDogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Sted</label>
            {selectedLocation === '_custom' ? (
              <div className="relative">
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Skriv stedsnavn..."
                  className="input text-sm pr-8"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSelectedLocation('');
                    setCustomLocation('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <select
                value={selectedLocation}
                onChange={(e) => {
                  if (e.target.value === '_custom') {
                    setSelectedLocation('_custom');
                    setCustomLocation('');
                  } else {
                    setSelectedLocation(e.target.value);
                  }
                }}
                className="select text-sm"
              >
                <option value="">Velg</option>
                {recentLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="_custom">+ Annet</option>
              </select>
            )}
          </div>
        </div>

        {/* Vær (automatisk fra yr.no) */}
        {weather && (
          <div className="bg-background/50 rounded-lg p-3 mb-4 flex items-center gap-4 text-sm">
            <Thermometer className="w-4 h-4 text-accent-400" />
            <span>{weather.temperature}°C</span>
            <Wind className="w-4 h-4 text-accent-400" />
            <span>
              {weather.wind_speed} m/s {weather.wind_direction}
            </span>
            <span className="text-text-muted ml-auto text-xs">yr.no</span>
          </div>
        )}
        {isLoadingWeather && (
          <div className="text-xs text-text-muted mb-4">Henter vær fra yr.no...</div>
        )}

        {/* Notater - FØRST */}
        <textarea
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder={`Notater om jakten...\nHvordan jobbet ${currentDogName !== 'Velg hund' ? currentDogName : 'hunden'}?`}
          className="input min-h-[80px] w-full text-sm mb-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleQuickSave();
            }
          }}
        />

        {/* Vilt - nøytralt ikon */}
        <button
          onClick={() => setShowGameModal(true)}
          className="w-full mb-4 p-3 bg-background rounded-lg flex items-center justify-between hover:bg-background-lighter transition-colors"
        >
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Registrer vilt</span>
          </div>
          <div className="flex items-center gap-2">
            {totalSeen > 0 && (
              <span className="text-sm text-text-primary font-medium">{totalSeen} observert</span>
            )}
            {totalSeen > 0 && totalHarvested > 0 && (
              <span className="text-text-muted">•</span>
            )}
            {totalHarvested > 0 && (
              <span className="text-sm text-success font-medium">{totalHarvested} felt</span>
            )}
            {totalSeen === 0 && totalHarvested === 0 && (
              <span className="text-sm text-text-muted">Legg til</span>
            )}
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </div>
        </button>

        {/* Bilder - nøytralt ikon */}
        <label className="block mb-4 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                const newPhotos: string[] = [];
                Array.from(files).forEach((file) => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      newPhotos.push(ev.target.result as string);
                      if (newPhotos.length === files.length) {
                        setPhotos((prev) => [...prev, ...newPhotos]);
                      }
                    }
                  };
                  reader.readAsDataURL(file);
                });
              }
            }}
          />
          <div className="p-3 bg-background rounded-lg flex items-center justify-between hover:bg-background-lighter transition-colors">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">Bilder</span>
            </div>
            <div className="flex items-center gap-2">
              {photos.length > 0 ? (
                <span className="text-sm text-text-primary font-medium">{photos.length} valgt</span>
              ) : (
                <span className="text-sm text-text-muted">Legg til</span>
              )}
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </div>
        </label>
        {photos.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img
                  src={photo}
                  alt={`Bilde ${i + 1}`}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setPhotos(photos.filter((_, idx) => idx !== i));
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs text-white hover:bg-error/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* GPS-spor */}
        {showTrackConfirm && matchedTrack && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-semibold">{matchedTrack.dogName}</span>
              <span className="text-text-muted">•</span>
              <span>{matchedTrack.distance_km} km</span>
              <span className="text-text-muted">•</span>
              <span>
                {Math.round(matchedTrack.duration_minutes / 60)}t{' '}
                {matchedTrack.duration_minutes % 60}m
              </span>
              <button
                onClick={() => {
                  setMatchedTrack(null);
                  setShowTrackConfirm(false);
                }}
                className="text-xs text-text-muted hover:text-text-primary ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Sentrerte knapper - minimalistisk */}
        <div className="flex flex-col items-center gap-2">
          {!matchedTrack && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleGarminSync()}
                disabled={isSyncing || !selectedDog}
                className="w-full max-w-sm flex items-center justify-center gap-2 py-2 text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synkroniserer...' : 'Synk med Garmin'}
              </button>
              <span className="text-xs text-text-muted/60">(kan gjøres senere)</span>
            </div>
          )}

          <button
            onClick={handleQuickSave}
            disabled={isSavingQuickNote || !selectedDog || (!selectedLocation && !customLocation)}
            className="w-full max-w-sm flex items-center justify-center gap-2 py-2.5 bg-primary-700/80 hover:bg-primary-700 rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSavingQuickNote ? 'Lagrer...' : 'Lagre jakttur'}
          </button>

          <button
            onClick={() => navigate('/statistics')}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Komplett jakthistorikk →
          </button>

          {(totalSeen > 0 || totalHarvested > 0) && (
            <span className="text-xs text-text-muted">
              {totalSeen > 0 && `${totalSeen} observert`}
              {totalSeen > 0 && totalHarvested > 0 && ' • '}
              {totalHarvested > 0 && `${totalHarvested} felt`}
            </span>
          )}
        </div>
      </div>

      {/* Sesong og jaktturer */}
      <div id="hunt-history" className="p-4 bg-background-light rounded-xl space-y-4">
        {/* Sesongnavigering */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateSeason('prev')}
            disabled={availableSeasons.indexOf(selectedSeason) === availableSeasons.length - 1}
            className="p-2 text-text-muted hover:text-primary-400 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="text-xl font-bold text-text-primary mb-1">
              Sesong {selectedSeason}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-text-primary font-medium">{seasonStats.total_hunts} turer</span>
              <span className="text-text-muted">•</span>
              <span className="text-primary-400">{seasonStats.total_seen} sett</span>
              <span className="text-text-muted">•</span>
              <span className="text-success">{seasonStats.total_harvested} felt</span>
            </div>
          </div>

          <button
            onClick={() => navigateSeason('next')}
            disabled={availableSeasons.indexOf(selectedSeason) === 0}
            className="p-2 text-text-muted hover:text-primary-400 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Søk og filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Søk i jaktturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-none rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-primary-700/30 text-primary-400' : 'bg-background text-text-muted hover:text-text-primary'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter */}
        {showFilters && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-background-lighter">
            <select className="bg-background text-sm rounded-lg px-2 py-1.5 text-text-primary border-none">
              <option value="">Vilt</option>
              {gameTypes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select className="bg-background text-sm rounded-lg px-2 py-1.5 text-text-primary border-none">
              <option value="">Sted</option>
              {recentLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <select className="bg-background text-sm rounded-lg px-2 py-1.5 text-text-primary border-none">
              <option value="">Hund</option>
              {activeDogs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Lenke til hundestatistikk */}
        <div className="text-center pt-2 border-t border-background-lighter">
          <button
            onClick={() => navigate('/statistics')}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Se hundestatistikk →
          </button>
        </div>
      </div>

      {/* Jakttur-liste */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : filteredHunts.length === 0 ? (
          <div className="card p-8 text-center">
            <MapPin className="w-10 h-10 mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">Ingen jaktturer i denne sesongen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHunts.map((hunt) => (
              <HuntCard key={hunt.id} hunt={hunt} />
            ))}
          </div>
        )}
      </div>

      {/* Vilt-modal */}
      <Modal
        isOpen={showGameModal}
        onClose={() => setShowGameModal(false)}
        title="Vilt observert og felt"
        size="lg"
      >
        <div className="space-y-4">
          {gameTypes.map((game) => {
            const seen = gameSeen[game.id] || 0;
            const harvested = gameHarvested[game.id] || 0;
            return (
              <div key={game.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm font-medium text-text-primary">{game.name}</span>
                <div className="flex items-center gap-4">
                  {/* Observert */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Sett</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateGameCount(setGameSeen, game.id, -1)}
                        className="w-6 h-6 rounded bg-background-lighter text-text-muted hover:text-text-primary flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-primary-400">
                        {seen}
                      </span>
                      <button
                        onClick={() => updateGameCount(setGameSeen, game.id, 1)}
                        className="w-6 h-6 rounded bg-background-lighter text-text-muted hover:text-text-primary flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Felt */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Felt</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateGameCount(setGameHarvested, game.id, -1)}
                        className="w-6 h-6 rounded bg-background-lighter text-text-muted hover:text-text-primary flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-success">
                        {harvested}
                      </span>
                      <button
                        onClick={() => updateGameCount(setGameHarvested, game.id, 1)}
                        className="w-6 h-6 rounded bg-background-lighter text-text-muted hover:text-text-primary flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setGameSeen({});
              setGameHarvested({});
            }}
            className="text-xs text-text-muted hover:text-error transition-colors"
          >
            Nullstill alle
          </button>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-text-muted">
            {totalSeen > 0 && <span className="text-primary-400 font-medium">{totalSeen} observert</span>}
            {totalSeen > 0 && totalHarvested > 0 && <span className="mx-2">•</span>}
            {totalHarvested > 0 && <span className="text-success font-medium">{totalHarvested} felt</span>}
          </div>
          <button
            onClick={() => setShowGameModal(false)}
            className="px-4 py-2 bg-primary-700/80 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Ferdig
          </button>
        </div>
      </Modal>

      {/* PWA Install Button - Fixed at bottom, minimalist */}
      {showInstallButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-background-light/95 backdrop-blur-sm border-t border-background-lighter p-3 z-40">
          <button
            onClick={handleInstallApp}
            className="w-full flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Installer som app</span>
          </button>
        </div>
      )}
    </div>
  );
}

function HuntCard({ hunt }: { hunt: Hunt }) {
  const gameTypeLabels: Record<string, string> = {
    moose: 'Elg',
    deer: 'Hjort',
    roe_deer: 'Rådyr',
    hare: 'Hare',
    grouse: 'Rype',
    fox: 'Rev',
  };

  const totalSeen = hunt.game_seen.reduce((acc, g) => acc + g.count, 0);
  const totalHarvested = hunt.game_harvested.reduce((acc, g) => acc + g.count, 0);

  return (
    <Link to={`/hunt/${hunt.id}`} className="block group">
      <div className="bg-background-light rounded-lg p-4 hover:bg-background-lighter transition-all duration-200 hover:scale-[1.01] hover:shadow-lg border border-transparent hover:border-primary-700/30 cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-text-primary text-sm group-hover:text-primary-400 transition-colors">
            {hunt.title}
          </h3>
          <span className="text-xs text-text-muted">
            {format(new Date(hunt.date), 'd. MMM', { locale: nb })}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {hunt.location.name}
          </span>
          <span className="flex items-center gap-1">
            <Dog className="w-3 h-3" />
            {hunt.dogs.length}
          </span>
          {totalSeen > 0 && (
            <span className="flex items-center gap-1 text-primary-400">
              <Eye className="w-3 h-3" />
              {totalSeen}
            </span>
          )}
          {totalHarvested > 0 && (
            <span className="flex items-center gap-1 text-success">
              <Target className="w-3 h-3" />
              {totalHarvested}
            </span>
          )}
          {hunt.photos.length > 0 && (
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {hunt.photos.length}
            </span>
          )}
          <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary-400" />
        </div>

        {hunt.game_type.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {hunt.game_type.slice(0, 3).map((type) => (
              <span key={type} className="text-xs bg-background px-2 py-0.5 rounded text-text-muted">
                {gameTypeLabels[type] || type}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
