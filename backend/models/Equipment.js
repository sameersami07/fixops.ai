import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  department: { type: String, required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, unique: true },
  installDate: { type: String, required: true },
  lastMaintenanceDate: { type: String },
  nextMaintenanceDate: { type: String },
  status: {
    type: String,
    enum: ['OPERATIONAL', 'MAINTENANCE', 'OFFLINE', 'DECOMMISSIONED'],
    default: 'OPERATIONAL',
  },
  healthScore: { type: Number, min: 0, max: 100, default: 100 },
  specifications: { type: Map, of: String, default: {} },
  tags: [String],
  notes: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

export const Equipment = mongoose.model('Equipment', equipmentSchema);
