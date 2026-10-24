import type {
  Equipment, WorkOrder, MaintenancePlan, Alert, User,
  MaintenanceHistory, SensorReading, DashboardStats
} from '../types';

// ==================== USERS ====================
export const USERS: User[] = [
  { id: 'u1', name: 'Sameer Ahmed', email: 'admin@fixops.ai', role: 'ADMIN', department: 'Engineering', phone: '+91-9876543210', isActive: true, createdAt: '2024-01-15' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@fixops.ai', role: 'MANAGER', department: 'Operations', phone: '+91-9876543211', isActive: true, createdAt: '2024-02-01' },
  { id: 'u3', name: 'Rahul Verma', email: 'rahul@fixops.ai', role: 'TECHNICIAN', department: 'Maintenance', phone: '+91-9876543212', isActive: true, createdAt: '2024-02-15' },
  { id: 'u4', name: 'Anita Patel', email: 'anita@fixops.ai', role: 'TECHNICIAN', department: 'Maintenance', phone: '+91-9876543213', isActive: true, createdAt: '2024-03-01' },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram@fixops.ai', role: 'TECHNICIAN', department: 'Maintenance', phone: '+91-9876543214', isActive: true, createdAt: '2024-03-15' },
  { id: 'u6', name: 'Neha Joshi', email: 'neha@fixops.ai', role: 'VIEWER', department: 'Quality', phone: '+91-9876543215', isActive: true, createdAt: '2024-04-01' },
];

// ==================== EQUIPMENT ====================
export const EQUIPMENT: Equipment[] = [
  {
    id: 'eq1', name: 'CNC Milling Machine #1', code: 'CNC-001', category: 'Manufacturing',
    location: 'Workshop A - Bay 1', manufacturer: 'Haas Automation', model: 'VF-2SS',
    serialNumber: 'SN-2021-HA-001', installationDate: '2021-03-15', status: 'OPERATIONAL',
    lastMaintenance: '2026-09-20', nextMaintenance: '2026-11-20', temperatureThreshold: 75,
    vibrationThreshold: 5.0, currentTemperature: 62, currentVibration: 2.3,
    healthScore: 92, description: 'High-speed vertical machining center for precision parts.', maintenanceCount: 18, workOrderCount: 6, tags: ['CNC', 'Critical', 'Production']
  },
  {
    id: 'eq2', name: 'Hydraulic Press #2', code: 'HYD-002', category: 'Manufacturing',
    location: 'Workshop A - Bay 3', manufacturer: 'Enerpac', model: 'WPH-Series',
    serialNumber: 'SN-2020-EN-047', installationDate: '2020-06-10', status: 'MAINTENANCE',
    lastMaintenance: '2026-08-01', nextMaintenance: '2026-10-25', temperatureThreshold: 80,
    vibrationThreshold: 6.0, currentTemperature: 78, currentVibration: 5.8,
    healthScore: 58, description: 'Heavy-duty hydraulic press for metal forming operations.', maintenanceCount: 24, workOrderCount: 12, tags: ['Hydraulic', 'Press', 'High-Priority']
  },
  {
    id: 'eq3', name: 'Air Compressor Unit', code: 'AIR-003', category: 'Utilities',
    location: 'Utility Room B', manufacturer: 'Atlas Copco', model: 'GA-55',
    serialNumber: 'SN-2019-AC-112', installationDate: '2019-11-22', status: 'OPERATIONAL',
    lastMaintenance: '2026-10-01', nextMaintenance: '2026-12-01', temperatureThreshold: 70,
    vibrationThreshold: 4.0, currentTemperature: 58, currentVibration: 1.8,
    healthScore: 87, description: 'Industrial air compressor supplying compressed air to entire facility.', maintenanceCount: 30, workOrderCount: 8, tags: ['Utilities', 'Air-Supply']
  },
  {
    id: 'eq4', name: 'Cooling Tower System', code: 'COL-004', category: 'HVAC',
    location: 'Rooftop - North Wing', manufacturer: 'Baltimore Aircoil', model: 'FXT-400',
    serialNumber: 'SN-2022-BA-019', installationDate: '2022-01-08', status: 'OPERATIONAL',
    lastMaintenance: '2026-09-15', nextMaintenance: '2026-12-15', temperatureThreshold: 60,
    vibrationThreshold: 3.5, currentTemperature: 42, currentVibration: 1.2,
    healthScore: 96, description: 'Closed-loop cooling tower for process cooling applications.', maintenanceCount: 10, workOrderCount: 3, tags: ['HVAC', 'Cooling']
  },
  {
    id: 'eq5', name: 'Industrial Pump #5', code: 'PMP-005', category: 'Utilities',
    location: 'Pump House - West', manufacturer: 'Grundfos', model: 'CM-32-10',
    serialNumber: 'SN-2021-GF-203', installationDate: '2021-07-30', status: 'OFFLINE',
    lastMaintenance: '2026-07-10', nextMaintenance: '2026-10-10', temperatureThreshold: 65,
    vibrationThreshold: 4.5, currentTemperature: 0, currentVibration: 0,
    healthScore: 25, description: 'High-efficiency centrifugal pump for coolant circulation.', maintenanceCount: 15, workOrderCount: 9, tags: ['Pump', 'Offline', 'Critical']
  },
  {
    id: 'eq6', name: 'Conveyor Belt System', code: 'CVR-006', category: 'Material Handling',
    location: 'Assembly Line 2', manufacturer: 'Dorner', model: '2200-Series',
    serialNumber: 'SN-2023-DO-056', installationDate: '2023-04-12', status: 'OPERATIONAL',
    lastMaintenance: '2026-10-10', nextMaintenance: '2026-11-10', temperatureThreshold: 55,
    vibrationThreshold: 3.0, currentTemperature: 38, currentVibration: 1.5,
    healthScore: 91, description: '50-meter modular conveyor belt for finished goods transport.', maintenanceCount: 7, workOrderCount: 2, tags: ['Conveyor', 'Assembly']
  },
  {
    id: 'eq7', name: 'Welding Robot Arm', code: 'WLD-007', category: 'Robotics',
    location: 'Welding Cell - Bay 5', manufacturer: 'KUKA', model: 'KR-20 R1810',
    serialNumber: 'SN-2022-KK-088', installationDate: '2022-09-01', status: 'OPERATIONAL',
    lastMaintenance: '2026-10-05', nextMaintenance: '2027-01-05', temperatureThreshold: 80,
    vibrationThreshold: 7.0, currentTemperature: 55, currentVibration: 3.2,
    healthScore: 89, description: 'Articulated robot arm for MIG/TIG welding operations.', maintenanceCount: 12, workOrderCount: 4, tags: ['Robot', 'Welding', 'Automation']
  },
  {
    id: 'eq8', name: 'Electric Generator #8', code: 'GEN-008', category: 'Power',
    location: 'Generator Room', manufacturer: 'Caterpillar', model: 'C32-1000kW',
    serialNumber: 'SN-2020-CP-301', installationDate: '2020-02-20', status: 'IDLE',
    lastMaintenance: '2026-08-20', nextMaintenance: '2026-11-20', temperatureThreshold: 85,
    vibrationThreshold: 8.0, currentTemperature: 35, currentVibration: 0.5,
    healthScore: 78, description: 'Standby diesel generator for emergency power backup.', maintenanceCount: 20, workOrderCount: 5, tags: ['Generator', 'Power', 'Emergency']
  },
  {
    id: 'eq9', name: 'Lathe Machine #9', code: 'LTH-009', category: 'Manufacturing',
    location: 'Workshop B - Bay 2', manufacturer: 'DMG Mori', model: 'NLX-2500',
    serialNumber: 'SN-2021-DM-129', installationDate: '2021-11-18', status: 'OPERATIONAL',
    lastMaintenance: '2026-09-28', nextMaintenance: '2026-12-28', temperatureThreshold: 72,
    vibrationThreshold: 5.5, currentTemperature: 61, currentVibration: 2.8,
    healthScore: 85, description: 'CNC turning center for shaft and rotational part machining.', maintenanceCount: 14, workOrderCount: 5, tags: ['Lathe', 'CNC', 'Manufacturing']
  },
  {
    id: 'eq10', name: 'HVAC Unit - Zone C', code: 'HVC-010', category: 'HVAC',
    location: 'Building C - Roof', manufacturer: 'Carrier', model: '30XA-300',
    serialNumber: 'SN-2023-CA-045', installationDate: '2023-07-15', status: 'MAINTENANCE',
    lastMaintenance: '2026-09-01', nextMaintenance: '2026-10-28', temperatureThreshold: 45,
    vibrationThreshold: 2.5, currentTemperature: 48, currentVibration: 3.1,
    healthScore: 61, description: 'Central HVAC unit for climate control of Building C.', maintenanceCount: 6, workOrderCount: 3, tags: ['HVAC', 'Climate']
  },
];

// ==================== WORK ORDERS ====================
export const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1', title: 'Hydraulic system leak inspection', description: 'Investigate and repair hydraulic oil leak detected near cylinder rod seals on Hydraulic Press #2.',
    equipmentId: 'eq2', equipmentName: 'Hydraulic Press #2', equipmentCode: 'HYD-002',
    assignedTo: 'u3', assignedToName: 'Rahul Verma', status: 'IN_PROGRESS', priority: 'HIGH',
    createdBy: 'u2', createdAt: '2026-10-20T09:00:00Z', dueDate: '2026-10-25',
    estimatedHours: 6, actualHours: 3.5, type: 'CORRECTIVE', location: 'Workshop A - Bay 3',
    parts: ['O-Ring Set', 'Hydraulic Seal Kit', 'Hydraulic Oil 68'],
    comments: [
      { id: 'c1', text: 'Initial inspection revealed worn-out cylinder rod seals. Ordered replacement parts.', author: 'u3', authorName: 'Rahul Verma', createdAt: '2026-10-20T11:30:00Z' },
      { id: 'c2', text: 'Parts arrived. Will begin replacement tomorrow morning.', author: 'u3', authorName: 'Rahul Verma', createdAt: '2026-10-21T16:00:00Z' },
    ],
  },
  {
    id: 'wo2', title: 'CNC spindle bearing replacement', description: 'Replace worn spindle bearings on CNC Milling Machine #1 as per preventive schedule.',
    equipmentId: 'eq1', equipmentName: 'CNC Milling Machine #1', equipmentCode: 'CNC-001',
    assignedTo: 'u4', assignedToName: 'Anita Patel', status: 'ASSIGNED', priority: 'MEDIUM',
    createdBy: 'u1', createdAt: '2026-10-18T10:00:00Z', dueDate: '2026-10-30',
    estimatedHours: 8, type: 'PREVENTIVE', location: 'Workshop A - Bay 1',
    parts: ['Spindle Bearing SKF-7208', 'Bearing Grease', 'Locking Nut'],
    comments: [],
  },
  {
    id: 'wo3', title: 'Industrial pump #5 motor failure', description: 'Pump motor seized due to overheating. Requires motor replacement and root cause analysis.',
    equipmentId: 'eq5', equipmentName: 'Industrial Pump #5', equipmentCode: 'PMP-005',
    assignedTo: 'u5', assignedToName: 'Vikram Singh', status: 'OPEN', priority: 'CRITICAL',
    createdBy: 'u2', createdAt: '2026-10-22T08:00:00Z', dueDate: '2026-10-24',
    estimatedHours: 12, type: 'EMERGENCY', location: 'Pump House - West',
    parts: ['Electric Motor 7.5kW', 'Motor Coupling', 'Bearing Set'],
    comments: [
      { id: 'c3', text: 'Pump found completely seized at morning shift start. Production affected.', author: 'u2', authorName: 'Priya Sharma', createdAt: '2026-10-22T08:30:00Z' },
    ],
  },
  {
    id: 'wo4', title: 'HVAC filter replacement and coil cleaning', description: 'Monthly HVAC maintenance - replace air filters, clean evaporator coils, check refrigerant levels.',
    equipmentId: 'eq10', equipmentName: 'HVAC Unit - Zone C', equipmentCode: 'HVC-010',
    assignedTo: 'u3', assignedToName: 'Rahul Verma', status: 'OPEN', priority: 'MEDIUM',
    createdBy: 'u1', createdAt: '2026-10-15T14:00:00Z', dueDate: '2026-10-28',
    estimatedHours: 4, type: 'PREVENTIVE', location: 'Building C - Roof',
    parts: ['HEPA Filter 24x24', 'Coil Cleaner', 'Refrigerant R-410A'],
    comments: [],
  },
  {
    id: 'wo5', title: 'Generator monthly load test', description: 'Perform scheduled monthly load test and oil change on standby generator.',
    equipmentId: 'eq8', equipmentName: 'Electric Generator #8', equipmentCode: 'GEN-008',
    assignedTo: 'u4', assignedToName: 'Anita Patel', status: 'COMPLETED', priority: 'LOW',
    createdBy: 'u1', createdAt: '2026-10-01T09:00:00Z', dueDate: '2026-10-05',
    completedAt: '2026-10-04T15:30:00Z', estimatedHours: 3, actualHours: 2.5,
    type: 'PREVENTIVE', location: 'Generator Room', parts: ['Engine Oil 15W-40', 'Oil Filter'],
    completionNotes: 'Load test passed. Generator ran for 2 hours at 80% load without issues. Oil changed.',
    comments: [
      { id: 'c4', text: 'Test completed successfully. All parameters within normal range.', author: 'u4', authorName: 'Anita Patel', createdAt: '2026-10-04T15:30:00Z' },
    ],
  },
  {
    id: 'wo6', title: 'Conveyor belt tension adjustment', description: 'Adjust belt tension on conveyor system section 3-6, inspect rollers and lubricate bearings.',
    equipmentId: 'eq6', equipmentName: 'Conveyor Belt System', equipmentCode: 'CVR-006',
    assignedTo: 'u5', assignedToName: 'Vikram Singh', status: 'COMPLETED', priority: 'LOW',
    createdBy: 'u2', createdAt: '2026-10-08T11:00:00Z', dueDate: '2026-10-12',
    completedAt: '2026-10-11T14:00:00Z', estimatedHours: 2, actualHours: 2,
    type: 'PREVENTIVE', location: 'Assembly Line 2', parts: ['Belt Tension Tool', 'Multi-purpose Grease'],
    completionNotes: 'Belt tension adjusted. All rollers inspected and lubricated. No worn parts found.',
    comments: [],
  },
  {
    id: 'wo7', title: 'Air compressor valve inspection', description: 'Quarterly inspection of inlet/outlet valves and safety relief valves on air compressor.',
    equipmentId: 'eq3', equipmentName: 'Air Compressor Unit', equipmentCode: 'AIR-003',
    assignedTo: 'u3', assignedToName: 'Rahul Verma', status: 'COMPLETED', priority: 'MEDIUM',
    createdBy: 'u1', createdAt: '2026-09-28T10:00:00Z', dueDate: '2026-10-05',
    completedAt: '2026-10-03T16:00:00Z', estimatedHours: 3, actualHours: 3.5,
    type: 'INSPECTION', location: 'Utility Room B', parts: ['Valve Gasket Set', 'Teflon Tape'],
    completionNotes: 'All valves inspected. Safety relief valve set pressure verified. Minor gasket replaced on inlet valve.',
    comments: [],
  },
  {
    id: 'wo8', title: 'Welding robot calibration', description: 'Annual calibration and TCP (Tool Center Point) verification for welding robot arm.',
    equipmentId: 'eq7', equipmentName: 'Welding Robot Arm', equipmentCode: 'WLD-007',
    assignedTo: 'u4', assignedToName: 'Anita Patel', status: 'ASSIGNED', priority: 'HIGH',
    createdBy: 'u1', createdAt: '2026-10-19T09:00:00Z', dueDate: '2026-11-02',
    estimatedHours: 10, type: 'PREVENTIVE', location: 'Welding Cell - Bay 5',
    parts: ['Calibration Tool Set', 'TCP Calibration Sphere'],
    comments: [],
  },
];

