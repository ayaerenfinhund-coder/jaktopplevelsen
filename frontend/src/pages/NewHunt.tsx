import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Dog,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from 'lucide-react';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const gameTypes = [
  { value: 'moose', label: 'Elg' },
  { value: 'deer', label: 'Hjort' },
  { value: 'roe_deer', label: 'Rådyr' },
  { value: 'hare', label: 'Hare' },
  { value: 'grouse', label: 'Rype' },
  { value: 'fox', label: 'Rev' },
];

const mockDogs = [{ id: 'rolex', name: 'Rolex', breed: 'Dachs' }];

interface GameObservation {
  type: string;
  count: number;
  time: string;
}

export default function NewHunt() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hovedfelt - enkelt og raskt
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationName, setLocationName] = useState('Semsvannet');
  const [selectedDogs, setSelectedDogs] = useState<string[]>(['rolex']);
  const [notes, setNotes] = useState('');

  // Valgfrie detaljer (skjult som standard)
  const [showDetails, setShowDetails] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [observations, setObservations] = useState<GameObservation[]>([]);
  const [tags, setTags] = useState('');

  const handleAddObservation = () => {
    setObservations([...observations, { type: '', count: 1, time: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Automatisk tittel hvis ikke satt
      const _finalTitle =
        title.trim() ||
        `Jakttur ${locationName} - ${new Date(date).toLocaleDateString('nb-NO')}`;

      // Simuler lagring
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success('Jakttur lagret!');
      navigate('/');
    } catch (error) {
      toast.error('Kunne ikke lagre jakttur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost btn-icon"
          aria-label="Tilbake"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Logg jakttur</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kjerne-info - alltid synlig */}
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dato */}
            <div>
              <label className="input-label flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                Dato
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Sted */}
            <div>
              <label className="input-label flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                Sted
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="F.eks. Semsvannet"
                className="input"
                required
              />
            </div>

            {/* Hund */}
            <div>
              <label className="input-label flex items-center gap-2">
                <Dog className="w-4 h-4 text-primary-400" />
                Hund
              </label>
              <select
                value={selectedDogs[0] || ''}
                onChange={(e) => setSelectedDogs([e.target.value])}
                className="select"
              >
                {mockDogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NOTATER - hovedfokus, som en notatblokk */}
        <div className="card p-6">
          <label className="input-label text-lg mb-3">Notater</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beskriv jaktturen...&#10;&#10;Hvordan jobbet hunden?&#10;Hva observerte du?&#10;Hvordan var forholdene?"
            className="input min-h-[300px] w-full font-normal text-base leading-relaxed resize-y"
            autoFocus
          />
          <p className="text-xs text-text-muted mt-2">
            Skriv fritt - du kan alltid legge til mer informasjon senere
          </p>
        </div>

        {/* Valgfrie detaljer - kan utvides */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-background-lighter transition-colors"
          >
            <span className="font-medium text-text-primary">
              Flere detaljer (valgfritt)
            </span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </button>

          {showDetails && (
            <div className="p-6 pt-0 space-y-6 border-t border-background-lighter">
              {/* Tittel og tid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="input-label">Tittel (genereres automatisk)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="F.eks. Morgenjakt ved Semsvannet"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Starttid</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input"
                  />
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

              {/* Observasjoner */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="input-label mb-0">Vilt observert</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={handleAddObservation}
                  >
                    Legg til
                  </Button>
                </div>
                {observations.length === 0 ? (
                  <p className="text-text-muted text-sm">
                    Ingen observasjoner lagt til
                  </p>
                ) : (
                  <div className="space-y-3">
                    {observations.map((obs, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-background p-3 rounded-lg"
                      >
                        <select
                          value={obs.type}
                          onChange={(e) => {
                            const updated = [...observations];
                            updated[index].type = e.target.value;
                            setObservations(updated);
                          }}
                          className="select flex-1"
                        >
                          <option value="">Velg vilt</option>
                          {gameTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={obs.count}
                          onChange={(e) => {
                            const updated = [...observations];
                            updated[index].count = parseInt(e.target.value) || 1;
                            setObservations(updated);
                          }}
                          min="1"
                          className="input w-20"
                        />
                        <input
                          type="time"
                          value={obs.time}
                          onChange={(e) => {
                            const updated = [...observations];
                            updated[index].time = e.target.value;
                            setObservations(updated);
                          }}
                          className="input w-32"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setObservations(observations.filter((_, i) => i !== index))
                          }
                          className="btn-ghost btn-icon-sm text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tagger */}
              <div>
                <label className="input-label">Tagger</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="morgenjakt, rådyr, fint vær"
                  className="input"
                />
                <p className="input-helper">Separér med komma</p>
              </div>
            </div>
          )}
        </div>

        {/* Handlingsknapper */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Avbryt
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Lagre jakttur
          </Button>
        </div>
      </form>
    </div>
  );
}
