import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Dog,
  Camera,
  Share2,
  Edit3,
  Trash2,
  Wind,
  Thermometer,
  Eye,
  Target,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudFog,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HuntMap from '../components/maps/HuntMap';
import PhotoGallery from '../components/gallery/PhotoGallery';
import toast from 'react-hot-toast';
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
  const { id: _id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hunt, setHunt] = useState<Hunt | null>(mockHunt);
  const [tracks] = useState<Track[]>(mockTracks);
  const [isLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(mockHunt.notes);

  // Edit form state
  const [editTitle, setEditTitle] = useState(mockHunt.title);
  const [editDate, setEditDate] = useState(mockHunt.date);
  const [editStartTime, setEditStartTime] = useState(mockHunt.start_time);
  const [editEndTime, setEditEndTime] = useState(mockHunt.end_time);
  const [editLocation, setEditLocation] = useState(mockHunt.location.name);

  const gameTypeLabels: Record<string, string> = {
    moose: 'Elg',
    deer: 'Hjort',
    roe_deer: 'Rådyr',
    hare: 'Hare',
    grouse: 'Rype',
  };

  const weatherLabels: Record<string, string> = {
    clear: 'Klart vær',
    cloudy: 'Lettskyet',
    overcast: 'Overskyet',
    rain: 'Regn',
    snow: 'Snø',
    fog: 'Tåke',
    light_rain: 'Lett regn',
    heavy_rain: 'Kraftig regn',
    light_snow: 'Lett snø',
    heavy_snow: 'Kraftig snøfall',
    sleet: 'Sludd',
    partly_cloudy: 'Delvis skyet',
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'rain':
      case 'light_rain':
      case 'heavy_rain':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'snow':
      case 'light_snow':
      case 'heavy_snow':
        return <CloudSnow className="w-6 h-6 text-blue-200" />;
      case 'fog':
        return <CloudFog className="w-6 h-6 text-gray-400" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-400" />;
    }
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
    <div className="space-y-5 max-w-5xl mx-auto pb-8">
      {/* Header - mobilvennlig */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 -ml-3 hover:bg-background-lighter rounded-lg transition-colors"
            aria-label="Tilbake"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary flex-1">{hunt.title}</h1>
        </div>

        {/* Metadata - vertikal layout for mobil */}
        <div className="flex flex-col gap-2 text-base text-text-muted pl-1">
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {format(new Date(hunt.date), 'd. MMMM yyyy', { locale: nb })}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {hunt.start_time} - {hunt.end_time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {hunt.location.name}, {hunt.location.region}
          </span>
        </div>

        {/* Handlingsknapper - større touch targets */}
        <div className="flex items-center gap-3 pt-2">
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-background-light hover:bg-background-lighter rounded-lg transition-colors"
            onClick={() => {
              const shareUrl = `${window.location.origin}/share/${hunt.id}`;
              navigator.clipboard.writeText(shareUrl);
              toast.success('Delingslenke kopiert!');
            }}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Del</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-background-light hover:bg-background-lighter rounded-lg transition-colors"
            onClick={() => setShowEditModal(true)}
          >
            <Edit3 className="w-5 h-5" />
            <span className="text-sm font-medium">Rediger</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-auto"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Slett</span>
          </button>
        </div>
      </div>

      {/* 1. Kart - FØRST */}
      <div className="bg-background-light rounded-xl overflow-hidden">
        <HuntMap
          tracks={tracks}
          center={hunt.location.coordinates}
          initialHeight="medium"
        />
      </div>

      {/* 2. Notater */}
      <div className="bg-background-light rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">Notater</h3>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="px-3 py-1.5 text-sm text-primary-400 hover:bg-primary-400/10 rounded-lg transition-colors"
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
                className="px-3 py-1.5 text-sm text-text-muted hover:bg-background-lighter rounded-lg transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => {
                  setHunt({ ...hunt, notes: notesText });
                  setEditingNotes(false);
                }}
                className="px-3 py-1.5 text-sm text-primary-400 hover:bg-primary-400/10 rounded-lg font-medium transition-colors"
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
            className="input min-h-[140px] w-full text-base"
            placeholder="Skriv dine notater her..."
            autoFocus
          />
        ) : (
          <p className="text-text-secondary text-base leading-relaxed whitespace-pre-wrap">
            {hunt.notes || <span className="text-text-muted italic">Ingen notater</span>}
          </p>
        )}
      </div>

      {/* 3. Statistikk - observert/felt/distanse/varighet */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background-light rounded-xl p-4 text-center">
          <Eye className="w-6 h-6 text-primary-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-text-primary">{totalGameSeen}</p>
          <p className="text-sm text-text-muted">Observert</p>
        </div>
        <div className="bg-background-light rounded-xl p-4 text-center">
          <Target className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-text-primary">{totalHarvested}</p>
          <p className="text-sm text-text-muted">Felt</p>
        </div>
        {tracks[0] && (
          <>
            <div className="bg-background-light rounded-xl p-4 text-center">
              <Dog className="w-6 h-6 text-accent-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{tracks[0].statistics.distance_km} km</p>
              <p className="text-sm text-text-muted">Distanse</p>
            </div>
            <div className="bg-background-light rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">
                {Math.floor(tracks[0].statistics.duration_minutes / 60)}t {tracks[0].statistics.duration_minutes % 60}m
              </p>
              <p className="text-sm text-text-muted">Varighet</p>
            </div>
          </>
        )}
      </div>

      {/* 4. Værforhold */}
      {hunt.weather && (
        <div className="bg-background-light rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            {getWeatherIcon(hunt.weather.conditions)}
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                {weatherLabels[hunt.weather.conditions] || hunt.weather.conditions}
              </h3>
              <p className="text-sm text-text-muted">Værforhold under jakten</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-accent-400" />
              <div>
                <p className="text-xs text-text-muted">Temperatur</p>
                <p className="text-base font-medium text-text-primary">{hunt.weather.temperature}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-accent-400" />
              <div>
                <p className="text-xs text-text-muted">Vind</p>
                <p className="text-base font-medium text-text-primary">{hunt.weather.wind_speed} m/s {hunt.weather.wind_direction}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Hunder */}
      {tracks.length > 0 && (
        <div className="bg-background-light rounded-xl p-4">
          <h3 className="text-sm font-medium text-text-muted mb-3">Hunder</h3>
          <div className="space-y-3">
            {tracks.map((track) => {
              const dogName = track.name.split(' - ')[0];
              return (
                <div key={track.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: track.color }}
                  >
                    {dogName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-medium text-text-primary">{dogName}</p>
                    <p className="text-sm text-text-muted">
                      {track.statistics.distance_km} km • {Math.floor(track.statistics.duration_minutes / 60)}t {track.statistics.duration_minutes % 60}m
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Vilt - detaljert */}
      {(hunt.game_seen.length > 0 || hunt.game_harvested.length > 0) && (
        <div className="bg-background-light rounded-xl p-4">
          <h3 className="text-sm font-medium text-text-muted mb-3">Vilt</h3>
          <div className="grid grid-cols-2 gap-6">
            {hunt.game_seen.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2">Observert</p>
                <div className="space-y-2">
                  {hunt.game_seen.map((obs, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-base text-text-secondary">
                        {gameTypeLabels[obs.type] || obs.type}
                      </span>
                      <span className="text-base font-medium text-text-primary">{obs.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hunt.game_harvested.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2">Felt</p>
                <div className="space-y-2">
                  {hunt.game_harvested.map((game, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-base text-text-secondary">
                        {gameTypeLabels[game.type] || game.type}
                      </span>
                      <span className="text-base font-medium text-success">{game.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Bilder */}
      <div className="bg-background-light rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Bilder {hunt.photos.length > 0 && `(${hunt.photos.length})`}
          </h3>
          <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-400 hover:bg-primary-400/10 rounded-lg transition-colors cursor-pointer">
            <Camera className="w-4 h-4" />
            Legg til
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && hunt) {
                  const newPhotos: string[] = [];
                  Array.from(files).forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        newPhotos.push(ev.target.result as string);
                        if (newPhotos.length === files.length) {
                          setHunt({ ...hunt, photos: [...hunt.photos, ...newPhotos] });
                          toast.success(`${files.length} bilde(r) lagt til`);
                        }
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }
              }}
            />
          </label>
        </div>
        {hunt.photos.length > 0 ? (
          <PhotoGallery photos={hunt.photos} />
        ) : (
          <p className="text-text-muted text-base">Ingen bilder lagt til</p>
        )}
      </div>

      {/* Tagger */}
      {hunt.tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {hunt.tags.map((tag) => (
            <span key={tag} className="text-sm bg-background-lighter px-3 py-1.5 rounded-lg text-text-muted">
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

      {/* Rediger-modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Rediger jakttur"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setHunt({
              ...hunt,
              title: editTitle,
              date: editDate,
              start_time: editStartTime,
              end_time: editEndTime,
              location: {
                ...hunt.location,
                name: editLocation,
              },
            });
            setShowEditModal(false);
            toast.success('Jakttur oppdatert!');
          }}
          className="space-y-4"
        >
          <div>
            <label className="input-label">Tittel</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Dato</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Sted</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Starttid</label>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Sluttid</label>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditModal(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" variant="primary">
              Lagre endringer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
