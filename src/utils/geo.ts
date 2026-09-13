/**
 * Geo and Accuracy Evaluation Utilities
 * Strict compliance with 01_DOMAIN_RULES.md (Rules 1 & 2)
 */

import { ENV_CONFIG } from '../config/env';
import { AccuracyBracket, DragCorrectionBracket } from '../types';

/**
 * Calculates the great-circle distance between two points in meters using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Rule 2: Evaluates GPS accuracy against domain rules
 * 0-15m: Auto-accept.
 * 15-50m: Ask confirmation.
 * 50-100m: Require manual pandal select/retry.
 * >100m: Warning, approximate only.
 */
export function evaluateGpsAccuracy(accuracyMeters: number): {
  bracket: AccuracyBracket;
  title: string;
  description: string;
  badgeColor: 'emerald' | 'amber' | 'orange' | 'rose';
  canAutoAccept: boolean;
  requiresManualSelect: boolean;
  isApproximateWarning: boolean;
} {
  const { AUTO_ACCEPT_MAX, ASK_CONFIRMATION_MAX, MANUAL_SELECT_MAX } =
    ENV_CONFIG.ACCURACY_RULES;

  if (accuracyMeters <= AUTO_ACCEPT_MAX) {
    return {
      bracket: 'auto_accept',
      title: 'High Precision GPS',
      description: `±${Math.round(accuracyMeters)}m accuracy. Auto-accepted under Rule 2.`,
      badgeColor: 'emerald',
      canAutoAccept: true,
      requiresManualSelect: false,
      isApproximateWarning: false,
    };
  }

  if (accuracyMeters <= ASK_CONFIRMATION_MAX) {
    return {
      bracket: 'ask_confirmation',
      title: 'Moderate Accuracy',
      description: `±${Math.round(accuracyMeters)}m accuracy. Please confirm nearest pandal before recording.`,
      badgeColor: 'amber',
      canAutoAccept: false,
      requiresManualSelect: false,
      isApproximateWarning: false,
    };
  }

  if (accuracyMeters <= MANUAL_SELECT_MAX) {
    return {
      bracket: 'manual_select',
      title: 'Low Accuracy',
      description: `±${Math.round(accuracyMeters)}m accuracy. Requires manual pandal selection or GPS retry.`,
      badgeColor: 'orange',
      canAutoAccept: false,
      requiresManualSelect: true,
      isApproximateWarning: false,
    };
  }

  return {
    bracket: 'approximate_warning',
    title: 'Weak GPS Signal',
    description: `±${Math.round(accuracyMeters)}m accuracy. Location marked as approximate; verify carefully.`,
    badgeColor: 'rose',
    canAutoAccept: false,
    requiresManualSelect: true,
    isApproximateWarning: true,
  };
}

/**
 * Rule 2: Manual drag Haversine check:
 * within radius = correction;
 * up to 50m = confirm;
 * 50-200m = require known pandal/explanation;
 * >200m = flag review.
 */
export function evaluateManualAdjustment(distanceMeters: number): {
  bracket: DragCorrectionBracket;
  statusText: string;
  requiresExplanation: boolean;
  isFlaggedForReview: boolean;
} {
  const { CONFIRM_THRESHOLD_METERS, EXPLANATION_THRESHOLD_METERS } =
    ENV_CONFIG.ACCURACY_RULES.MANUAL_DRAG;

  if (distanceMeters <= 10) {
    return {
      bracket: 'within_correction',
      statusText: `Micro-correction (${distanceMeters}m). Within normal pandal entrance perimeter.`,
      requiresExplanation: false,
      isFlaggedForReview: false,
    };
  }

  if (distanceMeters <= CONFIRM_THRESHOLD_METERS) {
    return {
      bracket: 'confirm_adjustment',
      statusText: `Adjustment of ${distanceMeters}m requires confirmation.`,
      requiresExplanation: false,
      isFlaggedForReview: false,
    };
  }

  if (distanceMeters <= EXPLANATION_THRESHOLD_METERS) {
    return {
      bracket: 'require_explanation',
      statusText: `Shift of ${distanceMeters}m requires note (e.g. entrance on back gate, queue start).`,
      requiresExplanation: true,
      isFlaggedForReview: false,
    };
  }

  return {
    bracket: 'flag_for_review',
    statusText: `Shift of ${distanceMeters}m exceeds 200m! Visit will be recorded and queued for community audit.`,
    requiresExplanation: true,
    isFlaggedForReview: true,
  };
}

/**
 * Captures localized timezone metadata adhering to Rule 1:
 * "Capture originalLatitude, originalLongitude, accuracyMeters, capturedAtUtc, capturedTimezone, capturedOffsetMinutes"
 */
export function getCapturedTimezoneMeta(): {
  capturedAtUtc: string;
  capturedTimezone: string;
  capturedOffsetMinutes: number;
} {
  const now = new Date();
  const capturedAtUtc = now.toISOString();

  let capturedTimezone = 'Asia/Kolkata';
  try {
    capturedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    capturedTimezone = 'Asia/Kolkata';
  }

  // getTimezoneOffset() returns minutes positive behind UTC, so negate for standard UTC offset
  const capturedOffsetMinutes = -now.getTimezoneOffset();

  return {
    capturedAtUtc,
    capturedTimezone,
    capturedOffsetMinutes,
  };
}

/**
 * Formats distance in meters or kilometers nicely
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
