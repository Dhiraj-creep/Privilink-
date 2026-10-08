// TRUSTMESH Synthetic Demonstration Dataset
// Strictly non-PII, synthetic risk indicators and institutional representations

export const INSTITUTIONS = {
  BANK_A: {
    id: 'BANK_A',
    name: 'Bank A (Retail & Commercial)',
    shortName: 'Bank A',
    type: 'Banking Institution',
    status: 'Connected',
    syntheticRecords: 250000,
    localModelStatus: 'Healthy',
    lastUpdate: '42 seconds ago',
    trustScore: 96,
    initialTrustScore: 96,
    anomalyRate: '0.14%',
    complianceStatus: 'Verified (DP-SGD & FedAvg)',
    privateDataSchema: [
      { field: 'repayment_behaviour_ratio', type: 'Float (0.0 - 1.0)', desc: 'On-time debt servicing historical ratio' },
      { field: 'transaction_velocity_anomaly', type: 'Z-Score (-3 to +3)', desc: 'Deviation from 90-day moving average volume' },
      { field: 'account_tenure_months', type: 'Integer (1 - 360)', desc: 'Relationship age in months' },
      { field: 'average_monthly_balance', type: 'Tier (1 - 5)', desc: 'Binned balance liquidity tier' },
      { field: 'payment_consistency_index', type: 'Float (0.0 - 1.0)', desc: 'Payroll and recurring expense regularity' },
      { field: 'inward_outward_ratio', type: 'Float', desc: 'Cashflow net directional velocity' }
    ],
    summaryStats: {
      avgRepaymentRatio: 0.94,
      medianAccountAge: '4.8 years',
      flaggedLocalAnomalies: 312
    }
  },
  INSURER_B: {
    id: 'INSURER_B',
    name: 'Insurer B (General & Property)',
    shortName: 'Insurer B',
    type: 'Insurance Provider',
    status: 'Connected',
    syntheticRecords: 118000,
    localModelStatus: 'Healthy',
    lastUpdate: '58 seconds ago',
    trustScore: 92,
    initialTrustScore: 92,
    anomalyRate: '0.22%',
    complianceStatus: 'Verified (Homomorphic Ciphers)',
    privateDataSchema: [
      { field: 'claim_frequency_rate', type: 'Float (0.0 - 10.0)', desc: 'Claims submitted per 24-month exposure' },
      { field: 'claim_anomaly_score', type: 'Index (0 - 100)', desc: 'Multi-factor policy claim deviation index' },
      { field: 'policy_behaviour_tier', type: 'Enum (Standard, Watch, High)', desc: 'Underwriting risk cohort' },
      { field: 'policy_tenure_days', type: 'Integer', desc: 'Active days under active binder' },
      { field: 'loss_ratio_exposure', type: 'Float (0.0 - 2.5)', desc: 'Cumulative paid loss vs earned premium' }
    ],
    summaryStats: {
      avgClaimFrequency: '0.18 / yr',
      activePolicies: 118000,
      flaggedLocalAnomalies: 184
    }
  },
  LENDER_C: {
    id: 'LENDER_C',
    name: 'Lender C (Digital & Consumer Credit)',
    shortName: 'Lender C',
    type: 'Alternative Lending Platform',
    status: 'Connected',
    syntheticRecords: 184000,
    localModelStatus: 'Healthy',
    lastUpdate: '1 minute ago',
    trustScore: 89,
    initialTrustScore: 89,
    anomalyRate: '0.38%',
    complianceStatus: 'Verified (Secure Aggregation Protocol)',
    privateDataSchema: [
      { field: 'loan_application_velocity', type: 'Count (30-day)', desc: 'Inquiries across affiliated broker channels' },
      { field: 'repayment_stress_indicator', type: 'Index (0 - 100)', desc: 'Short-term debt roll-over pressure' },
      { field: 'borrowing_behaviour_deviation', type: 'Score (0.0 - 1.0)', desc: 'Deviation from expected demographic cohort' },
      { field: 'credit_utilization_trajectory', type: 'Percentage', desc: 'MoM change in revolving line utilization' },
      { field: 'dti_synthetic_band', type: 'Tier (A to E)', desc: 'Estimated debt-to-income leverage tier' }
    ],
    summaryStats: {
      avgUtilization: '41.2%',
      activeFacilities: 184000,
      flaggedLocalAnomalies: 247
    }
  }
};

