import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Dog,
  MapPin,
  TrendingUp,
  Clock,
  Mountain,
  Route,
  Calendar,
  Target,
  Eye,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

// Mock dogs
const mockDogs = [{ id: 'rolex', name: 'Rolex', breed: 'Dachs', color: '#D4752E' }];

// Mock detailed Garmin data - ALT historisk data
interface GarminHistoryEntry {
  id: string;
  date: string;
  location: string;
  distance_km: number;
  duration_minutes: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  min_elevation_m: number;
  max_elevation_m: number;
  calories_burned: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  temperature_start: number;
  temperature_end: number;
}

// All historical Garmin data for Rolex
const mockGarminHistory: Record<string, GarminHistoryEntry[]> = {
  rolex: [
    {
      id: 't1',
      date: '2024-11-10',
      location: 'Storeberg',
      distance_km: 8.3,
      duration_minutes: 225,
      avg_speed_kmh: 2.2,
      max_speed_kmh: 12.5,
      elevation_gain_m: 245,
      elevation_loss_m: 240,
      min_elevation_m: 120,
      max_elevation_m: 365,
      calories_burned: 1850,
      avg_heart_rate: 145,
      max_heart_rate: 178,
      temperature_start: 3,
      temperature_end: 7,
    },
    {
      id: 't2',
      date: '2024-11-08',
      location: 'Tveiter',
      distance_km: 6.2,
      duration_minutes: 180,
      avg_speed_kmh: 2.1,
      max_speed_kmh: 11.8,
      elevation_gain_m: 198,
      elevation_loss_m: 195,
      min_elevation_m: 115,
      max_elevation_m: 313,
      calories_burned: 1420,
      avg_heart_rate: 142,
      max_heart_rate: 172,
      temperature_start: 5,
      temperature_end: 6,
    },
    {
      id: 't3',
      date: '2024-10-25',
      location: 'Hanevold',
      distance_km: 9.7,
      duration_minutes: 285,
      avg_speed_kmh: 2.0,
      max_speed_kmh: 13.2,
      elevation_gain_m: 312,
      elevation_loss_m: 308,
      min_elevation_m: 95,
      max_elevation_m: 407,
      calories_burned: 2150,
      avg_heart_rate: 148,
      max_heart_rate: 185,
      temperature_start: 8,
      temperature_end: 11,
    },
    {
      id: 't4',
      date: '2024-10-12',
      location: 'Storeberg',
      distance_km: 7.1,
      duration_minutes: 210,
      avg_speed_kmh: 2.0,
      max_speed_kmh: 10.9,
      elevation_gain_m: 225,
      elevation_loss_m: 222,
      min_elevation_m: 125,
      max_elevation_m: 350,
      calories_burned: 1680,
      avg_heart_rate: 140,
      max_heart_rate: 169,
      temperature_start: 10,
      temperature_end: 12,
    },
    {
      id: 't5',
      date: '2024-09-28',
      location: 'Tveiter',
      distance_km: 5.8,
      duration_minutes: 165,
      avg_speed_kmh: 2.1,
      max_speed_kmh: 11.2,
      elevation_gain_m: 178,
      elevation_loss_m: 175,
      min_elevation_m: 118,
      max_elevation_m: 296,
      calories_burned: 1320,
      avg_heart_rate: 138,
      max_heart_rate: 165,
      temperature_start: 12,
      temperature_end: 14,
    },
    {
      id: 't6',
      date: '2023-11-15',
      location: 'Storeberg',
      distance_km: 7.9,
      duration_minutes: 235,
      avg_speed_kmh: 2.0,
      max_speed_kmh: 12.1,
      elevation_gain_m: 258,
      elevation_loss_m: 255,
      min_elevation_m: 122,
      max_elevation_m: 380,
      calories_burned: 1790,
      avg_heart_rate: 143,
      max_heart_rate: 175,
      temperature_start: 2,
      temperature_end: 5,
    },
    {
      id: 't7',
      date: '2023-10-15',
      location: 'Storeberg',
      distance_km: 8.5,
      duration_minutes: 250,
      avg_speed_kmh: 2.0,
      max_speed_kmh: 12.8,
      elevation_gain_m: 275,
      elevation_loss_m: 272,
      min_elevation_m: 120,
      max_elevation_m: 395,
      calories_burned: 1920,
      avg_heart_rate: 146,
      max_heart_rate: 180,
      temperature_start: 9,
      temperature_end: 11,
    },
  ],
};