// ==================== MAINTENANCE PLANS ====================
export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'mp1', name: 'CNC Monthly Lubrication', equipmentId: 'eq1', equipmentName: 'CNC Milling Machine #1',
    description: 'Monthly lubrication of all linear guides, ball screws, and spindle bearings.',
    frequency: 'MONTHLY', intervalDays: 30, lastRun: '2026-09-20', nextRun: '2026-10-20',
    isActive: true, estimatedDuration: 2, assignedTechnician: 'u3', assignedTechnicianName: 'Rahul Verma',
    checklist: ['Check lubricant levels', 'Lubricate all linear guides', 'Check ball screw preload', 'Inspect spindle for runout', 'Clean chip conveyor', 'Check coolant concentration'],
    createdAt: '2024-01-15',
  },
  {
    id: 'mp2', name: 'Hydraulic Press Quarterly Service', equipmentId: 'eq2', equipmentName: 'Hydraulic Press #2',
    description: 'Quarterly hydraulic system service including oil analysis and filter replacement.',
    frequency: 'QUARTERLY', intervalDays: 90, lastRun: '2026-08-01', nextRun: '2026-11-01',
    isActive: true, estimatedDuration: 5, assignedTechnician: 'u3', assignedTechnicianName: 'Rahul Verma',
    checklist: ['Sample hydraulic oil for analysis', 'Replace hydraulic oil filter', 'Check system pressure', 'Inspect cylinder seals', 'Verify pressure relief valve', 'Check all hydraulic fittings for leaks'],
    createdAt: '2024-02-01',
  },
  {
    id: 'mp3', name: 'Air Compressor Monthly Service', equipmentId: 'eq3', equipmentName: 'Air Compressor Unit',
    description: 'Monthly service including air/oil separator and filter element replacement.',
    frequency: 'MONTHLY', intervalDays: 30, lastRun: '2026-10-01', nextRun: '2026-11-01',
    isActive: true, estimatedDuration: 3, assignedTechnician: 'u4', assignedTechnicianName: 'Anita Patel',
    checklist: ['Replace intake air filter', 'Check oil level and quality', 'Drain condensate traps', 'Check belt tension', 'Verify safety relief valve', 'Log running hours'],
    createdAt: '2024-01-20',
  },
  {
    id: 'mp4', name: 'Generator Weekly Test Run', equipmentId: 'eq8', equipmentName: 'Electric Generator #8',
    description: 'Weekly test run and parameter logging for standby generator readiness.',
    frequency: 'WEEKLY', intervalDays: 7, lastRun: '2026-10-20', nextRun: '2026-10-27',
    isActive: true, estimatedDuration: 1, assignedTechnician: 'u5', assignedTechnicianName: 'Vikram Singh',
    checklist: ['Check fuel level', 'Check oil level', 'Run at no-load for 15 minutes', 'Log voltage and frequency', 'Check battery voltage', 'Inspect for leaks'],
    createdAt: '2024-03-01',
  },
  {
    id: 'mp5', name: 'Conveyor Belt Monthly Inspection', equipmentId: 'eq6', equipmentName: 'Conveyor Belt System',
    description: 'Monthly belt tension check, roller inspection, and lubrication.',
    frequency: 'MONTHLY', intervalDays: 30, lastRun: '2026-10-10', nextRun: '2026-11-10',
    isActive: true, estimatedDuration: 2, assignedTechnician: 'u5', assignedTechnicianName: 'Vikram Singh',
    checklist: ['Inspect belt for wear and damage', 'Check belt tension', 'Lubricate all roller bearings', 'Check drive sprockets', 'Inspect guards and covers', 'Test emergency stop'],
    createdAt: '2024-04-15',
  },
  {
    id: 'mp6', name: 'HVAC Quarterly Maintenance', equipmentId: 'eq10', equipmentName: 'HVAC Unit - Zone C',
    description: 'Quarterly deep cleaning and performance check of HVAC system.',
    frequency: 'QUARTERLY', intervalDays: 90, lastRun: '2026-09-01', nextRun: '2026-10-28',
    isActive: true, estimatedDuration: 4, assignedTechnician: 'u3', assignedTechnicianName: 'Rahul Verma',
    checklist: ['Replace air filters', 'Clean evaporator coils', 'Clean condenser coils', 'Check refrigerant pressure', 'Inspect electrical connections', 'Check and clean drain pan', 'Verify thermostat calibration'],
    createdAt: '2024-02-20',
  },
];

