import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  Sparkles,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RISK_CASES } from '../data/syntheticData';
import { getRiskVariant, getStatusVariant, formatNumber, formatRiskScore } from '../utils/formatters';
import { getRiskRank } from '../utils/priorityQueue';

export default function CollaborativeRiskView({ onSelectCase, casesList = [] }) {
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('score'); // 'score' | 'id' | 'risk' | 'status'
  const [sortAsc, setSortAsc] = useState(false);

  const activeCases = Array.isArray(casesList) ? casesList : RISK_CASES;

  // Real counts derived directly from data
  const highCount = activeCases.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
  const mediumCount = activeCases.filter(c => c.riskLevel === 'MEDIUM' || c.riskLevel === 'MODERATE').length;
  const lowCount = activeCases.filter(c => c.riskLevel === 'LOW').length;

  const filteredAndSortedCases = useMemo(() => {
    const filtered = activeCases.filter(c => {
      const matchesRisk = filterRisk === 'ALL' || c.riskLevel === filterRisk;
      const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
      const s = searchTerm.toLowerCase().trim();
      const matchesSearch = !s ||
        c.id.toLowerCase().includes(s) ||
        (c.customerId || '').toLowerCase().includes(s) ||
        (c.entityRef || '').toLowerCase().includes(s) ||
        (c.action || '').toLowerCase().includes(s) ||
        (c.explanation || '').toLowerCase().includes(s);

      return matchesRisk && matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        const aScore = Number(a.score ?? a.confidence ?? 0);
        const bScore = Number(b.score ?? b.confidence ?? 0);
        comparison = aScore - bScore;
      } else if (sortField === 'risk') {
        comparison = getRiskRank(a.riskLevel) - getRiskRank(b.riskLevel);
      } else if (sortField === 'status') {
        comparison = String(a.status || '').localeCompare(String(b.status || ''));
      } else {
        comparison = String(a.id || '').localeCompare(String(b.id || ''));
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [activeCases, filterRisk, filterStatus, searchTerm, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending
    }
  };

  const resetFilters = () => {
    setFilterRisk('ALL');
    setFilterStatus('ALL');
    setSearchTerm('');
    setSortField('score');
    setSortAsc(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="tm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="tm-page-title">Risk Cases & Multi-Institution Inquiries</h1>
            <Badge variant="primary" size="sm">
              {formatNumber(activeCases.length)} Cases Active
            </Badge>
          </div>
          <p className="tm-page-desc">
            Collaborative systemic risk detection identifying entities where independent institution signals remain weak or sub-threshold.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            const case10482 = activeCases.find(c => c.id === 'CASE-10482') || activeCases[0];
            onSelectCase(case10482);
          }}
          icon={<Sparkles size={14} />}
          iconRight={<ArrowRight size={14} />}
          aria-label="Inspect Benchmark Case CASE-10482"
        >
          Inspect Benchmark CASE-10482
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Left: Search & Risk Pills */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', width: '100%', maxWidth: '820px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search ID, customer ref, entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search cases"
                style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
              />
            </div>

            {/* Risk Tier Segmented Pills */}
            <div className="tm-tabs-nav">
              <button
                onClick={() => setFilterRisk('ALL')}
                className={`tm-tab-button ${filterRisk === 'ALL' ? 'active' : ''}`}
                aria-label="Filter all risk levels"
              >
                All ({activeCases.length})
              </button>
              <button
                onClick={() => setFilterRisk('HIGH')}
                className={`tm-tab-button ${filterRisk === 'HIGH' ? 'active' : ''}`}
                style={{ color: filterRisk === 'HIGH' ? 'var(--status-danger)' : undefined }}
                aria-label="Filter high risk cases"
              >
                High ({highCount})
              </button>
              <button
                onClick={() => setFilterRisk('MEDIUM')}
                className={`tm-tab-button ${filterRisk === 'MEDIUM' ? 'active' : ''}`}
                style={{ color: filterRisk === 'MEDIUM' ? 'var(--status-warning)' : undefined }}
                aria-label="Filter medium risk cases"
              >
                Medium ({mediumCount})
              </button>
              <button
                onClick={() => setFilterRisk('LOW')}
                className={`tm-tab-button ${filterRisk === 'LOW' ? 'active' : ''}`}
                style={{ color: filterRisk === 'LOW' ? 'var(--status-success)' : undefined }}
                aria-label="Filter low risk cases"
              >
                Low ({lowCount})
              </button>
            </div>

            {/* Status Filter Select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by case status"
              style={{ height: '34px', fontSize: '12px', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', backgroundColor: '#FFFFFF' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ESCALATED">Escalated</option>
              <option value="VERIFICATION_REQUESTED">Verification Active</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESOLVED">Resolved / Cleared</option>
            </select>
          </div>

          {/* Right: Showing Count & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredAndSortedCases.length}</strong> of {activeCases.length}
            </span>
            {(filterRisk !== 'ALL' || filterStatus !== 'ALL' || searchTerm || sortField !== 'score') && (
              <Button variant="ghost" size="xs" onClick={resetFilters} icon={<RotateCcw size={11} />} aria-label="Reset all filters">
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Cases Table */}
      <Card style={{ padding: 0 }}>
        {filteredAndSortedCases.length === 0 ? (
          <div className="tm-empty-state">
            <div className="tm-empty-state-icon">
              <Search size={20} />
            </div>
            <h3 className="tm-empty-state-title">No risk cases found</h3>
            <p className="tm-empty-state-desc">
              No cases match your active filters or search terms. Try clearing the query or adjusting your risk filters.
            </p>
            <div style={{ marginTop: '16px' }}>
              <Button variant="outline" size="sm" onClick={resetFilters} aria-label="Clear active filters">
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="tm-table-container" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table className="tm-table">
              <thead>
                <tr>
                  <th style={{ width: '130px', cursor: 'pointer' }} onClick={() => toggleSort('id')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Case ID <ArrowUpDown size={12} color="var(--text-muted)" />
                    </span>
                  </th>
                  <th>Customer Ref</th>
                  <th>Entity Token</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('risk')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Risk Level <ArrowUpDown size={12} color="var(--text-muted)" />
                    </span>
                  </th>
                  <th className="col-num" style={{ width: '110px', cursor: 'pointer' }} onClick={() => toggleSort('score')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      Risk Score <ArrowUpDown size={12} color="var(--text-muted)" />
                    </span>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Status <ArrowUpDown size={12} color="var(--text-muted)" />
                    </span>
                  </th>
                  <th>Recommended Action</th>
                  <th style={{ textAlign: 'right', width: '110px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCases.map((c) => {
                  const riskProps = getRiskVariant(c.riskLevel);
                  const statusProps = getStatusVariant(c.status);
                  const scoreVal = c.score !== undefined ? c.score : c.confidence;

                  return (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectCase(c)}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {c.id}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {c.customerId}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-muted)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-default)'
                        }}>
                          {c.entityRef || 'ENTITY-TOKEN'}
                        </span>
                      </td>
                      <td>
                        <Badge variant={riskProps.variant} size="sm">
                          {riskProps.label}
                        </Badge>
                      </td>
                      <td className="cell-num" style={{ fontWeight: 600, fontSize: '13px' }}>
                        {formatRiskScore(scoreVal)}
                      </td>
                      <td>
                        <Badge variant={statusProps.variant} size="sm">
                          {statusProps.label}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {c.action || 'Standard monitoring'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                          }}
                          iconRight={<ArrowRight size={11} />}
                          aria-label={`Investigate case ${c.id}`}
                        >
                          Investigate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
