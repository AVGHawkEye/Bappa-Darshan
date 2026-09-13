/**
 * Bappa Darshan - Environment Configuration
 * Strict compliance with 00_CORE_MANIFESTO, 01_DOMAIN_RULES, and 02_DATA_SCHEMA
 */

export const ENV_CONFIG = {
  APP_NAME: 'Bappa Darshan',
  APP_TAGLINE: 'Discover, document, relive, and identify every Ganpati pandal',
  VERSION: '1.0.0-pilot',
  ENVIRONMENT: 'pilot',

  // Pilot Scope: Kandivali–Charkop, Mumbai (R/South Ward)
  PILOT_ZONE: {
    NAME: 'Kandivali–Charkop, Mumbai',
    WARD: 'R/South Ward',
    TARGET_PANDALS: '30–100 verified pandals',
    DEFAULT_CENTER: {
      latitude: 19.2138,
      longitude: 72.8295,
      zoom: 15,
    },
    BOUNDS: {
      minLat: 19.195,
      maxLat: 19.232,
      minLng: 72.81,
      maxLng: 72.865,
    },
  },

  // 01_DOMAIN_RULES: Accuracy & Manual Adjustment Thresholds (Meters)
  ACCURACY_RULES: {
    AUTO_ACCEPT_MAX: 15, // 0-15m: Auto-accept
    ASK_CONFIRMATION_MAX: 50, // 15-50m: Ask confirmation
    MANUAL_SELECT_MAX: 100, // 50-100m: Require manual pandal select / retry
    APPROXIMATE_THRESHOLD: 100, // >100m: Warning, approximate only

    // Manual Drag Haversine Constraints
    MANUAL_DRAG: {
      CONFIRM_THRESHOLD_METERS: 50, // up to 50m: confirm
      EXPLANATION_THRESHOLD_METERS: 200, // 50-200m: require known pandal / explanation
      FLAG_REVIEW_THRESHOLD_METERS: 200, // >200m: flag for community review
    },
  },

  // 01_DOMAIN_RULES: Sync Engine Exponential Backoff (seconds)
  // 1m -> 5m -> 15m -> 1h -> 6h
  SYNC_ENGINE: {
    BACKOFF_SECONDS: [60, 300, 900, 3600, 21600],
    MAX_ATTEMPTS: 5,
  },

  // Storage and Network Defaults
  STORAGE: {
    DB_NAME: 'bappa_darshan_local_sqlite',
    MEDIA_BUCKET_KEY: 'bappa_darshan_media_local',
    USER_ID: 'usr_pilot_kandivali_01',
  },
} as const;
