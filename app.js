// ─── Utilities ───────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function showAlert(elId, msg, type = 'danger') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type} alert-dismissible py-2 mb-3" role="alert">
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
  setTimeout(() => { el.innerHTML = ''; }, 5000);
}

function loadingMarkup(message = 'Loading...') {
  return `<div class="d-flex align-items-center gap-2 text-muted small px-2 py-2">
    <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
    <span>${escHtml(message)}</span>
  </div>`;
}

function setLoading(elId, message = 'Loading...') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = loadingMarkup(message);
}

function statusBadge(status) {
  const map = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    converted: 'badge-converted',
    penalty: 'badge-penalty'
  };
  return `<span class="cds-badge ${map[status] || ''}">${status.toUpperCase()}</span>`;
}

function typeBadge(type) {
  const cls = type === 'credit'
    ? 'badge-type-credit'
    : type === 'expense'
      ? 'badge-type-expense'
      : 'badge-type-suspense';
  return `<span class="cds-badge ${cls}">${type.toUpperCase()}</span>`;
}

async function api(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: text && text.trim() ? text.trim() : 'Non-JSON response from server' };
  }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function setTodayDate() {
  const el = document.getElementById('todayDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function toggleSidebar() {
  document.querySelector('.cds-sidebar')?.classList.toggle('open');
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
async function doLogin() {
  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value;
  if (!username || !password) { showAlert('loginAlert', 'Please enter username and password.'); return; }
  try {
    const data = await api('/api/login', 'POST', { username, password });
    if (data.role === 'incharge') window.location.href = '/incharge';
    else if (data.role === 'security') window.location.href = '/security';
    else if (data.role === 'manager') window.location.href = '/manager';
    else if (data.role === 'admin') window.location.href = '/admin';
    else window.location.href = '/';
  } catch (err) {
    showAlert('loginAlert', err.message);
  }
}

// Allow Enter key on login
document.addEventListener('DOMContentLoaded', () => {
  const pwEl = document.getElementById('password');
  if (pwEl) pwEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') doLogin(); });
  const unEl = document.getElementById('username');
  if (unEl) unEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') doLogin(); });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
async function doLogout() {
  await api('/api/logout', 'POST');
  window.location.href = '/';
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
let currentSection = 'dashboard';
let currentUserRole = null;

function setNavVisibility(sectionName, visible) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    const onclick = link.getAttribute('onclick') || '';
    if (onclick.includes(`showSection('${sectionName}')`)) {
      link.classList.toggle('d-none', !visible);
    }
  });
}

function setupManagerMenu() {
  // Manager can approve/review, but should not see admin-only CDB entry forms.
  ['credit', 'expense', 'suspense', 'users'].forEach((section) => setNavVisibility(section, false));
  ['transactions', 'inventoryDashboard', 'inventoryAddProduct', 'inventoryRequests', 'inventoryApprovals', 'inventoryIssue', 'inventoryMovements', 'vehicleApprovals', 'vehicleReports']
    .forEach((section) => setNavVisibility(section, true));
  setNavVisibility('daily', true);
  setNavVisibility('vehicleEntry', false);
}

function setupSecurityMenu() {
  ['dashboard', 'credit', 'expense', 'suspense', 'transactions', 'daily', 'inventoryDashboard', 'inventoryAddProduct',
    'inventoryRequests', 'inventoryApprovals', 'inventoryIssue', 'inventoryMovements', 'users', 'vehicleApprovals', 'vehicleReports']
    .forEach((section) => setNavVisibility(section, false));
  ['vehicleEntry', 'vehicleHistory'].forEach((section) => setNavVisibility(section, true));
}

function setupManagerDailyView() {
  const dailySection = document.getElementById('section-daily');
  if (!dailySection) return;

  // Manager can view daily status/history but cannot submit denomination close.
  dailySection.querySelectorAll('.denom-grid, .denom-total, button[onclick="closeDay()"]')
    .forEach((el) => el.classList.add('d-none'));

  const header = dailySection.querySelector('.form-structured .card-header-cds h5');
  if (header) header.textContent = 'Daily Closing (View Only)';
}

function showSection(name) {
  document.querySelectorAll('[id^="section-"]').forEach(el => el.classList.add('d-none'));
  const el = document.getElementById('section-' + name);
  if (el) el.classList.remove('d-none');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.getAttribute('onclick')?.includes(name)) l.classList.add('active');
  });
  const titles = {
    dashboard: 'CDB Dashboard',
    credit: 'Petty Cash - Credit Entries',
    expense: 'Petty Cash - Expenses',
    suspense: 'Petty Cash - Suspense',
    transactions: 'Petty Cash - Approvals',
    daily: 'Petty Cash - Daily Closing',
    inventoryDashboard: 'Inventory Dashboard',
    inventoryAddProduct: 'Inventory - Add Product',
    inventoryRequests: 'Inventory - Stock Requests',
    inventoryApprovals: 'Inventory - Approvals',
    inventoryIssue: 'Inventory - Stock Issue',
    inventoryMovements: 'Inventory - Movement History',
    users: 'Admin - User Management',
    vehicleEntry: 'Vehicle Log - New Entry',
    vehicleHistory: 'Vehicle Log - My Entries',
    vehicleApprovals: 'Vehicle Log - Approvals',
    vehicleReports: 'Vehicle Log - Reports'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[name] || name;
  currentSection = name;
  loadSectionData(name);
  // Close sidebar on mobile
  document.querySelector('.cds-sidebar')?.classList.remove('open');
}

function loadSectionData(name) {
  if (name === 'dashboard') loadDashboard();
  else if (name === 'credit') loadCredits();
  else if (name === 'expense') loadExpenses();
  else if (name === 'suspense') loadSuspenseList();
  else if (name === 'daily') loadDaily();
  else if (name === 'transactions') loadTransactions();
  else if (name === 'inventoryDashboard') loadInventoryDashboard();
  else if (name === 'inventoryAddProduct') loadInventoryProducts();
  else if (name === 'inventoryRequests') loadInventoryRequests();
  else if (name === 'inventoryApprovals') loadInventoryApprovals();
  else if (name === 'inventoryIssue') loadInventoryIssue();
  else if (name === 'inventoryMovements') loadInventoryMovements();
  else if (name === 'users') loadUsers();
  else if (name === 'vehicleEntry') loadVehicleEntryForm();
  else if (name === 'vehicleHistory') loadVehicleHistory();
  else if (name === 'vehicleApprovals') loadVehicleApprovals();
  else if (name === 'vehicleReports') loadVehicleReports();
}

