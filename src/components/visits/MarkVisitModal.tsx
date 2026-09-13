import React, { useState } from 'react';
import { Pandal, Visit } from '../../types';
import {
  calculateHaversineDistanceMeters,
  evaluateGpsAccuracy,
  evaluateManualAdjustment,
  getCapturedTimezoneMeta,
} from '../../utils/geo';
import { VisitsRepository } from '../../services/storage/sqliteWatermelonAdapter';
import { ENV_CONFIG } from '../../config/env';
import {
  X,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Sparkles,
  Camera,
  BookmarkCheck,
} from 'lucide-react';
import { AccuracyBadge } from '../common/AccuracyBadge';

interface MarkVisitModalProps {
  pandal: Pandal;
  initialCoords: { lat: number; lng: number; accuracy: number };
  onClose: () => void;
  onSuccess: (visit: Visit, openPhotoUpload: boolean) => void;
}

export const MarkVisitModal: React.FC<MarkVisitModalProps> = ({
  pandal,
  initialCoords,
  onClose,
  onSuccess,
}) => {
  // Captured coordinates (Never overwritten)
  const originalLat = initialCoords.lat;
  const originalLng = initialCoords.lng;
  const accuracyMeters = initialCoords.accuracy;

  // Final adjusted coordinates (can be adjusted via slider or micro-drag simulation)
  const [adjustedLat, setAdjustedLat] = useState(pandal.verifiedLatitude);
  const [adjustedLng, setAdjustedLng] = useState(pandal.verifiedLongitude);
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluate Accuracy Rule 2
  const accuracyEval = evaluateGpsAccuracy(accuracyMeters);

  // Calculate distance between original GPS and pandal
  const distanceToPandal = calculateHaversineDistanceMeters(
    originalLat,
    originalLng,
    pandal.verifiedLatitude,
    pandal.verifiedLongitude
  );

  // Calculate manual adjustment distance if shifted
  const adjustmentDistance = calculateHaversineDistanceMeters(
    originalLat,
    originalLng,
    adjustedLat,
    adjustedLng
  );

  const dragEval = evaluateManualAdjustment(adjustmentDistance);

  const handleSaveVisit = async (openPhotoNow: boolean) => {
    setIsSubmitting(true);
    try {
      const timeMeta = getCapturedTimezoneMeta();

      const createdVisit = await VisitsRepository.createVisit({
        userId: ENV_CONFIG.STORAGE.USER_ID,
        pandalId: pandal.id,
        pandalName: pandal.name,
        // Rule 1: Never overwrite original coordinates
        originalLatitude: originalLat,
        originalLongitude: originalLng,
        accuracyMeters: accuracyMeters,
        finalLatitude: hasAdjusted ? adjustedLat : pandal.verifiedLatitude,
        finalLongitude: hasAdjusted ? adjustedLng : pandal.verifiedLongitude,
        manualAdjustment: hasAdjusted,
        adjustmentDistanceMeters: hasAdjusted ? adjustmentDistance : 0,
        adjustmentReason: hasAdjusted ? adjustmentReason : undefined,
        capturedAtUtc: timeMeta.capturedAtUtc,
        capturedTimezone: timeMeta.capturedTimezone,
        capturedOffsetMinutes: timeMeta.capturedOffsetMinutes,
        status: dragEval.isFlaggedForReview ? 'flagged' : 'recorded',
      });

      onSuccess(createdVisit, openPhotoNow);
    } catch (err) {
      console.error('Failed to record visit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Mark Pandal Darshan</h2>
              <p className="text-[11px] text-neutral-400">Offline-first GPS visit logging (Rule 1 & 2)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Pandal Info Banner */}
          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/60">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
              {pandal.ward} • {pandal.sector}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{pandal.name}</h3>
            {pandal.marathiName && (
              <p className="text-xs text-amber-200/90 font-medium">{pandal.marathiName}</p>
            )}
            <p className="text-[11px] text-neutral-400 mt-1">{pandal.address}</p>
          </div>

          {/* GPS Accuracy Evaluation Card (01_DOMAIN_RULES) */}
          <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-medium">GPS Accuracy Rating:</span>
              <AccuracyBadge accuracyMeters={accuracyMeters} showDetails={false} />
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-2">
              {accuracyEval.canAutoAccept ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-neutral-200">{accuracyEval.title}</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                  {accuracyEval.description}
                </p>
              </div>
            </div>

            {/* Distance to Verified Coordinates */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[11px]">
              <span className="text-neutral-400">Distance from verified pin:</span>
              <span className="font-mono font-semibold text-neutral-200">
                {distanceToPandal} meters
              </span>
            </div>
          </div>

          {/* Golden Rule Note */}
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Golden Rule: Mark Now, Upload Later</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Your visit coordinates and GPS timestamp will be locked immediately. You can upload photos later tonight; they will stay permanently tied to this exact darshan timestamp.
            </p>
          </div>

          {/* Manual Fine-Tuning Check (Rule 2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setHasAdjusted(!hasAdjusted)}
                className="text-amber-400 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 underline underline-offset-2"
              >
                <Sliders className="w-3 h-3" />
                <span>{hasAdjusted ? 'Cancel adjustment' : 'Adjust pin to entrance / queue'}</span>
              </button>
              {hasAdjusted && (
                <span className="text-[10px] font-mono text-neutral-400">
                  Shift: {adjustmentDistance}m
                </span>
              )}
            </div>

            {hasAdjusted && (
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 animate-in fade-in">
                <p className="text-[11px] text-neutral-300">{dragEval.statusText}</p>

                {dragEval.requiresExplanation && (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Explanation for location offset (Required for &gt;50m):
                    </label>
                    <input
                      type="text"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="e.g., Standing at Darshan Queue Gate B on Mahavir Nagar side"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting || (hasAdjusted && dragEval.requiresExplanation && !adjustmentReason.trim())}
              onClick={() => handleSaveVisit(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50"
            >
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
              <span>Mark & Photo Later</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || (hasAdjusted && dragEval.requiresExplanation && !adjustmentReason.trim())}
              onClick={() => handleSaveVisit(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Mark & Add Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
