// ─── Utilities ───────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function showCenteredSuccess(message) {
  const overlay = document.createElement('div');
  overlay.id = 'centeredSuccessOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(15, 25, 35, 0.4)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.backdropFilter = 'blur(4px)';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.2s ease-out';
  
  const card = document.createElement('div');
  card.style.background = '#ffffff';
  card.style.padding = '30px 40px';
  card.style.borderRadius = '16px';
  card.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
  card.style.textAlign = 'center';
  card.style.maxWidth = '360px';
  card.style.width = '90%';
  card.style.transform = 'scale(0.85)';
  card.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
  
  card.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
    <h5 style="margin-bottom: 6px; font-weight: 700; color: #1a2233; font-family: 'DM Sans', sans-serif;">Success!</h5>
    <p style="color: #6b7a99; margin-bottom: 0; font-size: 13.5px; line-height: 1.5; font-family: 'DM Sans', sans-serif;">${escHtml(message)}</p>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'scale(1)';
  }, 50);
  
  setTimeout(() => {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.85)';
    setTimeout(() => {
      overlay.remove();
    }, 200);
  }, 2300);
}

function showCenteredError(message) {
  const overlay = document.createElement('div');
  overlay.id = 'centeredErrorOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(15, 25, 35, 0.4)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.backdropFilter = 'blur(4px)';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.2s ease-out';
  
  const card = document.createElement('div');
  card.style.background = '#ffffff';
  card.style.padding = '30px 40px';
  card.style.borderRadius = '16px';
  card.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
  card.style.textAlign = 'center';
  card.style.maxWidth = '360px';
  card.style.width = '90%';
  card.style.transform = 'scale(0.85)';
  card.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
  
  card.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 12px;">❌</div>
    <h5 style="margin-bottom: 6px; font-weight: 700; color: #dc3545; font-family: 'DM Sans', sans-serif;">Error!</h5>
    <p style="color: #6b7a99; margin-bottom: 20px; font-size: 13.5px; line-height: 1.5; font-family: 'DM Sans', sans-serif;">${escHtml(message)}</p>
    <button id="closeCenteredErrorBtn" class="btn btn-danger w-100" style="padding: 10px; border-radius: 8px; font-weight: 600; font-family: 'DM Sans', sans-serif; background-color: #dc3545; border-color: #dc3545;">OK</button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  const dismiss = () => {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.85)';
    setTimeout(() => {
      overlay.remove();
    }, 200);
  };
  
  setTimeout(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'scale(1)';
  }, 50);
  
  const closeBtn = card.querySelector('#closeCenteredErrorBtn');
  closeBtn.addEventListener('click', dismiss);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      dismiss();
    }
  });
  
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      dismiss();
    }
  }, 5000);
}

function statusBadge(status) {
  const map = {
    pending: 'badge-pending',
    pending_pettycashier: 'badge-pending',
    pending_manager: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    queried: 'badge-penalty',
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
  
  const btn = document.querySelector('.cds-btn-primary');
  const originalHtml = btn ? btn.innerHTML : 'Sign In';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing In...`;
  }
  
  try {
    const data = await api('/api/login', 'POST', { username, password });
    if (data.role === 'security') window.location.href = '/security';
    else if (data.role === 'manager') window.location.href = '/manager';
    else if (data.role === 'admin') window.location.href = '/admin';
    else if (data.role === 'pettycashier') window.location.href = '/petty';
    else window.location.href = '/';
  } catch (err) {
    showAlert('loginAlert', err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
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
  // Manager should not see users (admin-only)
  ['users'].forEach((section) => setNavVisibility(section, false));
  ['vehicleApprovals', 'vehicleReports', 'vehicleExpenses', 'vehicleFuel'].forEach((section) => setNavVisibility(section, true));
  setNavVisibility('vehicleEntry', false);

  // Set manager labels and column widths for list-only layouts
  const fuelNav = document.getElementById('nav-vehicleFuel');
  if (fuelNav) fuelNav.textContent = 'Fuel Logs';
  const expenseNav = document.getElementById('nav-vehicleExpenses');
  if (expenseNav) expenseNav.textContent = 'Expenses';

  const fuelCol = document.getElementById('fuelHistoryCardCol');
  if (fuelCol) fuelCol.className = 'col-12';
  const expenseCol = document.getElementById('expenseLogCardCol');
  if (expenseCol) expenseCol.className = 'col-12';
}

function setupSecurityMenu() {
  ['users', 'vehicleApprovals', 'vehicleReports'].forEach((section) => setNavVisibility(section, false));
  ['vehicleEntry', 'vehicleHistory', 'vehicleExpenses', 'vehicleFuel'].forEach((section) => setNavVisibility(section, true));
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
    users: 'Admin - User Management',
    vehicleProfiles: 'Vehicle Log - Profile Setup',
    vehicleEntry: 'Vehicle Log - New Entry',
    vehicleFuel: 'Vehicle Log - Add Fuel',
    vehicleExpenses: 'Vehicle Log - Expenses',
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
  }
  else if (name === 'scrapHistory') loadScrapMyHistory();
  else if (name === 'scrapApprovals') loadScrapApprovals();
  else if (name === 'scrapReports') loadScrapReports();
}

async function initAdmin() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (me.role === 'pettycashier') { window.location.href = '/petty'; return; }
    if (!['admin', 'manager'].includes(me.role)) { window.location.href = '/'; return; }
    currentUserRole = me.role;
    currentUser = me;
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
    if (me.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach((el) => el.classList.add('d-none'));
      setupManagerMenu();
    }
  } catch {
    window.location.href = '/';
    return;
  }
  if (currentUserRole === 'manager') {
    showSection('vehicleApprovals');
  } else {
    showSection('vehicleEntry');
  }
}

async function initPettyCashier() {
  setTodayDate();
  try {
    const me = await api('/api/me');
    if (me.role !== 'pettycashier') { window.location.href = '/'; return; }
    currentUserRole = me.role;
    currentUser = me;
    const u = document.getElementById('sidebarUsername');
    const a = document.getElementById('sidebarAvatar');
    if (u) u.textContent = me.username;
    if (a) a.textContent = me.username[0].toUpperCase();
  } catch {
    window.location.href = '/';
    return;
  }
  showSection('scrapEntry');
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

    // Check if scrap module is enabled for security
    try {
      const setting = await api('/api/system-settings/enableSecurityScrapEntry');
      const scrapSidebar = document.getElementById('scrapModuleSidebar');
      if (setting && setting.value === true) {
        if (scrapSidebar) scrapSidebar.classList.remove('d-none');
      } else {
        if (scrapSidebar) scrapSidebar.classList.add('d-none');
      }
    } catch (err) {
      console.error('Failed to load system setting:', err);
    }
  } catch {
    window.location.href = '/';
    return;
  }
  showSection('vehicleEntry');
}

// Users
// Users
async function loadUsers() {
  try {
    setLoading('userList', 'Loading users...');
    const users = await api('/api/users');
    const el = document.getElementById('userList');
    if (!users.length) { el.innerHTML = '<p class="text-muted small px-2">No users found.</p>'; return; }
    el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
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
      </tbody>
    </table></div>`;
  } catch (e) { console.error(e); }
}

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
    loadUsers();
  } catch (err) {
    showAlert('userAlert', err.message);
  }
}

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

async function deleteUser(id, name) {
  try {
    await api(`/api/users/${id}`, 'DELETE');
    loadUsers();
  } catch (err) {
    showAlert('userAlert', err.message);
  }
}


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
let cachedExpenses = [];

