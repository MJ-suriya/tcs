require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./db');
const { User, Transaction, DailyRecord, InventoryProduct, StockRequest, StockMovement, VehicleProfile, VehicleLog, VehicleLogDraft, ScrapProduct, ScrapEntry } = require('./models');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: process.env.SESSION_SECRET || 'cds_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// ─── Seed Default Admin ──────────────────────────────────────────────────────
async function seedAdmin() {
  const existing = await User.findOne({ username: 'admin' });
  if (!existing) {
    await User.create({ username: 'admin', password: '1234', role: 'admin' });
    console.log('Default admin created: admin / 1234');
  }
}

// ─── Simple Cron: Check Suspense Penalties (runs every hour) ─────────────────
setInterval(async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const overdue = await Transaction.find({
      type: 'suspense',
      status: { $in: ['approved', 'active'] },
      arsBalance: { $gt: 0 },
      createdAt: { $lte: sevenDaysAgo }
    });
    for (const s of overdue) {
      const remainingArs = Number(s.arsBalance || 0);
      if (remainingArs <= 0) continue;
      // No financial impact before manager approval:
      // create a settlement request with penalty-only, pending approval.
      s.status = 'settlement_pending';
      s.suspenseSettlementStatus = 'settlement_pending';
      s.suspenseSettlement = {
        returnedAmount: 0,
        expenseAmount: 0,
        penaltyAmount: remainingArs,
        submittedAt: new Date(),
        submittedBy: 'system',
        reviewStatus: 'pending'
      };
      s.suspenseHistory = Array.isArray(s.suspenseHistory) ? s.suspenseHistory : [];
      s.suspenseHistory.push({
        event: 'auto_penalty_requested_pending_approval',
        by: 'system',
        at: new Date(),
        data: { penaltyAmount: remainingArs }
      });
      await s.save();
      console.log(`Auto penalty requested (pending approval): ${s._id} (${s.workerName})`);
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
}, 60 * 60 * 1000);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
};
const requireManagerOrAdmin = (req, res, next) => {
  if (!req.session.user || !['manager', 'admin'].includes(req.session.user.role))
    return res.status(403).json({ error: 'Manager or admin access required' });
  next();
};
const requireInchargeOrAbove = (req, res, next) => {
  if (!req.session.user || !['incharge', 'manager', 'admin'].includes(req.session.user.role))
    return res.status(403).json({ error: 'Incharge, manager, or admin access required' });
  next();
};
const requireWarehouseOps = (req, res, next) => {
  if (!req.session.user || !['manager', 'admin'].includes(req.session.user.role))
    return res.status(403).json({ error: 'Warehouse operation access required' });
  next();
};
const requireSecurity = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'security')
    return res.status(403).json({ error: 'Security access required' });
  next();
};
const requireVehicleModuleAccess = (req, res, next) => {
  if (!req.session.user || !['security', 'manager', 'admin'].includes(req.session.user.role))
    return res.status(403).json({ error: 'Vehicle module access required' });
  next();
};

const DEFAULT_VEHICLES = ['TN01AB1234', 'TN02CD5678', 'TN03EF9012'];

async function getVehicleBaseline(vehicleNumber) {
  const normalizedVehicle = String(vehicleNumber || '').trim().toUpperCase();
  if (!normalizedVehicle) return { startKm: 0, availableFuel: 0 };
  const lastApproved = await VehicleLog.findOne({ vehicleNumber: normalizedVehicle, status: 'approved' }).sort({ reviewedAt: -1, createdAt: -1 });
  const profile = await VehicleProfile.findOne({ vehicleNumber: normalizedVehicle });
  if (!lastApproved) {
    return {
      startKm: profile?.openingKm || 0,
      availableFuel: profile?.openingFuel || 0,
      expectedMileage: profile?.expectedMileage ?? null
    };
  }
  return {
    startKm: Number(lastApproved.endKm) || 0,
    availableFuel: Number(lastApproved.remainingFuel) || 0,
    expectedMileage: profile?.expectedMileage ?? null
  };
}

function normalizeVehicleExpenses(expenses) {
  return Array.isArray(expenses) ? expenses
    .filter((e) => e && e.expenseType && e.amount != null && e.date)
    .map((e) => ({
      expenseType: String(e.expenseType).toLowerCase(),
      amount: Number(e.amount),
      date: new Date(e.date),
      description: String(e.description || '').trim()
    })) : [];
}

async function buildVehicleLogData(payload) {
  const {
    driverName, vehicleNumber, fromLocation, toLocation, startDateTime, endDateTime, endKm,
    fuelAdded, remainingFuel, fuelUsedInput, fuelFillDate, expenses, correctedFromLogId, mileageReason
  } = payload;

  if (!driverName || !vehicleNumber || !fromLocation || !toLocation || !startDateTime || !endDateTime) {
    const err = new Error('Driver, vehicle, locations, and date/time fields are required');
    err.statusCode = 400;
    throw err;
  }

  const baseline = await getVehicleBaseline(vehicleNumber);
  const startKm = baseline.startKm;
  const availableFuel = baseline.availableFuel;
  const parsedEndKm = Number(endKm);
  const parsedFuelAdded = fuelAdded == null || fuelAdded === '' ? 0 : Number(fuelAdded);
  const parsedRemainingFuel = remainingFuel == null || remainingFuel === '' ? null : Number(remainingFuel);
  const parsedFuelUsedInput = fuelUsedInput == null || fuelUsedInput === '' ? null : Number(fuelUsedInput);

  if (!Number.isFinite(parsedEndKm) || parsedEndKm < startKm) {
    const err = new Error(`End KM must be greater than or equal to start KM (${startKm})`);
    err.statusCode = 400;
    throw err;
  }
  if (!Number.isFinite(parsedFuelAdded) || parsedFuelAdded < 0) {
    const err = new Error('Fuel added must be zero or positive');
    err.statusCode = 400;
    throw err;
  }
  if (parsedRemainingFuel != null && (!Number.isFinite(parsedRemainingFuel) || parsedRemainingFuel < 0)) {
    const err = new Error('Remaining fuel must be zero or positive when provided');
    err.statusCode = 400;
    throw err;
  }
  if (parsedFuelUsedInput != null && (!Number.isFinite(parsedFuelUsedInput) || parsedFuelUsedInput < 0)) {
    const err = new Error('Fuel used input must be zero or positive when provided');
    err.statusCode = 400;
    throw err;
  }

  const distanceTravelled = parsedEndKm - startKm;
  let fuelUsed;
  let finalRemainingFuel;
  if (parsedRemainingFuel != null) {
    fuelUsed = availableFuel + parsedFuelAdded - parsedRemainingFuel;
    finalRemainingFuel = parsedRemainingFuel;
  } else if (parsedFuelUsedInput != null) {
    fuelUsed = parsedFuelUsedInput;
    finalRemainingFuel = availableFuel + parsedFuelAdded - fuelUsed;
  } else if (baseline.expectedMileage && baseline.expectedMileage > 0) {
    fuelUsed = distanceTravelled / baseline.expectedMileage;
    finalRemainingFuel = availableFuel + parsedFuelAdded - fuelUsed;
  } else {
    const err = new Error('Enter remaining fuel or fuel used. If both are missing, set expected mileage for this vehicle.');
    err.statusCode = 400;
    throw err;
  }

  if (fuelUsed < 0 || finalRemainingFuel < 0) {
    const err = new Error('Remaining fuel cannot exceed available + fuel added');
    err.statusCode = 400;
    throw err;
  }
  fuelUsed = Number(fuelUsed.toFixed(2));
  finalRemainingFuel = Number(finalRemainingFuel.toFixed(2));
  const mileage = fuelUsed > 0 ? Number((distanceTravelled / fuelUsed).toFixed(2)) : null;
  const isLowFuel = finalRemainingFuel <= 2;

  return {
    driverName: String(driverName).trim(),
    vehicleNumber: String(vehicleNumber).trim().toUpperCase(),
    fromLocation: String(fromLocation).trim(),
    toLocation: String(toLocation).trim(),
    startDateTime: new Date(startDateTime),
    endDateTime: new Date(endDateTime),
    startKm,
    endKm: parsedEndKm,
    distanceTravelled,
    availableFuel,
    fuelAdded: parsedFuelAdded,
    remainingFuel: finalRemainingFuel,
    fuelFillDate: fuelFillDate ? new Date(fuelFillDate) : undefined,
    fuelUsed,
    mileage,
    mileageReason: String(mileageReason || '').trim(),
    isLowFuel,
    expenses: normalizeVehicleExpenses(expenses),
    correctedFromLogId: correctedFromLogId || undefined
  };
}