// ==================== ALERTS ====================
export const ALERTS: Alert[] = [
  {
    id: 'al1', title: 'Critical: Pump Motor Failure', message: 'Industrial Pump #5 motor has seized. Equipment is offline. Immediate attention required.',
    equipmentId: 'eq5', equipmentName: 'Industrial Pump #5', severity: 'CRITICAL',
    type: 'SENSOR_FAULT', isRead: false, isAcknowledged: false, createdAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'al2', title: 'High Temperature Warning', message: 'Hydraulic Press #2 temperature reading at 78°C - approaching 80°C threshold.',
    equipmentId: 'eq2', equipmentName: 'Hydraulic Press #2', severity: 'HIGH',
    type: 'TEMPERATURE', isRead: false, isAcknowledged: false, createdAt: '2026-10-22T10:30:00Z',
  },
  {
    id: 'al3', title: 'Vibration Anomaly Detected', message: 'Hydraulic Press #2 vibration levels at 5.8 mm/s - near 6.0 mm/s threshold.',
    equipmentId: 'eq2', equipmentName: 'Hydraulic Press #2', severity: 'HIGH',
    type: 'VIBRATION', isRead: false, isAcknowledged: false, createdAt: '2026-10-22T10:35:00Z',
  },
  {
    id: 'al4', title: 'Maintenance Due: CNC Machine #1', message: 'CNC Milling Machine #1 scheduled maintenance due in 28 days.',
    equipmentId: 'eq1', equipmentName: 'CNC Milling Machine #1', severity: 'LOW',
    type: 'MAINTENANCE_DUE', isRead: true, isAcknowledged: true, createdAt: '2026-10-22T09:00:00Z',
    acknowledgedAt: '2026-10-22T09:15:00Z', acknowledgedBy: 'u2',
  },
  {
    id: 'al5', title: 'HVAC Temperature Threshold Exceeded', message: 'HVAC Unit Zone C temperature sensor reading 48°C against 45°C threshold.',
    equipmentId: 'eq10', equipmentName: 'HVAC Unit - Zone C', severity: 'MEDIUM',
    type: 'TEMPERATURE', isRead: false, isAcknowledged: false, createdAt: '2026-10-21T14:20:00Z',
  },
  {
    id: 'al6', title: 'Work Order Overdue', message: 'Work order WO-003 for Industrial Pump #5 is now overdue. Equipment still offline.',
    equipmentId: 'eq5', equipmentName: 'Industrial Pump #5', severity: 'CRITICAL',
    type: 'WORK_ORDER', isRead: false, isAcknowledged: false, createdAt: '2026-10-23T08:00:00Z',
    workOrderId: 'wo3',
  },
  {
    id: 'al7', title: 'Preventive Maintenance Due: Generator', message: 'Electric Generator #8 is due for monthly maintenance on November 20, 2026.',
    equipmentId: 'eq8', equipmentName: 'Electric Generator #8', severity: 'LOW',
    type: 'MAINTENANCE_DUE', isRead: true, isAcknowledged: false, createdAt: '2026-10-20T08:00:00Z',
  },
  {
    id: 'al8', title: 'Sensor Fault: Cooling Tower', message: 'Intermittent sensor readings detected on Cooling Tower System vibration sensor.',
    equipmentId: 'eq4', equipmentName: 'Cooling Tower System', severity: 'MEDIUM',
    type: 'SENSOR_FAULT', isRead: false, isAcknowledged: false, createdAt: '2026-10-21T16:45:00Z',
  },
];

