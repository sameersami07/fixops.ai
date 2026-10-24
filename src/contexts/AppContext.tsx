import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Equipment, WorkOrder, Alert, MaintenancePlan } from '../types';
import {
  EQUIPMENT as INIT_EQ, WORK_ORDERS as INIT_WO,
  ALERTS as INIT_ALERTS, MAINTENANCE_PLANS as INIT_MP
} from '../data/demoData';

interface AppState {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  alerts: Alert[];
  maintenancePlans: MaintenancePlan[];
  sidebarOpen: boolean;
  isDarkMode: boolean;
}

interface AppActions {
  addEquipment: (eq: Equipment) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addWorkOrder: (wo: WorkOrder) => void;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  acknowledgeAlert: (id: string, userId: string) => void;
  dismissAlert: (id: string) => void;
  markAlertRead: (id: string) => void;
  addAlert: (alert: Alert) => void;
  addMaintenancePlan: (plan: MaintenancePlan) => void;
  updateMaintenancePlan: (id: string, data: Partial<MaintenancePlan>) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  getUnreadAlertCount: () => number;
  getCriticalAlertCount: () => number;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(INIT_EQ);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INIT_WO);
  const [alerts, setAlerts] = useState<Alert[]>(INIT_ALERTS);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(INIT_MP);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const addEquipment = useCallback((eq: Equipment) => setEquipment(prev => [eq, ...prev]), []);
  const updateEquipment = useCallback((id: string, data: Partial<Equipment>) =>
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...data } : e)), []);
  const deleteEquipment = useCallback((id: string) =>
    setEquipment(prev => prev.filter(e => e.id !== id)), []);

  const addWorkOrder = useCallback((wo: WorkOrder) => setWorkOrders(prev => [wo, ...prev]), []);
  const updateWorkOrder = useCallback((id: string, data: Partial<WorkOrder>) =>
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, ...data } : w)), []);
  const deleteWorkOrder = useCallback((id: string) =>
    setWorkOrders(prev => prev.filter(w => w.id !== id)), []);

  const acknowledgeAlert = useCallback((id: string, userId: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a, isAcknowledged: true, isRead: true,
      acknowledgedAt: new Date().toISOString(), acknowledgedBy: userId
    } : a)), []);
  const dismissAlert = useCallback((id: string) =>
    setAlerts(prev => prev.filter(a => a.id !== id)), []);
  const markAlertRead = useCallback((id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a)), []);
  const addAlert = useCallback((alert: Alert) => setAlerts(prev => [alert, ...prev]), []);

  const addMaintenancePlan = useCallback((plan: MaintenancePlan) =>
    setMaintenancePlans(prev => [plan, ...prev]), []);
  const updateMaintenancePlan = useCallback((id: string, data: Partial<MaintenancePlan>) =>
    setMaintenancePlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p)), []);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const getUnreadAlertCount = useCallback(() => alerts.filter(a => !a.isRead).length, [alerts]);
  const getCriticalAlertCount = useCallback(() =>
    alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).length, [alerts]);

  return (
    <AppContext.Provider value={{
      equipment, workOrders, alerts, maintenancePlans, sidebarOpen, isDarkMode,
      addEquipment, updateEquipment, deleteEquipment,
      addWorkOrder, updateWorkOrder, deleteWorkOrder,
      acknowledgeAlert, dismissAlert, markAlertRead, addAlert,
      addMaintenancePlan, updateMaintenancePlan,
      toggleSidebar, toggleDarkMode,
      getUnreadAlertCount, getCriticalAlertCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
