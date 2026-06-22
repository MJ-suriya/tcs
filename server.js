require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./db');
const { User, VehicleProfile, VehicleLog, VehicleLogDraft, ScrapProduct, ScrapEntry, VehicleExpense, FuelPrice, Branch, SystemSetting } = require('./models');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) {
    return password === storedPassword;
  }
  const [salt, hash] = storedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

const app = express();

app.use(express.json({ limit: '10mb' }));
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
    await User.create({ username: 'admin', password: hashPassword('1234'), role: 'admin' });
    console.log('Default admin created: admin / 1234');
  }
}

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
const requireSecurity = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'security')
    return res.status(403).json({ error: 'Security access required' });
  next();
};
const requirePettyCashierOrAdmin = (req, res, next) => {
  if (!req.session.user || !['pettycashier', 'admin'].includes(req.session.user.role))
    return res.status(403).json({ error: 'Petty Cashier or admin access required' });
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
  if (!normalizedVehicle) return { startKm: 0, availableFuel: 0, expectedMileage: null, tankCapacity: 0, previousFuelOdometer: 0, tripDistanceSum: 0, approxFuelUsed: 0 };
  const lastApproved = await VehicleLog.findOne({ vehicleNumber: normalizedVehicle, status: 'approved' }).sort({ endDateTime: -1, createdAt: -1 });
  const profile = await VehicleProfile.findOne({ vehicleNumber: normalizedVehicle });
  
  // Find previous fuel log to get its odometer reading
  const lastFuelLog = await VehicleLog.findOne({ vehicleNumber: normalizedVehicle, status: 'approved', fuelAdded: { $gt: 0 } }).sort({ startDateTime: -1, createdAt: -1 });
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
    };
  }
  return {
    startKm: Number(lastApproved.endKm) || 0,
    availableFuel: Number(lastApproved.remainingFuel) || 0,
    expectedMileage,
    tankCapacity: profile?.tankCapacity || 0,
    previousFuelOdometer,
    tripDistanceSum,
    approxFuelUsed
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
    fuelAdded, remainingFuel, correctedFromLogId, isFuelLog, fuelType, pricePerLitre
  } = payload;

  if (!driverName || !vehicleNumber || !fromLocation || !toLocation || !startDateTime) {
    const err = new Error('Driver, vehicle, locations, and date/time fields are required');
    err.statusCode = 400;
    throw err;
  }

  const baseline = await getVehicleBaseline(vehicleNumber);
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
      branch: payload.branch || profile?.branch || undefined,
      branchName: payload.branchName || profile?.branchName || undefined
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

  if (!Number.isFinite(parsedEndKm) || parsedEndKm < startKm) {
    const err = new Error(`End KM must be greater than or equal to start KM (${startKm})`);
    err.statusCode = 400;
    throw err;
  }

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
    fuelFillDate: null,
    fuelUsed,
    mileage,
    mileageReason: '',
    isLowFuel,
    fuelType,
    pricePerLitre: pricePerLitre ? Number(pricePerLitre) : undefined,
    expenses: normalizeVehicleExpenses(payload.expenses),
    correctedFromLogId: correctedFromLogId || undefined,
    branch: payload.branch || profile?.branch || undefined,
    branchName: payload.branchName || profile?.branchName || undefined
  };
}

// ─── Helper: Get Today's Date String ─────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}



// ══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════════

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username/EC.no and password required' });
    const user = await User.findOne({
      $or: [
        { username: String(username).trim() },
        { ecNo: String(username).trim() }
      ]
    });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Auto-upgrade plain-text passwords to hashed passwords on successful login
    if (!user.password.includes(':')) {
      user.password = hashPassword(password);
      await user.save();
    }
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
    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }
    user.password = hashPassword(newPassword);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      password: hashPassword(password),
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
      user.password = hashPassword(String(password).trim());
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
// VEHICLE LOG BOOK ROUTES
// ══════════════════════════════════════════════════════════════════════════════

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