// ==================== MAINTENANCE HISTORY ====================
export const MAINTENANCE_HISTORY: MaintenanceHistory[] = [
  {
    id: 'mh1', equipmentId: 'eq1', equipmentName: 'CNC Milling Machine #1', workOrderId: 'wo2',
    type: 'Preventive', description: 'Monthly lubrication of all linear guides and ball screws.',
    performedBy: 'u3', performedByName: 'Rahul Verma', completedAt: '2026-09-20T15:00:00Z',
    duration: 2, cost: 1200, partsReplaced: ['Lubrication Oil'], notes: 'All guides lubricated. Slight wear noted on Y-axis guide - monitor closely.'
  },
  {
    id: 'mh2', equipmentId: 'eq3', equipmentName: 'Air Compressor Unit', workOrderId: 'wo7',
    type: 'Inspection', description: 'Quarterly valve inspection and filter replacement.',
    performedBy: 'u3', performedByName: 'Rahul Verma', completedAt: '2026-10-03T16:00:00Z',
    duration: 3.5, cost: 2400, partsReplaced: ['Air Filter', 'Oil Separator Element'], notes: 'Replaced intake filter and oil separator. Valves in good condition. Safety valve tested OK.'
  },
  {
    id: 'mh3', equipmentId: 'eq8', equipmentName: 'Electric Generator #8', workOrderId: 'wo5',
    type: 'Preventive', description: 'Monthly load test and oil change.',
    performedBy: 'u4', performedByName: 'Anita Patel', completedAt: '2026-10-04T15:30:00Z',
    duration: 2.5, cost: 3500, partsReplaced: ['Engine Oil', 'Oil Filter'], notes: 'Load test passed. 2-hour run at 80% load. All parameters normal.'
  },
  {
    id: 'mh4', equipmentId: 'eq6', equipmentName: 'Conveyor Belt System', workOrderId: 'wo6',
    type: 'Preventive', description: 'Belt tension adjustment and roller lubrication.',
    performedBy: 'u5', performedByName: 'Vikram Singh', completedAt: '2026-10-11T14:00:00Z',
    duration: 2, cost: 800, partsReplaced: ['Bearing Grease'], notes: 'Belt tension adjusted at three points. All 24 rollers lubricated and inspected.'
  },
  {
    id: 'mh5', equipmentId: 'eq4', equipmentName: 'Cooling Tower System',
    type: 'Preventive', description: 'Semi-annual cleaning and fan blade inspection.',
    performedBy: 'u4', performedByName: 'Anita Patel', completedAt: '2026-09-15T17:00:00Z',
    duration: 6, cost: 4200, partsReplaced: ['Fan Belt', 'Water Treatment Chemicals'], notes: 'Tower cleaned, fan blades inspected - no damage. Water treatment chemicals added.'
  },
];

