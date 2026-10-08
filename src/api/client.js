/**
 * TRUSTMESH API Client
 * Provides persistent HTTP communication with the FastAPI backend.
 * Falls back gracefully to local synthetic baseline if backend is offline.
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://127.0.0.1:8000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('trustmesh_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('trustmesh_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.currentUser = user;
    if (token) {
      localStorage.setItem('trustmesh_token', token);
      localStorage.setItem('trustmesh_user', JSON.stringify(user));
      localStorage.removeItem('trustmesh_logged_out');
    } else {
      localStorage.removeItem('trustmesh_token');
      localStorage.removeItem('trustmesh_user');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async ensureAuthenticated() {
    if (this.token) return;
    if (localStorage.getItem('trustmesh_logged_out') === 'true') {
      return; // Do not auto-login if user explicitly logged out
    }
    if (!this._loginPromise) {
      this._loginPromise = this.autoLoginDefault().finally(() => {
        this._loginPromise = null;
      });
    }
    await this._loginPromise;
  }

  async request(endpoint, options = {}) {
    if (!this.token && !endpoint.startsWith('/auth/')) {
      await this.ensureAuthenticated();
    }

    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    const res = await fetch(url, config);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorBody.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  }

  // Auth
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async demoLogin(username) {
    const data = await this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  logout() {
    this.setSession(null, null);
    localStorage.setItem('trustmesh_logged_out', 'true');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken() {
    return this.token;
  }

  async autoLoginDefault() {
    if (localStorage.getItem('trustmesh_logged_out') === 'true') {
      return null;
    }
    if (!this.token) {
      try {
        return await this.demoLogin('analyst');
      } catch (e) {
        console.warn('Initial demo authentication failed (backend may be starting)', e);
        return null;
      }
    }
    return { token: this.token, user: this.currentUser };
  }

  async getRoles() {
    return this.request('/auth/roles');
  }

  // Cases
  async getCases(risk = 'ALL', search = '') {
    const query = new URLSearchParams({ risk, search }).toString();
    return this.request(`/cases?${query}`);
  }

  async getCase(caseId) {
    return this.request(`/cases/${caseId}`);
  }

  async triggerStepUpVerification(caseId, actor = 'RISK_ANALYST', role = 'RISK_ANALYST') {
    return this.request(`/cases/${caseId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ actor, role })
    });
  }

  async resolveCase(caseId, taskId, resolutionNotes, actor = 'COMPLIANCE_OFFICER', role = 'COMPLIANCE_OFFICER') {
    return this.request(`/cases/${caseId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, resolution_notes: resolutionNotes, actor, role })
    });
  }

  // Participant Nodes (Enforces 403 Forbidden for unauthorized institution admins)
  async getNodeMetadata(institutionId) {
    return this.request(`/nodes/${institutionId}/metadata`);
  }

  async getNodeRecords(institutionId, limit = 50, search = '') {
    const query = new URLSearchParams({ limit, search }).toString();
    return this.request(`/nodes/${institutionId}/records?${query}`);
  }

  // Cryptographic & Privacy Simulations
  async simulateSecAgg(roundId = 27, simulateDropout = null) {
    return this.request('/crypto/secagg/simulate', {
      method: 'POST',
      body: JSON.stringify({ round_id: roundId, simulate_dropout: simulateDropout })
    });
  }

  async simulateDP(epsilon = 1.5, delta = 1e-5, clipNorm = 1.0) {
    return this.request('/crypto/dp/simulate', {
      method: 'POST',
      body: JSON.stringify({ epsilon, delta, clip_norm: clipNorm })
    });
  }

  async simulatePSI(partyA = 'BANK_A', partyB = 'INSURER_B', sampleSize = 25) {
    return this.request('/crypto/psi/simulate', {
      method: 'POST',
      body: JSON.stringify({ party_a: partyA, party_b: partyB, sample_size: sampleSize })
    });
  }

  // Model Collaboration
  async getModelMetrics() {
    return this.request('/model/metrics');
  }

  // Simulation Lab
  async getSimulationState() {
    return this.request('/simulation/state');
  }

  async runScenario(scenario) {
    return this.request('/simulation/run', {
      method: 'POST',
      body: JSON.stringify({ scenario })
    });
  }

  // Audit Ledger
  async getAuditLogs(institution = 'ALL', search = '') {
    const query = new URLSearchParams({ institution, search }).toString();
    return this.request(`/audit/logs?${query}`);
  }

  async verifyAuditChain() {
    return this.request('/audit/verify');
  }

  async simulateAuditTamper(targetIdx = 1) {
    return this.request('/audit/simulate-tamper', {
      method: 'POST',
      body: JSON.stringify({ target_idx: targetIdx })
    });
  }

  // Disposable Audit Sandbox
  async getSandboxLogs() {
    return this.request('/audit/sandbox/logs');
  }

  async verifySandboxAudit() {
    return this.request('/audit/sandbox/verify');
  }

  async simulateSandboxTamper(targetIdx = 1) {
    return this.request('/audit/sandbox/tamper', {
      method: 'POST',
      body: JSON.stringify({ target_idx: targetIdx })
    });
  }

  async tamperSandboxAudit(targetIdx = 1) {
    return this.simulateSandboxTamper(targetIdx);
  }

  async resetSandboxAudit() {
    return this.request('/audit/sandbox/reset', {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  async healthCheck() {
    return this.request('/health');
  }

  async clusterHealthCheck() {
    return this.request('/health/cluster');
  }
}

export const api = new ApiClient();
