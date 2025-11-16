import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Dog,
  Cloud,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const gameTypes = [
  { value: 'moose', label: 'Elg' },
  { value: 'deer', label: 'Hjort' },
  { value: 'roe_deer', label: 'Rådyr' },
  { value: 'wild_boar', label: 'Villsvin' },
  { value: 'fox', label: 'Rev' },
  { value: 'hare', label: 'Hare' },
  { value: 'grouse', label: 'Rype' },
  { value: 'ptarmigan', label: 'Fjellrype' },
  { value: 'capercaillie', label: 'Tiur' },
  { value: 'black_grouse', label: 'Orrfugl' },
  { value: 'duck', label: 'And' },
  { value: 'goose', label: 'Gås' },
];

const mockDogs = [
  { id: 'dog1', name: 'Rex', breed: 'Norsk Elghund' },
  { id: 'dog2', name: 'Luna', breed: 'Norsk Elghund' },
  { id: 'dog3', name: 'Bamse', breed: 'Jämthund' },
];

interface GameObservation {
  type: string;
  count: number;
  time: string;
  notes: string;
}

export default function NewHunt() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skjemastate
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationRegion, setLocationRegion] = useState('');
  const [selectedGameTypes, setSelectedGameTypes] = useState<string[]>([]);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  // Vær
  const [temperature, setTemperature] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [conditions, setConditions] = useState('');

  // Observasjoner
  const [observations, setObservations] = useState<GameObservation[]>([]);

  const handleAddObservation = () => {
    setObservations([
      ...observations,
      { type: '', count: 1, time: '', notes: '' },
    ]);
  };

  const handleRemoveObservation = (index: number) => {
    setObservations(observations.filter((_, i) => i !== index));
  };

  const handleObservationChange = (
    index: number,
    field: keyof GameObservation,
    value: string | number
  ) => {
    const updated = [...observations];
    updated[index] = { ...updated[index], [field]: value };
    setObservations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validering
      if (!title.trim()) {
        toast.error('Tittel er påkrevd');
        return;
      }
      if (!locationName.trim()) {
        toast.error('Sted er påkrevd');
        return;
      }

      // Her ville vi sendt data til Firebase
      const huntData = {
        title,
        date,
        start_time: startTime,
        end_time: endTime,
        location: {
          name: locationName,
          region: locationRegion,
          country: 'Norge',
          coordinates: [60.0, 10.7], // Standard koordinater
        },
        weather:
          temperature || windSpeed
            ? {
                temperature: Number(temperature),
                humidity: 0,
                wind_speed: Number(windSpeed),
                wind_direction: windDirection,
                precipitation: 'none',
                conditions,
              }
            : null,
        game_type: selectedGameTypes,
        game_seen: observations,
        game_harvested: [],
        dogs: selectedDogs,
        notes,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_favorite: false,
      };

      console.log('Oppretter jakttur:', huntData);

      // Simuler API-kall
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Jakttur opprettet!');
      navigate('/');
    } catch (error) {
      console.error('Feil ved opprettelse:', error);
      toast.error('Kunne ikke opprette jakttur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost btn-icon"
          aria-label="Tilbake"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Ny jakttur</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grunnleggende informasjon */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Grunnleggende informasjon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">Tittel *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Morgenjakt i Nordmarka"
                className="input"
                required
              />
            </div>

            <div>
              <label className="input-label">Dato *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Starttid *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Sluttid</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Sted *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="F.eks. Nordmarka"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Region</label>
              <input
                type="text"
                value={locationRegion}
                onChange={(e) => setLocationRegion(e.target.value)}
                placeholder="F.eks. Viken"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Vilttyper */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Vilttyper
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gameTypes.map((type) => (
              <label
                key={type.value}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedGameTypes.includes(type.value)
                    ? 'bg-primary-700/20 border-primary-500'
                    : 'border-background-lighter hover:border-primary-700/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGameTypes.includes(type.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGameTypes([...selectedGameTypes, type.value]);
                    } else {
                      setSelectedGameTypes(
                        selectedGameTypes.filter((t) => t !== type.value)
                      );
                    }
                  }}
                  className="checkbox"
                />
                <span className="text-text-primary">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hunder */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            <Dog className="inline w-5 h-5 mr-2" />
            Hunder
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {mockDogs.map((dog) => (
              <label
                key={dog.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDogs.includes(dog.id)
                    ? 'bg-primary-700/20 border-primary-500'
                    : 'border-background-lighter hover:border-primary-700/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDogs.includes(dog.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDogs([...selectedDogs, dog.id]);
                    } else {
                      setSelectedDogs(selectedDogs.filter((d) => d !== dog.id));
                    }
                  }}
                  className="checkbox"
                />
                <div>
                  <p className="text-text-primary font-medium">{dog.name}</p>
                  <p className="text-sm text-text-muted">{dog.breed}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Værforhold */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            <Cloud className="inline w-5 h-5 mr-2" />
            Værforhold
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Temperatur (°C)</label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="8"
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Vindstyrke (m/s)</label>
              <input
                type="number"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                placeholder="3"
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Vindretning</label>
              <select
                value={windDirection}
                onChange={(e) => setWindDirection(e.target.value)}
                className="select"
              >
                <option value="">Velg</option>
                <option value="N">Nord</option>
                <option value="NØ">Nordøst</option>
                <option value="Ø">Øst</option>
                <option value="SØ">Sørøst</option>
                <option value="S">Sør</option>
                <option value="SV">Sørvest</option>
                <option value="V">Vest</option>
                <option value="NV">Nordvest</option>
              </select>
            </div>
            <div>
              <label className="input-label">Forhold</label>
              <select
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="select"
              >
                <option value="">Velg</option>
                <option value="clear">Klart</option>
                <option value="cloudy">Lettskyet</option>
                <option value="overcast">Overskyet</option>
                <option value="rain">Regn</option>
                <option value="snow">Snø</option>
                <option value="fog">Tåke</option>
              </select>
            </div>
          </div>
        </div>

        {/* Observasjoner */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Observasjoner
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddObservation}
            >
              Legg til
            </Button>
          </div>

          {observations.length === 0 ? (
            <p className="text-text-muted text-center py-4">
              Ingen observasjoner lagt til
            </p>
          ) : (
            <div className="space-y-4">
              {observations.map((obs, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 bg-background rounded-lg"
                >
                  <div className="sm:col-span-3">
                    <label className="input-label">Vilttype</label>
                    <select
                      value={obs.type}
                      onChange={(e) =>
                        handleObservationChange(index, 'type', e.target.value)
                      }
                      className="select"
                    >
                      <option value="">Velg</option>
                      {gameTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Antall</label>
                    <input
                      type="number"
                      min="1"
                      value={obs.count}
                      onChange={(e) =>
                        handleObservationChange(index, 'count', Number(e.target.value))
                      }
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Tidspunkt</label>
                    <input
                      type="time"
                      value={obs.time}
                      onChange={(e) =>
                        handleObservationChange(index, 'time', e.target.value)
                      }
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="input-label">Notater</label>
                    <input
                      type="text"
                      value={obs.notes}
                      onChange={(e) =>
                        handleObservationChange(index, 'notes', e.target.value)
                      }
                      placeholder="Evt. notater"
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveObservation(index)}
                      className="btn-ghost btn-icon text-error"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notater og tagger */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Notater og tagger
          </h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Notater</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Beskriv jaktturen..."
                className="input resize-none"
              />
            </div>
            <div>
              <label className="input-label">Tagger (kommaseparert)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="morgenjakt, storvilt, nordmarka"
                className="input"
              />
              <p className="input-helper">
                Legg til tagger for enklere søking og filtrering
              </p>
            </div>
          </div>
        </div>

        {/* GPX-import */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            <Upload className="inline w-5 h-5 mr-2" />
            Importer spor
          </h2>
          <div className="border-2 border-dashed border-background-lighter rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-primary mb-2">
              Dra og slipp GPX-filer her
            </p>
            <p className="text-text-muted text-sm mb-4">
              eller klikk for å velge filer
            </p>
            <Button type="button" variant="outline" size="sm">
              Velg filer
            </Button>
          </div>
        </div>

        {/* Handlinger */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Avbryt
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Opprett jakttur
          </Button>
        </div>
      </form>
    </div>
  );
}
