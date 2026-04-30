const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'incharge', 'security'], default: 'manager' },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema (expenses + suspense)
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'expense', 'suspense'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      'pending',
      'approved',
      'rejected',
      'converted',
      'penalty',
      'active',
      'settlement_pending',
      'closed',
      'auto_penalty_applied',
      // Late return / penalty adjustment after settlement
      'partially_settled',
      'partially_cleared',
      'fully_cleared'
    ],
    default: 'pending'
  },
  // Suspense specific
  workerName: { type: String },
  reason: { type: String },
  arsBalance: { type: Number, default: 0 },
  suspenseHistory: {
    type: [{
      event: { type: String, required: true },
      by: { type: String, default: '' },
      at: { type: Date, default: Date.now },
      data: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],
    default: []
  },
  suspenseSettlement: {
    returnedAmount: { type: Number, default: 0 },
    expenseAmount: { type: Number, default: 0 },
    penaltyAmount: { type: Number, default: 0 },
    submittedAt: { type: Date },
    submittedBy: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
    reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'] }
  },
  lateClearance: {
    totalReturned: { type: Number, default: 0 },
    remainingPenalty: { type: Number, default: 0 },
    lastAdjustedAt: { type: Date },
    lastAdjustedBy: { type: String, default: '' }
  },
  suspenseSettlementStatus: {
    type: String,
    enum: ['pending_approval', 'active', 'settlement_pending', 'closed', 'auto_penalty_applied'],
    default: undefined
  },
  // Convert to expense tracking
  convertedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  isFromSuspense: { type: Boolean, default: false },
  originalSuspenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  suspenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  settlementComponent: {
    type: String,
    enum: ['settlement_expense', 'settlement_penalty', 'late_return_credit', 'late_return_expense'],
    default: undefined
  },
  // Penalty tracking
  penaltyApplied: { type: Boolean, default: false },
  penaltyAt: { type: Date },
  // Timestamps
  createdBy: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Daily Record Schema
const dailyRecordSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  openingBalance: { type: Number, required: true },
  openingArsBalance: { type: Number, default: 0 },
  closingBalance: { type: Number },
  closingArsBalance: { type: Number, default: 0 },
  isClosed: { type: Boolean, default: false },
  denomination: {
    fiveHundreds: { type: Number, default: 0 },
    twoHundreds: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    twenties: { type: Number, default: 0 },
    tens: { type: Number, default: 0 },
    fives: { type: Number, default: 0 },
    twos: { type: Number, default: 0 },
    ones: { type: Number, default: 0 }
  },
  closedBy: { type: String },
  closedAt: { type: Date }
});

const inventoryProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true },
  color: { type: String, trim: true },
  size: { type: String, trim: true },
  totalStock: { type: Number, required: true, min: 0 },
  availableStock: { type: Number, required: true, min: 0 },
  reservedStock: { type: Number, required: true, min: 0, default: 0 },
  minStock: { type: Number, required: true, min: 0, default: 30 },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

inventoryProductSchema.pre('save', function updateModified(next) {
  this.updatedAt = new Date();
  next();
});

const stockRequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryProduct', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  section: { type: String, enum: ['Mens', 'Womens', 'Kids'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'issued'], default: 'pending' },
  requestedBy: { type: String, required: true },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  issuedBy: { type: String },
  issuedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const stockMovementSchema = new mongoose.Schema({
  movementType: { type: String, enum: ['inbound', 'outbound'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryProduct', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  from: { type: String, required: true },
  to: { type: String, required: true },
  approvedBy: { type: String },
  createdBy: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const vehicleProfileSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  openingKm: { type: Number, required: true, min: 0, default: 0 },
  openingFuel: { type: Number, required: true, min: 0, default: 0 },
  expectedMileage: { type: Number, min: 0, default: null },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

vehicleProfileSchema.pre('save', function updateVehicleProfileModified(next) {
  this.updatedAt = new Date();
  next();
});

const vehicleExpenseSchema = new mongoose.Schema({
  expenseType: { type: String, enum: ['service', 'repair', 'oil', 'other'], required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  description: { type: String, trim: true, default: '' }
}, { _id: false });

const vehicleLogSchema = new mongoose.Schema({
  driverName: { type: String, required: true, trim: true },
  vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
  fromLocation: { type: String, required: true, trim: true },
  toLocation: { type: String, required: true, trim: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  startKm: { type: Number, required: true, min: 0 },
  endKm: { type: Number, required: true, min: 0 },
  distanceTravelled: { type: Number, required: true, min: 0 },
  availableFuel: { type: Number, required: true, min: 0 },
  fuelAdded: { type: Number, required: true, min: 0, default: 0 },
  remainingFuel: { type: Number, required: true, min: 0 },
  fuelFillDate: { type: Date },
  fuelUsed: { type: Number, required: true, min: 0 },
  mileage: { type: Number, default: null },
  mileageReason: { type: String, trim: true, default: '' },
  isLowFuel: { type: Boolean, default: false },
  expenses: { type: [vehicleExpenseSchema], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectReason: { type: String, trim: true, default: '' },
  createdBy: { type: String, required: true },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  correctedByLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' },
  correctedFromLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

vehicleLogSchema.pre('save', function updateVehicleModified(next) {
  this.updatedAt = new Date();
  next();
});

const vehicleLogDraftSchema = new mongoose.Schema({
  driverName: { type: String, trim: true, default: '' },
  vehicleNumber: { type: String, trim: true, uppercase: true, default: '' },
  fromLocation: { type: String, trim: true, default: '' },
  toLocation: { type: String, trim: true, default: '' },
  startDateTime: { type: Date },
  endDateTime: { type: Date },
  endKm: { type: Number, min: 0 },
  fuelAdded: { type: Number, min: 0, default: 0 },
  remainingFuel: { type: Number, min: 0, default: null },
  fuelUsedInput: { type: Number, min: 0, default: null },
  fuelFillDate: { type: Date },
  mileageReason: { type: String, trim: true, default: '' },
  correctedFromLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' },
  expenses: { type: [vehicleExpenseSchema], default: [] },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

vehicleLogDraftSchema.pre('save', function updateVehicleDraftModified(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const DailyRecord = mongoose.model('DailyRecord', dailyRecordSchema);
const InventoryProduct = mongoose.model('InventoryProduct', inventoryProductSchema);
const StockRequest = mongoose.model('StockRequest', stockRequestSchema);
const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
const VehicleProfile = mongoose.model('VehicleProfile', vehicleProfileSchema);
const VehicleLog = mongoose.model('VehicleLog', vehicleLogSchema);
const VehicleLogDraft = mongoose.model('VehicleLogDraft', vehicleLogDraftSchema);

module.exports = { User, Transaction, DailyRecord, InventoryProduct, StockRequest, StockMovement, VehicleProfile, VehicleLog, VehicleLogDraft };
