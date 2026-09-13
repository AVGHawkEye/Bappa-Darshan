import React, { useEffect, useState } from 'react';
import { PandalMap } from '../components/map/PandalMap';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { PandalsRepository } from '../services/storage/sqliteWatermelonAdapter';
import { Pandal, Visit } from '../types';
import { MarkVisitModal } from '../components/visits/MarkVisitModal';
import { UploadPhotoModal } from '../components/visits/UploadPhotoModal';
import { PandalDetailModal } from '../components/pandals/PandalDetailModal';
import { Filter, Layers, CheckCircle } from 'lucide-react';

export const MapScreen: React.FC = () => {
  const [pandals, setPandals] = useState<Pandal[]>([]);
  const [selectedPandalId, setSelectedPandalId] = useState<string | undefined>();
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  // Modals state
  const [visitModalPandal, setVisitModalPandal] = useState<{
    pandal: Pandal;
    coords: { lat: number; lng: number; accuracy: number };
  } | null>(null);

  const [photoModalVisit, setPhotoModalVisit] = useState<Visit | null>(null);
  const [detailModalPandal, setDetailModalPandal] = useState<Pandal | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    PandalsRepository.getAll().then((data) => {
      setPandals(data);
      if (data.length > 0 && !selectedPandalId) {
        setSelectedPandalId(data[0].id);
      }
    });
  }, []);

  const sectors = ['all', 'Sector 3, Charkop', 'Dahanukar Wadi', 'Mahavir Nagar', 'Sector 8, Charkop'];

  const filteredPandals =
    sectorFilter === 'all'
      ? pandals
      : pandals.filter((p) => p.sector?.includes(sectorFilter) || p.address.includes(sectorFilter));

  const handlePandalSelect = (pandal: Pandal) => {
    setSelectedPandalId(pandal.id);
  };

  const handleTriggerMarkVisit = (
    pandal: Pandal,
    coords: { lat: number; lng: number; accuracy: number }
  ) => {
    setVisitModalPandal({ pandal, coords });
  };

  const handleVisitSuccess = (visit: Visit, openPhotoNow: boolean) => {
    setVisitModalPandal(null);
    setShowSuccessToast(`Visit recorded for ${visit.pandalName || 'pandal'}!`);
    setTimeout(() => setShowSuccessToast(null), 3500);

    if (openPhotoNow) {
      setPhotoModalVisit(visit);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden relative">
      <Header />
      <OfflineBanner />

      {/* Sector filter scroll bar */}
      <div className="px-3 py-2 bg-neutral-900/90 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-20">
        <span className="text-[11px] text-neutral-400 font-semibold flex items-center gap-1 pl-1 shrink-0">
          <Filter className="w-3 h-3 text-amber-400" />
          <span>Area:</span>
        </span>
        {sectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSectorFilter(s)}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 ${
              sectorFilter === s
                ? 'bg-amber-500 text-white font-semibold shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {s === 'all' ? 'All Pandals' : s.replace(', Charkop', '')}
          </button>
        ))}
      </div>

      {/* Map View Area */}
      <div className="flex-1 relative">
        <PandalMap
          pandals={filteredPandals}
          selectedPandalId={selectedPandalId}
          onSelectPandal={handlePandalSelect}
          onMarkVisit={handleTriggerMarkVisit}
        />
      </div>

      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="absolute top-24 left-4 right-4 z-40 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Mark Visit Modal (Rule 1 & 2) */}
      {visitModalPandal && (
        <MarkVisitModal
          pandal={visitModalPandal.pandal}
          initialCoords={visitModalPandal.coords}
          onClose={() => setVisitModalPandal(null)}
          onSuccess={handleVisitSuccess}
        />
      )}

      {/* Upload Photo Modal (Rule 3) */}
      {photoModalVisit && (
        <UploadPhotoModal
          visit={photoModalVisit}
          onClose={() => setPhotoModalVisit(null)}
          onSuccess={() => {
            setPhotoModalVisit(null);
            setShowSuccessToast('Photo successfully linked to original visit coordinates!');
            setTimeout(() => setShowSuccessToast(null), 3500);
          }}
        />
      )}

      {/* Pandal Detail Sheet */}
      {detailModalPandal && (
        <PandalDetailModal
          pandal={detailModalPandal}
          onClose={() => setDetailModalPandal(null)}
          onMarkVisit={(p) => {
            setDetailModalPandal(null);
            setVisitModalPandal({
              pandal: p,
              coords: { lat: p.verifiedLatitude, lng: p.verifiedLongitude, accuracy: 12 },
            });
          }}
        />
      )}
    </div>
  );
};