export const GLOBAL_MODEL_METRICS = {
  round: 27,
  totalRounds: 50,
  participatingNodes: '3 / 3',
  aggregationMethod: 'SecAgg v2.1 + Robust FedMedian',
  differentialPrivacy: {
    status: 'Enabled',
    epsilon: 1.5,
    delta: '1e-5',
    clipNorm: 1.0,
    noiseMechanism: 'Gaussian Mechanism'
  },
  driftStatus: 'Normal (Wasserstein distance: 0.038)',
  globalMetrics: {
    precision: 0.84,
    recall: 0.79,
    f1Score: 0.81,
    prAuc: 0.87,
    rocAuc: 0.91
  },
  localMetricsComparison: [
    {
      institution: 'Bank A (Local Model Only)',
      features: 'Repayment & Transaction only',
      prAuc: 0.72,
      f1Score: 0.69,
      weakness: 'Blind to insurance claim stress & fast loan stacking'
    },
    {
      institution: 'Insurer B (Local Model Only)',
      features: 'Claims & Policy only',
      prAuc: 0.68,
      f1Score: 0.65,
      weakness: 'Blind to banking overdrafts & external credit applications'
    },
    {
      institution: 'Lender C (Local Model Only)',
      features: 'Credit inquiries & Bureau only',
      prAuc: 0.70,
      f1Score: 0.67,
      weakness: 'Blind to real-time payroll stability & insurance losses'
    },
    {
      institution: 'TRUSTMESH Collaborative Model',
      features: 'Unified Privacy-Preserving Risk Representations',
      prAuc: 0.87,
      f1Score: 0.81,
      weakness: 'None (Cross-institution multi-signal synthesis)'
    }
  ]
};

