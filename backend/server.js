import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { Equipment } from './models/Equipment.js';
import { WorkOrder } from './models/WorkOrder.js';
import { Alert } from './models/Alert.js';
import { MaintenancePlan } from './models/MaintenancePlan.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixops';
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const geminiConfigured = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here');

function isGeminiAuthenticationError(error) {
  const status = error?.status ?? error?.response?.status;
  const message = typeof error?.message === 'string' ? error.message : '';
  return status === 401
    || status === 403
    || /API key not valid|API_KEY_INVALID|ACCESS_TOKEN_TYPE_UNSUPPORTED|UNAUTHENTICATED/i.test(message)
    || (status === 400 && /(?:api[\s_-]*key|credential).*(?:invalid|not valid)|(?:invalid|not valid).*(?:api[\s_-]*key|credential)/i.test(message));
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Auth Middleware (strict) ────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Auth Middleware (optional — for AI endpoint) ─────────────────────────────
// Allows requests without a valid token; sets req.user to a guest object.
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // Invalid token — treat as guest, don't block
      req.user = { id: 'guest', name: 'Guest', role: 'VIEWER' };
    }
  } else {
    req.user = { id: 'guest', name: 'Guest', role: 'VIEWER' };
  }
  next();
}

// ─── DB Connect ───────────────────────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected:', MONGODB_URI);
    await seedDB();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Running without database - using in-memory fallback');
  }
}

