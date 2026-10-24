import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, ClipboardList, Calendar, Bell,
  Bot, BarChart3, Settings, Gauge, LogOut, Menu, X,
  Zap, AlertTriangle, Sparkles
} from 'lucide-react';
import { cn, getInitials, getAvatarColor } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
  { path: '/equipment', icon: Wrench, label: 'Equipment', color: 'text-indigo-400' },
  { path: '/work-orders', icon: ClipboardList, label: 'Work Orders', color: 'text-violet-400' },
  { path: '/maintenance', icon: Calendar, label: 'Maintenance', color: 'text-purple-400' },
  { path: '/alerts', icon: Bell, label: 'Alerts', color: 'text-red-400' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Assistant', color: 'text-cyan-400', badge: 'AI' },
  { path: '/sensors', icon: Gauge, label: 'Sensor Monitor', color: 'text-teal-400' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-emerald-400' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'text-slate-400' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar, getUnreadAlertCount, getCriticalAlertCount } = useApp();
  const navigate = useNavigate();
  const unread = getUnreadAlertCount();
  const critical = getCriticalAlertCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-screen z-50 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-[72px]',
        'lg:relative lg:translate-x-0',
      )}
        style={{
          background: 'linear-gradient(180deg, #06091a 0%, #080d1f 50%, #050815 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}>
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
            <Zap className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="text-white font-bold text-sm leading-tight tracking-tight">FixOps AI</p>
              <div className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                <p className="text-blue-400 text-[10px] font-medium">Maintenance Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Critical Alert Banner */}
        {critical > 0 && sidebarOpen && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 animate-pulse" />
            <p className="text-red-300 text-xs font-medium">{critical} critical alert{critical > 1 ? 's' : ''}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, icon: Icon, label, color, badge }) => {
            const isAlerts = path === '/alerts';
            const isAI = path === '/ai-assistant';
            return (
              <NavLink
                key={path}
                to={path}
                title={!sidebarOpen ? label : undefined}
                className={({ isActive }) => cn('sidebar-nav-item', isActive && 'active')}
              >
                <div className="relative flex-shrink-0">
                  <Icon className={cn('w-[18px] h-[18px] transition-colors', color)} />
                  {isAlerts && unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-sm">{label}</span>
                    {isAlerts && unread > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {unread}
                      </span>
                    )}
                    {isAI && badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full text-cyan-300"
                        style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', getAvatarColor(user?.name || ''))}>
                {getInitials(user?.name || 'U')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-slate-400 text-[10px] capitalize">{user?.department} · {user?.role?.toLowerCase()}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10"
                title="Logout">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center p-2.5 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5"
              title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user } = useAuth();
  const { toggleSidebar } = useApp();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="font-semibold text-slate-700">{user?.name}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{user?.role}</span>
        </div>
      </div>
    </header>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
