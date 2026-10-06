import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { RISK_CASES } from '../data/syntheticData';

export default function CollaborativeRiskView({ onSelectCase, casesList }) {
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const activeList = (casesList && casesList.length > 0) ? casesList : RISK_CASES;

  const filteredCases = activeList.filter(c => {
    const matchesFilter = filterRisk === 'ALL' || c.riskLevel === filterRisk;
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.collaborativeSignal || c.explanation || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title & Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Collaborative Risk Intelligence
            </h1>
            <span className="badge badge-primary">Active Cases (1,284)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Identifying multi-institution risk patterns where individual institutional signals remain weak or inconclusive.
          </p>
        </div>

        <button 
          onClick={() => {
            const case10482 = RISK_CASES.find(c => c.id === 'CASE-10482');
            onSelectCase(case10482);
          }}
          className="btn btn-primary btn-sm"
          style={{ backgroundColor: 'var(--primary-dark)' }}
        >
          <Sparkles size={14} color="var(--muted-sage)" />
          <span>Inspect Benchmark CASE-10482</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Differentiator Callout Banner */}
      <div style={{
        backgroundColor: 'var(--sage-light)',
        border: '1px solid var(--sage-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-dark)',
            color: 'var(--muted-sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Layers size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-dark)' }}>
              How Collaborative Risk Works:
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              No single institution has sufficient evidence to flag an inquiry. TRUSTMESH aggregates privacy-preserving 
              representations to uncover correlated stress without leaking underlying bank, insurance, or loan records.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '270px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search by Case ID, Pseudonym..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  fontSize: '0.785rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Risk Tier:</span>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(tier => (
                <button
                  key={tier}
                  onClick={() => setFilterRisk(tier)}
                  className={`btn btn-sm ${filterRisk === tier ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.725rem'
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredCases.length}</strong> of <strong>{RISK_CASES.length}</strong> benchmark cases
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
              <tr>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Case ID</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Risk Level</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Local Signals</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Collaborative Signal</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Confidence</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Recommended Action</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Privacy Status</th>
                <th style={{ padding: '13px 18px', fontWeight: 600, textAlign: 'right' }}>Investigation</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const isHigh = c.riskLevel === 'HIGH';
                const isMed = c.riskLevel === 'MEDIUM';
                return (
                  <tr 
                    key={c.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: c.id === 'CASE-10482' ? 'var(--warning-light)' : 'var(--bg-surface)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (c.id !== 'CASE-10482') e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      if (c.id !== 'CASE-10482') e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }}
                  >
                    <td style={{ padding: '13px 18px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{c.id}</span>
                        {c.id === 'CASE-10482' && (
                          <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>
                            Key Demo Case
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.715rem', color: 'var(--text-muted)' }}>
                        {c.customerId}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <span className={`badge ${isHigh ? 'badge-danger' : isMed ? 'badge-warning' : 'badge-success'}`}>
                        {c.riskLevel}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px', color: 'var(--text-secondary)' }}>
                      {c.localSignals}
                    </td>

                    <td style={{ padding: '13px 18px', fontWeight: 500, color: isHigh ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                      {c.collaborativeSignal}
                    </td>

                    <td style={{ padding: '13px 18px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.confidence}%
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <span style={{
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isHigh ? 'var(--warning-light)' : 'var(--bg-subtle)',
                        color: isHigh ? 'var(--warning-text)' : 'var(--text-secondary)',
                        border: isHigh ? '1px solid var(--warning-border)' : '1px solid var(--border-light)',
                        fontSize: '0.725rem',
                        fontWeight: 600
                      }}>
                        {c.action}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <Lock size={10} />
                        {c.privacyStatus}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectCase(c)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                      >
                        <span>Investigate</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