// ─── Seed Initial Data ────────────────────────────────────────────────────────
async function seedDB() {
  const count = await User.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding initial data...');

  // Create default users
  const users = [
    { name: 'Sameer Ahmed', email: 'admin@fixops.ai', password: 'admin123', role: 'ADMIN', department: 'Engineering' },
    { name: 'Priya Sharma', email: 'priya@fixops.ai', password: 'manager123', role: 'MANAGER', department: 'Operations' },
    { name: 'Rahul Verma', email: 'rahul@fixops.ai', password: 'tech123', role: 'TECHNICIAN', department: 'Maintenance' },
  ];
  await User.insertMany(users.map(u => new User(u)));

  // Create sample equipment
  const equipmentData = [
    { code: 'CNC-001', name: 'CNC Milling Machine Alpha', category: 'Production', location: 'Shop Floor A', department: 'Manufacturing', manufacturer: 'Mazak', model: 'VARIAXIS i-700', serialNumber: 'MZK2024001', installDate: '2022-03-15', status: 'OPERATIONAL', healthScore: 87 },
    { code: 'HYD-002', name: 'Hydraulic Press Unit', category: 'Production', location: 'Press Shop', department: 'Manufacturing', manufacturer: 'Schuler', model: 'MSP-400', serialNumber: 'SCH2023002', installDate: '2021-07-20', status: 'MAINTENANCE', healthScore: 62 },
    { code: 'COM-003', name: 'Industrial Air Compressor', category: 'Utilities', location: 'Utility Block', department: 'Maintenance', manufacturer: 'Atlas Copco', model: 'GA-55', serialNumber: 'ATC2022003', installDate: '2020-11-05', status: 'OPERATIONAL', healthScore: 91 },
    { code: 'ROB-004', name: 'Welding Robot Arm', category: 'Automation', location: 'Assembly Line B', department: 'Manufacturing', manufacturer: 'FANUC', model: 'ARC Mate 120iD', serialNumber: 'FNC2024004', installDate: '2023-01-10', status: 'OPERATIONAL', healthScore: 95 },
    { code: 'CON-005', name: 'Conveyor System Main', category: 'Material Handling', location: 'Warehouse', department: 'Logistics', manufacturer: 'Hytrol', model: 'E24', serialNumber: 'HYT2021005', installDate: '2019-06-25', status: 'OFFLINE', healthScore: 45 },
    { code: 'GEN-006', name: 'Diesel Generator Set', category: 'Power', location: 'Power House', department: 'Maintenance', manufacturer: 'Cummins', model: 'C500D5', serialNumber: 'CMN2022006', installDate: '2020-08-15', status: 'OPERATIONAL', healthScore: 78 },
    { code: 'CHI-007', name: 'Industrial Chiller Unit', category: 'HVAC', location: 'Rooftop', department: 'Maintenance', manufacturer: 'Carrier', model: 'AquaForce 30XW', serialNumber: 'CAR2023007', installDate: '2021-03-20', status: 'OPERATIONAL', healthScore: 83 },
    { code: 'WLD-008', name: 'MIG Welding Station', category: 'Production', location: 'Fabrication Shop', department: 'Manufacturing', manufacturer: 'Lincoln Electric', model: 'Power Wave S350', serialNumber: 'LNC2022008', installDate: '2022-09-01', status: 'OPERATIONAL', healthScore: 89 },
    { code: 'PMP-009', name: 'Centrifugal Pump System', category: 'Utilities', location: 'Pump House', department: 'Maintenance', manufacturer: 'Grundfos', model: 'CM-25', serialNumber: 'GRF2021009', installDate: '2019-12-10', status: 'MAINTENANCE', healthScore: 55 },
    { code: 'TRN-010', name: 'CNC Lathe Machine', category: 'Production', location: 'Shop Floor B', department: 'Manufacturing', manufacturer: 'DMG Mori', model: 'NLX 2500', serialNumber: 'DMG2024010', installDate: '2023-05-15', status: 'OPERATIONAL', healthScore: 92 },
  ];
  await Equipment.insertMany(equipmentData);

  // Create sample alerts
  const eqList = await Equipment.find().limit(5);
  const alertsData = eqList.map((eq, i) => ({
    equipmentId: eq._id.toString(),
    equipmentName: eq.name,
    equipmentCode: eq.code,
    type: ['TEMPERATURE', 'VIBRATION', 'PRESSURE', 'MAINTENANCE_DUE', 'ANOMALY'][i],
    severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'HIGH'][i],
    title: ['Critical Temperature Alert', 'High Vibration Detected', 'Pressure Anomaly', 'Maintenance Due', 'Anomaly Detected'][i],
    message: [
      'Temperature exceeded 95°C threshold on bearing assembly',
      'Vibration levels 3x above normal - possible bearing wear',
      'Hydraulic pressure dropped below 180 PSI threshold',
      'Scheduled maintenance overdue by 5 days',
      'Abnormal power consumption detected - 40% above baseline',
    ][i],
    isRead: i > 2,
    isAcknowledged: i > 3,
  }));
  await Alert.insertMany(alertsData);

  // Create sample work orders
  const eqAll = await Equipment.find();
  const workOrdersData = [
    { title: 'Bearing Replacement - CNC Milling', description: 'Replace worn bearings on spindle assembly', equipmentCode: eqAll[0].code, equipmentName: eqAll[0].name, type: 'CORRECTIVE', priority: 'HIGH', status: 'IN_PROGRESS', assignedToName: 'Rahul Verma', estimatedDuration: 4, estimatedCost: 15000, scheduledDate: '2026-10-25' },
    { title: 'Hydraulic Oil Change', description: 'Scheduled hydraulic oil and filter replacement', equipmentCode: eqAll[1].code, equipmentName: eqAll[1].name, type: 'PREVENTIVE', priority: 'MEDIUM', status: 'OPEN', estimatedDuration: 2, estimatedCost: 8000, scheduledDate: '2026-10-28' },
    { title: 'Annual Compressor Inspection', description: 'Full inspection and tune-up of air compressor', equipmentCode: eqAll[2].code, equipmentName: eqAll[2].name, type: 'INSPECTION', priority: 'LOW', status: 'ASSIGNED', assignedToName: 'Priya Sharma', estimatedDuration: 6, estimatedCost: 12000, scheduledDate: '2026-11-01' },
    { title: 'Emergency Conveyor Repair', description: 'Belt snapped - immediate repair needed', equipmentCode: eqAll[4].code, equipmentName: eqAll[4].name, type: 'EMERGENCY', priority: 'CRITICAL', status: 'IN_PROGRESS', assignedToName: 'Rahul Verma', estimatedDuration: 8, estimatedCost: 25000, scheduledDate: '2026-10-24' },
    { title: 'Generator Load Testing', description: 'Monthly load test and fuel system check', equipmentCode: eqAll[5].code, equipmentName: eqAll[5].name, type: 'INSPECTION', priority: 'MEDIUM', status: 'COMPLETED', assignedToName: 'Rahul Verma', estimatedDuration: 3, actualDuration: 2.5, estimatedCost: 5000, actualCost: 4200, scheduledDate: '2026-10-20', completedDate: '2026-10-20' },
  ];
  await WorkOrder.insertMany(workOrdersData);

  // Create maintenance plans
  const maintenancePlansData = [
    { name: 'CNC Machine Monthly PM', equipmentCode: eqAll[0].code, equipmentName: eqAll[0].name, type: 'PREVENTIVE', frequency: 'MONTHLY', nextRun: '2026-11-01', estimatedDuration: 4, isActive: true },
    { name: 'Hydraulic Press Quarterly Service', equipmentCode: eqAll[1].code, equipmentName: eqAll[1].name, type: 'PREVENTIVE', frequency: 'QUARTERLY', nextRun: '2026-10-30', estimatedDuration: 8, isActive: true },
    { name: 'Compressor Weekly Inspection', equipmentCode: eqAll[2].code, equipmentName: eqAll[2].name, type: 'INSPECTION', frequency: 'WEEKLY', nextRun: '2026-10-28', estimatedDuration: 1, isActive: true },
    { name: 'Generator Monthly Test', equipmentCode: eqAll[5].code, equipmentName: eqAll[5].name, type: 'INSPECTION', frequency: 'MONTHLY', nextRun: '2026-11-05', estimatedDuration: 3, isActive: true },
  ];
  await MaintenancePlan.insertMany(maintenancePlansData);

  console.log('✅ Database seeded successfully!');
}

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo users fallback (when no MongoDB)
    const DEMO_USERS = {
      'admin@fixops.ai': { id: 'u1', name: 'Sameer Ahmed', email: 'admin@fixops.ai', role: 'ADMIN', department: 'Engineering', password: 'admin123' },
      'priya@fixops.ai': { id: 'u2', name: 'Priya Sharma', email: 'priya@fixops.ai', role: 'MANAGER', department: 'Operations', password: 'manager123' },
      'rahul@fixops.ai': { id: 'u3', name: 'Rahul Verma', email: 'rahul@fixops.ai', role: 'TECHNICIAN', department: 'Maintenance', password: 'tech123' },
    };

    let user = null;
    
    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findOne({ email: email.toLowerCase() });
      if (dbUser && await dbUser.comparePassword(password)) {
        user = { id: dbUser._id.toString(), name: dbUser.name, email: dbUser.email, role: dbUser.role, department: dbUser.department };
      }
    } else {
      // Fallback to demo users
      const demo = DEMO_USERS[email];
      if (demo && demo.password === password) {
        const { password: _, ...userWithoutPwd } = demo;
        user = userWithoutPwd;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ ...user }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { ...user, token } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EQUIPMENT ROUTES ─────────────────────────────────────────────────────────
app.get('/api/equipment', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ equipment: [], total: 0, message: 'DB not connected' });
    }
    const { search, status, category, page = 1, limit = 100 } = req.query;
    const query = {};
    if (search) query.$or = [{ name: /search/i }, { code: /search/i }];
    if (status) query.status = status;
    if (category) query.category = category;
    
    const equipment = await Equipment.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
    const total = await Equipment.countDocuments(query);
    res.json({ equipment, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/equipment/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const eq = await Equipment.findById(req.params.id);
    if (!eq) return res.status(404).json({ error: 'Equipment not found' });
    res.json(eq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipment', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const eq = new Equipment(req.body);
    await eq.save();
    res.status(201).json(eq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/equipment/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const eq = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!eq) return res.status(404).json({ error: 'Equipment not found' });
    res.json(eq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/equipment/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const eq = await Equipment.findByIdAndDelete(req.params.id);
    if (!eq) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── WORK ORDER ROUTES ────────────────────────────────────────────────────────
app.get('/api/work-orders', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ workOrders: [], total: 0 });
    const { status, priority, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    const workOrders = await WorkOrder.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    const total = await WorkOrder.countDocuments(query);
    res.json({ workOrders, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/work-orders', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const wo = new WorkOrder(req.body);
    await wo.save();
    res.status(201).json(wo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/work-orders/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const wo = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wo) return res.status(404).json({ error: 'Work order not found' });
    res.json(wo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/work-orders/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await WorkOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Work order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ALERTS ROUTES ────────────────────────────────────────────────────────────
app.get('/api/alerts', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ alerts: [], total: 0 });
    const { severity, isRead, limit = 100 } = req.query;
    const query = { isDismissed: false };
    if (severity) query.severity = severity;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    const total = await Alert.countDocuments(query);
    res.json({ alerts, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/alerts/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const alert = await Alert.findByIdAndUpdate(req.params.id, {
      isAcknowledged: true, isRead: true,
      acknowledgedAt: new Date().toISOString(), acknowledgedBy: req.user.name,
    }, { new: true });
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/alerts/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await Alert.findByIdAndUpdate(req.params.id, { isDismissed: true });
    res.json({ message: 'Alert dismissed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MAINTENANCE PLANS ROUTES ─────────────────────────────────────────────────
app.get('/api/maintenance-plans', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ plans: [], total: 0 });
    const plans = await MaintenancePlan.find().sort({ nextRun: 1 });
    res.json({ plans, total: plans.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenance-plans', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const plan = new MaintenancePlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/maintenance-plans/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const plan = await MaintenancePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── GOOGLE GEMINI AI ROUTE ───────────────────────────────────────────────────
// Uses optionalAuth so demo users (no JWT) can still use this endpoint
app.post('/api/ai/diagnose', optionalAuth, async (req, res) => {
  try {
    const { equipmentName, equipmentCode, equipmentCategory, problem, maintenanceHistory } = req.body;

    if (!geminiConfigured) {
      // Return demo response if no API key
      return res.json({
        response: JSON.stringify({
          possibleCauses: [
            'Worn or damaged bearings causing excessive friction',
            'Misalignment of rotating components',
            'Inadequate lubrication leading to overheating',
            'Loose fasteners or mounting hardware',
            'Electrical supply irregularities',
          ],
          inspectionSteps: [
            'Lockout/Tagout (LOTO) the equipment before any inspection',
            'Check and record all operating temperatures using infrared thermometer',
            'Inspect all bearings for wear, noise, and excessive heat',
            'Verify alignment of all rotating components with dial indicator',
            'Check lubrication levels and oil quality',
            'Inspect electrical connections and measure voltage/amperage',
            'Run vibration analysis with accelerometer if available',
          ],
          safetyConsiderations: [
            '⚠️ Always perform LOTO before physical inspection',
            '⚠️ Wear appropriate PPE: safety glasses, hearing protection, gloves',
            '⚠️ Allow equipment to cool before touching hot surfaces',
            '⚠️ Have fire extinguisher nearby when checking electrical components',
          ],
          estimatedDowntime: '4-8 hours',
          suggestedPriority: 'HIGH',
          recommendedParts: ['Deep groove ball bearings', 'Lubricant (ISO VG 68)', 'Coupling alignment kit', 'Electrical contact cleaner'],
          disclaimer: '⚠️ Demo Mode: Add your Gemini API key for real AI diagnostics. Follow all safety protocols.',
        }),
        isDemo: true,
      });
    }

    // Real Gemini AI response
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `You are an expert industrial equipment maintenance engineer AI assistant for FixOps AI platform.

Equipment Details:
- Name: ${equipmentName || 'Unknown Equipment'}
- Code: ${equipmentCode || 'N/A'}
- Category: ${equipmentCategory || 'General'}
- Recent Maintenance History: ${maintenanceHistory || 'No history available'}

Problem Description:
${problem}

Please provide a comprehensive maintenance diagnostic in the following JSON format only (no markdown, pure JSON):
{
  "possibleCauses": ["cause1", "cause2", "cause3"],
  "inspectionSteps": ["step1", "step2", "step3", "step4", "step5"],
  "safetyConsiderations": ["safety1", "safety2", "safety3"],
  "estimatedDowntime": "X-Y hours",
  "suggestedPriority": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendedParts": ["part1", "part2"],
  "maintenanceHistory": "Brief context about this type of issue",
  "disclaimer": "Brief professional disclaimer"
}

Be specific, practical, and safety-focused. Return ONLY valid JSON.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    const text = result.text?.trim();
    if (!text) throw new Error('Gemini returned an empty response');
    
    // Clean up response - remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    res.json({ response: cleanText, isDemo: false });
  } catch (err) {
    if (isGeminiAuthenticationError(err)) {
      console.error('Gemini rejected the configured API credential.');
      return res.status(502).json({
        error: 'Google rejected the Gemini API key. Use an API key created in Google AI Studio (not an OAuth/access token), update the server environment, and restart the backend.',
        code: 'GEMINI_API_KEY_INVALID',
      });
    }

    console.error('Gemini diagnostic request failed.', err?.status ? `Upstream status: ${err.status}` : '');
    return res.status(502).json({
      error: 'Gemini could not complete the diagnostic. Check the backend logs for details.',
      code: 'GEMINI_REQUEST_FAILED',
    });
  }
});

// ─── DASHBOARD STATS ROUTE ────────────────────────────────────────────────────
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ error: 'DB not connected', stats: {} });
    }
    const [totalEquipment, operationalEq, maintenanceEq, offlineEq, openWOs, completedWOs, unreadAlerts, criticalAlerts, upcomingMaintenance] = await Promise.all([
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'OPERATIONAL' }),
      Equipment.countDocuments({ status: 'MAINTENANCE' }),
      Equipment.countDocuments({ status: 'OFFLINE' }),
      WorkOrder.countDocuments({ status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } }),
      WorkOrder.countDocuments({ status: 'COMPLETED' }),
      Alert.countDocuments({ isRead: false, isDismissed: false }),
      Alert.countDocuments({ severity: 'CRITICAL', isAcknowledged: false, isDismissed: false }),
      MaintenancePlan.countDocuments({ isActive: true, nextRun: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() } }),
    ]);
    res.json({ totalEquipment, operationalEq, maintenanceEq, offlineEq, openWOs, completedWOs, unreadAlerts, criticalAlerts, upcomingMaintenance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai: geminiConfigured ? 'configured' : 'demo-mode',
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const server = app.listen(PORT);

server.on('error', async (err) => {
  if (err.code === 'EADDRINUSE') {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/api/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        const health = await response.json();
        if (health.status === 'ok') {
          console.log(`FixOps backend is already running on http://localhost:${PORT}; keeping the existing instance.`);
          return;
        }
      }
    } catch {
      // The port is occupied, but it is not responding as a FixOps backend.
    }

    console.error(`Backend could not start: port ${PORT} is already in use by another service.`);
  } else {
    console.error('Backend server failed to start:', err);
  }

  process.exitCode = 1;
});

server.on('listening', async () => {
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set; using a temporary secret. Existing login tokens will expire when the backend restarts.');
  }
  console.log(`\n🚀 FixOps Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Status: ${geminiConfigured ? '✅ Gemini AI configured' : '⚠️  Demo mode (add GEMINI_API_KEY)'}`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI}\n`);
  await connectDB();
});
