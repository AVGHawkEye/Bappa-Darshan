import React from 'react';
import { Pandal } from '../../types';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface PandalDetailModalProps {
  pandal: Pandal;
  onClose: () => void;
  onMarkVisit: (pandal: Pandal) => void;
}

export const PandalDetailModal: React.FC<PandalDetailModalProps> = ({
  pandal,
  onClose,
  onMarkVisit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Banner image or placeholder */}
        <div className="relative h-44 w-full bg-neutral-950 overflow-hidden">
          {pandal.thumbnailUrl ? (
            <img
              src={pandal.thumbnailUrl}
              alt={pandal.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-amber-900/60 to-orange-900/60 flex items-center justify-center">
              <span className="text-5xl font-bold text-amber-500/40">ॐ</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-900/80 text-white backdrop-blur-md border border-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status & Ward Chips */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                {pandal.ward}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-300 border border-neutral-700 backdrop-blur-md">
                {pandal.sector}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 backdrop-blur-md font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Pandal</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{pandal.name}</h2>
            {pandal.marathiName && (
              <p className="text-sm font-semibold text-amber-400 mt-0.5">{pandal.marathiName}</p>
            )}
            <p className="text-neutral-400 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{pandal.address}</span>
            </p>
          </div>

          {/* Darshan & Aarti Timings */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between font-semibold text-neutral-200">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Darshan & Aarti Timings</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {pandal.timings.darshanOpen} – {pandal.timings.darshanClose}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {pandal.timings.aartis.map((aarti, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col"
                >
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="font-semibold text-xs">{aarti.name} Aarti</span>
                    <span className="font-mono text-amber-400 font-medium text-[11px]">
                      {aarti.time}
                    </span>
                  </div>
                  {aarti.description && (
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      {aarti.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          {pandal.highlights && (
            <div className="space-y-1.5">
              <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Special Highlights</span>
              </span>
              <div className="space-y-1">
                {pandal.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800/80 text-neutral-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Established & Crowd status */}
          <div className="grid grid-cols-2 gap-2 text-neutral-300">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-neutral-500 block">ESTABLISHED</span>
                <span className="font-semibold text-xs">{pandal.establishedYear}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] text-neutral-500 block">ESTIMATED CROWD</span>
                <span className="font-semibold text-xs uppercase">{pandal.crowdLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMarkVisit(pandal)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Mark My Visit at this Pandal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
