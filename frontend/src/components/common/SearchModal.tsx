import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Dog, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'hunt' | 'dog' | 'location';
  title: string;
  subtitle: string;
  icon: typeof Search;
}

// Mock search results
const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'hunt',
    title: 'Morgenjakt ved Semsvannet',
    subtitle: '10. november 2024 • 1 hund',
    icon: Calendar,
  },
  {
    id: '2',
    type: 'dog',
    title: 'Rolex',
    subtitle: 'Dachs • Aktiv',
    icon: Dog,
  },
  {
    id: '3',
    type: 'location',
    title: 'Semsvannet',
    subtitle: '24 jaktturer • 156 km totalt',
    icon: MapPin,
  },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          // This would need to be lifted up to parent
        } else {
          onClose();
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      // Filter mock results based on query
      const filtered = mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(value.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    switch (result.type) {
      case 'hunt':
        navigate(`/hunt/${result.id}`);
        break;
      case 'dog':
        navigate('/dogs');
        break;
      case 'location':
        navigate('/');
        break;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background-light rounded-xl border border-background-lighter shadow-2xl overflow-hidden animate-slide-down">
          {/* Search input */}
          <div className="flex items-center gap-4 p-4 border-b border-background-lighter">
            <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Søk etter jaktturer, hunder, steder..."
              className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-lg"
            />
            <button
              onClick={onClose}
              className="btn-ghost btn-icon-sm"
              aria-label="Lukk søk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Begynn å skrive for å søke...</p>
                <p className="text-sm mt-2">
                  Søk etter jaktturer, hunder eller steder
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <p>Ingen resultater funnet for "{query}"</p>
              </div>
            ) : (
              <ul className="p-2">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={clsx(
                        'w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-left',
                        index === selectedIndex
                          ? 'bg-primary-700/20 text-primary-300'
                          : 'hover:bg-background-lighter'
                      )}
                    >
                      <div className="w-10 h-10 bg-background-lighter rounded-lg flex items-center justify-center flex-shrink-0">
                        <result.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-primary truncate">
                          {result.title}
                        </div>
                        <div className="text-sm text-text-muted truncate">
                          {result.subtitle}
                        </div>
                      </div>
                      <span className="badge-secondary text-xs">
                        {result.type === 'hunt' ? 'jakttur' : result.type === 'dog' ? 'hund' : 'sted'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-background-lighter bg-background text-xs text-text-muted flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background-lighter rounded">↑↓</kbd>
              naviger
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background-lighter rounded">↵</kbd>
              velg
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background-lighter rounded">esc</kbd>
              lukk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
