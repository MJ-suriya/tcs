// ─── Utilities ───────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

<<<<<<< HEAD
function formatDateTime12h(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = pad(d.getDate());
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = pad(hours);
  return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
    penalty: 'badge-penalty',
    active: 'badge-approved',
    settlement_pending: 'badge-pending',
    closed: 'badge-approved',
    auto_penalty_applied: 'badge-penalty',
    partially_settled: 'badge-pending',
    partially_cleared: 'badge-pending',
    fully_cleared: 'badge-approved'
  };
  return `<span class="cds-badge ${map[status] || ''}">${String(status || '').replace(/_/g, ' ').toUpperCase()}</span>`;
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
<<<<<<< HEAD
    if (data.role === 'security') window.location.href = '/security';
=======
    if (data.role === 'incharge') window.location.href = '/incharge';
    else if (data.role === 'security') window.location.href = '/security';
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
  // Manager should not see users (admin-only)
  ['users'].forEach((section) => setNavVisibility(section, false));
  ['vehicleApprovals', 'vehicleReports', 'vehicleExpenses', 'vehicleFuel'].forEach((section) => setNavVisibility(section, true));
=======
  // Manager can approve/review, but should not see admin-only CDB entry forms.
  ['credit', 'expense', 'suspense', 'users'].forEach((section) => setNavVisibility(section, false));
  ['transactions', 'inventoryDashboard', 'inventoryAddProduct', 'inventoryRequests', 'inventoryApprovals', 'inventoryIssue', 'inventoryMovements', 'vehicleApprovals', 'vehicleReports']
    .forEach((section) => setNavVisibility(section, true));
  setNavVisibility('daily', true);
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  setNavVisibility('vehicleEntry', false);
}

function setupSecurityMenu() {
<<<<<<< HEAD
  ['users', 'vehicleApprovals', 'vehicleReports'].forEach((section) => setNavVisibility(section, false));
  ['vehicleEntry', 'vehicleHistory', 'vehicleExpenses', 'vehicleFuel'].forEach((section) => setNavVisibility(section, true));
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    users: 'Admin - User Management',
    vehicleProfiles: 'Vehicle Log - Profile Setup',
    vehicleEntry: 'Vehicle Log - New Entry',
    vehicleFuel: 'Vehicle Log - Add Fuel',
    vehicleExpenses: 'Vehicle Log - Expenses',
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
  if (name === 'users') { loadBranchesDropdowns(); loadUsers(); }
  else if (name === 'fuelPrices') loadFuelPricesAdmin();
  else if (name === 'vehicleProfiles') loadVehicleProfilesAdmin();
  else if (name === 'branches') loadBranchesAdmin();
  else if (name === 'vehicleEntry') loadVehicleEntryForm();
  else if (name === 'vehicleFuel') loadFuelForm();
  else if (name === 'vehicleExpenses') {
    loadVehicleList();
    loadVehicleExpenses();
  }
  else if (name === 'vehicleHistory') loadVehicleHistory();
  else if (name === 'vehicleApprovals') loadVehicleApprovals();
  else if (name === 'vehicleReports') loadVehicleReports();
  else if (name === 'scrapProducts') loadScrapProducts();
  else if (name === 'scrapEntry') {
    initScrapEntryForm();
=======
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
  else if (name === 'scrapDashboard') initScrapDashboard();
  else if (name === 'scrapProducts') loadScrapProducts();
  else if (name === 'scrapEntry') {
    loadScrapProductDropdown();
    loadScrapMyEntries();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  }
  else if (name === 'scrapHistory') loadScrapMyHistory();
  else if (name === 'scrapApprovals') loadScrapApprovals();
  else if (name === 'scrapReports') loadScrapReports();
}

async function initAdmin() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (!['admin', 'manager'].includes(me.role)) { window.location.href = '/'; return; }
    currentUserRole = me.role;
<<<<<<< HEAD
    currentUser = me;
=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
    if (me.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach((el) => el.classList.add('d-none'));
      setupManagerMenu();
<<<<<<< HEAD
=======
      setupManagerDailyView();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    }
  } catch {
    window.location.href = '/';
    return;
  }
<<<<<<< HEAD
  if (currentUserRole === 'manager') {
    showSection('vehicleApprovals');
  } else {
    showSection('vehicleEntry');
  }
}

async function initSecurity() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (me.role !== 'security') { window.location.href = '/'; return; }
    currentUserRole = me.role;
    currentUser = me;
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

// Users
=======
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
    const suspenseArsEl = document.getElementById('suspenseArsTotal');
    if (suspenseArsEl) suspenseArsEl.textContent = fmt(bal.suspenseArsTotal || 0);
    const pendingSettlementEl = document.getElementById('pendingSettlementCount');
    if (pendingSettlementEl) pendingSettlementEl.textContent = bal.totalPendingSettlements || 0;
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
let openArsSettlementId = null;
const arsSettlementDrafts = new Map(); // suspenseId -> { returned, expense, penalty, penaltyTouched }

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
  try {
    await api(`/api/suspense/${id}/convert`, 'POST');
    showAlert('suspenseAlert', 'Suspense converted to expense and sent for approval.', 'success');
    loadSuspenseList();
  } catch (err) {
    showAlert('suspenseAlert', err.message);
  }
}

async function markPenalty(id) {
  try {
    await api(`/api/suspense/${id}/penalty`, 'POST');
    showAlert('suspenseAlert', 'Penalty request submitted for manager approval.', 'warning');
    loadSuspenseList();
  } catch (err) {
    showAlert('suspenseAlert', err.message);
  }
}

function getArsDraft(id, originalAmount, existingSettlement = null) {
  if (arsSettlementDrafts.has(id)) return arsSettlementDrafts.get(id);
  const returned = Number(existingSettlement?.returnedAmount || 0);
  const expense = Number(existingSettlement?.expenseAmount || 0);
  const remaining = Number((Number(originalAmount || 0) - returned - expense).toFixed(2));
  const draft = {
    returned,
    expense,
    penalty: Number(existingSettlement?.penaltyAmount ?? remaining) || 0,
    penaltyTouched: false
  };
  arsSettlementDrafts.set(id, draft);
  return draft;
}

function calcArsPenalty(originalAmount, returned, expense) {
  return Number((Number(originalAmount || 0) - Number(returned || 0) - Number(expense || 0)).toFixed(2));
}

function toggleArsSettlementForm(id) {
  openArsSettlementId = openArsSettlementId === id ? null : id;
  loadSuspenseList();
}

function updateArsSettlementDraft(id, field, value, originalAmount) {
  const draft = arsSettlementDrafts.get(id);
  if (!draft) return;
  if (field === 'returned' || field === 'expense') {
    draft[field] = Number(value || 0);
    if (!draft.penaltyTouched) {
      draft.penalty = Math.max(0, calcArsPenalty(originalAmount, draft.returned, draft.expense));
    }
  } else if (field === 'penalty') {
    draft.penalty = Number(value || 0);
    draft.penaltyTouched = true;
  } else if (field === 'autoPenalty') {
    draft.penalty = Math.max(0, calcArsPenalty(originalAmount, draft.returned, draft.expense));
    draft.penaltyTouched = false;
  }
  arsSettlementDrafts.set(id, draft);
  // Lightweight re-render: reload list (keeps inline UX consistent in this app)
  loadSuspenseList();
}

async function submitArsSettlement(id, originalAmount) {
  const draft = arsSettlementDrafts.get(id);
  if (!draft) return;
  const returnedAmount = Number(draft.returned || 0);
  const expenseAmount = Number(draft.expense || 0);
  const penaltyAmount = Number(draft.penalty || 0);
  if ([returnedAmount, expenseAmount, penaltyAmount].some((n) => !Number.isFinite(n) || n < 0)) {
    showAlert('suspenseAlert', 'Returned/Expense/Penalty must be valid non-negative numbers.');
    return;
  }
  const total = Number((returnedAmount + expenseAmount + penaltyAmount).toFixed(2));
  const original = Number(Number(originalAmount || 0).toFixed(2));
  if (total !== original) {
    showAlert('suspenseAlert', `Validation failed: Returned + Expense + Penalty must equal ${fmt(original)}.`);
    return;
  }
  try {
    await api(`/api/suspense/${id}/settle`, 'POST', { returnedAmount, expenseAmount, penaltyAmount });
    showAlert('suspenseAlert', 'Settlement submitted for manager approval.', 'success');
    openArsSettlementId = null;
    arsSettlementDrafts.delete(id);
    loadSuspenseList();
    loadDashboard();
  } catch (err) {
    showAlert('suspenseAlert', err.message);
  }
}

let openArsLateAdjustId = null;
const arsLateAdjustDrafts = new Map(); // suspenseId -> { returned }

function toggleArsLateAdjustForm(id) {
  openArsLateAdjustId = openArsLateAdjustId === id ? null : id;
  loadSuspenseList();
}

function updateArsLateAdjustDraft(id, value) {
  arsLateAdjustDrafts.set(id, { returned: Number(value || 0) });
  loadSuspenseList();
}

function getPenaltyRemaining(t) {
  const basePenalty = Number(t?.lateClearance?.remainingPenalty);
  if (Number.isFinite(basePenalty)) return basePenalty;
  return Number(t?.suspenseSettlement?.penaltyAmount || 0);
}

