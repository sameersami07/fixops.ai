import type { AuthUser } from '../types';

// API Base URL - points to our Express backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
function getToken(): string | null {
  const user = localStorage.getItem('fixops_user');
  if (!user) return null;
  try {
    return JSON.parse(user).token || null;
  } catch {
    return null;
  }
}

// Base fetch with auth headers
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Equipment API ─────────────────────────────────────────────────────────────
export const equipmentApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<{ equipment: any[]; total: number }>(`/equipment${query}`);
  },
  getById: (id: string) => apiFetch<any>(`/equipment/${id}`),
  create: (data: any) => apiFetch<any>('/equipment', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/equipment/${id}`, { method: 'DELETE' }),
};

// ─── Work Orders API ───────────────────────────────────────────────────────────
export const workOrderApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<{ workOrders: any[]; total: number }>(`/work-orders${query}`);
  },
  create: (data: any) => apiFetch<any>('/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/work-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/work-orders/${id}`, { method: 'DELETE' }),
};

// ─── Alerts API ────────────────────────────────────────────────────────────────
export const alertApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<{ alerts: any[]; total: number }>(`/alerts${query}`);
  },
  acknowledge: (id: string) => apiFetch<any>(`/alerts/${id}/acknowledge`, { method: 'PUT' }),
  dismiss: (id: string) => apiFetch<any>(`/alerts/${id}`, { method: 'DELETE' }),
};

// ─── Maintenance Plans API ─────────────────────────────────────────────────────
export const maintenanceApi = {
  getAll: () => apiFetch<{ plans: any[]; total: number }>('/maintenance-plans'),
  create: (data: any) => apiFetch<any>('/maintenance-plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/maintenance-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── AI Diagnose API ───────────────────────────────────────────────────────────
export const aiApi = {
  diagnose: (data: {
    equipmentName?: string;
    equipmentCode?: string;
    equipmentCategory?: string;
    problem: string;
    maintenanceHistory?: string;
  }) => apiFetch<{ response: string; isDemo: boolean }>('/ai/diagnose', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ─── Dashboard Stats API ───────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiFetch<any>('/dashboard/stats'),
};

// ─── Health Check ──────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => apiFetch<{ status: string; database: string; ai: string }>('/health'),
};
