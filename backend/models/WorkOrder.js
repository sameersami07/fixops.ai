import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  equipmentCode: { type: String },
  equipmentName: { type: String },
  type: {
    type: String,
    enum: ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'EMERGENCY', 'CALIBRATION'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  status: {
    type: String,
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    default: 'OPEN',
  },
  assignedToId: { type: String },
  assignedToName: { type: String },
  estimatedDuration: { type: Number }, // in hours
  actualDuration: { type: Number },
  scheduledDate: { type: String },
  completedDate: { type: String },
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  parts: [{ name: String, quantity: Number, cost: Number }],
  notes: { type: String, default: '' },
  checklistItems: [{ label: String, completed: Boolean }],
}, { timestamps: true });

export const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
