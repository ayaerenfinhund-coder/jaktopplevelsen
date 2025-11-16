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
  ChevronDown,
  ChevronUp,
  Eye,
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
    { type: 'roe_deer', count: 2, time: '08:45', notes: 'Bukk og rå' },
    { type: 'hare', count: 1, time: '10:00' },
  ],
  game_harvested: [],
  dogs: ['rolex'],
  tracks: [],
  photos: [],
  notes:
    'Rolex jobbet utmerket i terrenget rundt Storeberg. Fint høstvær med god markering.',
  tags: ['morgenjakt', 'storeberg'],
  is_favorite: true,
  created_at: '2024-11-10T11:30:00Z',
  updated_at: '2024-11-10T11:30:00Z',
};

const mockTracks: Track[] = [
  {
    id: 'track1',
    hunt_id: '1',
    dog_id: 'rolex',
    name: 'Rolex - Storeberg',
    source: 'garmin',
    geojson: {
      type: 'LineString',
      coordinates: [
        [10.45, 59.89],
        [10.452, 59.891],
        [10.455, 59.893],
        [10.458, 59.895],
        [10.46, 59.894],
        [10.462, 59.892],
        [10.465, 59.89],
        [10.468, 59.888],
        [10.47, 59.886],
        [10.472, 59.885],
        [10.475, 59.887],
        [10.478, 59.889],
        [10.48, 59.891],
        [10.478, 59.893],
        [10.475, 59.895],
        [10.472, 59.894],
        [10.47, 59.892],
        [10.468, 59.89],
      ],
    },
    statistics: {
      distance_km: 6.8,
      duration_minutes: 270,
      avg_speed_kmh: 1.5,
      max_speed_kmh: 8.2,
      elevation_gain_m: 185,
      elevation_loss_m: 180,
      min_elevation_m: 95,
      max_elevation_m: 280,
      bounding_box: [
        [59.885, 10.45],
        [59.895, 10.48],
      ],
    },
    color: '#D4752E',
    start_time: '2024-11-10T07:00:00Z',
    end_time: '2024-11-10T11:30:00Z',
    created_at: '2024-11-10T11:30:00Z',
  },
];

const mockDogs = [
  { id: 'rolex', name: 'Rolex', breed: 'Dachs', color: '#D4752E' },
];

