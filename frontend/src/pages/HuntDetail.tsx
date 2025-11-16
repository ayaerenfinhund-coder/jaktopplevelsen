import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Dog,
  Camera,
  Heart,
  Share2,
  Edit3,
  Trash2,
  Cloud,
  Wind,
  Thermometer,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HuntMap from '../components/maps/HuntMap';
import PhotoGallery from '../components/gallery/PhotoGallery';
import type { Hunt, Track } from '../types';

// Mock-data
const mockHunt: Hunt = {
  id: '1',
  user_id: 'user1',
  title: 'Morgenjakt i Nordmarka',
  date: '2024-10-15',
  start_time: '06:00',
  end_time: '12:30',
  location: {
    name: 'Nordmarka',
    region: 'Viken',
    country: 'Norge',
    coordinates: [60.05, 10.72],
  },
  weather: {
    temperature: 8,
    humidity: 75,
    wind_speed: 3,
    wind_direction: 'NV',
    precipitation: 'none',
    conditions: 'cloudy',
  },
  game_type: ['moose', 'roe_deer'],
  game_seen: [
    { type: 'moose', count: 2, time: '08:30', notes: 'Ku og kalv' },
    { type: 'roe_deer', count: 3, time: '10:15' },
  ],
  game_harvested: [],
  dogs: ['dog1', 'dog2'],
  tracks: [],
  photos: [],
  notes:
    'Fin tur med godt driv. Hundene jobbet bra sammen. Vær var litt overskyet men passe temperatur for hundene.',
  tags: ['morgenjakt', 'storvilt'],
  is_favorite: true,
  created_at: '2024-10-15T12:30:00Z',
  updated_at: '2024-10-15T12:30:00Z',
};

const mockTracks: Track[] = [
  {
    id: 'track1',
    hunt_id: '1',
    dog_id: 'dog1',
    name: 'Rex - Morgenjakt',
    source: 'garmin',
    geojson: {
      type: 'LineString',
      coordinates: [
        [10.72, 60.05],
        [10.73, 60.051],
        [10.735, 60.053],
        [10.74, 60.055],
        [10.738, 60.058],
        [10.735, 60.06],
      ],
    },
    statistics: {
      distance_km: 8.5,
      duration_minutes: 195,
      avg_speed_kmh: 2.6,
      max_speed_kmh: 12.3,
      elevation_gain_m: 245,
      elevation_loss_m: 230,
      min_elevation_m: 180,
      max_elevation_m: 425,
      bounding_box: [
        [60.05, 10.72],
        [60.06, 10.74],
      ],
    },
    color: '#FF6B6B',
    start_time: '2024-10-15T06:00:00Z',
    end_time: '2024-10-15T09:15:00Z',
    created_at: '2024-10-15T12:30:00Z',
  },
  {
    id: 'track2',
    hunt_id: '1',
    dog_id: 'dog2',
    name: 'Luna - Morgenjakt',
    source: 'garmin',
    geojson: {
      type: 'LineString',
      coordinates: [
        [10.72, 60.05],
        [10.715, 60.052],
        [10.71, 60.054],
        [10.712, 60.057],
        [10.715, 60.059],
        [10.72, 60.061],
      ],
    },
    statistics: {
      distance_km: 7.2,
      duration_minutes: 180,
      avg_speed_kmh: 2.4,
      max_speed_kmh: 10.8,
      elevation_gain_m: 210,
      elevation_loss_m: 195,
      min_elevation_m: 190,
      max_elevation_m: 410,
      bounding_box: [
        [60.05, 10.71],
        [60.061, 10.72],
      ],
    },
    color: '#4ECDC4',
    start_time: '2024-10-15T06:00:00Z',
    end_time: '2024-10-15T09:00:00Z',
    created_at: '2024-10-15T12:30:00Z',
  },
];

const mockDogs = [
  { id: 'dog1', name: 'Rex', breed: 'Norsk Elghund', color: '#FF6B6B' },
  { id: 'dog2', name: 'Luna', breed: 'Norsk Elghund', color: '#4ECDC4' },
];

