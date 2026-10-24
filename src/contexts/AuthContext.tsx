import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthUser } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users fallback (when backend is not running)
// NOTE: No fake tokens here — fake tokens break backend JWT verification.
// When token is absent, api.ts skips the Authorization header entirely.
const DEMO_USERS: Record<string, Omit<AuthUser, 'token'> & { password: string }> = {
  'admin@fixops.ai': {
    id: 'u1', name: 'Sameer Ahmed', email: 'admin@fixops.ai',
    role: 'ADMIN', department: 'Engineering', password: 'admin123',
  },
  'priya@fixops.ai': {
    id: 'u2', name: 'Priya Sharma', email: 'priya@fixops.ai',
    role: 'MANAGER', department: 'Operations', password: 'manager123',
  },
  'rahul@fixops.ai': {
    id: 'u3', name: 'Rahul Verma', email: 'rahul@fixops.ai',
    role: 'TECHNICIAN', department: 'Maintenance', password: 'tech123',
  },
};

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.email === 'string'
    && typeof candidate.role === 'string'
    && ['ADMIN', 'TECHNICIAN', 'MANAGER', 'VIEWER'].includes(candidate.role)
    && typeof candidate.department === 'string'
    && (candidate.token === undefined || typeof candidate.token === 'string');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('fixops_user');
    if (!stored) return null;

    try {
      const parsed: unknown = JSON.parse(stored);
      if (isAuthUser(parsed)) return parsed;
    } catch {
      console.warn('Saved user session is invalid; clearing it.');
    }

    localStorage.removeItem('fixops_user');
    return null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Try backend first
    try {
      const result = await authApi.login(email, password);
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('fixops_user', JSON.stringify(result.user));
        return true;
      }
    } catch (backendErr) {
      // Backend not available - fall back to demo users
      console.warn('Backend unavailable, using demo login:', (backendErr as Error).message);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const demoUser = DEMO_USERS[email];
      if (demoUser && demoUser.password === password) {
        const { password: _, ...userWithoutPwd } = demoUser;
        setUser(userWithoutPwd);
        localStorage.setItem('fixops_user', JSON.stringify(userWithoutPwd));
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('fixops_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
