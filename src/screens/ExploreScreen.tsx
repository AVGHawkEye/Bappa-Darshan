import React, { useEffect, useState } from 'react';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { PandalsRepository } from '../services/storage/sqliteWatermelonAdapter';
import { Pandal, Visit } from '../types';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Navigation,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { MarkVisitModal } from '../components/visits/MarkVisitModal';
import { UploadPhotoModal } from '../components/visits/UploadPhotoModal';
import { PandalDetailModal } from '../components/pandals/PandalDetailModal';

export const ExploreScreen: React.FC = () => {
  const [pandals, setPandals] = useState<Pandal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedPandalForDetail, setSelectedPandalForDetail] = useState<Pandal | null>(null);
  const [selectedPandalForVisit, setSelectedPandalForVisit] = useState<Pandal | null>(null);
  const [photoModalVisit, setPhotoModalVisit] = useState<Visit | null>(null);

  useEffect(() => {
    PandalsRepository.getAll().then(setPandals);
  }, []);

  const sectors = ['All', 'Charkop', 'Dahanukar Wadi', 'Mahavir Nagar', 'Poisar'];

  const filteredPandals = pandals.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.marathiName && p.marathiName.toLowerCase().includes(q)) ||
      p.address.toLowerCase().includes(q) ||
      (p.sector && p.sector.toLowerCase().includes(q));

    const matchesSector =
      selectedSector === 'All' ||
      p.sector?.toLowerCase().includes(selectedSector.toLowerCase()) ||
      p.address.toLowerCase().includes(selectedSector.toLowerCase());

    return matchesSearch && matchesSector;
  });

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden">
      <Header subtitle="Browse Kandivali–Charkop Pandals" />
      <OfflineBanner />

      {/* Search and Filters Header */}
      <div className="p-3 bg-neutral-900 border-b border-neutral-800 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pandal name, sector, address..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Sector Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {sectors.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSector(s)}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedSector === s
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Pandals List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>{filteredPandals.length} Pandals in Pilot Zone</span>
          <span className="text-[10px] font-mono text-amber-400/90">30–100 Target</span>
        </div>

        {filteredPandals.map((pandal) => (
          <div
            key={pandal.id}
            className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 shadow-md hover:border-neutral-700 transition-colors flex flex-col gap-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pandal.sector || pandal.ward}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mt-1 leading-snug">{pandal.name}</h3>
                {pandal.marathiName && (
                  <p className="text-xs text-amber-300 font-medium">{pandal.marathiName}</p>
                )}

                <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{pandal.address}</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 block">
                  {pandal.crowdLevel?.toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Est. {pandal.establishedYear}
                </span>
              </div>
            </div>

            {/* Timings preview */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-neutral-300 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>
                  Aarti:{' '}
                  {pandal.timings.aartis
                    .slice(0, 2)
                    .map((a) => a.time)
                    .join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedPandalForDetail(pandal)}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                >
                  Details
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPandalForVisit(pandal)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white font-semibold text-xs shadow flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Mark Visit</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPandals.length === 0 && (
          <div className="text-center py-12 px-4 space-y-2">
            <Info className="w-8 h-8 text-neutral-500 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">No pandals match your search</p>
            <p className="text-xs text-neutral-500">
              Try searching "Charkop", "Dahanukar Wadi", or clear filters.
            </p>
          </div>
        )}
      </div>

      {/* Pandal Detail Modal */}
      {selectedPandalForDetail && (
        <PandalDetailModal
          pandal={selectedPandalForDetail}
          onClose={() => setSelectedPandalForDetail(null)}
          onMarkVisit={(p) => {
            setSelectedPandalForDetail(null);
            setSelectedPandalForVisit(p);
          }}
        />
      )}

      {/* Mark Visit Modal */}
      {selectedPandalForVisit && (
        <MarkVisitModal
          pandal={selectedPandalForVisit}
          initialCoords={{
            lat: selectedPandalForVisit.verifiedLatitude,
            lng: selectedPandalForVisit.verifiedLongitude,
            accuracy: 10,
          }}
          onClose={() => setSelectedPandalForVisit(null)}
          onSuccess={(visit, openPhotoNow) => {
            setSelectedPandalForVisit(null);
            if (openPhotoNow) {
              setPhotoModalVisit(visit);
            }
          }}
        />
      )}

      {/* Upload Photo Modal */}
      {photoModalVisit && (
        <UploadPhotoModal
          visit={photoModalVisit}
          onClose={() => setPhotoModalVisit(null)}
          onSuccess={() => setPhotoModalVisit(null)}
        />
      )}
    </div>
  );
};