export const RISK_CASES = [
  {
    id: 'CASE-10482',
    customerId: 'CUSTOMER-10482',
    entityRef: 'ENTITY-7F21',
    riskLevel: 'MEDIUM',
    localSignals: '3 weak signals',
    collaborativeSignal: 'Cross-institution pattern candidate',
    confidence: 42,
    score: 42,
    action: 'Standard monitoring',
    status: 'PENDING_REVIEW',
    privacyStatus: 'Protected',
    lastEscalation: '14 mins ago',
    explanation: 'Independent indicators slightly deviated from rolling baseline; collaborative threshold not yet reached.',
    localEvidence: {
      bank: {
        signalText: 'Repayment behaviour changed slightly.',
        severity: 'Weak / Moderate (Score: 0.42)',
        detail: 'Mild variance in usual payment date (+6 days), but still within standard grace window.'
      },
      insurer: {
        signalText: 'Privacy-preserving external signal received.',
        severity: 'Weak / Inconclusive (Score: 0.38)',
        detail: 'Recent first-time claim submission following policy update, borderline deviation score.'
      },
      lender: {
        signalText: 'Borrowing behaviour differs from historical baseline.',
        severity: 'Weak / Emerging (Score: 0.45)',
        detail: 'Two short-term facility inquiries within 14 days; standalone lender threshold not breached.'
      }
    },
    collaborativeSynthesis: 'Individually, none of the 3 institutions held sufficient basis for escalation. Standard monitoring active until collaborative synthesis is executed.',
    contributions: [
      { name: 'Local financial behaviour', score: 35, color: '#12372A' },
      { name: 'Cross-institution signal alignment', score: 28, color: '#2F6B4F' },
      { name: 'Borrowing behaviour deviation', score: 37, color: '#8FAF9D' }
    ],
    minimumDisclosure: {
      disclosedToAnalyst: [
        'Composite Risk Score: MEDIUM (Confidence: 42%)',
        'Primary Archetype: Cross-institution baseline monitoring',
        'Recommended Protocol: Automated surveillance / standard review'
      ],
      strictlyProtected: [
        'Customer Legal Name, National ID, Phone, Email, Residential Address',
        'Specific Bank Account numbers, exact transactional counter-parties and balances',
        'Insurer claim documentation, medical/property details, policy payout amounts',
        'Lending contract agreements, specific repayment calendar dates, employer references'
      ]
    }
  },
  {
    id: 'CASE-10491',
    customerId: 'CUSTOMER-10491',
    entityRef: 'ENTITY-3A09',
    riskLevel: 'LOW',
    localSignals: 'Normal',
    collaborativeSignal: 'No anomaly',
    score: 12,
    confidence: 96,
    action: 'Normal processing',
    privacyStatus: 'Protected',
    lastEscalation: '14 mins ago',
    explanation: 'All institutions reflect baseline transactional and underwriting consistency.',
    localEvidence: {
      bank: { signalText: 'Repayment regular, liquidity healthy.', severity: 'Normal', detail: 'Consistent deposits.' },
      insurer: { signalText: 'Zero recent claim activities.', severity: 'Normal', detail: 'Tenured policyholder.' },
      lender: { signalText: 'Zero unusual credit inquiries.', severity: 'Normal', detail: 'Low debt utilization.' }
    },
    collaborativeSynthesis: 'No cross-institutional stress vectors detected. Case clears automated baseline with high confidence.',
    contributions: [
      { name: 'Local financial behaviour', score: 70, color: '#3F7D5A' },
      { name: 'Cross-institution consistency', score: 20, color: '#2F6B4F' },
      { name: 'Historical stability', score: 10, color: '#8FAF9D' }
    ],
    minimumDisclosure: {
      disclosedToAnalyst: ['Composite Risk Score: LOW (Risk Score: 12%, Confidence: 96%)', 'Workflow: Automated straight-through pass'],
      strictlyProtected: ['All underlying account identifiers and operational logs']
    }
  },
  {
    id: 'CASE-10503',
    customerId: 'CUSTOMER-10503',
    entityRef: 'ENTITY-9D44',
    riskLevel: 'MEDIUM',
    localSignals: '2 weak signals',
    collaborativeSignal: 'Behavioural deviation',
    score: 52,
    confidence: 74,
    action: 'Additional verification',
    privacyStatus: 'Protected',
    lastEscalation: '26 mins ago',
    explanation: 'Bank deposit velocity drop paired with lender credit utilization escalation.',
    localEvidence: {
      bank: { signalText: 'Deposit regularity softened.', severity: 'Moderate (0.51)', detail: 'Intermittent income cadence.' },
      insurer: { signalText: 'No anomalous claim records.', severity: 'Normal', detail: 'Stable auto policy.' },
      lender: { signalText: 'Credit utilization climbed from 22% to 68%.', severity: 'Moderate (0.55)', detail: 'Short-term liquidity need.' }
    },
    collaborativeSynthesis: 'Moderate dual-vector signal. Does not warrant hard block, but flags potential debt-service strain.',
    contributions: [
      { name: 'Credit utilization trajectory', score: 40, color: '#C58A32' },
      { name: 'Cashflow regularity index', score: 38, color: '#12372A' },
      { name: 'Cross-institution correlation', score: 22, color: '#2F6B4F' }
    ],
    minimumDisclosure: {
      disclosedToAnalyst: ['Composite Risk Score: MEDIUM (Risk Score: 52%, Confidence: 74%)', 'Recommendation: Secondary liquidity review'],
      strictlyProtected: ['Exact income deposits, statement PDFs, credit card statements']
    }
  },
  {
    id: 'CASE-10518',
    customerId: 'CUSTOMER-10518',
    entityRef: 'ENTITY-5B12',
    riskLevel: 'LOW',
    localSignals: 'Normal',
    collaborativeSignal: 'No anomaly',
    score: 14,
    confidence: 94,
    action: 'Normal processing',
    privacyStatus: 'Protected',
    lastEscalation: '35 mins ago',
    explanation: 'Isolated single inquiry at lender; bank and insurer indicate strong multi-year stability.',
    localEvidence: {
      bank: { signalText: 'Prime payroll stability.', severity: 'Normal', detail: 'Stable tier-1 balance.' },
      insurer: { signalText: 'Tenured policy, 0 claims in 36m.', severity: 'Normal', detail: 'Low risk tier.' },
      lender: { signalText: 'Single mortgage pre-approval check.', severity: 'Normal', detail: 'Single inquiry.' }
    },
    collaborativeSynthesis: 'Benign standard activity pattern verified across network.',
    contributions: [
      { name: 'Historical stability', score: 65, color: '#3F7D5A' },
      { name: 'Cross-institution validation', score: 35, color: '#2F6B4F' }
    ],
    minimumDisclosure: {
      disclosedToAnalyst: ['Composite Risk Score: LOW (Risk Score: 14%, Confidence: 94%)', 'Clearance: Automated'],
      strictlyProtected: ['Mortgage property appraisal details and personal financial records']
    }
  },
  {
    id: 'CASE-10522',
    customerId: 'CUSTOMER-10522',
    entityRef: 'ENTITY-8E66',
    riskLevel: 'HIGH',
    localSignals: '3 weak signals',
    collaborativeSignal: 'Rapid cross-entity multi-exposure',
    score: 89,
    confidence: 92,
    action: 'Enhanced verification',
    privacyStatus: 'Protected',
    lastEscalation: '48 mins ago',
    explanation: 'Simultaneous small claims submission, newly opened secondary loan, and account withdrawal surge.',
    localEvidence: {
      bank: { signalText: 'Rapid capital reallocation.', severity: 'Weak/Moderate', detail: 'Higher than normal wire volume.' },
      insurer: { signalText: 'New claim filed 12 days after endorsement.', severity: 'Weak', detail: 'Edge-case timeline.' },
      lender: { signalText: 'Second consumer credit application.', severity: 'Weak', detail: 'Parallel inquiry.' }
    },
    collaborativeSynthesis: 'Clear bust-out or simultaneous stress vulnerability detected only when combining all 3 nodes.',
    contributions: [
      { name: 'Cross-institution signal alignment', score: 42, color: '#B64A45' },
      { name: 'Temporal velocity deviation', score: 31, color: '#C58A32' },
      { name: 'Local banking anomaly', score: 27, color: '#12372A' }
    ],
    minimumDisclosure: {
      disclosedToAnalyst: ['Composite Risk Score: HIGH (Risk Score: 89%, Confidence: 92%)', 'Flag: Multi-institution velocity burst'],
      strictlyProtected: ['Personal names, bank wire recipients, vehicle registration data']
    }
  },
  {
    id: 'CASE-10530',
    customerId: 'CUSTOMER-10530',
    entityRef: 'ENTITY-1C77',
    riskLevel: 'MEDIUM',
    localSignals: '1 moderate signal',
    collaborativeSignal: 'Localized variance',
    score: 48,
    confidence: 72,
    action: 'Standard monitoring',
    privacyStatus: 'Protected',
    lastEscalation: '1 hour ago',
    explanation: 'Insurer reports property claim after regional weather event; bank and lender reflect normal profile.',
    localEvidence: {
      bank: { signalText: 'Normal balance and repayments.', severity: 'Normal', detail: 'Standard payroll deposits.' },
      insurer: { signalText: 'Weather catastrophe claim registered.', severity: 'Moderate', detail: 'Zipcode group event.' },
      lender: { signalText: 'Zero new applications.', severity: 'Normal', detail: 'Low debt balance.' }
    },
    collaborativeSynthesis: 'Local insurance claim matches broader macro weather cluster. Non-adversarial variance.',
    contributions: [
      { name: 'Macro-environmental correlation', score: 55, color: '#12372A' },
      { name: 'Baseline stability validation', score: 45, color: '#3F7D5A' }
    ],
    minimumDisclosure: {
      disclosedToAnalyst: ['Composite Risk Score: MEDIUM (Risk Score: 48%, Confidence: 72%)', 'Action: Continue baseline telemetry'],
      strictlyProtected: ['Insured property address, adjuster notes, photos']
    }
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-9921',
    timestamp: '09:41:12',
    date: '2026-09-26',
    event: 'Local model update generated',
    institution: 'BANK A',
    privacyStatus: 'Protected (DP ε=1.5)',
    result: 'Accepted (Norm: 0.82)',
    hash: '0x8f2a...c31b',
    fullHash: '0x8f2a93c31b41d2077e6f8b1a8902cd3401fae94819d9b62a048291be83c411aa'
  },
  {
    id: 'LOG-9922',
    timestamp: '09:41:18',
    date: '2026-09-26',
    event: 'Secure aggregation completed',
    institution: 'TRUSTMESH Aggregator',
    privacyStatus: 'Zero-Knowledge Blind Aggregation',
    result: 'Success (Round 27 consolidated)',
    hash: '0x14d0...e98a',
    fullHash: '0x14d08e98a24c56890f1244e8bc1a340b92e761df89ab321c10928374a5f6e7d8'
  },
  {
    id: 'LOG-9923',
    timestamp: '09:42:03',
    date: '2026-09-26',
    event: 'Risk signal received',
    institution: 'INSURER B',
    privacyStatus: 'Protected (Encrypted representation)',
    result: 'Accepted (Cosine similarity: 0.94)',
    hash: '0x99c2...7a4f',
    fullHash: '0x99c27a4f91e84013bcda4921ef583091c78103bb29df4021234567890abcdef1'
  },
  {
    id: 'LOG-9924',
    timestamp: '09:42:25',
    date: '2026-09-26',
    event: 'Collaborative anomaly escalated',
    institution: 'TRUSTMESH Network',
    privacyStatus: 'Minimum Disclosure Rule Applied',
    result: 'CASE-10482 Flagged (Confidence: 87%)',
    hash: '0x55e1...99bc',
    fullHash: '0x55e199bc48d902187f34ac9910d48bc3a08891cf23ba4019a8b7c6d5e4f3a2b1'
  },
  {
    id: 'LOG-9925',
    timestamp: '09:43:11',
    date: '2026-09-26',
    event: 'Participant health verification',
    institution: 'LENDER C',
    privacyStatus: 'Differential Privacy Check',
    result: 'Passed (Gradient variance nominal)',
    hash: '0x77b3...01cd',
    fullHash: '0x77b301cd4912ab8e6701f298c41098bca48911de398fa2019988776655443322'
  }
];