// ==================== SENSOR HISTORY ====================
export const generateSensorHistory = (equipmentId: string, days: number = 7) => {
  const history = [];
  const now = new Date();
  const eq = EQUIPMENT.find(e => e.id === equipmentId);
  const baseTemp = eq?.currentTemperature || 55;
  const baseVib = eq?.currentVibration || 2.0;

  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    const variation = Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 5;
    const vibVariation = Math.sin(i * 0.2) * 1 + (Math.random() - 0.5) * 0.5;

    history.push({
      timestamp: timestamp.toISOString(),
      temperature: Math.max(20, Math.min(90, baseTemp + variation)),
      vibration: Math.max(0, Math.min(10, baseVib + vibVariation)),
      pressure: 4.2 + (Math.random() - 0.5) * 0.4,
      humidity: 45 + (Math.random() - 0.5) * 10,
    });
  }
  return history;
};

// ==================== DASHBOARD STATS ====================
export const DASHBOARD_STATS: DashboardStats = {
  totalEquipment: 10,
  operationalEquipment: 6,
  maintenanceRequired: 2,
  criticalAlerts: 3,
  openWorkOrders: 4,
  completedWorkOrders: 3,
  upcomingMaintenance: 5,
  totalCost: 285400,
};

// ==================== CHART DATA ====================
export const EQUIPMENT_HEALTH_CHART = [
  { name: 'Excellent (90-100)', value: 4, color: '#10b981' },
  { name: 'Good (70-89)', value: 3, color: '#3b82f6' },
  { name: 'Fair (50-69)', value: 2, color: '#f59e0b' },
  { name: 'Critical (<50)', value: 1, color: '#ef4444' },
];

