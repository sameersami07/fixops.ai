import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  EquipmentStatus, WorkOrderStatus, WorkOrderPriority, AlertSeverity, MaintenanceFrequency
} from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', options || { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function daysUntil(dateString: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function getEquipmentStatusConfig(status: EquipmentStatus) {
  const configs = {
    OPERATIONAL: { label: 'Operational', color: 'badge-green', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    MAINTENANCE: { label: 'In Maintenance', color: 'badge-yellow', dot: 'bg-amber-500', text: 'text-amber-700' },
    OFFLINE: { label: 'Offline', color: 'badge-red', dot: 'bg-red-500', text: 'text-red-700' },
    IDLE: { label: 'Idle', color: 'badge-gray', dot: 'bg-gray-400', text: 'text-gray-600' },
  };
  return configs[status] || configs.IDLE;
}

export function getWorkOrderStatusConfig(status: WorkOrderStatus) {
  const configs = {
    OPEN: { label: 'Open', color: 'badge-gray', icon: '○' },
    ASSIGNED: { label: 'Assigned', color: 'badge-blue', icon: '◎' },
    IN_PROGRESS: { label: 'In Progress', color: 'badge-yellow', icon: '◑' },
    COMPLETED: { label: 'Completed', color: 'badge-green', icon: '●' },
    CANCELLED: { label: 'Cancelled', color: 'badge-red', icon: '✕' },
  };
  return configs[status] || configs.OPEN;
}

export function getPriorityConfig(priority: WorkOrderPriority) {
  const configs = {
    LOW: { label: 'Low', color: 'badge-green', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    MEDIUM: { label: 'Medium', color: 'badge-blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    HIGH: { label: 'High', color: 'badge-orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    CRITICAL: { label: 'Critical', color: 'badge-red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  return configs[priority] || configs.LOW;
}

export function getAlertSeverityConfig(severity: AlertSeverity) {
  const configs = {
    LOW: { label: 'Low', color: 'badge-blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '🔵' },
    MEDIUM: { label: 'Medium', color: 'badge-yellow', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '🟡' },
    HIGH: { label: 'High', color: 'badge-orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '🟠' },
    CRITICAL: { label: 'Critical', color: 'badge-red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🔴' },
  };
  return configs[severity] || configs.LOW;
}

export function getHealthScoreConfig(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-500', bar: 'bg-emerald-500' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-500', bar: 'bg-blue-500' };
  if (score >= 50) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-500', bar: 'bg-amber-500' };
  return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-500', bar: 'bg-red-500' };
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function getFrequencyLabel(freq: MaintenanceFrequency): string {
  const labels: Record<MaintenanceFrequency, string> = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    ANNUAL: 'Annual',
  };
  return labels[freq];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function truncate(str: string, len: number = 60): string {
  return str.length > len ? str.substring(0, len) + '...' : str;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