// Helper to generate realistic synthetic sample rows for local inspection (including benchmark id 10482)
export function generateLocalSampleRows(institutionId) {
  const rows = [];
  const count = 85;
  
  for (let i = 1; i <= count; i++) {
    const idNum = 10400 + i;
    if (institutionId === 'BANK_A') {
      rows.push({
        id: `B-${idNum}`,
        customerRef: `CUST-${idNum}`,
        repaymentRatio: (0.75 + (Math.sin(i * 1.7) * 0.22)).toFixed(2),
        velocityAnomaly: (Math.sin(i * 0.8) * 1.8).toFixed(1),
        accountAgeMonths: Math.floor(12 + (i * 4.5) % 120),
        monthlyBalanceTier: `Tier ${(i % 5) + 1}`,
        consistencyIndex: (0.60 + ((i * 3) % 40) / 100).toFixed(2),
        localFlag: i === 82 ? 'Weak Anomaly' : (i % 14 === 0 ? 'Watch' : 'Normal')
      });
    } else if (institutionId === 'INSURER_B') {
      rows.push({
        id: `I-${idNum}`,
        customerRef: `CUST-${idNum}`,
        claimFrequency: (0.05 + ((i % 5) * 0.4)).toFixed(2),
        claimAnomalyScore: Math.floor(10 + (Math.sin(i * 2.1) * 35 + 35)),
        policyTier: i % 7 === 0 ? 'Watch' : (i % 19 === 0 ? 'High' : 'Standard'),
        policyDays: Math.floor(90 + (i * 37) % 1800),
        lossRatio: (0.15 + ((i % 8) * 0.18)).toFixed(2),
        localFlag: i === 82 ? 'Weak Anomaly' : (i % 11 === 0 ? 'Review' : 'Normal')
      });
    } else {
      rows.push({
        id: `L-${idNum}`,
        customerRef: `CUST-${idNum}`,
        loanAppCount: (i % 4),
        repaymentStress: Math.floor(15 + (Math.cos(i * 1.4) * 30 + 35)),
        borrowingDeviation: (0.2 + ((i % 9) * 0.08)).toFixed(2),
        creditUtilization: `${Math.floor(20 + ((i * 7) % 65))}%`,
        dtiBand: ['Tier A', 'Tier B', 'Tier C', 'Tier D', 'Tier E'][i % 5],
        localFlag: i === 82 ? 'Weak Anomaly' : (i % 9 === 0 ? 'Elevated' : 'Normal')
      });
    }
  }
  return rows;
}