async function loadVehicleList() {
  try {
    allVehicles = await api('/api/vehicles');
    let activeVehicles = allVehicles.filter((v) => v.status === 'active');
    if (currentUser && currentUser.role === 'security' && currentUser.branchName) {
      activeVehicles = activeVehicles.filter(v => 
        v.branchName && v.branchName.trim().toLowerCase() === currentUser.branchName.trim().toLowerCase()
      );
    }

    const inputs = document.querySelectorAll('.vehicle-select-shortname');
    inputs.forEach((input) => {
      if (input.tagName === 'SELECT') {
        const placeholder = input.querySelector('option[value=""]') ? input.querySelector('option[value=""]').outerHTML : '<option value="">Select Vehicle...</option>';
        input.innerHTML = placeholder + activeVehicles.map((v) => {
          const val = v.shortName || v.vehicleNumber;
          const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
          return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
        }).join('');
        return;
      }

      const listId = input.getAttribute('list');
      if (!listId) return;
      const datalist = document.getElementById(listId);
      if (!datalist) return;

      datalist.innerHTML = activeVehicles.map((v) => {
        const val = v.shortName || v.vehicleNumber;
        const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` + (v.vehicleName ? ` (${v.vehicleName})` : '') : v.vehicleNumber + (v.vehicleName ? ` (${v.vehicleName})` : '');
        return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
      }).join('');
    });
  } catch (err) {
    showAlert('vehicleAlert', err.message);
  }
}

function updateVehicleDetailsDisplay(vehicleNumber, tankCapacity, expectedMileage) {
  const displayEl = document.getElementById('vehicleDetailsDisplay');
  if (!displayEl) return;

  if (!vehicleNumber) {
    displayEl.classList.add('d-none');
    return;
  }

  displayEl.classList.remove('d-none');

  const numEl = document.getElementById('vehicleNumberDisplay');
  if (numEl) {
    numEl.textContent = vehicleNumber;
  }

  const capEl = document.getElementById('tankCapacityDisplay');
  if (capEl) {
    capEl.textContent = tankCapacity ? `${tankCapacity} L` : '0 L';
  }

  const milEl = document.getElementById('expectedMileageDisplay');
  if (milEl) {
    milEl.textContent = expectedMileage && expectedMileage !== '—' ? `${expectedMileage} km/L` : '—';
  }
}

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

async function applyVehicleBaseline() {
  const vehicleNumber = document.getElementById('vehicleNumber')?.value?.trim().toUpperCase();
  const vehicleInput = document.getElementById('vehicleNumber');
  if (vehicleInput && vehicleNumber) vehicleInput.value = vehicleNumber;
  if (!vehicleNumber) return;
  try {
    const baseline = await api(`/api/vehicle-logs/baseline?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
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
  } catch (err) {
    showCenteredError(err.message);
  }
}

function calcVehicleDistance() {
  const startKm = Number(document.getElementById('startKm')?.value || 0);
  const endKm = Number(document.getElementById('endKm')?.value || 0);
  const distance = Math.max(0, endKm - startKm);
  const el = document.getElementById('distanceTravelled');
  if (el) el.value = distance.toFixed(2);

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
    const priceI = document.getElementById('fuelPriceInLog');
    if (priceI) priceI.value = '0.00';
    const locN = document.getElementById('fuelLocationInLog');
    if (locN) locN.value = '';
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
    }
  }
}

async function submitVehicleLog() {
  if (fuelInLogActive) {
    const fuelAdded = Number(document.getElementById('fuelAddedLitersInLog')?.value || 0);
    const pricePerLitre = Number(document.getElementById('fuelPricePerLitreInLog')?.value || 0);
    const bunk = document.getElementById('fuelBunkNameInLog')?.value?.trim();
    if (fuelAdded <= 0 || pricePerLitre <= 0 || !bunk) {
      showCenteredError('Please fill all fuel fields with positive values.');
      return;
    }
  }

  if (expenseInLogActive) {
    const amount = Number(document.getElementById('expenseAmountInLog')?.value || 0);
    const desc = document.getElementById('expenseDescInLog')?.value?.trim();
    if (amount <= 0 || !desc) {
      showCenteredError('Please enter a positive amount and description for the emergency expense.');
      return;
    }
  }

  const payload = collectVehicleFormPayload();
  if (!payload.driverName || !payload.vehicleNumber || !payload.fromLocation || !payload.toLocation || !payload.startDateTime || !payload.endDateTime) {
    showCenteredError('Please fill all required fields.');
    return;
  }
  try {
    await api('/api/vehicle-logs', 'POST', payload);
    showCenteredSuccess('Vehicle log submitted successfully.');
    
    currentVehicleDraftId = null;

    resetVehicleForm();
    
    await applyVehicleBaseline();
    loadVehicleHistory();
    loadVehicleWaitingList();
  } catch (err) {
    showCenteredError(err.message);
  }
}

function collectVehicleFormPayload() {
  const driverName = document.getElementById('driverName')?.value?.trim() || (fuelInLogActive ? 'Fuel Log' : '');
  const vehicleNumber = document.getElementById('vehicleNumber')?.value?.trim().toUpperCase();
  const fromLocation = document.getElementById('fromLocation')?.value?.trim();
  let toLocation = document.getElementById('toLocation')?.value?.trim();
  if (toLocation === 'other') {
    toLocation = document.getElementById('toLocationCustom')?.value?.trim() || '';
  }
  if (!toLocation && fuelInLogActive) {
    toLocation = fromLocation;
  }
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
    const bunk = document.getElementById('fuelBunkNameInLog')?.value?.trim() || '';
    const location = document.getElementById('fuelLocationInLog')?.value?.trim() || '';
    const price = fuelAdded * pricePerLitre;

    expenses.push({
      expenseType: 'oil',
      amount: price,
      date: new Date(),
      description: `FUEL_ADDITION:qty=${fuelAdded};current=${(Number(document.getElementById('tankCapacity')?.value || 0) - fuelAdded).toFixed(2)};bunk=${bunk};location=${location}`
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

  const toCustomEl = document.getElementById('toLocationCustom');
  if (toCustomEl) {
    toCustomEl.value = '';
    toCustomEl.classList.add('d-none');
  }

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
    const priceI = document.getElementById('fuelPriceInLog');
    if (priceI) priceI.value = '0.00';
    const locN = document.getElementById('fuelLocationInLog');
    if (locN) locN.value = '';
    const displayE = document.getElementById('fuelMileageDisplayInLog');
    if (displayE) displayE.innerHTML = '';
  }

  expenseInLogActive = true;
  toggleExpenseInLog();
  updateVehicleDetailsDisplay('', 0, 0);
}

async function saveVehicleWaitingDraft() {
  const payload = collectVehicleFormPayload();
  if (!payload.vehicleNumber) {
    showCenteredError('Vehicle number is required to save waiting entry.');
    return;
  }
  try {
    const res = await api('/api/vehicle-logs/waiting', 'POST', { ...payload, draftId: currentVehicleDraftId });
    currentVehicleDraftId = res?.draft?._id || null;
    showCenteredSuccess('Saved to waiting list.');
    loadVehicleWaitingList();
  } catch (err) {
    showCenteredError(err.message);
  }
}

async function loadVehicleWaitingList() {
  const el = document.getElementById('vehicleWaitingList');
  if (!el) return;
  try {
    setLoading('vehicleWaitingList', 'Loading waiting list...');
    let drafts = await api('/api/vehicle-logs/waiting');
    if (currentUser && currentUser.branchName) {
      drafts = drafts.filter(d => 
        d.branchName && d.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
      );
    }
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


    const v = allVehicles.find((x) => x.vehicleNumber === d.vehicleNumber);
    if (v && document.getElementById('vehicleShortName')) {
      document.getElementById('vehicleShortName').value = v.shortName || v.vehicleNumber;
    }
    await applyVehicleBaseline();

    document.getElementById('fromLocation').value = d.fromLocation || '';
    const targetToLocation = d.toLocation || '';
    const toSelect = document.getElementById('toLocation');
    const toCustom = document.getElementById('toLocationCustom');
    if (toSelect) {
      const isKnownBranch = allBranches.some(b => b.name.toLowerCase() === targetToLocation.toLowerCase());
      if (isKnownBranch) {
        toSelect.value = targetToLocation;
        if (toCustom) {
          toCustom.classList.add('d-none');
          toCustom.value = '';
        }
      } else if (targetToLocation) {
        toSelect.value = 'other';
        if (toCustom) {
          toCustom.classList.remove('d-none');
          toCustom.value = targetToLocation;
        }
      } else {
        toSelect.value = '';
        if (toCustom) {
          toCustom.classList.add('d-none');
          toCustom.value = '';
        }
      }
    }
    document.getElementById('startDateTime').value = d.startDateTime ? formatDateTime12h(d.startDateTime) : formatDateTime12h(new Date());
    const targetEndDate = d.endDateTime ? new Date(d.endDateTime) : new Date();
    if (endDateTimePicker) {
      endDateTimePicker.setDate(targetEndDate);
    } else {
      document.getElementById('endDateTime').value = formatDateTime12h(targetEndDate);
    }
    document.getElementById('endKm').value = d.endKm ?? '';

    currentFuelAdditions = [];
    fuelInLogActive = false;
    const fuelSection = document.getElementById('fuelSectionInLog');
    if (fuelSection) {
      fuelSection.classList.add('d-none');
    }

    if (Array.isArray(d.expenses)) {
      d.expenses.forEach(exp => {
        if (exp.expenseType === 'oil' && exp.description) {
          const match = exp.description.match(/^FUEL_ADDITION:qty=([\d.]+);current=([\d.]+);bunk=([^;]+)(?:;location=(.*))?$/);
          if (match) {
            currentFuelAdditions.push({
              added: Number(match[1]),
              current: Number(match[2]),
              bunk: match[3],
              location: match[4] || '',
              price: Number(exp.amount)
            });

            // Populate the single fuel addition inputs in the form
            fuelInLogActive = true;
            if (fuelSection) {
              fuelSection.classList.remove('d-none');
            }
            const addedEl = document.getElementById('fuelAddedLitersInLog');
            if (addedEl) addedEl.value = match[1];
            const priceEl = document.getElementById('fuelPricePerLitreInLog');
            if (priceEl) priceEl.value = d.pricePerLitre || (Number(exp.amount) / Number(match[1])).toFixed(2);
            const bunkEl = document.getElementById('fuelBunkNameInLog');
            if (bunkEl) bunkEl.value = match[3];
            const locEl = document.getElementById('fuelLocationInLog');
            if (locEl) locEl.value = match[4] || '';
            const typeEl = document.getElementById('fuelTypeSelectInLog');
            if (typeEl) typeEl.value = d.fuelType || 'petrol';
          }
        }
      });
    }
    renderFuelAdditions();

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
    showCenteredSuccess('Waiting entry loaded. Update and save or send for approval.');
  } catch (err) {
    showCenteredError(err.message);
  }
}

async function deleteVehicleWaitingDraft(id) {
  try {
    await api(`/api/vehicle-logs/waiting/${id}`, 'DELETE');
    if (currentVehicleDraftId === id) currentVehicleDraftId = null;
    showCenteredSuccess('Waiting entry deleted.');
    loadVehicleWaitingList();
  } catch (err) {
    showCenteredError(err.message);
  }
}

async function submitVehicleWaitingDraft(id) {
  try {
    await api(`/api/vehicle-logs/waiting/${id}/submit`, 'POST');
    if (currentVehicleDraftId === id) currentVehicleDraftId = null;
    showCenteredSuccess('Waiting entry submitted for manager approval.');
    loadVehicleWaitingList();
    loadVehicleHistory();
  } catch (err) {
    showCenteredError(err.message);
  }
}

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
  }
}

async function loadVehicleEntryForm() {
  setLoading('vehicleHistoryList', 'Loading vehicle history...');
  setLoading('vehicleHistoryListCompact', 'Loading vehicle history...');
  await loadVehicleList();
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
          disableMobile: true
        });
      }
    } else {
      endEl.value = formatDateTime12h(new Date());
    }
  }

  loadVehicleWaitingList();
}

