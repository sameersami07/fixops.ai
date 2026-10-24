import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  equipmentId: { type: String },
  equipmentName: { type: String },
  equipmentCode: { type: String },
  type: {
    type: String,
    enum: ['TEMPERATURE', 'VIBRATION', 'PRESSURE', 'MAINTENANCE_DUE', 'ANOMALY', 'SYSTEM', 'OTHER'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  value: { type: Number },
  threshold: { type: Number },
  unit: { type: String },
  isRead: { type: Boolean, default: false },
  isAcknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: String },
  acknowledgedBy: { type: String },
  isDismissed: { type: Boolean, default: false },
}, { timestamps: true });

export const Alert = mongoose.model('Alert', alertSchema);
