import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HackathonTourModal from './components/HackathonTourModal';
import { TOUR_STEPS } from './data/tourSteps';
import './App.css';

// Direct View Imports for instantaneous, reliable rendering across dev and prod
import LandingPageView from './views/LandingPageView';
import OverviewView from './views/OverviewView';
import CollaborativeRiskView from './views/CollaborativeRiskView';
import CustomerInvestigationView from './views/CustomerInvestigationView';
import InstitutionNetworkView from './views/InstitutionNetworkView';
import SecurityPrivacyView from './views/SecurityPrivacyView';
import AuditTrailView from './views/AuditTrailView';
import AdvancedDemoView from './views/AdvancedDemoView';
import ArchitectureScopeView from './views/ArchitectureScopeView';
import ErrorBoundary from './components/ErrorBoundary';

import { RISK_CASES } from './data/syntheticData';
import { api } from './api/client';

export default function App() {
  const [appMode, setAppMode] = useState('app'); // 'app' | 'landing'
  const [currentTab, setCurrentTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(api.getCurrentUser() || null);
  const [currentRole, setRole] = useState(api.getCurrentUser()?.role || 'RISK_ANALYST');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Interactive Simulation States
  const [quarantinedLender, setQuarantinedLender] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('BANK_A');
  const [cases, setCases] = useState(RISK_CASES);
  const [selectedCase, setSelectedCase] = useState(RISK_CASES[0]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Guided Tour State
  const [showTour, setShowTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Dynamic Notifications & Audits
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: 'Cross-Institution Anomaly', detail: 'Case CASE-10482 candidate: weak signals converging.', time: '3m ago' },
    { id: 2, type: 'info', title: 'Round 27 Finalized', detail: 'Zero-sum secure aggregation completed successfully (Σ M_i = 0).', time: '14m ago' },
    { id: 3, type: 'info', title: 'Privacy Budget Status', detail: 'Differential privacy ε=1.5 within target bounds.', time: '28m ago' }
  ]);

  const [dynamicLogs, setDynamicLogs] = useState([]);

  // URL Hash Navigation Helper
  const navigateToTab = (tab, caseId = null) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'customer_investigation' && (caseId || selectedCase?.id)) {
      window.location.hash = `#/investigation/${caseId || selectedCase?.id}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
  };

  // URL Hash Listener: Supports direct links, page refresh, and back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;
      if (hash.startsWith('investigation/')) {
        const targetId = hash.split('/')[1];
        if (targetId) {
          setCurrentTab('customer_investigation');
          api.getCase(targetId)
            .then(c => { if (c) setSelectedCase(c); })
            .catch(() => null);
        }
      } else {
        const validTabs = [
          'overview', 'risk_cases', 'institutions', 'security_privacy',
          'audit_trail', 'advanced_demo', 'architecture_scope'
        ];
        if (validTabs.includes(hash)) {
          setCurrentTab(hash);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

    // Refresh cases and authoritative active case under new authenticated role context
    const casesData = await api.getCases().catch(() => null);
    if (Array.isArray(casesData)) {
      setCases(casesData);
      if (selectedCase?.id && casesData.length > 0) {
        try {
          const fresh = await api.getCase(selectedCase.id);
          if (fresh) setSelectedCase(fresh);
        } catch {
          const found = casesData.find(c => c.id === selectedCase.id);
          if (found) setSelectedCase(found);
        }
      }
    }
    return data;
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setRole('ANONYMOUS');
    setSelectedCase(null);
    setDynamicLogs([]);
    navigateToTab('overview');
  };

  // Fetch initial state from backend if running
  useEffect(() => {
    api.healthCheck()
      .then(async () => {
        setBackendConnected(true);
        // Ensure default authenticated session if none exists and user has not explicitly logged out
        if (!api.getToken() && localStorage.getItem('trustmesh_logged_out') !== 'true') {
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
      .then(async ([casesData, simState]) => {
        if (Array.isArray(casesData)) {
          setCases(casesData);
          if (casesData.length > 0) {
            const initialTarget = casesData.find(c => c.id === 'CASE-10482') || casesData[0];
            try {
              const authoritative = await api.getCase(initialTarget.id);
              setSelectedCase(authoritative || initialTarget);
            } catch {
              setSelectedCase(initialTarget);
            }
          }
        }
        if (simState) {
          setQuarantinedLender(!!simState.quarantined_lender);
        }
      })
      .catch(() => {
        setBackendConnected(false);
      });
  }, []);

  // Handler: Select case & navigate with authoritative details
  const handleSelectCase = async (caseObj) => {
    navigateToTab('customer_investigation', caseObj.id);
    try {
      const detailed = await api.getCase(caseObj.id);
      if (detailed) {
        setSelectedCase(detailed);
        return;
      }
    } catch {
      // fallback to list object
    }
    setSelectedCase(caseObj);
  };

  // Handler: Open specific case by ID
  const handleOpenCaseById = async (caseId) => {
    navigateToTab('customer_investigation', caseId);
    try {
      const detailed = await api.getCase(caseId);
      if (detailed) {
        setSelectedCase(detailed);
        return;
      }
    } catch {
      // fallback
    }
    const target = cases.find(c => c.id === caseId);
    if (target) {
      setSelectedCase(target);
    }
  };

  // Handler: Trigger Byzantine Malicious Participant Simulation
  const handleTriggerMalicious = async () => {
    try {
      const res = await api.runScenario('MALICIOUS');
      setQuarantinedLender(true);

      const newAlert = {
        id: Date.now(),
        type: 'danger',
        title: 'Participant Update Flagged & Quarantined',
        detail: 'Lender C submitted anomalous gradient (Norm: 14.8 > 1.0). Weight quarantined via Byzantine defense.',
        time: 'Just now'
      };
      setNotifications(prev => [newAlert, ...prev]);

      api.getAuditLogs().then(data => {
        if (Array.isArray(data) && data.length > 0) setDynamicLogs(data);
      }).catch(() => null);

      return res;
    } catch (err) {
      console.error('Byzantine simulation failed on backend', err);
      const errAlert = {
        id: Date.now(),
        type: 'warning',
        title: 'Simulation Command Failed',
        detail: `Backend could not execute scenario: ${err.message || 'Coordinator unreachable'}.`,
        time: 'Just now'
      };
      setNotifications(prev => [errAlert, ...prev]);
      throw err;
    }
  };

  // Handler: Reset Byzantine Malicious Simulation
  const handleResetMalicious = async () => {
    try {
      await api.runScenario('RESET');
      setQuarantinedLender(false);
      const refreshedCases = await api.getCases().catch(() => null);
      if (Array.isArray(refreshedCases) && refreshedCases.length > 0) {
        setCases(refreshedCases);
        const found = refreshedCases.find(c => c.id === 'CASE-10482');
        if (found) setSelectedCase(found);
      }
    } catch (err) {
      console.error('Reset simulation failed on backend', err);
      throw err;
    }
  };

  // Handler: Run Cross-Institution Anomaly (From Simulation Lab)
  const handleRunCrossAnomaly = async () => {
    try {
      await api.runScenario('ANOMALY');
      const authoritativeCase = await api.getCase('CASE-10482');

      if (authoritativeCase) {
        setCases(prev => prev.map(c => c.id === 'CASE-10482' ? authoritativeCase : c));
        setSelectedCase(authoritativeCase);

        const newAlert = {
          id: Date.now(),
          type: 'danger',
          title: 'Cross-Institution Anomaly Escalated',
          detail: `CASE-10482 escalated to ${authoritativeCase.riskLevel} (Risk Score: ${authoritativeCase.score}%, Confidence: ${authoritativeCase.confidence}%) via collaborative Split Learning.`,
          time: 'Just now'
        };
        setNotifications(prev => [newAlert, ...prev]);

        api.getAuditLogs().then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDynamicLogs(data);
          }
        }).catch(() => null);

        return authoritativeCase;
      }
      return null;
    } catch (err) {
      console.error('Anomaly simulation failed', err);
      const errAlert = {
        id: Date.now(),
        type: 'warning',
        title: 'Simulation Error',
        detail: `Could not trigger cross-institution anomaly: ${err.message || 'Backend disconnected'}. Real backend connection required.`,
        time: 'Just now'
      };
      setNotifications(prev => [errAlert, ...prev]);
      throw err;
    }
  };

  // Handler: Human Analyst Step-Up Verification
  const handleTriggerVerification = async (caseId) => {
    const res = await api.triggerStepUpVerification(caseId, currentRole, currentRole);
    // Refresh authoritative case directly from backend
    try {
      const detailed = await api.getCase(caseId);
      if (detailed) setSelectedCase(detailed);
    } catch {
      // fallback
    }
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { 
          ...c, 
          status: 'VERIFICATION_REQUESTED',
          activeTaskId: res.task_id,
          hasActiveTask: true
        };
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
    let targetCase = selectedCase?.id === caseId ? selectedCase : cases.find(c => c.id === caseId);
    let taskId = targetCase?.activeTaskId;
    if (!taskId) {
      try {
        const fresh = await api.getCase(caseId);
        if (fresh) {
          targetCase = fresh;
          taskId = fresh.activeTaskId;
          setSelectedCase(fresh);
        }
      } catch {
        // fallback
      }
    }

    const res = await api.resolveCase(caseId, taskId, notes, currentRole, currentRole);

    // Refresh authoritative case directly from backend
    try {
      const freshCase = await api.getCase(caseId);
      if (freshCase) {
        setSelectedCase(freshCase);
      }
    } catch {
      setSelectedCase(prev => prev ? { ...prev, status: 'RESOLVED', activeTaskId: null, hasActiveTask: false } : null);
    }

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, status: 'RESOLVED', activeTaskId: null, hasActiveTask: false };
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
    return res;
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
      />
    );
  }

  // Map tab names / aliases to views
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <OverviewView 
            onNavigate={navigateToTab}
            onSelectCase={handleSelectCase}
            quarantinedLender={quarantinedLender}
          />
        );

      case 'risk_cases':
      case 'collaborative_risk':
        return (
          <CollaborativeRiskView 
            onSelectCase={handleSelectCase}
            casesList={cases}
          />
        );

      case 'customer_investigation':
        return (
          <CustomerInvestigationView 
            key={selectedCase?.id || 'default'}
            caseData={selectedCase}
            currentRole={currentRole}
            onBack={() => navigateToTab('risk_cases')}
            onNavigate={navigateToTab}
            onTriggerVerification={handleTriggerVerification}
            onResolveVerification={handleResolveVerification}
          />
        );

      case 'institutions':
        return (
          <InstitutionNetworkView 
            selectedInstitutionId={selectedInstitutionId}
            onSelectInstitution={setSelectedInstitutionId}
            quarantinedLender={quarantinedLender}
            currentRole={currentRole}
          />
        );

      case 'security_privacy':
      case 'privacy_center':
      case 'trust_security':
      case 'model_collaboration':
        return (
          <SecurityPrivacyView 
            quarantinedLender={quarantinedLender}
            onTriggerMaliciousSimulation={handleTriggerMalicious}
            onResetMaliciousSimulation={handleResetMalicious}
          />
        );

      case 'audit_trail':
        return (
          <AuditTrailView dynamicLogs={dynamicLogs} />
        );

      case 'advanced_demo':
      case 'simulation_lab':
      case 'secure_aggregation':
      case 'entity_resolution':
        return (
          <AdvancedDemoView 
            onRunCrossAnomaly={handleRunCrossAnomaly}
            onSimulateMalicious={handleTriggerMalicious}
            quarantinedLender={quarantinedLender}
            onNavigate={navigateToTab}
            onOpenCase={handleOpenCaseById}
          />
        );

      case 'architecture_scope':
        return (
          <ArchitectureScopeView />
        );

      default:
        return (
          <OverviewView 
            onNavigate={navigateToTab}
            onSelectCase={handleSelectCase}
            quarantinedLender={quarantinedLender}
          />
        );
    }
  };

  return (
    <div className="tm-app-root">
      {/* Top Navbar */}
      <Navbar 
        currentRole={currentRole}
        currentUser={currentUser}
        currentTab={currentTab}
        onPersonaLogin={handlePersonaLogin}
        onLogout={handleLogout}
        onStartDemoTour={handleStartTour}
        alertCount={notifications.length}
        notifications={notifications}
        backendConnected={backendConnected}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        appMode={appMode}
        onToggleAppMode={setAppMode}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        cases={cases}
        onSelectCase={handleSelectCase}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
      />

      {/* Main Workspace Layout Area */}
      <div className="tm-app-body">
        {/* Left Navigation Sidebar */}
        <Sidebar 
          currentTab={currentTab} 
          setTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }} 
          quarantinedLender={quarantinedLender}
          backendConnected={backendConnected}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Viewport Content */}
        <main className="tm-app-main">
          <ErrorBoundary onReset={() => setCurrentTab('overview')}>
            {renderCurrentView()}
          </ErrorBoundary>
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
