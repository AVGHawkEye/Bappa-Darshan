import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { MOCK_DARSHAN_ROUTES } from '../data/mockKandivaliCharkopPandals';
import { DarshanRoute } from '../types';
import {
  Route as RouteIcon,
  Navigation,
  Clock,
  CheckCircle2,
  Circle,
  MapPin,
  ChevronRight,
  Footprints,
  Sparkles,
} from 'lucide-react';
import { useNavigation } from '../navigation/NavigationContext';

export const RoutesScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedRoute, setSelectedRoute] = useState<DarshanRoute>(MOCK_DARSHAN_ROUTES[0]);
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});

  const toggleStopCompletion = (stopKey: string) => {
    setCompletedStops((prev) => ({
      ...prev,
      [stopKey]: !prev[stopKey],
    }));
  };

  const getCompletedCountForRoute = (route: DarshanRoute) => {
    return route.stops.filter((s) => completedStops[`${route.id}_${s.stopOrder}`]).length;
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden">
      <Header subtitle="Curated Darshan Walking Circuits" />
      <OfflineBanner />

      {/* Routes Switcher Tabs */}
      <div className="p-3 bg-neutral-900 border-b border-neutral-800 space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {MOCK_DARSHAN_ROUTES.map((route) => {
            const isSelected = selectedRoute.id === route.id;
            const completedCount = getCompletedCountForRoute(route);

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRoute(route)}
                className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 min-w-[200px] shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-950/60 border-amber-500/70 text-white shadow-lg'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    {route.tag}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {completedCount}/{route.stops.length} visited
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-100 truncate">{route.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3 h-3 text-amber-400" />
                    <span>{route.totalDistanceKm} km</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{route.estimatedMinutes} mins</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Route Detail & Stop by Stop Checklist */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Route Overview Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">{selectedRoute.title}</h3>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              {selectedRoute.tag}
            </span>
          </div>
          {selectedRoute.marathiTitle && (
            <p className="text-xs font-medium text-amber-200/90">{selectedRoute.marathiTitle}</p>
          )}
          <p className="text-xs text-neutral-300 leading-relaxed">{selectedRoute.description}</p>

          {/* Progress bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
              <span>Trail Progress</span>
              <span className="font-mono text-amber-300 font-semibold">
                {Math.round(
                  (getCompletedCountForRoute(selectedRoute) / selectedRoute.stops.length) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    (getCompletedCountForRoute(selectedRoute) / selectedRoute.stops.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Trail Stops */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
            Pandal Stops ({selectedRoute.stops.length})
          </h4>

          <div className="space-y-2 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-neutral-800">
            {selectedRoute.stops.map((stop) => {
              const stopKey = `${selectedRoute.id}_${stop.stopOrder}`;
              const isDone = !!completedStops[stopKey];

              return (
                <div
                  key={stop.stopOrder}
                  className={`relative flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-neutral-950/60 border-emerald-500/40 text-neutral-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-100 hover:border-neutral-700'
                  }`}
                >
                  {/* Step Number indicator */}
                  <button
                    type="button"
                    onClick={() => toggleStopCompletion(stopKey)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-transform active:scale-90 font-mono font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-neutral-800 text-amber-400 border border-neutral-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : stop.stopOrder}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{stop.pandalName}</h5>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {stop.distanceFromPrevMeters === 0
                          ? 'Starting Point'
                          : `+${stop.distanceFromPrevMeters}m (~${stop.estimatedWalkingMinutes}m)`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => toggleStopCompletion(stopKey)}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                      >
                        {isDone ? (
                          <span className="text-emerald-400 font-medium">Visited</span>
                        ) : (
                          <span>Mark as visited</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('Map', { selectedPandalId: stop.pandalId })}
                        className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>View on Map</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