// ─── Helper: Get Today's Date String ─────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dayRange(dateStr = todayStr()) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

function isSuspenseActiveForArs(status) {
  // Only approved ARS should reflect "money given to workers"
  return ['active', 'settlement_pending'].includes(status);
}

// ─── Helper: Ensure Today's Daily Record Exists ───────────────────────────────
async function ensureTodayRecord() {
  const today = todayStr();
  let record = await DailyRecord.findOne({ date: today });
  if (!record) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const prevRecord = await DailyRecord.findOne({ date: yStr });
    const opening = prevRecord && prevRecord.closingBalance !== undefined
      ? prevRecord.closingBalance
      : 0;
    const openingArs = prevRecord && prevRecord.closingArsBalance !== undefined
      ? prevRecord.closingArsBalance
      : 0;
    record = await DailyRecord.create({ date: today, openingBalance: opening, openingArsBalance: openingArs });
  }
  return record;
}

// ─── Helper: Calculate Current Balance ───────────────────────────────────────
async function calculateBalance(dateStr) {
  const record = await DailyRecord.findOne({ date: dateStr || todayStr() });
  if (!record) {
    return {
      opening: 0,
      balance: 0,
      totalCredits: 0,
      totalExpenses: 0,
      totalPenalties: 0,
      totalArsDisbursed: 0,
      suspenseArsTotal: 0,
      totalPendingSettlements: 0
    };
  }

  const opening = record.openingBalance;
  const { start, end } = dayRange(record.date);

  // Add credits approved on this day (includes ARS returned credits posted at settlement approval)
  const credits = await Transaction.find({
    type: 'credit',
    status: 'approved',
    $or: [
      { reviewedAt: { $gte: start, $lte: end } },
      { reviewedAt: { $exists: false }, createdAt: { $gte: start, $lte: end } },
      { reviewedAt: null, createdAt: { $gte: start, $lte: end } }
    ]
  });
  const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0);

  // Deduct only expenses approved on this day (excluding ARS penalty which is tracked separately)
  const expenses = await Transaction.find({
    type: 'expense',
    status: 'approved',
    // ARS settlement components must NOT affect main balance (pre-deduct model)
    settlementComponent: { $nin: ['settlement_penalty', 'settlement_expense'] },
    reviewedAt: { $gte: start, $lte: end }
  });
  const baseExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // ARS penalties do NOT affect main balance again; dashboard will show penalty outstanding separately.
  const totalPenalties = 0;

  // ARS disbursement: deduct from main balance ONLY after manager approves ARS creation
  const arsDisbursedRows = await Transaction.find({
    type: 'suspense',
    status: { $in: ['active', 'settlement_pending', 'closed', 'penalty', 'auto_penalty_applied', 'partially_settled', 'partially_cleared', 'fully_cleared'] },
    reviewedAt: { $gte: start, $lte: end }
  });
  const totalArsDisbursed = arsDisbursedRows.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const suspenseRecords = await Transaction.find({ type: 'suspense' });
  const suspenseArsTotal = suspenseRecords
    .filter((s) => isSuspenseActiveForArs(s.status))
    .reduce((sum, s) => sum + (Number(s.arsBalance || 0) || 0), 0);
  const totalPendingSettlements = suspenseRecords.filter((s) => s.status === 'settlement_pending').length;

  const approvedSettlements = suspenseRecords
    .filter((s) => (s.suspenseSettlement || {}).reviewStatus === 'approved');

  // ARS settlement totals (approved only): tracking values for dashboard.
  // These do NOT change main balance except returned credits that are already posted as credit rows.
  const totalSettlementBillExpenses = approvedSettlements
    .filter((s) => {
      const reviewedAt = s?.suspenseSettlement?.reviewedAt;
      if (!reviewedAt) return false;
      const at = new Date(reviewedAt);
      return at >= start && at <= end;
    })
    .reduce((sum, s) => sum + (Number(s.suspenseSettlement?.expenseAmount || 0) || 0), 0);
  // Settlement expense is bill-based spend; include it in Total Expenses dashboard metric.
  const totalExpenses = baseExpenses + totalSettlementBillExpenses;

  // Penalty outstanding (unsettled): for approved settlements only.
  const suspensePenaltyOutstanding = approvedSettlements
    .map((s) => {
      const remaining = s.lateClearance && Number.isFinite(Number(s.lateClearance.remainingPenalty))
        ? Number(s.lateClearance.remainingPenalty)
        : Number((s.suspenseSettlement || {}).penaltyAmount || 0);
      return Number.isFinite(remaining) ? remaining : 0;
    })
    .reduce((sum, n) => sum + Math.max(0, n), 0);

  // Main balance must not deduct settlement expense again because ARS was already deducted
  // when suspense got approved/disbursed.
  const balance = opening + totalCredits - baseExpenses - totalPenalties - totalArsDisbursed;
  return {
    opening,
    balance,
    totalCredits,
    totalExpenses,
    // Re-purpose this dashboard number as "ARS Penalty Outstanding"
    totalPenalties: suspensePenaltyOutstanding,
    totalArsDisbursed,
    suspenseArsTotal,
    totalPendingSettlements,
    record
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.user = { id: user._id, username: user.username, role: user.role };
    res.json({ success: true, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// POST /api/change-password
app.post('/api/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both current and new password are required' });
    const user = await User.findById(req.session.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.password !== currentPassword) return res.status(401).json({ error: 'Incorrect current password' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/me
app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.session.user);
});

// ══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (Admin only)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/users
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
app.post('/api/users', requireAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const user = await User.create({ username, password, role: role || 'manager' });
    res.json({ success: true, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.username === 'admin') return res.status(400).json({ error: 'Cannot delete default admin' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// BALANCE ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/balance
app.get('/api/balance', requireManagerOrAdmin, async (req, res) => {
  try {
    await ensureTodayRecord();
    const data = await calculateBalance();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DAILY RECORD ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/daily
app.get('/api/daily', requireManagerOrAdmin, async (req, res) => {
  try {
    const records = await DailyRecord.find().sort({ date: -1 }).limit(30);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/daily/today
app.get('/api/daily/today', requireManagerOrAdmin, async (req, res) => {
  try {
    const record = await ensureTodayRecord();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily/close
app.post('/api/daily/close', requireAdmin, async (req, res) => {
  try {
    const { denomination, arsBalance } = req.body;
    const today = todayStr();
    let record = await DailyRecord.findOne({ date: today });
    if (!record) record = await ensureTodayRecord();
    if (record.isClosed) return res.status(400).json({ error: 'Day already closed' });

    // Calculate denomination total
    const d = denomination || {};
    const denomTotal =
      (d.fiveHundreds || 0) * 500 +
      (d.twoHundreds || 0) * 200 +
      (d.hundreds || 0) * 100 +
      (d.fifties || 0) * 50 +
      (d.twenties || 0) * 20 +
      (d.tens || 0) * 10 +
      (d.fives || 0) * 5 +
      (d.twos || 0) * 2 +
      (d.ones || 0) * 1;

    const closingArsBalance = Number(arsBalance || 0);
    if (!Number.isFinite(closingArsBalance) || closingArsBalance < 0) {
      return res.status(400).json({ error: 'ARS balance must be a valid non-negative number' });
    }

    record.denomination = d;
    record.closingBalance = denomTotal;
    record.closingArsBalance = closingArsBalance;
    record.isClosed = true;
    record.closedBy = req.session.user.username;
    record.closedAt = new Date();
    await record.save();

    res.json({ success: true, closingBalance: denomTotal, closingArsBalance, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// CREDIT + EXPENSE ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/credit
app.post('/api/credit', requireAdmin, async (req, res) => {
  try {
    const { description, amount } = req.body;
    if (!description || !amount) return res.status(400).json({ error: 'Description and amount required' });
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
    const tx = await Transaction.create({
      type: 'credit',
      description,
      amount: parseFloat(amount),
      status: 'approved',
      reviewedBy: req.session.user.username,
      reviewedAt: new Date(),
      createdBy: req.session.user.username
    });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expense
app.post('/api/expense', requireAdmin, async (req, res) => {
  try {
    const { description, amount } = req.body;
    if (!description || !amount) return res.status(400).json({ error: 'Description and amount required' });
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
    const tx = await Transaction.create({
      type: 'expense',
      description,
      amount: parseFloat(amount),
      status: 'pending',
      createdBy: req.session.user.username
    });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions
app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    const txs = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/pending (for manager)
app.get('/api/transactions/pending', requireAuth, async (req, res) => {
  try {
    const txs = await Transaction.find({ status: { $in: ['pending', 'settlement_pending'] } }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions/:id/approve
app.post('/api/transactions/:id/approve', requireManagerOrAdmin, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (!['pending', 'settlement_pending'].includes(tx.status)) return res.status(400).json({ error: 'Transaction is not pending' });
    if (tx.type === 'suspense' && tx.status === 'settlement_pending') {
      const settlement = tx.suspenseSettlement || {};
      const returned = Number(settlement.returnedAmount || 0);
      const expense = Number(settlement.expenseAmount || 0);
      const penalty = Number(settlement.penaltyAmount || 0);
      if ([returned, expense, penalty].some((n) => !Number.isFinite(n) || n < 0)) {
        return res.status(400).json({ error: 'Invalid settlement values on suspense record' });
      }
      const total = Number((returned + expense + penalty).toFixed(2));
      const original = Number(Number(tx.amount || 0).toFixed(2));
      if (total !== original) {
        return res.status(400).json({ error: 'Settlement total must match original ARS amount' });
      }

      const now = new Date();
      const reviewer = req.session.user.username;
      const submittedBy = String(settlement.submittedBy || tx.createdBy || '').trim() || 'unknown';

      const createdRows = [];
      if (returned > 0) {
        createdRows.push(await Transaction.create({
          type: 'credit',
          description: `[ARS Settlement Return] ${tx.description}`,
          amount: returned,
          status: 'approved',
          suspenseId: tx._id,
          createdBy: submittedBy,
          reviewedBy: reviewer,
          reviewedAt: now
        }));
      }
      // Pre-deduct model: Expense/Penalty are tracked inside ARS only.
      // They must NOT affect main balance again, so we do not create expense rows.

      tx.suspenseSettlement = {
        ...(tx.suspenseSettlement || {}),
        reviewStatus: 'approved',
        reviewedBy: reviewer,
        reviewedAt: now
      };
      tx.suspenseHistory = Array.isArray(tx.suspenseHistory) ? tx.suspenseHistory : [];
      tx.suspenseHistory.push({
        event: 'settlement_approved_return_applied',
        by: reviewer,
        at: now,
        data: { returnedAmount: returned, expenseAmount: expense, penaltyAmount: penalty }
      });
      tx.lateClearance = {
        totalReturned: 0,
        remainingPenalty: Math.max(0, Number(penalty || 0)),
        lastAdjustedAt: now,
        lastAdjustedBy: reviewer
      };
      tx.arsBalance = 0;
      tx.status = penalty > 0 ? 'partially_settled' : 'closed';
      tx.suspenseSettlementStatus = 'closed';
      await tx.save();

      return res.json({ success: true, transaction: tx, createdRowsCount: createdRows.length });
    }
    if (tx.type === 'suspense') {
      tx.status = 'active';
      tx.suspenseSettlementStatus = 'active';
      // ARS affects tracking ONLY after approval
      tx.arsBalance = Number(tx.amount || 0);
      tx.suspenseHistory = Array.isArray(tx.suspenseHistory) ? tx.suspenseHistory : [];
      tx.suspenseHistory.push({
        event: 'ars_approved_active',
        by: req.session.user.username,
        at: new Date(),
        data: { amount: Number(tx.amount || 0) }
      });
    } else {
      tx.status = 'approved';
    }
    tx.reviewedBy = req.session.user.username;
    tx.reviewedAt = new Date();
    await tx.save();
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions/:id/reject
app.post('/api/transactions/:id/reject', requireManagerOrAdmin, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (!['pending', 'settlement_pending'].includes(tx.status)) return res.status(400).json({ error: 'Transaction is not pending' });
    if (tx.type === 'suspense' && tx.status === 'settlement_pending') {
      const now = new Date();
      const reviewer = req.session.user.username;
      tx.suspenseSettlement = {
        ...(tx.suspenseSettlement || {}),
        reviewStatus: 'rejected',
        reviewedBy: reviewer,
        reviewedAt: now
      };
      tx.suspenseHistory = Array.isArray(tx.suspenseHistory) ? tx.suspenseHistory : [];
      tx.suspenseHistory.push({
        event: 'settlement_rejected_no_financial_change',
        by: reviewer,
        at: now,
        data: {
          returnedAmount: Number(tx.suspenseSettlement?.returnedAmount || 0),
          expenseAmount: Number(tx.suspenseSettlement?.expenseAmount || 0),
          penaltyAmount: Number(tx.suspenseSettlement?.penaltyAmount || 0)
        }
      });
      tx.status = 'active';
      tx.suspenseSettlementStatus = 'active';
      await tx.save();
      return res.json({ success: true, transaction: tx });
    }
    tx.status = 'rejected';
    if (tx.type === 'suspense') tx.suspenseSettlementStatus = 'pending_approval';
    tx.reviewedBy = req.session.user.username;
    tx.reviewedAt = new Date();
    await tx.save();
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SUSPENSE (ARS) ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/suspense
app.post('/api/suspense', requireAdmin, async (req, res) => {
  try {
    const { workerName, amount, reason } = req.body;
    if (!workerName || !amount || !reason) return res.status(400).json({ error: 'Worker name, amount, and reason required' });
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
    const tx = await Transaction.create({
      type: 'suspense',
      description: `ARS - ${workerName}: ${reason}`,
      workerName,
      amount: parseFloat(amount),
      // ARS should not affect tracking/balance until manager approval
      arsBalance: 0,
      reason,
      status: 'pending',
      suspenseSettlementStatus: 'pending_approval',
      createdBy: req.session.user.username,
      suspenseHistory: [{
        event: 'ars_created_pending_approval',
        by: req.session.user.username,
        at: new Date(),
        data: { amount: parseFloat(amount), workerName, reason }
      }]
    });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suspense/:id/convert
app.post('/api/suspense/:id/convert', requireAdmin, async (req, res) => {
  try {
    const suspense = await Transaction.findById(req.params.id);
    if (!suspense) return res.status(404).json({ error: 'Suspense not found' });
    if (suspense.type !== 'suspense') return res.status(400).json({ error: 'Not a suspense record' });
    if (suspense.status !== 'pending') return res.status(400).json({ error: 'Only pending suspense can be converted' });

    // Create expense from suspense
    const expense = await Transaction.create({
      type: 'expense',
      description: `[Converted from ARS] ${suspense.description}`,
      amount: suspense.amount,
      status: 'pending',
      isFromSuspense: true,
      originalSuspenseId: suspense._id,
      createdBy: req.session.user.username
    });

    // Mark suspense as converted
    suspense.status = 'converted';
    suspense.convertedExpenseId = expense._id;
    await suspense.save();

    res.json({ success: true, expense, suspense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MANUAL PENALTY TRIGGER (Admin)
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/suspense/:id/penalty
app.post('/api/suspense/:id/penalty', requireAdmin, async (req, res) => {
  try {
    const suspense = await Transaction.findById(req.params.id);
    if (!suspense || suspense.type !== 'suspense') return res.status(404).json({ error: 'Suspense not found' });
    if (!['active', 'approved'].includes(suspense.status)) return res.status(400).json({ error: 'Only active suspense can be marked as penalty' });
    const remainingArs = Number(suspense.arsBalance || 0);
    if (remainingArs <= 0) return res.status(400).json({ error: 'No ARS balance left for penalty' });
    // Penalty must be manager-approved (no balance impact before approval)
    suspense.status = 'settlement_pending';
    suspense.suspenseSettlementStatus = 'settlement_pending';
    suspense.suspenseSettlement = {
      returnedAmount: 0,
      expenseAmount: 0,
      penaltyAmount: remainingArs,
      submittedAt: new Date(),
      submittedBy: req.session.user.username,
      reviewStatus: 'pending'
    };
    suspense.suspenseHistory = Array.isArray(suspense.suspenseHistory) ? suspense.suspenseHistory : [];
    suspense.suspenseHistory.push({
      event: 'penalty_requested_pending_approval',
      by: req.session.user.username,
      at: new Date(),
      data: { penaltyAmount: remainingArs }
    });
    await suspense.save();
    res.json({ success: true, transaction: suspense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suspense/:id/settle
app.post('/api/suspense/:id/settle', requireAdmin, async (req, res) => {
  try {
    const { returnedAmount, expenseAmount, penaltyAmount } = req.body;
    const suspense = await Transaction.findById(req.params.id);
    if (!suspense || suspense.type !== 'suspense') return res.status(404).json({ error: 'Suspense not found' });
    if (!['active', 'approved'].includes(suspense.status)) return res.status(400).json({ error: 'Only active suspense can be settled' });

    const returned = Number(returnedAmount || 0);
    const expense = Number(expenseAmount || 0);
    let penalty = penaltyAmount == null || penaltyAmount === '' ? null : Number(penaltyAmount);
    if ([returned, expense].some((n) => !Number.isFinite(n) || n < 0) || (penalty != null && (!Number.isFinite(penalty) || penalty < 0))) {
      return res.status(400).json({ error: 'Settlement amounts must be zero or positive' });
    }
    const original = Number(Number(suspense.amount).toFixed(2));
    if (penalty == null) penalty = Number((original - returned - expense).toFixed(2));
    if (penalty < 0) return res.status(400).json({ error: 'Penalty cannot be negative. Reduce Returned/Expense amounts.' });
    const total = Number((returned + expense + penalty).toFixed(2));
    if (total !== original) {
      return res.status(400).json({ error: 'Returned + Expense + Penalty must equal original suspense amount' });
    }

    // Single structured settlement request (no balance changes until manager approval)
    suspense.status = 'settlement_pending';
    suspense.suspenseSettlementStatus = 'settlement_pending';
    suspense.suspenseSettlement = {
      returnedAmount: returned,
      expenseAmount: expense,
      penaltyAmount: penalty,
      submittedAt: new Date(),
      submittedBy: req.session.user.username,
      reviewStatus: 'pending'
    };
    suspense.suspenseHistory = Array.isArray(suspense.suspenseHistory) ? suspense.suspenseHistory : [];
    suspense.suspenseHistory.push({
      event: 'settlement_submitted_pending_approval',
      by: req.session.user.username,
      at: new Date(),
      data: { returnedAmount: returned, expenseAmount: expense, penaltyAmount: penalty }
    });
    await suspense.save();

    res.json({ success: true, suspense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suspense/:id/settlement/review
app.post('/api/suspense/:id/settlement/review', requireManagerOrAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Action must be approve or reject' });
    const suspense = await Transaction.findById(req.params.id);
    if (!suspense || suspense.type !== 'suspense') return res.status(404).json({ error: 'Suspense not found' });
    if (suspense.status !== 'settlement_pending') return res.status(400).json({ error: 'Suspense settlement is not pending' });
    // Keep this route aligned with the main approval flow (apply financials only on approve)
    const reviewer = req.session.user.username;
    const now = new Date();
    const settlement = suspense.suspenseSettlement || {};
    const returned = Number(settlement.returnedAmount || 0);
    const expense = Number(settlement.expenseAmount || 0);
    const penalty = Number(settlement.penaltyAmount || 0);
    const total = Number((returned + expense + penalty).toFixed(2));
    const original = Number(Number(suspense.amount || 0).toFixed(2));
    if (total !== original) return res.status(400).json({ error: 'Settlement total must match original ARS amount' });

    suspense.suspenseSettlement.reviewStatus = action === 'approve' ? 'approved' : 'rejected';
    suspense.suspenseSettlement.reviewedBy = reviewer;
    suspense.suspenseSettlement.reviewedAt = now;

    if (action === 'approve') {
      const submittedBy = String(settlement.submittedBy || suspense.createdBy || '').trim() || 'unknown';
      if (returned > 0) {
        await Transaction.create({
          type: 'credit',
          description: `[ARS Settlement Return] ${suspense.description}`,
          amount: returned,
          status: 'approved',
          suspenseId: suspense._id,
          createdBy: submittedBy,
          reviewedBy: reviewer,
          reviewedAt: now
        });
      }
      // Pre-deduct model: Expense/Penalty are internal to ARS only (no main balance impact)
      suspense.arsBalance = 0;
      suspense.status = penalty > 0 ? 'partially_settled' : 'closed';
      suspense.suspenseSettlementStatus = 'closed';
      suspense.suspenseHistory = Array.isArray(suspense.suspenseHistory) ? suspense.suspenseHistory : [];
      suspense.suspenseHistory.push({
        event: 'settlement_approved_return_applied',
        by: reviewer,
        at: now,
        data: { returnedAmount: returned, expenseAmount: expense, penaltyAmount: penalty }
      });
      suspense.lateClearance = {
        totalReturned: 0,
        remainingPenalty: Math.max(0, Number(penalty || 0)),
        lastAdjustedAt: now,
        lastAdjustedBy: reviewer
      };
    } else {
      suspense.status = 'active';
      suspense.suspenseSettlementStatus = 'active';
      suspense.suspenseHistory = Array.isArray(suspense.suspenseHistory) ? suspense.suspenseHistory : [];
      suspense.suspenseHistory.push({
        event: 'settlement_rejected_no_financial_change',
        by: reviewer,
        at: now,
        data: { returnedAmount: returned, expenseAmount: expense, penaltyAmount: penalty }
      });
    }
    await suspense.save();

    res.json({ success: true, suspense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suspense/:id/late-return
app.post('/api/suspense/:id/late-return', requireAdmin, async (req, res) => {
  try {
    const { returnedAmount } = req.body;
    const suspense = await Transaction.findById(req.params.id);
    if (!suspense || suspense.type !== 'suspense') return res.status(404).json({ error: 'Suspense not found' });
    if (!['closed', 'penalty', 'auto_penalty_applied', 'partially_settled', 'partially_cleared', 'fully_cleared'].includes(suspense.status)) {
      return res.status(400).json({ error: 'Late return is allowed only after settlement/penalty completion' });
    }
    const parsedAmount = Number(returnedAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return res.status(400).json({ error: 'Returned amount must be positive' });

    // Determine penalty remaining from settlement penalty
    const penaltyBase = Number(suspense.suspenseSettlement?.penaltyAmount || 0);
    const existingRemaining = suspense.lateClearance?.remainingPenalty;
    const remainingPenalty = existingRemaining != null ? Number(existingRemaining) : penaltyBase;
    if (!Number.isFinite(remainingPenalty) || remainingPenalty <= 0) {
      return res.status(400).json({ error: 'No penalty available to adjust for this ARS entry' });
    }
    if (parsedAmount > remainingPenalty) {
      return res.status(400).json({ error: 'Returned amount cannot exceed current penalty' });
    }

    // Apply immediately (Admin action): credit main balance and reduce penalty accordingly.
    const now = new Date();
    const adminUser = req.session.user.username;
    const creditTx = await Transaction.create({
      type: 'credit',
      description: `[ARS Late Return Credit] ${suspense.description}`,
      amount: parsedAmount,
      status: 'approved',
      suspenseId: suspense._id,
      settlementComponent: 'late_return_credit',
      createdBy: adminUser,
      reviewedBy: adminUser,
      reviewedAt: now
    });

    const newRemaining = Number((remainingPenalty - parsedAmount).toFixed(2));
    const prevReturned = Number(suspense.lateClearance?.totalReturned || 0);
    suspense.lateClearance = {
      totalReturned: Number((prevReturned + parsedAmount).toFixed(2)),
      remainingPenalty: newRemaining,
      lastAdjustedAt: now,
      lastAdjustedBy: adminUser
    };
    suspense.status = newRemaining <= 0 ? 'closed' : 'partially_settled';
    suspense.suspenseHistory = Array.isArray(suspense.suspenseHistory) ? suspense.suspenseHistory : [];
    suspense.suspenseHistory.push({
      event: 'late_return_applied_penalty_reduced',
      by: adminUser,
      at: now,
      data: { returnedAmount: parsedAmount, previousPenalty: remainingPenalty, remainingPenalty: newRemaining }
    });
    await suspense.save();

    res.json({ success: true, suspense, creditTransaction: creditTx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// INVENTORY ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/inventory/products
app.post('/api/inventory/products', requireWarehouseOps, async (req, res) => {
  try {
    const { name, category, sku, quantity, location, color, size, minStock } = req.body;
    if (!name || !category || !sku || !location || quantity == null) {
      return res.status(400).json({ error: 'Name, category, SKU, quantity, and location are required' });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) return res.status(400).json({ error: 'Quantity must be zero or positive' });
    const normalizedSku = String(sku).trim().toUpperCase();

    const minValue = minStock == null || minStock === '' ? 30 : Number(minStock);
    if (!Number.isFinite(minValue) || minValue < 0) return res.status(400).json({ error: 'Min stock must be zero or positive' });

    let product = await InventoryProduct.findOne({ sku: normalizedSku });
    if (product) {
      product.name = String(name).trim();
      product.category = String(category).trim();
      product.location = String(location).trim();
      if (color !== undefined) product.color = color ? String(color).trim() : '';
      if (size !== undefined) product.size = size ? String(size).trim() : '';
      product.minStock = minValue;
      product.quantity += qty;
      product.totalStock += qty;
      product.availableStock += qty;
      if (product.quantity < 0 || product.totalStock < 0 || product.availableStock < 0) {
        return res.status(400).json({ error: 'No negative stock allowed' });
      }
      await product.save();
    } else {
      product = await InventoryProduct.create({
        name: String(name).trim(),
        category: String(category).trim(),
        sku: normalizedSku,
        quantity: qty,
        location: String(location).trim(),
        color: color ? String(color).trim() : '',
        size: size ? String(size).trim() : '',
        totalStock: qty,
        availableStock: qty,
        reservedStock: 0,
        minStock: minValue,
        createdBy: req.session.user.username
      });
    }

    await StockMovement.create({
      movementType: 'inbound',
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      from: 'Vendor',
      to: product.location,
      approvedBy: req.session.user.username,
      createdBy: req.session.user.username
    });

    res.json({ success: true, product, mode: product.quantity === qty ? 'created' : 'refilled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/products
app.get('/api/inventory/products', requireInchargeOrAbove, async (req, res) => {
  try {
    const { q, category, location, lowStock } = req.query;
    const filter = {};
    if (q) {
      const re = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ name: re }, { sku: re }, { category: re }];
    }
    if (category) filter.category = category;
    if (location) filter.location = location;

    let products = await InventoryProduct.find(filter).sort({ createdAt: -1 });
    if (String(lowStock) === 'true') products = products.filter((p) => p.availableStock < p.minStock);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/dashboard
app.get('/api/inventory/dashboard', requireInchargeOrAbove, async (req, res) => {
  try {
    const products = await InventoryProduct.find().sort({ createdAt: -1 });
    const pendingRequests = await StockRequest.countDocuments({ status: 'pending' });
    const lowStockItems = products.filter((p) => p.availableStock < p.minStock);
    const recentMovements = await StockMovement.find().sort({ timestamp: -1 }).limit(10);

    const totalAvailableStock = products.reduce((sum, p) => sum + p.availableStock, 0);

    res.json({
      totalProducts: products.length,
      totalAvailableStock,
      pendingRequests,
      lowStockItems,
      recentMovements,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/requests
app.post('/api/inventory/requests', requireInchargeOrAbove, async (req, res) => {
  try {
    const { productId, quantity, section } = req.body;
    if (!productId || quantity == null || !section) return res.status(400).json({ error: 'Product, quantity, and section are required' });
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: 'Quantity must be positive' });

    const product = await InventoryProduct.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (qty > product.availableStock) return res.status(400).json({ error: `Cannot request more than available quantity (${product.availableStock})` });

    const request = await StockRequest.create({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      section,
      status: 'pending',
      requestedBy: req.session.user.username
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/requests
app.get('/api/inventory/requests', requireInchargeOrAbove, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.session.user.role === 'incharge') filter.requestedBy = req.session.user.username;
    const requests = await StockRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/requests/:id/review
app.post('/api/inventory/requests/:id/review', requireManagerOrAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Action must be approve or reject' });
    const request = await StockRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Stock request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be reviewed' });

    if (action === 'approve') {
      const product = await InventoryProduct.findById(request.product);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.availableStock < request.quantity) return res.status(400).json({ error: 'Cannot approve: insufficient stock' });

      product.availableStock -= request.quantity;
      product.reservedStock += request.quantity;
      if (product.availableStock < 0 || product.reservedStock < 0) return res.status(400).json({ error: 'No negative stock allowed' });
      await product.save();
      request.status = 'approved';
    } else {
      request.status = 'rejected';
    }

    request.reviewedBy = req.session.user.username;
    request.reviewedAt = new Date();
    await request.save();
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/requests/:id/issue
app.post('/api/inventory/requests/:id/issue', requireManagerOrAdmin, async (req, res) => {
  try {
    const request = await StockRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Stock request not found' });
    if (request.status !== 'approved') return res.status(400).json({ error: 'Cannot issue without approval' });

    const product = await InventoryProduct.findById(request.product);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.reservedStock < request.quantity) return res.status(400).json({ error: 'Insufficient reserved stock to issue' });

    product.reservedStock -= request.quantity;
    product.totalStock -= request.quantity;
    if (product.reservedStock < 0 || product.totalStock < 0) return res.status(400).json({ error: 'No negative stock allowed' });
    await product.save();

    request.status = 'issued';
    request.issuedBy = req.session.user.username;
    request.issuedAt = new Date();
    await request.save();

    await StockMovement.create({
      movementType: 'outbound',
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: request.quantity,
      from: product.location,
      to: request.section,
      approvedBy: request.reviewedBy || req.session.user.username,
      createdBy: req.session.user.username
    });

    res.json({ success: true, request, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/movements
app.get('/api/inventory/movements', requireInchargeOrAbove, async (req, res) => {
  try {
    const movements = await StockMovement.find().sort({ timestamp: -1 }).limit(200);
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// VEHICLE LOG BOOK ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/vehicles
app.get('/api/vehicles', requireVehicleModuleAccess, async (req, res) => {
  try {
    const profiles = await VehicleProfile.find().sort({ vehicleNumber: 1 });
    const usedVehicles = await VehicleLog.distinct('vehicleNumber');
    const known = new Set(profiles.map((p) => p.vehicleNumber));
    const merged = [
      ...profiles.map((p) => ({
        vehicleNumber: p.vehicleNumber,
        openingKm: p.openingKm,
        openingFuel: p.openingFuel,
        expectedMileage: p.expectedMileage ?? null
      })),
      ...Array.from(new Set([...DEFAULT_VEHICLES, ...usedVehicles.filter(Boolean)]))
        .filter((v) => !known.has(v))
        .map((v) => ({ vehicleNumber: v, openingKm: 0, openingFuel: 0, expectedMileage: null }))
    ].sort((a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-profiles
app.post('/api/vehicle-profiles', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { vehicleNumber, openingKm, openingFuel, expectedMileage } = req.body;
    const normalizedVehicle = String(vehicleNumber || '').trim().toUpperCase();
    if (!normalizedVehicle) return res.status(400).json({ error: 'Vehicle number is required' });
    const km = Number(openingKm);
    const fuel = Number(openingFuel);
    const expMileage = expectedMileage == null || expectedMileage === '' ? null : Number(expectedMileage);
    if (!Number.isFinite(km) || km < 0) return res.status(400).json({ error: 'Opening KM must be zero or positive' });
    if (!Number.isFinite(fuel) || fuel < 0) return res.status(400).json({ error: 'Opening fuel must be zero or positive' });
    if (expMileage != null && (!Number.isFinite(expMileage) || expMileage <= 0)) {
      return res.status(400).json({ error: 'Expected mileage must be positive when provided' });
    }
    const profile = await VehicleProfile.findOneAndUpdate(
      { vehicleNumber: normalizedVehicle },
      {
        vehicleNumber: normalizedVehicle,
        openingKm: km,
        openingFuel: fuel,
        expectedMileage: expMileage,
        createdBy: req.session.user.username
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-logs/baseline?vehicleNumber=TN01AB1234
app.get('/api/vehicle-logs/baseline', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    if (!vehicleNumber) return res.status(400).json({ error: 'vehicleNumber is required' });
    const baseline = await getVehicleBaseline(vehicleNumber);
    res.json(baseline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-logs (Security only)
app.post('/api/vehicle-logs', requireSecurity, async (req, res) => {
  try {
    const logData = await buildVehicleLogData(req.body);

    const log = await VehicleLog.create({
      ...logData,
      status: 'pending',
      createdBy: req.session.user.username,
      correctedFromLogId: logData.correctedFromLogId
    });

    if (logData.correctedFromLogId) {
      await VehicleLog.findOneAndUpdate(
        { _id: logData.correctedFromLogId, status: 'rejected', createdBy: req.session.user.username },
        { correctedByLogId: log._id }
      );
    }

    res.json({ success: true, log });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Vehicle waiting list (drafts)
app.get('/api/vehicle-logs/waiting', requireSecurity, async (req, res) => {
  try {
    const drafts = await VehicleLogDraft.find({ createdBy: req.session.user.username }).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicle-logs/waiting', requireSecurity, async (req, res) => {
  try {
    const { draftId } = req.body;
    const normalized = {
      driverName: String(req.body.driverName || '').trim(),
      vehicleNumber: String(req.body.vehicleNumber || '').trim().toUpperCase(),
      fromLocation: String(req.body.fromLocation || '').trim(),
      toLocation: String(req.body.toLocation || '').trim(),
      startDateTime: req.body.startDateTime ? new Date(req.body.startDateTime) : undefined,
      endDateTime: req.body.endDateTime ? new Date(req.body.endDateTime) : undefined,
      endKm: req.body.endKm == null || req.body.endKm === '' ? undefined : Number(req.body.endKm),
      fuelAdded: req.body.fuelAdded == null || req.body.fuelAdded === '' ? 0 : Number(req.body.fuelAdded),
      remainingFuel: req.body.remainingFuel == null || req.body.remainingFuel === '' ? null : Number(req.body.remainingFuel),
      fuelUsedInput: req.body.fuelUsedInput == null || req.body.fuelUsedInput === '' ? null : Number(req.body.fuelUsedInput),
      fuelFillDate: req.body.fuelFillDate ? new Date(req.body.fuelFillDate) : undefined,
      mileageReason: String(req.body.mileageReason || '').trim(),
      correctedFromLogId: req.body.correctedFromLogId || undefined,
      expenses: normalizeVehicleExpenses(req.body.expenses)
    };
    if (normalized.endKm != null && (!Number.isFinite(normalized.endKm) || normalized.endKm < 0)) {
      return res.status(400).json({ error: 'End KM must be zero or positive' });
    }
    if (!Number.isFinite(normalized.fuelAdded) || normalized.fuelAdded < 0) {
      return res.status(400).json({ error: 'Fuel added must be zero or positive' });
    }
    if (normalized.remainingFuel != null && (!Number.isFinite(normalized.remainingFuel) || normalized.remainingFuel < 0)) {
      return res.status(400).json({ error: 'Remaining fuel must be zero or positive when provided' });
    }
    if (normalized.fuelUsedInput != null && (!Number.isFinite(normalized.fuelUsedInput) || normalized.fuelUsedInput < 0)) {
      return res.status(400).json({ error: 'Fuel used input must be zero or positive when provided' });
    }

    let draft;
    if (draftId) {
      draft = await VehicleLogDraft.findOneAndUpdate(
        { _id: draftId, createdBy: req.session.user.username },
        { ...normalized, updatedAt: new Date() },
        { new: true }
      );
      if (!draft) return res.status(404).json({ error: 'Waiting list entry not found' });
    } else {
      draft = await VehicleLogDraft.create({ ...normalized, createdBy: req.session.user.username });
    }
    res.json({ success: true, draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehicle-logs/waiting/:id', requireSecurity, async (req, res) => {
  try {
    const draft = await VehicleLogDraft.findOneAndDelete({ _id: req.params.id, createdBy: req.session.user.username });
    if (!draft) return res.status(404).json({ error: 'Waiting list entry not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicle-logs/waiting/:id/submit', requireSecurity, async (req, res) => {
  try {
    const draft = await VehicleLogDraft.findOne({ _id: req.params.id, createdBy: req.session.user.username });
    if (!draft) return res.status(404).json({ error: 'Waiting list entry not found' });
    const logData = await buildVehicleLogData(draft.toObject());
    const log = await VehicleLog.create({
      ...logData,
      status: 'pending',
      createdBy: req.session.user.username
    });
    if (logData.correctedFromLogId) {
      await VehicleLog.findOneAndUpdate(
        { _id: logData.correctedFromLogId, status: 'rejected', createdBy: req.session.user.username },
        { correctedByLogId: log._id }
      );
    }
    await VehicleLogDraft.deleteOne({ _id: draft._id });
    res.json({ success: true, log });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// GET /api/vehicle-logs
app.get('/api/vehicle-logs', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { status, vehicleNumber, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (vehicleNumber) filter.vehicleNumber = String(vehicleNumber).trim().toUpperCase();
    if (req.session.user.role === 'security') filter.createdBy = req.session.user.username;
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      filter.startDateTime = { $gte: start, $lte: end };
    }
    const logs = await VehicleLog.find(filter).sort({ createdAt: -1 }).limit(300);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-logs/:id/review
app.post('/api/vehicle-logs/:id/review', requireManagerOrAdmin, async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Action must be approve or reject' });
    const log = await VehicleLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Vehicle log not found' });
    if (log.status !== 'pending') return res.status(400).json({ error: 'Only pending logs can be reviewed' });
    if (action === 'reject' && !String(reason || '').trim()) return res.status(400).json({ error: 'Reject reason is required' });

    log.status = action === 'approve' ? 'approved' : 'rejected';
    log.rejectReason = action === 'reject' ? String(reason).trim() : '';
    log.reviewedBy = req.session.user.username;
    log.reviewedAt = new Date();
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-logs/reports
app.get('/api/vehicle-logs/reports', requireManagerOrAdmin, async (req, res) => {
  try {
    const approved = await VehicleLog.find({ status: 'approved' }).sort({ createdAt: -1 });
    const grouped = {};
    for (const log of approved) {
      if (!grouped[log.vehicleNumber]) {
        grouped[log.vehicleNumber] = {
          vehicleNumber: log.vehicleNumber,
          totalDistance: 0,
          totalFuelUsed: 0,
          totalExpenses: 0,
          avgMileage: null,
          lowFuelCount: 0,
          tripCount: 0
        };
      }
      const g = grouped[log.vehicleNumber];
      g.totalDistance += Number(log.distanceTravelled) || 0;
      g.totalFuelUsed += Number(log.fuelUsed) || 0;
      g.totalExpenses += (log.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      g.lowFuelCount += log.isLowFuel ? 1 : 0;
      g.tripCount += 1;
    }
    const rows = Object.values(grouped).map((g) => ({
      ...g,
      avgMileage: g.totalFuelUsed > 0 ? Number((g.totalDistance / g.totalFuelUsed).toFixed(2)) : null
    })).sort((a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-logs/pending-count
app.get('/api/vehicle-logs/pending-count', requireManagerOrAdmin, async (req, res) => {
  try {
    const pendingVehicleLogs = await VehicleLog.countDocuments({ status: 'pending' });
    res.json({ pendingVehicleLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SCRAP MANAGEMENT ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/scrap/products
app.get('/api/scrap/products', requireAuth, async (req, res) => {
  try {
    const products = await ScrapProduct.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/products (Admin only)
app.post('/api/scrap/products', requireAdmin, async (req, res) => {
  try {
    const { name, pricePerKg } = req.body;
    if (!name || pricePerKg == null) return res.status(400).json({ error: 'Name and Price per KG are required' });
    const product = await ScrapProduct.create({
      name,
      pricePerKg: Number(pricePerKg),
      createdBy: req.session.user.username
    });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/scrap/products/:id (Admin only)
app.delete('/api/scrap/products/:id', requireAdmin, async (req, res) => {
  try {
    const p = await ScrapProduct.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Scrap product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/scrap/products/:id (Admin only)
app.put('/api/scrap/products/:id', requireAdmin, async (req, res) => {
  try {
    const { pricePerKg } = req.body;
    if (pricePerKg == null) return res.status(400).json({ error: 'Price per KG is required' });
    const p = await ScrapProduct.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Scrap product not found' });
    
    p.pricePerKg = Number(pricePerKg);
    await p.save();
    res.json({ success: true, product: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scrap/entries
app.get('/api/scrap/entries', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const entries = await ScrapEntry.find(filter).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/entries (Security primarily)
app.post('/api/scrap/entries', requireAuth, async (req, res) => {
  try {
    const { companyName, vehicleNumber, ownerName, productId, weight } = req.body;
    if (!companyName || !vehicleNumber || !ownerName || !productId || !weight) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const product = await ScrapProduct.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const w = Number(weight);
    if (w <= 0) return res.status(400).json({ error: 'Weight must be positive' });
    
    const totalAmount = Number((w * product.pricePerKg).toFixed(2));
    
    const entry = await ScrapEntry.create({
      companyName,
      vehicleNumber,
      ownerName,
      product: product._id,
      productName: product.name,
      weight: w,
      pricePerKg: product.pricePerKg,
      totalAmount,
      createdBy: req.session.user.username
    });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/entries/:id/approve (Manager/Admin)
app.post('/api/scrap/entries/:id/approve', requireManagerOrAdmin, async (req, res) => {
  try {
    const entry = await ScrapEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending') return res.status(400).json({ error: 'Only pending entries can be approved' });
    
    entry.status = 'approved';
    entry.reviewedBy = req.session.user.username;
    entry.reviewedAt = new Date();
    await entry.save();
    
    // Optional: Log it in main balance? User didn't request this specifically, but "Total Scrap Value" implies it's tracked.
    // They said "Add summary cards ... Total Scrap Value". It may not directly affect CDB based on description, just scrap reporting.
    
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/entries/:id/reject (Manager/Admin)
app.post('/api/scrap/entries/:id/reject', requireManagerOrAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const entry = await ScrapEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending') return res.status(400).json({ error: 'Only pending entries can be rejected' });
    
    entry.status = 'rejected';
    entry.rejectReason = reason || '';
    entry.reviewedBy = req.session.user.username;
    entry.reviewedAt = new Date();
    await entry.save();
    
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scrap/dashboard
app.get('/api/scrap/dashboard', requireAuth, async (req, res) => {
  try {
    const totalEntries = await ScrapEntry.countDocuments();
    const pendingApprovals = await ScrapEntry.countDocuments({ status: 'pending' });
    const approvedEntriesCount = await ScrapEntry.countDocuments({ status: 'approved' });
    
    const approvedEntries = await ScrapEntry.find({ status: 'approved' });
    const totalScrapValue = approvedEntries.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
    
    res.json({
      totalEntries,
      pendingApprovals,
      approvedEntries: approvedEntriesCount,
      totalScrapValue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════════
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/manager', (req, res) => res.sendFile(path.join(__dirname, 'manager.html')));
app.get('/incharge', (req, res) => res.sendFile(path.join(__dirname, 'incharge.html')));
app.get('/security', (req, res) => res.sendFile(path.join(__dirname, 'security.html')));

// Return JSON for unknown API routes (avoid HTML responses)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// API error handler to keep responses JSON
app.use((err, req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
async function bootstrap() {
  try {
    await connectDB();
    await seedAdmin();
    app.listen(PORT, () => console.log(`Credit Debit System running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
}

bootstrap();