function vehicleStatusBadge(status) {
  let cls = 'badge-pending';
  if (status === 'approved') cls = 'badge-approved';
  else if (status === 'rejected') cls = 'badge-rejected';
  else if (status === 'queried') cls = 'badge-rejected';
  else if (status === 'answered') cls = 'badge-converted';
  return `<span class="cds-badge ${cls}">${status.toUpperCase()}</span>`;
}

function renderVehicleLogsTable(logs, includeActions = false) {
  const getReason = (id) => vehicleRejectDrafts.get(id) || '';
  return `<div class="table-responsive"><table class="table cds-table">
    <thead><tr><th>Vehicle</th><th>Driver</th><th>Route</th><th>KM</th><th>Fuel</th><th>Expenses</th><th>Status</th><th>Manager Approved</th>${includeActions ? '<th>Actions</th>' : ''}</tr></thead>
    <tbody>${logs.map((l) => {
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

    let bunkDetails = '';
    if (isFuel && l.description) {
      const match = l.description.match(/^FUEL_ADDITION:qty=([\d.]+);current=([\d.]+);bunk=([^;]+)(?:;location=(.*))?$/);
      if (match) {
        const bunkName = match[3] || 'N/A';
        const bunkLoc = match[4] || l.fromLocation || 'N/A';
        bunkDetails = `<div class="small text-muted mt-1" style="font-size: 11px; border-top: 1px dashed #e5e8ef; padding-top: 3px;">Bunk: <strong>${escHtml(bunkName)}</strong> (${escHtml(bunkLoc)})</div>`;
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
             <div class="small text-muted">Std Mileage: ${stdMileage} ${stdMileage !== '—' ? 'km/L' : ''}</div>
             ${bunkDetails}`
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
          ${isFuel ? `
            <button class="btn cds-btn-approve me-1" onclick="reviewVehicleLog('${l._id}', 'approve')">OK</button>
            <button class="btn btn-warning btn-sm" onclick="toggleVehicleRejectForm('${l._id}')">Raise Query</button>
          ` : `
            <button class="btn cds-btn-approve me-1" onclick="reviewVehicleLog('${l._id}', 'approve')">Approve</button>
            <button class="btn cds-btn-reject" onclick="toggleVehicleRejectForm('${l._id}')">Reject</button>
          `}
        ` : (isFuel ? `
          ${l.status === 'approved' ? `
            <button class="btn btn-success btn-sm me-1" onclick="reviewVehicleLog('${l._id}', 'approve')">OK</button>
            <button class="btn btn-warning btn-sm" onclick="toggleVehicleRejectForm('${l._id}')">Raise Query</button>
          ` : (l.status === 'queried' ? `
            <button class="btn btn-success btn-sm me-1" onclick="resolveVehicleQuery('${l._id}')">OK</button>
            <div class="small text-muted mt-1">Awaiting Answer</div>
          ` : (l.status === 'answered' ? `
            <button class="btn btn-success btn-sm me-1" onclick="resolveVehicleQuery('${l._id}')">OK</button>
            <button class="btn btn-warning btn-sm" onclick="toggleVehicleRejectForm('${l._id}')">Raise Query</button>
          ` : '—'))}
        ` : '—')}
      </td>` : ''}
    </tr>
    ${includeActions ? `
      <tr>
        <td colspan="9" class="p-0">
          <div class="inline-slide ${rejectOpen ? 'open' : ''}">
            <div class="p-3 border-top bg-white">
              <div class="row g-2 align-items-end">
                <div class="col-md-9">
                  <label class="form-label small mb-1">${isFuel ? 'Query Question (Question to Security)' : 'Reject Reason'}</label>
                  <input type="text" class="form-control cds-input" value="${escHtml(getReason(l._id))}"
                    oninput="updateVehicleRejectDraft('${l._id}', this.value)" placeholder="${isFuel ? 'Enter question for security (required)' : 'Enter reason (required)'}" />
                </div>
                <div class="col-md-3 d-grid">
                  <button class="btn cds-btn-reject" onclick="submitVehicleReject('${l._id}')">${isFuel ? 'Submit Query' : 'Submit Rejection'}</button>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
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
}

async function loadVehicleHistory() {
  try {
    setLoading('vehicleHistoryList', 'Loading vehicle history...');
    setLoading('vehicleHistoryListCompact', 'Loading vehicle history...');
    let logs = await api('/api/vehicle-logs');
    if (currentUser && currentUser.branchName) {
      logs = logs.filter(l => 
        l.branchName && l.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
      );
    }
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

let currentReviewedLogs = [];

function renderFilteredReviewedLogs() {
  const vehicleVal = document.getElementById('approvalVehicleSelect')?.value || '';
  const fromDateVal = document.getElementById('approvalFromDateFilter')?.value || '';
  const toDateVal = document.getElementById('approvalToDateFilter')?.value || '';
  const branchVal = document.getElementById('approvalBranchFilter')?.value || '';
  const el = document.getElementById('vehicleReviewedList');
  if (!el) return;

  let logsToRender = currentReviewedLogs;

  // Filter by branch
  if (branchVal) {
    logsToRender = logsToRender.filter(l => 
      l.branchName && l.branchName.trim().toLowerCase() === branchVal.trim().toLowerCase()
    );
  } else if (currentUser && currentUser.branchName && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    logsToRender = logsToRender.filter(l => 
      l.branchName && l.branchName.toLowerCase() === currentUser.branchName.toLowerCase()
    );
  }

  // 1. Vehicle Filter (Dropdown selection match)
  if (vehicleVal) {
    logsToRender = logsToRender.filter(l => l.vehicleNumber === vehicleVal);
  }

  // 2. Date Filter (From and To date range)
  if (fromDateVal) {
    const fromDate = new Date(fromDateVal);
    fromDate.setHours(0,0,0,0);
    logsToRender = logsToRender.filter(l => new Date(l.startDateTime) >= fromDate);
  }
  if (toDateVal) {
    const toDate = new Date(toDateVal);
    toDate.setHours(23,59,59,999);
    logsToRender = logsToRender.filter(l => new Date(l.startDateTime) <= toDate);
  }

  el.innerHTML = logsToRender.length
    ? renderVehicleLogsTable(logsToRender, true)
    : '<p class="text-muted small px-2">No reviewed logs found matching the filters.</p>';
}

function updateApprovalVehicleSelectOptions() {
  const branchFilter = document.getElementById('approvalBranchFilter');
  const selectEl = document.getElementById('approvalVehicleSelect');
  if (!selectEl) return;

  const selectedBranch = branchFilter ? branchFilter.value : '';
  const currentVal = selectEl.value;

  let vehiclesForSelect = allVehicles.filter(v => v.status === 'active');
  if (selectedBranch) {
    vehiclesForSelect = vehiclesForSelect.filter(v => 
      v.branchName && v.branchName.trim().toLowerCase() === selectedBranch.trim().toLowerCase()
    );
  }

  selectEl.innerHTML = '<option value="">All Vehicles</option>' + vehiclesForSelect.map(v => {
    const val = v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` : v.vehicleNumber;
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');

  if (currentVal && vehiclesForSelect.some(v => v.vehicleNumber === currentVal)) {
    selectEl.value = currentVal;
  } else {
    selectEl.value = '';
  }
}

