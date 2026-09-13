/**
 * Bappa Darshan - React Native TypeScript App Shell
 * Compliant with 00_CORE_MANIFESTO, 01_DOMAIN_RULES, and 02_DATA_SCHEMA
 */

import React from 'react';
import { NavigationProvider, useNavigation } from './navigation/NavigationContext';
import { TabBar } from './components/common/TabBar';
import { MapScreen } from './screens/MapScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { MyVisitsScreen } from './screens/MyVisitsScreen';
import { RoutesScreen } from './screens/RoutesScreen';
import { ProfileScreen } from './screens/ProfileScreen';

function AppNavigator() {
  const { currentScreen } = useNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Map':
        return <MapScreen />;
      case 'Explore':
        return <ExploreScreen />;
      case 'MyVisits':
        return <MyVisitsScreen />;
      case 'Routes':
        return <RoutesScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <MapScreen />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 overflow-hidden relative select-none">
      {/* Dynamic Screen Container */}
      <main className="flex-1 w-full overflow-hidden relative flex flex-col">
        {renderScreen()}
      </main>

      {/* Accessible Bottom Tab Navigation */}
      <TabBar />
    </div>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <div className="min-h-screen w-full bg-neutral-950 sm:bg-neutral-900 flex items-center justify-center sm:p-4 md:p-6 antialiased font-sans text-neutral-100">
        {/* Mobile Device Frame for high-fidelity mobile-first experience */}
        <div className="w-full sm:max-w-[430px] h-screen sm:h-[880px] sm:max-h-[92vh] bg-neutral-950 sm:rounded-[42px] sm:border-[8px] sm:border-neutral-800/90 shadow-2xl sm:shadow-amber-950/20 overflow-hidden flex flex-col relative ring-1 ring-neutral-700/50">
          {/* Hardware Notch / Island representation on desktop preview */}
          <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-neutral-800 rounded-b-xl z-50 items-center justify-center">
            <div className="w-10 h-2.5 bg-neutral-900 rounded-full flex items-center justify-end px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
            </div>
          </div>

          <AppNavigator />
        </div>
      </div>
    </NavigationProvider>
  );
}
