/**
 * Bappa Darshan Domain Models & Types
 * Strictly aligned with 01_DOMAIN_RULES.md and 02_DATA_SCHEMA.md
 */

export type Role = 'devotee' | 'volunteer' | 'moderator' | 'admin';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  privacySettings: {
    publicProfile: boolean;
    shareVisitsCommunity: boolean;
    stripExifOnUpload: boolean;
  };
}

export type VerificationStatus = 'verified' | 'community_submitted' | 'pending_verification' | 'disputed';

export interface AartiTiming {
  name: 'Morning' | 'Madhyanh' | 'Evening' | 'Shej';
  time: string; // e.g. "07:30 AM", "08:00 PM"
  description?: string;
}

export interface Pandal {
  id: string;
  name: string;
  marathiName?: string;
  verifiedLatitude: number;
  verifiedLongitude: number;
  address: string;
  ward: string; // e.g., "R/South"
  sector?: string; // e.g., "Sector 3, Charkop"
  timings: {
    darshanOpen: string;
    darshanClose: string;
    aartis: AartiTiming[];
  };
  verificationStatus: VerificationStatus;
  establishedYear?: number;
  highlights?: string[];
  crowdLevel?: 'low' | 'moderate' | 'high' | 'peak';
  thumbnailUrl?: string;
}

export type AccuracyBracket =
  | 'auto_accept' // 0-15m
  | 'ask_confirmation' // 15-50m
  | 'manual_select' // 50-100m
  | 'approximate_warning'; // >100m

export type DragCorrectionBracket =
  | 'within_correction' // fine tuning within tolerance
  | 'confirm_adjustment' // up to 50m
  | 'require_explanation' // 50-200m
  | 'flag_for_review'; // >200m

export type VisitStatus = 'recorded' | 'synced' | 'pending_upload' | 'flagged';

export interface Visit {
  id: string;
  localId: string;
  userId: string;
  pandalId: string;
  pandalName?: string;
  // Rule 1: Never overwrite original coordinates
  originalLatitude: number;
  originalLongitude: number;
  accuracyMeters: number;
  finalLatitude: number;
  finalLongitude: number;
  manualAdjustment: boolean;
  adjustmentDistanceMeters: number;
  adjustmentReason?: string;
  status: VisitStatus;
  capturedAtUtc: string; // ISO 8601 UTC
  capturedTimezone: string; // e.g. "Asia/Kolkata"
  capturedOffsetMinutes: number; // e.g. 330 (+05:30)
  photoCount?: number;
}

export type PhotoSourceType = 'in_app_camera' | 'gallery';
export type PhotoCaptureMode = 'during_visit' | 'uploaded_later';
export type PhotoModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Photo {
  id: string;
  visitId: string;
  pandalId: string;
  userId: string;
  storageKey: string;
  thumbnailStorageKey?: string;
  sourceType: PhotoSourceType;
  captureMode: PhotoCaptureMode;
  moderationStatus: PhotoModerationStatus;
  idolConfidence?: number; // 0.0 - 1.0 (Bappa idol detection confidence)
  duplicateHash?: string;
  embeddingVector?: number[];
  capturedAtUtc: string;
  previewUrl?: string;
  note?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  photoId?: string;
  pandalId?: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAtUtc: string;
}

export type SyncEntityType = 'visit' | 'photo' | 'report';
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncJobState = 'pending' | 'in_progress' | 'succeeded' | 'failed';

export interface SyncJob {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  attempts: number;
  state: SyncJobState;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  errorMessage?: string;
  idempotencyKey: string;
}

export interface RouteStop {
  stopOrder: number;
  pandalId: string;
  pandalName: string;
  distanceFromPrevMeters?: number;
  estimatedWalkingMinutes?: number;
}

export interface DarshanRoute {
  id: string;
  title: string;
  marathiTitle?: string;
  description: string;
  totalDistanceKm: number;
  estimatedMinutes: number;
  tag: 'Heritage' | 'Walking' | 'Express Aarti' | 'Family Friendly';
  stops: RouteStop[];
}

// Navigation Typed Schemas
export type RootTabParamList = {
  Map: { selectedPandalId?: string; focusUser?: boolean } | undefined;
  Explore: { query?: string; sectorFilter?: string } | undefined;
  MyVisits: { filterStatus?: VisitStatus } | undefined;
  Routes: { activeRouteId?: string } | undefined;
  Profile: undefined;
};

export type ScreenName = keyof RootTabParamList;

// NetInfo Types
export interface NetInfoState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
  isSimulatedOffline?: boolean;
}
