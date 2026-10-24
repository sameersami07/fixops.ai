import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, AlertTriangle, ClipboardList, Calendar,
  Activity, ArrowRight,
  CheckCircle, Clock
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Layout, Header } from '../components/layout/Layout';
import { Card, StatCard, SectionHeader } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import {
  DASHBOARD_STATS, EQUIPMENT_HEALTH_CHART, WORK_ORDER_STATUS_CHART,
  MONTHLY_WORK_ORDERS, MAINTENANCE_COST_CHART, RECENT_ACTIVITY
} from '../data/demoData';
import { getEquipmentStatusConfig, getPriorityConfig, daysUntil } from '../utils';

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: 'white', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

export default function DashboardPage() {
  const { equipment, workOrders, alerts, maintenancePlans } = useApp();
  const navigate = useNavigate();

  const stats = {
    ...DASHBOARD_STATS,
    totalEquipment: equipment.length,
    operationalEquipment: equipment.filter(e => e.status === 'OPERATIONAL').length,
    maintenanceRequired: equipment.filter(e => e.status === 'MAINTENANCE').length,
    criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).length,
    openWorkOrders: workOrders.filter(w => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)).length,
    completedWorkOrders: workOrders.filter(w => w.status === 'COMPLETED').length,
    upcomingMaintenance: maintenancePlans.filter(p => daysUntil(p.nextRun) <= 30).length,
  };

  const recentWorkOrders = workOrders.slice(0, 5);
  const upcomingMaintenance = maintenancePlans
    .filter(p => p.isActive)
    .sort((a, b) => daysUntil(a.nextRun) - daysUntil(b.nextRun))
    .slice(0, 4);

  const criticalEquipment = equipment.filter(e => e.status === 'OFFLINE' || e.healthScore < 60);

  return (
    <Layout>
      <Header
        title="Dashboard"
        subtitle={`Last updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live Monitoring
            </span>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Equipment" value={stats.totalEquipment} icon={<Wrench />} color="blue" subtitle="Across all locations" />
          <StatCard title="Operational" value={stats.operationalEquipment} icon={<CheckCircle />} color="green" subtitle={`${Math.round((stats.operationalEquipment / stats.totalEquipment) * 100)}% uptime`} trend={{ value: 5, label: 'vs last month' }} />
          <StatCard title="In Maintenance" value={stats.maintenanceRequired} icon={<Clock />} color="amber" subtitle="Requires attention" />
          <StatCard title="Critical Alerts" value={stats.criticalAlerts} icon={<AlertTriangle />} color="red" subtitle="Immediate action needed" />
          <StatCard title="Open Work Orders" value={stats.openWorkOrders} icon={<ClipboardList />} color="indigo" subtitle="In progress" />
          <StatCard title="Completed WOs" value={stats.completedWorkOrders} icon={<CheckCircle />} color="green" subtitle="This month" />
          <StatCard title="Due Maintenance" value={stats.upcomingMaintenance} icon={<Calendar />} color="purple" subtitle="Within 30 days" />
          <StatCard title="Equipment Health" value="78%" icon={<Activity />} color="blue" subtitle="Average fleet health" trend={{ value: -3, label: 'vs last month' }} />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Equipment Health Pie */}
          <Card>
            <SectionHeader title="Equipment Health Distribution" subtitle="Current fleet status" />
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={EQUIPMENT_HEALTH_CHART} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {EQUIPMENT_HEALTH_CHART.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {EQUIPMENT_HEALTH_CHART.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Work Order Status Pie */}
          <Card>
            <SectionHeader title="Work Order Status" subtitle="Current period" />
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={WORK_ORDER_STATUS_CHART} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                  {WORK_ORDER_STATUS_CHART.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {WORK_ORDER_STATUS_CHART.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Work Orders Bar */}
          <Card>
            <SectionHeader title="Monthly Work Orders" subtitle="Created vs Completed" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_WORK_ORDERS} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="created" name="Created" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Maintenance Cost Chart */}
        <Card>
          <SectionHeader
            title="Maintenance Cost Trend"
            subtitle="Monthly breakdown by maintenance type (₹)"
            action={<span className="badge-blue badge text-xs">Last 6 Months</span>}
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MAINTENANCE_COST_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="preventive" name="Preventive" fill="#3b82f6" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="corrective" name="Corrective" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="emergency" name="Emergency" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bottom Row: Recent Work Orders + Upcoming Maintenance + Critical Equipment */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent Work Orders */}
          <Card className="lg:col-span-1" padding={false}>
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Work Orders</h3>
                <p className="text-xs text-slate-500">Latest activity</p>
              </div>
              <button onClick={() => navigate('/work-orders')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentWorkOrders.map(wo => {
                const priority = getPriorityConfig(wo.priority);
                return (
                  <div key={wo.id} className="px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate('/work-orders')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{wo.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{wo.equipmentCode} · {wo.assignedToName}</p>
                      </div>
                      <span className={`badge text-[10px] ${priority.color} flex-shrink-0`}>{priority.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Maintenance */}
          <Card className="lg:col-span-1" padding={false}>
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Maintenance</h3>
                <p className="text-xs text-slate-500">Next 30 days</p>
              </div>
              <button onClick={() => navigate('/maintenance')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingMaintenance.map(plan => {
                const days = daysUntil(plan.nextRun);
                return (
                  <div key={plan.id} className="px-5 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/maintenance')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{plan.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.equipmentName}</p>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${days <= 7 ? 'bg-red-50 text-red-700' : days <= 14 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                        {days <= 0 ? 'Overdue' : `${days}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-1" padding={false}>
            <div className="p-5 border-b border-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">System events</p>
            </div>
            <div className="divide-y divide-slate-50">
              {RECENT_ACTIVITY.map(item => {
                const colorDot: Record<string, string> = {
                  red: 'bg-red-500', green: 'bg-emerald-500', yellow: 'bg-amber-500', orange: 'bg-orange-500',
                };
                return (
                  <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${colorDot[item.color]}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">{item.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Critical Equipment */}
        {criticalEquipment.length > 0 && (
          <Card>
            <SectionHeader
              title="⚠️ Equipment Requiring Immediate Attention"
              subtitle="These equipment need urgent action"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {criticalEquipment.map(eq => {
                const status = getEquipmentStatusConfig(eq.status);
                return (
                  <div
                    key={eq.id}
                    className="border border-red-100 bg-red-50 rounded-xl p-4 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => navigate(`/equipment/${eq.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900">{eq.name}</p>
                      <span className={`badge ${status.color} text-[10px]`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{eq.code} · {eq.location}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${eq.healthScore}%` }} />
                      </div>
                      <span className="text-xs font-bold text-red-600">{eq.healthScore}%</span>
                    </div>
                    <p className="text-xs text-red-600 font-medium mt-1">Health Score: {eq.healthScore < 50 ? 'Critical' : 'Fair'}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
