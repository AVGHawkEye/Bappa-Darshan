import React from 'react';
import { Map, Compass, BookOpenCheck, Route as RouteIcon, UserCircle2 } from 'lucide-react';
import { useNavigation } from '../../navigation/NavigationContext';
import { ScreenName } from '../../types';

interface TabItem {
  name: ScreenName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabItem[] = [
  { name: 'Map', label: 'Map', icon: Map },
  { name: 'Explore', label: 'Explore', icon: Compass },
  { name: 'MyVisits', label: 'My Visits', icon: BookOpenCheck },
  { name: 'Routes', label: 'Routes', icon: RouteIcon },
  { name: 'Profile', label: 'Profile', icon: UserCircle2 },
];

export const TabBar: React.FC = () => {
  const { currentScreen, navigate } = useNavigation();

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="sticky bottom-0 z-30 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/80 px-2 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = currentScreen === tab.name;
          const Icon = tab.icon;

          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => navigate(tab.name)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 select-none relative ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-amber-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
