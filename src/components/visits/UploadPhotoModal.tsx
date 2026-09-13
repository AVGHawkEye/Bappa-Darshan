import React, { useState } from 'react';
import { PhotoCaptureMode, PhotoSourceType, Visit } from '../../types';
import { PhotosRepository } from '../../services/storage/sqliteWatermelonAdapter';
import { ENV_CONFIG } from '../../config/env';
import {
  X,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  Sparkles,
  Info,
} from 'lucide-react';

interface UploadPhotoModalProps {
  visit: Visit;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  visit,
  onClose,
  onSuccess,
}) => {
  const [sourceType, setSourceType] = useState<PhotoSourceType>('in_app_camera');
  const [captureMode, setCaptureMode] = useState<PhotoCaptureMode>('during_visit');
  const [note, setNote] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1567591414240-e2b245e0f7e4?w=800&auto=format&fit=crop&q=80'
  );
  const [isUploading, setIsUploading] = useState(false);

  // File input handler for real browser upload testing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const mockStorageKey = `local_media/${visit.pandalId}_${Date.now()}.jpg`;

      await PhotosRepository.addPhotoToVisit({
        visitId: visit.id,
        pandalId: visit.pandalId,
        userId: ENV_CONFIG.STORAGE.USER_ID,
        storageKey: mockStorageKey,
        thumbnailStorageKey: `local_media/thumbs/${visit.pandalId}_${Date.now()}.jpg`,
        sourceType,
        captureMode, // Rule 3: Trust & Labeling
        capturedAtUtc: new Date().toISOString(),
        idolConfidence: 0.96, // AI edge idol confidence detection mock
        previewUrl: selectedImage,
        note: note.trim() || undefined,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to attach photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Attach Darshan Photo</h2>
              <p className="text-[11px] text-neutral-400">Linked to visit: {visit.pandalName || visit.pandalId}</p>
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
          {/* Rule 3: Trust & Labeling Banner */}
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rule 3: Trust & Labeling</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">EXIF-Independent</span>
            </div>

            <p className="text-[11px] text-neutral-400">
              Select whether this photo was taken live at the pandal or uploaded from gallery later.
            </p>

            {/* Capture Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCaptureMode('during_visit');
                  setSourceType('in_app_camera');
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  captureMode === 'during_visit'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Captured Live</span>
                  {captureMode === 'during_visit' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] opacity-80">During Darshan (High Trust)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCaptureMode('uploaded_later');
                  setSourceType('gallery');
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  captureMode === 'uploaded_later'
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Uploaded Later</span>
                  {captureMode === 'uploaded_later' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] opacity-80">Saved from earlier session</span>
              </button>
            </div>
          </div>

          {/* Photo Preview & Source Selector */}
          <div className="space-y-2">
            <label className="block text-neutral-300 font-semibold">Photo Source & Preview</label>
            <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 h-44 flex items-center justify-center group">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Bappa Darshan Idol"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-neutral-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No image selected</span>
                </div>
              )}

              {/* Source Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/20">
                {sourceType === 'in_app_camera' ? '📷 In-App Camera' : '🖼️ Device Gallery'}
              </div>

              {/* AI Detection Label */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-[10px] text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Idol Confidence: 96%</span>
              </div>
            </div>

            {/* Image File Input */}
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer py-2 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-center font-medium text-neutral-200 transition-colors flex items-center justify-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Choose from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setSelectedImage(
                    'https://images.unsplash.com/photo-1599818967389-91ca8e4693cf?w=800&auto=format&fit=crop&q=80'
                  )
                }
                className="py-2 px-3 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 font-medium transition-colors"
                title="Use sample Bappa photo"
              >
                Sample Idol
              </button>
            </div>
          </div>

          {/* Visit Note */}
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Darshan Note / Memory (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Attended grand 8 PM evening Aarti, magnificent floral decoration."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Privacy Note: EXIF stripping boundary */}
          <div className="flex items-start gap-1.5 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Object Storage Boundary:</strong> Private GPS/camera metadata in EXIF headers is stripped prior to public community sync.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs border border-neutral-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUploading || !selectedImage}
            onClick={handleUpload}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{isUploading ? 'Saving Photo...' : 'Save to Visit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
