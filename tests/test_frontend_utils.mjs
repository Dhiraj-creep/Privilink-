import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  formatNumber, 
  formatPercent, 
  formatScaledPercent, 
  formatRatioAsPercent, 
  formatMetric, 
  formatRiskScore,
  getRiskVariant, 
  getStatusVariant 
} from '../src/utils/formatters.js';

import {
  prioritizeCases,
  getPriorityQueue,
  compareCasesByPriority
} from '../src/utils/priorityQueue.js';

test('formatPercent handles explicit ratios vs scaled numbers without guessing', () => {
  // 0.005 as a ratio -> 0.5%
  assert.equal(formatRatioAsPercent(0.005, 1), '0.5%');
  assert.equal(formatPercent(0.005, { isRatio: true, decimals: 1 }), '0.5%');
  assert.equal(formatPercent(0.005, 1, true), '0.5%');

  // 0.5 as an already-scaled percentage -> 0.5%
  assert.equal(formatScaledPercent(0.5, 1), '0.5%');
  assert.equal(formatPercent(0.5, { isRatio: false, decimals: 1 }), '0.5%');
  assert.equal(formatPercent(0.5, 1, false), '0.5%');

  // 1 as an already-scaled percentage -> 1.0%
  assert.equal(formatScaledPercent(1, 1), '1.0%');
  assert.equal(formatScaledPercent(1, 0), '1%');
  assert.equal(formatPercent(1, { isRatio: false, decimals: 0 }), '1%');

  // Zero respects requested precision
  assert.equal(formatScaledPercent(0, 0), '0%');
  assert.equal(formatScaledPercent(0, 1), '0.0%');
  assert.equal(formatPercent(0, { decimals: 2 }), '0.00%');

  // Missing and invalid values display appropriate placeholder
  assert.equal(formatPercent(null), '—');
  assert.equal(formatPercent(undefined), '—');
  assert.equal(formatPercent(NaN), '—');
  assert.equal(formatPercent(Infinity), '—');
  assert.equal(formatScaledPercent(null, 1, 'N/A'), 'N/A');
});

test('formatNumber and formatMetric edge cases', () => {
  assert.equal(formatNumber(0, 0), '0');
  assert.equal(formatNumber(0, 2), '0.00');
  assert.equal(formatNumber(1250000, 0), '1,250,000');
  assert.equal(formatNumber(null), '—');

  assert.equal(formatMetric(0, 3), '0.000');
  assert.equal(formatMetric(0.71234, 2), '0.71');
  assert.equal(formatMetric(null), '—');

  assert.equal(formatRiskScore(98.4), '98%');
  assert.equal(formatRiskScore(0), '0%');
  assert.equal(formatRiskScore(null), '—');
});

test('getRiskVariant and getStatusVariant prevent unknown values from defaulting incorrectly', () => {
  const high = getRiskVariant('HIGH');
  assert.equal(high.variant, 'danger');
  assert.equal(high.label, 'HIGH');

  const low = getRiskVariant('LOW');
  assert.equal(low.variant, 'success');
  assert.equal(low.label, 'LOW');

  // Unknown or missing must return neutral UNKNOWN
  const unknown = getRiskVariant('UNKNOWN');
  assert.equal(unknown.variant, 'neutral');
  assert.equal(unknown.label, 'UNKNOWN');

  const empty = getRiskVariant(null);
  assert.equal(empty.variant, 'neutral');
  assert.equal(empty.label, 'UNKNOWN');

  const invalid = getRiskVariant('NONSENSE');
  assert.equal(invalid.variant, 'neutral');
  assert.equal(invalid.label, 'UNKNOWN');

  // Status variants
  assert.equal(getStatusVariant('ESCALATED').variant, 'danger');
  assert.equal(getStatusVariant('VERIFICATION_REQUESTED').variant, 'warning');
  assert.equal(getStatusVariant('RESOLVED').variant, 'success');
  assert.equal(getStatusVariant('MONITORING').variant, 'neutral');
  assert.equal(getStatusVariant('UNKNOWN').variant, 'neutral');
});

test('priorityQueue deterministically ranks cases and demotes resolved cases', () => {
  const sampleCases = [
    { id: 'CASE-001', riskLevel: 'LOW', score: 20, status: 'MONITORING' },
    { id: 'CASE-002', riskLevel: 'HIGH', score: 95, status: 'RESOLVED' }, // Resolved, should sink below active
    { id: 'CASE-003', riskLevel: 'HIGH', score: 98, status: 'ESCALATED' }, // Escalated, should be #1
    { id: 'CASE-004', riskLevel: 'HIGH', score: 85, status: 'VERIFICATION_REQUESTED' }, // Verification active
    { id: 'CASE-005', riskLevel: 'MEDIUM', score: 55, status: 'MONITORING' },
    { id: 'CASE-006', riskLevel: 'HIGH', score: 75, status: 'ESCALATED' } // Escalated, lower score than CASE-003
  ];

  const queue = getPriorityQueue(sampleCases, 6);

  // #1 should be CASE-003 (ESCALATED, HIGH risk, score 98)
  assert.equal(queue[0].id, 'CASE-003');
  // #2 should be CASE-006 (ESCALATED, HIGH risk, score 75)
  assert.equal(queue[1].id, 'CASE-006');
  // #3 should be CASE-004 (VERIFICATION_REQUESTED)
  assert.equal(queue[2].id, 'CASE-004');
  // #4 should be CASE-005 (MONITORING, MEDIUM)
  assert.equal(queue[3].id, 'CASE-005');
  // #5 should be CASE-001 (MONITORING, LOW)
  assert.equal(queue[4].id, 'CASE-001');
  // #6 should be CASE-002 (RESOLVED, demoted to bottom despite score 95)
  assert.equal(queue[5].id, 'CASE-002');

  // Direct prioritizeCases and compareCasesByPriority checks
  const allPrioritized = prioritizeCases(sampleCases);
  assert.equal(allPrioritized.length, 6);
  assert.ok(compareCasesByPriority(sampleCases[2], sampleCases[0]) < 0);
  assert.ok(compareCasesByPriority(sampleCases[1], sampleCases[2]) > 0);
});
