const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'incharge', 'security', 'pettycashier'], default: 'manager' },
  ecNo: { type: String, unique: true, sparse: true, trim: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  branchName: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const vehicleProfileSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  shortName: { type: String, required: true, unique: true, trim: true },
  vehicleName: { type: String, required: true, trim: true },
  openingKm: { type: Number, required: true, min: 0, default: 0 },
  openingFuel: { type: Number, required: true, min: 0, default: 0 },
  tankCapacity: { type: Number, required: true, min: 0, default: 0 },
  expectedMileage: { type: Number, min: 0, default: null },
  ownershipType: { type: String, enum: ['own', 'rental'], default: 'own' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: String },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  branchName: { type: String, trim: true },
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
  fuelType: { type: String, enum: ['petrol', 'diesel'] },
  pricePerLitre: { type: Number },
  expenses: { type: [vehicleExpenseSchema], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'queried', 'answered'], default: 'pending' },
  rejectReason: { type: String, trim: true, default: '' },
  queryQuestion: { type: String, trim: true, default: '' },
  queryAnswer: { type: String, trim: true, default: '' },
  createdBy: { type: String, required: true },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  correctedByLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' },
  correctedFromLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  branchName: { type: String, trim: true },
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
  fuelType: { type: String, enum: ['petrol', 'diesel'] },
  expenses: { type: [vehicleExpenseSchema], default: [] },
  createdBy: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  branchName: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

vehicleLogDraftSchema.pre('save', function updateVehicleDraftModified(next) {
  this.updatedAt = new Date();
  next();
});

const fuelPriceSchema = new mongoose.Schema({
  fuelType: { type: String, enum: ['petrol', 'diesel'], required: true, unique: true },
  pricePerLitre: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

fuelPriceSchema.pre('save', function updateFuelPriceModified(next) {
  this.updatedAt = new Date();
  next();
});


const scrapProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  pricePerKg: { type: Number, required: true, min: 0 },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

scrapProductSchema.pre('save', function updateScrapProductModified(next) {
  this.updatedAt = new Date();
  next();
});

const scrapItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapProduct', required: true },
  productName: { type: String, required: true },
  weight: { type: Number, required: true, min: 0 },
  pricePerKg: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 }
}, { _id: false });

const scrapEntrySchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
  ownerName: { type: String, required: true, trim: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapProduct' },
  productName: { type: String },
  weight: { type: Number },
  pricePerKg: { type: Number },
  items: { type: [scrapItemSchema], default: [] },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending_pettycashier', 'pending_manager', 'approved', 'rejected', 'queried'], default: 'pending_pettycashier' },
  rejectReason: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  createdBy: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  branchName: { type: String, trim: true },
  reviewedBy: { type: String },
  reviewedByRole: { type: String, default: '' },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  pettyCashierVerifiedAmount: { type: Number },
  proofDocument: { type: String },
  queryQuestion: { type: String, trim: true, default: '' },
  queryAnswer: { type: String, trim: true, default: '' }
});

scrapEntrySchema.pre('save', function updateScrapEntryModified(next) {
  this.updatedAt = new Date();
  next();
});

const vehicleExpenseStandaloneSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
  expenseType: { type: String, enum: ['service', 'repair', 'oil', 'other'], required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  description: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'queried', 'answered'], default: 'pending' },
  rejectReason: { type: String, trim: true, default: '' },
  queryQuestion: { type: String, trim: true, default: '' },
  queryAnswer: { type: String, trim: true, default: '' },
  createdBy: { type: String, required: true },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

branchSchema.pre('save', function updateBranchModified(next) {
  this.updatedAt = new Date();
  next();
});

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const VehicleProfile = mongoose.model('VehicleProfile', vehicleProfileSchema);
const VehicleLog = mongoose.model('VehicleLog', vehicleLogSchema);
const VehicleLogDraft = mongoose.model('VehicleLogDraft', vehicleLogDraftSchema);
const ScrapProduct = mongoose.model('ScrapProduct', scrapProductSchema);
const ScrapEntry = mongoose.model('ScrapEntry', scrapEntrySchema);
const VehicleExpense = mongoose.model('VehicleExpense', vehicleExpenseStandaloneSchema);
const FuelPrice = mongoose.model('FuelPrice', fuelPriceSchema);
const Branch = mongoose.model('Branch', branchSchema);
const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

module.exports = { User, VehicleProfile, VehicleLog, VehicleLogDraft, ScrapProduct, ScrapEntry, VehicleExpense, FuelPrice, Branch, SystemSetting };

