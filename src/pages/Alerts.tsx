import React, { useState, useMemo } from 'react';
import { Bell, Check, AlertTriangle, X, ClipboardList, Filter } from 'lucide-react';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, Tabs, EmptyState, SearchInput } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { getAlertSeverityConfig, timeAgo } from '../utils';
import type { AlertSeverity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Alert } from '../types';

const ALERT_TYPE_ICONS: Record<string, string> = {
  TEMPERATURE: '🌡️', VIBRATION: '📳', MAINTENANCE_DUE: '🔧',
  SENSOR_FAULT: '⚠️', SYSTEM: '🖥️', WORK_ORDER: '📋',
};

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, dismissAlert, markAlertRead, addWorkOrder, equipment } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('');

  const tabs = [
    { id: 'ALL', label: 'All', count: alerts.length },
    { id: 'UNREAD', label: 'Unread', count: alerts.filter(a => !a.isRead).length },
    { id: 'ACKNOWLEDGED', label: 'Acknowledged', count: alerts.filter(a => a.isAcknowledged).length },
    { id: 'UNACKNOWLEDGED', label: 'Active', count: alerts.filter(a => !a.isAcknowledged).length },
  ];

  const filtered = useMemo(() => alerts.filter(alert => {
    const q = search.toLowerCase();
    const matchSearch = !q || alert.title.toLowerCase().includes(q) || alert.message.toLowerCase().includes(q) || alert.equipmentName.toLowerCase().includes(q);
    const matchTab = activeTab === 'ALL' ||
      (activeTab === 'UNREAD' && !alert.isRead) ||
      (activeTab === 'ACKNOWLEDGED' && alert.isAcknowledged) ||
      (activeTab === 'UNACKNOWLEDGED' && !alert.isAcknowledged);
    const matchSeverity = !filterSeverity || alert.severity === filterSeverity;
    return matchSearch && matchTab && matchSeverity;
  }), [alerts, search, activeTab, filterSeverity]);

  const handleAcknowledge = (id: string) => acknowledgeAlert(id, user?.id || 'u1');
  const handleDismiss = (id: string) => {
    if (window.confirm('Remove this alert?')) dismissAlert(id);
  };

  const handleMarkAllRead = () => alerts.forEach(a => markAlertRead(a.id));

  const handleCreateWO = (alert: Alert) => {
    const eq = equipment.find(e => e.id === alert.equipmentId);
    navigate('/work-orders');
  };

  const SEVERITIES: AlertSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <Layout>
      <Header
        title="Alerts"
        subtitle={`${alerts.filter(a => !a.isRead).length} unread, ${alerts.filter(a => !a.isAcknowledged).length} unacknowledged`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleMarkAllRead} size="sm">Mark All Read</Button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* Critical Alerts Banner */}
        {alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg flex-shrink-0 animate-pulse-slow">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900">
                {alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).length} Critical Alert{alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).length > 1 ? 's' : ''} Require Immediate Attention
              </p>
              <p className="text-xs text-red-700 mt-0.5">Scroll down to review and acknowledge critical equipment alerts</p>
            </div>
          </div>
        )}

        {/* Severity Filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterSeverity('')} className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${!filterSeverity ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>All Severities</button>
          {SEVERITIES.map(s => {
            const cfg = getAlertSeverityConfig(s);
            return (
              <button key={s} onClick={() => setFilterSeverity(filterSeverity === s ? '' : s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${filterSeverity === s ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white text-slate-500 border-slate-200'}`}>
                {cfg.icon} {cfg.label} ({alerts.filter(a => a.severity === s).length})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="flex-1" />
          <SearchInput value={search} onChange={setSearch} placeholder="Search alerts..." className="w-64" />
        </div>

        {/* Alerts List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Bell className="w-12 h-12" />}
                title="No alerts found"
                description="All systems are running normally or try adjusting your filters"
              />
            </Card>
          ) : filtered.map(alert => {
            const cfg = getAlertSeverityConfig(alert.severity);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${!alert.isRead ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'} ${alert.severity === 'CRITICAL' && !alert.isAcknowledged ? 'border-l-4 border-l-red-500' : ''}`}
                onClick={() => markAlertRead(alert.id)}
              >
                {/* Severity Icon */}
                <div className={`p-2.5 rounded-lg flex-shrink-0 ${cfg.bg} ${cfg.border} border`}>
                  <span className="text-lg">{ALERT_TYPE_ICONS[alert.type] || '🔔'}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge text-[10px] ${cfg.color}`}>{cfg.label}</span>
                        <span className="badge badge-gray text-[10px]">{alert.type.replace(/_/g, ' ')}</span>
                        {!alert.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" title="Unread" />}
                        {alert.isAcknowledged && <span className="badge badge-green text-[10px]">✓ Acknowledged</span>}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1">{alert.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>🔧 {alert.equipmentName}</span>
                        <span>🕐 {timeAgo(alert.createdAt)}</span>
                        {alert.acknowledgedBy && <span>✓ Ack by user</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {!alert.isAcknowledged && (
                    <button onClick={() => handleAcknowledge(alert.id)}
                      className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <Check className="w-3 h-3" /> Acknowledge
                    </button>
                  )}
                  <button onClick={() => handleCreateWO(alert)}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap">
                    <ClipboardList className="w-3 h-3" /> Create WO
                  </button>
                  <button onClick={() => handleDismiss(alert.id)}
                    className="text-xs px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <X className="w-3 h-3" /> Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