export default function HuntDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hunt, setHunt] = useState<Hunt | null>(mockHunt);
  const [tracks, setTracks] = useState<Track[]>(mockTracks);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'photos' | 'notes'>('map');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const gameTypeLabels: Record<string, string> = {
    moose: 'Elg',
    deer: 'Hjort',
    roe_deer: 'Rådyr',
    grouse: 'Rype',
  };

  const weatherLabels: Record<string, string> = {
    clear: 'Klart',
    cloudy: 'Lettskyet',
    overcast: 'Overskyet',
    rain: 'Regn',
    snow: 'Snø',
    fog: 'Tåke',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hunt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Jakttur ikke funnet
        </h2>
        <Link to="/">
          <Button variant="primary">Tilbake til oversikt</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost btn-icon"
          aria-label="Tilbake"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{hunt.title}</h1>
          <p className="text-text-muted">
            {format(new Date(hunt.date), 'EEEE d. MMMM yyyy', { locale: nb })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className={`btn-ghost btn-icon ${hunt.is_favorite ? 'text-accent-500' : ''}`}
          >
            <Heart
              className={`w-5 h-5 ${hunt.is_favorite ? 'fill-accent-500' : ''}`}
            />
          </button>
          <button className="btn-ghost btn-icon">
            <Share2 className="w-5 h-5" />
          </button>
          <Button variant="ghost" size="sm" leftIcon={<Edit3 className="w-4 h-4" />}>
            Rediger
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Slett
          </Button>
        </div>
      </div>

      {/* Info-kort */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tid og sted */}
        <div className="card p-4">
          <h3 className="font-semibold text-text-primary mb-3">Detaljer</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-text-secondary">
              <Calendar className="w-5 h-5 text-primary-400" />
              <span>{format(new Date(hunt.date), 'd. MMMM yyyy', { locale: nb })}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Clock className="w-5 h-5 text-primary-400" />
              <span>
                {hunt.start_time} - {hunt.end_time || 'Pågående'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <MapPin className="w-5 h-5 text-primary-400" />
              <span>
                {hunt.location.name}
                {hunt.location.region && `, ${hunt.location.region}`}
              </span>
            </div>
          </div>
        </div>

        {/* Vær */}
        {hunt.weather && (
          <div className="card p-4">
            <h3 className="font-semibold text-text-primary mb-3">Værforhold</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-text-secondary">
                <Thermometer className="w-5 h-5 text-accent-400" />
                <span>{hunt.weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Wind className="w-5 h-5 text-accent-400" />
                <span>
                  {hunt.weather.wind_speed} m/s {hunt.weather.wind_direction}
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Cloud className="w-5 h-5 text-accent-400" />
                <span>{weatherLabels[hunt.weather.conditions] || hunt.weather.conditions}</span>
              </div>
            </div>
          </div>
        )}

        {/* Hunder */}
        <div className="card p-4">
          <h3 className="font-semibold text-text-primary mb-3">Hunder</h3>
          <div className="space-y-3">
            {mockDogs.map((dog) => (
              <div key={dog.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: dog.color }}
                />
                <div>
                  <p className="text-text-primary font-medium">{dog.name}</p>
                  <p className="text-sm text-text-muted">{dog.breed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Observasjoner */}
      <div className="card p-4">
        <h3 className="font-semibold text-text-primary mb-3">Observasjoner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-text-muted mb-2">Vilt observert</h4>
            {hunt.game_seen.length > 0 ? (
              <ul className="space-y-2">
                {hunt.game_seen.map((obs, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-text-secondary">
                      {obs.count}x {gameTypeLabels[obs.type] || obs.type}
                    </span>
                    <span className="text-sm text-text-muted">{obs.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted">Ingen observasjoner</p>
            )}
          </div>
          <div>
            <h4 className="text-sm text-text-muted mb-2">Felt vilt</h4>
            {hunt.game_harvested.length > 0 ? (
              <ul className="space-y-2">
                {hunt.game_harvested.map((game, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-text-secondary">
                      {game.count}x {gameTypeLabels[game.type] || game.type}
                    </span>
                    <span className="text-sm text-text-muted">{game.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted">Ingen felt</p>
            )}
          </div>
        </div>
      </div>

      {/* Faner */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-background-lighter">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'map'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Kart og spor
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'photos'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Bilder ({hunt.photos.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'notes'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Notater
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'map' && (
            <div className="space-y-4">
              {/* Kart */}
              <div className="h-96 bg-background-lighter rounded-lg overflow-hidden">
                <HuntMap tracks={tracks} center={hunt.location.coordinates} />
              </div>

              {/* Tidslinje-kontroller */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn-primary btn-icon"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setPlaybackTime(0)}
                  className="btn-ghost btn-icon"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playbackTime}
                  onChange={(e) => setPlaybackTime(Number(e.target.value))}
                  className="timeline-slider flex-1"
                />
                <span className="text-sm text-text-muted w-20 text-right">
                  {Math.round(playbackTime)}%
                </span>
              </div>

              {/* Sporstatistikk */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tracks.map((track) => (
                  <div key={track.id} className="p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="font-medium text-text-primary text-sm">
                        {track.name.split(' - ')[0]}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted space-y-1">
                      <p>{track.statistics.distance_km} km</p>
                      <p>{Math.round(track.statistics.duration_minutes)} min</p>
                      <p>↑{track.statistics.elevation_gain_m}m</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              {hunt.photos.length > 0 ? (
                <PhotoGallery photos={hunt.photos} />
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 mx-auto text-text-muted mb-4" />
                  <p className="text-text-muted">Ingen bilder lagt til</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Legg til bilder
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="prose prose-invert max-w-none">
              {hunt.notes ? (
                <p className="text-text-secondary whitespace-pre-wrap">{hunt.notes}</p>
              ) : (
                <p className="text-text-muted italic">Ingen notater</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tagger */}
      {hunt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hunt.tags.map((tag) => (
            <span key={tag} className="badge-primary">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Slett-modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Slett jakttur"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Er du sikker på at du vil slette denne jaktturen? Dette kan ikke angres.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Avbryt
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // Slett logikk
                setShowDeleteModal(false);
                navigate('/');
              }}
            >
              Slett
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
