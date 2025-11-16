import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Dog,
  Camera,
  Heart,
  MoreVertical,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Hunt } from '../types';

// Mock-data for demonstrasjon
const mockHunts: Hunt[] = [
  {
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
      { type: 'moose', count: 2, time: '08:30' },
      { type: 'roe_deer', count: 3, time: '10:15' },
    ],
    game_harvested: [],
    dogs: ['dog1', 'dog2'],
    tracks: [],
    photos: [],
    notes: 'Fin tur med godt driv',
    tags: ['morgenjakt', 'storvilt'],
    is_favorite: true,
    created_at: '2024-10-15T12:30:00Z',
    updated_at: '2024-10-15T12:30:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Kveldsjakt ved Maridalsvannet',
    date: '2024-10-12',
    start_time: '16:00',
    end_time: '20:00',
    location: {
      name: 'Maridalsvannet',
      region: 'Oslo',
      country: 'Norge',
      coordinates: [59.97, 10.77],
    },
    game_type: ['grouse'],
    game_seen: [{ type: 'grouse', count: 5, time: '17:45' }],
    game_harvested: [{ type: 'grouse', count: 2, time: '18:00' }],
    dogs: ['dog1'],
    tracks: [],
    photos: [],
    notes: '',
    tags: ['kveldsjakt', 'fugl'],
    is_favorite: false,
    created_at: '2024-10-12T20:00:00Z',
    updated_at: '2024-10-12T20:00:00Z',
  },
];

const stats = {
  total_hunts: 47,
  this_season: 12,
  total_distance: 324.5,
  active_dogs: 3,
};

export default function Dashboard() {
  const [hunts, setHunts] = useState<Hunt[]>(mockHunts);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredHunts = hunts.filter(
    (hunt) =>
      hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hunt.location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Overskrift */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Oversikt</h1>
          <p className="text-text-secondary mt-1">
            Velkommen tilbake! Her er dine siste jaktturer.
          </p>
        </div>
        <Link to="/hunt/new">
          <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />}>
            Ny jakttur
          </Button>
        </Link>
      </div>

      {/* Statistikk-kort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-700/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Totalt jaktturer</p>
              <p className="text-2xl font-bold text-text-primary">{stats.total_hunts}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Denne sesongen</p>
              <p className="text-2xl font-bold text-text-primary">{stats.this_season}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-700/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-secondary-400" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total distanse</p>
              <p className="text-2xl font-bold text-text-primary">{stats.total_distance} km</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
              <Dog className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Aktive hunder</p>
              <p className="text-2xl font-bold text-text-primary">{stats.active_dogs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Søk og filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Søk etter jaktturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <Button
          variant="ghost"
          leftIcon={<Filter className="w-5 h-5" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filter
        </Button>
      </div>

      {/* Filterpanel */}
      {showFilters && (
        <div className="card p-6 animate-slide-down">
          <h3 className="font-semibold text-text-primary mb-4">Filtrer jaktturer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Fra dato</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="input-label">Til dato</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="input-label">Vilttype</label>
              <select className="select">
                <option value="">Alle</option>
                <option value="moose">Elg</option>
                <option value="deer">Hjort</option>
                <option value="roe_deer">Rådyr</option>
                <option value="grouse">Rype</option>
              </select>
            </div>
            <div>
              <label className="input-label">Kun favoritter</label>
              <div className="flex items-center h-10">
                <input type="checkbox" className="checkbox" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jakttur-liste */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Siste jaktturer</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredHunts.length === 0 ? (
          <div className="card p-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Ingen jaktturer funnet
            </h3>
            <p className="text-text-muted mb-6">
              {searchQuery
                ? 'Prøv et annet søkeord'
                : 'Kom i gang ved å registrere din første jakttur'}
            </p>
            <Link to="/hunt/new">
              <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
                Ny jakttur
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHunts.map((hunt) => (
              <HuntCard key={hunt.id} hunt={hunt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HuntCard({ hunt }: { hunt: Hunt }) {
  const gameTypeLabels: Record<string, string> = {
    moose: 'Elg',
    deer: 'Hjort',
    roe_deer: 'Rådyr',
    wild_boar: 'Villsvin',
    fox: 'Rev',
    hare: 'Hare',
    grouse: 'Rype',
    ptarmigan: 'Fjellrype',
    capercaillie: 'Tiur',
    black_grouse: 'Orrfugl',
    duck: 'And',
    goose: 'Gås',
  };

  return (
    <Link to={`/hunt/${hunt.id}`} className="block">
      <div className="card-hover">
        {/* Bilde/kart-område */}
        <div className="aspect-hunt-card bg-background-lighter relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-text-muted opacity-30" />
          </div>
          {hunt.is_favorite && (
            <div className="absolute top-3 right-3">
              <Heart className="w-6 h-6 text-accent-500 fill-accent-500" />
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className="badge-primary">{hunt.location.name}</span>
          </div>
        </div>

        {/* Innhold */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-text-primary text-lg line-clamp-1">
              {hunt.title}
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="btn-ghost btn-icon-sm -mr-2"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-text-muted mb-3">
            {format(new Date(hunt.date), 'EEEE d. MMMM yyyy', { locale: nb })}
          </p>

          {/* Vilttyper */}
          <div className="flex flex-wrap gap-2 mb-3">
            {hunt.game_type.slice(0, 3).map((type) => (
              <span key={type} className="badge-secondary">
                {gameTypeLabels[type] || type}
              </span>
            ))}
            {hunt.game_type.length > 3 && (
              <span className="badge-secondary">+{hunt.game_type.length - 3}</span>
            )}
          </div>

          {/* Statistikk */}
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <Dog className="w-4 h-4" />
              <span>{hunt.dogs.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              <span>{hunt.photos.length}</span>
            </div>
            {hunt.game_seen.length > 0 && (
              <div className="flex items-center gap-1">
                <span>
                  {hunt.game_seen.reduce((acc, g) => acc + g.count, 0)} observert
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