async function submitArsLateReturn(id, remainingPenalty) {
  const draft = arsLateAdjustDrafts.get(id) || { returned: 0 };
  const returnedAmount = Number(draft.returned || 0);
  if (!Number.isFinite(returnedAmount) || returnedAmount <= 0) {
    showAlert('suspenseAlert', 'Returned amount must be a positive number.');
    return;
  }
  if (returnedAmount > remainingPenalty) {
    showAlert('suspenseAlert', 'Returned amount cannot exceed current penalty.');
    return;
  }
  try {
    await api(`/api/suspense/${id}/late-return`, 'POST', { returnedAmount });
    showAlert('suspenseAlert', 'Late return applied. Penalty updated.', 'success');
    openArsLateAdjustId = null;
    arsLateAdjustDrafts.delete(id);
    loadSuspenseList();
    loadDashboard();
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
      <thead><tr><th>Worker</th><th>Amount</th><th>ARS Balance</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${txs.map(t => {
          const daysSince = Math.floor((Date.now() - new Date(t.createdAt)) / 86400000);
          const overdueBadge = (['active', 'approved'].includes(t.status) && daysSince >= 5) ? `<span class="badge bg-warning text-dark ms-1">${daysSince}d</span>` : '';
          const isOpen = openArsSettlementId === t._id;
          const originalAmount = Number(t.amount || 0);
          const settlement = t.suspenseSettlement || null;
          const draft = (isOpen && (t.status === 'active' || t.status === 'approved')) ? getArsDraft(t._id, originalAmount, settlement?.reviewStatus === 'rejected' ? settlement : null) : null;
          const calcPenalty = draft ? calcArsPenalty(originalAmount, draft.returned, draft.expense) : 0;
          const total = draft ? Number((draft.returned + draft.expense + draft.penalty).toFixed(2)) : 0;
          const totalOk = draft ? Number(total.toFixed(2)) === Number(originalAmount.toFixed(2)) : true;
          const balanceDisplay = t.status === 'pending' ? '—' : fmt(t.arsBalance ?? 0);

          const lateAdjustOpen = openArsLateAdjustId === t._id;
          const penaltyRemaining = getPenaltyRemaining(t);
          const lateDraft = arsLateAdjustDrafts.get(t._id) || { returned: 0 };
          const lateReturned = Number(lateDraft.returned || 0);
          const lateRemainingAfter = Number((penaltyRemaining - lateReturned).toFixed(2));
          const lateValid = Number.isFinite(lateReturned) && lateReturned > 0 && lateReturned <= penaltyRemaining;

          const actionMarkup = (t.status === 'active' || t.status === 'approved') ? `
                <button class="btn cds-btn-sm me-1" onclick="toggleArsSettlementForm('${t._id}')">${isOpen ? 'Close' : 'Settle ARS'}</button>
                <button class="btn cds-btn-sm danger" onclick="markPenalty('${t._id}')">Penalty</button>
              ` : (['closed', 'penalty', 'auto_penalty_applied', 'partially_settled', 'partially_cleared', 'fully_cleared'].includes(t.status) && penaltyRemaining > 0) ? `
                <button class="btn cds-btn-sm me-1" onclick="toggleArsLateAdjustForm('${t._id}')">${lateAdjustOpen ? 'Close' : 'Adjust Penalty / Late Return'}</button>
              ` : (t.status === 'settlement_pending' ? `<span class="small text-muted">Settlement pending approval</span>` : '—');

          const inlineForm = isOpen && (t.status === 'active' || t.status === 'approved') ? `
            <tr class="bg-body-tertiary">
              <td colspan="7">
                <div class="p-3 rounded-3 border">
                  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <div>
                      <div class="small text-muted">ARS Settlement (Inline)</div>
                      <div><strong>Total ARS:</strong> ${fmt(originalAmount)}</div>
                    </div>
                    <div class="text-end">
                      <div class="small ${totalOk ? 'text-success' : 'text-danger'}">
                        Total: ${fmt(total)} ${totalOk ? '✓' : '✗'}
                      </div>
                      <div class="small text-muted">Returned + Expense + Penalty must match total</div>
                    </div>
                  </div>
                  <div class="row g-2 align-items-end">
                    <div class="col-md-3">
                      <label class="form-label small mb-1">Returned Amount (₹)</label>
                      <input class="form-control cds-input" type="number" min="0" step="0.01"
                        value="${draft.returned}"
                        oninput="updateArsSettlementDraft('${t._id}','returned', this.value, ${originalAmount})" />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label small mb-1">Expense Amount (₹)</label>
                      <input class="form-control cds-input" type="number" min="0" step="0.01"
                        value="${draft.expense}"
                        oninput="updateArsSettlementDraft('${t._id}','expense', this.value, ${originalAmount})" />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label small mb-1">Penalty Amount (₹)</label>
                      <div class="input-group">
                        <input class="form-control cds-input" type="number" min="0" step="0.01"
                          value="${draft.penalty}"
                          oninput="updateArsSettlementDraft('${t._id}','penalty', this.value, ${originalAmount})" />
                        <button class="btn btn-outline-secondary" type="button"
                          onclick="updateArsSettlementDraft('${t._id}','autoPenalty', null, ${originalAmount})"
                          title="Reset to auto-calculated remaining">Auto</button>
                      </div>
                      <div class="small text-muted mt-1">Auto remaining: ${fmt(Math.max(0, calcPenalty))}${draft.penaltyTouched ? ' (manual override)' : ''}</div>
                    </div>
                    <div class="col-md-3 d-grid">
                      <button class="btn cds-btn-primary" ${totalOk ? '' : 'disabled'}
                        onclick="submitArsSettlement('${t._id}', ${originalAmount})">
                        Submit Settlement
                      </button>
                      ${!totalOk ? `<div class="small text-danger mt-1">Fix amounts so total equals ${fmt(originalAmount)}.</div>` : ''}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ` : '';

          const lateInline = (['closed', 'penalty', 'auto_penalty_applied', 'partially_settled', 'partially_cleared', 'fully_cleared'].includes(t.status) && penaltyRemaining > 0) ? `
            <tr>
              <td colspan="7" class="p-0">
                <div class="inline-slide ${lateAdjustOpen ? 'open' : ''}">
                  <div class="p-3 border-top bg-white">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                      <div>
                        <div class="small text-muted">Late Return / Penalty Adjustment</div>
                        <div class="small"><strong>Current Penalty:</strong> ${fmt(penaltyRemaining)}</div>
                      </div>
                      <div class="text-end small text-muted">
                        Status: ${statusBadge(t.status)}
                      </div>
                    </div>
                    <div class="row g-2 align-items-end">
                      <div class="col-md-4">
                        <label class="form-label small mb-1">Returned Amount (₹)</label>
                        <input class="form-control cds-input" type="number" min="0" step="0.01"
                          value="${lateReturned || ''}"
                          oninput="updateArsLateAdjustDraft('${t._id}', this.value)" />
                        ${lateReturned > penaltyRemaining ? `<div class="small text-danger mt-1">Returned cannot exceed penalty.</div>` : ''}
                      </div>
                      <div class="col-md-4">
                        <label class="form-label small mb-1">Remaining Penalty (auto)</label>
                        <input class="form-control cds-input" type="text" readonly value="${fmt(Math.max(0, lateRemainingAfter))}" />
                      </div>
                      <div class="col-md-4 d-grid">
                        <button class="btn cds-btn-primary" ${lateValid ? '' : 'disabled'} onclick="submitArsLateReturn('${t._id}', ${penaltyRemaining})">
                          Apply Late Return
                        </button>
                        <div class="small text-muted mt-1">Adds credit to Main Balance and reduces penalty.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ` : '';

          return `<tr>
            <td><strong>${escHtml(t.workerName || '-')}</strong></td>
            <td>${fmt(t.amount)}</td>
            <td>${balanceDisplay}</td>
            <td class="text-muted small">${escHtml(t.reason || '-')}</td>
            <td>${statusBadge(t.status)}${overdueBadge}</td>
            <td class="small">${fmtDate(t.createdAt)}</td>
            <td>
              ${actionMarkup}
            </td>
          </tr>${inlineForm}${lateInline}`;
        }).join('')}
      </tbody>
    </table></div>`;
  } catch (e) { console.error(e); }
}

// Daily
function calcDenom() {
  const total =
    (parseInt(document.getElementById('d500').value) || 0) * 500 +
    (parseInt(document.getElementById('d200').value) || 0) * 200 +
    (parseInt(document.getElementById('d100').value) || 0) * 100 +
    (parseInt(document.getElementById('d50').value) || 0) * 50 +
    (parseInt(document.getElementById('d20').value) || 0) * 20 +
    (parseInt(document.getElementById('d10').value) || 0) * 10 +
    (parseInt(document.getElementById('d5').value) || 0) * 5 +
    (parseInt(document.getElementById('d2').value) || 0) * 2 +
    (parseInt(document.getElementById('d1').value) || 0) * 1;
  document.getElementById('denomTotalDisplay').textContent = fmt(total);

  const arsBal = parseFloat(document.getElementById('dArs')?.value) || 0;
  const combinedEl = document.getElementById('combinedTotalDisplay');
  if (combinedEl) combinedEl.textContent = fmt(total + arsBal);
}

async function closeDay() {
  const denomination = {
    fiveHundreds: parseInt(document.getElementById('d500').value) || 0,
    twoHundreds: parseInt(document.getElementById('d200').value) || 0,
    hundreds: parseInt(document.getElementById('d100').value) || 0,
    fifties: parseInt(document.getElementById('d50').value) || 0,
    twenties: parseInt(document.getElementById('d20').value) || 0,
    tens: parseInt(document.getElementById('d10').value) || 0,
    fives: parseInt(document.getElementById('d5').value) || 0,
    twos: parseInt(document.getElementById('d2').value) || 0,
    ones: parseInt(document.getElementById('d1').value) || 0
  };
  const arsBalance = parseFloat(document.getElementById('dArs').value) || 0;
  try {
    const res = await api('/api/daily/close', 'POST', { denomination, arsBalance });
    showAlert('dailyAlert', `Day closed. Main: ${fmt(res.closingBalance)} | ARS: ${fmt(res.closingArsBalance || 0)}`, 'success');
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
        ? `<span class="cds-badge badge-approved">Day Closed — Main: ${fmt(today.closingBalance || 0)} | ARS: ${fmt(today.closingArsBalance || 0)} | Combined: ${fmt((today.closingBalance || 0) + (today.closingArsBalance || 0))}</span>`
        : `<span class="cds-badge badge-pending">Day Open — Opening Main: ${fmt(today.openingBalance || 0)} | Opening ARS: ${fmt(today.openingArsBalance || 0)} | Combined: ${fmt((today.openingBalance || 0) + (today.openingArsBalance || 0))}</span>`;
    }
    const arsInput = document.getElementById('dArs');
    if (arsInput) {
      const bal = await api('/api/balance');
      arsInput.value = Number(bal.suspenseArsTotal || 0).toFixed(2);
      calcDenom();
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
    
    // Reverse records so oldest is at the top and newest is at the bottom
    const displayRecords = records.slice().reverse();

    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Date</th><th>Opening Main</th><th>Opening ARS</th><th>Combined Opening</th><th>Closing Main</th><th>Closing ARS</th><th>Combined Closing</th><th>Status</th><th>Closed By</th></tr></thead>
      <tbody>
        ${displayRecords.map(r => `<tr>
          <td>${r.date}</td>
          <td>${fmt(r.openingBalance || 0)}</td>
          <td>${fmt(r.openingArsBalance || 0)}</td>
          <td><strong>${fmt((r.openingBalance || 0) + (r.openingArsBalance || 0))}</strong></td>
          <td>${r.closingBalance != null ? fmt(r.closingBalance) : '—'}</td>
          <td>${r.closingArsBalance != null ? fmt(r.closingArsBalance) : '—'}</td>
          <td><strong>${r.closingBalance != null ? fmt((r.closingBalance || 0) + (r.closingArsBalance || 0)) : '—'}</strong></td>
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
    const pendingTxs = await api('/api/transactions/pending');
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
  const suspenseSettlementBreakdown = (t) => {
    const s = t?.suspenseSettlement;
    if (!s) return '';
    const original = Number(t.amount || 0);
    const returned = Number(s.returnedAmount || 0);
    const expense = Number(s.expenseAmount || 0);
    const penalty = Number(s.penaltyAmount || 0);
    const total = Number((returned + expense + penalty).toFixed(2));
    const ok = Number(total.toFixed(2)) === Number(original.toFixed(2));
    return `
      <div class="mt-2 p-2 rounded-3 border bg-white">
        <div class="row g-2">
          <div class="col-sm-6 col-lg-3">
            <div class="small text-muted">Original ARS</div>
            <div><strong>${fmt(original)}</strong></div>
          </div>
          <div class="col-sm-6 col-lg-3">
            <div class="small text-muted">Returned Amount</div>
            <div><strong>${fmt(returned)}</strong></div>
            <div class="small text-muted">Cash received back</div>
          </div>
          <div class="col-sm-6 col-lg-3">
            <div class="small text-muted">Expense Amount</div>
            <div><strong>${fmt(expense)}</strong></div>
            <div class="small text-muted">Based on bills</div>
          </div>
          <div class="col-sm-6 col-lg-3">
            <div class="small text-muted">Penalty Amount</div>
            <div><strong>${fmt(penalty)}</strong></div>
            <div class="small ${ok ? 'text-success' : 'text-danger'}">Total: ${fmt(total)} ${ok ? '✓' : '✗'}</div>
          </div>
        </div>
      </div>
    `;
  };

  return `<div class="table-responsive"><table class="table cds-table">
    <thead><tr>${showType ? '<th>Type</th>' : ''}<th>Description</th><th>Amount</th><th>Status</th><th>Created</th><th>Reviewed By</th>${allowReview ? '<th>Actions</th>' : ''}</tr></thead>
    <tbody>
      ${txs.map(t => `<tr>
        ${showType ? `<td>${typeBadge(t.type)}</td>` : ''}
        <td>
          <div>${escHtml(t.description)}</div>
          ${t.type === 'suspense' && t.status === 'settlement_pending' ? suspenseSettlementBreakdown(t) : ''}
        </td>
        <td>${fmt(t.amount)}</td>
        <td>${statusBadge(t.status)}</td>
        <td class="small">${fmtDateTime(t.createdAt)}</td>
        <td class="small">${t.reviewedBy || '—'}</td>
        ${allowReview ? `<td>${t.status === 'pending' ? `
          <button class="btn cds-btn-approve me-1" onclick="reviewTx('${t._id}', 'approve')">Approve</button>
          <button class="btn cds-btn-reject" onclick="reviewTx('${t._id}', 'reject')">Reject</button>
        ` : t.status === 'settlement_pending' ? `
          <button class="btn cds-btn-approve me-1" onclick="reviewTx('${t._id}', 'approve')">Approve</button>
          <button class="btn cds-btn-reject" onclick="reviewTx('${t._id}', 'reject')">Reject</button>
        ` : '—'}</td>` : ''}
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
// Users
async function loadUsers() {
  try {
    setLoading('userList', 'Loading users...');
    const users = await api('/api/users');
    const el = document.getElementById('userList');
    if (!users.length) { el.innerHTML = '<p class="text-muted small px-2">No users found.</p>'; return; }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
<<<<<<< HEAD
      <thead><tr><th>EC.no</th><th>Username</th><th>Location</th><th>Role</th><th>Created</th><th>Action</th></tr></thead>
      <tbody>
        ${users.map(u => {
          const uStr = encodeURIComponent(JSON.stringify(u));
          const deleteBtn = u.username !== 'admin'
            ? `<button class="btn cds-btn-sm danger" onclick="deleteUser('${u._id}', '${escHtml(u.username)}')">Delete</button>`
            : '—';
          const editBtn = `<button class="btn cds-btn-sm me-1" onclick="editUserAdmin('${uStr}')">Edit</button>`;
          return `<tr>
            <td><code>${escHtml(u.ecNo || '—')}</code></td>
            <td><strong>${escHtml(u.username)}</strong></td>
            <td><span class="badge bg-secondary">${escHtml(u.branchName || '—')}</span></td>
            <td><span class="cds-badge ${u.role === 'admin' ? 'badge-type-expense' : 'badge-type-suspense'}">${u.role.toUpperCase()}</span></td>
            <td class="small">${fmtDate(u.createdAt)}</td>
            <td>
              ${editBtn}
              ${deleteBtn}
            </td>
          </tr>`;
        }).join('')}
=======
      <thead><tr><th>Username</th><th>Role</th><th>Created</th><th>Action</th></tr></thead>
      <tbody>
        ${users.map(u => `<tr>
          <td><strong>${escHtml(u.username)}</strong></td>
          <td><span class="cds-badge ${u.role === 'admin' ? 'badge-type-expense' : 'badge-type-suspense'}">${u.role.toUpperCase()}</span></td>
          <td class="small">${fmtDate(u.createdAt)}</td>
          <td>${u.username !== 'admin' ? `<button class="btn cds-btn-sm danger" onclick="deleteUser('${u._id}', '${escHtml(u.username)}')">Delete</button>` : '—'}</td>
        </tr>`).join('')}
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
      </tbody>
    </table></div>`;
  } catch (e) { console.error(e); }
}

<<<<<<< HEAD
async function saveUserAdmin() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;
  const ecNo = document.getElementById('newEcNo')?.value?.trim();
  const branchSelect = document.getElementById('newUserBranch');
  const branch = branchSelect?.value || undefined;
  const branchName = branch ? branchSelect.options[branchSelect.selectedIndex].text : undefined;
  const editId = document.getElementById('userEditId')?.value;

  if (!username) { showAlert('userAlert', 'Username is required.'); return; }
  if (!editId && !password) { showAlert('userAlert', 'Password is required.'); return; }

  try {
    const payload = { username, role, ecNo, branch, branchName };
    if (password) payload.password = password;

    if (editId) {
      await api(`/api/users/${editId}`, 'PUT', payload);
      showAlert('userAlert', 'User updated successfully.', 'success');
    } else {
      await api('/api/users', 'POST', payload);
      showAlert('userAlert', 'User created successfully.', 'success');
    }
    clearUserAdminForm();
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    loadUsers();
  } catch (err) {
    showAlert('userAlert', err.message);
  }
}

<<<<<<< HEAD
function editUserAdmin(uString) {
  try {
    const u = JSON.parse(decodeURIComponent(uString));
    document.getElementById('userEditId').value = u._id;
    document.getElementById('newUsername').value = u.username || '';
    document.getElementById('newUsername').readOnly = (u.username === 'admin');
    document.getElementById('newPassword').value = '';
    document.getElementById('newPasswordLabel').textContent = 'Password (leave blank to keep unchanged)';
    
    if (document.getElementById('newEcNo')) {
      document.getElementById('newEcNo').value = u.ecNo || '';
    }
    if (document.getElementById('newUserBranch')) {
      document.getElementById('newUserBranch').value = u.branch || '';
    }
    document.getElementById('newRole').value = u.role || 'manager';
    if (u.username === 'admin') {
      document.getElementById('newRole').disabled = true;
    } else {
      document.getElementById('newRole').disabled = false;
    }

    document.getElementById('userFormTitle').textContent = 'Edit User';
    document.getElementById('btnSaveUser').textContent = 'Save Changes';
    document.getElementById('btnCancelUser').classList.remove('d-none');
  } catch (err) {
    console.error(err);
    alert('Failed to parse user details');
  }
}

function clearUserAdminForm() {
  document.getElementById('userEditId').value = '';
  document.getElementById('newUsername').value = '';
  document.getElementById('newUsername').readOnly = false;
  document.getElementById('newPassword').value = '';
  document.getElementById('newPasswordLabel').textContent = 'Password';
  if (document.getElementById('newEcNo')) {
    document.getElementById('newEcNo').value = '';
  }
  if (document.getElementById('newUserBranch')) {
    document.getElementById('newUserBranch').value = '';
  }
  document.getElementById('newRole').value = 'manager';
  document.getElementById('newRole').disabled = false;

  document.getElementById('userFormTitle').textContent = 'Add User';
  document.getElementById('btnSaveUser').textContent = 'Create User';
  document.getElementById('btnCancelUser').classList.add('d-none');
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
async function deleteUser(id, name) {
  try {
    await api(`/api/users/${id}`, 'DELETE');
    loadUsers();
  } catch (err) {
    showAlert('userAlert', err.message);
  }
}

<<<<<<< HEAD
=======
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
        `<option value="${p._id}" data-available="${p.availableStock}">${escHtml(p.name)} (${escHtml(p.sku)}) - Available: ${p.availableStock}</option>`).join('');
    }
  } catch (err) {
    showAlert('invDashAlert', err.message);
  }
}

async function createStockRequest() {
  const productSelect = document.getElementById('reqProduct');
  const productId = productSelect?.value;
  const quantity = parseInt(document.getElementById('reqQty')?.value, 10);
  const section = document.getElementById('reqSection')?.value;
  if (!productId || Number.isNaN(quantity) || quantity <= 0 || !section) {
    showAlert('invRequestAlert', 'Select product, quantity and section.');
    return;
  }
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const availableStock = parseInt(selectedOption.getAttribute('data-available') || 0, 10);
  if (quantity > availableStock) {
    showAlert('invRequestAlert', `Cannot request more than available quantity (${availableStock}).`);
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

// ─── VEHICLE LOG BOOK ────────────────────────────────────────────────────────
let vehicleExpenseRows = [];
let openVehicleRejectId = null;
const vehicleRejectDrafts = new Map(); // logId -> reason
let currentVehicleDraftId = null;

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

<<<<<<< HEAD
let currentUser = null;
let allBranches = [];
let allVehicles = [];
let activeVehicleBaseline = { startKm: 0, availableFuel: 0, expectedMileage: null, tankCapacity: 0 };
let currentFuelAdditions = [];
let endDateTimePicker = null;
let fuelStartDateTimePicker = null;
let scrapDateTimePicker = null;
let expenseInLogActive = false;
let cachedFuelPrices = {};
let cachedFuelLogs = [];
let cachedVehicleExpenses = [];

async function loadVehicleList() {
  try {
    allVehicles = await api('/api/vehicles');
    let activeVehicles = allVehicles.filter((v) => v.status !== 'inactive');
    if (currentUser && currentUser.role === 'security' && currentUser.branchName) {
      activeVehicles = activeVehicles.filter(v => 
        v.branchName && v.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
      );
    }

    const inputs = document.querySelectorAll('.vehicle-select-shortname');
    inputs.forEach((input) => {
      const listId = input.getAttribute('list');
      if (listId) {
        const datalist = document.getElementById(listId);
        if (datalist) {
          datalist.innerHTML = activeVehicles.map((v) => {
            const val = v.shortName || v.vehicleNumber;
            const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
            return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
          }).join('');
        }
      } else if (input.tagName === 'SELECT') {
        const currentVal = input.value;
        input.innerHTML = '<option value="">Select Vehicle...</option>' + activeVehicles.map((v) => {
          const val = v.shortName || v.vehicleNumber;
          const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
          return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
        }).join('');
        if (currentVal) input.value = currentVal;
      }
    });
=======
async function loadVehicleList() {
  const datalist = document.getElementById('vehicleNumberList');
  if (!datalist) return;
  datalist.innerHTML = '';
  try {
    const vehicles = await api('/api/vehicles');
    datalist.innerHTML = vehicles.map((v) => `<option value="${escHtml(v.vehicleNumber)}">${escHtml(v.vehicleNumber)}</option>`).join('');
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

<<<<<<< HEAD
async function onVehicleShortNameInput(selectId, numId) {
  const shortNameVal = document.getElementById(selectId)?.value?.trim();
  const numEl = document.getElementById(numId);
  if (!shortNameVal) {
    if (numEl) numEl.value = '';
    if (selectId === 'vehicleShortName') {
      const startKmEl = document.getElementById('startKm');
      if (startKmEl) startKmEl.value = 0;
      const tankCapacityEl = document.getElementById('tankCapacity');
      if (tankCapacityEl) tankCapacityEl.value = 0;
      const expectedMileageEl = document.getElementById('expectedMileage');
      if (expectedMileageEl) expectedMileageEl.value = 0;
      const distanceEl = document.getElementById('distanceTravelled');
      if (distanceEl) distanceEl.value = '0.00';
      updateVehicleDetailsDisplay('', 0, 0);
    } else if (selectId === 'fuelVehicleShortName') {
      const fuelTankEl = document.getElementById('fuelTankCapacity');
      if (fuelTankEl) fuelTankEl.value = 0;
      const fuelAvailEl = document.getElementById('fuelAvailableFuel');
      if (fuelAvailEl) fuelAvailEl.value = 0;
    }
    return;
  }

  const v = allVehicles.find((x) =>
    (x.shortName && x.shortName.toLowerCase() === shortNameVal.toLowerCase()) ||
    (x.vehicleNumber && x.vehicleNumber.toLowerCase() === shortNameVal.toLowerCase())
  );

  if (v) {
    if (numEl) numEl.value = v.vehicleNumber;
    if (selectId === 'vehicleShortName') {
      await applyVehicleBaseline();
    } else if (selectId === 'fuelVehicleShortName') {
      await applyFuelVehicleBaseline();
    }
  } else {
    if (numEl) numEl.value = '';
    if (selectId === 'vehicleShortName') {
      updateVehicleDetailsDisplay('', 0, 0);
    }
  }
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
async function applyVehicleBaseline() {
  const vehicleNumber = document.getElementById('vehicleNumber')?.value?.trim().toUpperCase();
  const vehicleInput = document.getElementById('vehicleNumber');
  if (vehicleInput && vehicleNumber) vehicleInput.value = vehicleNumber;
  if (!vehicleNumber) return;
  try {
    const baseline = await api(`/api/vehicle-logs/baseline?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
<<<<<<< HEAD
    activeVehicleBaseline = baseline;
    const startKmEl = document.getElementById('startKm');
    if (startKmEl) startKmEl.value = baseline.startKm || 0;

    const tankCapacityEl = document.getElementById('tankCapacity');
    if (tankCapacityEl) tankCapacityEl.value = baseline.tankCapacity || 0;

    const expectedMileageEl = document.getElementById('expectedMileage');
    if (expectedMileageEl) expectedMileageEl.value = baseline.expectedMileage || '—';

    const availableFuelEl = document.getElementById('availableFuel');
    if (availableFuelEl) availableFuelEl.value = baseline.availableFuel || 0;

    updateVehicleDetailsDisplay(vehicleNumber, baseline.tankCapacity, baseline.expectedMileage);

    calcVehicleDistance();
    calcVehicleMileage();
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

<<<<<<< HEAD
function updateVehicleDetailsDisplay(vehicleNum, capacity, mileage) {
  const displayDiv = document.getElementById('vehicleDetailsDisplay');
  if (!displayDiv) return;

  if (!vehicleNum) {
    displayDiv.classList.add('d-none');
    return;
  }

  displayDiv.classList.remove('d-none');

  const numEl = document.getElementById('displayVehicleNumber');
  if (numEl) numEl.innerHTML = `🚗 <b>Vehicle No:</b> ${escHtml(vehicleNum)}`;

  const capEl = document.getElementById('displayTankCapacity');
  if (capEl) capEl.innerHTML = `⛽ <b>Tank Capacity:</b> ${capacity || 0} L`;

  const milEl = document.getElementById('displayExpectedMileage');
  if (milEl) milEl.innerHTML = `📈 <b>Std Mileage:</b> ${mileage != null && mileage !== '—' ? mileage + ' km/L' : '—'}`;
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
function calcVehicleDistance() {
  const startKm = Number(document.getElementById('startKm')?.value || 0);
  const endKm = Number(document.getElementById('endKm')?.value || 0);
  const distance = Math.max(0, endKm - startKm);
  const el = document.getElementById('distanceTravelled');
  if (el) el.value = distance.toFixed(2);
<<<<<<< HEAD

  if (fuelInLogActive) {
    calcFuelInLog();
  }
}
function openFuelModal() {
  let modalEl = document.getElementById('cdsFuelOverlay');
  if (!modalEl) {
    const div = document.createElement('div');
    div.innerHTML = `
      <div id="cdsFuelOverlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div class="cds-card form-structured" style="width: 100%; max-width: 400px; margin: 20px; position: relative; background: #1a1f2c; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff;">
          <button onclick="closeFuelModal()" style="position: absolute; right: 15px; top: 15px; background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">&times;</button>
          <div class="card-header-cds mb-3">
            <h5 style="margin:0; color: #fff;">⛽ Add Fuel Log</h5>
          </div>
          <div id="fuelModalAlert"></div>
          <div class="mb-3">
            <label class="form-label" style="color: #ccc;">Current Fuel (L) (remaining in tank)</label>
            <input type="number" id="fuelModalCurrent" class="form-control cds-input" min="0" step="0.1" placeholder="e.g. 2" />
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #ccc;">Fuel Added (L)</label>
            <input type="number" id="fuelModalAdded" class="form-control cds-input" min="0" step="0.1" placeholder="e.g. 20" />
          </div>
          <div class="mb-3">
            <label class="form-label" style="color: #ccc;">Petrol Bunk Name</label>
            <input type="text" id="fuelModalBunk" class="form-control cds-input" placeholder="e.g. HP Petrol Bunk" />
          </div>
          <div class="mb-4">
            <label class="form-label" style="color: #ccc;">Price/Cost (₹)</label>
            <input type="number" id="fuelModalPrice" class="form-control cds-input" min="0" step="0.01" placeholder="e.g. 2000" />
          </div>
          <button class="btn cds-btn-primary w-100" onclick="addFuelAddition()">Add Fuel</button>
        </div>
      </div>
    `;
    document.body.appendChild(div.firstElementChild);
    modalEl = document.getElementById('cdsFuelOverlay');
  }
  document.getElementById('fuelModalCurrent').value = '';
  document.getElementById('fuelModalAdded').value = '';
  document.getElementById('fuelModalBunk').value = '';
  document.getElementById('fuelModalPrice').value = '';
  document.getElementById('fuelModalAlert').innerHTML = '';
  modalEl.style.display = 'flex';
}

function closeFuelModal() {
  const modalEl = document.getElementById('cdsFuelOverlay');
  if (modalEl) modalEl.style.display = 'none';
}

function addFuelAddition() {
  const current = document.getElementById('fuelModalCurrent').value;
  const added = document.getElementById('fuelModalAdded').value;
  const bunk = document.getElementById('fuelModalBunk').value.trim();
  const price = document.getElementById('fuelModalPrice').value;

  if (current === '' || added === '' || !bunk || price === '') {
    showAlert('fuelModalAlert', 'All fields are required.');
    return;
  }

  const currentNum = Number(current);
  const addedNum = Number(added);
  const priceNum = Number(price);

  if (isNaN(currentNum) || currentNum < 0 || isNaN(addedNum) || addedNum <= 0 || isNaN(priceNum) || priceNum <= 0) {
    showAlert('fuelModalAlert', 'Please enter valid positive numbers.');
    return;
  }

  currentFuelAdditions.push({
    current: currentNum,
    added: addedNum,
    bunk: bunk,
    price: priceNum
  });

  closeFuelModal();
  renderFuelAdditions();
  calcVehicleMileage();
}

function removeFuelAddition(idx) {
  currentFuelAdditions = currentFuelAdditions.filter((_, i) => i !== idx);
  renderFuelAdditions();
  calcVehicleMileage();
}

function renderFuelAdditions() {
  const listEl = document.getElementById('fuelAdditionsList');
  if (!listEl) return;
  if (currentFuelAdditions.length === 0) {
    listEl.innerHTML = '<span class="text-muted small px-1">No fuel added.</span>';
    return;
  }
  listEl.innerHTML = currentFuelAdditions.map((item, idx) => `
    <div class="d-flex align-items-center justify-content-between p-2 mb-2 rounded" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
      <div>
        <div class="small fw-semibold text-white">${escHtml(item.bunk)}</div>
        <div class="small text-muted">Added: ${item.added}L @ ${fmt(item.price)} (Current: ${item.current}L)</div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFuelAddition(${idx})" style="padding: 2px 8px;">&times;</button>
    </div>
  `).join('');
}

function calcVehicleMileage() {
  const displayEl = document.getElementById('fuelMileageDisplay');
  if (!displayEl) return;
  if (currentFuelAdditions.length > 0) {
    const startKm = Number(document.getElementById('startKm')?.value || 0);
    const endKm = Number(document.getElementById('endKm')?.value || 0);
    const distance = Math.max(0, endKm - startKm);

    const startingFuel = activeVehicleBaseline.availableFuel || 0;
    const lastItem = currentFuelAdditions[currentFuelAdditions.length - 1];
    const fuelAddedBeforeLast = currentFuelAdditions.slice(0, -1).reduce((sum, item) => sum + item.added, 0);

    const fuelUsed = startingFuel + fuelAddedBeforeLast - lastItem.current;
    if (fuelUsed > 0 && distance > 0) {
      const actualMileage = distance / fuelUsed;
      let deltaHtml = '';
      const expected = activeVehicleBaseline.expectedMileage;
      if (expected > 0) {
        const delta = actualMileage - expected;
        const sign = delta >= 0 ? '+' : '';
        const cls = delta >= 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold';
        deltaHtml = ` (<span class="${cls}">${sign}${delta.toFixed(2)} km/L vs expected</span>)`;
      }
      displayEl.innerHTML = `
        <div class="mt-2 p-2 rounded" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
          <span class="text-white fw-semibold">Calculated Mileage:</span> ${actualMileage.toFixed(2)} km/L${deltaHtml}<br>
          <small class="text-muted">Distance: ${distance} km | Fuel Used: ${fuelUsed.toFixed(1)} L</small>
        </div>
      `;
    } else {
      displayEl.innerHTML = `
        <div class="mt-2 p-2 rounded" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
          <span class="text-muted">Add End KM and complete your trip to view calculated mileage.</span>
        </div>
      `;
    }
  } else {
    displayEl.innerHTML = '';
  }
}

let fuelInLogActive = false;

function toggleFuelInLog() {
  const endKmVal = Number(document.getElementById('endKm')?.value || 0);
  if (!endKmVal) {
    alert('Please enter End KM before adding fuel.');
    return;
  }

  const fuelSection = document.getElementById('fuelSectionInLog');
  if (!fuelSection) return;

  fuelInLogActive = !fuelInLogActive;
  if (fuelInLogActive) {
    fuelSection.classList.remove('d-none');
    onFuelTypeChangeInLog();
  } else {
    fuelSection.classList.add('d-none');
    const addedL = document.getElementById('fuelAddedLitersInLog');
    if (addedL) addedL.value = '';
    const priceL = document.getElementById('fuelPricePerLitreInLog');
    if (priceL) priceL.value = '';
    const bunkN = document.getElementById('fuelBunkNameInLog');
    if (bunkN) bunkN.value = '';
    const locI = document.getElementById('fuelLocationInLog');
    if (locI) locI.value = '';
    const priceI = document.getElementById('fuelPriceInLog');
    if (priceI) priceI.value = '0.00';
    const displayE = document.getElementById('fuelMileageDisplayInLog');
    if (displayE) displayE.innerHTML = '';
  }
}

function toggleExpenseInLog() {
  const sec = document.getElementById('expenseSectionInLog');
  const btn = document.getElementById('btnToggleExpenseInLog');
  if (!sec || !btn) return;
  
  expenseInLogActive = !expenseInLogActive;
  if (expenseInLogActive) {
    sec.classList.remove('d-none');
    btn.classList.add('active');
    btn.innerHTML = '🔧 Remove Expense';
  } else {
    sec.classList.add('d-none');
    btn.classList.remove('active');
    btn.innerHTML = '🔧 Add Expense (Emergency)';
    const amtEl = document.getElementById('expenseAmountInLog');
    const descEl = document.getElementById('expenseDescInLog');
    const typeEl = document.getElementById('expenseTypeSelectInLog');
    if (amtEl) amtEl.value = '';
    if (descEl) descEl.value = '';
    if (typeEl) typeEl.value = 'other';
  }
}

function onFuelTypeChangeInLog() {
  const type = document.getElementById('fuelTypeSelectInLog')?.value || 'petrol';
  const priceInput = document.getElementById('fuelPricePerLitreInLog');
  if (priceInput) {
    const price = (typeof cachedFuelPrices !== 'undefined' && cachedFuelPrices[type]) || (type === 'petrol' ? 102.50 : 94.20);
    priceInput.value = price;
  }
  calcFuelInLog();
}

function calcFuelInLog() {
  const added = Number(document.getElementById('fuelAddedLitersInLog')?.value || 0);
  const pricePerLitre = Number(document.getElementById('fuelPricePerLitreInLog')?.value || 0);

  const costEl = document.getElementById('fuelPriceInLog');
  if (costEl) {
    costEl.value = (added * pricePerLitre).toFixed(2);
  }

  const startKm = Number(document.getElementById('startKm')?.value || 0);
  const endKm = Number(document.getElementById('endKm')?.value || 0);
  const currentTripDistance = Math.max(0, endKm - startKm);
  const totalDistance = ((activeVehicleBaseline && activeVehicleBaseline.tripDistanceSum) || 0) + currentTripDistance;

  const distTextEl = document.getElementById('fuelTripDistanceTextInLog');
  if (distTextEl) distTextEl.textContent = totalDistance.toFixed(2);

  const approxTextEl = document.getElementById('fuelApproxUsedTextInLog');
  if (approxTextEl) {
    const expected = (activeVehicleBaseline && activeVehicleBaseline.expectedMileage) || 0;
    const approx = expected > 0 ? (totalDistance / expected) : 0;
    approxTextEl.textContent = approx.toFixed(2);
  }

  const displayEl = document.getElementById('fuelMileageDisplayInLog');
  if (displayEl) {
    if (added > 0 && totalDistance > 0) {
      const actualMileage = totalDistance / added;
      let deltaHtml = '';
      const expected = activeVehicleBaseline && activeVehicleBaseline.expectedMileage;
      if (expected > 0) {
        const delta = actualMileage - expected;
        const sign = delta >= 0 ? '+' : '';
        const cls = delta >= 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold';
        deltaHtml = ` (<span class="${cls}">${sign}${delta.toFixed(2)} km/L vs expected</span>)`;
      }
      displayEl.innerHTML = `
        <div class="mt-2 p-2 rounded bg-white small border">
          <span class="text-muted fw-semibold">Calculated Mileage:</span> <strong>${actualMileage.toFixed(2)} km/L</strong>${deltaHtml}<br>
          <small class="text-muted">Total Distance: ${totalDistance.toFixed(1)} km | Fuel Added: ${added.toFixed(1)} L</small>
        </div>
      `;
    } else {
      displayEl.innerHTML = `
        <div class="mt-2 p-2 rounded bg-white small border text-muted">
          Enter End KM and Fuel Added to see calculated mileage.
        </div>
      `;
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    }
  }
}

async function submitVehicleLog() {
<<<<<<< HEAD
  if (fuelInLogActive) {
    const fuelAdded = Number(document.getElementById('fuelAddedLitersInLog')?.value || 0);
    const pricePerLitre = Number(document.getElementById('fuelPricePerLitreInLog')?.value || 0);
    const bunk = document.getElementById('fuelBunkNameInLog')?.value?.trim();
    const location = document.getElementById('fuelLocationInLog')?.value?.trim();
    if (fuelAdded <= 0 || pricePerLitre <= 0 || !bunk || !location) {
      showAlert('vehicleAlert', 'Please fill all fuel fields (including bunk location) with positive/valid values.');
      return;
    }
  }

  if (expenseInLogActive) {
    const amount = Number(document.getElementById('expenseAmountInLog')?.value || 0);
    const desc = document.getElementById('expenseDescInLog')?.value?.trim();
    if (amount <= 0 || !desc) {
      showAlert('vehicleAlert', 'Please enter a positive amount and description for the emergency expense.');
      return;
    }
  }

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  const payload = collectVehicleFormPayload();
  if (!payload.driverName || !payload.vehicleNumber || !payload.fromLocation || !payload.toLocation || !payload.startDateTime || !payload.endDateTime) {
    showAlert('vehicleAlert', 'Please fill all required fields.');
    return;
  }
  try {
    await api('/api/vehicle-logs', 'POST', payload);
<<<<<<< HEAD
    showAlert('vehicleAlert', 'Vehicle log submitted successfully.', 'success');
    
    currentVehicleDraftId = null;

    resetVehicleForm();
    
=======
    showAlert('vehicleAlert', 'Vehicle log submitted for manager approval.', 'success');
    resetVehicleForm();
    currentVehicleDraftId = null;
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    await applyVehicleBaseline();
    loadVehicleHistory();
    loadVehicleWaitingList();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

function collectVehicleFormPayload() {
<<<<<<< HEAD
  const driverName = document.getElementById('driverName')?.value?.trim() || (fuelInLogActive ? 'Fuel Log' : '');
  const vehicleNumber = document.getElementById('vehicleNumber')?.value?.trim().toUpperCase();
  const fromLocation = document.getElementById('fromLocation')?.value?.trim();
  const toLocation = document.getElementById('toLocation')?.value?.trim() || (fuelInLogActive ? fromLocation : '');
  const startDateTime = document.getElementById('startDateTime')?.value;
  const endDateTime = document.getElementById('endDateTime')?.value || (fuelInLogActive ? startDateTime : '');
  const endKm = Number(document.getElementById('endKm')?.value);

  const fromLoc = fromLocation || '';
  const toLoc = toLocation || '';
  const matchedBranch = allBranches.find(b => b.name.toLowerCase() === fromLoc.toLowerCase()) ||
                        allBranches.find(b => b.name.toLowerCase() === toLoc.toLowerCase());
  const branch = matchedBranch?._id || undefined;
  const branchName = matchedBranch?.name || undefined;

  const expenses = [];

  if (fuelInLogActive) {
    const fuelAdded = Number(document.getElementById('fuelAddedLitersInLog')?.value || 0);
    const pricePerLitre = Number(document.getElementById('fuelPricePerLitreInLog')?.value || 0);
    const bunk = document.getElementById('fuelBunkNameInLog')?.value?.trim();
    const location = document.getElementById('fuelLocationInLog')?.value?.trim() || '';
    const price = fuelAdded * pricePerLitre;

    expenses.push({
      expenseType: 'oil',
      amount: price,
      date: new Date(),
      description: `FUEL_ADDITION:qty=${fuelAdded};current=${(Number(document.getElementById('tankCapacity')?.value || 0) - fuelAdded).toFixed(2)};bunk=${bunk};loc=${location}`
    });
  }

  if (expenseInLogActive) {
    const expenseType = document.getElementById('expenseTypeSelectInLog')?.value || 'other';
    const amount = Number(document.getElementById('expenseAmountInLog')?.value || 0);
    const description = document.getElementById('expenseDescInLog')?.value?.trim() || '';

    expenses.push({
      expenseType,
      amount,
      date: new Date(),
      description
    });
  }

  if (fuelInLogActive) {
    const fuelAdded = Number(document.getElementById('fuelAddedLitersInLog')?.value || 0);
    const pricePerLitre = Number(document.getElementById('fuelPricePerLitreInLog')?.value || 0);
    const fuelType = document.getElementById('fuelTypeSelectInLog')?.value || 'petrol';

    return {
      driverName,
      vehicleNumber,
      fromLocation,
      toLocation,
      startDateTime,
      endDateTime,
      endKm,
      fuelAdded,
      remainingFuel: Number(document.getElementById('tankCapacity')?.value || 0),
      fuelUsedInput: fuelAdded,
      mileageReason: '',
      fuelFillDate: startDateTime,
      expenses,
      isFuelLog: true,
      fuelType,
      pricePerLitre,
      correctedFromLogId: currentVehicleDraftId || undefined,
      draftId: currentVehicleDraftId || undefined,
      branch,
      branchName
    };
  }

  return {
    driverName,
    vehicleNumber,
    fromLocation,
    toLocation,
    startDateTime,
    endDateTime,
    endKm,
    fuelAdded: 0,
    remainingFuel: activeVehicleBaseline.availableFuel || 0,
    fuelUsedInput: 0,
    mileageReason: '',
    fuelFillDate: null,
    expenses,
    correctedFromLogId: currentVehicleDraftId || undefined,
    draftId: currentVehicleDraftId || undefined,
    branch,
    branchName
  };
}

function resetVehicleForm() {
  ['driverName', 'vehicleShortName', 'vehicleNumber', 'toLocation', 'endKm'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  updateVehicleDetailsDisplay('', 0, 0);

  const fromEl = document.getElementById('fromLocation');
  if (fromEl) {
    fromEl.value = (currentUser && currentUser.branchName) ? currentUser.branchName : '';
    if (currentUser && currentUser.branchName) {
      fromEl.disabled = true;
    } else {
      fromEl.disabled = false;
    }
  }

  const startEl = document.getElementById('startDateTime');
  if (startEl) startEl.value = formatDateTime12h(new Date());
  const endEl = document.getElementById('endDateTime');
  if (endEl) {
    if (endDateTimePicker) {
      endDateTimePicker.setDate(new Date());
    } else {
      endEl.value = formatDateTime12h(new Date());
    }
  }

  const tankCapEl = document.getElementById('tankCapacity');
  if (tankCapEl) tankCapEl.value = '0';

  const availableFuelEl = document.getElementById('availableFuel');
  if (availableFuelEl) availableFuelEl.value = '0';

  const distanceEl = document.getElementById('distanceTravelled');
  if (distanceEl) distanceEl.value = '0.00';

  const btn = document.getElementById('btnSubmitVehicleLog');
  if (btn) btn.disabled = false;

  fuelInLogActive = false;
  const fuelSection = document.getElementById('fuelSectionInLog');
  if (fuelSection) {
    fuelSection.classList.add('d-none');
    const addedL = document.getElementById('fuelAddedLitersInLog');
    if (addedL) addedL.value = '';
    const priceL = document.getElementById('fuelPricePerLitreInLog');
    if (priceL) priceL.value = '';
    const bunkN = document.getElementById('fuelBunkNameInLog');
    if (bunkN) bunkN.value = '';
    const locI = document.getElementById('fuelLocationInLog');
    if (locI) locI.value = '';
    const priceI = document.getElementById('fuelPriceInLog');
    if (priceI) priceI.value = '0.00';
    const displayE = document.getElementById('fuelMileageDisplayInLog');
    if (displayE) displayE.innerHTML = '';
  }

  expenseInLogActive = true;
  toggleExpenseInLog();
=======
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
  return payload;
}

function resetVehicleForm() {
  ['driverName', 'fromLocation', 'toLocation', 'startDateTime', 'endDateTime', 'endKm', 'fuelAdded', 'remainingFuel', 'fuelFillDate', 'fuelUsedInput', 'mileageReason'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const distanceEl = document.getElementById('distanceTravelled');
  if (distanceEl) distanceEl.value = '0.00';
  const fuelUsedEl = document.getElementById('fuelUsed');
  if (fuelUsedEl) fuelUsedEl.value = '';
  const actualMileageEl = document.getElementById('actualMileage');
  if (actualMileageEl) actualMileageEl.value = '';
  const lowFuelEl = document.getElementById('lowFuelBadge');
  if (lowFuelEl) lowFuelEl.innerHTML = '';
  const mileageDeltaEl = document.getElementById('mileageDelta');
  if (mileageDeltaEl) mileageDeltaEl.textContent = '';
  vehicleExpenseRows = [];
  renderVehicleExpenseRows();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
}

async function saveVehicleWaitingDraft() {
  const payload = collectVehicleFormPayload();
  if (!payload.vehicleNumber) {
    showAlert('vehicleAlert', 'Vehicle number is required to save waiting entry.');
    return;
  }
  try {
    const res = await api('/api/vehicle-logs/waiting', 'POST', { ...payload, draftId: currentVehicleDraftId });
    currentVehicleDraftId = res?.draft?._id || null;
    showAlert('vehicleAlert', 'Saved to waiting list.', 'success');
    loadVehicleWaitingList();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

async function loadVehicleWaitingList() {
  const el = document.getElementById('vehicleWaitingList');
  if (!el) return;
  try {
    setLoading('vehicleWaitingList', 'Loading waiting list...');
<<<<<<< HEAD
    let drafts = await api('/api/vehicle-logs/waiting');
    if (currentUser && currentUser.branchName) {
      drafts = drafts.filter(d => 
        d.branchName && d.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
      );
    }
=======
    const drafts = await api('/api/vehicle-logs/waiting');
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    if (!drafts.length) {
      el.innerHTML = '<p class="text-muted small px-2">No waiting entries.</p>';
      return;
    }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Vehicle</th><th>Driver</th><th>Route</th><th>Updated</th><th>Actions</th></tr></thead>
      <tbody>${drafts.map((d) => `<tr>
        <td><strong>${escHtml(d.vehicleNumber || '-')}</strong></td>
        <td>${escHtml(d.driverName || '-')}</td>
        <td class="small">${escHtml(d.fromLocation || '-')} → ${escHtml(d.toLocation || '-')}</td>
        <td class="small">${fmtDateTime(d.updatedAt || d.createdAt)}</td>
        <td>
          <button class="btn cds-btn-sm me-1" onclick="editVehicleWaitingDraft('${d._id}')">Edit</button>
<<<<<<< HEAD
=======
          <button class="btn cds-btn-sm me-1" onclick="submitVehicleWaitingDraft('${d._id}')">Send Approval</button>
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
          <button class="btn cds-btn-sm danger" onclick="deleteVehicleWaitingDraft('${d._id}')">Delete</button>
        </td>
      </tr>`).join('')}</tbody></table></div>`;
  } catch (err) {
    const alertId = document.getElementById('vehicleWaitingAlert');
    if (alertId) showAlert('vehicleWaitingAlert', err.message);
    if (el) el.innerHTML = '<p class="text-muted small px-2">Could not load waiting list.</p>';
  }
}

async function editVehicleWaitingDraft(id) {
  try {
    const drafts = await api('/api/vehicle-logs/waiting');
    const d = drafts.find((x) => x._id === id);
    if (!d) {
      showAlert('vehicleAlert', 'Waiting entry not found.');
      return;
    }
    currentVehicleDraftId = d._id;
    document.getElementById('driverName').value = d.driverName || '';
    document.getElementById('vehicleNumber').value = d.vehicleNumber || '';
<<<<<<< HEAD


    const v = allVehicles.find((x) => x.vehicleNumber === d.vehicleNumber);
    if (v && document.getElementById('vehicleShortName')) {
      document.getElementById('vehicleShortName').value = v.shortName || v.vehicleNumber;
    }
    await applyVehicleBaseline();

    document.getElementById('fromLocation').value = d.fromLocation || '';
    document.getElementById('toLocation').value = d.toLocation || '';
    document.getElementById('startDateTime').value = d.startDateTime ? formatDateTime12h(d.startDateTime) : formatDateTime12h(new Date());
    const targetEndDate = d.endDateTime ? new Date(d.endDateTime) : new Date();
    if (endDateTimePicker) {
      endDateTimePicker.setDate(targetEndDate);
    } else {
      document.getElementById('endDateTime').value = formatDateTime12h(targetEndDate);
    }
    document.getElementById('endKm').value = d.endKm ?? '';

    let hasFuel = false;
    let fuelAddedVal = '';
    let bunkVal = '';
    let locationVal = '';
    let fuelTypeVal = d.fuelType || 'petrol';
    let pricePerLitreVal = d.pricePerLitre || '';

    currentFuelAdditions = [];
    if (Array.isArray(d.expenses)) {
      d.expenses.forEach(exp => {
        if (exp.expenseType === 'oil' && exp.description) {
          const match = exp.description.match(/^FUEL_ADDITION:qty=([\d.]+);current=([\d.]+);bunk=([^;]*)(?:;loc=(.*))?$/);
          if (match) {
            hasFuel = true;
            fuelAddedVal = match[1];
            bunkVal = match[3];
            locationVal = match[4] || '';
            currentFuelAdditions.push({
              added: Number(match[1]),
              current: Number(match[2]),
              bunk: match[3],
              price: Number(exp.amount)
            });
          }
        }
      });
    }
    renderFuelAdditions();

    if (hasFuel || d.isFuelLog || (d.fuelAdded && d.fuelAdded > 0)) {
      fuelInLogActive = false; // toggle will set it to true
      toggleFuelInLog();
      
      const addedL = document.getElementById('fuelAddedLitersInLog');
      if (addedL) addedL.value = fuelAddedVal || d.fuelAdded || '';
      
      const priceL = document.getElementById('fuelPricePerLitreInLog');
      if (priceL) priceL.value = pricePerLitreVal;
      
      const bunkN = document.getElementById('fuelBunkNameInLog');
      if (bunkN) bunkN.value = bunkVal;
      
      const locN = document.getElementById('fuelLocationInLog');
      if (locN) locN.value = locationVal;
      
      const typeS = document.getElementById('fuelTypeSelectInLog');
      if (typeS) typeS.value = fuelTypeVal;
      
      calcFuelInLog();
    } else {
      fuelInLogActive = true; // toggle will set it to false
      toggleFuelInLog();
    }

    const emergencyExp = Array.isArray(d.expenses) ? d.expenses.find(exp => !exp.description || !exp.description.startsWith('FUEL_ADDITION:')) : null;
    if (emergencyExp) {
      const amtEl = document.getElementById('expenseAmountInLog');
      const descEl = document.getElementById('expenseDescInLog');
      const typeEl = document.getElementById('expenseTypeSelectInLog');
      if (amtEl) amtEl.value = emergencyExp.amount || '';
      if (descEl) descEl.value = emergencyExp.description || '';
      if (typeEl) typeEl.value = emergencyExp.expenseType || 'other';

      expenseInLogActive = false;
      toggleExpenseInLog();
    } else {
      expenseInLogActive = true;
      toggleExpenseInLog();
    }

    await applyVehicleBaseline();
    calcVehicleDistance();
    calcVehicleMileage();
=======
    document.getElementById('fromLocation').value = d.fromLocation || '';
    document.getElementById('toLocation').value = d.toLocation || '';
    document.getElementById('startDateTime').value = d.startDateTime ? new Date(d.startDateTime).toISOString().slice(0, 16) : '';
    document.getElementById('endDateTime').value = d.endDateTime ? new Date(d.endDateTime).toISOString().slice(0, 16) : '';
    document.getElementById('endKm').value = d.endKm ?? '';
    document.getElementById('fuelAdded').value = d.fuelAdded ?? 0;
    document.getElementById('remainingFuel').value = d.remainingFuel ?? '';
    document.getElementById('fuelUsedInput').value = d.fuelUsedInput ?? '';
    document.getElementById('fuelFillDate').value = d.fuelFillDate ? new Date(d.fuelFillDate).toISOString().slice(0, 10) : '';
    document.getElementById('mileageReason').value = d.mileageReason || '';
    vehicleExpenseRows = (d.expenses || []).map((e) => ({
      expenseType: e.expenseType,
      amount: e.amount,
      date: e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
      description: e.description || ''
    }));
    renderVehicleExpenseRows();
    await applyVehicleBaseline();
    calcVehicleDistance();
    calcVehicleFuelUsed();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    showAlert('vehicleAlert', 'Waiting entry loaded. Update and save or send for approval.', 'success');
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

async function deleteVehicleWaitingDraft(id) {
  try {
    await api(`/api/vehicle-logs/waiting/${id}`, 'DELETE');
    if (currentVehicleDraftId === id) currentVehicleDraftId = null;
    showAlert('vehicleAlert', 'Waiting entry deleted.', 'success');
    loadVehicleWaitingList();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

async function submitVehicleWaitingDraft(id) {
  try {
    await api(`/api/vehicle-logs/waiting/${id}/submit`, 'POST');
    if (currentVehicleDraftId === id) currentVehicleDraftId = null;
    showAlert('vehicleAlert', 'Waiting entry submitted for manager approval.', 'success');
    loadVehicleWaitingList();
    loadVehicleHistory();
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

<<<<<<< HEAD
async function loadVehicleProfilesAdmin() {
  const el = document.getElementById('vehicleProfilesList');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="10" class="text-center text-muted">Loading profiles...</td></tr>';
  try {
    await loadBranchesDropdowns();
    const vehicles = (await api('/api/vehicles')).filter(v => v.isProfile);
    // Pre-fill the next shortName in the form
    try {
      const nextData = await api('/api/vehicle-profiles/next-shortname');
      const shortNameEl = document.getElementById('vehicleProfilesShortName');
      if (shortNameEl && !shortNameEl.dataset.editing) {
        shortNameEl.value = nextData.nextShortName || '';
      }
    } catch (err) {
      console.error('Failed to load next shortname suggestion', err);
    }

    if (!vehicles.length) {
      el.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No vehicle profiles found.</td></tr>';
      return;
    }

    el.innerHTML = vehicles.map(v => {
      const vStr = encodeURIComponent(JSON.stringify(v));
      const statusBadge = v.status === 'inactive'
        ? '<span class="cds-badge badge-rejected">INACTIVE</span>'
        : '<span class="cds-badge badge-approved">ACTIVE</span>';

      const ownTypeBadge = v.ownershipType === 'rental'
        ? '<span class="cds-badge badge-rental">Rental</span>'
        : '<span class="cds-badge badge-own">Own</span>';

      const deleteBtn = v.isProfile
        ? `<button class="btn cds-btn-sm danger" onclick="deleteVehicleProfileAdmin('${escHtml(v.vehicleNumber)}')">Delete</button>`
        : `<button class="btn cds-btn-sm text-muted" disabled title="Default vehicle has no profile to delete">Delete</button>`;

      return `<tr>
        <td><strong>${escHtml(v.shortName || '—')}</strong></td>
        <td><code>${escHtml(v.vehicleNumber)}</code></td>
        <td>${escHtml(v.vehicleName || '—')}</td>
        <td>${v.openingKm}</td>
        <td>${v.tankCapacity || 0}L</td>
        <td>${v.expectedMileage != null ? v.expectedMileage + ' km/L' : '—'}</td>
        <td><span class="badge bg-secondary">${escHtml(v.branchName || '—')}</span></td>
        <td>${ownTypeBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn cds-btn-sm me-1" onclick="editVehicleProfileAdmin('${vStr}')">Edit</button>
          ${deleteBtn}
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    el.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Error: ${escHtml(err.message)}</td></tr>`;
  }
}

async function deleteVehicleProfileAdmin(vehicleNumber) {
  if (!confirm(`Are you sure you want to delete the profile for vehicle ${vehicleNumber}?`)) return;
  try {
    await api(`/api/vehicle-profiles/${encodeURIComponent(vehicleNumber)}`, 'DELETE');
    showAlert('vehicleProfilesAlert', 'Profile deleted successfully.', 'success');
    clearVehicleProfileAdminForm();
    await loadVehicleList(); // Update datalists in new entry form
  } catch (err) {
    showAlert('vehicleProfilesAlert', err.message);
  }
}

function editVehicleProfileAdmin(pString) {
  try {
    const v = JSON.parse(decodeURIComponent(pString));
    document.getElementById('vehicleProfilesNumber').value = v.vehicleNumber || '';
    document.getElementById('vehicleProfilesNumber').readOnly = true; // No changing vehicle number during edit

    const shortNameEl = document.getElementById('vehicleProfilesShortName');
    shortNameEl.value = v.shortName || '';
    shortNameEl.dataset.editing = 'true';

    document.getElementById('vehicleProfilesName').value = v.vehicleName || '';
    document.getElementById('vehicleProfilesOpeningKm').value = v.openingKm || 0;
    document.getElementById('vehicleProfilesTankCapacity').value = v.tankCapacity || 0;
    document.getElementById('vehicleProfilesExpectedMileage').value = v.expectedMileage != null ? v.expectedMileage : '';
    document.getElementById('vehicleProfilesStatus').value = v.status || 'active';

    const ownershipSelect = document.getElementById('vehicleProfilesOwnership');
    if (ownershipSelect) ownershipSelect.value = v.ownershipType || 'own';

    const branchSelect = document.getElementById('vehicleProfilesBranch');
    if (branchSelect) branchSelect.value = v.branch || '';

    document.getElementById('profileFormTitle').textContent = 'Edit Vehicle Profile';
  } catch (err) {
    console.error(err);
    alert('Failed to parse vehicle profile');
  }
}

function clearVehicleProfileAdminForm() {
  document.getElementById('vehicleProfilesNumber').value = '';
  document.getElementById('vehicleProfilesNumber').readOnly = false;

  const shortNameEl = document.getElementById('vehicleProfilesShortName');
  shortNameEl.value = '';
  delete shortNameEl.dataset.editing;

  document.getElementById('vehicleProfilesName').value = '';
  document.getElementById('vehicleProfilesOpeningKm').value = 0;
  document.getElementById('vehicleProfilesTankCapacity').value = 0;
  document.getElementById('vehicleProfilesExpectedMileage').value = '';
  document.getElementById('vehicleProfilesStatus').value = 'active';

  const ownershipSelect = document.getElementById('vehicleProfilesOwnership');
  if (ownershipSelect) ownershipSelect.value = 'own';

  const branchSelect = document.getElementById('vehicleProfilesBranch');
  if (branchSelect) branchSelect.value = '';

  document.getElementById('profileFormTitle').textContent = 'Add Vehicle Profile';

  // Re-fetch next shortName suggestion
  loadVehicleProfilesAdmin();
}

async function saveVehicleProfileAdmin() {
  const vehicleNumber = document.getElementById('vehicleProfilesNumber')?.value?.trim().toUpperCase();
  const shortName = document.getElementById('vehicleProfilesShortName')?.value?.trim();
  const vehicleName = document.getElementById('vehicleProfilesName')?.value?.trim();
  const openingKm = Number(document.getElementById('vehicleProfilesOpeningKm')?.value || 0);
  const tankCapacity = Number(document.getElementById('vehicleProfilesTankCapacity')?.value || 0);
  const expectedMileage = document.getElementById('vehicleProfilesExpectedMileage')?.value;
  const status = document.getElementById('vehicleProfilesStatus')?.value || 'active';
  const ownershipType = document.getElementById('vehicleProfilesOwnership')?.value || 'own';

  const branchSelect = document.getElementById('vehicleProfilesBranch');
  const branch = branchSelect?.value || undefined;
  const branchName = branch ? branchSelect.options[branchSelect.selectedIndex].text : undefined;

  if (!vehicleNumber || !vehicleName) {
    showAlert('vehicleProfilesAlert', 'Vehicle Number and Vehicle Name are required.');
    return;
  }

  try {
    await api('/api/vehicle-profiles', 'POST', {
      vehicleNumber,
      shortName,
      vehicleName,
      openingKm,
      tankCapacity,
      expectedMileage,
      status,
      branch,
      branchName,
      ownershipType
    });
    showAlert('vehicleProfilesAlert', 'Profile saved successfully.', 'success');
    clearVehicleProfileAdminForm();
    await loadVehicleList(); // Update datalists in new entry form
  } catch (err) {
    showAlert('vehicleProfilesAlert', err.message);
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  }
}

async function loadVehicleEntryForm() {
  setLoading('vehicleHistoryList', 'Loading vehicle history...');
  setLoading('vehicleHistoryListCompact', 'Loading vehicle history...');
  await loadVehicleList();
<<<<<<< HEAD
  await loadBranchesDropdowns();
  await applyVehicleBaseline();
  currentVehicleDraftId = null;

  const startEl = document.getElementById('startDateTime');
  if (startEl) startEl.value = formatDateTime12h(new Date());
  const endEl = document.getElementById('endDateTime');
  if (endEl) {
    if (typeof flatpickr !== 'undefined') {
      if (endDateTimePicker) {
        endDateTimePicker.setDate(new Date());
      } else {
        endDateTimePicker = flatpickr(endEl, {
          enableTime: true,
          dateFormat: "d-M-Y h:i K",
          defaultDate: new Date(),
          minuteIncrement: 1,
          disableMobile: "true"
        });
      }
    } else {
      endEl.value = formatDateTime12h(new Date());
    }
  }

=======
  await applyVehicleBaseline();
  vehicleExpenseRows = [];
  renderVehicleExpenseRows();
  currentVehicleDraftId = null;
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  loadVehicleWaitingList();
}

function vehicleStatusBadge(status) {
<<<<<<< HEAD
  let cls = 'badge-pending';
  if (status === 'approved') cls = 'badge-approved';
  else if (status === 'rejected') cls = 'badge-rejected';
  else if (status === 'queried') cls = 'badge-rejected';
  else if (status === 'answered') cls = 'badge-converted';
=======
  const cls = status === 'approved' ? 'badge-approved' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  return `<span class="cds-badge ${cls}">${status.toUpperCase()}</span>`;
}

function renderVehicleLogsTable(logs, includeActions = false) {
  const getReason = (id) => vehicleRejectDrafts.get(id) || '';
  return `<div class="table-responsive"><table class="table cds-table">
    <thead><tr><th>Vehicle</th><th>Driver</th><th>Route</th><th>KM</th><th>Fuel</th><th>Expenses</th><th>Status</th><th>Manager Approved</th>${includeActions ? '<th>Actions</th>' : ''}</tr></thead>
    <tbody>${logs.map((l) => {
<<<<<<< HEAD
    const rejectOpen = openVehicleRejectId === l._id;
    const isFuel = l.isFuelLog || l.fuelAdded > 0;
    const matchedV = allVehicles.find(v => v.vehicleNumber === l.vehicleNumber);
    const stdMileage = matchedV && matchedV.expectedMileage != null ? matchedV.expectedMileage : '—';

    const hasStdMileage = matchedV && matchedV.expectedMileage != null;
    let mileageStyle = '';
    if (hasStdMileage && l.mileage != null) {
      const stdVal = Number(matchedV.expectedMileage);
      const mileageVal = Number(l.mileage);
      if (mileageVal < stdVal) {
        mileageStyle = 'style="color: #dc2626; font-weight: 600;"'; // red
      } else {
        mileageStyle = 'style="color: #16a34a; font-weight: 600;"'; // green
      }
    }

    return `<tr class="${isFuel ? 'fuel-log-row' : ''}">
      <td><strong>${escHtml(l.vehicleNumber)}</strong></td>
      <td>${escHtml(l.driverName)}</td>
      <td>
        ${l.branchName ? `<div><span class="badge bg-secondary mb-1">${escHtml(l.branchName)}</span></div>` : ''}
        ${l.distanceTravelled === 0 && l.fuelAdded > 0
        ? `<div class="small">${escHtml(l.fromLocation)}</div><div class="small text-muted">${formatDateTime12h(l.startDateTime)}</div>`
        : `<div class="small">${escHtml(l.fromLocation)} → ${escHtml(l.toLocation)}</div><div class="small text-muted">${formatDateTime12h(l.startDateTime)} to ${formatDateTime12h(l.endDateTime)}</div>`
      }
      </td>
      <td>
        ${l.distanceTravelled === 0 && l.fuelAdded > 0
        ? `<div><span class="cds-badge badge-approved" style="background: #2563eb; color: #fff;">FUEL ONLY</span></div><div class="small text-muted">KM: ${l.startKm}</div>`
        : `<div class="small">Start: ${l.startKm}</div><div class="small">End: ${l.endKm}</div><div><strong>${(l.distanceTravelled || 0).toFixed(2)} km</strong></div>`
      }
      </td>
      <td>
        ${isFuel
        ? `<div class="small">Avail: ${l.availableFuel} L</div>
             <div class="small">Added: ${l.fuelAdded} L</div>
             <div class="small">Remain: ${l.remainingFuel} L ${l.isLowFuel ? '<span class="badge bg-warning text-dark">LOW</span>' : ''}</div>
             
             <div class="small">Mileage: <span ${mileageStyle}>${l.mileage != null ? l.mileage : '—'} km/L</span></div>
             <div class="small text-muted">Std Mileage: ${stdMileage} ${stdMileage !== '—' ? 'km/L' : ''}</div>`
        : `—`
      }
      </td>
      <td title="${(l.expenses || []).map(e => {
        const typeStr = e.expenseType ? e.expenseType.toUpperCase() : 'OTHER';
        const descStr = e.description || '';
        return `${typeStr}: ₹${e.amount} ${descStr ? `(${descStr})` : ''}`;
      }).join('\n')}">
        ${(l.expenses || []).length > 0
        ? `<div class="small">${l.expenses.length} item(s) ${isFuel && l.fuelType ? `(${l.fuelType.charAt(0).toUpperCase() + l.fuelType.slice(1)})` : ''}</div>
             <div class="small">${fmt(l.expenses.reduce((s, e) => s + (e.amount || 0), 0))}</div>`
        : `—`
      }
      </td>
      <td>
        ${vehicleStatusBadge(l.status)}
        ${l.rejectReason ? `<div class="small text-danger mt-1">Reason: ${escHtml(l.rejectReason)}</div>` : ''}
        ${l.queryQuestion ? `<div class="small text-danger mt-1"><strong>Q:</strong> ${escHtml(l.queryQuestion)}</div>` : ''}
        ${l.queryAnswer ? `<div class="small text-success mt-1"><strong>A:</strong> ${escHtml(l.queryAnswer)}</div>` : ''}
        <div class="small text-muted mt-1">By: ${escHtml(l.createdBy || '')}</div>
      </td>
      <td>
        ${l.status === 'approved' 
          ? `<strong>${escHtml(l.reviewedBy || '-')}</strong><div class="small text-muted">${l.reviewedAt ? fmtDateTime(l.reviewedAt) : ''}</div>` 
          : (l.status === 'rejected' 
            ? `<span class="text-danger">Rejected by ${escHtml(l.reviewedBy || '-')}</span>` 
            : (['queried', 'answered'].includes(l.status)
              ? `<span class="text-warning">Queried by ${escHtml(l.reviewedBy || '-')}</span>`
              : '—'
            )
          )
        }
      </td>
      ${includeActions ? `<td>
        ${l.status === 'pending' ? `
          <button class="btn cds-btn-approve me-1" onclick="reviewVehicleLog('${l._id}', 'approve')">Approve</button>
          <button class="btn cds-btn-reject" onclick="toggleVehicleRejectForm('${l._id}')">Reject</button>
        ` : (isFuel ? `
          ${l.status === 'approved' ? `
            <button class="btn btn-warning btn-sm" onclick="toggleVehicleRejectForm('${l._id}')">Raise Query</button>
          ` : (l.status === 'queried' ? `
            <button class="btn btn-secondary btn-sm me-1" onclick="resolveVehicleQuery('${l._id}')">Remove Query</button>
            <div class="small text-muted mt-1">Awaiting Answer</div>
          ` : (l.status === 'answered' ? `
            <button class="btn btn-success btn-sm me-1" onclick="resolveVehicleQuery('${l._id}')">Remove Query</button>
            <button class="btn btn-warning btn-sm" onclick="toggleVehicleRejectForm('${l._id}')">Raise Query</button>
          ` : '—'))}
        ` : '—')}
      </td>` : ''}
    </tr>
    ${includeActions ? `
      <tr>
        <td colspan="9" class="p-0">
=======
      const rejectOpen = openVehicleRejectId === l._id;
      return `<tr>
      <td><strong>${escHtml(l.vehicleNumber)}</strong></td>
      <td>${escHtml(l.driverName)}</td>
      <td><div class="small">${escHtml(l.fromLocation)} → ${escHtml(l.toLocation)}</div><div class="small text-muted">${fmtDateTime(l.startDateTime)} to ${fmtDateTime(l.endDateTime)}</div></td>
      <td><div class="small">Start: ${l.startKm}</div><div class="small">End: ${l.endKm}</div><div><strong>${(l.distanceTravelled || 0).toFixed(2)} km</strong></div></td>
      <td><div class="small">Avail: ${l.availableFuel} L</div><div class="small">Added: ${l.fuelAdded} L</div><div class="small">Remain: ${l.remainingFuel} L ${l.isLowFuel ? '<span class="badge bg-warning text-dark">LOW</span>' : ''}</div><div class="small">Used: ${(l.fuelUsed || 0).toFixed(2)} L</div><div class="small">Mileage: ${l.mileage != null ? l.mileage : '—'} km/L</div></td>
      <td><div class="small">${(l.expenses || []).length} item(s)</div><div class="small">${fmt((l.expenses || []).reduce((s, e) => s + (e.amount || 0), 0))}</div></td>
      <td>${vehicleStatusBadge(l.status)}${l.rejectReason ? `<div class="small text-danger mt-1">Reason: ${escHtml(l.rejectReason)}</div>` : ''}<div class="small text-muted mt-1">By: ${escHtml(l.createdBy || '')}</div></td>
      <td>${l.status === 'approved' ? `<strong>${escHtml(l.reviewedBy || '-')}</strong><div class="small text-muted">${fmtDateTime(l.reviewedAt)}</div>` : (l.status === 'rejected' ? `<span class="text-danger">Rejected by ${escHtml(l.reviewedBy || '-')}</span>` : '—')}</td>
      ${includeActions ? `<td>${l.status === 'pending' ? `
        <button class="btn cds-btn-approve me-1" onclick="reviewVehicleLog('${l._id}', 'approve')">Approve</button>
        <button class="btn cds-btn-reject" onclick="toggleVehicleRejectForm('${l._id}')">Reject</button>
      ` : '—'}</td>` : ''}
    </tr>
    ${includeActions ? `
      <tr>
        <td colspan="8" class="p-0">
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
          <div class="inline-slide ${rejectOpen ? 'open' : ''}">
            <div class="p-3 border-top bg-white">
              <div class="row g-2 align-items-end">
                <div class="col-md-9">
<<<<<<< HEAD
                  <label class="form-label small mb-1">${isFuel ? 'Query Question (Question to Security)' : 'Reject Reason'}</label>
                  <input type="text" class="form-control cds-input" value="${escHtml(getReason(l._id))}"
                    oninput="updateVehicleRejectDraft('${l._id}', this.value)" placeholder="${isFuel ? 'Enter question for security (required)' : 'Enter reason (required)'}" />
                </div>
                <div class="col-md-3 d-grid">
                  <button class="btn cds-btn-reject" onclick="submitVehicleReject('${l._id}')">${isFuel ? 'Submit Query' : 'Submit Rejection'}</button>
=======
                  <label class="form-label small mb-1">Reject Reason</label>
                  <input type="text" class="form-control cds-input" value="${escHtml(getReason(l._id))}"
                    oninput="updateVehicleRejectDraft('${l._id}', this.value)" placeholder="Enter reason (required)" />
                </div>
                <div class="col-md-3 d-grid">
                  <button class="btn cds-btn-reject" onclick="submitVehicleReject('${l._id}')">Submit Rejection</button>
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
<<<<<<< HEAD
    ` : (l.status === 'queried' && currentUserRole === 'security' ? `
      <tr>
        <td colspan="8" class="p-0">
          <div class="p-3 border-top bg-light">
            <div class="row g-2 align-items-end">
              <div class="col-md-9">
                <label class="form-label small mb-1 text-danger"><strong>Question from Manager: ${escHtml(l.queryQuestion || l.rejectReason)}</strong></label>
                <input type="text" class="form-control cds-input" placeholder="Type your answer to manager here (required)" />
              </div>
              <div class="col-md-3 d-grid">
                <button class="btn btn-primary btn-sm" onclick="submitVehicleQueryAnswer('${l._id}', this)">Submit Answer</button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    ` : '')}`;
  }).join('')}</tbody></table></div>`;
=======
    ` : ''}`;
    }).join('')}</tbody></table></div>`;
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
}

async function loadVehicleHistory() {
  try {
    setLoading('vehicleHistoryList', 'Loading vehicle history...');
    setLoading('vehicleHistoryListCompact', 'Loading vehicle history...');
<<<<<<< HEAD
    let logs = await api('/api/vehicle-logs');
    if (currentUser && currentUser.branchName) {
      logs = logs.filter(l => 
        l.branchName && l.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
      );
    }
=======
    const logs = await api('/api/vehicle-logs');
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
let currentReviewedLogs = [];

function updateApprovalVehicleDatalist() {
  const datalist = document.getElementById('approvalVehicleSearchList');
  if (!datalist) return;

  const branchFilter = document.getElementById('approvalBranchFilter')?.value || '';
  
  let vehicles = allVehicles.filter(v => v.status !== 'inactive');
  if (branchFilter) {
    vehicles = vehicles.filter(v => v.branchName && v.branchName.toLowerCase() === branchFilter.toLowerCase());
  }

  datalist.innerHTML = vehicles.map((v) => {
    const val = v.shortName || v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');
}

function onApprovalBranchFilterChange() {
  updateApprovalVehicleDatalist();
  renderFilteredReviewedLogs();
}

function renderFilteredReviewedLogs() {
  const branchVal = document.getElementById('approvalBranchFilter')?.value || '';
  const inputVal = document.getElementById('approvalVehicleSearch')?.value?.trim() || '';
  const dateVal = document.getElementById('approvalDateFilter')?.value || '';
  const el = document.getElementById('vehicleReviewedList');
  if (!el) return;

  let logsToRender = currentReviewedLogs;
  if (currentUser && currentUser.branchName) {
    logsToRender = logsToRender.filter(l => 
      l.branchName && l.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
    );
  }

  // 1. Branch filter
  if (branchVal) {
    logsToRender = logsToRender.filter(l => {
      let bName = l.branchName || '';
      if (!bName) {
        const vNum = (l.vehicleNumber || '').toLowerCase();
        const profile = allVehicles.find(v => v.vehicleNumber.toLowerCase() === vNum);
        bName = profile ? (profile.branchName || '') : '';
      }
      return bName.toLowerCase() === branchVal.toLowerCase();
    });
  }

  // 2. Vehicle Filter (by Short Name or Vehicle Number)
  if (inputVal) {
    const matched = allVehicles.find(v =>
      String(v.shortName || '').toUpperCase() === inputVal.toUpperCase() ||
      String(v.vehicleNumber || '').toUpperCase() === inputVal.toUpperCase()
    );
    const filterNum = matched ? matched.vehicleNumber.toUpperCase() : inputVal.toUpperCase();

    logsToRender = logsToRender.filter(l =>
      String(l.vehicleNumber || '').toUpperCase().includes(filterNum)
    );
  }

  // 3. Date Filter (if chosen, show that date, else show all)
  if (dateVal) {
    const [yr, mo, dy] = dateVal.split('-').map(Number);
    logsToRender = logsToRender.filter(l => {
      const d = new Date(l.startDateTime);
      return d.getFullYear() === yr && (d.getMonth() + 1) === mo && d.getDate() === dy;
    });
  }

  el.innerHTML = logsToRender.length
    ? renderVehicleLogsTable(logsToRender, true)
    : '<p class="text-muted small px-2">No reviewed logs found matching the filters.</p>';
}

function clearApprovalFilters() {
  const bFilter = document.getElementById('approvalBranchFilter');
  if (bFilter) bFilter.value = '';
  const vSearch = document.getElementById('approvalVehicleSearch');
  if (vSearch) vSearch.value = '';
  const dFilter = document.getElementById('approvalDateFilter');
  if (dFilter) dFilter.value = '';
  updateApprovalVehicleDatalist();
  renderFilteredReviewedLogs();
}

async function loadVehicleApprovals() {
  try {
    setLoading('vehicleReviewedList', 'Loading reviewed vehicle logs...');
    await loadBranchesDropdowns();
    await loadVehicleList(); // Refresh datalists

    const reviewed = await api('/api/vehicle-logs');
    currentReviewedLogs = reviewed;

    // Sort ascending date-wise (ascending order: 1, 2, 3, 4)
    currentReviewedLogs.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    updateApprovalVehicleDatalist();
    renderFilteredReviewedLogs();
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

async function reviewVehicleLog(id, action) {
  const payload = { action };
  try {
    await api(`/api/vehicle-logs/${id}/review`, 'POST', payload);
    loadVehicleApprovals();
<<<<<<< HEAD
=======
    loadDashboard();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

function toggleVehicleRejectForm(id) {
  openVehicleRejectId = openVehicleRejectId === id ? null : id;
  loadVehicleApprovals();
}

function updateVehicleRejectDraft(id, value) {
  vehicleRejectDrafts.set(id, String(value || ''));
}

async function submitVehicleReject(id) {
  const reason = String(vehicleRejectDrafts.get(id) || '').trim();
  if (!reason) {
<<<<<<< HEAD
    showAlert('vehicleApprovalAlert', 'Question/Reason is required.', 'warning');
    return;
  }
  try {
    const matchedLog = currentReviewedLogs.find(l => l._id === id);
    const isFuel = matchedLog ? (matchedLog.isFuelLog || matchedLog.fuelAdded > 0) : false;
    const action = isFuel ? 'query' : 'reject';

    await api(`/api/vehicle-logs/${id}/review`, 'POST', { action, reason });
    vehicleRejectDrafts.delete(id);
    openVehicleRejectId = null;
    loadVehicleApprovals();
=======
    showAlert('vehicleApprovalAlert', 'Reject reason is required.', 'warning');
    return;
  }
  try {
    await api(`/api/vehicle-logs/${id}/review`, 'POST', { action: 'reject', reason });
    vehicleRejectDrafts.delete(id);
    openVehicleRejectId = null;
    loadVehicleApprovals();
    loadDashboard();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

<<<<<<< HEAD
async function resolveVehicleQuery(id) {
  try {
    await api(`/api/vehicle-logs/${id}/review`, 'POST', { action: 'resolve' });
    loadVehicleApprovals();
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

async function submitVehicleQueryAnswer(id, btn) {
  const parent = btn ? btn.closest('tr') : null;
  const ansEl = parent ? parent.querySelector('input') : null;
  const answer = ansEl?.value?.trim() || '';
  if (!answer) {
    alert('Answer is required.');
    return;
  }
  try {
    await api(`/api/vehicle-logs/${id}/answer`, 'POST', { answer });
    loadVehicleHistory();
  } catch (err) {
    alert(err.message);
  }
}

let currentReportLogs = [];

function renderFilteredVehicleReports() {
  const inputVal = document.getElementById('reportVehicleSearch')?.value?.trim() || '';
  const dateVal = document.getElementById('vehicleReportDate')?.value || '';
  const branchVal = document.getElementById('reportBranchSelect')?.value || '';
  const el = document.getElementById('vehicleReportList');
  if (!el) return;

  let logsToRender = currentReportLogs;
  if (branchVal) {
    logsToRender = logsToRender.filter(l => 
      l.branchName && l.branchName.toLowerCase() === branchVal.toLowerCase()
    );
  } else if (currentUser && currentUser.branchName && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    logsToRender = logsToRender.filter(l => 
      l.branchName && l.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
    );
  }

  // 1. Vehicle Filter
  if (inputVal) {
    const matched = allVehicles.find(v =>
      String(v.shortName || '').toUpperCase() === inputVal.toUpperCase() ||
      String(v.vehicleNumber || '').toUpperCase() === inputVal.toUpperCase()
    );
    const filterNum = matched ? matched.vehicleNumber.toUpperCase() : inputVal.toUpperCase();

    logsToRender = logsToRender.filter(l =>
      String(l.vehicleNumber || '').toUpperCase().includes(filterNum)
    );
  }

  // 2. Date Filter (if chosen, show that date, else show all)
  if (dateVal) {
    const [yr, mo, dy] = dateVal.split('-').map(Number);
    logsToRender = logsToRender.filter(l => {
      const d = new Date(l.startDateTime);
      return d.getFullYear() === yr && (d.getMonth() + 1) === mo && d.getDate() === dy;
    });
  }

  el.innerHTML = logsToRender.length
    ? renderVehicleLogsTable(logsToRender, false)
    : '<p class="text-muted small px-2">No approved logs found matching the filters.</p>';
}

function clearReportFilters() {
  const vSearch = document.getElementById('reportVehicleSearch');
  if (vSearch) vSearch.value = '';
  const dFilter = document.getElementById('vehicleReportDate');
  if (dFilter) dFilter.value = '';
  const bFilter = document.getElementById('reportBranchSelect');
  if (bFilter) bFilter.value = '';
  renderFilteredVehicleReports();
}

async function loadVehicleReports() {
  try {
    setLoading('vehicleReportList', 'Loading vehicle reports...');
    await loadBranchesDropdowns();
    await loadVehicleList(); // Refresh datalists

    const logs = await api('/api/vehicle-logs?status=approved');
    currentReportLogs = logs;
    currentReportLogs.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    renderFilteredVehicleReports();
=======
async function loadVehicleReports() {
  try {
    setLoading('vehicleReportList', 'Loading vehicle reports...');
    const dateInput = document.getElementById('vehicleReportDate')?.value;
    const url = dateInput ? `/api/vehicle-logs?status=approved&date=${dateInput}` : '/api/vehicle-logs?status=approved';
    const logs = await api(url);
    const el = document.getElementById('vehicleReportList');
    if (!el) return;
    el.innerHTML = logs.length ? renderVehicleLogsTable(logs, false) : '<p class="text-muted small px-2">No approved vehicle logs for selected date.</p>';
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    showAlert('vehicleReportAlert', err.message);
  }
}

function printVehicleReport() {
  const el = document.getElementById('vehicleReportList');
  if (!el || !el.innerHTML.includes('<table')) {
    showAlert('vehicleReportAlert', 'No data to print.');
    return;
  }
  const dateInput = document.getElementById('vehicleReportDate')?.value;
  const title = dateInput ? `Vehicle Report - ${dateInput}` : 'Vehicle Report';
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>@page { size: landscape; } body { padding: 20px; font-family: sans-serif; } .cds-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; } .badge-approved { background: #d1fae5; color: #065f46; } .badge-rejected { background: #fee2e2; color: #991b1b; } .badge-pending { background: #fef3c7; color: #92400e; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 8px; font-size: 12px; } th { background-color: #f8f9fa; } .small { font-size: 0.875em; } .text-muted { color: #6c757d; } .text-danger { color: #dc3545; } .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; } .bg-warning { background-color: #ffc107; color: #000; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h4>' + title + '</h4>');
  printWindow.document.write(el.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
<<<<<<< HEAD
  printWindow.onload = function () {
=======
  printWindow.onload = function() {
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

<<<<<<< HEAD
// ─── VEHICLE EXPENSES ────────────────────────────────────────────────────────
function renderFilteredExpenses() {
  const el = document.getElementById('vehicleExpensesList');
  if (!el) return;

  const branchFilter = document.getElementById('expenseBranchFilter')?.value || '';
  const vehicleFilter = document.getElementById('expenseVehicleFilter')?.value || '';
  const dateFilter = document.getElementById('expenseDateFilter')?.value || '';

  let expensesToRender = cachedVehicleExpenses;

  if (currentUser && currentUser.branchName) {
    expensesToRender = expensesToRender.filter(e => {
      const v = allVehicles.find(x => x.vehicleNumber === e.vehicleNumber);
      return v && v.branchName && v.branchName.toLowerCase() === currentUser.branchName.toLowerCase();
    });
  }

  if (branchFilter) {
    expensesToRender = expensesToRender.filter(e => {
      const v = allVehicles.find(x => x.vehicleNumber === e.vehicleNumber);
      return v && v.branchName && v.branchName.toLowerCase() === branchFilter.toLowerCase();
    });
  }

  if (vehicleFilter) {
    expensesToRender = expensesToRender.filter(e => {
      const v = allVehicles.find(x => x.vehicleNumber === e.vehicleNumber);
      const sName = v && v.shortName ? v.shortName : '';
      return e.vehicleNumber === vehicleFilter || sName === vehicleFilter;
    });
  }

  if (dateFilter) {
    const [yr, mo, dy] = dateFilter.split('-').map(Number);
    expensesToRender = expensesToRender.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === yr && (d.getMonth() + 1) === mo && d.getDate() === dy;
    });
  }

  if (!expensesToRender.length) {
    el.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No expenses matching the filters.</td></tr>';
    return;
  }

  el.innerHTML = expensesToRender.map(e => {
    const v = allVehicles.find(x => x.vehicleNumber === e.vehicleNumber);
    const vehicleDisplay = v && v.shortName ? `${v.shortName} (${e.vehicleNumber})` : e.vehicleNumber;
    
    const status = e.status || 'pending';
    let statusDetails = '';
    if (status === 'rejected' && e.rejectReason) {
      statusDetails = `<div class="small text-danger">Reason: ${escHtml(e.rejectReason)}</div>`;
    } else if (status === 'queried' && e.queryQuestion) {
      statusDetails = `<div class="small text-danger"><strong>Q:</strong> ${escHtml(e.queryQuestion)}</div>`;
    } else if (status === 'answered' && e.queryQuestion) {
      statusDetails = `
        <div class="small text-danger"><strong>Q:</strong> ${escHtml(e.queryQuestion)}</div>
        <div class="small text-success"><strong>A:</strong> ${escHtml(e.queryAnswer)}</div>
      `;
    }

    let actionsHtml = '';
    const isManagerOrAdmin = currentUserRole === 'manager' || currentUserRole === 'admin';
    
    if (isManagerOrAdmin) {
      if (status !== 'approved') {
        actionsHtml = `
          <button class="btn btn-sm btn-outline-success" onclick="reviewVehicleExpense('${e._id}', 'approve')">Approve</button>
          <button class="btn btn-sm btn-outline-warning" onclick="reviewVehicleExpense('${e._id}', 'query')">Query</button>
        `;
      } else {
        actionsHtml = `<span class="text-muted small">—</span>`;
      }
    } else {
      if (status === 'queried') {
        actionsHtml = `<button class="btn btn-sm btn-primary" onclick="answerVehicleExpenseQuery('${e._id}')">Answer Query</button>`;
      } else {
        actionsHtml = `<span class="text-muted small">—</span>`;
      }
    }

    return `<tr>
      <td>${fmtDate(e.date)}</td>
      <td><code>${escHtml(vehicleDisplay)}</code></td>
      <td><span class="cds-badge badge-type-expense">${escHtml(e.expenseType.toUpperCase())}</span></td>
      <td><strong>${fmt(e.amount)}</strong></td>
      <td>${escHtml(e.description || '—')}</td>
      <td>${escHtml(e.createdBy)}</td>
      <td>
        ${vehicleStatusBadge(status)}
        ${statusDetails}
      </td>
      <td>
        <div class="d-flex align-items-center flex-wrap gap-1">${actionsHtml}</div>
      </td>
    </tr>`;
  }).join('');
}

function updateExpenseVehicleSelect() {
  const select = document.getElementById('expenseVehicleFilter');
  if (!select) return;

  const currentVal = select.value;
  const branchFilter = document.getElementById('expenseBranchFilter')?.value || '';
  
  let vehicles = allVehicles.filter(v => v.status !== 'inactive');
  if (branchFilter) {
    vehicles = vehicles.filter(v => v.branchName && v.branchName.toLowerCase() === branchFilter.toLowerCase());
  }

  select.innerHTML = '<option value="">All Vehicles</option>' + vehicles.map((v) => {
    const val = v.shortName || v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');

  const hasVal = Array.from(select.options).some(opt => opt.value === currentVal);
  if (currentVal && hasVal) {
    select.value = currentVal;
  } else {
    select.value = '';
  }
}

function onExpenseBranchFilterChange() {
  updateExpenseVehicleSelect();
  renderFilteredExpenses();
}

function clearExpenseFilters() {
  const branchEl = document.getElementById('expenseBranchFilter');
  if (branchEl) branchEl.value = '';
  const vehicleEl = document.getElementById('expenseVehicleFilter');
  if (vehicleEl) vehicleEl.value = '';
  const dateEl = document.getElementById('expenseDateFilter');
  if (dateEl) dateEl.value = '';

  updateExpenseVehicleSelect();
  renderFilteredExpenses();
}

async function loadVehicleExpenses() {
  const el = document.getElementById('vehicleExpensesList');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Loading expenses...</td></tr>';
  try {
    await loadBranchesDropdowns();
    if (allVehicles.length === 0) {
      await loadVehicleList();
    }
    const expenses = await api('/api/vehicle-expenses');
    cachedVehicleExpenses = expenses;
    cachedVehicleExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));

    updateExpenseVehicleSelect();
    renderFilteredExpenses();
  } catch (err) {
    el.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error: ${escHtml(err.message)}</td></tr>`;
  }
}

function printExpenseReport() {
  const el = document.getElementById('vehicleExpensesListWrap');
  if (!el || !el.innerHTML.includes('<table')) {
    alert('No expense data to print.');
    return;
  }
  const dateInput = document.getElementById('expenseDateFilter')?.value;
  const branchInput = document.getElementById('expenseBranchFilter')?.value;
  const vehicleInput = document.getElementById('expenseVehicleFilter')?.value;
  let subtitle = '';
  if (branchInput) subtitle += `Branch: ${branchInput} | `;
  if (vehicleInput) subtitle += `Vehicle: ${vehicleInput} | `;
  if (dateInput) subtitle += `Date: ${dateInput}`;
  subtitle = subtitle.replace(/\s*\|\s*$/, '');

  const clone = el.cloneNode(true);
  const headers = clone.querySelectorAll('th');
  if (headers.length > 7) headers[7].style.display = 'none';
  const rows = clone.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length > 7) cells[7].style.display = 'none';
  });

  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Expense Log Report</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>body { padding: 20px; font-family: sans-serif; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 8px; font-size: 12px; } th { background-color: #f8f9fa; } .small { font-size: 0.875em; } .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h4>Expense Log Report</h4>');
  if (subtitle) printWindow.document.write('<p class="text-muted small">' + subtitle + '</p>');
  printWindow.document.write(clone.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

async function reviewVehicleExpense(id, action) {
  let reason = '';
  if (action === 'reject' || action === 'query') {
    const promptMsg = action === 'reject' ? 'Enter rejection reason:' : 'Enter query question:';
    const r = prompt(promptMsg);
    if (r === null) return;
    reason = r.trim();
    if (!reason) {
      alert('A reason/question is required.');
      return;
    }
  }
  try {
    await api(`/api/vehicle-expenses/${id}/review`, 'POST', { action, reason });
    showAlert('vehicleExpensesAlert', `Expense ${action}ed successfully.`, 'success');
    loadVehicleExpenses();
  } catch (err) {
    alert(err.message);
  }
}

async function answerVehicleExpenseQuery(id) {
  const answer = prompt('Enter your answer to the manager:');
  if (answer === null) return;
  const answerTrimmed = answer.trim();
  if (!answerTrimmed) {
    alert('Answer is required.');
    return;
  }
  try {
    await api(`/api/vehicle-expenses/${id}/answer`, 'POST', { answer: answerTrimmed });
    showAlert('vehicleExpensesAlert', 'Answer submitted successfully.', 'success');
    loadVehicleExpenses();
  } catch (err) {
    alert(err.message);
  }
}

async function saveVehicleExpense() {
  const vehicleNumber = document.getElementById('expenseVehicleNumber')?.value;
  const expenseType = document.getElementById('expenseType')?.value;
  const amount = document.getElementById('expenseAmount')?.value;
  const date = document.getElementById('expenseDate')?.value;
  const description = document.getElementById('expenseDescription')?.value;

  if (!vehicleNumber || !expenseType || !amount || !date) {
    showAlert('vehicleExpensesAlert', 'Vehicle, expense type, amount, and date are required.');
    return;
  }

  try {
    await api('/api/vehicle-expenses', 'POST', {
      vehicleNumber,
      expenseType,
      amount,
      date,
      description
    });
    showAlert('vehicleExpensesAlert', 'Expense saved successfully.', 'success');

    // Reset form fields
    document.getElementById('expenseVehicleShortName').value = '';
    document.getElementById('expenseVehicleNumber').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDate').value = '';
    document.getElementById('expenseDescription').value = '';

    loadVehicleExpenses();
  } catch (err) {
    showAlert('vehicleExpensesAlert', err.message);
  }
}

async function deleteVehicleExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  try {
    await api(`/api/vehicle-expenses/${id}`, 'DELETE');
    showAlert('vehicleExpensesAlert', 'Expense deleted successfully.', 'success');
    loadVehicleExpenses();
=======
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
  try {
    await api(`/api/transactions/${id}/${action}`, 'POST');
    // If there is an alert placeholder we can show the alert, or just refresh
    // We'll call loadTransactions to update the pending and history views
    loadTransactions();
    // We also update dashboard balances if needed
    loadDashboard();
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    alert(err.message);
  }
}

// ─── XSS Protection ──────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── SCRAP MANAGEMENT ──────────────────────────────────────────────────────────

<<<<<<< HEAD
=======
async function initScrapDashboard() {
  try {
    const data = await api('/api/scrap/dashboard');
    document.getElementById('scrapTotalEntries').textContent = data.totalEntries;
    document.getElementById('scrapPendingCount').textContent = data.pendingApprovals;
    document.getElementById('scrapApprovedCount').textContent = data.approvedEntries;
    document.getElementById('scrapTotalValue').textContent = fmt(data.totalScrapValue);
    
    const entries = await api('/api/scrap/entries?status=approved');
    const tbody = entries.slice(0, 10).map(e => `<tr>
      <td>${fmtDate(e.createdAt)}</td>
      <td>${escHtml(e.companyName)}</td>
      <td>${escHtml(e.productName)}</td>
      <td>${e.weight} KG</td>
      <td>${fmt(e.totalAmount)}</td>
    </tr>`).join('');
    
    document.getElementById('scrapDashTable').innerHTML = `
      <div class="table-responsive"><table class="table cds-table mb-0">
        <thead><tr><th>Date</th><th>Company</th><th>Product</th><th>Weight</th><th>Amount</th></tr></thead>
        <tbody>${tbody || '<tr><td colspan="5" class="text-center">No approved entries</td></tr>'}</tbody>
      </table></div>`;
  } catch (err) {
    console.error(err);
  }
}
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

async function loadScrapProducts() {
  const el = document.getElementById('scrapProductList');
  if (!el) return;
  try {
    const prods = await api('/api/scrap/products');
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
      <thead><tr><th>Product Name</th><th>Price/KG</th><th>Actions</th></tr></thead>
      <tbody>
        ${prods.map(p => `<tr>
          <td>${escHtml(p.name)}</td>
          <td>${fmt(p.pricePerKg)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2" onclick="editScrapProductPrice('${p._id}', ${p.pricePerKg})">Update Price</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteScrapProduct('${p._id}')">Delete</button>
          </td>
        </tr>`).join('') || '<tr><td colspan="3" class="text-center">No products found</td></tr>'}
      </tbody>
    </table></div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function editScrapProductPrice(id, currentPrice) {
  const newPrice = prompt('Enter new price per KG (₹):', currentPrice);
  if (newPrice === null) return;
  const priceNum = Number(newPrice);
  if (isNaN(priceNum) || priceNum < 0) return alert('Invalid price entered');
<<<<<<< HEAD

=======
  
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  try {
    await api(`/api/scrap/products/${id}`, 'PUT', { pricePerKg: priceNum });
    loadScrapProducts();
  } catch (err) {
    alert(err.message);
  }
}

async function addScrapProduct() {
  const name = document.getElementById('scrapProductName').value;
  const price = document.getElementById('scrapProductPrice').value;
  if (!name || !price) return showAlert('scrapProductAlert', 'Enter name and price');
  try {
    await api('/api/scrap/products', 'POST', { name, pricePerKg: price });
    document.getElementById('scrapProductName').value = '';
    document.getElementById('scrapProductPrice').value = '';
    showAlert('scrapProductAlert', 'Product added', 'success');
    loadScrapProducts();
  } catch (err) {
    showAlert('scrapProductAlert', err.message);
  }
}

async function deleteScrapProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await api(`/api/scrap/products/${id}`, 'DELETE');
    loadScrapProducts();
  } catch (err) {
    alert(err.message);
  }
}

let allScrapProducts = [];
async function loadScrapProductDropdown() {
  const sel = document.getElementById('scrapProductSelect');
  if (!sel) return;
  try {
    allScrapProducts = await api('/api/scrap/products');
<<<<<<< HEAD
    sel.innerHTML = `<option value="">Select Product</option>` +
=======
    sel.innerHTML = `<option value="">Select Product</option>` + 
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
      allScrapProducts.map(p => `<option value="${p._id}">${escHtml(p.name)} (₹${p.pricePerKg}/kg)</option>`).join('');
  } catch (err) {
    console.error(err);
  }
}

<<<<<<< HEAD
let currentScrapItems = [];

function calcScrapTotal() {
  const sel = document.getElementById('scrapProductSelect');
  const weight = document.getElementById('scrapWeight').value;
  const priceKgEl = document.getElementById('scrapPriceKg');
  const itemTotalText = document.getElementById('scrapItemTotalText');

  if (!sel || !sel.value) {
    if (priceKgEl) priceKgEl.value = '';
    if (itemTotalText) itemTotalText.innerHTML = '₹0.00';
    return;
  }

  const prod = allScrapProducts.find(p => p._id === sel.value);
  if (prod) {
    if (priceKgEl) priceKgEl.value = prod.pricePerKg;
    if (weight) {
      const total = Number(weight) * prod.pricePerKg;
      if (itemTotalText) itemTotalText.innerHTML = `₹${total.toFixed(2)}`;
    } else {
      if (itemTotalText) itemTotalText.innerHTML = '₹0.00';
=======
function calcScrapTotal() {
  const sel = document.getElementById('scrapProductSelect');
  const weight = document.getElementById('scrapWeight').value;
  if (!sel || !sel.value) return;
  const prod = allScrapProducts.find(p => p._id === sel.value);
  if (prod) {
    document.getElementById('scrapPriceKg').value = prod.pricePerKg;
    if (weight) {
      document.getElementById('scrapTotalAmount').value = (Number(weight) * prod.pricePerKg).toFixed(2);
    } else {
      document.getElementById('scrapTotalAmount').value = '';
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    }
  }
}

<<<<<<< HEAD
function renderDraftScrapItems() {
  const container = document.getElementById('scrapItemsListContainer');
  const grandTotalEl = document.getElementById('scrapGrandTotalText');
  if (!container) return;

  if (currentScrapItems.length === 0) {
    container.innerHTML = `<div class="text-muted small text-center py-3">No products added yet. Use the form below to add.</div>`;
    if (grandTotalEl) grandTotalEl.textContent = '₹0.00';
    return;
  }

  let grandTotal = 0;
  let html = `<div class="table-responsive"><table class="table table-sm cds-table border-0 mb-0" style="font-size: 13px;">
    <thead>
      <tr>
        <th class="border-0 ps-0">Product</th>
        <th class="border-0">Weight</th>
        <th class="border-0">Price/KG</th>
        <th class="border-0 text-end">Total</th>
        <th class="border-0 text-end pe-0">Action</th>
      </tr>
    </thead>
    <tbody>`;

  currentScrapItems.forEach((item, index) => {
    const total = item.weight * item.pricePerKg;
    grandTotal += total;
    html += `<tr>
      <td class="border-0 ps-0 fw-semibold">${escHtml(item.productName)}</td>
      <td class="border-0">${item.weight} KG</td>
      <td class="border-0">₹${item.pricePerKg}</td>
      <td class="border-0 text-end">₹${total.toFixed(2)}</td>
      <td class="border-0 text-end pe-0">
        <button type="button" class="btn btn-link text-danger p-0" onclick="removeScrapItemFromList(${index})" style="text-decoration: none; font-size: 16px; line-height: 1; border: none; background: none;">&times;</button>
      </td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;

  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
}

function addScrapItemToList() {
  const sel = document.getElementById('scrapProductSelect');
  const weightInput = document.getElementById('scrapWeight');

  if (!sel || !sel.value || !weightInput || !weightInput.value) {
    showAlert('scrapEntryAlert', 'Please select a product and enter weight', 'warning');
    return;
  }

  const productId = sel.value;
  const weight = Number(weightInput.value);

  if (isNaN(weight) || weight <= 0) {
    showAlert('scrapEntryAlert', 'Weight must be a positive number', 'warning');
    return;
  }

  const product = allScrapProducts.find(p => p._id === productId);
  if (!product) {
    showAlert('scrapEntryAlert', 'Invalid product selected', 'danger');
    return;
  }

  const existingIndex = currentScrapItems.findIndex(item => item.productId === productId);
  if (existingIndex > -1) {
    currentScrapItems[existingIndex].weight = Number((currentScrapItems[existingIndex].weight + weight).toFixed(2));
  } else {
    currentScrapItems.push({
      productId: product._id,
      productName: product.name,
      weight: weight,
      pricePerKg: product.pricePerKg
    });
  }

  sel.value = '';
  weightInput.value = '';
  document.getElementById('scrapPriceKg').value = '';
  document.getElementById('scrapItemTotalText').innerHTML = '₹0.00';

  renderDraftScrapItems();

  const alertEl = document.getElementById('scrapEntryAlert');
  if (alertEl) alertEl.innerHTML = '';
}

function removeScrapItemFromList(index) {
  currentScrapItems.splice(index, 1);
  renderDraftScrapItems();
}

async function submitScrapEntry() {
  const companyName = document.getElementById('scrapCompany').value;
  const vehicleNumber = document.getElementById('scrapVehicle').value;
  const dateTimeStr = document.getElementById('scrapDateTime')?.value;
  const description = document.getElementById('scrapDescription')?.value?.trim();

  const branchSelect = document.getElementById('scrapBranchSelect');
  const branchId = branchSelect?.value;
  const branchName = branchId ? branchSelect.options[branchSelect.selectedIndex].text : undefined;

  if (!branchId) {
    return showAlert('scrapEntryAlert', 'Please select a branch.');
  }

  if (!companyName || !vehicleNumber) {
    return showAlert('scrapEntryAlert', 'Company and Vehicle Number are required');
  }

  if (currentScrapItems.length === 0) {
    return showAlert('scrapEntryAlert', 'Please add at least one scrap product');
  }

  try {
    const payload = {
      companyName,
      vehicleNumber,
      ownerName: "—",
      branch: branchId,
      branchName,
      dateTime: dateTimeStr || undefined,
      description,
      items: currentScrapItems.map(item => ({
        productId: item.productId,
        weight: item.weight
      }))
    };

    await api('/api/scrap/entries', 'POST', payload);
    showAlert('scrapEntryAlert', 'Entry submitted successfully', 'success');

    document.getElementById('scrapCompany').value = '';
    document.getElementById('scrapVehicle').value = '';
    const descEl = document.getElementById('scrapDescription');
    if (descEl) descEl.value = '';
    
    if (branchSelect && (!currentUser || !currentUser.branch)) branchSelect.value = '';
    
    if (scrapDateTimePicker) {
      scrapDateTimePicker.setDate(new Date());
    } else {
      const scrapDateEl = document.getElementById('scrapDateTime');
      if (scrapDateEl) scrapDateEl.value = formatDateTime12h(new Date());
    }
    
    currentScrapItems = [];
    renderDraftScrapItems();

=======
async function submitScrapEntry() {
  const companyName = document.getElementById('scrapCompany').value;
  const vehicleNumber = document.getElementById('scrapVehicle').value;
  const ownerName = document.getElementById('scrapOwner').value;
  const productId = document.getElementById('scrapProductSelect').value;
  const weight = document.getElementById('scrapWeight').value;
  
  if (!companyName || !vehicleNumber || !ownerName || !productId || !weight) {
    return showAlert('scrapEntryAlert', 'All fields are required');
  }
  
  try {
    await api('/api/scrap/entries', 'POST', { companyName, vehicleNumber, ownerName, productId, weight });
    showAlert('scrapEntryAlert', 'Entry submitted successfully', 'success');
    document.getElementById('scrapCompany').value = '';
    document.getElementById('scrapVehicle').value = '';
    document.getElementById('scrapOwner').value = '';
    document.getElementById('scrapProductSelect').value = '';
    document.getElementById('scrapWeight').value = '';
    document.getElementById('scrapPriceKg').value = '';
    document.getElementById('scrapTotalAmount').value = '';
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    loadScrapMyEntries();
  } catch (err) {
    showAlert('scrapEntryAlert', err.message);
  }
}

<<<<<<< HEAD
function printScrapSlip() {
  const companyName = document.getElementById('scrapCompany')?.value || '';
  const vehicleNumber = document.getElementById('scrapVehicle')?.value || '';
  const dateTimeStr = document.getElementById('scrapDateTime')?.value || formatDateTime12h(new Date());
  const description = document.getElementById('scrapDescription')?.value?.trim() || '';

  const branchSelect = document.getElementById('scrapBranchSelect');
  const branchName = branchSelect && branchSelect.selectedIndex >= 0 ? branchSelect.options[branchSelect.selectedIndex].text : '';

  if (currentScrapItems.length === 0) {
    return showAlert('scrapEntryAlert', 'Please add at least one scrap product before printing', 'warning');
  }

  let itemsHtml = '';
  let grandTotalCalculated = 0;
  currentScrapItems.forEach((item, index) => {
    const total = item.weight * item.pricePerKg;
    grandTotalCalculated += total;
    itemsHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${escHtml(item.productName)}</td>
        <td class="text-end">${item.weight} KG</td>
        <td class="text-end">₹${item.pricePerKg.toFixed(2)}</td>
        <td class="text-end">₹${total.toFixed(2)}</td>
      </tr>
    `;
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup blocked! Please allow popups for this site to print.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scrap Entry Slip - ${escHtml(vehicleNumber)}</title>
      <style>
        body {
          font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
          margin: 30px;
          color: #1a2233;
          background: #fff;
          font-size: 14px;
          line-height: 1.5;
        }
        .slip-container {
          max-width: 650px;
          margin: 0 auto;
          border: 1px solid #e5e8ef;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1a6cff;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .header h2 {
          margin: 0 0 5px 0;
          color: #1a6cff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .header p {
          margin: 0;
          font-size: 13px;
          color: #6b7a99;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .meta-item {
          font-size: 13.5px;
        }
        .meta-item strong {
          color: #6b7a99;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 2px;
        }
        .meta-item span {
          color: #1a2233;
          font-weight: 600;
          font-size: 14px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .items-table th, .items-table td {
          border-bottom: 1px solid #e5e8ef;
          padding: 10px 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f1f5f9;
          font-weight: 600;
          color: #475569;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .items-table td {
          font-size: 13.5px;
        }
        .items-table td.text-end, .items-table th.text-end {
          text-align: right;
        }
        .total-row {
          font-size: 16px;
          font-weight: 700;
          border-top: 2px solid #1a6cff;
          background: #f8fafc;
        }
        .total-row td {
          padding: 12px;
          color: #16a34a;
        }
        .description-box {
          background: #fdfbf7;
          border: 1px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          font-size: 13px;
        }
        .description-box strong {
          display: block;
          margin-bottom: 5px;
          color: #b45309;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .description-box p {
          margin: 0;
          color: #451a03;
        }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
          padding-top: 25px;
          border-top: 1px dashed #cbd5e1;
        }
        .signature-line {
          text-align: center;
          width: 42%;
        }
        .signature-line div {
          border-bottom: 1.5px solid #94a3b8;
          height: 40px;
          margin-bottom: 8px;
        }
        .signature-line span {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @media print {
          body {
            margin: 0;
            background: #fff;
          }
          .slip-container {
            border: none;
            padding: 0;
            max-width: 100%;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="slip-container">
        <div class="header">
          <h2>TCS — Scrap Entry Slip</h2>
          <p>Security Checkpoint Copy</p>
        </div>
        
        <div class="meta-grid">
          <div class="meta-item">
            <strong>Date & Time</strong>
            <span>${escHtml(dateTimeStr)}</span>
          </div>
          <div class="meta-item">
            <strong>Branch</strong>
            <span>${escHtml(branchName) || '—'}</span>
          </div>
          <div class="meta-item">
            <strong>Company Name</strong>
            <span>${escHtml(companyName) || '—'}</span>
          </div>
          <div class="meta-item">
            <strong>Vehicle Number</strong>
            <span>${escHtml(vehicleNumber).toUpperCase() || '—'}</span>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50px;">S.No</th>
              <th>Product</th>
              <th class="text-end" style="width: 120px;">Weight</th>
              <th class="text-end" style="width: 120px;">Price/KG</th>
              <th class="text-end" style="width: 120px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="3"></td>
              <td class="text-end">Grand Total:</td>
              <td class="text-end">₹${grandTotalCalculated.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        ${description ? `
        <div class="description-box">
          <strong>Description / Notes</strong>
          <p>${escHtml(description)}</p>
        </div>
        ` : ''}

        <div class="signatures">
          <div class="signature-line">
            <div></div>
            <span>Security Signature</span>
          </div>
          <div class="signature-line">
            <div></div>
            <span>Receiver Signature</span>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
async function loadScrapMyEntries() {
  const el = document.getElementById('scrapMyEntryList');
  if (!el) return;
  try {
    const entries = await api('/api/scrap/entries?status=pending');
    el.innerHTML = _renderScrapTable(entries, false);
  } catch (err) {
    el.innerHTML = err.message;
  }
}

async function loadScrapMyHistory() {
  const el = document.getElementById('scrapHistoryList');
  if (!el) return;
  try {
    const entries = await api('/api/scrap/entries');
    el.innerHTML = _renderScrapTable(entries, false);
  } catch (err) {
    el.innerHTML = err.message;
  }
}

async function loadScrapApprovals() {
  const el = document.getElementById('scrapPendingList');
  if (!el) return;
  try {
    const entries = await api('/api/scrap/entries?status=pending');
    el.innerHTML = _renderScrapTable(entries, true);
  } catch (err) {
    el.innerHTML = err.message;
  }
}

async function reviewScrap(id, action) {
  try {
    let body = {};
    if (action === 'reject') {
      const r = prompt('Reason for rejection:');
      if (r === null) return;
      body.reason = r;
    }
    await api(`/api/scrap/entries/${id}/${action}`, 'POST', body);
    showAlert('scrapApprovalAlert', `Entry ${action}ed successfully`, 'success');
    loadScrapApprovals();
  } catch (err) {
    showAlert('scrapApprovalAlert', err.message);
  }
}

async function loadScrapReports() {
  const el = document.getElementById('scrapReportList');
  if (!el) return;
  const d = document.getElementById('scrapReportDate').value;
  try {
<<<<<<< HEAD
    await loadBranchesDropdowns();
    const url = d ? `/api/scrap/entries?status=approved&date=${d}` : '/api/scrap/entries?status=approved';
    const entries = await api(url);
    
    let filtered = entries;
    const branchVal = document.getElementById('scrapReportBranchSelect')?.value || '';
    if (branchVal) {
      filtered = entries.filter(e => e.branchName && e.branchName.toLowerCase() === branchVal.toLowerCase());
    } else if (currentUser && currentUser.branchName && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      filtered = entries.filter(e => e.branchName && e.branchName.toLowerCase() === currentUser.branchName.toLowerCase());
    }
    
    el.innerHTML = _renderScrapTable(filtered, false);
=======
    const url = d ? `/api/scrap/entries?status=approved&date=${d}` : '/api/scrap/entries?status=approved';
    const entries = await api(url);
    el.innerHTML = _renderScrapTable(entries, false);
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  } catch (err) {
    el.innerHTML = err.message;
  }
}

function printScrapReport() {
  const d = document.getElementById('scrapReportDate').value;
  const title = d ? `Scrap Report - ${d}` : 'Scrap Report - All Time';
  const html = document.getElementById('scrapReportList').innerHTML;
  const w = window.open();
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      @page { size: landscape; }
      body { font-family: sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>
    </head><body>
      <h2>${title}</h2>
      ${html}
      <script>window.print();</script>
    </body></html>
  `);
  w.document.close();
}

function _renderScrapTable(entries, isApproval) {
  if (!entries.length) return '<div class="alert alert-info">No records found.</div>';
  return `<div class="table-responsive"><table class="table cds-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Status</th>
        <th>Company</th>
        <th>Vehicle</th>
<<<<<<< HEAD
        <th>Products Detail</th>
        <th>Grand Total (₹)</th>
=======
        <th>Product</th>
        <th>Weight</th>
        <th>Total (₹)</th>
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
        ${isApproval ? '<th>Action</th>' : ''}
      </tr>
    </thead>
    <tbody>
<<<<<<< HEAD
      ${entries.map(e => {
    const itemsHtml = (e.items && e.items.length ? e.items : [{ productName: e.productName, weight: e.weight, pricePerKg: e.pricePerKg, totalAmount: e.totalAmount }])
      .map(item => `
            <div style="font-size: 12px; line-height: 1.3; margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 2px;">
              <span class="fw-semibold">${escHtml(item.productName)}</span><br>
              <span class="text-muted small">${item.weight} KG &times; ₹${item.pricePerKg}/kg = ₹${(item.totalAmount || 0).toFixed(2)}</span>
            </div>
          `).join('');

    return `
          <tr>
            <td>${fmtDateTime(e.createdAt)}</td>
            <td>${statusBadge(e.status)}</td>
            <td>
              ${e.branchName ? `<div><span class="badge bg-secondary mb-1">${escHtml(e.branchName)}</span></div>` : ''}
              ${escHtml(e.companyName)}${(e.ownerName && e.ownerName !== '—') ? `<br><small class="text-muted">${escHtml(e.ownerName)}</small>` : ''}
              ${e.description ? `<br><small class="text-muted" style="font-style: italic;">Note: ${escHtml(e.description)}</small>` : ''}
            </td>
            <td>${escHtml(e.vehicleNumber)}</td>
            <td>${itemsHtml}</td>
            <td><strong>${fmt(e.totalAmount)}</strong></td>
            ${isApproval ? `<td>
              <button class="btn btn-sm btn-success mb-1 w-100" onclick="reviewScrap('${e._id}', 'approve')">Approve</button>
              <button class="btn btn-sm btn-danger w-100" onclick="reviewScrap('${e._id}', 'reject')">Reject</button>
            </td>` : ''}
          </tr>
        `;
  }).join('')}
=======
      ${entries.map(e => `
        <tr>
          <td>${fmtDateTime(e.createdAt)}</td>
          <td>${statusBadge(e.status)}</td>
          <td>${escHtml(e.companyName)}<br><small class="text-muted">${escHtml(e.ownerName)}</small></td>
          <td>${escHtml(e.vehicleNumber)}</td>
          <td>${escHtml(e.productName)}<br><small class="text-muted">₹${e.pricePerKg}/kg</small></td>
          <td><strong>${e.weight} KG</strong></td>
          <td><strong>${fmt(e.totalAmount)}</strong></td>
          ${isApproval ? `<td>
            <button class="btn btn-sm btn-success mb-1 w-100" onclick="reviewScrap('${e._id}', 'approve')">Approve</button>
            <button class="btn btn-sm btn-danger w-100" onclick="reviewScrap('${e._id}', 'reject')">Reject</button>
          </td>` : ''}
        </tr>
      `).join('')}
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    </tbody>
  </table></div>`;
}

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
function showChangePasswordModal() {
  let modalEl = document.getElementById('cdsChangePasswordOverlay');
  if (!modalEl) {
    const div = document.createElement('div');
    div.innerHTML = `
      <div id="cdsChangePasswordOverlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div class="cds-card form-structured" style="width: 100%; max-width: 400px; margin: 20px; position: relative;">
          <button onclick="hideChangePasswordModal()" style="position: absolute; right: 15px; top: 15px; background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">&times;</button>
          <div class="card-header-cds mb-3">
            <h5 style="margin:0;">Change Password</h5>
          </div>
          <div id="changePasswordAlert"></div>
          <div class="mb-3">
            <label class="form-label">Current Password</label>
            <input type="password" id="changePasswordCurrent" class="form-control cds-input" />
          </div>
          <div class="mb-4">
            <label class="form-label">New Password</label>
            <input type="password" id="changePasswordNew" class="form-control cds-input" />
          </div>
          <button class="btn cds-btn-primary w-100" id="btnSubmitChangePassword" onclick="submitChangePassword()">Update Password</button>
        </div>
      </div>
    `;
    document.body.appendChild(div.firstElementChild);
    modalEl = document.getElementById('cdsChangePasswordOverlay');
  }
  document.getElementById('changePasswordCurrent').value = '';
  document.getElementById('changePasswordNew').value = '';
  document.getElementById('changePasswordAlert').innerHTML = '';
  modalEl.style.display = 'flex';
}

function hideChangePasswordModal() {
  const modalEl = document.getElementById('cdsChangePasswordOverlay');
  if (modalEl) modalEl.style.display = 'none';
}

async function submitChangePassword() {
  const currentPassword = document.getElementById('changePasswordCurrent').value;
  const newPassword = document.getElementById('changePasswordNew').value;
  if (!currentPassword || !newPassword) {
    showAlert('changePasswordAlert', 'Please enter both current and new password.');
    return;
  }
  const btn = document.getElementById('btnSubmitChangePassword');
  try {
    if (btn) btn.disabled = true;
    await api('/api/change-password', 'POST', { currentPassword, newPassword });
    showAlert('changePasswordAlert', 'Password updated! Logging out...', 'success');
    setTimeout(() => doLogout(), 1500);
  } catch (err) {
    showAlert('changePasswordAlert', err.message);
    if (btn) btn.disabled = false;
  }
}

<<<<<<< HEAD
// ─── Fuel Form Logic ─────────────────────────────────────────────────────────
async function fetchFuelPrices() {
  try {
    cachedFuelPrices = await api('/api/fuel-prices');
  } catch (err) {
    console.error('Failed to fetch fuel prices', err);
  }
}

async function applyFuelVehicleBaseline() {
  const vehicleNumber = document.getElementById('fuelVehicleNumber')?.value?.trim().toUpperCase();
  if (!vehicleNumber) return;
  try {
    const baseline = await api(`/api/vehicle-logs/baseline?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
    const tankCapacityEl = document.getElementById('fuelTankCapacity');
    if (tankCapacityEl) tankCapacityEl.value = baseline.tankCapacity || 0;

    const distEl = document.getElementById('fuelTripDistance');
    if (distEl) distEl.value = (baseline.tripDistanceSum || 0).toFixed(2);
    const distTextEl = document.getElementById('fuelTripDistanceText');
    if (distTextEl) distTextEl.textContent = (baseline.tripDistanceSum || 0).toFixed(2);

    const approxEl = document.getElementById('fuelApproxUsed');
    if (approxEl) approxEl.value = (baseline.approxFuelUsed || 0).toFixed(2);
    const approxTextEl = document.getElementById('fuelApproxUsedText');
    if (approxTextEl) approxTextEl.textContent = (baseline.approxFuelUsed || 0).toFixed(2);

    calcFuelCostAndRemaining();
  } catch (err) {
    showAlert('fuelAlert', err.message);
  }
}

function onFuelTypeChange() {
  const type = document.getElementById('fuelTypeSelect')?.value || 'petrol';
  const priceInput = document.getElementById('fuelPricePerLitre');
  if (priceInput) {
    const price = cachedFuelPrices[type] || (type === 'petrol' ? 102.50 : 94.20);
    priceInput.value = price;
  }
  calcFuelCostAndRemaining();
}

function calcFuelCostAndRemaining() {
  const capacity = Number(document.getElementById('fuelTankCapacity')?.value || 0);
  const added = Number(document.getElementById('fuelAddedLiters')?.value || 0);
  const pricePerLitre = Number(document.getElementById('fuelPricePerLitre')?.value || 0);

  const availEl = document.getElementById('fuelAvailableFuel');
  if (availEl) {
    availEl.value = Math.max(0, capacity - added).toFixed(2);
  }

  const costEl = document.getElementById('fuelPrice');
  if (costEl) {
    costEl.value = (added * pricePerLitre).toFixed(2);
  }

  const remEl = document.getElementById('fuelRemainingFuel');
  if (remEl) {
    remEl.value = capacity.toFixed(2);
  }
}

async function submitFuelForm() {
  const driverName = document.getElementById('fuelDriverName')?.value?.trim();
  const vehicleNumber = document.getElementById('fuelVehicleNumber')?.value?.trim().toUpperCase();
  const fuelAdded = Number(document.getElementById('fuelAddedLiters')?.value || 0);
  const pricePerLitre = Number(document.getElementById('fuelPricePerLitre')?.value || 0);
  const fuelType = document.getElementById('fuelTypeSelect')?.value || 'petrol';
  const bunk = document.getElementById('fuelBunkName')?.value?.trim();
  const location = document.getElementById('fuelLocation')?.value?.trim();
  const price = Number(document.getElementById('fuelPrice')?.value || 0);
  const startDateTime = document.getElementById('fuelStartDateTime')?.value;

  if (!driverName || !vehicleNumber || fuelAdded <= 0 || pricePerLitre <= 0 || !bunk || !location || price <= 0 || !startDateTime) {
    showAlert('fuelAlert', 'Please fill all required fields with positive values.');
    return;
  }

  const expense = {
    expenseType: 'oil',
    amount: price,
    date: new Date(),
    description: `FUEL_ADDITION:qty=${fuelAdded};current=${(Number(document.getElementById('fuelTankCapacity')?.value || 0) - fuelAdded).toFixed(2)};bunk=${bunk}`
  };

  const matchedV = allVehicles.find(v => v.vehicleNumber === vehicleNumber);
  const branch = matchedV?.branch;
  const branchName = matchedV?.branchName;

  const payload = {
    driverName: driverName,
    vehicleNumber: vehicleNumber,
    fromLocation: location,
    toLocation: location,
    startDateTime: startDateTime,
    endDateTime: startDateTime,
    fuelAdded: fuelAdded,
    remainingFuel: Number(document.getElementById('fuelTankCapacity')?.value || 0),
    fuelUsedInput: fuelAdded,
    mileageReason: '',
    fuelFillDate: startDateTime,
    expenses: [expense],
    isFuelLog: true,
    fuelType: fuelType,
    pricePerLitre: pricePerLitre,
    branch: branch || undefined,
    branchName: branchName || undefined
  };

  try {
    await api('/api/vehicle-logs', 'POST', payload);
    showAlert('fuelAlert', 'Fuel log submitted successfully.', 'success');
    resetFuelForm();
    await applyFuelVehicleBaseline();
    loadFuelHistory();
    if (typeof loadVehicleHistory === 'function') loadVehicleHistory();
  } catch (err) {
    showAlert('fuelAlert', err.message);
  }
}

function resetFuelForm() {
  ['fuelDriverName', 'fuelVehicleShortName', 'fuelVehicleNumber', 'fuelAddedLiters', 'fuelBunkName', 'fuelLocation', 'fuelPrice', 'fuelPricePerLitre', 'fuelTripDistance', 'fuelApproxUsed'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const distTextEl = document.getElementById('fuelTripDistanceText');
  if (distTextEl) distTextEl.textContent = '0.00';
  const approxTextEl = document.getElementById('fuelApproxUsedText');
  if (approxTextEl) approxTextEl.textContent = '0.00';

  const typeEl = document.getElementById('fuelTypeSelect');
  if (typeEl) typeEl.value = 'petrol';

  const tankEl = document.getElementById('fuelTankCapacity');
  if (tankEl) tankEl.value = '0';
  const availEl = document.getElementById('fuelAvailableFuel');
  if (availEl) availEl.value = '0';
  const remEl = document.getElementById('fuelRemainingFuel');
  if (remEl) remEl.value = '0';

  const startEl = document.getElementById('fuelStartDateTime');
  if (startEl) {
    if (fuelStartDateTimePicker) {
      fuelStartDateTimePicker.setDate(new Date());
    } else {
      startEl.value = formatDateTime12h(new Date());
    }
  }
}

function parseFuelDetails(l) {
  let bunkName = '';
  let bunkLocation = '';
  const fuelExpense = (l.expenses || []).find(e => e.expenseType === 'oil' && e.description && e.description.startsWith('FUEL_ADDITION:'));
  if (fuelExpense) {
    const desc = fuelExpense.description;
    const bunkMatch = desc.match(/bunk=([^;]+)/);
    const locMatch = desc.match(/loc=([^;]+)/);
    if (bunkMatch) bunkName = bunkMatch[1];
    if (locMatch) bunkLocation = locMatch[1];
  }
  if (!bunkName) {
    bunkName = l.fromLocation || '';
  }
  if (!bunkLocation && l.isFuelLog) {
    bunkLocation = l.fromLocation || '';
  }
  return { bunkName, bunkLocation };
}

function renderFilteredFuelLogs() {
  const el = document.getElementById('fuelHistoryList');
  if (!el) return;

  const branchFilter = document.getElementById('fuelBranchFilter')?.value || '';
  const vehicleSearch = document.getElementById('fuelVehicleSearch')?.value?.toLowerCase() || '';
  const dateFilter = document.getElementById('fuelDateFilter')?.value || '';

  let filtered = cachedFuelLogs;

  if (branchFilter) {
    filtered = filtered.filter(l => {
      let bName = l.branchName || '';
      if (!bName) {
        const vNum = (l.vehicleNumber || '').toLowerCase();
        const profile = allVehicles.find(v => v.vehicleNumber.toLowerCase() === vNum);
        bName = profile ? (profile.branchName || '') : '';
      }
      return bName.toLowerCase() === branchFilter.toLowerCase();
    });
  }

  if (vehicleSearch) {
    filtered = filtered.filter(l => {
      const vNum = (l.vehicleNumber || '').toLowerCase();
      const profile = allVehicles.find(v => v.vehicleNumber.toLowerCase() === vNum);
      const sName = profile && profile.shortName ? profile.shortName.toLowerCase() : '';
      return vNum === vehicleSearch || sName === vehicleSearch;
    });
  }

  if (dateFilter) {
    const [yr, mo, dy] = dateFilter.split('-').map(Number);
    filtered = filtered.filter(l => {
      const d = new Date(l.startDateTime);
      return d.getFullYear() === yr && (d.getMonth() + 1) === mo && d.getDate() === dy;
    });
  }

  if (!filtered.length) {
    el.innerHTML = '<p class="text-muted small px-2">No matching fuel entries found.</p>';
    return;
  }

  el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
    <thead>
      <tr>
        <th>Vehicle</th>
        <th>Branch</th>
        <th>Fuel Type</th>
        <th>Bunk Name</th>
        <th>Bunk Location</th>
        <th>Added (L)</th>
        <th>Remaining</th>
        <th>Cost</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>${filtered.map((l) => {
      const fuelTypeDisp = l.fuelType ? (l.fuelType.charAt(0).toUpperCase() + l.fuelType.slice(1)) : 'N/A';
      const { bunkName, bunkLocation } = parseFuelDetails(l);
      let bName = l.branchName || '';
      if (!bName) {
        const vNum = (l.vehicleNumber || '').toLowerCase();
        const profile = allVehicles.find(v => v.vehicleNumber.toLowerCase() === vNum);
        bName = profile ? (profile.branchName || '') : '';
      }
      return `<tr>
        <td><strong>${escHtml(l.vehicleNumber)}</strong></td>
        <td>${escHtml(bName || '-')}</td>
        <td><span class="badge bg-secondary text-light small">${escHtml(fuelTypeDisp)}</span></td>
        <td>${escHtml(bunkName)}</td>
        <td>${escHtml(bunkLocation || '-')}</td>
        <td>${l.fuelAdded} L</td>
        <td>${l.remainingFuel} L</td>
        <td>${fmt((l.expenses || []).reduce((s, e) => s + (e.amount || 0), 0))}</td>
        <td class="small">${formatDateTime12h(l.startDateTime)}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function updateFuelVehicleSelect() {
  const select = document.getElementById('fuelVehicleSearch');
  if (!select) return;

  const currentVal = select.value;
  const branchFilter = document.getElementById('fuelBranchFilter')?.value || '';
  
  let vehicles = allVehicles.filter(v => v.status !== 'inactive');
  if (branchFilter) {
    vehicles = vehicles.filter(v => v.branchName && v.branchName.toLowerCase() === branchFilter.toLowerCase());
  }

  select.innerHTML = '<option value="">All Vehicles</option>' + vehicles.map((v) => {
    const val = v.shortName || v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');

  const hasVal = Array.from(select.options).some(opt => opt.value === currentVal);
  if (currentVal && hasVal) {
    select.value = currentVal;
  } else {
    select.value = '';
  }
}

function onFuelBranchFilterChange() {
  updateFuelVehicleSelect();
  renderFilteredFuelLogs();
}

function clearFuelFilters() {
  const branchEl = document.getElementById('fuelBranchFilter');
  if (branchEl) branchEl.value = '';
  const vehicleEl = document.getElementById('fuelVehicleSearch');
  if (vehicleEl) vehicleEl.value = '';
  const dateEl = document.getElementById('fuelDateFilter');
  if (dateEl) dateEl.value = '';

  updateFuelVehicleSelect();
  renderFilteredFuelLogs();
}

async function loadFuelHistory() {
  const el = document.getElementById('fuelHistoryList');
  if (!el) return;
  try {
    setLoading('fuelHistoryList', 'Loading fuel history...');
    await loadBranchesDropdowns();
    const logs = await api('/api/vehicle-logs');
    cachedFuelLogs = logs.filter(l => l.isFuelLog || l.fuelAdded > 0);
    cachedFuelLogs.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    updateFuelVehicleSelect();
    renderFilteredFuelLogs();
  } catch (err) {
    const alertId = document.getElementById('fuelHistoryAlert');
    if (alertId) showAlert('fuelHistoryAlert', err.message);
  }
}

function printFuelReport() {
  const el = document.getElementById('fuelHistoryList');
  if (!el || !el.innerHTML.includes('<table')) {
    alert('No fuel data to print.');
    return;
  }
  const dateInput = document.getElementById('fuelDateFilter')?.value;
  const branchInput = document.getElementById('fuelBranchFilter')?.value;
  const vehicleInput = document.getElementById('fuelVehicleSearch')?.value;
  let subtitle = '';
  if (branchInput) subtitle += `Branch: ${branchInput} | `;
  if (vehicleInput) subtitle += `Vehicle: ${vehicleInput} | `;
  if (dateInput) subtitle += `Date: ${dateInput}`;
  subtitle = subtitle.replace(/\s*\|\s*$/, '');

  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Fuel Log Report</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>body { padding: 20px; font-family: sans-serif; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 8px; font-size: 12px; } th { background-color: #f8f9fa; } .small { font-size: 0.875em; } .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h4>Fuel Log Report</h4>');
  if (subtitle) printWindow.document.write('<p class="text-muted small">' + subtitle + '</p>');
  printWindow.document.write(el.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

async function loadFuelForm() {
  await loadVehicleList();
  await fetchFuelPrices();
  resetFuelForm();

  const startEl = document.getElementById('fuelStartDateTime');
  if (startEl) {
    if (typeof flatpickr !== 'undefined') {
      if (fuelStartDateTimePicker) {
        fuelStartDateTimePicker.setDate(new Date());
      } else {
        fuelStartDateTimePicker = flatpickr(startEl, {
          enableTime: true,
          dateFormat: "d-M-Y h:i K",
          defaultDate: new Date(),
          minuteIncrement: 1,
          disableMobile: "true"
        });
      }
    } else {
      startEl.value = formatDateTime12h(new Date());
    }
  }

  onFuelTypeChange();
  loadFuelHistory();
}

async function loadFuelPricesAdmin() {
  try {
    const prices = await api('/api/fuel-prices');
    const petrolInput = document.getElementById('adminPetrolPrice');
    const dieselInput = document.getElementById('adminDieselPrice');
    if (petrolInput) petrolInput.value = prices.petrol || '';
    if (dieselInput) dieselInput.value = prices.diesel || '';
  } catch (err) {
    showAlert('fuelPricesAlert', err.message);
  }
}

async function saveFuelPricesAdmin() {
  const petrol = document.getElementById('adminPetrolPrice')?.value;
  const diesel = document.getElementById('adminDieselPrice')?.value;
  if (!petrol || !diesel) {
    showAlert('fuelPricesAlert', 'Both petrol and diesel prices are required.');
    return;
  }
  try {
    await api('/api/fuel-prices', 'POST', { petrol, diesel });
    showAlert('fuelPricesAlert', 'Fuel prices saved successfully.', 'success');
  } catch (err) {
    showAlert('fuelPricesAlert', err.message);
  }
}

// ─── BRANCHES MASTER MANAGEMENT ──────────────────────────────────────────────
async function loadBranchesDropdowns() {
  try {
    allBranches = await api('/api/branches');
    
    const scrapSelect = document.getElementById('scrapBranchSelect');
    if (scrapSelect) {
      const currentVal = scrapSelect.value;
      scrapSelect.innerHTML = '<option value="">Select Branch</option>' + allBranches.map(b => 
        `<option value="${escHtml(b._id)}">${escHtml(b.name)}</option>`
      ).join('');
      
      const container = document.getElementById('scrapBranchContainer');
      if (currentUser && currentUser.branch) {
        scrapSelect.value = currentUser.branch;
        scrapSelect.disabled = true;
        if (container) container.classList.add('d-none');
      } else {
        if (currentVal) scrapSelect.value = currentVal;
        scrapSelect.disabled = false;
        if (container) container.classList.remove('d-none');
      }
    }

    const fromSelect = document.getElementById('fromLocation');
    if (fromSelect) {
      const currentVal = fromSelect.value;
      fromSelect.innerHTML = '<option value="">Select From Location...</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) {
        fromSelect.value = currentVal;
      } else if (currentUser && currentUser.branchName) {
        fromSelect.value = currentUser.branchName;
      }
      if (currentUser && currentUser.branchName) {
        fromSelect.disabled = true;
      } else {
        fromSelect.disabled = false;
      }
    }

    const toSelect = document.getElementById('toLocation');
    if (toSelect) {
      const toList = document.getElementById('toLocationList');
      if (toList) {
        toList.innerHTML = allBranches.map(b => 
          `<option value="${escHtml(b.name)}"></option>`
        ).join('');
      }
    }

    const vpBranchSelect = document.getElementById('vehicleProfilesBranch');
    if (vpBranchSelect) {
      const currentVal = vpBranchSelect.value;
      vpBranchSelect.innerHTML = '<option value="">Select Location...</option>' + allBranches.map(b => 
        `<option value="${escHtml(b._id)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) vpBranchSelect.value = currentVal;
    }

    const newUserBranchSelect = document.getElementById('newUserBranch');
    if (newUserBranchSelect) {
      const currentVal = newUserBranchSelect.value;
      newUserBranchSelect.innerHTML = '<option value="">Select Location (Branch)...</option>' + allBranches.map(b => 
        `<option value="${escHtml(b._id)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) newUserBranchSelect.value = currentVal;
    }

    const reportBranchSelect = document.getElementById('reportBranchSelect');
    if (reportBranchSelect) {
      const currentVal = reportBranchSelect.value;
      reportBranchSelect.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) reportBranchSelect.value = currentVal;
    }

    const scrapReportBranchSelect = document.getElementById('scrapReportBranchSelect');
    if (scrapReportBranchSelect) {
      const currentVal = scrapReportBranchSelect.value;
      scrapReportBranchSelect.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) scrapReportBranchSelect.value = currentVal;
    }

    const fuelBranchSelect = document.getElementById('fuelBranchFilter');
    if (fuelBranchSelect) {
      const currentVal = fuelBranchSelect.value;
      fuelBranchSelect.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) fuelBranchSelect.value = currentVal;
    }

    const approvalBranchSelect = document.getElementById('approvalBranchFilter');
    if (approvalBranchSelect) {
      const currentVal = approvalBranchSelect.value;
      approvalBranchSelect.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) approvalBranchSelect.value = currentVal;
    }

    const expenseBranchSelect = document.getElementById('expenseBranchFilter');
    if (expenseBranchSelect) {
      const currentVal = expenseBranchSelect.value;
      expenseBranchSelect.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) expenseBranchSelect.value = currentVal;
    }
  } catch (err) {
    console.error('Error loading branches:', err);
  }
}

async function loadBranchesAdmin() {
  const tableBody = document.getElementById('branchListTableBody');
  if (!tableBody) return;
  try {
    setLoading('branchListTableBody', 'Loading branches...');
    const branches = await api('/api/branches');
    if (!branches.length) {
      tableBody.innerHTML = '<tr><td colspan="2" class="text-muted text-center">No branches defined.</td></tr>';
      return;
    }
    tableBody.innerHTML = branches.map(b => `
      <tr>
        <td><strong>${escHtml(b.name)}</strong></td>
        <td>
          <button class="btn cds-btn-sm me-1" onclick="editBranchAdmin('${b._id}', '${escHtml(b.name)}')">Edit</button>
          <button class="btn cds-btn-sm danger" onclick="deleteBranchAdmin('${b._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showAlert('branchListAlert', err.message);
  }
}

async function saveBranchAdmin() {
  const nameInput = document.getElementById('branchNameInput');
  const name = nameInput?.value?.trim();
  const editId = document.getElementById('branchEditId')?.value;

  if (!name) {
    showAlert('branchAlert', 'Branch name is required.');
    return;
  }

  try {
    if (editId) {
      await api(`/api/branches/${editId}`, 'PUT', { name });
      showAlert('branchAlert', 'Branch updated successfully.', 'success');
    } else {
      await api('/api/branches', 'POST', { name });
      showAlert('branchAlert', 'Branch added successfully.', 'success');
    }
    resetBranchFormAdmin();
    loadBranchesAdmin();
  } catch (err) {
    showAlert('branchAlert', err.message);
  }
}

function editBranchAdmin(id, name) {
  const editIdEl = document.getElementById('branchEditId');
  const nameInput = document.getElementById('branchNameInput');
  const setupTitle = document.getElementById('branchSetupTitle');
  const saveBtn = document.getElementById('btnSaveBranch');

  if (editIdEl) editIdEl.value = id;
  if (nameInput) nameInput.value = name;
  if (setupTitle) setupTitle.textContent = 'Edit Branch';
  if (saveBtn) saveBtn.textContent = 'Update Branch';
}

function deleteBranchAdmin(id) {
  if (!confirm('Are you sure you want to delete this branch?')) return;
  api(`/api/branches/${id}`, 'DELETE')
    .then(() => {
      showAlert('branchListAlert', 'Branch deleted successfully.', 'success');
      loadBranchesAdmin();
    })
    .catch(err => {
      showAlert('branchListAlert', err.message);
    });
}

function resetBranchFormAdmin() {
  const editIdEl = document.getElementById('branchEditId');
  const nameInput = document.getElementById('branchNameInput');
  const setupTitle = document.getElementById('branchSetupTitle');
  const saveBtn = document.getElementById('btnSaveBranch');
  const alertEl = document.getElementById('branchAlert');

  if (editIdEl) editIdEl.value = '';
  if (nameInput) nameInput.value = '';
  if (setupTitle) setupTitle.textContent = 'Setup Branch';
  if (saveBtn) saveBtn.textContent = 'Save Branch';
  if (alertEl) alertEl.innerHTML = '';
}

async function initScrapEntryForm() {
  await loadScrapProductDropdown();
  await loadScrapMyEntries();
  await loadBranchesDropdowns();

  const scrapDateEl = document.getElementById('scrapDateTime');
  if (scrapDateEl) {
    if (typeof flatpickr !== 'undefined') {
      if (scrapDateTimePicker) {
        scrapDateTimePicker.setDate(new Date());
      } else {
        scrapDateTimePicker = flatpickr(scrapDateEl, {
          enableTime: true,
          dateFormat: "d-M-Y h:i K",
          defaultDate: new Date(),
          minuteIncrement: 1,
          disableMobile: "true"
        });
      }
    } else {
      scrapDateEl.value = formatDateTime12h(new Date());
    }
  }
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
// ─── Page Init ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path === '/admin' || path === '/admin.html' || path === '/manager' || path === '/manager.html') initAdmin();
<<<<<<< HEAD
  else if (path === '/security' || path === '/security.html') initSecurity();
});


//<div class="small">Used: ${(l.fuelUsed || 0).toFixed(2)} L</div> line no 969
=======
  else if (path === '/incharge' || path === '/incharge.html') initIncharge();
  else if (path === '/security' || path === '/security.html') initSecurity();
  // Login page has no init needed
});
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
