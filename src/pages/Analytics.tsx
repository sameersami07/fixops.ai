import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Layout, Header } from '../components/layout/Layout';
import { Card, SectionHeader, StatCard } from '../components/ui';
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  MONTHLY_WORK_ORDERS, MAINTENANCE_COST_CHART, EQUIPMENT_HEALTH_CHART,
  WORK_ORDER_STATUS_CHART
} from '../data/demoData';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils';

const CUSTOM_TOOLTIP = {
  backgroundColor: 'white', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const EQUIPMENT_CATEGORY_DATA = [
  { category: 'Manufacturing', count: 3, health: 89 },
  { category: 'Utilities', count: 2, health: 72 },
  { category: 'HVAC', count: 2, health: 78 },
  { category: 'Material Handling', count: 1, health: 91 },
  { category: 'Robotics', count: 1, health: 89 },
  { category: 'Power', count: 1, health: 78 },
];

const MTTR_DATA = [
  { month: 'May', mttr: 4.2, mtbf: 182 },
  { month: 'Jun', mttr: 3.8, mtbf: 198 },
  { month: 'Jul', mttr: 5.1, mtbf: 165 },
  { month: 'Aug', mttr: 3.5, mtbf: 210 },
  { month: 'Sep', mttr: 4.0, mtbf: 195 },
  { month: 'Oct', mttr: 3.2, mtbf: 225 },
];

const TECH_PERFORMANCE = [
  { name: 'Rahul Verma', completed: 12, avgTime: 3.2, rating: 4.5 },
  { name: 'Anita Patel', completed: 10, avgTime: 3.8, rating: 4.8 },
  { name: 'Vikram Singh', completed: 8, avgTime: 2.9, rating: 4.3 },
];

export default function AnalyticsPage() {
  const { equipment, workOrders } = useApp();
  const [period, setPeriod] = useState('6m');

  const totalCost = MAINTENANCE_COST_CHART.reduce((sum, m) => sum + m.preventive + m.corrective + m.emergency, 0);
  const prevCost = 195000;
  const costChange = ((totalCost - prevCost) / prevCost * 100).toFixed(1);
  const completedWOs = workOrders.filter(w => w.status === 'COMPLETED').length;
  const avgResolutionTime = 3.5;
  const uptimePct = ((equipment.filter(e => e.status === 'OPERATIONAL').length / equipment.length) * 100).toFixed(1);

  return (
    <Layout>
      <Header
        title="Analytics"
        subtitle="Maintenance performance insights and trends"
        actions={
          <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5">
            {['1m', '3m', '6m', '1y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${period === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Maintenance Cost"
            value={`₹${(totalCost / 100000).toFixed(1)}L`}
            icon={<DollarSign />}
            color="blue"
            subtitle="Last 6 months"
            trend={{ value: +costChange, label: 'vs prev period' }}
          />
          <StatCard
            title="Equipment Uptime"
            value={`${uptimePct}%`}
            icon={<CheckCircle />}
            color="green"
            subtitle="Fleet average"
            trend={{ value: 2.1, label: 'improvement' }}
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${avgResolutionTime}h`}
            icon={<Clock />}
            color="amber"
            subtitle="Per work order"
            trend={{ value: -8.5, label: 'vs last month' }}
          />
          <StatCard
            title="WOs Completed"
            value={completedWOs}
            icon={<TrendingUp />}
            color="indigo"
            subtitle="This month"
            trend={{ value: 12, label: 'increase' }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Monthly Cost Breakdown */}
          <Card>
            <SectionHeader title="Maintenance Cost Breakdown" subtitle="Preventive vs Corrective vs Emergency (₹)" />
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={MAINTENANCE_COST_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="preventive" name="Preventive" stroke="#3b82f6" fill="#eff6ff" stackId="1" />
                <Area type="monotone" dataKey="corrective" name="Corrective" stroke="#f59e0b" fill="#fefce8" stackId="1" />
                <Area type="monotone" dataKey="emergency" name="Emergency" stroke="#ef4444" fill="#fef2f2" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* MTTR & MTBF */}
          <Card>
            <SectionHeader title="MTTR & MTBF Trends" subtitle="Mean Time to Repair (h) and Mean Time Between Failures (h)" />
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={MTTR_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="mttr" name="MTTR (h)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="mtbf" name="MTBF (h)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Work Orders Bar */}
          <Card>
            <SectionHeader title="Work Order Volume" subtitle="Monthly trend" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_WORK_ORDERS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP} />
                <Bar dataKey="created" name="Created" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Equipment Health Pie */}
          <Card>
            <SectionHeader title="Equipment Health" subtitle="Fleet distribution" />
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={EQUIPMENT_HEALTH_CHART} cx="50%" cy="50%" outerRadius={60} paddingAngle={3} dataKey="value">
                  {EQUIPMENT_HEALTH_CHART.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {EQUIPMENT_HEALTH_CHART.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name.split('(')[0].trim()}</span>
                  </div>
                  <span className="font-bold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Equipment by Category */}
          <Card>
            <SectionHeader title="Equipment by Category" subtitle="Count & avg health" />
            <div className="space-y-3 mt-2">
              {EQUIPMENT_CATEGORY_DATA.map(cat => (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{cat.category}</span>
                    <span className="text-slate-500">{cat.count} units · {cat.health}% health</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.health >= 90 ? 'bg-emerald-500' : cat.health >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${cat.health}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Technician Performance */}
        <Card>
          <SectionHeader title="Technician Performance" subtitle="Work order completion metrics" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>WOs Completed</th>
                  <th>Avg Resolution Time</th>
                  <th>Performance</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {TECH_PERFORMANCE.map(tech => (
                  <tr key={tech.name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-800">{tech.name}</span>
                      </div>
                    </td>
                    <td><span className="font-bold text-blue-600">{tech.completed}</span></td>
                    <td><span className="text-slate-700">{tech.avgTime}h avg</span></td>
                    <td className="w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(tech.completed / 15) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{Math.round((tech.completed / 15) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">{'★'.repeat(Math.floor(tech.rating))}</span>
                        <span className="text-slate-400">{'☆'.repeat(5 - Math.floor(tech.rating))}</span>
                        <span className="text-xs text-slate-600 ml-1">{tech.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Key Insights */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📉', title: 'Cost Reduction', desc: 'Preventive maintenance costs are 3.2x lower than corrective maintenance on average.', color: 'bg-emerald-50 border-emerald-200' },
            { icon: '⏱️', title: 'Downtime Trend', desc: 'Mean time to repair improved by 23% over the last 6 months through better technician routing.', color: 'bg-blue-50 border-blue-200' },
            { icon: '⚠️', title: 'Risk Equipment', desc: 'Industrial Pump #5 and HVAC Zone C show declining health trends requiring priority attention.', color: 'bg-amber-50 border-amber-200' },
          ].map(insight => (
            <div key={insight.title} className={`p-4 rounded-xl border ${insight.color}`}>
              <p className="text-2xl mb-2">{insight.icon}</p>
              <p className="text-sm font-semibold text-slate-800">{insight.title}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
