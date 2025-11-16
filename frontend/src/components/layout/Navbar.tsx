import { Link } from 'react-router-dom';
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

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate Garmin sync
    setTimeout(() => setIsSyncing(false), 3000);
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
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
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
              <span>Search hunts, dogs, locations...</span>
              <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-background-lighter rounded text-xs font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden btn-ghost btn-icon"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={handleSync}
              className={`btn-ghost btn-icon ${isSyncing ? 'animate-spin' : ''}`}
              aria-label="Sync with Garmin"
              title="Sync with Garmin"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <Link
              to="/hunt/new"
              className="btn-primary btn-sm hidden sm:inline-flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Hunt
            </Link>

            <Link
              to="/hunt/new"
              className="sm:hidden btn-primary btn-icon"
              aria-label="New hunt"
            >
              <Plus className="w-5 h-5" />
            </Link>

            <button
              className="btn-ghost btn-icon relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            <Link
              to="/settings"
              className="btn-ghost btn-icon"
              aria-label="User settings"
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
