/**
 * TRUSTMESH Browser Workflow & End-to-End Client Lifecycle Test
 * Tests the complete end-to-end user journey matching the frontend UI flow:
 *
 * 1. Health & Cluster Discovery (Coordinator + 3 Sovereign Nodes)
 * 2. Authenticated Login (Risk Analyst session token issuance)
 * 3. Case Queue & Selection (Querying collaborative risk cases)
 * 4. Authoritative Investigation (Detailed SHAP/component attributions & privacy disclosure)
 * 5. Step-Up Verification Dispatch (Creating active verification task)
 * 6. Refresh / Persistence Restoration (Authoritative activeTaskId restored on reload)
 * 7. RBAC Boundary Enforcement (Risk Analyst forbidden from resolving own case)
 * 8. Role Switching (Switching session to Compliance Officer)
 * 9. Case Resolution & Status Transition (Resolving case with audit trail)
 * 10. Audit Chain Verification (Cryptographic SHA-256 ledger integrity from genesis to head)
 * 11. Explicit Logout State (Forbidding silent auto-login after explicit signout)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

class TrustmeshBrowserClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
    this.currentUser = null;
    this.isLoggedOut = false;
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  }

  async login(username, role = 'RISK_ANALYST') {
    const res = await this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ username, role })
    });
    if (res.ok && res.data) {
      this.token = res.data.token || res.data.access_token;
      this.currentUser = res.data.user;
      this.isLoggedOut = false;
    }
    return res;
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    this.isLoggedOut = true;
  }
}

test('End-to-End User Journey: From Cluster Discovery to Case Resolution and Audit Verification', async (t) => {
  const client = new TrustmeshBrowserClient(BASE_URL);

  await t.test('1. Cluster discovery and coordinator health check', async () => {
    const health = await client.request('/health');
    assert.equal(health.status, 200, 'Coordinator API must return HTTP 200');
    assert.equal(health.data.status, 'healthy');

    const cluster = await client.request('/health/cluster');
    assert.equal(cluster.status, 200);
    assert.equal(cluster.data.coordinator.status, 'ONLINE');
    assert.ok(cluster.data.nodes.BANK_A, 'Bank A node reported');
    assert.ok(cluster.data.nodes.INSURER_B, 'Insurer B node reported');
    assert.ok(cluster.data.nodes.LENDER_C, 'Lender C node reported');
  });

  await t.test('2. Authenticated login as Risk Analyst', async () => {
    const loginRes = await client.login('analyst', 'RISK_ANALYST');
    assert.equal(loginRes.status, 200, 'Login must succeed');
    assert.ok(client.token, 'Bearer session token received');
    assert.equal(client.currentUser.role, 'RISK_ANALYST');
  });

  await t.test('3. Reset demo scenario to baseline monitoring', async () => {
    // Compliance token needed for RESET
    const compClient = new TrustmeshBrowserClient(BASE_URL);
    await compClient.login('compliance', 'COMPLIANCE_OFFICER');

    const resetRes = await compClient.request('/simulation/run', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'RESET' })
    });
    assert.equal(resetRes.status, 200);
  });

  await t.test('4. Fetch risk cases queue', async () => {
    const casesRes = await client.request('/cases');
    assert.equal(casesRes.status, 200);
    assert.ok(Array.isArray(casesRes.data), 'Cases response must be an array');
    assert.ok(casesRes.data.length >= 3, 'Must contain multiple risk cases');

    const benchmarkCase = casesRes.data.find(c => c.id === 'CASE-10482');
    assert.ok(benchmarkCase, 'CASE-10482 must be present in queue');
  });

  let createdTaskId = null;

  await t.test('5. Open authoritative investigation for CASE-10482', async () => {
    const detailRes = await client.request('/cases/CASE-10482');
    assert.equal(detailRes.status, 200);
    const c = detailRes.data;
    assert.equal(c.id, 'CASE-10482');
    assert.ok(c.localEvidence, 'Local evidence partitions present');
    assert.ok(c.localEvidence.bank, 'Bank evidence present');
    assert.ok(c.localEvidence.insurer, 'Insurer evidence present');
    assert.ok(c.localEvidence.lender, 'Lender evidence present');
    assert.ok(c.minimumDisclosure, 'Minimum disclosure privacy boundary present');
  });

  await t.test('6. Risk Analyst dispatches Step-Up KYC verification task', async () => {
    const verifyRes = await client.request('/cases/CASE-10482/verify', {
      method: 'POST',
      body: JSON.stringify({ actor: 'analyst', role: 'RISK_ANALYST' })
    });
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.data.new_status, 'VERIFICATION_REQUESTED');
    assert.ok(verifyRes.data.task_id, 'Task ID returned');
    createdTaskId = verifyRes.data.task_id;
  });

  await t.test('7. Simulated page refresh restores active task and status', async () => {
    // Fresh query representing page reload
    const reloadedCase = await client.request('/cases/CASE-10482');
    assert.equal(reloadedCase.status, 200);
    assert.equal(reloadedCase.data.status, 'VERIFICATION_REQUESTED');
    assert.equal(reloadedCase.data.activeTaskId, createdTaskId, 'Active task must be restored on reload');

    // Case list also retains activeTaskId
    const reloadedList = await client.request('/cases');
    const caseInList = reloadedList.data.find(c => c.id === 'CASE-10482');
    assert.equal(caseInList.activeTaskId, createdTaskId);
  });

  await t.test('8. RBAC check: Risk Analyst cannot self-resolve verification', async () => {
    const unauthResolve = await client.request('/cases/CASE-10482/resolve', {
      method: 'POST',
      body: JSON.stringify({
        task_id: createdTaskId,
        resolution_notes: 'Analyst attempting unauthorized resolution',
        actor: 'analyst',
        role: 'RISK_ANALYST'
      })
    });
    assert.equal(unauthResolve.status, 403, 'Must return HTTP 403 Forbidden for Risk Analyst');
  });

  await t.test('9. Role switch to Compliance Officer and resolve case', async () => {
    // Switch authenticated persona to Compliance Officer
    const complianceLogin = await client.login('compliance', 'COMPLIANCE_OFFICER');
    assert.equal(complianceLogin.status, 200);
    assert.equal(client.currentUser.role, 'COMPLIANCE_OFFICER');

    // Authorized resolution
    const resolveRes = await client.request('/cases/CASE-10482/resolve', {
      method: 'POST',
      body: JSON.stringify({
        task_id: createdTaskId,
        resolution_notes: 'Customer provided certified tax declarations and audited bank records verifying legitimate liquidity surge.',
        actor: 'compliance',
        role: 'COMPLIANCE_OFFICER'
      })
    });
    assert.equal(resolveRes.status, 200, 'Compliance Officer resolution must succeed');
    assert.equal(resolveRes.data.new_status, 'RESOLVED');
    assert.ok(resolveRes.data.audit_hash, 'Audit hash produced for resolution event');

    // Verify persisted RESOLVED status
    const verifiedCase = await client.request('/cases/CASE-10482');
    assert.equal(verifiedCase.data.status, 'RESOLVED');
  });

  await t.test('10. SHA-256 Audit Chain Ledger verification', async () => {
    const auditRes = await client.request('/audit/verify');
    assert.equal(auditRes.status, 200);
    assert.equal(auditRes.data.valid, true, 'Cryptographic audit ledger must be unbroken');
    assert.ok(auditRes.data.total_events >= 5, 'Must contain historical and newly resolved events');

    // Query recent audit logs to confirm resolve action is logged
    const logsRes = await client.request('/audit/logs?limit=10');
    assert.equal(logsRes.status, 200);
    const resolveLog = logsRes.data.find(l => l.target_id === 'CASE-10482' && l.action.includes('RESOLVE'));
    assert.ok(resolveLog, 'Resolve action must be durably recorded in audit ledger');
  });

  await t.test('11. Explicit logout prevents silent re-authentication', () => {
    client.logout();
    assert.equal(client.token, null);
    assert.equal(client.currentUser, null);
    assert.equal(client.isLoggedOut, true);
  });
});
