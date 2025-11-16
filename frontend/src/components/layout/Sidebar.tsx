import { NavLink } from 'react-router-dom';
import {
  Home,
  Dog,
  Calendar,
  BarChart3,
  Download,
  X,
  Camera,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Oversikt', href: '/', icon: Home },
  { name: 'Hunder', href: '/dogs', icon: Dog },
  { name: 'Statistikk', href: '/statistics', icon: BarChart3 },
];

const quickFilters = [
  { name: 'Denne sesongen', icon: Calendar, count: 8 },
  { name: 'Med bilder', icon: Camera, count: 12 },
];

const stats = [
  { name: 'Totalt jaktturer', value: '24' },
  { name: 'Total distanse', value: '156 km' },
  { name: 'Aktive hunder', value: '1' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 w-64 bg-background-light border-r border-background-lighter z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:top-16 lg:z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-background-lighter">
          <span className="text-lg font-semibold">Meny</span>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon-sm"
            aria-label="Lukk meny"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full overflow-y-auto scrollbar-hide pb-20">
          {/* Main navigation */}
          <nav className="p-4">
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Navigasjon
            </h3>
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target',
                        isActive
                          ? 'bg-primary-700/20 text-primary-400'
                          : 'text-text-secondary hover:bg-background-lighter hover:text-text-primary'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick filters */}
          <div className="p-4 border-t border-background-lighter">
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Hurtigfiltre
            </h3>
            <ul className="space-y-1">
              {quickFilters.map((filter) => (
                <li key={filter.name}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-background-lighter hover:text-text-primary transition-colors touch-target">
                    <filter.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium flex-1 text-left">
                      {filter.name}
                    </span>
                    <span className="badge-primary">{filter.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Statistics */}
          <div className="p-4 border-t border-background-lighter">
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Statistikk
            </h3>
            <div className="space-y-3">
              {stats.map((stat) => (
                <div key={stat.name} className="px-3">
                  <div className="text-sm text-text-muted">{stat.name}</div>
                  <div className="text-lg font-semibold text-text-primary">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export button */}
          <div className="p-4 border-t border-background-lighter">
            <button className="w-full btn-outline btn-sm">
              <Download className="w-4 h-4 mr-2" />
              Eksporter data
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
