import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Edit3,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Hunt } from '../types';

// Mock-data for demonstrasjon
const mockHunts: Hunt[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Morgenjakt ved Semsvannet',
    date: '2024-11-10',
    start_time: '07:00',
    end_time: '11:30',
    location: {
      name: 'Semsvannet',
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
      { type: 'roe_deer', count: 2, time: '08:45' },
      { type: 'hare', count: 1, time: '10:00' },
    ],
    game_harvested: [],
    dogs: ['rolex'],
    tracks: [],
    photos: [],
    notes: 'Rolex jobbet utmerket i terrenget rundt vannet',
    tags: ['morgenjakt', 'semsvannet'],
    is_favorite: true,
    created_at: '2024-11-10T11:30:00Z',
    updated_at: '2024-11-10T11:30:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Ettermiddagsjakt ved Semsvannet',
    date: '2024-11-08',
    start_time: '14:00',
    end_time: '17:30',
    location: {
      name: 'Semsvannet',
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
];

const stats = {
  total_hunts: 24,
  this_season: 8,
  total_distance: 156.3,
  active_dogs: 1,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [hunts, setHunts] = useState<Hunt[]>(mockHunts);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Hurtignotat
  const [quickNote, setQuickNote] = useState('');
  const [isSavingQuickNote, setIsSavingQuickNote] = useState(false);

  const handleQuickSave = async () => {
    if (!quickNote.trim()) return;
    setIsSavingQuickNote(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Jakttur lagret!');
      setQuickNote('');
      // I virkeligheten ville vi oppdatere listen her
    } catch (error) {
      toast.error('Kunne ikke lagre');
    } finally {
      setIsSavingQuickNote(false);
    }
  };

  const filteredHunts = hunts.filter(
    (hunt) =>
      hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hunt.location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HOVEDFORMÅL: Registrer ny jakttur */}
      <div className="card p-8 bg-gradient-to-br from-primary-700/20 via-primary-700/10 to-transparent border-2 border-primary-700/40">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Registrer dagens jakt
          </h1>
          <p className="text-text-muted">
            Rolex • Semsvannet •{' '}
            {new Date().toLocaleDateString('nb-NO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Skriv om jakten...&#10;&#10;Hvordan jobbet Rolex i dag?&#10;Hva observerte dere?&#10;Hvordan var terrenget og forholdene?"
            className="input min-h-[200px] w-full font-normal text-base leading-relaxed resize-y"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleQuickSave();
              }
            }}
            autoFocus
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">
              ⌘+Enter for å lagre • Notater kan alltid redigeres senere
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => navigate('/hunt/new')}>
                Legg til detaljer
              </Button>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Send className="w-5 h-5" />}
                onClick={handleQuickSave}
                isLoading={isSavingQuickNote}
                disabled={!quickNote.trim()}
              >
                Lagre jakttur
              </Button>
            </div>
          </div>
        </div>
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
          Filtrer
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