export const WORK_ORDER_STATUS_CHART = [
  { name: 'Open', value: 2, color: '#6b7280' },
  { name: 'Assigned', value: 2, color: '#3b82f6' },
  { name: 'In Progress', value: 1, color: '#f59e0b' },
  { name: 'Completed', value: 3, color: '#10b981' },
  { name: 'Cancelled', value: 0, color: '#ef4444' },
];

export const MONTHLY_WORK_ORDERS = [
  { month: 'May', completed: 8, created: 10 },
  { month: 'Jun', completed: 12, created: 14 },
  { month: 'Jul', completed: 10, created: 11 },
  { month: 'Aug', completed: 15, created: 17 },
  { month: 'Sep', completed: 11, created: 13 },
  { month: 'Oct', completed: 7, created: 9 },
];

export const MAINTENANCE_COST_CHART = [
  { month: 'May', preventive: 28000, corrective: 12000, emergency: 5000 },
  { month: 'Jun', preventive: 32000, corrective: 8000, emergency: 0 },
  { month: 'Jul', preventive: 25000, corrective: 15000, emergency: 18000 },
  { month: 'Aug', preventive: 30000, corrective: 10000, emergency: 0 },
  { month: 'Sep', preventive: 35000, corrective: 7000, emergency: 8000 },
  { month: 'Oct', preventive: 22000, corrective: 11200, emergency: 0 },
];