async function initAdmin() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (!['admin', 'manager'].includes(me.role)) { window.location.href = '/'; return; }
    currentUserRole = me.role;
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
    if (me.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach((el) => el.classList.add('d-none'));
      setupManagerMenu();
      setupManagerDailyView();
    }
  } catch {
    window.location.href = '/';
    return;
  }
  showSection('dashboard');
}

// Dashboard
async function loadDashboard() {
  const pageRoot = document.getElementById('section-dashboard');
  setLoading('recentTxList', 'Loading recent transactions...');
  setLoading('dashPendingList', 'Loading pending items...');
  try {
    const bal = await api('/api/balance');
    document.getElementById('openingBal').textContent = fmt(bal.opening || 0);
    document.getElementById('currentBal').textContent = fmt(bal.balance || 0);
    const totalCredEl = document.getElementById('totalCred');
    if (totalCredEl) totalCredEl.textContent = fmt(bal.totalCredits || 0);
    document.getElementById('totalExp').textContent = fmt(bal.totalExpenses || 0);
    document.getElementById('totalPen').textContent = fmt(bal.totalPenalties || 0);
  } catch (e) {
    console.error(e);
    if (pageRoot) {
      const existing = document.getElementById('dashLoadAlert');
      if (!existing) {
        const alert = document.createElement('div');
        alert.id = 'dashLoadAlert';
        alert.className = 'alert alert-warning py-2 mb-3';
        alert.textContent = 'Could not load dashboard balances.';
        pageRoot.prepend(alert);
      }
    }
  }

  try {
    const txs = await api('/api/transactions');
    const recent = txs.slice(0, 6);
    const el = document.getElementById('recentTxList');
    if (!recent.length) { el.innerHTML = '<p class="text-muted small px-2">No transactions yet.</p>'; return; }
    el.innerHTML = recent.map(t => `
      <div class="tx-row">
        <div class="tx-info">
          <div class="tx-desc">${escHtml(t.description)}</div>
          <div class="tx-meta">${fmtDate(t.createdAt)} · ${typeBadge(t.type)}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amount">${fmt(t.amount)}</div>
          ${statusBadge(t.status)}
        </div>
      </div>`).join('');
  } catch (e) {
    console.error(e);
    const el = document.getElementById('recentTxList');
    if (el) el.innerHTML = '<p class="text-muted small px-2">Could not load recent transactions.</p>';
  }

  try {
    const pending = await api('/api/transactions/pending');
    let pendingVehicleLogs = 0;
    if (currentUserRole === 'manager' || currentUserRole === 'admin') {
      try {
        const v = await api('/api/vehicle-logs/pending-count');
        pendingVehicleLogs = v.pendingVehicleLogs || 0;
      } catch (err) {
        console.error(err);
      }
    }
    const el = document.getElementById('dashPendingList');
    if (!pending.length && !pendingVehicleLogs) { el.innerHTML = '<p class="text-muted small px-2">No pending items.</p>'; return; }
    const financeRows = pending.map(t => `
      <div class="tx-row">
        <div class="tx-info">
          <div class="tx-desc">${escHtml(t.description)}</div>
          <div class="tx-meta">${fmtDate(t.createdAt)} · ${typeBadge(t.type)}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amount">${fmt(t.amount)}</div>
          ${statusBadge(t.status)}
        </div>
      </div>`).join('');
    const vehicleRow = pendingVehicleLogs ? `<div class="tx-row">
      <div class="tx-info">
        <div class="tx-desc">Vehicle Log Book</div>
        <div class="tx-meta">Pending manager approvals</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount">${pendingVehicleLogs}</div>
        <span class="cds-badge badge-pending">PENDING</span>
      </div>
    </div>` : '';
    el.innerHTML = financeRows + vehicleRow;
  } catch (e) {
    console.error(e);
    const el = document.getElementById('dashPendingList');
    if (el) el.innerHTML = '<p class="text-muted small px-2">Could not load pending items.</p>';
  }
}

// Credits
async function addCredit() {
  const description = document.getElementById('credDesc')?.value?.trim();
  const amount = parseFloat(document.getElementById('credAmount')?.value);
  if (!description) { showAlert('creditAlert', 'Please enter a description.'); return; }
  if (!amount || amount <= 0) { showAlert('creditAlert', 'Please enter a valid amount.'); return; }
  try {
    await api('/api/credit', 'POST', { description, amount });
    showAlert('creditAlert', 'Credit added successfully.', 'success');
    document.getElementById('credDesc').value = '';
    document.getElementById('credAmount').value = '';
    loadCredits();
    loadDashboard();
  } catch (err) {
    showAlert('creditAlert', err.message);
  }
}

async function loadCredits() {
  try {
    const txs = await api('/api/transactions?type=credit');
    const el = document.getElementById('creditList');
    if (!el) return;
    if (!txs.length) { el.innerHTML = '<p class="text-muted small px-2">No credits yet.</p>'; return; }
    el.innerHTML = buildTxTable(txs, false);
  } catch (e) { console.error(e); }
}

// Expenses
async function addExpense() {
  const description = document.getElementById('expDesc').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  if (!description) { showAlert('expenseAlert', 'Please enter a description.'); return; }
  if (!amount || amount <= 0) { showAlert('expenseAlert', 'Please enter a valid amount.'); return; }
  try {
    await api('/api/expense', 'POST', { description, amount });
    showAlert('expenseAlert', 'Expense submitted for approval.', 'success');
    document.getElementById('expDesc').value = '';
    document.getElementById('expAmount').value = '';
    loadExpenses();
  } catch (err) {
    showAlert('expenseAlert', err.message);
  }
}

async function loadExpenses() {
  try {
    const txs = await api('/api/transactions?type=expense');
    const el = document.getElementById('expenseList');
    if (!txs.length) { el.innerHTML = '<p class="text-muted small px-2">No expenses yet.</p>'; return; }
    el.innerHTML = buildTxTable(txs, false);
  } catch (e) { console.error(e); }
}

// Suspense
async function addSuspense() {
  const workerName = document.getElementById('susWorker').value.trim();
  const amount = parseFloat(document.getElementById('susAmount').value);
  const reason = document.getElementById('susReason').value.trim();
  if (!workerName) { showAlert('suspenseAlert', 'Please enter worker name.'); return; }
  if (!amount || amount <= 0) { showAlert('suspenseAlert', 'Please enter a valid amount.'); return; }
  if (!reason) { showAlert('suspenseAlert', 'Please enter a reason.'); return; }
  try {
    await api('/api/suspense', 'POST', { workerName, amount, reason });
    showAlert('suspenseAlert', 'Suspense record added.', 'success');
    document.getElementById('susWorker').value = '';
    document.getElementById('susAmount').value = '';
    document.getElementById('susReason').value = '';
    loadSuspenseList();
  } catch (err) {
    showAlert('suspenseAlert', err.message);
  }
}

