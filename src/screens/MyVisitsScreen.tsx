import React, { useEffect, useState } from 'react';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import {
  VisitsRepository,
  PhotosRepository,
} from '../services/storage/sqliteWatermelonAdapter';
import { Photo, Visit } from '../types';
import {
  Camera,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { AccuracyBadge } from '../components/common/AccuracyBadge';
import { UploadPhotoModal } from '../components/visits/UploadPhotoModal';
import { useNavigation } from '../navigation/NavigationContext';

export const MyVisitsScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [photosMap, setPhotosMap] = useState<Record<string, Photo[]>>({});
  const [selectedVisitForPhoto, setSelectedVisitForPhoto] = useState<Visit | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending_photos' | 'with_photos'>('all');

  const loadVisitsAndPhotos = async () => {
    const allVisits = await VisitsRepository.getAll();
    const allPhotos = await PhotosRepository.getAll();

    const grouped: Record<string, Photo[]> = {};
    allPhotos.forEach((p) => {
      if (!grouped[p.visitId]) grouped[p.visitId] = [];
      grouped[p.visitId].push(p);
    });

    setVisits(allVisits);
    setPhotosMap(grouped);
  };

  useEffect(() => {
    loadVisitsAndPhotos();
  }, []);

  const filteredVisits = visits.filter((v) => {
    const photos = photosMap[v.id] || [];
    if (filter === 'pending_photos') return photos.length === 0;
    if (filter === 'with_photos') return photos.length > 0;
    return true;
  });

  const formatTimestamp = (utcString: string) => {
    try {
      const d = new Date(utcString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return utcString;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden">
      <Header subtitle="Offline-First Visit Journal" />
      <OfflineBanner />

      {/* Manifesto Golden Rule Card */}
      <div className="p-3 bg-neutral-900 border-b border-neutral-800 space-y-2">
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-amber-300">Golden Rule: Mark Now, Upload Later</h3>
            <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
              Original GPS coordinates (<span className="font-mono text-amber-100 font-semibold">Rule 1</span>) remain locked and immutable. Photos uploaded later maintain an unshakeable link to your original darshan timestamp.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Visits ({visits.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending_photos')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              filter === 'pending_photos'
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Needs Photo Upload ({visits.filter((v) => (photosMap[v.id] || []).length === 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('with_photos')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              filter === 'with_photos'
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            With Photos ({visits.filter((v) => (photosMap[v.id] || []).length > 0).length})
          </button>
        </div>
      </div>

      {/* Visits List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredVisits.map((visit) => {
          const visitPhotos = photosMap[visit.id] || [];

          return (
            <div
              key={visit.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 shadow-md space-y-3"
            >
              {/* Visit Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                      ID: {visit.localId.slice(0, 14)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {visit.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {visit.pandalName || 'Kandivali Pandal'}
                  </h3>
                  <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Captured: {formatTimestamp(visit.capturedAtUtc)}</span>
                    <span className="text-[10px] font-mono text-neutral-500">({visit.capturedTimezone})</span>
                  </p>
                </div>

                <AccuracyBadge accuracyMeters={visit.accuracyMeters} />
              </div>

              {/* Coordinates Immutable Audit Strip (Rule 1 & Rule 2) */}
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Original GPS (Locked):</span>
                  <span className="font-mono text-neutral-300">
                    {visit.originalLatitude.toFixed(4)}, {visit.originalLongitude.toFixed(4)}
                  </span>
                </div>

                {visit.manualAdjustment && (
                  <div className="flex items-center justify-between text-amber-400/90 pt-1 border-t border-neutral-850">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3" />
                      <span>Manual Shift:</span>
                    </span>
                    <span className="font-mono font-semibold">
                      +{visit.adjustmentDistanceMeters}m ({visit.adjustmentReason || 'Perimeter check'})
                    </span>
                  </div>
                )}
              </div>

              {/* Attached Photos (Rule 3: Trust & Labeling) */}
              {visitPhotos.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Attached Photos ({visitPhotos.length}):</span>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Linked to Visit</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {visitPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 relative group"
                      >
                        <img
                          src={photo.previewUrl}
                          alt="Bappa Idol"
                          referrerPolicy="no-referrer"
                          className="w-full h-28 object-cover"
                        />
                        {/* Rule 3 Label */}
                        <div
                          className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold border backdrop-blur-md ${
                            photo.captureMode === 'during_visit'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {photo.captureMode === 'during_visit'
                            ? '🟢 Captured During Visit'
                            : '🟡 Uploaded Later'}
                        </div>

                        {photo.idolConfidence && (
                          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-neutral-200 font-mono">
                            Idol: {Math.round(photo.idolConfidence * 100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>No photo uploaded yet</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedVisitForPhoto(visit)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-semibold text-xs active:scale-95 transition-all"
                  >
                    Upload Photo Later
                  </button>
                </div>
              )}

              {/* Action to add additional photos */}
              {visitPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedVisitForPhoto(visit)}
                  className="w-full py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium border border-neutral-700/60 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Another Photo</span>
                </button>
              )}
            </div>
          );
        })}

        {filteredVisits.length === 0 && (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No visits recorded yet</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Visit a pandal in Kandivali–Charkop, tap "Mark Visit Now", and capture the moment with offline-first GPS!
            </p>
            <button
              type="button"
              onClick={() => navigate('Map')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs shadow-md active:scale-95"
            >
              Open Kandivali Map
            </button>
          </div>
        )}
      </div>

      {/* Upload Photo Modal */}
      {selectedVisitForPhoto && (
        <UploadPhotoModal
          visit={selectedVisitForPhoto}
          onClose={() => setSelectedVisitForPhoto(null)}
          onSuccess={() => {
            setSelectedVisitForPhoto(null);
            loadVisitsAndPhotos();
          }}
        />
      )}
    </div>
  );
};
