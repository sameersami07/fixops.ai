import mongoose from 'mongoose';

const maintenancePlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  equipmentId: { type: String },
  equipmentName: { type: String },
  equipmentCode: { type: String },
  type: {
    type: String,
    enum: ['PREVENTIVE', 'INSPECTION', 'CALIBRATION', 'LUBRICATION', 'CLEANING'],
    required: true,
  },
  frequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'],
    required: true,
  },
  lastRun: { type: String },
  nextRun: { type: String, required: true },
  assignedToId: { type: String },
  assignedToName: { type: String },
  estimatedDuration: { type: Number }, // hours
  estimatedCost: { type: Number },
  description: { type: String },
  checklistItems: [{ label: String, completed: Boolean }],
  isActive: { type: Boolean, default: true },
  completionCount: { type: Number, default: 0 },
}, { timestamps: true });

export const MaintenancePlan = mongoose.model('MaintenancePlan', maintenancePlanSchema);
