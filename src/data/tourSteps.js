export const TOUR_STEPS = [
  {
    step: 1,
    tab: 'overview',
    title: 'Fragmented Institutional Visibility',
    speakerPitch: 'In the traditional ecosystem, each financial institution sees only a small, isolated fragment of a customer’s true risk exposure.',
    takeaway: 'Bank A sees repayment consistency, Insurer B sees claims, Lender C sees credit inquiries. None can legally or ethically share their customer databases.',
    badge: 'Step 1 of 10 • Problem Definition'
  },
  {
    step: 2,
    tab: 'institutions',
    title: 'Zero Raw Data Sharing (Data Stays Local)',
    speakerPitch: 'Look at Bank A, Insurer B, and Lender C. Each node maintains its own private schema and 250,000+ local records. Notice the strict privacy boundary.',
    takeaway: 'Raw customer records stay 100% on-premise behind institution firewalls. Raw records shared: exactly ZERO.',
    badge: 'Step 2 of 10 • Local Architecture'
  },
  {
    step: 3,
    tab: 'collaborative_risk',
    title: 'Isolated Weak Signals',
    speakerPitch: 'When we inspect Case-10482 in isolation, Bank A sees a minor delay, Insurer B sees a minor claim, and Lender C sees an ordinary inquiry. None of these trigger an alarm alone.',
    takeaway: 'Each institution holds only an inconclusive weak signal. Fraudsters exploit this exact blind spot to conduct bust-outs and stacking.',
    badge: 'Step 3 of 10 • The Blind Spot'
  },
  {
    step: 4,
    tab: 'simulation_lab',
    title: 'Run Cross-Institution Synthesis',
    speakerPitch: 'Click "RUN CROSS-INSTITUTION ANOMALY" in our Simulation Lab. Watch local models compute privacy-preserving representations and initiate blind secure aggregation.',
    takeaway: 'Only mathematical weights and differentially private embeddings are transmitted — no names, transactions, or account numbers.',
    badge: 'Step 4 of 10 • Federated Aggregation'
  },
  {
    step: 5,
    tab: 'collaborative_risk',
    title: 'Collaborative Risk Escalation',
    speakerPitch: 'Case-10482 immediately escalates to HIGH RISK (87% confidence). Why? Because 3 independent weak signals aligned across the institution network!',
    takeaway: 'The system achieves detection power far superior to any individual bank without ever exposing customer records.',
    badge: 'Step 5 of 10 • Signal Synthesis'
  },
  {
    step: 6,
    tab: 'customer_investigation',
    title: 'Explainable Decision Support',
    speakerPitch: 'Under Customer Investigation, see the explainability contribution chart. It tells the analyst WHY it escalated: "Multiple independent signals aligned."',
    takeaway: 'We recommend Step-Up Verification — empowering human analysts with decision-support rather than a black-box autonomous rejection.',
    badge: 'Step 6 of 10 • Explainability'
  },
  {
    step: 7,
    tab: 'privacy_center',
    title: 'Minimum Necessary Disclosure & Zero Data Proof',
    speakerPitch: 'In the Privacy Center, inspect the disclosure boundary. What did other institutions learn? Only a composite risk vector. Not customer names, accounts, or claims.',
    takeaway: 'The Differential Privacy slider demonstrates the mathematical guarantee: tuning privacy budget ε against model utility.',
    badge: 'Step 7 of 10 • Privacy Guarantees'
  },
  {
    step: 8,
    tab: 'trust_security',
    title: 'Byzantine Robustness & Malicious Node Quarantine',
    speakerPitch: 'What if a participant is compromised or sends poisoned gradients? Click "Simulate Malicious Participant".',
    takeaway: 'Lender C’s anomalous update is immediately caught by gradient variance filters. Its trust score drops from 89% to 63% and gets quarantined. The global model remains safe.',
    badge: 'Step 8 of 10 • Cyber Defense'
  },
  {
    step: 9,
    tab: 'audit_trail',
    title: 'Cryptographic Auditability',
    speakerPitch: 'Every model round, encryption verification, and risk signal is logged with a tamper-evident SHA-256 cryptographic hash chain for compliance and regulators.',
    takeaway: 'Fully verifiable chain from genesis block with detection of any historical record manipulation.',
    badge: 'Step 9 of 10 • Compliance'
  },
  {
    step: 10,
    tab: 'overview',
    title: 'The Bottom Line',
    speakerPitch: 'Institutions don’t need to share customer data. They only need to share privacy-preserving intelligence.',
    takeaway: 'TRUSTMESH: Share intelligence. Not customer data. Ready for evaluation by technical judges.',
    badge: 'Step 10 of 10 • Conclusion'
  }
];