function filterApprovalLogs() {
  updateApprovalVehicleSelectOptions();
  renderFilteredReviewedLogs();
}

function clearApprovalFilters() {
  const vSelect = document.getElementById('approvalVehicleSelect');
  if (vSelect) vSelect.value = '';
  const fromFilter = document.getElementById('approvalFromDateFilter');
  if (fromFilter) fromFilter.value = '';
  const toFilter = document.getElementById('approvalToDateFilter');
  if (toFilter) toFilter.value = '';
  const branchFilter = document.getElementById('approvalBranchFilter');
  if (branchFilter) branchFilter.value = '';

  updateApprovalVehicleSelectOptions();
  renderFilteredReviewedLogs();
}

async function loadVehicleApprovals() {
  try {
    setLoading('vehicleReviewedList', 'Loading reviewed vehicle logs...');
    await loadVehicleList(); // Refresh datalists

    if (allBranches.length === 0) {
      allBranches = await api('/api/branches');
    }

    const branchFilter = document.getElementById('approvalBranchFilter');
    if (branchFilter && branchFilter.options.length <= 1) {
      const currentVal = branchFilter.value;
      branchFilter.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      branchFilter.value = currentVal || '';
    }

    const reviewed = await api('/api/vehicle-logs');
    currentReviewedLogs = reviewed;

    // Sort ascending date-wise (ascending order: 1, 2, 3, 4)
    currentReviewedLogs.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    updateApprovalVehicleSelectOptions();
    renderFilteredReviewedLogs();
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

async function reviewVehicleLog(id, action) {
  const payload = { action };
  try {
    await api(`/api/vehicle-logs/${id}/review`, 'POST', payload);
    loadVehicleApprovals();
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
  } catch (err) {
    showAlert('vehicleApprovalAlert', err.message);
  }
}

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

function updateReportVehicleSelectOptions() {
  const branchSelect = document.getElementById('reportBranchSelect');
  const selectEl = document.getElementById('reportVehicleSelect');
  if (!selectEl) return;

  const selectedBranch = branchSelect ? branchSelect.value : '';
  const currentVal = selectEl.value;

  let vehiclesForSelect = allVehicles.filter(v => v.status === 'active');
  if (selectedBranch) {
    vehiclesForSelect = vehiclesForSelect.filter(v => 
      v.branchName && v.branchName.trim().toLowerCase() === selectedBranch.trim().toLowerCase()
    );
  }

  selectEl.innerHTML = '<option value="">All Vehicles</option>' + vehiclesForSelect.map(v => {
    const val = v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` : v.vehicleNumber;
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');

  if (currentVal && vehiclesForSelect.some(v => v.vehicleNumber === currentVal)) {
    selectEl.value = currentVal;
  } else {
    selectEl.value = '';
  }
}

function updateReportBunkSelectOptions() {
  const bunkSelect = document.getElementById('reportBunkSelect');
  if (!bunkSelect) return;
  const currentVal = bunkSelect.value;
  
  const bunks = new Set();
  currentReportLogs.forEach(l => {
    if (l.description) {
      const match = l.description.match(/^FUEL_ADDITION:qty=([\d.]+);current=([\d.]+);bunk=([^;]+)(?:;location=(.*))?$/);
      if (match && match[3]) {
        const bName = match[3].trim();
        if (bName && bName !== 'N/A') bunks.add(bName);
      }
    }
  });

  const sortedBunks = Array.from(bunks).sort();
  bunkSelect.innerHTML = '<option value="">All Bunks</option>' + sortedBunks.map(b => 
    `<option value="${escHtml(b)}">${escHtml(b)}</option>`
  ).join('');

  if (currentVal && sortedBunks.includes(currentVal)) {
    bunkSelect.value = currentVal;
  } else {
    bunkSelect.value = '';
  }
}

function renderFilteredVehicleReports() {
  updateReportVehicleSelectOptions();
  updateReportBunkSelectOptions();
  const vehicleVal = document.getElementById('reportVehicleSelect')?.value || '';
  const fromDateVal = document.getElementById('reportFromDateFilter')?.value || '';
  const toDateVal = document.getElementById('reportToDateFilter')?.value || '';
  const branchVal = document.getElementById('reportBranchSelect')?.value || '';
  const bunkVal = document.getElementById('reportBunkSelect')?.value || '';
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

  if (vehicleVal) {
    logsToRender = logsToRender.filter(l => l.vehicleNumber === vehicleVal);
  }

  if (bunkVal) {
    logsToRender = logsToRender.filter(l => {
      if (!l.description) return false;
      const match = l.description.match(/^FUEL_ADDITION:qty=([\d.]+);current=([\d.]+);bunk=([^;]+)(?:;location=(.*))?$/);
      return match && match[3] && match[3].trim().toLowerCase() === bunkVal.toLowerCase();
    });
  }

  if (fromDateVal) {
    const fromDate = new Date(fromDateVal);
    fromDate.setHours(0, 0, 0, 0);
    logsToRender = logsToRender.filter(l => new Date(l.startDateTime) >= fromDate);
  }
  if (toDateVal) {
    const toDate = new Date(toDateVal);
    toDate.setHours(23, 59, 59, 999);
    logsToRender = logsToRender.filter(l => new Date(l.startDateTime) <= toDate);
  }

  logsToRender.sort((a, b) => new Date(a.startDateTime || a.createdAt || 0) - new Date(b.startDateTime || b.createdAt || 0));

  el.innerHTML = logsToRender.length
    ? renderVehicleLogsTable(logsToRender, false)
    : '<p class="text-muted small px-2">No approved logs found matching the filters.</p>';
}

function clearReportFilters() {
  const vSelect = document.getElementById('reportVehicleSelect');
  if (vSelect) vSelect.value = '';
  const fDate = document.getElementById('reportFromDateFilter');
  if (fDate) fDate.value = '';
  const tDate = document.getElementById('reportToDateFilter');
  if (tDate) tDate.value = '';
  const bFilter = document.getElementById('reportBranchSelect');
  if (bFilter) bFilter.value = '';
  const bkSelect = document.getElementById('reportBunkSelect');
  if (bkSelect) bkSelect.value = '';
  updateReportVehicleSelectOptions();
  updateReportBunkSelectOptions();
  renderFilteredVehicleReports();
}

async function loadVehicleReports() {
  try {
    setLoading('vehicleReportList', 'Loading vehicle reports...');
    await loadBranchesDropdowns();
    await loadVehicleList();

    const logs = await api('/api/vehicle-logs?status=approved');
    currentReportLogs = logs;

    renderFilteredVehicleReports();
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
  const fromDate = document.getElementById('reportFromDateFilter')?.value;
  const toDate = document.getElementById('reportToDateFilter')?.value;
  let title = 'Vehicle Report';
  if (fromDate && toDate) {
    title = `Vehicle Report (${fmtDate(fromDate)} to ${fmtDate(toDate)})`;
  } else if (fromDate) {
    title = `Vehicle Report (From ${fmtDate(fromDate)})`;
  } else if (toDate) {
    title = `Vehicle Report (Until ${fmtDate(toDate)})`;
  }
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>@page { size: landscape; } body { padding: 20px; font-family: sans-serif; } .cds-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; } .badge-approved { background: #d1fae5; color: #065f46; } .badge-rejected { background: #fee2e2; color: #991b1b; } .badge-pending { background: #fef3c7; color: #92400e; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 8px; font-size: 12px; } th { background-color: #f8f9fa; } .small { font-size: 0.875em; } .text-muted { color: #6c757d; } .text-danger { color: #dc3545; } .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; } .bg-warning { background-color: #ffc107; color: #000; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h4>' + title + '</h4>');
  printWindow.document.write(el.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

function printFuelLogs() {
  const el = document.getElementById('fuelHistoryList');
  if (!el || !el.innerHTML.includes('<table')) {
    const alertId = document.getElementById('fuelHistoryAlert');
    if (alertId) showAlert('fuelHistoryAlert', 'No fuel logs to print.');
    else alert('No fuel logs to print.');
    return;
  }
  const title = 'Fuel Log Report';
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>@page { size: landscape; } body { padding: 20px; font-family: sans-serif; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 8px; font-size: 12px; } th { background-color: #f8f9fa; } .small { font-size: 0.875em; } .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; } .bg-warning { background-color: #ffc107; color: #000; } .bg-info { background-color: #0dcaf0; color: #000; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h4>' + title + '</h4>');
  printWindow.document.write(el.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

function printExpenseLogs() {
  const el = document.getElementById('vehicleExpensesListWrap');
  if (!el || !el.innerHTML.includes('<table')) {
    alert('No expense logs to print.');
    return;
  }
  const title = 'Expense Log Report';
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>@page { size: landscape; } body { padding: 20px; font-family: sans-serif; } .cds-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; } .badge-approved { background: #d1fae5; color: #065f46; } .badge-rejected { background: #fee2e2; color: #991b1b; } .badge-pending { background: #fef3c7; color: #92400e; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #dee2e6; padding: 8px; font-size: 12px; } th { background-color: #f8f9fa; } .small { font-size: 0.875em; } .text-muted { color: #6c757d; } .text-danger { color: #dc3545; } .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h4>' + title + '</h4>');
  printWindow.document.write(el.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

function printScrapSlip() {
  const companyName = document.getElementById('scrapCompany')?.value?.trim();
  const vehicleNumber = document.getElementById('scrapVehicle')?.value?.trim()?.toUpperCase();
  const dateTimeStr = document.getElementById('scrapDateTime')?.value;
  const description = document.getElementById('scrapDescription')?.value?.trim();

  const branchSelect = document.getElementById('scrapBranchSelect');
  const branchName = branchSelect && branchSelect.selectedIndex >= 0 ? branchSelect.options[branchSelect.selectedIndex].text : '';

  if (!companyName || !vehicleNumber || currentScrapItems.length === 0) {
    showAlert('scrapEntryAlert', 'Please enter Company Name, Vehicle Number, and add at least one item to print the slip.', 'warning');
    return;
  }

  const title = 'Scrap Transaction Slip';
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />');
  printWindow.document.write('<style>');
  printWindow.document.write('body { padding: 40px; font-family: "Segoe UI", Roboto, sans-serif; color: #333; }');
  printWindow.document.write('.receipt-header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }');
  printWindow.document.write('.receipt-title { font-size: 22px; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; }');
  printWindow.document.write('.receipt-sub { font-size: 13px; color: #666; }');
  printWindow.document.write('.info-table { width: 100%; margin-bottom: 25px; font-size: 14px; }');
  printWindow.document.write('.info-table td { padding: 5px 0; border: none; }');
  printWindow.document.write('.info-label { font-weight: bold; width: 150px; }');
  printWindow.document.write('.items-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }');
  printWindow.document.write('.items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }');
  printWindow.document.write('.items-table th { background-color: #f8f9fa; font-weight: bold; }');
  printWindow.document.write('.total-row { font-weight: bold; font-size: 15px; background-color: #fafafa; }');
  printWindow.document.write('.signature-section { margin-top: 60px; display: flex; justify-content: space-between; }');
  printWindow.document.write('.sig-box { text-align: center; width: 220px; border-top: 1px dashed #333; padding-top: 8px; font-size: 13px; font-weight: bold; }');
  printWindow.document.write('.remarks { margin-top: 25px; font-size: 13px; font-style: italic; color: #555; }');
  printWindow.document.write('</style></head><body>');

  // Header
  printWindow.document.write('<div class="receipt-header">');
  printWindow.document.write('<div class="receipt-title">TCS — SCRAP TRANSACTION SLIP</div>');
  printWindow.document.write('<div class="receipt-sub">Branch: ' + (branchName || 'N/A') + ' &nbsp;|&nbsp; Date & Time: ' + (dateTimeStr || new Date().toLocaleString()) + '</div>');
  printWindow.document.write('</div>');

  // Meta info
  printWindow.document.write('<table class="info-table">');
  printWindow.document.write('<tr><td class="info-label">Company Name:</td><td>' + companyName + '</td></tr>');
  printWindow.document.write('<tr><td class="info-label">Vehicle Number:</td><td>' + vehicleNumber + '</td></tr>');
  printWindow.document.write('</table>');

  // Table of items
  printWindow.document.write('<table class="items-table">');
  printWindow.document.write('<thead><tr><th>S.No</th><th>Product Name</th><th>Weight</th><th>Price/KG</th><th style="text-align: right;">Total (₹)</th></tr></thead>');
  printWindow.document.write('<tbody>');
  
  let grandTotal = 0;
  currentScrapItems.forEach((item, index) => {
    const total = item.weight * item.pricePerKg;
    grandTotal += total;
    printWindow.document.write('<tr>');
    printWindow.document.write('<td>' + (index + 1) + '</td>');
    printWindow.document.write('<td>' + escHtml(item.productName) + '</td>');
    printWindow.document.write('<td>' + item.weight + ' KG</td>');
    printWindow.document.write('<td>₹' + item.pricePerKg.toFixed(2) + '</td>');
    printWindow.document.write('<td style="text-align: right;">₹' + total.toFixed(2) + '</td>');
    printWindow.document.write('</tr>');
  });

  printWindow.document.write('<tr class="total-row">');
  printWindow.document.write('<td colspan="4" style="text-align: right;">Grand Total:</td>');
  printWindow.document.write('<td style="text-align: right;">₹' + grandTotal.toFixed(2) + '</td>');
  printWindow.document.write('</tr>');
  printWindow.document.write('</tbody></table>');

  // Description/Remarks if exists
  if (description) {
    printWindow.document.write('<div class="remarks"><strong>Remarks/Description:</strong> ' + escHtml(description) + '</div>');
  }

  // Signatures
  printWindow.document.write('<div class="signature-section">');
  printWindow.document.write('<div class="sig-box">Security Officer Signature</div>');
  printWindow.document.write('<div class="sig-box">Driver/Representative Signature</div>');
  printWindow.document.write('</div>');

  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

// ─── VEHICLE EXPENSES ────────────────────────────────────────────────────────
async function loadVehicleExpenses() {
  const el = document.getElementById('vehicleExpensesList');
  if (!el) return;
  el.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Loading expenses...</td></tr>';
  try {
    if (allVehicles.length === 0) {
      await loadVehicleList();
    }
    if (allBranches.length === 0) {
      allBranches = await api('/api/branches');
    }
    cachedExpenses = await api('/api/vehicle-expenses');

    // Populate branch filter if it exists and is empty
    const branchFilter = document.getElementById('expenseBranchFilter');
    if (branchFilter && branchFilter.options.length <= 1) {
      const currentVal = branchFilter.value;
      branchFilter.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      branchFilter.value = currentVal || '';
    }

    updateExpenseVehicleFilterOptions();
    renderFilteredExpenses();
  } catch (err) {
    el.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error: ${escHtml(err.message)}</td></tr>`;
  }
}

function updateExpenseVehicleFilterOptions() {
  const branchFilter = document.getElementById('expenseBranchFilter');
  const vehicleFilter = document.getElementById('expenseVehicleFilter');
  if (!vehicleFilter) return;

  const selectedBranch = branchFilter ? branchFilter.value : '';
  const currentVehicle = vehicleFilter.value;

  // Filter allVehicles based on selectedBranch
  let vehiclesForSelect = allVehicles;
  if (selectedBranch) {
    vehiclesForSelect = allVehicles.filter(v => 
      v.branchName && v.branchName.trim().toLowerCase() === selectedBranch.trim().toLowerCase()
    );
  }

  // Populate vehicleFilter dropdown
  vehicleFilter.innerHTML = '<option value="">All Vehicles</option>' + vehiclesForSelect.map(v => {
    const val = v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` : v.vehicleNumber;
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');

  // Restore previous selection if still valid, else default to all
  if (currentVehicle && vehiclesForSelect.some(v => v.vehicleNumber === currentVehicle)) {
    vehicleFilter.value = currentVehicle;
  } else {
    vehicleFilter.value = '';
  }
}

function filterExpenses() {
  updateExpenseVehicleFilterOptions();
  renderFilteredExpenses();
}

function clearExpenseFilters() {
  const branchFilter = document.getElementById('expenseBranchFilter');
  const vehicleFilter = document.getElementById('expenseVehicleFilter');
  const fromFilter = document.getElementById('expenseFromDateFilter');
  const toFilter = document.getElementById('expenseToDateFilter');
  if (branchFilter) branchFilter.value = '';
  if (vehicleFilter) vehicleFilter.value = '';
  if (fromFilter) fromFilter.value = '';
  if (toFilter) toFilter.value = '';
  
  updateExpenseVehicleFilterOptions();
  renderFilteredExpenses();
}

function renderFilteredExpenses() {
  const el = document.getElementById('vehicleExpensesList');
  if (!el) return;

  let expensesToRender = cachedExpenses;

  // Filter by branch
  const branchVal = document.getElementById('expenseBranchFilter')?.value || '';
  if (branchVal) {
    expensesToRender = expensesToRender.filter(e => {
      const v = allVehicles.find(x => x.vehicleNumber === e.vehicleNumber);
      return v && v.branchName && v.branchName.trim().toLowerCase() === branchVal.trim().toLowerCase();
    });
  } else if (currentUser && currentUser.branchName) {
    expensesToRender = expensesToRender.filter(e => {
      const v = allVehicles.find(x => x.vehicleNumber === e.vehicleNumber);
      return v && v.branchName && v.branchName.toLowerCase() === currentUser.branchName.toLowerCase();
    });
  }

  // Filter by vehicle
  const vehicleVal = document.getElementById('expenseVehicleFilter')?.value || '';
  if (vehicleVal) {
    expensesToRender = expensesToRender.filter(e => e.vehicleNumber === vehicleVal);
  }

  // Filter by From/To dates
  const fromDateVal = document.getElementById('expenseFromDateFilter')?.value || '';
  const toDateVal = document.getElementById('expenseToDateFilter')?.value || '';

  if (fromDateVal) {
    const fromDate = new Date(fromDateVal);
    fromDate.setHours(0,0,0,0);
    expensesToRender = expensesToRender.filter(e => {
      const d = new Date(e.date);
      return d >= fromDate;
    });
  }
  if (toDateVal) {
    const toDate = new Date(toDateVal);
    toDate.setHours(23,59,59,999);
    expensesToRender = expensesToRender.filter(e => {
      const d = new Date(e.date);
      return d <= toDate;
    });
  }

  // Sort ascending chronologically (oldest first)
  expensesToRender.sort((a, b) => new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0));

  if (!expensesToRender.length) {
    el.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No expenses found matching the filters.</td></tr>';
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
    
    // Load system settings for security scrap toggle
    try {
      const setting = await api('/api/system-settings/enableSecurityScrapEntry');
      const toggleInput = document.getElementById('toggleSecurityScrapEntry');
      if (toggleInput) {
        toggleInput.checked = setting.value === true;
      }
    } catch (err) {
      console.error('Failed to load system setting:', err);
    }
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function toggleSecurityScrapEntrySetting(checked) {
  try {
    await api('/api/system-settings', 'POST', { key: 'enableSecurityScrapEntry', value: checked });
    showAlert('securitySettingsAlert', `Security scrap entry ${checked ? 'enabled' : 'disabled'} successfully.`, 'success');
  } catch (err) {
    showAlert('securitySettingsAlert', err.message);
    const toggleInput = document.getElementById('toggleSecurityScrapEntry');
    if (toggleInput) {
      toggleInput.checked = !checked;
    }
  }
}

async function editScrapProductPrice(id, currentPrice) {
  const newPrice = prompt('Enter new price per KG (₹):', currentPrice);
  if (newPrice === null) return;
  const priceNum = Number(newPrice);
  if (isNaN(priceNum) || priceNum < 0) return alert('Invalid price entered');

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
  try {
    allScrapProducts = await api('/api/scrap/products');
    
    const sel = document.getElementById('scrapProductSelect');
    if (sel) {
      sel.innerHTML = `<option value="">Select Product</option>` +
        allScrapProducts.map(p => `<option value="${p._id}">${escHtml(p.name)} (₹${p.pricePerKg}/kg)</option>`).join('');
    }

    const reportSel = document.getElementById('scrapReportProductSelect');
    if (reportSel) {
      const currentVal = reportSel.value;
      reportSel.innerHTML = `<option value="">All Products</option>` +
        allScrapProducts.map(p => `<option value="${escHtml(p.name)}">${escHtml(p.name)}</option>`).join('');
      if (currentVal) reportSel.value = currentVal;
    }
  } catch (err) {
    console.error(err);
  }
}

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
    }
  }
}

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

  let proofDocument = '';
  if (currentUserRole === 'pettycashier') {
    const fileInput = document.getElementById('scrapProofFile');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      try {
        proofDocument = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      } catch (err) {
        return showAlert('scrapEntryAlert', 'Failed to read the upload file.', 'danger');
      }
    }
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
      proofDocument: proofDocument || undefined,
      items: currentScrapItems.map(item => ({
        productId: item.productId,
        weight: item.weight
      }))
    };

    await api('/api/scrap/entries', 'POST', payload);
    showCenteredSuccess('Scrap entry submitted successfully.');

    document.getElementById('scrapCompany').value = '';
    document.getElementById('scrapVehicle').value = '';
    const descEl = document.getElementById('scrapDescription');
    if (descEl) descEl.value = '';
    const fileInput = document.getElementById('scrapProofFile');
    if (fileInput) fileInput.value = '';
    
    if (branchSelect && (!currentUser || !currentUser.branch)) branchSelect.value = '';
    
    if (scrapDateTimePicker) {
      scrapDateTimePicker.setDate(new Date());
    } else {
      const scrapDateEl = document.getElementById('scrapDateTime');
      if (scrapDateEl) scrapDateEl.value = formatDateTime12h(new Date());
    }
    
    currentScrapItems = [];
    renderDraftScrapItems();

    loadScrapMyEntries();
  } catch (err) {
    showAlert('scrapEntryAlert', err.message);
  }
}

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

let cachedPendingScrapEntries = [];

async function loadScrapApprovals() {
  const el = document.getElementById('scrapPendingList');
  if (!el) return;
  try {
    await loadBranchesDropdowns();
    const entries = await api('/api/scrap/entries?status=pending');
    cachedPendingScrapEntries = entries;
    renderFilteredScrapApprovals();
  } catch (err) {
    el.innerHTML = err.message;
  }
}

function renderFilteredScrapApprovals() {
  const el = document.getElementById('scrapPendingList');
  if (!el) return;
  const branchVal = document.getElementById('scrapApprovalBranchSelect')?.value || '';
  
  let filtered = cachedPendingScrapEntries;
  if (branchVal) {
    filtered = cachedPendingScrapEntries.filter(e => e.branchName && e.branchName.toLowerCase() === branchVal.toLowerCase());
  } else if (currentUser && currentUser.branchName && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    filtered = cachedPendingScrapEntries.filter(e => e.branchName && e.branchName.toLowerCase() === currentUser.branchName.toLowerCase());
  }
  
  el.innerHTML = _renderScrapTable(filtered, true);
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
  try {
    await loadBranchesDropdowns();
    await loadScrapProductDropdown();
    const entries = await api('/api/scrap/entries?status=approved');
    
    let filtered = entries;
    const branchVal = document.getElementById('scrapReportBranchSelect')?.value || '';
    if (branchVal) {
      filtered = entries.filter(e => e.branchName && e.branchName.toLowerCase() === branchVal.toLowerCase());
    } else if (currentUser && currentUser.branchName && currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      filtered = entries.filter(e => e.branchName && e.branchName.toLowerCase() === currentUser.branchName.toLowerCase());
    }
    
    const prodVal = document.getElementById('scrapReportProductSelect')?.value || '';
    if (prodVal) {
      filtered = filtered.filter(e => 
        (e.productName && e.productName === prodVal) || 
        (e.items && e.items.some(item => item.productName === prodVal))
      );
    }

    const fromDateVal = document.getElementById('scrapReportFromDate')?.value || '';
    const toDateVal = document.getElementById('scrapReportToDate')?.value || '';
    
    if (fromDateVal) {
      const fromDate = new Date(fromDateVal);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => new Date(e.createdAt) >= fromDate);
    }
    if (toDateVal) {
      const toDate = new Date(toDateVal);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => new Date(e.createdAt) <= toDate);
    }
    
    el.innerHTML = _renderScrapTable(filtered, false);
  } catch (err) {
    el.innerHTML = err.message;
  }
}

function printScrapReport() {
  const fromDate = document.getElementById('scrapReportFromDate')?.value;
  const toDate = document.getElementById('scrapReportToDate')?.value;
  let title = 'Scrap Report';
  if (fromDate && toDate) {
    title = `Scrap Report (${fmtDate(fromDate)} to ${fmtDate(toDate)})`;
  } else if (fromDate) {
    title = `Scrap Report (From ${fmtDate(fromDate)})`;
  } else if (toDate) {
    title = `Scrap Report (Until ${fmtDate(toDate)})`;
  } else {
    title = 'Scrap Report - All Time';
  }
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
      .small { font-size: 0.875em; }
      .badge { padding: 0.35em 0.65em; font-size: 0.75em; font-weight: 700; border-radius: 0.25rem; }
      .bg-secondary { background-color: #6c757d; color: #fff; }
      .badge-approved { background: #d1fae5; color: #065f46; }
      .badge-rejected { background: #fee2e2; color: #991b1b; }
      .badge-pending { background: #fef3c7; color: #92400e; }
      .cds-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
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
        <th>Products Detail</th>
        <th>Grand Total (₹)</th>
        ${!isApproval ? '<th>Approved By</th>' : ''}
        ${isApproval ? '<th>Action</th>' : ''}
      </tr>
    </thead>
    <tbody>
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
              ${e.queryQuestion ? `
                <div class="mt-2 p-2 rounded small text-warning border border-warning-subtle" style="background: rgba(255,193,7,0.05);">
                  <strong>Query:</strong> ${escHtml(e.queryQuestion)}
                  ${e.queryAnswer ? `<br><strong class="text-info">Answer:</strong> ${escHtml(e.queryAnswer)}` : ''}
                </div>
              ` : ''}
            </td>
            <td>${escHtml(e.vehicleNumber)}</td>
            <td>
              ${itemsHtml}
              ${e.proofDocument ? `
                <div class="mt-2">
                  <a href="${e.proofDocument}" target="_blank" class="btn btn-outline-info btn-sm py-0 px-2" style="font-size: 11px;">View Proof Document</a>
                </div>
              ` : ''}
            </td>
            <td>
              <strong>${fmt(e.totalAmount)}</strong>
              ${e.pettyCashierVerifiedAmount ? `<br><small class="text-muted" style="font-size: 11px;">Verified: ${fmt(e.pettyCashierVerifiedAmount)}</small>` : ''}
            </td>
            ${!isApproval ? `<td>
              ${e.reviewedBy ? `<strong>${escHtml(e.reviewedBy)}</strong><br><span class="cds-badge ${e.status === 'approved' ? 'badge-approved' : 'badge-rejected'}">${escHtml(e.reviewedByRole || 'reviewer').toUpperCase()}</span>` : '—'}
            </td>` : ''}
            ${isApproval ? `<td>
              ${currentUserRole === 'pettycashier' ? `
                ${e.status === 'pending_pettycashier' ? `
                  <div class="d-flex flex-column gap-1">
                    <input type="number" id="verifyAmount_${e._id}" class="form-control cds-input sm" style="font-size:12px; padding: 4px 8px;" placeholder="Verify Amount (₹)" />
                    <input type="file" id="verifyProof_${e._id}" class="form-control cds-input sm" style="font-size:11px; padding: 4px 8px;" accept="image/*,application/pdf" />
                    <button class="btn btn-sm btn-success w-100 mt-1" onclick="verifyScrapEntry('${e._id}')">Verify & Approve</button>
                  </div>
                ` : ''}
                ${e.status === 'pending_manager' ? `
                  <div style="font-size: 11px; text-align: center; color: #6b7a99; font-weight: 500; padding: 4px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 4px; background: rgba(255,255,255,0.02);">
                    Awaiting Manager Approval
                  </div>
                ` : ''}
                ${e.status === 'queried' ? `
                  <div class="d-flex flex-column gap-1">
                    <input type="text" id="queryAnswer_${e._id}" class="form-control cds-input sm" style="font-size:12px; padding: 4px 8px;" placeholder="Enter Answer..." />
                    <button class="btn btn-sm btn-warning w-100 mt-1" onclick="submitScrapAnswer('${e._id}')">Submit Answer</button>
                  </div>
                ` : ''}
              ` : `
                ${e.status === 'pending_manager' ? `
                  <div class="d-flex flex-column gap-1">
                    <button class="btn btn-sm btn-success w-100" onclick="reviewScrap('${e._id}', 'approve')">Approve</button>
                    <button class="btn btn-sm btn-danger w-100" onclick="reviewScrap('${e._id}', 'reject')">Reject</button>
                    <button class="btn btn-sm btn-warning w-100" onclick="queryScrapEntry('${e._id}')">Query</button>
                  </div>
                ` : `
                  ${e.status === 'pending_pettycashier' ? `
                    <div style="font-size: 11px; text-align: center; color: #6b7a99; font-weight: 500; padding: 4px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 4px; background: rgba(255,255,255,0.02);">
                      Awaiting Petty Cashier Verification
                    </div>
                  ` : ''}
                  ${e.status === 'queried' ? `
                    <div style="font-size: 11px; text-align: center; color: #ffc107; font-weight: 500; padding: 4px; border: 1px dashed rgba(255,193,7,0.2); border-radius: 4px; background: rgba(255,193,7,0.02);">
                      Awaiting Petty Cashier Answer
                    </div>
                  ` : ''}
                `}
              `}
            </td>` : ''}
          </tr>
        `;
  }).join('')}
    </tbody>
  </table></div>`;
}

async function verifyScrapEntry(id) {
  const amountInput = document.getElementById(`verifyAmount_${id}`);
  const proofInput = document.getElementById(`verifyProof_${id}`);
  
  if (!amountInput) return;
  const verifiedAmount = amountInput.value.trim();
  if (!verifiedAmount) {
    alert('Please enter the amount to verify.');
    return;
  }
  
  let proofDocument = '';
  if (proofInput && proofInput.files && proofInput.files[0]) {
    const file = proofInput.files[0];
    try {
      proofDocument = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    } catch (err) {
      alert('Failed to read the upload file.');
      return;
    }
  }
  
  try {
    await api(`/api/scrap/entries/${id}/verify`, 'POST', {
      verifiedAmount: Number(verifiedAmount),
      proofDocument
    });
    alert('Entry verified and sent to manager.');
    loadScrapApprovals();
  } catch (err) {
    alert(err.message);
  }
}

async function queryScrapEntry(id) {
  const question = prompt('Enter Query Question for Petty Cashier:');
  if (question === null) return;
  if (!question.trim()) {
    alert('Query question cannot be empty.');
    return;
  }
  
  try {
    await api(`/api/scrap/entries/${id}/query`, 'POST', { question });
    alert('Query raised successfully.');
    loadScrapApprovals();
  } catch (err) {
    alert(err.message);
  }
}

async function submitScrapAnswer(id) {
  const answerInput = document.getElementById(`queryAnswer_${id}`);
  if (!answerInput) return;
  const answer = answerInput.value.trim();
  if (!answer) {
    alert('Please enter your answer.');
    return;
  }
  
  try {
    await api(`/api/scrap/entries/${id}/answer`, 'POST', { answer });
    alert('Answer submitted to manager successfully.');
    loadScrapApprovals();
  } catch (err) {
    alert(err.message);
  }
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
    showCenteredError(err.message);
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
    showCenteredError('Please fill all required fields with positive values.');
    return;
  }

  const matchedVehicle = allVehicles.find(v => v.vehicleNumber === vehicleNumber);
  const branch = matchedVehicle ? matchedVehicle.branch : undefined;
  const branchName = matchedVehicle ? matchedVehicle.branchName : undefined;

  const expense = {
    expenseType: 'oil',
    amount: price,
    date: new Date(),
    description: `FUEL_ADDITION:qty=${fuelAdded};current=${(Number(document.getElementById('fuelTankCapacity')?.value || 0) - fuelAdded).toFixed(2)};bunk=${bunk};location=${location}`
  };

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
    branch: branch,
    branchName: branchName
  };

  try {
    await api('/api/vehicle-logs', 'POST', payload);
    showCenteredSuccess('Fuel log submitted successfully.');
    resetFuelForm();
    await applyFuelVehicleBaseline();
    loadFuelHistory();
    if (typeof loadVehicleHistory === 'function') loadVehicleHistory();
  } catch (err) {
    showCenteredError(err.message);
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

async function loadFuelHistory() {
  const el = document.getElementById('fuelHistoryList');
  if (!el) return;
  try {
    setLoading('fuelHistoryList', 'Loading fuel history...');
    const logs = await api('/api/vehicle-logs');
    cachedFuelLogs = logs.filter(l => l.isFuelLog || l.fuelAdded > 0);

    if (allVehicles.length === 0) {
      allVehicles = await api('/api/vehicles');
    }
    if (allBranches.length === 0) {
      allBranches = await api('/api/branches');
    }

    // Populate branch filter if it exists and is empty
    const branchFilter = document.getElementById('fuelBranchFilter');
    if (branchFilter && branchFilter.options.length <= 1) {
      const currentVal = branchFilter.value;
      branchFilter.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      branchFilter.value = currentVal || '';
    }

    updateFuelVehicleFilterOptions();
    renderFilteredFuelLogs();
  } catch (err) {
    const alertId = document.getElementById('fuelHistoryAlert');
    if (alertId) showAlert('fuelHistoryAlert', err.message);
  }
}

function updateFuelVehicleFilterOptions() {
  const branchFilter = document.getElementById('fuelBranchFilter');
  const vehicleFilter = document.getElementById('fuelVehicleFilter');
  if (!vehicleFilter) return;

  const selectedBranch = branchFilter ? branchFilter.value : '';
  const currentVehicle = vehicleFilter.value;

  // Filter allVehicles based on selectedBranch
  let vehiclesForSelect = allVehicles;
  if (selectedBranch) {
    vehiclesForSelect = allVehicles.filter(v => 
      v.branchName && v.branchName.trim().toLowerCase() === selectedBranch.trim().toLowerCase()
    );
  }

  // Populate vehicleFilter dropdown
  vehicleFilter.innerHTML = '<option value="">All Vehicles</option>' + vehiclesForSelect.map(v => {
    const val = v.vehicleNumber;
    const disp = v.shortName ? `${v.shortName} - ${v.vehicleNumber}` : v.vehicleNumber;
    return `<option value="${escHtml(val)}">${escHtml(disp)}</option>`;
  }).join('');

  // Restore previous selection if still valid, else default to all
  if (currentVehicle && vehiclesForSelect.some(v => v.vehicleNumber === currentVehicle)) {
    vehicleFilter.value = currentVehicle;
  } else {
    vehicleFilter.value = '';
  }
}

function filterFuelLogs() {
  updateFuelVehicleFilterOptions();
  renderFilteredFuelLogs();
}

function clearFuelFilters() {
  const branchFilter = document.getElementById('fuelBranchFilter');
  const vehicleFilter = document.getElementById('fuelVehicleFilter');
  const fromFilter = document.getElementById('fuelFromDateFilter');
  const toFilter = document.getElementById('fuelToDateFilter');
  if (branchFilter) branchFilter.value = '';
  if (vehicleFilter) vehicleFilter.value = '';
  if (fromFilter) fromFilter.value = '';
  if (toFilter) toFilter.value = '';
  
  updateFuelVehicleFilterOptions();
  renderFilteredFuelLogs();
}

function renderFilteredFuelLogs() {
  const el = document.getElementById('fuelHistoryList');
  if (!el) return;

  let logsToRender = cachedFuelLogs;

  const branchVal = document.getElementById('fuelBranchFilter')?.value || '';
  const vehicleVal = document.getElementById('fuelVehicleFilter')?.value || '';
  const fromDateVal = document.getElementById('fuelFromDateFilter')?.value || '';
  const toDateVal = document.getElementById('fuelToDateFilter')?.value || '';

  if (branchVal) {
    logsToRender = logsToRender.filter(l => {
      if (l.branchName && l.branchName.trim().toLowerCase() === branchVal.trim().toLowerCase()) {
        return true;
      }
      const matched = allVehicles.find(v => v.vehicleNumber === l.vehicleNumber);
      if (matched && matched.branchName && matched.branchName.trim().toLowerCase() === branchVal.trim().toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  if (vehicleVal) {
    logsToRender = logsToRender.filter(l => l.vehicleNumber === vehicleVal);
  }

  if (fromDateVal) {
    const fromDate = new Date(fromDateVal);
    fromDate.setHours(0,0,0,0);
    logsToRender = logsToRender.filter(l => {
      const d = new Date(l.startDateTime);
      return d >= fromDate;
    });
  }

  if (toDateVal) {
    const toDate = new Date(toDateVal);
    toDate.setHours(23,59,59,999);
    logsToRender = logsToRender.filter(l => {
      const d = new Date(l.startDateTime);
      return d <= toDate;
    });
  }

  // Sort ascending chronologically (oldest first)
  logsToRender.sort((a, b) => new Date(a.startDateTime || a.createdAt || 0) - new Date(b.startDateTime || b.createdAt || 0));

  if (!logsToRender.length) {
    el.innerHTML = '<p class="text-muted small px-2">No matching fuel entries found.</p>';
    return;
  }

  el.innerHTML = `<div class="table-responsive"><table class="table cds-table">
    <thead>
      <tr>
        <th>Vehicle</th>
        <th>Fuel Type</th>
        <th>Bunk Name</th>
        <th>Bunk Location</th>
        <th>Added (L)</th>
        <th>Remaining</th>
        <th>Cost</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${logsToRender.map((l) => {
        const fuelType = l.fuelType || 'petrol';
        const fuelBadge = fuelType.toLowerCase() === 'diesel' 
          ? `<span class="badge bg-warning text-dark">Diesel</span>` 
          : `<span class="badge bg-info text-dark">Petrol</span>`;

        let bunkName = '';
        let bunkLoc = '';
        if (l.expenses && l.expenses.length) {
          const exp = l.expenses.find(e => e.description && e.description.startsWith('FUEL_ADDITION:'));
          if (exp) {
            const match = exp.description.match(/^FUEL_ADDITION:qty=([\d.]+);current=([\d.]+);bunk=([^;]+)(?:;location=(.*))?$/);
            if (match) {
              bunkName = match[3] || '';
              bunkLoc = match[4] || '';
            }
          }
        }
        if (!bunkLoc) bunkLoc = l.fromLocation || '';
        if (!bunkName) bunkName = 'N/A';
        if (!bunkLoc) bunkLoc = 'N/A';

        const cost = fmt((l.expenses || []).reduce((s, e) => s + (e.amount || 0), 0));

        return `<tr>
          <td><strong>${escHtml(l.vehicleNumber)}</strong></td>
          <td>${fuelBadge}</td>
          <td>${escHtml(bunkName)}</td>
          <td>${escHtml(bunkLoc)}</td>
          <td>${l.fuelAdded} L</td>
          <td>${l.remainingFuel} L</td>
          <td>${cost}</td>
          <td class="small">${formatDateTime12h(l.startDateTime)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div>`;
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
          disableMobile: true
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

function onToLocationChange() {
  const toSelect = document.getElementById('toLocation');
  const toCustom = document.getElementById('toLocationCustom');
  if (toSelect && toCustom) {
    if (toSelect.value === 'other') {
      toCustom.classList.remove('d-none');
      toCustom.required = true;
      toCustom.focus();
    } else {
      toCustom.classList.add('d-none');
      toCustom.required = false;
      toCustom.value = '';
    }
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
      const currentVal = toSelect.value;
      const toCustom = document.getElementById('toLocationCustom');
      const customVal = toCustom ? toCustom.value.trim() : '';

      toSelect.innerHTML = '<option value="">Select To Location...</option>' + 
        allBranches.map(b => `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`).join('') +
        '<option value="other">Other (Write location...)</option>';
      
      if (currentVal === 'other') {
        toSelect.value = 'other';
        if (toCustom) {
          toCustom.classList.remove('d-none');
          toCustom.value = customVal;
        }
      } else if (currentVal && allBranches.some(b => b.name === currentVal)) {
        toSelect.value = currentVal;
        if (toCustom) {
          toCustom.classList.add('d-none');
          toCustom.value = '';
        }
      } else if (customVal) {
        toSelect.value = 'other';
        if (toCustom) {
          toCustom.classList.remove('d-none');
          toCustom.value = customVal;
        }
      } else {
        toSelect.value = '';
        if (toCustom) {
          toCustom.classList.add('d-none');
          toCustom.value = '';
        }
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

    const scrapApprovalBranchSelect = document.getElementById('scrapApprovalBranchSelect');
    if (scrapApprovalBranchSelect) {
      const currentVal = scrapApprovalBranchSelect.value;
      scrapApprovalBranchSelect.innerHTML = '<option value="">All Branches</option>' + allBranches.map(b => 
        `<option value="${escHtml(b.name)}">${escHtml(b.name)}</option>`
      ).join('');
      if (currentVal) scrapApprovalBranchSelect.value = currentVal;
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

  // Show proof upload container only for Petty Cashier
  const proofContainer = document.getElementById('scrapProofContainer');
  if (proofContainer) {
    if (currentUserRole === 'pettycashier') {
      proofContainer.classList.remove('d-none');
    } else {
      proofContainer.classList.add('d-none');
    }
  }

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
          disableMobile: true
        });
      }
    } else {
      scrapDateEl.value = formatDateTime12h(new Date());
    }
  }
}

// ─── Page Init ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path === '/admin' || path === '/admin.html' || path === '/manager' || path === '/manager.html') initAdmin();
  else if (path === '/security' || path === '/security.html') initSecurity();
  else if (path === '/petty' || path === '/petty.html') initPettyCashier();
});


//<div class="small">Used: ${(l.fuelUsed || 0).toFixed(2)} L</div> line no 969