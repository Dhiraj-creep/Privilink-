/**
 * PriviLink Priority Queue Prioritization Engine
 * Implements a deterministic, documented risk prioritization rule:
 * 
 * Hierarchy:
 * 1. Actionability / Status Tier:
 *    - ESCALATED (Rank 4) -> Needs immediate human analyst intervention
 *    - VERIFICATION_REQUESTED (Rank 3) -> Step-up KYC active, awaiting clearance
 *    - PENDING_REVIEW / MONITORING (Rank 2) -> Surveillance / Sub-threshold monitoring
 *    - RESOLVED / CLEARED (Rank 1) -> Demoted to bottom so they do NOT crowd out active cases
 * 
 * 2. Risk Severity Level:
 *    - HIGH / CRITICAL (Rank 3)
 *    - MEDIUM / MODERATE (Rank 2)
 *    - LOW (Rank 1)
 *    - UNKNOWN (Rank 0)
 * 
 * 3. Composite Risk Score / Probability:
 *    - Descending numeric magnitude (e.g. 98.4 > 74.0 > 42.0)
 * 
 * 4. Stable Deterministic Tie-Breaker:
 *    - Lexicographical ascending sort on Case ID (e.g. "CASE-10482" < "CASE-10503")
 */

const STATUS_RANKS = {
  ESCALATED: 4,
  VERIFICATION_REQUESTED: 3,
  IN_REVIEW: 3,
  PENDING_REVIEW: 2,
  MONITORING: 2,
  RESOLVED: 1,
  CLEARED: 1
};

const RISK_RANKS = {
  CRITICAL: 3,
  HIGH: 3,
  MEDIUM: 2,
  MODERATE: 2,
  LOW: 1
};

export function getStatusRank(status) {
  if (!status) return 0;
  const norm = String(status).trim().toUpperCase();
  return STATUS_RANKS[norm] ?? 0;
}

export function getRiskRank(riskLevel) {
  if (!riskLevel) return 0;
  const norm = String(riskLevel).trim().toUpperCase();
  return RISK_RANKS[norm] ?? 0;
}

export function isActionableCase(c) {
  if (!c) return false;
  const norm = String(c.status || '').trim().toUpperCase();
  return norm !== 'RESOLVED' && norm !== 'CLEARED';
}

/**
 * Compare two cases according to the deterministic priority rule.
 * Returns negative if a should come before b, positive if b should come before a.
 */
export function compareCasesByPriority(a, b) {
  // 1. Status tier (actionable cases first)
  const aStatus = getStatusRank(a.status);
  const bStatus = getStatusRank(b.status);
  if (aStatus !== bStatus) {
    return bStatus - aStatus; // Higher status rank first
  }

  // 2. Risk severity
  const aRisk = getRiskRank(a.riskLevel);
  const bRisk = getRiskRank(b.riskLevel);
  if (aRisk !== bRisk) {
    return bRisk - aRisk; // Higher risk first
  }

  // 3. Composite Risk Score
  const aScore = Number(a.score ?? a.confidence ?? 0);
  const bScore = Number(b.score ?? b.confidence ?? 0);
  if (aScore !== bScore) {
    return bScore - aScore; // Higher score first
  }

  // 4. Stable tie-breaker: Case ID
  const aId = String(a.id || '');
  const bId = String(b.id || '');
  return aId.localeCompare(bId);
}

/**
 * Returns prioritized cases list.
 * @param {Array} cases - Raw cases array
 * @param {Object} options - { requireActionable: boolean }
 * @returns {Array} Sorted cases
 */
export function prioritizeCases(cases = [], { requireActionable = false } = {}) {
  if (!Array.isArray(cases)) return [];
  const list = requireActionable ? cases.filter(isActionableCase) : [...cases];
  return list.sort(compareCasesByPriority);
}

/**
 * Returns the top N prioritized cases for executive priority queue display.
 * Ensures active unresolved cases are always preferred over resolved ones.
 */
export function getPriorityQueue(cases = [], limit = 5) {
  if (!Array.isArray(cases) || cases.length === 0) return [];
  const sorted = prioritizeCases(cases);
  return sorted.slice(0, limit);
}
