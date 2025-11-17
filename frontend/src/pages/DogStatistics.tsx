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
  Zap,
  Lightbulb,
  ThermometerSun,
  Award,
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

  // Smart insights calculations
  const insights = {
    // Best location by efficiency (distance per hour)
    bestLocation: Object.entries(locationStats)
      .map(([loc, stats]) => ({
        location: loc,
        efficiency: stats.distance / (stats.duration / 60),
        count: stats.count,
      }))
      .sort((a, b) => b.efficiency - a.efficiency)[0],

    // Optimal temperature range
    optimalTemp: (() => {
      const tempRanges = dogData.map((d) => ({
        avgTemp: (d.temperature_start + d.temperature_end) / 2,
        distance: d.distance_km,
      }));
      const avgOptimalTemp =
        tempRanges.reduce((acc, t) => acc + t.avgTemp, 0) / tempRanges.length;
      return Math.round(avgOptimalTemp);
    })(),

    // Best performance trend
    performanceTrend: (() => {
      if (dogData.length < 3) return 'stable';
      const recent = dogData.slice(0, 3);
      const older = dogData.slice(3, 6);
      if (older.length === 0) return 'stable';

      const recentAvg = recent.reduce((acc, d) => acc + d.distance_km, 0) / recent.length;
      const olderAvg = older.reduce((acc, d) => acc + d.distance_km, 0) / older.length;

      if (recentAvg > olderAvg * 1.1) return 'improving';
      if (recentAvg < olderAvg * 0.9) return 'declining';
      return 'stable';
    })(),

    // Most productive time (morning hunts have lower start temp)
    bestTimeOfDay: (() => {
      const morningHunts = dogData.filter((d) => d.temperature_start < 8);
      const afternoonHunts = dogData.filter((d) => d.temperature_start >= 8);

      const morningAvgDist =
        morningHunts.length > 0
          ? morningHunts.reduce((acc, d) => acc + d.distance_km, 0) / morningHunts.length
          : 0;
      const afternoonAvgDist =
        afternoonHunts.length > 0
          ? afternoonHunts.reduce((acc, d) => acc + d.distance_km, 0) / afternoonHunts.length
          : 0;

      return morningAvgDist > afternoonAvgDist ? 'morgen' : 'ettermiddag';
    })(),

    // Endurance rating
    enduranceRating: (() => {
      const avgDuration = totalStats.avg_duration;
      if (avgDuration > 240) return 'Utmerket';
      if (avgDuration > 180) return 'Veldig god';
      if (avgDuration > 120) return 'God';
      return 'Moderat';
    })(),

    // Recovery recommendation
    daysSinceLastHunt: (() => {
      if (dogData.length === 0) return 0;
      const lastHunt = new Date(dogData[0].date);
      const today = new Date();
      return Math.floor((today.getTime() - lastHunt.getTime()) / (1000 * 60 * 60 * 24));
    })(),
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header - mobilvennlig */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 -ml-3 hover:bg-background-lighter rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Detaljert Statistikk</h1>
      </div>

      {/* Dog selector */}
      <div className="bg-background-light rounded-xl p-4">
        <label className="text-sm text-text-muted mb-2 block">Velg hund</label>
        <select
          value={selectedDog}
          onChange={(e) => setSelectedDog(e.target.value)}
          className="select text-base"
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
          <div className="bg-background-light rounded-xl p-4">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dog.color }}
              >
                <Dog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">{dog.name}</h2>
                <p className="text-sm text-text-muted">
                  Total historikk fra Garmin Alpha
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_hunts}
                </p>
                <p className="text-sm text-text-muted">Jaktturer</p>
              </div>

              <div className="bg-background rounded-xl p-4 text-center">
                <Route className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_distance.toFixed(1)} km
                </p>
                <p className="text-sm text-text-muted">Total distanse</p>
              </div>

              <div className="bg-background rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-secondary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {Math.floor(totalStats.total_duration / 60)}t
                </p>
                <p className="text-sm text-text-muted">Tid i felt</p>
              </div>

              <div className="bg-background rounded-xl p-4 text-center">
                <Mountain className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.total_elevation.toLocaleString()}m
                </p>
                <p className="text-sm text-text-muted">Høydemeter</p>
              </div>

              <div className="bg-background rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.max_speed.toFixed(1)} km/t
                </p>
                <p className="text-sm text-text-muted">Maks hastighet</p>
              </div>

              <div className="bg-background rounded-xl p-4 text-center">
                <Route className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {totalStats.avg_distance.toFixed(1)} km
                </p>
                <p className="text-sm text-text-muted">Snitt per tur</p>
              </div>
            </div>
          </div>

          {/* Smart Insights */}
          <div className="bg-gradient-to-br from-primary-700/20 to-accent-500/10 rounded-xl p-4 border border-primary-700/30">
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-400" />
              Smarte innsikter
            </h3>
            <div className="space-y-4">
              {/* Best location */}
              {insights.bestLocation && (
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Beste jaktområde</p>
                      <p className="text-xs text-text-muted mt-1">
                        <span className="font-semibold text-primary-400">{insights.bestLocation.location}</span> gir best resultat med{' '}
                        {insights.bestLocation.efficiency.toFixed(1)} km/time effektivitet over{' '}
                        {insights.bestLocation.count} turer
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimal conditions */}
              <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <ThermometerSun className="w-5 h-5 text-accent-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Optimale forhold</p>
                    <p className="text-xs text-text-muted mt-1">
                      {dog.name} presterer best om <span className="font-semibold text-accent-400">{insights.bestTimeOfDay}en</span> ved ca.{' '}
                      <span className="font-semibold text-accent-400">{insights.optimalTemp}°C</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance trend */}
              <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Ytelsesutvikling</p>
                    <p className="text-xs text-text-muted mt-1">
                      {insights.performanceTrend === 'improving' && (
                        <>Ytelsen er <span className="font-semibold text-success">stigende</span> - {dog.name} går lengre distanser nå enn tidligere!</>
                      )}
                      {insights.performanceTrend === 'declining' && (
                        <>Ytelsen er <span className="font-semibold text-warning">synkende</span> - vurder lengre hvileperioder</>
                      )}
                      {insights.performanceTrend === 'stable' && (
                        <>Ytelsen er <span className="font-semibold text-primary-400">stabil</span> - jevn prestasjon over tid</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Endurance & Recovery */}
              <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Utholdenhet & Restitusjon</p>
                    <p className="text-xs text-text-muted mt-1">
                      Utholdenhetsrating: <span className="font-semibold text-secondary-400">{insights.enduranceRating}</span>.{' '}
                      {insights.daysSinceLastHunt > 7 ? (
                        <>Siste jakt var for {insights.daysSinceLastHunt} dager siden - {dog.name} er klar for felt!</>
                      ) : insights.daysSinceLastHunt > 2 ? (
                        <>God restitusjon med {insights.daysSinceLastHunt} dagers hvile</>
                      ) : (
                        <>Vurder {3 - insights.daysSinceLastHunt} dager til hvile for optimal ytelse</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mt-4 p-3 bg-primary-700/20 rounded-lg border border-primary-700/30">
                <p className="text-xs text-text-primary">
                  <span className="font-semibold">Anbefaling:</span>{' '}
                  {insights.bestLocation && (
                    <>
                      Planlegg neste jakttur til <span className="text-primary-400 font-medium">{insights.bestLocation.location}</span> om{' '}
                      <span className="text-accent-400 font-medium">{insights.bestTimeOfDay}en</span> når temperaturen er rundt{' '}
                      <span className="text-accent-400 font-medium">{insights.optimalTemp}°C</span> for best mulig resultat.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Location breakdown */}
          <div className="bg-background-light rounded-xl p-4">
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Statistikk per sted
            </h3>
            <div className="space-y-3">
              {Object.entries(locationStats)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([location, stats]) => (
                  <div
                    key={location}
                    className="bg-background rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-base font-medium text-text-primary">{location}</p>
                      <p className="text-sm text-text-muted">{stats.count} turer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-text-primary">{stats.distance.toFixed(1)} km</p>
                      <p className="text-sm text-text-muted">
                        {Math.floor(stats.duration / 60)}t {stats.duration % 60}m total
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Detailed history - mobilvennlig cards istedenfor tabell */}
          <div className="bg-background-light rounded-xl p-4">
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Komplett jakthistorikk
            </h3>
            <div className="space-y-3">
              {dogData.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => navigate('/hunt/1')} // In production: /hunt/{entry.hunt_id}
                  className="w-full text-left bg-background rounded-xl p-4 hover:bg-background-lighter transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-base font-semibold text-text-primary group-hover:text-primary-400 transition-colors">
                        {entry.location}
                      </p>
                      <p className="text-sm text-text-muted">
                        {format(new Date(entry.date), 'd. MMMM yyyy', { locale: nb })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-primary-400">
                        {entry.distance_km} km
                      </p>
                      <p className="text-sm text-text-muted">
                        {Math.floor(entry.duration_minutes / 60)}t {entry.duration_minutes % 60}m
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">Snitt</p>
                      <p className="font-medium text-text-primary">{entry.avg_speed_kmh} km/t</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Maks</p>
                      <p className="font-medium text-text-primary">{entry.max_speed_kmh} km/t</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Høyde↑</p>
                      <p className="font-medium text-text-primary">{entry.elevation_gain_m}m</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Performance trends */}
          <div className="bg-background-light rounded-xl p-4">
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Prestasjonstrender
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-text-muted mb-2">Lengste tur</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalStats.max_distance} km
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {
                    dogData.find((d) => d.distance_km === totalStats.max_distance)
                      ?.location
                  }
                </p>
              </div>

              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-text-muted mb-2">Snitt varighet</p>
                <p className="text-xl font-bold text-text-primary">
                  {Math.floor(totalStats.avg_duration / 60)}t{' '}
                  {Math.round(totalStats.avg_duration % 60)}m
                </p>
                <p className="text-xs text-text-muted mt-1">Per jakttur</p>
              </div>

              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-text-muted mb-2">Snitt høydemeter</p>
                <p className="text-xl font-bold text-text-primary">
                  {Math.round(totalStats.total_elevation / totalStats.total_hunts)}m
                </p>
                <p className="text-xs text-text-muted mt-1">Per tur</p>
              </div>

              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-text-muted mb-2">Snitt maks puls</p>
                <p className="text-xl font-bold text-text-primary">
                  {Math.round(totalStats.avg_max_hr)} bpm
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {dog.name}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
