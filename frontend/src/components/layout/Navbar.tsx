import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import SearchModal from '../common/SearchModal';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate Garmin sync
    setTimeout(() => setIsSyncing(false), 3000);
  };

  const handleNewHunt = () => {
    if (location.pathname === '/') {
      // Allerede på hovedsiden - scroll til toppen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Naviger til hovedsiden
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background-light border-b border-background-lighter z-40">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden btn-ghost btn-icon"
              aria-label="Åpne meny"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Jaktopplevelsen"
                className="w-12 h-12 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback til SVG hvis logo.png ikke finnes
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-10 h-10 bg-primary-700 rounded-lg items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="hidden sm:block text-xl font-bold text-text-primary">
                Jaktopplevelsen
              </span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-background border border-background-lighter rounded-lg text-text-muted hover:border-primary-700/50 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Søk etter jaktturer, hunder, steder...</span>
              <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-background-lighter rounded text-xs font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right section - CLEAN for mobile */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Desktop only: Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex btn-ghost btn-icon"
              aria-label="Søk"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop only: Sync button */}
            <button
              onClick={handleSync}
              className={`hidden sm:flex btn-ghost btn-icon ${isSyncing ? 'animate-spin' : ''}`}
              aria-label="Synkroniser med Garmin"
              title="Synkroniser med Garmin"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Desktop only: Ny jakttur button */}
            <button
              onClick={handleNewHunt}
              className="btn-primary btn-sm hidden lg:inline-flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ny jakttur
            </button>

            {/* Desktop only: Notifications */}
            <button
              className="hidden sm:flex btn-ghost btn-icon relative"
              aria-label="Varsler"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            {/* Always visible: Profile/Settings */}
            <Link
              to="/settings"
              className="btn-ghost btn-icon"
              aria-label="Brukerinnstillinger"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
