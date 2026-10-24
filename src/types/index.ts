// ==================== Types ====================

export type EquipmentStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'OFFLINE' | 'IDLE';
export type WorkOrderStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type SensorType = 'TEMPERATURE' | 'VIBRATION' | 'PRESSURE' | 'HUMIDITY' | 'CURRENT';
export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'MANAGER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: EquipmentStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  temperatureThreshold: number;
  vibrationThreshold: number;
  currentTemperature: number;
  currentVibration: number;
  healthScore: number;
  imageUrl?: string;
  description: string;
  maintenanceCount: number;
  workOrderCount: number;
  tags: string[];
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  assignedTo: string;
  assignedToName: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  comments: WorkOrderComment[];
  completionNotes?: string;
  type: 'CORRECTIVE' | 'PREVENTIVE' | 'EMERGENCY' | 'INSPECTION';
  location: string;
  parts?: string[];
  cost?: number;
}

export interface WorkOrderComment {
  id: string;
  text: string;
  author: string;
  authorName: string;
  createdAt: string;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  equipmentId: string;
  equipmentName: string;
  description: string;
  frequency: MaintenanceFrequency;
  intervalDays: number;
  lastRun?: string;
  nextRun: string;
  isActive: boolean;
  estimatedDuration: number;
  assignedTechnician: string;
  assignedTechnicianName: string;
  checklist: string[];
  createdAt: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  equipmentId: string;
  equipmentName: string;
  severity: AlertSeverity;
  type: 'TEMPERATURE' | 'VIBRATION' | 'MAINTENANCE_DUE' | 'SENSOR_FAULT' | 'SYSTEM' | 'WORK_ORDER';
  isRead: boolean;
  isAcknowledged: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  workOrderId?: string;
}

export interface SensorReading {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: SensorType;
  value: number;
  unit: string;
  threshold: number;
  isNormal: boolean;
  timestamp: string;
}

export interface SensorHistory {
  timestamp: string;
  temperature: number;
  vibration: number;
  pressure?: number;
  humidity?: number;
}

export interface MaintenanceHistory {
  id: string;
  equipmentId: string;
  equipmentName: string;
  workOrderId?: string;
  type: string;
  description: string;
  performedBy: string;
  performedByName: string;
  completedAt: string;
  duration: number;
  cost: number;
  partsReplaced: string[];
  notes: string;
}

export interface DashboardStats {
  totalEquipment: number;
  operationalEquipment: number;
  maintenanceRequired: number;
  criticalAlerts: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  upcomingMaintenance: number;
  totalCost: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  token?: string;
}