export default function DogStatistics() {
  const navigate = useNavigate();
  const [selectedDog, setSelectedDog] = useState(mockDogs[0]?.id || '');

  const dogData = mockGarminHistory[selectedDog] || [];
  const dog = mockDogs.find((d) => d.id === selectedDog);

  // Calculate total statistics
  const totalStats = {
    total_hunts: dogData.length,
    total_distance: dogData.reduce((acc, d) => acc + d.distance_km, 0),
    total_duration: dogData.reduce((acc, d) => acc + d.duration_minutes, 0),
    total_elevation: dogData.reduce((acc, d) => acc + d.elevation_gain_m, 0),
    total_calories: dogData.reduce((acc, d) => acc + d.calories_burned, 0),
    avg_distance: dogData.length > 0 ? dogData.reduce((acc, d) => acc + d.distance_km, 0) / dogData.length : 0,
    avg_duration: dogData.length > 0 ? dogData.reduce((acc, d) => acc + d.duration_minutes, 0) / dogData.length : 0,
    max_distance: dogData.length > 0 ? Math.max(...dogData.map((d) => d.distance_km)) : 0,
    max_elevation: dogData.length > 0 ? Math.max(...dogData.map((d) => d.max_elevation_m)) : 0,
    max_speed: dogData.length > 0 ? Math.max(...dogData.map((d) => d.max_speed_kmh)) : 0,
    avg_max_hr: dogData.length > 0 && dogData[0].max_heart_rate
      ? dogData.reduce((acc, d) => acc + (d.max_heart_rate || 0), 0) / dogData.length
      : 0,
  };

  // Group by location
  const locationStats = dogData.reduce(
    (acc, entry) => {
      if (!acc[entry.location]) {
        acc[entry.location] = { count: 0, distance: 0, duration: 0 };
      }
      acc[entry.location].count++;
      acc[entry.location].distance += entry.distance_km;
      acc[entry.location].duration += entry.duration_minutes;
      return acc;
    },
    {} as Record<string, { count: number; distance: number; duration: number }>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Detaljert Statistikk</h1>
      </div>

      {/* Dog selector */}
      <div className="card p-4">
        <label className="text-sm text-text-muted mb-2 block">Velg hund</label>
        <select
          value={selectedDog}
          onChange={(e) => setSelectedDog(e.target.value)}
          className="select"
        >
          {mockDogs.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name} ({dog.breed})
            </option>
          ))}
        </select>
      </div>

      {dog && (
        <>
          {/* Total lifetime stats */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dog.color }}
              >
                <Dog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">{dog.name}</h2>
                <p className="text-sm text-text-muted">
                  Total historikk fra Garmin Alpha 200
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4">
                <TrendingUp className="w-5 h-5 text-primary-400 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_hunts}
                </p>
                <p className="text-xs text-text-muted">Totalt jaktturer</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Route className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_distance.toFixed(1)} km
                </p>
                <p className="text-xs text-text-muted">Total distanse</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Clock className="w-5 h-5 text-secondary-400 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {Math.round(totalStats.total_duration / 60)}t
                </p>
                <p className="text-xs text-text-muted">Total tid i felt</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Mountain className="w-5 h-5 text-success mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_elevation.toLocaleString()}m
                </p>
                <p className="text-xs text-text-muted">Total høydemeter</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_calories.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">Kalorier brent</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Route className="w-5 h-5 text-primary-400 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.avg_distance.toFixed(1)} km
                </p>
                <p className="text-xs text-text-muted">Snitt per tur</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Target className="w-5 h-5 text-red-500 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.max_speed.toFixed(1)} km/t
                </p>
                <p className="text-xs text-text-muted">Maks hastighet</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <Mountain className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.max_elevation}m
                </p>
                <p className="text-xs text-text-muted">Høyeste punkt</p>
              </div>
            </div>
          </div>

          {/* Location breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Statistikk per sted
            </h3>
            <div className="space-y-3">
              {Object.entries(locationStats)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([location, stats]) => (
                  <div
                    key={location}
                    className="bg-background rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{location}</p>
                      <p className="text-sm text-text-muted">{stats.count} turer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary">{stats.distance.toFixed(1)} km</p>
                      <p className="text-xs text-text-muted">
                        {Math.round(stats.duration / 60)}t total
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Detailed history table */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Komplett jakthistorikk
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-background-lighter">
                    <th className="text-left py-3 px-2 text-text-muted font-medium">
                      Dato
                    </th>
                    <th className="text-left py-3 px-2 text-text-muted font-medium">
                      Sted
                    </th>
                    <th className="text-right py-3 px-2 text-text-muted font-medium">
                      Dist.
                    </th>
                    <th className="text-right py-3 px-2 text-text-muted font-medium">
                      Tid
                    </th>
                    <th className="text-right py-3 px-2 text-text-muted font-medium">
                      Snitt
                    </th>
                    <th className="text-right py-3 px-2 text-text-muted font-medium">
                      Maks
                    </th>
                    <th className="text-right py-3 px-2 text-text-muted font-medium">
                      Høyde↑
                    </th>
                    <th className="text-right py-3 px-2 text-text-muted font-medium">
                      Kcal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dogData.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-background-lighter/50 hover:bg-background-light/50"
                    >
                      <td className="py-3 px-2 text-text-primary">
                        {format(new Date(entry.date), 'd. MMM yy', { locale: nb })}
                      </td>
                      <td className="py-3 px-2 text-text-secondary">{entry.location}</td>
                      <td className="py-3 px-2 text-right text-text-primary font-medium">
                        {entry.distance_km} km
                      </td>
                      <td className="py-3 px-2 text-right text-text-secondary">
                        {Math.round(entry.duration_minutes / 60)}t{' '}
                        {entry.duration_minutes % 60}m
                      </td>
                      <td className="py-3 px-2 text-right text-text-secondary">
                        {entry.avg_speed_kmh} km/t
                      </td>
                      <td className="py-3 px-2 text-right text-text-secondary">
                        {entry.max_speed_kmh} km/t
                      </td>
                      <td className="py-3 px-2 text-right text-text-secondary">
                        {entry.elevation_gain_m}m
                      </td>
                      <td className="py-3 px-2 text-right text-text-secondary">
                        {entry.calories_burned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance trends */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Prestasjonstrender
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-muted mb-2">Lengste tur</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalStats.max_distance} km
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {
                    dogData.find((d) => d.distance_km === totalStats.max_distance)
                      ?.location
                  }{' '}
                  -{' '}
                  {dogData.find((d) => d.distance_km === totalStats.max_distance)?.date &&
                    format(
                      new Date(
                        dogData.find((d) => d.distance_km === totalStats.max_distance)!
                          .date
                      ),
                      'd. MMM yyyy',
                      { locale: nb }
                    )}
                </p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-muted mb-2">Gjennomsnittlig varighet</p>
                <p className="text-xl font-bold text-text-primary">
                  {Math.round(totalStats.avg_duration / 60)}t{' '}
                  {Math.round(totalStats.avg_duration % 60)}m
                </p>
                <p className="text-xs text-text-muted mt-1">Per jakttur</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-muted mb-2">Snitt høydemeter</p>
                <p className="text-xl font-bold text-text-primary">
                  {Math.round(totalStats.total_elevation / totalStats.total_hunts)}m
                </p>
                <p className="text-xs text-text-muted mt-1">Per tur</p>
              </div>

              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-muted mb-2">Snitt maks puls</p>
                <p className="text-xl font-bold text-text-primary">
                  {Math.round(totalStats.avg_max_hr)} bpm
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {dog.name} sin arbeidskapasitet
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