export default function HuntDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hunt, setHunt] = useState<Hunt | null>(mockHunt);
  const [tracks, setTracks] = useState<Track[]>(mockTracks);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(mockHunt.notes);
  const [showObservations, setShowObservations] = useState(false);
  const [showWeather, setShowWeather] = useState(false);

  const gameTypeLabels: Record<string, string> = {
    moose: 'Elg',
    deer: 'Hjort',
    roe_deer: 'Rådyr',
    hare: 'Hare',
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

  const totalGameSeen = hunt.game_seen.reduce((sum, obs) => sum + obs.count, 0);
  const totalHarvested = hunt.game_harvested.reduce((sum, g) => sum + g.count, 0);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Kompakt header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost btn-icon"
          aria-label="Tilbake"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-primary truncate">{hunt.title}</h1>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(hunt.date), 'd. MMM yyyy', { locale: nb })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {hunt.start_time} - {hunt.end_time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {hunt.location.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {}}
            className={`btn-ghost btn-icon-sm ${hunt.is_favorite ? 'text-accent-500' : ''}`}
          >
            <Heart className={`w-4 h-4 ${hunt.is_favorite ? 'fill-accent-500' : ''}`} />
          </button>
          <button className="btn-ghost btn-icon-sm">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="btn-ghost btn-icon-sm">
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            className="btn-ghost btn-icon-sm text-red-500"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hovedinfo - kompakt linje */}
      <div className="bg-background-light rounded-lg p-3 flex flex-wrap items-center gap-4 text-sm">
        {/* Hunder */}
        <div className="flex items-center gap-2">
          <Dog className="w-4 h-4 text-primary-400" />
          {mockDogs.map((dog) => (
            <span key={dog.id} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dog.color }}
              />
              <span className="text-text-primary font-medium">{dog.name}</span>
            </span>
          ))}
        </div>

        {/* Vær - kollapsbar */}
        {hunt.weather && (
          <button
            onClick={() => setShowWeather(!showWeather)}
            className="flex items-center gap-2 hover:text-primary-400 transition-colors"
          >
            <Thermometer className="w-4 h-4 text-accent-400" />
            <span className="text-text-secondary">{hunt.weather.temperature}°C</span>
            <Wind className="w-4 h-4 text-accent-400" />
            <span className="text-text-secondary">{hunt.weather.wind_speed} m/s</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showWeather ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Observasjoner - kompakt */}
        <button
          onClick={() => setShowObservations(!showObservations)}
          className="flex items-center gap-2 hover:text-primary-400 transition-colors ml-auto"
        >
          <Eye className="w-4 h-4 text-primary-400" />
          <span className="text-text-secondary">
            {totalGameSeen} sett • {totalHarvested} felt
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showObservations ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Utvidet vær-info */}
      {showWeather && hunt.weather && (
        <div className="bg-background rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm animate-fade-in">
          <div>
            <span className="text-text-muted text-xs">Temperatur</span>
            <p className="text-text-primary">{hunt.weather.temperature}°C</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Vind</span>
            <p className="text-text-primary">{hunt.weather.wind_speed} m/s {hunt.weather.wind_direction}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Forhold</span>
            <p className="text-text-primary">{weatherLabels[hunt.weather.conditions]}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Luftfuktighet</span>
            <p className="text-text-primary">{hunt.weather.humidity}%</p>
          </div>
        </div>
      )}

      {/* Utvidet observasjoner */}
      {showObservations && (
        <div className="bg-background rounded-lg p-3 grid grid-cols-2 gap-4 text-sm animate-fade-in">
          <div>
            <h4 className="text-text-muted text-xs mb-2">Vilt observert</h4>
            {hunt.game_seen.length > 0 ? (
              <ul className="space-y-1">
                {hunt.game_seen.map((obs, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-text-secondary">
                      {obs.count}x {gameTypeLabels[obs.type] || obs.type}
                    </span>
                    <span className="text-text-muted">{obs.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted">Ingen</p>
            )}
          </div>
          <div>
            <h4 className="text-text-muted text-xs mb-2">Felt vilt</h4>
            {hunt.game_harvested.length > 0 ? (
              <ul className="space-y-1">
                {hunt.game_harvested.map((game, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-text-secondary">
                      {game.count}x {gameTypeLabels[game.type] || game.type}
                    </span>
                    <span className="text-text-muted">{game.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted">Ingen</p>
            )}
          </div>
        </div>
      )}

      {/* Kart - mindre standard størrelse */}
      <div className="bg-background-lighter rounded-xl overflow-hidden">
        <HuntMap
          tracks={tracks}
          center={hunt.location.coordinates}
          initialHeight="small"
        />
      </div>

      {/* Sporstatistikk - kompakt */}
      {tracks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-background-light rounded-lg p-3 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="font-medium text-sm text-text-primary">
                  {track.name.split(' - ')[0]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-text-muted">Dist.</p>
                  <p className="text-text-primary font-semibold">{track.statistics.distance_km} km</p>
                </div>
                <div>
                  <p className="text-text-muted">Tid</p>
                  <p className="text-text-primary font-semibold">{Math.round(track.statistics.duration_minutes)} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notater - alltid synlig */}
      <div className="bg-background-light rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text-primary">Notater</h3>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Rediger
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotesText(hunt.notes);
                }}
                className="text-sm text-text-muted hover:text-text-primary"
              >
                Avbryt
              </button>
              <button
                onClick={() => {
                  setHunt({ ...hunt, notes: notesText });
                  setEditingNotes(false);
                }}
                className="text-sm text-primary-400 hover:text-primary-300 font-medium"
              >
                Lagre
              </button>
            </div>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            className="input min-h-[120px] w-full text-sm"
            placeholder="Skriv dine notater her..."
            autoFocus
          />
        ) : (
          <p className="text-text-secondary text-sm leading-relaxed">
            {hunt.notes || <span className="text-text-muted italic">Ingen notater</span>}
          </p>
        )}
      </div>

      {/* Bilder - kompakt */}
      {(hunt.photos.length > 0 || true) && (
        <div className="bg-background-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary">
              Bilder {hunt.photos.length > 0 && `(${hunt.photos.length})`}
            </h3>
            <button className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              <Camera className="w-4 h-4" />
              Legg til
            </button>
          </div>
          {hunt.photos.length > 0 ? (
            <PhotoGallery photos={hunt.photos} />
          ) : (
            <p className="text-text-muted text-sm">Ingen bilder lagt til</p>
          )}
        </div>
      )}

      {/* Tagger - kompakt */}
      {hunt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hunt.tags.map((tag) => (
            <span key={tag} className="text-xs bg-background-lighter px-2 py-1 rounded text-text-muted">
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