// GET /api/vehicles
app.get('/api/vehicles', requireVehicleModuleAccess, async (req, res) => {
  try {
    const profiles = await VehicleProfile.find().sort({ vehicleNumber: 1 });
    const known = new Set(profiles.map((p) => p.vehicleNumber));
    const merged = [
      ...profiles.map((p) => ({
        vehicleNumber: p.vehicleNumber,
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
    ].sort((a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    const profile = await VehicleProfile.findOneAndUpdate(
      { vehicleNumber: normalizedVehicle },
      {
        vehicleNumber: normalizedVehicle,
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
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

async function copyEmergencyExpenses(log) {
  if (log.expenses && log.expenses.length > 0) {
    for (const exp of log.expenses) {
      if (!exp.description || !exp.description.startsWith('FUEL_ADDITION:')) {
        await VehicleExpense.create({
          vehicleNumber: log.vehicleNumber,
          expenseType: exp.expenseType,
          amount: exp.amount,
          date: exp.date || log.endDateTime || new Date(),
          description: exp.description || '',
          status: 'pending',
          createdBy: log.createdBy
        });
      }
    }
  }
}

app.post('/api/vehicle-logs', requireSecurity, async (req, res) => {
  try {
    const logData = await buildVehicleLogData(req.body);
    const { draftId } = req.body;

    const log = await VehicleLog.create({
      ...logData,
      status: 'approved',
      createdBy: req.session.user.username,
      correctedFromLogId: logData.correctedFromLogId
    });

    if (logData.correctedFromLogId) {
      await VehicleLog.findOneAndUpdate(
        { _id: logData.correctedFromLogId, status: 'rejected', createdBy: req.session.user.username },
        { correctedByLogId: log._id }
      );
    }

    if (draftId) {
      await VehicleLogDraft.deleteOne({ _id: draftId, createdBy: req.session.user.username });
    }

    await copyEmergencyExpenses(log);

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
    };
    if (normalized.endKm != null && (!Number.isFinite(normalized.endKm) || normalized.endKm < 0)) {
      return res.status(400).json({ error: 'End KM must be zero or positive' });
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
      status: 'approved',
      createdBy: req.session.user.username
    });
    if (logData.correctedFromLogId) {
      await VehicleLog.findOneAndUpdate(
        { _id: logData.correctedFromLogId, status: 'rejected', createdBy: req.session.user.username },
        { correctedByLogId: log._id }
      );
    }
    await VehicleLogDraft.deleteOne({ _id: draft._id });
    
    await copyEmergencyExpenses(log);

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
    if (req.session.user.role === 'security') {
      const user = await User.findById(req.session.user.id);
      if (user && user.branch) {
        filter.branch = user.branch;
      } else {
        filter.createdBy = req.session.user.username;
      }
    }
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

    log.reviewedBy = req.session.user.username;
    log.reviewedAt = new Date();
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// GET /api/vehicle-logs/reports
app.get('/api/vehicle-logs/reports', requireManagerOrAdmin, async (req, res) => {
  try {
    const approved = await VehicleLog.find({ status: 'approved' }).sort({ createdAt: -1 });
    const standaloneExpenses = await VehicleExpense.find();
    
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
    const pendingVehicleLogs = await VehicleLog.countDocuments({ status: { $in: ['queried', 'answered'] } });
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

// GET /api/scrap/products/:id (PUT)
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

// GET /api/scrap/entries
app.get('/api/scrap/entries', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.query;
    
    // Check if security is allowed to load scrap entries
    if (req.session.user.role === 'security') {
      const setting = await SystemSetting.findOne({ key: 'enableSecurityScrapEntry' });
      if (!setting || setting.value !== true) {
        return res.status(403).json({ error: 'Scrap module is currently disabled for security' });
      }
    }
    
    const filter = {};
    if (status) {
      if (status === 'pending') {
        if (req.session.user.role === 'pettycashier') {
          filter.status = { $in: ['pending_pettycashier', 'pending_manager', 'queried'] };
        } else if (['manager', 'admin'].includes(req.session.user.role)) {
          filter.status = { $in: ['pending_pettycashier', 'pending_manager', 'queried'] };
        } else if (req.session.user.role === 'security') {
          filter.status = { $in: ['pending_pettycashier', 'pending_manager', 'queried'] };
        } else {
          filter.status = 'pending_pettycashier';
        }
      } else {
        filter.status = status;
      }
    }if (['security', 'pettycashier'].includes(req.session.user.role)) {
      const user = await User.findById(req.session.user.id);
      if (user && user.branch) {
        filter.branch = user.branch;
      } else {
        filter.createdBy = req.session.user.username;
      }
    }
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

// POST /api/scrap/entries (Security / Petty Cashier)
app.post('/api/scrap/entries', requireAuth, async (req, res) => {
  try {
    const { companyName, vehicleNumber, productId, weight, description, proofDocument } = req.body;
    const ownerName = req.body.ownerName || '—';
    let items = req.body.items;
    
    // Check if security is allowed to create scrap entries
    if (req.session.user.role === 'security') {
      const setting = await SystemSetting.findOne({ key: 'enableSecurityScrapEntry' });
      if (!setting || setting.value !== true) {
        return res.status(403).json({ error: 'Scrap entry is currently disabled for security' });
      }
    }
    
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
    
    const isPetty = req.session.user.role === 'pettycashier';
    const entry = await ScrapEntry.create({
      companyName,
      vehicleNumber,
      ownerName,
      product: firstItem.product,
      productName: firstItem.productName,
      weight: firstItem.weight,
      pricePerKg: firstItem.pricePerKg,
      items: resolvedItems,
      totalAmount: Number(grandTotal.toFixed(2)),
      status: isPetty ? 'pending_manager' : 'pending_pettycashier',
      pettyCashierVerifiedAmount: isPetty ? Number(grandTotal.toFixed(2)) : undefined,
      proofDocument: isPetty ? proofDocument : undefined,
      description: String(description || '').trim(),
      createdBy: req.session.user.username,
      branch: req.body.branch || undefined,
      branchName: req.body.branchName || undefined,
      createdAt: req.body.dateTime ? new Date(req.body.dateTime) : new Date()
    });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/entries/:id/verify (Petty Cashier)
app.post('/api/scrap/entries/:id/verify', requirePettyCashierOrAdmin, async (req, res) => {
  try {
    const { verifiedAmount, proofDocument } = req.body;
    if (verifiedAmount == null) {
      return res.status(400).json({ error: 'Verified amount is required' });
    }
    
    const entry = await ScrapEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending_pettycashier') {
      return res.status(400).json({ error: 'Entry is not pending petty cashier verification' });
    }
    
    if (Number(verifiedAmount) !== entry.totalAmount) {
      return res.status(400).json({ error: 'Entered amount does not match the scrap entry total amount' });
    }
    
    entry.pettyCashierVerifiedAmount = Number(verifiedAmount);
    if (proofDocument) {
      entry.proofDocument = proofDocument;
    }
    entry.status = 'pending_manager';
    await entry.save();
    
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/entries/:id/query (Manager/Admin)
app.post('/api/scrap/entries/:id/query', requireManagerOrAdmin, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Query question is required' });
    }
    
    const entry = await ScrapEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'pending_manager') {
      return res.status(400).json({ error: 'Only pending manager entries can be queried' });
    }
    
    entry.status = 'queried';
    entry.queryQuestion = question.trim();
    entry.queryAnswer = '';
    await entry.save();
    
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scrap/entries/:id/answer (Petty Cashier)
app.post('/api/scrap/entries/:id/answer', requirePettyCashierOrAdmin, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }
    
    const entry = await ScrapEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.status !== 'queried') {
      return res.status(400).json({ error: 'Entry is not in queried status' });
    }
    
    entry.status = 'pending_manager';
    entry.queryAnswer = answer.trim();
    await entry.save();
    
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
    if (entry.status !== 'pending_manager') return res.status(400).json({ error: 'Only pending manager entries can be approved' });
    
    entry.status = 'approved';
    entry.reviewedBy = req.session.user.username;
    entry.reviewedByRole = req.session.user.role;
    entry.reviewedAt = new Date();
    await entry.save();
    
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
    if (entry.status !== 'pending_manager') return res.status(400).json({ error: 'Only pending manager entries can be rejected' });
    
    entry.status = 'rejected';
    entry.rejectReason = reason || '';
    entry.reviewedBy = req.session.user.username;
    entry.reviewedByRole = req.session.user.role;
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
    const role = req.session.user.role;
    const filter = {};
    
    // Apply branch filter if user is not admin
    if (role !== 'admin') {
      const user = await User.findById(req.session.user.id);
      if (user && user.branch) {
        filter.branch = user.branch;
      }
    }
    
    const totalEntries = await ScrapEntry.countDocuments(filter);
    
    let pendingFilter = { ...filter };
    if (role === 'pettycashier') {
      pendingFilter.status = { $in: ['pending_pettycashier', 'pending_manager', 'queried'] };
    } else if (['manager', 'admin'].includes(role)) {
      pendingFilter.status = { $in: ['pending_pettycashier', 'pending_manager', 'queried'] };
    } else {
      pendingFilter.status = 'pending_pettycashier';
    }
    
    const pendingApprovals = await ScrapEntry.countDocuments(pendingFilter);
    
    const approvedFilter = { ...filter, status: 'approved' };
    const approvedEntriesCount = await ScrapEntry.countDocuments(approvedFilter);
    
    const approvedEntries = await ScrapEntry.find(approvedFilter);
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

// GET /api/system-settings/:key
app.get('/api/system-settings/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    let setting = await SystemSetting.findOne({ key });
    if (!setting) {
      if (key === 'enableSecurityScrapEntry') {
        return res.json({ key, value: false });
      }
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/system-settings (Admin only)
app.post('/api/system-settings', requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(setting);
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
app.get('/security', (req, res) => res.sendFile(path.join(__dirname, 'security.html')));
app.get('/petty', (req, res) => res.sendFile(path.join(__dirname, 'petty.html')));

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
    
    // Migrate status 'pending' to 'pending_pettycashier'
    const result = await ScrapEntry.updateMany({ status: 'pending' }, { $set: { status: 'pending_pettycashier' } });
    if (result.modifiedCount > 0) {
      console.log(`Migrated ${result.modifiedCount} scrap entries from 'pending' to 'pending_pettycashier'.`);
    }
    
    return count;
  } catch (err) {
    console.error('Error during scrap entries migration:', err);
    return 0;
  }
}

const PORT = process.env.PORT || 3000;
async function bootstrap() {
  try {
    await connectDB();
    await seedAdmin();
    await seedFuelPrices();
    await seedBranches();
    
    const migrated = await migrateScrapEntries();
    if (migrated > 0) {
      console.log(`Migrated ${migrated} old scrap entries to the new multi-item schema.`);
    }
    
    app.listen(PORT, () => console.log(`Credit Debit System running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
}

bootstrap();
