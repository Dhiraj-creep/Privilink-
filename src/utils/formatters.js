/**
 * TRUSTMESH Numerical & Data Formatting Utilities
 * Provides consistent typography, precision, and localization for enterprise risk analytics.
 * Zero guessing: ratios vs. scaled percentages are strictly distinguished by explicit flags.
 */

/**
 * Format a number with thousands separators and explicit decimal places.
 * Safely handles 0 (respecting decimals), null, undefined, NaN, and Infinity.
 */
export function formatNumber(val, decimals = 0, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format an already-scaled percentage value (e.g. 0.5 -> "0.5%", 85.4 -> "85.4%").
 * NEVER multiplies by 100.
 */
export function formatScaledPercent(val, decimals = 1, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${formatted}%`;
}

/**
 * Format a ratio in [0, 1] as a percentage (e.g. 0.005 -> "0.5%", 0.854 -> "85.4%").
 * Explicitly multiplies by 100.
 */
export function formatRatioAsPercent(val, decimals = 1, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  const scaled = num * 100;
  const formatted = scaled.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${formatted}%`;
}

/**
 * Flexible percentage formatter with explicit `isRatio` flag.
 * Eliminates magnitude-based guessing (values between 0 and 1 are NOT assumed to be ratios unless specified).
 * Supports both options object: formatPercent(val, { isRatio: true, decimals: 2 })
 * and positional args: formatPercent(val, decimals, isRatio, fallback).
 */
export function formatPercent(val, optionsOrDecimals = 1, isRatioArg = false, fallbackArg = '—') {
  let decimals = 1;
  let isRatio = false;
  let fallback = '—';

  if (typeof optionsOrDecimals === 'object' && optionsOrDecimals !== null) {
    decimals = optionsOrDecimals.decimals ?? 1;
    isRatio = !!optionsOrDecimals.isRatio;
    fallback = optionsOrDecimals.fallback ?? '—';
  } else {
    decimals = typeof optionsOrDecimals === 'number' ? optionsOrDecimals : 1;
    isRatio = !!isRatioArg;
    fallback = fallbackArg || '—';
  }

  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;

  const valueToFormat = isRatio ? num * 100 : num;
  const formatted = valueToFormat.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${formatted}%`;
}

/**
 * Format a Risk Score (0-100 composite index).
 * Displays as an integer percentage or with 1 decimal.
 */
export function formatRiskScore(val, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return `${Math.round(num)}%`;
}

/**
 * Format an ML metric (PR-AUC, ROC-AUC, F1 score) to fixed decimal places (default 3).
 * Correctly respects decimals when value is 0.
 */
export function formatMetric(val, decimals = 3, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return num.toFixed(decimals);
}

/**
 * Format ISO timestamp into clean readable display with explicit UTC/Local context.
 */
export function formatDateTime(isoString, fallback = '—') {
  if (!isoString) return fallback;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return String(isoString);
    }
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return String(isoString);
  }
}

/**
 * Format time only (HH:MM:SS)
 */
export function formatTime(isoString, fallback = '—') {
  if (!isoString) return fallback;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleTimeString('en-US', { hour12: false });
  } catch {
    return String(isoString);
  }
}

/**
 * Format date only (YYYY-MM-DD or MMM DD, YYYY)
 */
export function formatDate(isoString, fallback = '—') {
  if (!isoString) return fallback;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return String(isoString);
  }
}

/**
 * Shorten cryptographic hash (e.g. 0x3c99...e28b)
 */
export function shortenHash(hash, leading = 8, trailing = 6) {
  if (!hash || typeof hash !== 'string') return '—';
  if (hash.length <= leading + trailing + 3) return hash;
  return `${hash.slice(0, leading)}...${hash.slice(-trailing)}`;
}

/**
 * Map risk level to semantic UI properties (badge variant, label, color).
 * CRITICAL FIX: Unknown risk levels return a neutral UNKNOWN state rather than defaulting to LOW.
 */
export function getRiskVariant(riskLevel) {
  if (!riskLevel) {
    return {
      variant: 'neutral',
      label: 'UNKNOWN',
      bg: '#F1F5F9',
      color: '#475569',
      border: '#CBD5E1',
      dot: '#94A3B8'
    };
  }
  const norm = String(riskLevel).trim().toUpperCase();
  switch (norm) {
    case 'HIGH':
    case 'CRITICAL':
      return {
        variant: 'danger',
        label: norm,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        dot: '#EF4444'
      };
    case 'MEDIUM':
    case 'MODERATE':
      return {
        variant: 'warning',
        label: 'MEDIUM',
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        dot: '#F59E0B'
      };
    case 'LOW':
      return {
        variant: 'success',
        label: 'LOW',
        bg: '#F0FDF4',
        color: '#16A34A',
        border: '#BBF7D0',
        dot: '#22C55E'
      };
    default:
      return {
        variant: 'neutral',
        label: 'UNKNOWN',
        bg: '#F1F5F9',
        color: '#475569',
        border: '#CBD5E1',
        dot: '#94A3B8'
      };
  }
}

/**
 * Map case status to semantic badge variant.
 * CRITICAL FIX: Unknown status returns an explicit Unknown variant.
 */
export function getStatusVariant(status) {
  if (!status) {
    return {
      variant: 'neutral',
      label: 'Unknown',
      bg: '#F1F5F9',
      color: '#475569',
      border: '#CBD5E1'
    };
  }
  const norm = String(status).trim().toUpperCase();
  switch (norm) {
    case 'RESOLVED':
    case 'CLEARED':
      return {
        variant: 'success',
        label: 'Resolved',
        bg: '#F0FDF4',
        color: '#16A34A',
        border: '#BBF7D0'
      };
    case 'VERIFICATION_REQUESTED':
    case 'IN_REVIEW':
      return {
        variant: 'warning',
        label: 'Verification Active',
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A'
      };
    case 'ESCALATED':
      return {
        variant: 'danger',
        label: 'Escalated',
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA'
      };
    case 'PENDING_REVIEW':
    case 'MONITORING':
      return {
        variant: 'neutral',
        label: 'Monitoring',
        bg: '#F1F5F9',
        color: '#475569',
        border: '#CBD5E1'
      };
    default:
      return {
        variant: 'neutral',
        label: String(status),
        bg: '#F1F5F9',
        color: '#475569',
        border: '#CBD5E1'
      };
  }
}