async function convertSuspense(id) {
  if (!confirm('Convert this suspense to an expense (will require manager approval)?')) return;
  try {
    await api(`/api/suspense/${id}/convert`, 'POST');
    showAlert('suspenseAlert', 'Suspense converted to expense and sent for approval.', 'success');
    loadSuspenseList();
  } catch (err) {
    showAlert('suspenseAlert', err.message);
  }
}

async function markPenalty(id) {
  if (!confirm('Mark this suspense as a penalty? This will deduct from balance.')) return;
  try {
    await api(`/api/suspense/${id}/penalty`, 'POST');
    showAlert('suspenseAlert', 'Marked as penalty.', 'warning');
    loadSuspenseList();
  } catch (err) {
    showAlert('suspenseAlert', err.message);
  }
}

async function loadSuspenseList() {
  try {
    const txs = await api('/api/transactions?type=suspense');
    const el = document.getElementById('suspenseList');
    if (!txs.length) { el.innerHTML = '<p class="text-muted small px-2">No suspense records.</p>'; return; }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Worker</th><th>Amount</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${txs.map(t => {
          const daysSince = Math.floor((Date.now() - new Date(t.createdAt)) / 86400000);
          const overdueBadge = (t.status === 'pending' && daysSince >= 5) ? `<span class="badge bg-warning text-dark ms-1">${daysSince}d</span>` : '';
          return `<tr>
            <td><strong>${escHtml(t.workerName || '-')}</strong></td>
            <td>${fmt(t.amount)}</td>
            <td class="text-muted small">${escHtml(t.reason || '-')}</td>
            <td>${statusBadge(t.status)}${overdueBadge}</td>
            <td class="small">${fmtDate(t.createdAt)}</td>
            <td>
              ${t.status === 'pending' ? `
                <button class="btn cds-btn-sm me-1" onclick="convertSuspense('${t._id}')">→ Expense</button>
                <button class="btn cds-btn-sm danger" onclick="markPenalty('${t._id}')">Penalty</button>
              ` : '—'}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`;
  } catch (e) { console.error(e); }
}

// Daily
function calcDenom() {
  const total =
    (parseInt(document.getElementById('d1000').value) || 0) * 1000 +
    (parseInt(document.getElementById('d500').value) || 0) * 500 +
    (parseInt(document.getElementById('d200').value) || 0) * 200 +
    (parseInt(document.getElementById('d100').value) || 0) * 100 +
    (parseInt(document.getElementById('d50').value) || 0) * 50 +
    (parseInt(document.getElementById('d20').value) || 0) * 20 +
    (parseInt(document.getElementById('d10').value) || 0) * 10 +
    (parseInt(document.getElementById('d5').value) || 0) * 5 +
    (parseInt(document.getElementById('d2').value) || 0) * 2 +
    (parseInt(document.getElementById('d1').value) || 0) * 1 +
    (parseFloat(document.getElementById('dCoins').value) || 0);
  document.getElementById('denomTotalDisplay').textContent = fmt(total);
}

async function closeDay() {
  const denomination = {
    thousands: parseInt(document.getElementById('d1000').value) || 0,
    fiveHundreds: parseInt(document.getElementById('d500').value) || 0,
    twoHundreds: parseInt(document.getElementById('d200').value) || 0,
    hundreds: parseInt(document.getElementById('d100').value) || 0,
    fifties: parseInt(document.getElementById('d50').value) || 0,
    twenties: parseInt(document.getElementById('d20').value) || 0,
    tens: parseInt(document.getElementById('d10').value) || 0,
    fives: parseInt(document.getElementById('d5').value) || 0,
    twos: parseInt(document.getElementById('d2').value) || 0,
    ones: parseInt(document.getElementById('d1').value) || 0,
    coins: parseFloat(document.getElementById('dCoins').value) || 0
  };
  try {
    const res = await api('/api/daily/close', 'POST', { denomination });
    showAlert('dailyAlert', `Day closed. Closing Balance: ${fmt(res.closingBalance)}`, 'success');
    loadDaily();
  } catch (err) {
    showAlert('dailyAlert', err.message);
  }
}

async function loadDaily() {
  setLoading('dailyStatusBadge', 'Loading today status...');
  setLoading('dailyList', 'Loading daily records...');
  try {
    const today = await api('/api/daily/today');
    const badge = document.getElementById('dailyStatusBadge');
    if (badge) {
      badge.innerHTML = today.isClosed
        ? `<span class="cds-badge badge-approved">Day Closed — ${fmt(today.closingBalance)}</span>`
        : `<span class="cds-badge badge-pending">Day Open — Opening: ${fmt(today.openingBalance)}</span>`;
    }
  } catch (e) {
    console.error(e);
    const badge = document.getElementById('dailyStatusBadge');
    if (badge) badge.innerHTML = '<span class="cds-badge badge-rejected">Could not load today status</span>';
  }

  try {
    const records = await api('/api/daily');
    const el = document.getElementById('dailyList');
    if (!records.length) { el.innerHTML = '<p class="text-muted small px-2">No records yet.</p>'; return; }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Date</th><th>Opening</th><th>Closing</th><th>Status</th><th>Closed By</th></tr></thead>
      <tbody>
        ${records.map(r => `<tr>
          <td>${r.date}</td>
          <td>${fmt(r.openingBalance)}</td>
          <td>${r.closingBalance != null ? fmt(r.closingBalance) : '—'}</td>
          <td>${r.isClosed ? statusBadge('approved') : statusBadge('pending')}</td>
          <td class="small">${r.closedBy || '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  } catch (e) {
    console.error(e);
    const el = document.getElementById('dailyList');
    if (el) el.innerHTML = '<p class="text-muted small px-2">Could not load daily records.</p>';
  }
}

// All Transactions
async function loadTransactions() {
  try {
    setLoading('pendingTxList', 'Loading pending approvals...');
    setLoading('historyTxList', 'Loading approval history...');
    const allowReview = currentUserRole === 'manager' || currentUserRole === 'admin';
    const pendingTxs = await api('/api/transactions?status=pending');
    const pendingEl = document.getElementById('pendingTxList');
    if (pendingEl) {
      pendingEl.innerHTML = pendingTxs.length
        ? buildTxTable(pendingTxs, true, allowReview)
        : '<p class="text-muted small px-2">No pending approvals.</p>';
    }

    const type = document.getElementById('historyFilterType')?.value || '';
    const status = document.getElementById('historyFilterStatus')?.value || '';
    let url = '/api/transactions?';
    if (type) url += `type=${type}&`;
    if (status) url += `status=${status}&`;
    const allTxs = await api(url);
    const historyTxs = allTxs.filter((t) => t.status !== 'pending');
    const historyEl = document.getElementById('historyTxList');
    if (historyEl) {
      historyEl.innerHTML = historyTxs.length
        ? buildTxTable(historyTxs, true, false)
        : '<p class="text-muted small px-2">No approval history found.</p>';
    }
  } catch (e) { console.error(e); }
}

function buildTxTable(txs, showType, allowReview = false) {
  return `<div class="table-responsive"><table class="table cds-table">
    <thead><tr>${showType ? '<th>Type</th>' : ''}<th>Description</th><th>Amount</th><th>Status</th><th>Created</th><th>Reviewed By</th>${allowReview ? '<th>Actions</th>' : ''}</tr></thead>
    <tbody>
      ${txs.map(t => `<tr>
        ${showType ? `<td>${typeBadge(t.type)}</td>` : ''}
        <td>${escHtml(t.description)}</td>
        <td>${fmt(t.amount)}</td>
        <td>${statusBadge(t.status)}</td>
        <td class="small">${fmtDateTime(t.createdAt)}</td>
        <td class="small">${t.reviewedBy || '—'}</td>
        ${allowReview ? `<td>${t.status === 'pending' ? `
          <button class="btn cds-btn-approve me-1" onclick="reviewTx('${t._id}', 'approve')">Approve</button>
          <button class="btn cds-btn-reject" onclick="reviewTx('${t._id}', 'reject')">Reject</button>
        ` : '—'}</td>` : ''}
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

// Users
async function loadUsers() {
  try {
    setLoading('userList', 'Loading users...');
    const users = await api('/api/users');
    const el = document.getElementById('userList');
    if (!users.length) { el.innerHTML = '<p class="text-muted small px-2">No users found.</p>'; return; }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Username</th><th>Role</th><th>Created</th><th>Action</th></tr></thead>
      <tbody>
        ${users.map(u => `<tr>
          <td><strong>${escHtml(u.username)}</strong></td>
          <td><span class="cds-badge ${u.role === 'admin' ? 'badge-type-expense' : 'badge-type-suspense'}">${u.role.toUpperCase()}</span></td>
          <td class="small">${fmtDate(u.createdAt)}</td>
          <td>${u.username !== 'admin' ? `<button class="btn cds-btn-sm danger" onclick="deleteUser('${u._id}', '${escHtml(u.username)}')">Delete</button>` : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  } catch (e) { console.error(e); }
}

async function addUser() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;
  if (!username || !password) { showAlert('userAlert', 'Username and password required.'); return; }
  try {
    await api('/api/users', 'POST', { username, password, role });
    showAlert('userAlert', 'User created successfully.', 'success');
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    loadUsers();
  } catch (err) {
    showAlert('userAlert', err.message);
  }
}

async function deleteUser(id, name) {
  if (!confirm(`Delete user "${name}"?`)) return;
  try {
    await api(`/api/users/${id}`, 'DELETE');
    loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
async function addInventoryProduct() {
  const payload = {
    name: document.getElementById('invName')?.value?.trim(),
    category: document.getElementById('invCategory')?.value?.trim(),
    sku: document.getElementById('invSku')?.value?.trim(),
    quantity: parseInt(document.getElementById('invQty')?.value, 10),
    location: document.getElementById('invLocation')?.value?.trim(),
    color: document.getElementById('invColor')?.value?.trim(),
    size: document.getElementById('invSize')?.value?.trim(),
    minStock: parseInt(document.getElementById('invMinStock')?.value, 10)
  };
  if (!payload.name || !payload.category || !payload.sku || !payload.location || Number.isNaN(payload.quantity)) {
    showAlert('invProductAlert', 'Name, category, SKU, quantity and location are required.');
    return;
  }
  try {
    const res = await api('/api/inventory/products', 'POST', payload);
    showAlert('invProductAlert', res.mode === 'refilled' ? 'Existing SKU refilled successfully.' : 'Product added successfully.', 'success');
    ['invName', 'invCategory', 'invSku', 'invQty', 'invLocation', 'invColor', 'invSize'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('invMinStock').value = 30;
    loadInventoryProducts();
    loadInventoryDashboard();
  } catch (err) {
    showAlert('invProductAlert', err.message);
  }
}

async function loadInventoryDashboard() {
  try {
    setLoading('invRecentMovements', 'Loading recent movements...');
    setLoading('invProductTable', 'Loading products...');
    setLoading('invProductTableAdd', 'Loading products...');
    const data = await api('/api/inventory/dashboard');
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('invTotalProducts', data.totalProducts || 0);
    set('invTotalStock', (data.products || []).reduce((sum, p) => sum + (p.totalStock || 0), 0));
    set('invPendingRequests', data.pendingRequests || 0);
    if (currentUserRole !== 'incharge') set('invLowStockCount', (data.lowStockItems || []).length);

    const movementEl = document.getElementById('invRecentMovements');
    if (movementEl) {
      const movements = data.recentMovements || [];
      movementEl.innerHTML = movements.length ? movements.map((m) => `
        <div class="tx-row">
          <div class="tx-info">
            <div class="tx-desc">${escHtml(m.productName)} (${escHtml(m.sku)})</div>
            <div class="tx-meta">${m.movementType.toUpperCase()} · ${escHtml(m.from)} → ${escHtml(m.to)}</div>
          </div>
          <div class="tx-right">
            <div class="tx-amount">${m.quantity}</div>
            <span class="small text-muted">${fmtDateTime(m.timestamp)}</span>
          </div>
        </div>`).join('') : '<p class="text-muted small px-2">No movements yet.</p>';
    }
    loadInventoryProducts(data.products || []);
  } catch (err) {
    showAlert('invDashAlert', err.message);
  }
}

async function loadInventoryProducts(existingProducts = null) {
  try {
    const q = document.getElementById('invFilterQ')?.value?.trim() || '';
    const lowStockOnly = (currentUserRole !== 'incharge' && document.getElementById('invFilterLow')?.checked) ? 'true' : '';
    let products = existingProducts;
    if (!products) {
      const query = new URLSearchParams();
      if (q) query.set('q', q);
      if (lowStockOnly) query.set('lowStock', 'true');
      products = await api(`/api/inventory/products?${query.toString()}`);
    }
    const showLowStock = currentUserRole !== 'incharge';
    const html = products.length ? `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Location</th><th>Total</th><th>Reserved</th><th>Min</th></tr></thead>
      <tbody>${products.map((p) => `<tr>
        <td><strong>${escHtml(p.name)}</strong>${p.color ? `<div class="small text-muted">Color: ${escHtml(p.color)}</div>` : ''}${p.size ? `<div class="small text-muted">Size: ${escHtml(p.size)}</div>` : ''}</td>
        <td>${escHtml(p.sku)}</td>
        <td>${escHtml(p.category)}</td>
        <td>${escHtml(p.location)}</td>
        <td>${p.totalStock}</td>
        <td>${p.reservedStock}</td>
        <td>${p.minStock}${showLowStock && p.availableStock < p.minStock ? ' <span class="badge bg-warning text-dark">Low</span>' : ''}</td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="text-muted small px-2">No inventory products found.</p>';
    const el = document.getElementById('invProductTable');
    if (el) el.innerHTML = html;
    const elAdd = document.getElementById('invProductTableAdd');
    if (elAdd) elAdd.innerHTML = html;

    const select = document.getElementById('reqProduct');
    if (select) {
      select.innerHTML = '<option value="">Select product</option>' + products.map((p) =>
        `<option value="${p._id}">${escHtml(p.name)} (${escHtml(p.sku)}) - Stock: ${p.totalStock}</option>`).join('');
    }
  } catch (err) {
    showAlert('invDashAlert', err.message);
  }
}

async function createStockRequest() {
  const productId = document.getElementById('reqProduct')?.value;
  const quantity = parseInt(document.getElementById('reqQty')?.value, 10);
  const section = document.getElementById('reqSection')?.value;
  if (!productId || Number.isNaN(quantity) || quantity <= 0 || !section) {
    showAlert('invRequestAlert', 'Select product, quantity and section.');
    return;
  }
  try {
    await api('/api/inventory/requests', 'POST', { productId, quantity, section });
    showAlert('invRequestAlert', 'Stock request submitted.', 'success');
    document.getElementById('reqQty').value = '';
    loadInventoryRequests();
    loadInventoryDashboard();
  } catch (err) {
    showAlert('invRequestAlert', err.message);
  }
}

async function loadInventoryRequests() {
  try {
    setLoading('invRequestTable', 'Loading requests...');
    await loadInventoryProducts();
    const requests = await api('/api/inventory/requests');
    const el = document.getElementById('invRequestTable');
    if (!el) return;
    el.innerHTML = requests.length ? `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Product</th><th>Qty</th><th>Section</th><th>Status</th><th>Requested By</th><th>Date</th></tr></thead>
      <tbody>${requests.map((r) => `<tr>
        <td>${escHtml(r.productName)}<div class="small text-muted">${escHtml(r.sku)}</div></td>
        <td>${r.quantity}</td>
        <td>${escHtml(r.section)}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${escHtml(r.requestedBy)}</td>
        <td class="small">${fmtDateTime(r.createdAt)}</td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="text-muted small px-2">No requests found.</p>';
  } catch (err) {
    showAlert('invRequestAlert', err.message);
  }
}

async function reviewInventoryRequest(id, action) {
  try {
    await api(`/api/inventory/requests/${id}/review`, 'POST', { action });
    showAlert('invApprovalAlert', `Request ${action}d.`, action === 'approve' ? 'success' : 'warning');
    loadInventoryApprovals();
    loadInventoryIssue();
    loadInventoryDashboard();
  } catch (err) {
    showAlert('invApprovalAlert', err.message);
  }
}

async function loadInventoryApprovals() {
  try {
    setLoading('invApprovalTable', 'Loading approvals...');
    const requests = await api('/api/inventory/requests?status=pending');
    const el = document.getElementById('invApprovalTable');
    if (!el) return;
    el.innerHTML = requests.length ? `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Product</th><th>Qty</th><th>Section</th><th>Requested By</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${requests.map((r) => `<tr>
        <td>${escHtml(r.productName)}<div class="small text-muted">${escHtml(r.sku)}</div></td>
        <td>${r.quantity}</td>
        <td>${escHtml(r.section)}</td>
        <td>${escHtml(r.requestedBy)}</td>
        <td class="small">${fmtDateTime(r.createdAt)}</td>
        <td>
          <button class="btn cds-btn-approve me-1" onclick="reviewInventoryRequest('${r._id}','approve')">Approve</button>
          <button class="btn cds-btn-reject" onclick="reviewInventoryRequest('${r._id}','reject')">Reject</button>
        </td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="text-muted small px-2">No pending approvals.</p>';
  } catch (err) {
    showAlert('invApprovalAlert', err.message);
  }
}

async function issueInventoryRequest(id) {
  try {
    await api(`/api/inventory/requests/${id}/issue`, 'POST');
    showAlert('invIssueAlert', 'Stock issued successfully.', 'success');
    loadInventoryIssue();
    loadInventoryMovements();
    loadInventoryDashboard();
  } catch (err) {
    showAlert('invIssueAlert', err.message);
  }
}

async function loadInventoryIssue() {
  try {
    setLoading('invIssueTable', 'Loading issue queue...');
    const requests = await api('/api/inventory/requests?status=approved');
    const el = document.getElementById('invIssueTable');
    if (!el) return;
    el.innerHTML = requests.length ? `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Product</th><th>Qty</th><th>Section</th><th>Approved By</th><th>Date</th><th>Issue</th></tr></thead>
      <tbody>${requests.map((r) => `<tr>
        <td>${escHtml(r.productName)}<div class="small text-muted">${escHtml(r.sku)}</div></td>
        <td>${r.quantity}</td>
        <td>${escHtml(r.section)}</td>
        <td>${escHtml(r.reviewedBy || '-')}</td>
        <td class="small">${fmtDateTime(r.reviewedAt || r.createdAt)}</td>
        <td><button class="btn cds-btn-primary btn-sm" onclick="issueInventoryRequest('${r._id}')">Issue</button></td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="text-muted small px-2">No approved requests to issue.</p>';
  } catch (err) {
    showAlert('invIssueAlert', err.message);
  }
}

async function loadInventoryMovements() {
  try {
    setLoading('invMovementTable', 'Loading movements...');
    const movements = await api('/api/inventory/movements');
    const el = document.getElementById('invMovementTable');
    if (!el) return;
    el.innerHTML = movements.length ? `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Type</th><th>Product</th><th>Qty</th><th>From</th><th>To</th><th>Approved By</th><th>Timestamp</th></tr></thead>
      <tbody>${movements.map((m) => `<tr>
        <td>${statusBadge(m.movementType === 'inbound' ? 'approved' : 'pending')}</td>
        <td>${escHtml(m.productName)}<div class="small text-muted">${escHtml(m.sku)}</div></td>
        <td>${m.quantity}</td>
        <td>${escHtml(m.from)}</td>
        <td>${escHtml(m.to)}</td>
        <td>${escHtml(m.approvedBy || '-')}</td>
        <td class="small">${fmtDateTime(m.timestamp)}</td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="text-muted small px-2">No movement records.</p>';
  } catch (err) {
    showAlert('invMoveAlert', err.message);
  }
}

// ─── VEHICLE LOG BOOK ────────────────────────────────────────────────────────
let vehicleExpenseRows = [];

function vehicleExpenseRowMarkup(idx, row = {}) {
  const type = row.expenseType || 'service';
  return `<div class="row g-2 mb-2" data-expense-row="${idx}">
    <div class="col-md-3">
      <select class="form-select cds-input" data-expense-field="expenseType">
        <option value="service" ${type === 'service' ? 'selected' : ''}>Service</option>
        <option value="repair" ${type === 'repair' ? 'selected' : ''}>Repair</option>
        <option value="oil" ${type === 'oil' ? 'selected' : ''}>Oil</option>
        <option value="other" ${type === 'other' ? 'selected' : ''}>Other</option>
      </select>
    </div>
    <div class="col-md-2"><input type="number" min="0" step="0.01" class="form-control cds-input" data-expense-field="amount" value="${row.amount || ''}" placeholder="Amount" /></div>
    <div class="col-md-3"><input type="date" class="form-control cds-input" data-expense-field="date" value="${row.date || ''}" /></div>
    <div class="col-md-3"><input type="text" class="form-control cds-input" data-expense-field="description" value="${escHtml(row.description || '')}" placeholder="Description" /></div>
    <div class="col-md-1"><button class="btn cds-btn-sm danger w-100" onclick="removeVehicleExpenseRow(${idx})">×</button></div>
  </div>`;
}

function renderVehicleExpenseRows() {
  const wrap = document.getElementById('vehicleExpenseRows');
  if (!wrap) return;
  wrap.innerHTML = vehicleExpenseRows.map((row, idx) => vehicleExpenseRowMarkup(idx, row)).join('');
}

function addVehicleExpenseRow() {
  vehicleExpenseRows.push({ expenseType: 'service', amount: '', date: '', description: '' });
  renderVehicleExpenseRows();
}

function removeVehicleExpenseRow(idx) {
  vehicleExpenseRows = vehicleExpenseRows.filter((_, i) => i !== idx);
  renderVehicleExpenseRows();
}

async function loadVehicleList() {
  const datalist = document.getElementById('vehicleNumberList');
  if (!datalist) return;
  datalist.innerHTML = '';
  try {
    const vehicles = await api('/api/vehicles');
    datalist.innerHTML = vehicles.map((v) => `<option value="${escHtml(v.vehicleNumber)}">${escHtml(v.vehicleNumber)}</option>`).join('');
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

async function applyVehicleBaseline() {
  const vehicleNumber = document.getElementById('vehicleNumber')?.value?.trim().toUpperCase();
  const vehicleInput = document.getElementById('vehicleNumber');
  if (vehicleInput && vehicleNumber) vehicleInput.value = vehicleNumber;
  if (!vehicleNumber) return;
  try {
    const baseline = await api(`/api/vehicle-logs/baseline?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
    const startKmEl = document.getElementById('startKm');
    const avFuelEl = document.getElementById('availableFuel');
    const expMileageEl = document.getElementById('expectedMileage');
    const pKmEl = document.getElementById('profileOpeningKm');
    const pFuelEl = document.getElementById('profileOpeningFuel');
    const pExpEl = document.getElementById('profileExpectedMileage');
    if (startKmEl) startKmEl.value = baseline.startKm || 0;
    if (avFuelEl) avFuelEl.value = baseline.availableFuel || 0;
    if (expMileageEl) expMileageEl.value = baseline.expectedMileage != null ? baseline.expectedMileage : '';
    if (pKmEl) pKmEl.value = baseline.startKm || 0;
    if (pFuelEl) pFuelEl.value = baseline.availableFuel || 0;
    if (pExpEl) pExpEl.value = baseline.expectedMileage != null ? baseline.expectedMileage : '';
    calcVehicleDistance();
    calcVehicleFuelUsed();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

function calcVehicleDistance() {
  const startKm = Number(document.getElementById('startKm')?.value || 0);
  const endKm = Number(document.getElementById('endKm')?.value || 0);
  const distance = Math.max(0, endKm - startKm);
  const el = document.getElementById('distanceTravelled');
  if (el) el.value = distance.toFixed(2);
}

function calcVehicleFuelUsed() {
  const availableFuel = Number(document.getElementById('availableFuel')?.value || 0);
  const fuelAdded = Number(document.getElementById('fuelAdded')?.value || 0);
  const remainingRaw = document.getElementById('remainingFuel')?.value;
  const remainingFuel = remainingRaw === '' ? null : Number(remainingRaw);
  const distance = Number(document.getElementById('distanceTravelled')?.value || 0);
  const expectedMileage = Number(document.getElementById('expectedMileage')?.value || 0);
  const fuelUsedManualRaw = document.getElementById('fuelUsedInput')?.value;
  const fuelUsedManual = fuelUsedManualRaw === '' ? null : Number(fuelUsedManualRaw);
  const fuelUsedEl = document.getElementById('fuelUsed');
  const lowFuelEl = document.getElementById('lowFuelBadge');
  const actualMileageEl = document.getElementById('actualMileage');
  const mileageDeltaEl = document.getElementById('mileageDelta');
  let fuelUsed = null;
  let finalRemaining = null;
  if (remainingFuel != null && Number.isFinite(remainingFuel)) {
    fuelUsed = availableFuel + fuelAdded - remainingFuel;
    finalRemaining = remainingFuel;
  } else if (fuelUsedManual != null && Number.isFinite(fuelUsedManual)) {
    fuelUsed = fuelUsedManual;
    finalRemaining = availableFuel + fuelAdded - fuelUsedManual;
  } else if (expectedMileage > 0 && distance >= 0) {
    fuelUsed = distance / expectedMileage;
    finalRemaining = availableFuel + fuelAdded - fuelUsed;
  }
  if (fuelUsedEl) fuelUsedEl.value = fuelUsed != null && Number.isFinite(fuelUsed) ? Math.max(0, fuelUsed).toFixed(2) : '';
  if (lowFuelEl) lowFuelEl.innerHTML = finalRemaining != null && finalRemaining <= 2 ? '<span class="cds-badge badge-rejected">LOW FUEL</span>' : '';
  const actual = fuelUsed && fuelUsed > 0 ? (distance / fuelUsed) : 0;
  if (actualMileageEl) actualMileageEl.value = fuelUsed > 0 ? actual.toFixed(2) : '';
  if (mileageDeltaEl) {
    if (fuelUsed > 0 && expectedMileage > 0) {
      const delta = actual - expectedMileage;
      mileageDeltaEl.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} km/L vs expected`;
      mileageDeltaEl.className = delta < 0 ? 'small text-danger mt-1' : 'small text-success mt-1';
    } else {
      mileageDeltaEl.textContent = '';
    }
  }
}

async function submitVehicleLog() {
  const remainingRaw = document.getElementById('remainingFuel')?.value;
  const fuelUsedInputRaw = document.getElementById('fuelUsedInput')?.value;
  const payload = {
    driverName: document.getElementById('driverName')?.value?.trim(),
    vehicleNumber: document.getElementById('vehicleNumber')?.value?.trim().toUpperCase(),
    fromLocation: document.getElementById('fromLocation')?.value?.trim(),
    toLocation: document.getElementById('toLocation')?.value?.trim(),
    startDateTime: document.getElementById('startDateTime')?.value,
    endDateTime: document.getElementById('endDateTime')?.value,
    endKm: Number(document.getElementById('endKm')?.value),
    fuelAdded: Number(document.getElementById('fuelAdded')?.value || 0),
    remainingFuel: remainingRaw === '' ? null : Number(remainingRaw),
    fuelUsedInput: fuelUsedInputRaw === '' ? null : Number(fuelUsedInputRaw),
    mileageReason: document.getElementById('mileageReason')?.value?.trim() || '',
    fuelFillDate: document.getElementById('fuelFillDate')?.value || null,
    expenses: []
  };
  document.querySelectorAll('[data-expense-row]').forEach((row) => {
    const expenseType = row.querySelector('[data-expense-field="expenseType"]')?.value;
    const amount = Number(row.querySelector('[data-expense-field="amount"]')?.value || 0);
    const date = row.querySelector('[data-expense-field="date"]')?.value;
    const description = row.querySelector('[data-expense-field="description"]')?.value || '';
    if (expenseType && date && amount >= 0) payload.expenses.push({ expenseType, amount, date, description });
  });
  if (!payload.driverName || !payload.vehicleNumber || !payload.fromLocation || !payload.toLocation || !payload.startDateTime || !payload.endDateTime) {
    showAlert('vehicleAlert', 'Please fill all required fields.');
    return;
  }
  try {
    await api('/api/vehicle-logs', 'POST', payload);
    showAlert('vehicleAlert', 'Vehicle log submitted for manager approval.', 'success');
    ['driverName', 'fromLocation', 'toLocation', 'startDateTime', 'endDateTime', 'endKm', 'fuelAdded', 'remainingFuel', 'fuelFillDate'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    vehicleExpenseRows = [];
    renderVehicleExpenseRows();
    await applyVehicleBaseline();
    loadVehicleHistory();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

async function saveVehicleProfile() {
  const vehicleNumber = document.getElementById('vehicleNumber')?.value?.trim().toUpperCase();
  const openingKm = Number(document.getElementById('profileOpeningKm')?.value);
  const openingFuel = Number(document.getElementById('profileOpeningFuel')?.value);
  const expectedMileage = document.getElementById('profileExpectedMileage')?.value;
  if (!vehicleNumber) {
    showAlert('vehicleAlert', 'Enter vehicle number first to save profile.');
    return;
  }
  try {
    await api('/api/vehicle-profiles', 'POST', {
      vehicleNumber,
      openingKm,
      openingFuel,
      expectedMileage
    });
    showAlert('vehicleAlert', 'Vehicle profile saved.', 'success');
    await loadVehicleList();
    await applyVehicleBaseline();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

async function loadVehicleEntryForm() {
  setLoading('vehicleHistoryList', 'Loading vehicle history...');
  setLoading('vehicleHistoryListCompact', 'Loading vehicle history...');
  await loadVehicleList();
  await applyVehicleBaseline();
  vehicleExpenseRows = [];
  renderVehicleExpenseRows();
}

function vehicleStatusBadge(status) {
  const cls = status === 'approved' ? 'badge-approved' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
  return `<span class="cds-badge ${cls}">${status.toUpperCase()}</span>`;
}

function renderVehicleLogsTable(logs, includeActions = false) {
  return `<div class="table-responsive"><table class="table cds-table">
    <thead><tr><th>Vehicle</th><th>Driver</th><th>Route</th><th>KM</th><th>Fuel</th><th>Expenses</th><th>Status</th>${includeActions ? '<th>Actions</th>' : ''}</tr></thead>
    <tbody>${logs.map((l) => `<tr>
      <td><strong>${escHtml(l.vehicleNumber)}</strong></td>
      <td>${escHtml(l.driverName)}</td>
      <td><div class="small">${escHtml(l.fromLocation)} → ${escHtml(l.toLocation)}</div><div class="small text-muted">${fmtDateTime(l.startDateTime)} to ${fmtDateTime(l.endDateTime)}</div></td>
      <td><div class="small">Start: ${l.startKm}</div><div class="small">End: ${l.endKm}</div><div><strong>${(l.distanceTravelled || 0).toFixed(2)} km</strong></div></td>
      <td><div class="small">Avail: ${l.availableFuel} L</div><div class="small">Added: ${l.fuelAdded} L</div><div class="small">Remain: ${l.remainingFuel} L ${l.isLowFuel ? '<span class="badge bg-warning text-dark">LOW</span>' : ''}</div><div class="small">Used: ${(l.fuelUsed || 0).toFixed(2)} L</div><div class="small">Mileage: ${l.mileage != null ? l.mileage : '—'} km/L</div></td>
      <td><div class="small">${(l.expenses || []).length} item(s)</div><div class="small">${fmt((l.expenses || []).reduce((s, e) => s + (e.amount || 0), 0))}</div></td>
      <td>${vehicleStatusBadge(l.status)}${l.rejectReason ? `<div class="small text-danger mt-1">Reason: ${escHtml(l.rejectReason)}</div>` : ''}<div class="small text-muted mt-1">${escHtml(l.createdBy || '')}</div></td>
      ${includeActions ? `<td>${l.status === 'pending' ? `
        <button class="btn cds-btn-approve me-1" onclick="reviewVehicleLog('${l._id}', 'approve')">Approve</button>
        <button class="btn cds-btn-reject" onclick="reviewVehicleLog('${l._id}', 'reject')">Reject</button>
      ` : '—'}</td>` : ''}
    </tr>`).join('')}</tbody></table></div>`;
}

async function loadVehicleHistory() {
  try {
    setLoading('vehicleHistoryList', 'Loading vehicle history...');
    setLoading('vehicleHistoryListCompact', 'Loading vehicle history...');
    const logs = await api('/api/vehicle-logs');
    const html = logs.length ? renderVehicleLogsTable(logs, false) : '<p class="text-muted small px-2">No vehicle logs found.</p>';
    const el = document.getElementById('vehicleHistoryList');
    if (el) el.innerHTML = html;
    const compactEl = document.getElementById('vehicleHistoryListCompact');
    if (compactEl) compactEl.innerHTML = html;
  } catch (err) {
    showAlert('vehicleHistoryAlert', err.message);
    showAlert('vehicleHistoryAlertCompact', err.message);
  }
}

async function loadVehicleApprovals() {
  try {
    setLoading('vehiclePendingList', 'Loading pending vehicle logs...');
    setLoading('vehicleReviewedList', 'Loading reviewed vehicle logs...');
    const pending = await api('/api/vehicle-logs?status=pending');
    const reviewed = await api('/api/vehicle-logs');
    const pendingEl = document.getElementById('vehiclePendingList');
    const reviewedEl = document.getElementById('vehicleReviewedList');
    if (pendingEl) pendingEl.innerHTML = pending.length ? renderVehicleLogsTable(pending, true) : '<p class="text-muted small px-2">No pending vehicle logs.</p>';
    const history = reviewed.filter((l) => l.status !== 'pending');
    if (reviewedEl) reviewedEl.innerHTML = history.length ? renderVehicleLogsTable(history, false) : '<p class="text-muted small px-2">No reviewed logs.</p>';
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

async function reviewVehicleLog(id, action) {
  const payload = { action };
  if (action === 'reject') {
    const reason = prompt('Enter reject reason');
    if (!reason) return;
    payload.reason = reason;
  }
  try {
    await api(`/api/vehicle-logs/${id}/review`, 'POST', payload);
    loadVehicleApprovals();
    loadDashboard();
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

async function loadVehicleReports() {
  try {
    setLoading('vehicleReportList', 'Loading vehicle reports...');
    const rows = await api('/api/vehicle-logs/reports');
    const el = document.getElementById('vehicleReportList');
    if (!el) return;
    el.innerHTML = rows.length ? `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Vehicle</th><th>Trips</th><th>Distance (km)</th><th>Fuel Used (L)</th><th>Mileage (km/L)</th><th>Expenses</th><th>Low Fuel Trips</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><strong>${escHtml(r.vehicleNumber)}</strong></td>
        <td>${r.tripCount}</td>
        <td>${Number(r.totalDistance || 0).toFixed(2)}</td>
        <td>${Number(r.totalFuelUsed || 0).toFixed(2)}</td>
        <td>${r.avgMileage != null ? r.avgMileage : '—'}</td>
        <td>${fmt(r.totalExpenses || 0)}</td>
        <td>${r.lowFuelCount || 0}</td>
      </tr>`).join('')}</tbody></table></div>` : '<p class="text-muted small px-2">No approved vehicle logs for reports.</p>';
  } catch (err) {
    showAlert('vehicleReportAlert', err.message);
  }
}

// ─── MANAGER PAGE ─────────────────────────────────────────────────────────────
async function initManager() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (me.role !== 'manager') { window.location.href = '/'; return; }
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
  } catch {
    window.location.href = '/';
    return;
  }
  loadManagerData();
}

// ─── INCHARGE PAGE ────────────────────────────────────────────────────────────
async function initIncharge() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (me.role !== 'incharge') { window.location.href = '/'; return; }
    currentUserRole = me.role;
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
  } catch {
    window.location.href = '/';
    return;
  }
  showSection('inventoryRequests');
}

async function initSecurity() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (me.role !== 'security') { window.location.href = '/'; return; }
    currentUserRole = me.role;
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
    setupSecurityMenu();
  } catch {
    window.location.href = '/';
    return;
  }
  showSection('vehicleEntry');
}

async function loadManagerData() {
  try {
    const pending = await api('/api/transactions/pending');
    const allTxs = await api('/api/transactions');
    const me = (await api('/api/me')).username;

    document.getElementById('pendingCount').textContent = pending.length;

    const today = new Date().toDateString();
    const myApproved = allTxs.filter(t => t.reviewedBy === me && t.status === 'approved' && new Date(t.reviewedAt).toDateString() === today);
    const myRejected = allTxs.filter(t => t.reviewedBy === me && t.status === 'rejected' && new Date(t.reviewedAt).toDateString() === today);
    document.getElementById('approvedCount').textContent = myApproved.length;
    document.getElementById('rejectedCount').textContent = myRejected.length;

    const el = document.getElementById('pendingList');
    if (!pending.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>All caught up! No pending approvals.</p></div>';
      return;
    }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Type</th><th>Description</th><th>Amount</th><th>Created By</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${pending.map(t => `<tr>
          <td>${typeBadge(t.type)}</td>
          <td>
            <div>${escHtml(t.description)}</div>
            ${t.workerName ? `<div class="text-muted small">Worker: ${escHtml(t.workerName)}</div>` : ''}
          </td>
          <td><strong>${fmt(t.amount)}</strong></td>
          <td class="small">${escHtml(t.createdBy || '—')}</td>
          <td class="small">${fmtDateTime(t.createdAt)}</td>
          <td>
            <button class="btn cds-btn-approve me-1" onclick="reviewTx('${t._id}', 'approve')">✓ Approve</button>
            <button class="btn cds-btn-reject" onclick="reviewTx('${t._id}', 'reject')">✗ Reject</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  } catch (e) {
    console.error(e);
    showAlert('approvalAlert', 'Failed to load data.');
  }
}

async function reviewTx(id, action) {
  const label = action === 'approve' ? 'approve' : 'reject';
  if (!confirm(`Are you sure you want to ${label} this transaction?`)) return;
  try {
    await api(`/api/transactions/${id}/${action}`, 'POST');
    showAlert('approvalAlert', `Transaction ${label}d successfully.`, action === 'approve' ? 'success' : 'warning');
    loadManagerData();
  } catch (err) {
    showAlert('approvalAlert', err.message);
  }
}

// ─── XSS Protection ──────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Page Init ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path === '/admin' || path === '/admin.html' || path === '/manager' || path === '/manager.html') initAdmin();
  else if (path === '/incharge' || path === '/incharge.html') initIncharge();
  else if (path === '/security' || path === '/security.html') initSecurity();
  // Login page has no init needed
});
