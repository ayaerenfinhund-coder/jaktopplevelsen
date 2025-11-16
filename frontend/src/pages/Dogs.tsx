import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit3,
  Trash2,
  Dog as DogIcon,
  Calendar,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

interface Dog {
  id: string;
  name: string;
  breed: string;
  birth_date?: string;
  color: string;
  garmin_collar_id?: string;
  photo_url?: string;
  notes?: string;
  is_active: boolean;
  stats: {
    total_hunts: number;
    total_distance: number;
    last_hunt?: string;
  };
}

const mockDogs: Dog[] = [
  {
    id: 'rolex',
    name: 'Rolex',
    breed: 'Dachs',
    birth_date: '2020-08-12',
    color: '#D4752E',
    garmin_collar_id: 'TT15-98765',
    notes: 'Ivrig og pålitelig jakthund med god nese',
    is_active: true,
    stats: {
      total_hunts: 24,
      total_distance: 156.3,
      last_hunt: '2024-11-10',
    },
  },
];

const defaultColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8B739',
  '#58D68D',
  '#EC7063',
];

export default function Dogs() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>(mockDogs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Dog | null>(null);

  // Skjemastate
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [color, setColor] = useState(defaultColors[0]);
  const [garminCollarId, setGarminCollarId] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setName('');
    setBreed('');
    setBirthDate('');
    setColor(defaultColors[dogs.length % defaultColors.length]);
    setGarminCollarId('');
    setNotes('');
  };

  const openEditModal = (dog: Dog) => {
    setEditingDog(dog);
    setName(dog.name);
    setBreed(dog.breed);
    setBirthDate(dog.birth_date || '');
    setColor(dog.color);
    setGarminCollarId(dog.garmin_collar_id || '');
    setNotes(dog.notes || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !breed.trim()) {
      toast.error('Navn og rase er påkrevd');
      return;
    }

    if (editingDog) {
      // Oppdater eksisterende hund
      setDogs(
        dogs.map((d) =>
          d.id === editingDog.id
            ? {
                ...d,
                name,
                breed,
                birth_date: birthDate || undefined,
                color,
                garmin_collar_id: garminCollarId || undefined,
                notes: notes || undefined,
              }
            : d
        )
      );
      toast.success('Hund oppdatert!');
    } else {
      // Legg til ny hund
      const newDog: Dog = {
        id: `dog${Date.now()}`,
        name,
        breed,
        birth_date: birthDate || undefined,
        color,
        garmin_collar_id: garminCollarId || undefined,
        notes: notes || undefined,
        is_active: true,
        stats: {
          total_hunts: 0,
          total_distance: 0,
        },
      };
      setDogs([...dogs, newDog]);
      toast.success('Hund lagt til!');
    }

    setShowAddModal(false);
    setEditingDog(null);
    resetForm();
  };

  const handleDelete = (dog: Dog) => {
    setDogs(dogs.filter((d) => d.id !== dog.id));
    setShowDeleteModal(null);
    toast.success('Hund slettet');
  };

  const toggleActive = (dog: Dog) => {
    setDogs(
      dogs.map((d) =>
        d.id === dog.id ? { ...d, is_active: !d.is_active } : d
      )
    );
    toast.success(
      dog.is_active ? 'Hund markert som inaktiv' : 'Hund markert som aktiv'
    );
  };

  const activeDogs = dogs.filter((d) => d.is_active);
  const inactiveDogs = dogs.filter((d) => !d.is_active);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Mine hunder</h1>
          <p className="text-text-secondary mt-1">
            Administrer hundene dine og deres Garmin-halsbånd
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => {
            resetForm();
            setEditingDog(null);
            setShowAddModal(true);
          }}
        >
          Legg til hund
        </Button>
      </div>

      {/* Aktive hunder */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Aktive hunder ({activeDogs.length})
        </h2>
        {activeDogs.length === 0 ? (
          <div className="card p-12 text-center">
            <DogIcon className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-muted">Ingen aktive hunder</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                onEdit={() => {
                  openEditModal(dog);
                  setShowAddModal(true);
                }}
                onDelete={() => setShowDeleteModal(dog)}
                onToggleActive={() => toggleActive(dog)}
                onViewStats={() => navigate('/statistics')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inaktive hunder */}
      {inactiveDogs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Inaktive hunder ({inactiveDogs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveDogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                onEdit={() => {
                  openEditModal(dog);
                  setShowAddModal(true);
                }}
                onDelete={() => setShowDeleteModal(dog)}
                onToggleActive={() => toggleActive(dog)}
                onViewStats={() => navigate('/statistics')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Legg til/rediger modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingDog(null);
          resetForm();
        }}
        title={editingDog ? 'Rediger hund' : 'Legg til hund'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Navn *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="F.eks. Rex"
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Rase *</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="F.eks. Norsk Elghund Grå"
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Fødselsdato</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Garmin halsbånd-ID</label>
              <input
                type="text"
                value={garminCollarId}
                onChange={(e) => setGarminCollarId(e.target.value)}
                placeholder="F.eks. DC50-12345"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Sporfarge</label>
            <div className="flex flex-wrap gap-2">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Notater</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Evt. notater om hunden"
              className="input resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setEditingDog(null);
                resetForm();
              }}
            >
              Avbryt
            </Button>
            <Button type="submit" variant="primary">
              {editingDog ? 'Lagre endringer' : 'Legg til hund'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Slett-modal */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="Slett hund"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Er du sikker på at du vil slette {showDeleteModal?.name}? Dette vil
            ikke påvirke eksisterende jaktturer, men hunden vil ikke lenger
            være tilgjengelig for nye turer.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(null)}>
              Avbryt
            </Button>
            <Button
              variant="danger"
              onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
            >
              Slett
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DogCard({
  dog,
  onEdit,
  onDelete,
  onToggleActive,
  onViewStats,
}: {
  dog: Dog;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onViewStats: () => void;
}) {
  return (
    <div
      className={`card ${dog.is_active ? '' : 'opacity-60'}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={onViewStats}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: dog.color }}
            >
              {dog.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-lg">
                {dog.name}
              </h3>
              <p className="text-sm text-text-muted">{dog.breed}</p>
            </div>
          </button>
          <div className="flex gap-1">
            <button onClick={onEdit} className="btn-ghost btn-icon-sm">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="btn-ghost btn-icon-sm text-error">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {dog.birth_date && (
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Calendar className="w-4 h-4" />
            <span>
              Født {format(new Date(dog.birth_date), 'd. MMMM yyyy', { locale: nb })}
            </span>
          </div>
        )}

        {dog.garmin_collar_id && (
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <MapPin className="w-4 h-4" />
            <span>Halsbånd: {dog.garmin_collar_id}</span>
          </div>
        )}

        {dog.notes && (
          <p className="text-sm text-text-secondary mt-3 italic">
            "{dog.notes}"
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-background-lighter">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {dog.stats.total_hunts}
              </p>
              <p className="text-xs text-text-muted">Jaktturer</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {dog.stats.total_distance.toFixed(1)}
              </p>
              <p className="text-xs text-text-muted">Km totalt</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {dog.stats.last_hunt
                  ? format(new Date(dog.stats.last_hunt), 'dd.MM', { locale: nb })
                  : '-'}
              </p>
              <p className="text-xs text-text-muted">Siste tur</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={onViewStats}
          >
            Se detaljert statistikk
          </Button>
          <Button
            variant={dog.is_active ? 'ghost' : 'outline'}
            size="sm"
            fullWidth
            onClick={onToggleActive}
          >
            {dog.is_active ? 'Marker som inaktiv' : 'Marker som aktiv'}
          </Button>
        </div>
      </div>
    </div>
  );
}
