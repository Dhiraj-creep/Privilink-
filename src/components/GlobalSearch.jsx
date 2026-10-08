import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Building2, AlertTriangle, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Badge } from './ui/Badge';
import { getRiskVariant, formatRiskScore } from '../utils/formatters';

const INSTITUTIONS_SEARCH_ITEMS = [
  { id: 'BANK_A', type: 'institution', name: 'Bank A (Retail & Commercial)', desc: 'Port 8001 • Sovereign Repayment Ledger' },
  { id: 'INSURER_B', type: 'institution', name: 'Insurer B (General & Property)', desc: 'Port 8002 • Sovereign Policy Ledger' },
  { id: 'LENDER_C', type: 'institution', name: 'Lender C (Digital & Consumer Credit)', desc: 'Port 8003 • Sovereign Inquiries Ledger' }
];

export default function GlobalSearch({
  cases = [],
  onSelectCase,
  onNavigate,
  isOpen = false,
  onClose,
  mobileMode = false
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 150);
    return () => clearTimeout(handler);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter items
  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) {
      // Default: Top actionable cases and institutions
      const topCases = cases.slice(0, 4).map(c => ({ ...c, type: 'case' }));
      return [...topCases, ...INSTITUTIONS_SEARCH_ITEMS];
    }

    const matchedCases = cases
      .filter(c => {
        const idMatch = c.id?.toLowerCase().includes(q);
        const custMatch = c.customerId?.toLowerCase().includes(q);
        const entityMatch = c.entityRef?.toLowerCase().includes(q);
        const riskMatch = c.riskLevel?.toLowerCase().includes(q);
        const actionMatch = c.action?.toLowerCase().includes(q);
        const expMatch = c.explanation?.toLowerCase().includes(q);
        return idMatch || custMatch || entityMatch || riskMatch || actionMatch || expMatch;
      })
      .slice(0, 6)
      .map(c => ({ ...c, type: 'case' }));

    const matchedInstitutions = INSTITUTIONS_SEARCH_ITEMS.filter(inst => {
      return inst.name.toLowerCase().includes(q) || inst.id.toLowerCase().includes(q);
    });

    return [...matchedCases, ...matchedInstitutions];
  }, [debouncedQuery, cases]);

  // Safely clamp active index within bounds without effect-based state cascading
  const activeIndex = results.length === 0 ? 0 : Math.min(selectedIndex, Math.max(0, results.length - 1));

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    if (onClose) onClose();
  };

  const handleSelect = (item) => {
    if (!item) return;
    setQuery('');
    setSelectedIndex(0);
    if (item.type === 'case') {
      if (onSelectCase) onSelectCase(item);
      if (onNavigate) onNavigate('customer_investigation');
    } else if (item.type === 'institution') {
      if (onNavigate) onNavigate('institutions');
    }
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((activeIndex + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((activeIndex - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search cases and institutions"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
        display: 'flex',
        alignItems: mobileMode ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: mobileMode ? '12px' : '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <Search size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="tm-search-results-list"
            aria-activedescendant={results[activeIndex] ? `search-item-${activeIndex}` : undefined}
            placeholder="Search cases by ID, customer ref, or risk tier..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              aria-label="Clear search query"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={handleClose}
            aria-label="Close search"
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Esc
          </button>
        </div>

        {/* Results Category & List */}
        <div
          ref={listRef}
          id="tm-search-results-list"
          role="listbox"
          style={{
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {!debouncedQuery && (
            <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Suggested & Recent Destinations
            </div>
          )}

          {results.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>No matching cases or institutions found</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Try searching by case ID (e.g. CASE-10482) or risk level (HIGH, MEDIUM)</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              if (item.type === 'case') {
                const riskProps = getRiskVariant(item.riskLevel);
                const scoreDisplay = formatRiskScore(item.score ?? item.confidence);
                return (
                  <div
                    key={`case-${item.id}`}
                    id={`search-item-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <AlertTriangle size={16} color={riskProps.color} style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13px', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {item.id}
                          </strong>
                          <Badge variant={riskProps.variant} size="sm">
                            {riskProps.label}
                          </Badge>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {item.customerId}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.explanation || item.action}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {scoreDisplay}
                      </span>
                      <ArrowRight size={13} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              }

              // Institution Item
              return (
                <div
                  key={`inst-${item.id}`}
                  id={`search-item-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'background-color var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <Building2 size={16} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {item.name}
                      </strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Instructions */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-default)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CornerDownLeft size={11} /> Select to investigate
          </span>
        </div>
      </div>
    </div>
  );
}
