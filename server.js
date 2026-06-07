require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./db');
<<<<<<< HEAD
const { User, VehicleProfile, VehicleLog, VehicleLogDraft, ScrapProduct, ScrapEntry, VehicleExpense, FuelPrice, Branch } = require('./models');
=======
const { User, Transaction, DailyRecord, InventoryProduct, StockRequest, StockMovement, VehicleProfile, VehicleLog, VehicleLogDraft, ScrapProduct, ScrapEntry } = require('./models');
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

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

<<<<<<< HEAD
async function seedFuelPrices() {
  const petrol = await FuelPrice.findOne({ fuelType: 'petrol' });
  if (!petrol) {
    await FuelPrice.create({ fuelType: 'petrol', pricePerLitre: 102.50 });
    console.log('Default petrol price seeded');
  }
  const diesel = await FuelPrice.findOne({ fuelType: 'diesel' });
  if (!diesel) {
    await FuelPrice.create({ fuelType: 'diesel', pricePerLitre: 94.20 });
    console.log('Default diesel price seeded');
  }
}

async function seedBranches() {
  const defaults = ['Tuty', 'tnv', 'theni', 'cmb', 'tnk'];
  const count = await Branch.countDocuments();
  if (count === 0) {
    for (const name of defaults) {
      await Branch.create({ name, createdBy: 'system' });
    }
    console.log('Default branches seeded:', defaults.join(', '));
  }
}
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

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
<<<<<<< HEAD
=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
  if (!normalizedVehicle) return { startKm: 0, availableFuel: 0, expectedMileage: null, tankCapacity: 0, previousFuelOdometer: 0, tripDistanceSum: 0, approxFuelUsed: 0 };
  const lastApproved = await VehicleLog.findOne({ vehicleNumber: normalizedVehicle, status: 'approved' }).sort({ createdAt: -1, endDateTime: -1 });
  const profile = await VehicleProfile.findOne({ vehicleNumber: normalizedVehicle });
  
  // Find previous fuel log to get its odometer reading
  const lastFuelLog = await VehicleLog.findOne({ vehicleNumber: normalizedVehicle, status: 'approved', fuelAdded: { $gt: 0 } }).sort({ createdAt: -1, startDateTime: -1 });
  const previousFuelOdometer = lastFuelLog ? lastFuelLog.endKm : (profile?.openingKm || 0);
  const lastFuelLogDate = lastFuelLog ? lastFuelLog.startDateTime : new Date(0);

  // Find all approved trip logs (where fuelAdded is 0) after lastFuelLogDate
  const trips = await VehicleLog.find({
    vehicleNumber: normalizedVehicle,
    status: 'approved',
    fuelAdded: 0,
    startDateTime: { $gt: lastFuelLogDate }
  });
  const tripDistanceSum = trips.reduce((sum, t) => sum + (t.distanceTravelled || 0), 0);
  const expectedMileage = profile?.expectedMileage ?? null;
  const approxFuelUsed = expectedMileage > 0 ? Number((tripDistanceSum / expectedMileage).toFixed(2)) : 0;

  if (!lastApproved) {
    const capacity = profile?.tankCapacity || 0;
    return {
      startKm: profile?.openingKm || 0,
      availableFuel: capacity || profile?.openingFuel || 0,
      expectedMileage,
      tankCapacity: capacity,
      previousFuelOdometer,
      tripDistanceSum,
      approxFuelUsed
=======
  if (!normalizedVehicle) return { startKm: 0, availableFuel: 0 };
  const lastApproved = await VehicleLog.findOne({ vehicleNumber: normalizedVehicle, status: 'approved' }).sort({ reviewedAt: -1, createdAt: -1 });
  const profile = await VehicleProfile.findOne({ vehicleNumber: normalizedVehicle });
  if (!lastApproved) {
    return {
      startKm: profile?.openingKm || 0,
      availableFuel: profile?.openingFuel || 0,
      expectedMileage: profile?.expectedMileage ?? null
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    };
  }
  return {
    startKm: Number(lastApproved.endKm) || 0,
    availableFuel: Number(lastApproved.remainingFuel) || 0,
<<<<<<< HEAD
    expectedMileage,
    tankCapacity: profile?.tankCapacity || 0,
    previousFuelOdometer,
    tripDistanceSum,
    approxFuelUsed
=======
    expectedMileage: profile?.expectedMileage ?? null
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
async function addEmergencyExpensesToLog(log) {
  if (!log || !Array.isArray(log.expenses)) return;
  const odometerSuffix = log.endKm ? ` (Odometer: ${log.endKm} KM)` : '';
  for (const exp of log.expenses) {
    const isFuelAddition = exp.description && exp.description.startsWith('FUEL_ADDITION:');
    if (!isFuelAddition) {
      await VehicleExpense.create({
        vehicleNumber: log.vehicleNumber,
        expenseType: exp.expenseType || 'other',
        amount: exp.amount,
        date: exp.date || new Date(),
        description: `${exp.description || ''}${odometerSuffix}`.trim(),
        status: 'pending',
        createdBy: log.createdBy
      });
    }
  }
}

async function buildVehicleLogData(payload) {
  const {
    driverName, vehicleNumber, fromLocation, toLocation, startDateTime, endDateTime, endKm,
    fuelAdded, remainingFuel, correctedFromLogId, isFuelLog, fuelType, pricePerLitre
  } = payload;

  if (!driverName || !vehicleNumber || !fromLocation || !toLocation || !startDateTime) {
=======
async function buildVehicleLogData(payload) {
  const {
    driverName, vehicleNumber, fromLocation, toLocation, startDateTime, endDateTime, endKm,
    fuelAdded, remainingFuel, fuelUsedInput, fuelFillDate, expenses, correctedFromLogId, mileageReason
  } = payload;

  if (!driverName || !vehicleNumber || !fromLocation || !toLocation || !startDateTime || !endDateTime) {
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    const err = new Error('Driver, vehicle, locations, and date/time fields are required');
    err.statusCode = 400;
    throw err;
  }

  const baseline = await getVehicleBaseline(vehicleNumber);
<<<<<<< HEAD
  const profile = await VehicleProfile.findOne({ vehicleNumber: String(vehicleNumber).trim().toUpperCase() });
  const tankCapacity = profile?.tankCapacity || baseline.tankCapacity || 0;

  if (isFuelLog || String(driverName) === 'Fuel Log') {
    const parsedFuelAdded = Number(fuelAdded);
    if (!Number.isFinite(parsedFuelAdded) || parsedFuelAdded <= 0) {
      const err = new Error('Fuel added must be a positive number');
      err.statusCode = 400;
      throw err;
    }

    const parsedEndKm = Number(endKm);
    if (!Number.isFinite(parsedEndKm) || parsedEndKm < baseline.startKm) {
      const err = new Error(`End KM must be greater than or equal to start KM (${baseline.startKm})`);
      err.statusCode = 400;
      throw err;
    }

    const tripDistance = parsedEndKm - baseline.startKm;
    const totalDistanceSinceLastFuel = parsedEndKm - baseline.previousFuelOdometer;

    let mileage = null;
    if (parsedFuelAdded > 0) {
      mileage = Number((totalDistanceSinceLastFuel / parsedFuelAdded).toFixed(2));
    }

    return {
      driverName: String(driverName).trim(),
      vehicleNumber: String(vehicleNumber).trim().toUpperCase(),
      fromLocation: String(fromLocation).trim(),
      toLocation: String(toLocation).trim(),
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime || startDateTime),
      startKm: baseline.startKm,
      endKm: parsedEndKm,
      distanceTravelled: tripDistance,
      availableFuel: Math.max(0, tankCapacity - parsedFuelAdded),
      fuelAdded: parsedFuelAdded,
      remainingFuel: tankCapacity,
      fuelFillDate: new Date(endDateTime || startDateTime),
      fuelUsed: parsedFuelAdded,
      mileage,
      mileageReason: '',
      isLowFuel: false,
      fuelType,
      pricePerLitre: pricePerLitre ? Number(pricePerLitre) : undefined,
      expenses: normalizeVehicleExpenses(payload.expenses),
      correctedFromLogId: correctedFromLogId || undefined,
      branch: payload.branch || undefined,
      branchName: payload.branchName || undefined
    };
  }

  // Standard log processing
  if (!endDateTime) {
    const err = new Error('End date/time is required');
    err.statusCode = 400;
    throw err;
  }

  const startKm = baseline.startKm;
  const availableFuel = baseline.availableFuel; // Current Fuel
  const parsedEndKm = Number(endKm);
  const parsedFuelAdded = fuelAdded == null || fuelAdded === '' ? 0 : Number(fuelAdded);
  const parsedRemainingFuel = remainingFuel == null || remainingFuel === '' ? null : Number(remainingFuel);
=======
  const startKm = baseline.startKm;
  const availableFuel = baseline.availableFuel;
  const parsedEndKm = Number(endKm);
  const parsedFuelAdded = fuelAdded == null || fuelAdded === '' ? 0 : Number(fuelAdded);
  const parsedRemainingFuel = remainingFuel == null || remainingFuel === '' ? null : Number(remainingFuel);
  const parsedFuelUsedInput = fuelUsedInput == null || fuelUsedInput === '' ? null : Number(fuelUsedInput);
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

  if (!Number.isFinite(parsedEndKm) || parsedEndKm < startKm) {
    const err = new Error(`End KM must be greater than or equal to start KM (${startKm})`);
    err.statusCode = 400;
    throw err;
  }
<<<<<<< HEAD

  if (parsedRemainingFuel != null) {
    if (!Number.isFinite(parsedRemainingFuel) || parsedRemainingFuel < 0) {
      const err = new Error('Remaining fuel must be zero or positive');
      err.statusCode = 400;
      throw err;
    }
  }

  const distanceTravelled = parsedEndKm - startKm;
  let fuelUsed = 0;
  let finalRemainingFuel = availableFuel + parsedFuelAdded;
  let mileage = null;

  if (parsedRemainingFuel != null) {
    fuelUsed = availableFuel + parsedFuelAdded - parsedRemainingFuel;
    if (fuelUsed < 0) fuelUsed = parsedFuelAdded; // safe fallback
    finalRemainingFuel = parsedRemainingFuel;
    fuelUsed = Number(fuelUsed.toFixed(2));
    if (fuelUsed > 0) {
      mileage = Number((distanceTravelled / fuelUsed).toFixed(2));
    }
  }

=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    fuelFillDate: null,
    fuelUsed,
    mileage,
    mileageReason: '',
    isLowFuel,
    fuelType,
    pricePerLitre: pricePerLitre ? Number(pricePerLitre) : undefined,
    expenses: normalizeVehicleExpenses(payload.expenses),
    correctedFromLogId: correctedFromLogId || undefined,
    branch: payload.branch || undefined,
    branchName: payload.branchName || undefined
=======
    fuelFillDate: fuelFillDate ? new Date(fuelFillDate) : undefined,
    fuelUsed,
    mileage,
    mileageReason: String(mileageReason || '').trim(),
    isLowFuel,
    expenses: normalizeVehicleExpenses(expenses),
    correctedFromLogId: correctedFromLogId || undefined
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
  };
}

// ─── Helper: Get Today's Date String ─────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

<<<<<<< HEAD

=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

// ══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════════

<<<<<<< HEAD
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username/EC.no and password required' });
    const user = await User.findOne({
      $or: [
        { username: String(username).trim() },
        { ecNo: String(username).trim() }
      ],
      password
    });
=======
// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const user = await User.findOne({ username, password });
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      ecNo: user.ecNo,
      branch: user.branch,
      branchName: user.branchName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
=======
// GET /api/me
app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.session.user);
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    const { username, password, role, ecNo, branch, branchName } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    
    if (ecNo) {
      const existingEc = await User.findOne({ ecNo: String(ecNo).trim() });
      if (existingEc) return res.status(400).json({ error: 'EC Number already exists' });
    }

    const user = await User.create({
      username,
      password,
      role: role || 'manager',
      ecNo: ecNo ? String(ecNo).trim() : undefined,
      branch: branch || undefined,
      branchName: branchName || undefined
    });
    res.json({ success: true, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id
app.put('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const { username, password, role, ecNo, branch, branchName } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If username is changing, ensure uniqueness
    const normalizedUsername = String(username || '').trim();
    if (normalizedUsername && normalizedUsername !== user.username) {
      const existing = await User.findOne({ username: normalizedUsername });
      if (existing) return res.status(400).json({ error: 'Username already exists' });
      user.username = normalizedUsername;
    }

    // If ecNo is changing, ensure uniqueness
    const normalizedEcNo = ecNo ? String(ecNo).trim() : undefined;
    if (normalizedEcNo && normalizedEcNo !== user.ecNo) {
      const existingEc = await User.findOne({ ecNo: normalizedEcNo });
      if (existingEc) return res.status(400).json({ error: 'EC Number already exists' });
      user.ecNo = normalizedEcNo;
    } else if (ecNo === '') {
      user.ecNo = undefined;
    }

    // Update password if provided
    if (password && String(password).trim()) {
      user.password = String(password).trim();
    }

    // Update role (prevent changing default admin role)
    if (user.username === 'admin') {
      user.role = 'admin'; // Keep admin as admin
    } else if (role) {
      user.role = role;
    }

    // Update branch/location
    user.branch = branch || undefined;
    user.branchName = branchName || undefined;

    await user.save();
=======
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const user = await User.create({ username, password, role: role || 'manager' });
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD







=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

// ══════════════════════════════════════════════════════════════════════════════
// VEHICLE LOG BOOK ROUTES
// ══════════════════════════════════════════════════════════════════════════════

<<<<<<< HEAD
// Helper to get the next sequential short name
async function getNextShortName() {
  const profiles = await VehicleProfile.find();
  let maxNum = 0;
  for (const p of profiles) {
    const match = p.shortName.match(/^v(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  return 'v' + (maxNum + 1);
}

// Helper to resequence short names matching v1, v2...
async function resequenceVehicleShortNames() {
  const profiles = await VehicleProfile.find().sort({ createdAt: 1 });
  const sequenceProfiles = [];
  for (const p of profiles) {
    if (/^v\d+$/.test(p.shortName)) {
      sequenceProfiles.push(p);
    }
  }

  // Rename to temporary names to avoid unique constraint violations
  for (let i = 0; i < sequenceProfiles.length; i++) {
    const p = sequenceProfiles[i];
    p.shortName = `_temp_seq_${i}_${Date.now()}`;
    await p.save();
  }

  // Rename to final sequential names v1, v2, v3...
  for (let i = 0; i < sequenceProfiles.length; i++) {
    const p = sequenceProfiles[i];
    p.shortName = `v${i + 1}`;
    await p.save();
  }
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
// GET /api/vehicles
app.get('/api/vehicles', requireVehicleModuleAccess, async (req, res) => {
  try {
    const profiles = await VehicleProfile.find().sort({ vehicleNumber: 1 });
<<<<<<< HEAD
=======
    const usedVehicles = await VehicleLog.distinct('vehicleNumber');
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    const known = new Set(profiles.map((p) => p.vehicleNumber));
    const merged = [
      ...profiles.map((p) => ({
        vehicleNumber: p.vehicleNumber,
<<<<<<< HEAD
        shortName: p.shortName || '',
        vehicleName: p.vehicleName || '',
        openingKm: p.openingKm,
        openingFuel: p.openingFuel,
        tankCapacity: p.tankCapacity || 0,
        expectedMileage: p.expectedMileage ?? null,
        status: p.status || 'active',
        branch: p.branch || undefined,
        branchName: p.branchName || '',
        ownershipType: p.ownershipType || 'own',
        isProfile: true
      })),
      ...DEFAULT_VEHICLES
        .filter((v) => !known.has(v))
        .map((v) => ({
          vehicleNumber: v,
          shortName: '',
          vehicleName: '',
          openingKm: 0,
          openingFuel: 0,
          tankCapacity: 0,
          expectedMileage: null,
          status: 'active',
          branch: undefined,
          branchName: '',
          ownershipType: 'own',
          isProfile: false
        }))
=======
        openingKm: p.openingKm,
        openingFuel: p.openingFuel,
        expectedMileage: p.expectedMileage ?? null
      })),
      ...Array.from(new Set([...DEFAULT_VEHICLES, ...usedVehicles.filter(Boolean)]))
        .filter((v) => !known.has(v))
        .map((v) => ({ vehicleNumber: v, openingKm: 0, openingFuel: 0, expectedMileage: null }))
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    ].sort((a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// GET /api/fuel-prices
app.get('/api/fuel-prices', requireVehicleModuleAccess, async (req, res) => {
  try {
    const prices = await FuelPrice.find();
    const result = {};
    prices.forEach(p => {
      result[p.fuelType] = p.pricePerLitre;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fuel-prices (Admin only)
app.post('/api/fuel-prices', requireAdmin, async (req, res) => {
  try {
    const { petrol, diesel } = req.body;
    if (petrol != null) {
      const petrolNum = Number(petrol);
      if (Number.isFinite(petrolNum) && petrolNum >= 0) {
        await FuelPrice.findOneAndUpdate({ fuelType: 'petrol' }, { pricePerLitre: petrolNum }, { upsert: true });
      }
    }
    if (diesel != null) {
      const dieselNum = Number(diesel);
      if (Number.isFinite(dieselNum) && dieselNum >= 0) {
        await FuelPrice.findOneAndUpdate({ fuelType: 'diesel' }, { pricePerLitre: dieselNum }, { upsert: true });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-profiles/next-shortname
app.get('/api/vehicle-profiles/next-shortname', requireAdmin, async (req, res) => {
  try {
    const nextName = await getNextShortName();
    res.json({ nextShortName: nextName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-profiles
app.post('/api/vehicle-profiles', requireAdmin, async (req, res) => {
  try {
    const { vehicleNumber, shortName, vehicleName, openingKm, tankCapacity, expectedMileage, status, branch, branchName, ownershipType } = req.body;
    const normalizedVehicle = String(vehicleNumber || '').trim().toUpperCase();
    if (!normalizedVehicle) return res.status(400).json({ error: 'Vehicle number is required' });

    let sName = String(shortName || '').trim();
    if (!sName) {
      sName = await getNextShortName();
    }

    const vName = String(vehicleName || '').trim();
    if (!vName) return res.status(400).json({ error: 'Vehicle name is required' });

    const km = Number(openingKm);
    const cap = Number(tankCapacity);
    const expMileage = expectedMileage == null || expectedMileage === '' ? null : Number(expectedMileage);

    if (!Number.isFinite(km) || km < 0) return res.status(400).json({ error: 'Opening KM must be zero or positive' });
    if (!Number.isFinite(cap) || cap < 0) return res.status(400).json({ error: 'Tank capacity must be zero or positive' });
    if (expMileage != null && (!Number.isFinite(expMileage) || expMileage <= 0)) {
      return res.status(400).json({ error: 'Expected mileage must be positive when provided' });
    }

    const state = status === 'inactive' ? 'inactive' : 'active';
    const ownType = ownershipType === 'rental' ? 'rental' : 'own';

=======
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
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    const profile = await VehicleProfile.findOneAndUpdate(
      { vehicleNumber: normalizedVehicle },
      {
        vehicleNumber: normalizedVehicle,
<<<<<<< HEAD
        shortName: sName,
        vehicleName: vName,
        openingKm: km,
        tankCapacity: cap,
        expectedMileage: expMileage,
        status: state,
        createdBy: req.session.user.username,
        branch: branch || undefined,
        branchName: branchName || undefined,
        ownershipType: ownType
=======
        openingKm: km,
        openingFuel: fuel,
        expectedMileage: expMileage,
        createdBy: req.session.user.username
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// DELETE /api/vehicle-profiles/:vehicleNumber
app.delete('/api/vehicle-profiles/:vehicleNumber', requireAdmin, async (req, res) => {
  try {
    const vehicleNumber = String(req.params.vehicleNumber || '').trim().toUpperCase();
    if (!vehicleNumber) return res.status(400).json({ error: 'Vehicle number is required' });

    const deleted = await VehicleProfile.findOneAndDelete({ vehicleNumber });
    if (!deleted) return res.status(404).json({ error: 'Vehicle profile not found' });

    // Resequence the shortNames of remaining vehicles
    await resequenceVehicleShortNames();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-expenses
app.post('/api/vehicle-expenses', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { vehicleNumber, expenseType, amount, date, description } = req.body;
    if (!vehicleNumber || !expenseType || amount == null || !date) {
      return res.status(400).json({ error: 'Vehicle number, expense type, amount, and date are required' });
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }
    const expense = await VehicleExpense.create({
      vehicleNumber: String(vehicleNumber).trim().toUpperCase(),
      expenseType,
      amount: parsedAmount,
      date: new Date(date),
      description: String(description || '').trim(),
      createdBy: req.session.user.username
    });
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-expenses
app.get('/api/vehicle-expenses', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    const filter = {};
    if (vehicleNumber) {
      filter.vehicleNumber = String(vehicleNumber).trim().toUpperCase();
    }
    const expenses = await VehicleExpense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE /api/vehicle-expenses/:id
app.delete('/api/vehicle-expenses/:id', requireVehicleModuleAccess, async (req, res) => {
  try {
    const deleted = await VehicleExpense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-expenses/:id/review (Manager/Admin)
app.post('/api/vehicle-expenses/:id/review', requireManagerOrAdmin, async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject', 'query', 'resolve'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
    const expense = await VehicleExpense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Vehicle expense not found' });
    
    if (action === 'reject') {
      if (!String(reason || '').trim()) return res.status(400).json({ error: 'Rejection reason is required' });
      expense.status = 'rejected';
      expense.rejectReason = String(reason).trim();
    } else if (action === 'approve') {
      expense.status = 'approved';
      expense.rejectReason = '';
    } else if (action === 'query') {
      if (!String(reason || '').trim()) return res.status(400).json({ error: 'Query question is required' });
      expense.status = 'queried';
      expense.queryQuestion = String(reason).trim();
      expense.queryAnswer = ''; // Reset answer if queried again
    } else if (action === 'resolve') {
      expense.status = 'approved';
    }

    expense.reviewedBy = req.session.user.username;
    expense.reviewedAt = new Date();
    await expense.save();
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-expenses/:id/answer
app.post('/api/vehicle-expenses/:id/answer', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!String(answer || '').trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }
    const expense = await VehicleExpense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Vehicle expense not found' });
    if (expense.status !== 'queried') {
      return res.status(400).json({ error: 'Expense is not in queried status' });
    }
    
    expense.status = 'answered';
    expense.queryAnswer = String(answer).trim();
    await expense.save();
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
app.post('/api/vehicle-logs', requireSecurity, async (req, res) => {
  try {
    const logData = await buildVehicleLogData(req.body);
    const { draftId } = req.body;

    const log = await VehicleLog.create({
      ...logData,
      status: 'approved',
=======
// POST /api/vehicle-logs (Security only)
app.post('/api/vehicle-logs', requireSecurity, async (req, res) => {
  try {
    const logData = await buildVehicleLogData(req.body);

    const log = await VehicleLog.create({
      ...logData,
      status: 'pending',
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
      createdBy: req.session.user.username,
      correctedFromLogId: logData.correctedFromLogId
    });

<<<<<<< HEAD
    await addEmergencyExpensesToLog(log);

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    if (logData.correctedFromLogId) {
      await VehicleLog.findOneAndUpdate(
        { _id: logData.correctedFromLogId, status: 'rejected', createdBy: req.session.user.username },
        { correctedByLogId: log._id }
      );
    }

<<<<<<< HEAD
    if (draftId) {
      await VehicleLogDraft.deleteOne({ _id: draftId, createdBy: req.session.user.username });
    }

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
      remainingFuel: req.body.remainingFuel == null || req.body.remainingFuel === '' ? 0 : Number(req.body.remainingFuel),
      fuelUsedInput: 0,
      fuelFillDate: null,
      mileageReason: '',
      correctedFromLogId: req.body.correctedFromLogId || undefined,
      fuelType: req.body.fuelType,
      pricePerLitre: req.body.pricePerLitre ? Number(req.body.pricePerLitre) : undefined,
      expenses: normalizeVehicleExpenses(req.body.expenses),
      branch: req.body.branch || undefined,
      branchName: req.body.branchName || undefined
=======
      remainingFuel: req.body.remainingFuel == null || req.body.remainingFuel === '' ? null : Number(req.body.remainingFuel),
      fuelUsedInput: req.body.fuelUsedInput == null || req.body.fuelUsedInput === '' ? null : Number(req.body.fuelUsedInput),
      fuelFillDate: req.body.fuelFillDate ? new Date(req.body.fuelFillDate) : undefined,
      mileageReason: String(req.body.mileageReason || '').trim(),
      correctedFromLogId: req.body.correctedFromLogId || undefined,
      expenses: normalizeVehicleExpenses(req.body.expenses)
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    };
    if (normalized.endKm != null && (!Number.isFinite(normalized.endKm) || normalized.endKm < 0)) {
      return res.status(400).json({ error: 'End KM must be zero or positive' });
    }
<<<<<<< HEAD
=======
    if (!Number.isFinite(normalized.fuelAdded) || normalized.fuelAdded < 0) {
      return res.status(400).json({ error: 'Fuel added must be zero or positive' });
    }
    if (normalized.remainingFuel != null && (!Number.isFinite(normalized.remainingFuel) || normalized.remainingFuel < 0)) {
      return res.status(400).json({ error: 'Remaining fuel must be zero or positive when provided' });
    }
    if (normalized.fuelUsedInput != null && (!Number.isFinite(normalized.fuelUsedInput) || normalized.fuelUsedInput < 0)) {
      return res.status(400).json({ error: 'Fuel used input must be zero or positive when provided' });
    }
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c

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
<<<<<<< HEAD
      status: 'approved',
      createdBy: req.session.user.username
    });
    await addEmergencyExpensesToLog(log);
=======
      status: 'pending',
      createdBy: req.session.user.username
    });
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    if (req.session.user.role === 'security') {
      const user = await User.findById(req.session.user.id);
      if (user && user.branch) {
        filter.branch = user.branch;
      } else {
        filter.createdBy = req.session.user.username;
      }
    }
=======
    if (req.session.user.role === 'security') filter.createdBy = req.session.user.username;
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    if (!['approve', 'reject', 'query', 'resolve'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
    const log = await VehicleLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Vehicle log not found' });
    
    if (action === 'reject') {
      if (!String(reason || '').trim()) return res.status(400).json({ error: 'Query reason is required' });
      log.status = 'rejected';
      log.rejectReason = String(reason).trim();
    } else if (action === 'approve') {
      log.status = 'approved';
      log.rejectReason = '';
    } else if (action === 'query') {
      if (!String(reason || '').trim()) return res.status(400).json({ error: 'Query question is required' });
      log.status = 'queried';
      log.queryQuestion = String(reason).trim();
      log.queryAnswer = ''; // Reset answer if queried again
    } else if (action === 'resolve') {
      log.status = 'approved';
    }

=======
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Action must be approve or reject' });
    const log = await VehicleLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Vehicle log not found' });
    if (log.status !== 'pending') return res.status(400).json({ error: 'Only pending logs can be reviewed' });
    if (action === 'reject' && !String(reason || '').trim()) return res.status(400).json({ error: 'Reject reason is required' });

    log.status = action === 'approve' ? 'approved' : 'rejected';
    log.rejectReason = action === 'reject' ? String(reason).trim() : '';
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    log.reviewedBy = req.session.user.username;
    log.reviewedAt = new Date();
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// POST /api/vehicle-logs/:id/answer
app.post('/api/vehicle-logs/:id/answer', requireVehicleModuleAccess, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!String(answer || '').trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }
    const log = await VehicleLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Vehicle log not found' });
    if (log.status !== 'queried') {
      return res.status(400).json({ error: 'Log is not in queried status' });
    }
    
    log.status = 'answered';
    log.queryAnswer = String(answer).trim();
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
// GET /api/vehicle-logs/reports
app.get('/api/vehicle-logs/reports', requireManagerOrAdmin, async (req, res) => {
  try {
    const approved = await VehicleLog.find({ status: 'approved' }).sort({ createdAt: -1 });
<<<<<<< HEAD
    const standaloneExpenses = await VehicleExpense.find();
    
=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD

    for (const exp of standaloneExpenses) {
      if (!grouped[exp.vehicleNumber]) {
        grouped[exp.vehicleNumber] = {
          vehicleNumber: exp.vehicleNumber,
          totalDistance: 0,
          totalFuelUsed: 0,
          totalExpenses: 0,
          avgMileage: null,
          lowFuelCount: 0,
          tripCount: 0
        };
      }
      grouped[exp.vehicleNumber].totalExpenses += Number(exp.amount) || 0;
    }

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    const pendingVehicleLogs = await VehicleLog.countDocuments({ status: { $in: ['queried', 'answered'] } });
=======
    const pendingVehicleLogs = await VehicleLog.countDocuments({ status: 'pending' });
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
// GET /api/scrap/products/:id (PUT)
=======
// PUT /api/scrap/products/:id (Admin only)
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
// ─── BRANCHES MASTER CRUD ────────────────────────────────────────────────────
// GET /api/branches
app.get('/api/branches', requireAuth, async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/branches (Admin only)
app.post('/api/branches', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Branch name is required' });
    const normalized = name.trim();
    const existing = await Branch.findOne({ name: { $regex: new RegExp(`^${normalized}$`, 'i') } });
    if (existing) return res.status(400).json({ error: 'Branch already exists' });
    
    const branch = await Branch.create({
      name: normalized,
      createdBy: req.session.user.username
    });
    res.json({ success: true, branch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/branches/:id (Admin only)
app.put('/api/branches/:id', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Branch name is required' });
    const normalized = name.trim();
    const existing = await Branch.findOne({ name: { $regex: new RegExp(`^${normalized}$`, 'i') }, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ error: 'Branch already exists' });
    
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    
    branch.name = normalized;
    await branch.save();
    res.json({ success: true, branch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/branches/:id (Admin only)
app.delete('/api/branches/:id', requireAdmin, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
// GET /api/scrap/entries
app.get('/api/scrap/entries', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    if (status) filter.status = status;
<<<<<<< HEAD
    if (req.session.user.role === 'security') {
      const user = await User.findById(req.session.user.id);
      if (user && user.branch) {
        filter.branch = user.branch;
      } else {
        filter.createdBy = req.session.user.username;
      }
    }
=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
    const { companyName, vehicleNumber, productId, weight, description } = req.body;
    const ownerName = req.body.ownerName || '—';
    let items = req.body.items;
    
    // Fallback for single product submission
    if (!items && productId && weight) {
      items = [{ productId, weight }];
    }
    
    if (!companyName || !vehicleNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Company Name, Vehicle Number, and at least one Product are required' });
    }
    
    const resolvedItems = [];
    let grandTotal = 0;
    
    for (const item of items) {
      const { productId: itemProductId, weight: itemWeight } = item;
      if (!itemProductId || itemWeight == null) {
        return res.status(400).json({ error: 'Each item must have a product and a weight' });
      }
      
      const w = Number(itemWeight);
      if (isNaN(w) || w <= 0) {
        return res.status(400).json({ error: 'Weight must be a positive number' });
      }
      
      const product = await ScrapProduct.findById(itemProductId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${itemProductId}` });
      }
      
      const itemTotal = Number((w * product.pricePerKg).toFixed(2));
      grandTotal += itemTotal;
      
      resolvedItems.push({
        product: product._id,
        productName: product.name,
        weight: w,
        pricePerKg: product.pricePerKg,
        totalAmount: itemTotal
      });
    }
    
    const firstItem = resolvedItems[0];
=======
    const { companyName, vehicleNumber, ownerName, productId, weight } = req.body;
    if (!companyName || !vehicleNumber || !ownerName || !productId || !weight) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const product = await ScrapProduct.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const w = Number(weight);
    if (w <= 0) return res.status(400).json({ error: 'Weight must be positive' });
    
    const totalAmount = Number((w * product.pricePerKg).toFixed(2));
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    
    const entry = await ScrapEntry.create({
      companyName,
      vehicleNumber,
      ownerName,
<<<<<<< HEAD
      product: firstItem.product,
      productName: firstItem.productName,
      weight: firstItem.weight,
      pricePerKg: firstItem.pricePerKg,
      items: resolvedItems,
      totalAmount: Number(grandTotal.toFixed(2)),
      description: String(description || '').trim(),
      createdBy: req.session.user.username,
      branch: req.body.branch || undefined,
      branchName: req.body.branchName || undefined,
      createdAt: req.body.dateTime ? new Date(req.body.dateTime) : new Date()
=======
      product: product._id,
      productName: product.name,
      weight: w,
      pricePerKg: product.pricePerKg,
      totalAmount,
      createdBy: req.session.user.username
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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
<<<<<<< HEAD
=======
app.get('/incharge', (req, res) => res.sendFile(path.join(__dirname, 'incharge.html')));
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
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

<<<<<<< HEAD
async function migrateScrapEntries() {
  try {
    const oldEntries = await ScrapEntry.find({
      $or: [
        { items: { $exists: false } },
        { items: { $size: 0 }, product: { $exists: true, $ne: null } }
      ]
    });
    let count = 0;
    for (const entry of oldEntries) {
      if (entry.product) {
        entry.items = [{
          product: entry.product,
          productName: entry.productName || 'Unknown Product',
          weight: entry.weight || 0,
          pricePerKg: entry.pricePerKg || 0,
          totalAmount: entry.totalAmount || 0
        }];
        await entry.save();
        count++;
      }
    }
    return count;
  } catch (err) {
    console.error('Error during scrap entries migration:', err);
    return 0;
  }
}

=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
const PORT = process.env.PORT || 3000;
async function bootstrap() {
  try {
    await connectDB();
    await seedAdmin();
<<<<<<< HEAD
    await seedFuelPrices();
    await seedBranches();
    
    const migrated = await migrateScrapEntries();
    if (migrated > 0) {
      console.log(`Migrated ${migrated} old scrap entries to the new multi-item schema.`);
    }
    
=======
>>>>>>> 1330d60a03ee2eb05d0a04d380cf246c54ceb98c
    app.listen(PORT, () => console.log(`Credit Debit System running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
}

bootstrap();
