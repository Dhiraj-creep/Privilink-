import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HackathonTourModal from './components/HackathonTourModal';
import { TOUR_STEPS } from './data/tourSteps';

// Views
import LandingPageView from './views/LandingPageView';
import OverviewView from './views/OverviewView';
import InstitutionNetworkView from './views/InstitutionNetworkView';
import CollaborativeRiskView from './views/CollaborativeRiskView';
import CustomerInvestigationView from './views/CustomerInvestigationView';
import PrivacyCenterView from './views/PrivacyCenterView';
import SecureAggregationLabView from './views/SecureAggregationLabView';
import TrustSecurityView from './views/TrustSecurityView';
import ModelCollaborationView from './views/ModelCollaborationView';
import EntityResolutionView from './views/EntityResolutionView';
import SimulationLabView from './views/SimulationLabView';
import AuditTrailView from './views/AuditTrailView';
import ArchitectureScopeView from './views/ArchitectureScopeView';

import { RISK_CASES } from './data/syntheticData';
import { api } from './api/client';

export default function App() {
  const [appMode, setAppMode] = useState('app'); // 'app' | 'landing'
  const [currentTab, setCurrentTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(api.getCurrentUser() || null);
  const [currentRole, setRole] = useState(api.getCurrentUser()?.role || 'RISK_ANALYST');
  
  // Interactive Simulation States
  const [quarantinedLender, setQuarantinedLender] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('BANK_A');
  const [cases, setCases] = useState(RISK_CASES);
  const [selectedCase, setSelectedCase] = useState(RISK_CASES[0]);
  const [backendConnected, setBackendConnected] = useState(false);

  // Hackathon Demo Tour State (10 steps)
  const [showTour, setShowTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Dynamic Notifications & Audits
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: 'Cross-Institution Anomaly', detail: 'Case CASE-10482 candidate: weak signals converging.', time: '3m ago' },
    { id: 2, type: 'info', title: 'Round 27 Finalized', detail: 'Zero-knowledge secure aggregation completed successfully.', time: '14m ago' },
    { id: 3, type: 'info', title: 'Privacy Budget Status', detail: 'Differential privacy ε=1.5 within target bounds.', time: '28m ago' }
  ]);

  const [dynamicLogs, setDynamicLogs] = useState([]);

  // Authenticated Persona Switching
  const handlePersonaLogin = async (username, password) => {
    let data;
    if (password) {
      data = await api.login(username, password);
    } else {
      data = await api.demoLogin(username);
    }
    setCurrentUser(data.user);
    setRole(data.user.role);
    // Refresh cases under new authenticated role context
    const casesData = await api.getCases().catch(() => null);
    if (Array.isArray(casesData) && casesData.length > 0) {
      setCases(casesData);
      if (selectedCase) {
        const found = casesData.find(c => c.id === selectedCase.id);
        if (found) setSelectedCase(found);
      }
    }
    return data;
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setRole('ANONYMOUS');
  };

  // Fetch initial state from backend if running
  useEffect(() => {
    api.healthCheck()
      .then(async () => {
        setBackendConnected(true);
        // Ensure default authenticated session if none exists
        if (!api.getToken()) {
          const authRes = await api.autoLoginDefault().catch(() => null);
          if (authRes && authRes.user) {
            setCurrentUser(authRes.user);
            setRole(authRes.user.role);
          }
        }
        return Promise.all([
          api.getCases().catch(() => null),
          api.getSimulationState().catch(() => null)
        ]);
      })
      .then(([casesData, simState]) => {
        if (Array.isArray(casesData) && casesData.length > 0) {
          setCases(casesData);
          const found10482 = casesData.find(c => c.id === 'CASE-10482');
          setSelectedCase(found10482 || casesData[0]);
        }
        if (simState) {
          setQuarantinedLender(!!simState.quarantined_lender);
        }
      })
      .catch(() => {
        setBackendConnected(false);
      });
  }, []);

  // Handler: Select case & navigate
  const handleSelectCase = (caseObj) => {
    setSelectedCase(caseObj);
    setCurrentTab('customer_investigation');
  };

  // Handler: Open specific case by ID (solves Simulation Lab navigation bug)
  const handleOpenCaseById = async (caseId) => {
    let target = cases.find(c => c.id === caseId);
    if (!target) {
      try {
        target = await api.getCase(caseId);
      } catch {
        // fallback
      }
    }
    if (target) {
      setSelectedCase(target);
    }
    setCurrentTab('customer_investigation');
  };

  // Handler: Select institution & navigate
  const handleSelectInstitution = (instId) => {
    setSelectedInstitutionId(instId);
    setCurrentTab('institutions');
  };

  // Handler: Trigger Byzantine Malicious Participant Simulation
  const handleTriggerMalicious = async () => {
    setQuarantinedLender(true);
    await api.runScenario('MALICIOUS').catch(() => null);

    const newAlert = {
      id: Date.now(),
      type: 'danger',
      title: 'Participant Update Flagged',
      detail: 'Lender C submitted anomalous update. Weight quarantined & trust score reduced to 63%.',
      time: 'Just now'
    };
    setNotifications(prev => [newAlert, ...prev]);

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      date: '2026-09-26',
      event: 'Participant anomaly detected & isolated',
      institution: 'LENDER C',
      privacyStatus: 'Byzantine Filtering Active',
      result: 'Quarantined (Norm: 14.8 > 1.0)',
      hash: '0x3c99...e28b',
      fullHash: '0x3c99e28b172a8091bc22718910bcda4921ef583091c78103bb29df4021008877'
    };
    setDynamicLogs(prev => [newLog, ...prev]);
  };

  // Handler: Reset Byzantine Malicious Simulation
  const handleResetMalicious = async () => {
    setQuarantinedLender(false);
    await api.runScenario('RESET').catch(() => null);
    const refreshedCases = await api.getCases().catch(() => null);
    if (Array.isArray(refreshedCases) && refreshedCases.length > 0) {
      setCases(refreshedCases);
      const found = refreshedCases.find(c => c.id === 'CASE-10482');
      if (found) setSelectedCase(found);
    }
  };

  // Handler: Run Cross-Institution Anomaly (From Simulation Lab)
  const handleRunCrossAnomaly = async () => {
    const simRes = await api.runScenario('ANOMALY').catch(() => null);

    // Fetch authoritative case directly from backend
    let authoritativeCase = null;
    try {
      authoritativeCase = await api.getCase('CASE-10482');
    } catch {
      // offline fallback
    }

    if (authoritativeCase) {
      setCases(prev => prev.map(c => c.id === 'CASE-10482' ? authoritativeCase : c));
      setSelectedCase(authoritativeCase);

      const newAlert = {
        id: Date.now(),
        type: 'danger',
        title: 'Cross-Institution Anomaly Escalated',
        detail: `CASE-10482 escalated to ${authoritativeCase.riskLevel} (${authoritativeCase.score}% confidence) via collaborative synthesis.`,
        time: 'Just now'
      };
      setNotifications(prev => [newAlert, ...prev]);

      api.getAuditLogs().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicLogs(data);
        }
      }).catch(() => null);

      return authoritativeCase;
    } else {
      const predScore = simRes?.prediction?.score || 98.4;
      const updated = {
        ...selectedCase,
        id: 'CASE-10482',
        riskLevel: 'HIGH',
        score: predScore,
        confidence: predScore,
        action: 'Step-up verification',
        status: 'ESCALATED',
        lastEscalation: 'Just now',
        explanation: 'CORRELATION DISCOVERED: 3 independent weak signals aligned across Bank, Insurer, and Lender.'
      };
      setCases(prev => prev.map(c => c.id === 'CASE-10482' ? updated : c));
      setSelectedCase(updated);

      const newAlert = {
        id: Date.now(),
        type: 'danger',
        title: 'Cross-Institution Anomaly Escalated',
        detail: `CASE-10482 escalated to HIGH RISK (${predScore}% confidence).`,
        time: 'Just now'
      };
      setNotifications(prev => [newAlert, ...prev]);
      return updated;
    }
  };

  // Handler: Human Analyst Step-Up Verification
  const handleTriggerVerification = async (caseId) => {
    const res = await api.triggerStepUpVerification(caseId, currentRole, currentRole);
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updated = { 
          ...c, 
          status: 'VERIFICATION_REQUESTED',
          activeTaskId: res.task_id 
        };
        if (selectedCase?.id === caseId) setSelectedCase(updated);
        return updated;
      }
      return c;
    }));

    const newAlert = {
      id: Date.now(),
      type: 'warning',
      title: 'Step-Up Verification Dispatched',
      detail: `Investigation task created for ${caseId}. Status: VERIFICATION_REQUESTED.`,
      time: 'Just now'
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  // Handler: Compliance Case Resolution
  const handleResolveVerification = async (caseId, notes) => {
    const targetCase = cases.find(c => c.id === caseId) || selectedCase;
    const taskId = targetCase?.activeTaskId;
    if (!taskId) {
      throw new Error(`No active verification task ID found for case ${caseId}. Please trigger verification first.`);
    }

    await api.resolveCase(caseId, taskId, notes, currentRole, currentRole);

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updated = { ...c, status: 'RESOLVED', activeTaskId: null };
        if (selectedCase?.id === caseId) setSelectedCase(updated);
        return updated;
      }
      return c;
    }));

    const newAlert = {
      id: Date.now(),
      type: 'info',
      title: 'Case Resolution Finalized',
      detail: `Case ${caseId} cleared with status RESOLVED in audit ledger.`,
      time: 'Just now'
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  // Tour Handlers
  const handleStartTour = () => {
    setAppMode('app');
    setShowTour(true);
    setTourStepIndex(0);
    setCurrentTab(TOUR_STEPS[0].tab);
  };

  const handleNextTourStep = () => {
    if (tourStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = tourStepIndex + 1;
      setTourStepIndex(nextIdx);
      setCurrentTab(TOUR_STEPS[nextIdx].tab);
    } else {
      setShowTour(false);
    }
  };

  const handlePrevTourStep = () => {
    if (tourStepIndex > 0) {
      const prevIdx = tourStepIndex - 1;
      setTourStepIndex(prevIdx);
      setCurrentTab(TOUR_STEPS[prevIdx].tab);
    }
  };

  const handleJumpTourStep = (tabName, idx) => {
    setTourStepIndex(idx);
    setCurrentTab(tabName);
  };

  // Render Landing Page if in landing mode
  if (appMode === 'landing') {
    return (
      <LandingPageView 
        onEnterApp={() => setAppMode('app')}
        onStartTour={handleStartTour}
        onRunSimulation={() => {
          setAppMode('app');
          setCurrentTab('simulation_lab');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Navbar */}
      <Navbar 
        currentRole={currentRole}
        currentUser={currentUser}
        onPersonaLogin={handlePersonaLogin}
        onLogout={handleLogout}
        onStartDemoTour={handleStartTour}
        alertCount={notifications.length}
        notifications={notifications}
        backendConnected={backendConnected}
      />

      {/* Main Layout Area */}
      <div style={{ display: 'flex', flex: 1, backgroundColor: 'var(--bg-app)' }}>
        {/* Left Navigation Sidebar */}
        <Sidebar 
          currentTab={currentTab} 
          setTab={setCurrentTab} 
          quarantinedLender={quarantinedLender}
        />

        {/* Viewport Content */}
        <main style={{
          flex: 1,
          padding: '28px 36px',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-app)'
        }}>
          {/* Quick Sub-navigation / Mode Switcher bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => setAppMode('landing')}
              style={{
                fontSize: '0.765rem',
                color: 'var(--secondary-green)',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              ← Back to Landing Page & Value Proposition
            </button>
          </div>

          {/* Current Active View */}
          {currentTab === 'overview' && (
            <OverviewView 
              onNavigate={setCurrentTab}
              onSelectInstitution={handleSelectInstitution}
              quarantinedLender={quarantinedLender}
            />
          )}

          {currentTab === 'institutions' && (
            <InstitutionNetworkView 
              selectedInstitutionId={selectedInstitutionId}
              onSelectInstitution={setSelectedInstitutionId}
              quarantinedLender={quarantinedLender}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'collaborative_risk' && (
            <CollaborativeRiskView 
              onSelectCase={handleSelectCase}
              onNavigate={setCurrentTab}
              casesList={cases}
            />
          )}

          {currentTab === 'customer_investigation' && (
            <CustomerInvestigationView 
              caseData={selectedCase}
              onBack={() => setCurrentTab('collaborative_risk')}
              onNavigate={setCurrentTab}
              onTriggerVerification={handleTriggerVerification}
              onResolveVerification={handleResolveVerification}
            />
          )}

          {currentTab === 'privacy_center' && (
            <PrivacyCenterView 
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'secure_aggregation' && (
            <SecureAggregationLabView />
          )}

          {currentTab === 'trust_security' && (
            <TrustSecurityView 
              quarantinedLender={quarantinedLender}
              onTriggerMaliciousSimulation={handleTriggerMalicious}
              onResetMaliciousSimulation={handleResetMalicious}
            />
          )}

          {currentTab === 'model_collaboration' && (
            <ModelCollaborationView />
          )}

          {currentTab === 'entity_resolution' && (
            <EntityResolutionView />
          )}

          {currentTab === 'simulation_lab' && (
            <SimulationLabView 
              onRunCrossAnomaly={handleRunCrossAnomaly}
              onSimulateMalicious={handleTriggerMalicious}
              quarantinedLender={quarantinedLender}
              onNavigate={setCurrentTab}
              onOpenCase={handleOpenCaseById}
            />
          )}

          {currentTab === 'audit_trail' && (
            <AuditTrailView dynamicLogs={dynamicLogs} />
          )}

          {currentTab === 'architecture_scope' && (
            <ArchitectureScopeView />
          )}
        </main>
      </div>

      {/* 10-Step Interactive Presenter / Hackathon Demo Tour Modal */}
      {showTour && (
        <HackathonTourModal 
          currentStepIndex={tourStepIndex}
          onNext={handleNextTourStep}
          onPrev={handlePrevTourStep}
          onClose={() => setShowTour(false)}
          onJumpToTab={handleJumpTourStep}
        />
      )}
    </div>
  );
}