export const RECENT_ACTIVITY = [
  { id: 1, type: 'alert', text: 'Critical alert: Pump #5 motor failure', time: '2 hours ago', color: 'red' },
  { id: 2, type: 'workorder', text: 'WO-003 created for emergency pump repair', time: '2 hours ago', color: 'orange' },
  { id: 3, type: 'maintenance', text: 'Conveyor belt maintenance completed by Vikram', time: '2 days ago', color: 'green' },
  { id: 4, type: 'workorder', text: 'WO-005 generator load test completed', time: '3 days ago', color: 'green' },
  { id: 5, type: 'alert', text: 'Hydraulic press temperature warning triggered', time: '5 hours ago', color: 'yellow' },
  { id: 6, type: 'maintenance', text: 'Air compressor valve inspection done', time: '20 days ago', color: 'green' },
];

// ==================== AI DEMO RESPONSES ====================
export const AI_DEMO_RESPONSES: Record<string, string> = {
  default: JSON.stringify({
    possibleCauses: [
      'Worn or damaged bearings causing mechanical friction and noise',
      'Misalignment of rotating components leading to vibration',
      'Insufficient lubrication resulting in heat buildup',
      'Cavitation in pump systems due to air entrainment',
      'Loose mechanical fasteners or mounting hardware',
    ],
    inspectionSteps: [
      'Perform visual inspection of all external components for damage or loose parts',
      'Use vibration analyzer to measure and log vibration levels at key points',
      'Check temperature at motor, bearings, and housing using IR thermometer',
      'Inspect all lubrication points and check oil/grease quality and quantity',
      'Listen for irregular sounds using a stethoscope at bearing locations',
      'Check alignment using precision alignment tools',
      'Review operating parameters (load, speed, pressure) against specifications',
    ],
    maintenanceHistory: 'Based on equipment records, last maintenance was performed 28 days ago. No anomalies were reported at that time.',
    suggestedPriority: 'HIGH',
    safetyConsiderations: [
      '⚠️ LOCKOUT/TAGOUT: Always isolate energy before inspection',
      '⚠️ Do not operate equipment beyond rated temperature thresholds',
      '⚠️ Use appropriate PPE: safety glasses, gloves, and hearing protection',
      '⚠️ Ensure proper ventilation when working on hot equipment',
      '⚠️ This analysis is advisory only — always consult a qualified technician',
    ],
    estimatedDowntime: '4-8 hours depending on root cause',
    recommendedParts: ['Bearing set', 'Lubrication supplies', 'Gasket kit'],
    disclaimer: '⚠️ DEMO MODE: This response is a simulated AI output for demonstration purposes. Not generated by a live AI model. Always consult qualified maintenance personnel for actual repairs.',
  }),
  pump: JSON.stringify({
    possibleCauses: [
      'Cavitation due to insufficient inlet pressure or air ingress',
      'Worn mechanical seal causing temperature rise',
      'Bearing failure from lack of lubrication or contaminated grease',
      'Impeller damage or blockage causing noise and vibration',
      'Motor overloading due to system head changes',
    ],
    inspectionSteps: [
      'Check suction pressure - ensure NPSH available exceeds NPSH required',
      'Listen for cavitation noise (crackling/rattling sound from pump casing)',
      'Measure pump discharge pressure and compare with pump curve',
      'Check motor current draw and compare with nameplate rating',
      'Inspect mechanical seal for leakage - visible water around seal area',
      'Check bearing temperature using IR gun at both bearing housings',
      'Verify coupling alignment using dial indicator',
    ],
    maintenanceHistory: 'Last maintenance: 107 days ago. Previous issue: impeller replaced due to cavitation damage.',
    suggestedPriority: 'CRITICAL',
    safetyConsiderations: [
      '⚠️ LOCKOUT/TAGOUT before any inspection or maintenance',
      '⚠️ Depressurize system before opening any flanges',
      '⚠️ Handle motor thermal overload - wait for cooling before contact',
      '⚠️ Pump may be handling hazardous fluids - check MSDS',
      '⚠️ This analysis is advisory only — consult a certified pump technician',
    ],
    estimatedDowntime: '8-24 hours',
    recommendedParts: ['Mechanical seal kit', 'Bearing set', 'Impeller (if damaged)'],
    disclaimer: '⚠️ DEMO MODE: Simulated response for demonstration. Not a real AI-generated analysis.',
  }),
};

// Credentials for demo
export const DEMO_CREDENTIALS = [
  { email: 'admin@fixops.ai', password: 'admin123', role: 'Admin' },
  { email: 'priya@fixops.ai', password: 'manager123', role: 'Manager' },
  { email: 'rahul@fixops.ai', password: 'tech123', role: 'Technician' },
];
