import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, ClipboardList, Thermometer, Zap, MapPin,
  Calendar, Wrench, Clock, AlertTriangle, CheckCircle, Activity, QrCode
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, Badge, ProgressBar, SectionHeader } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { getEquipmentStatusConfig, getHealthScoreConfig, formatDate, timeAgo } from '../utils';
import { generateSensorHistory, MAINTENANCE_HISTORY } from '../data/demoData';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { equipment, workOrders } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'workorders' | 'sensors'>('overview');

  const eq = equipment.find(e => e.id === id);
  if (!eq) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-slate-500 text-lg">Equipment not found</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/equipment')}>← Back to Equipment</Button>
      </div>
    </Layout>
  );

  const status = getEquipmentStatusConfig(eq.status);
  const health = getHealthScoreConfig(eq.healthScore);
  const eqWorkOrders = workOrders.filter(wo => wo.equipmentId === id);
  const eqHistory = MAINTENANCE_HISTORY.filter(h => h.equipmentId === id);
  const sensorData = generateSensorHistory(id!, 3);

  // Downsample for chart (every 4 hours)
  const chartData = sensorData.filter((_, i) => i % 4 === 0).slice(-18).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temperature: +d.temperature.toFixed(1),
    vibration: +d.vibration.toFixed(2),
  }));

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'sensors', label: 'Sensor Data' },
    { id: 'workorders', label: `Work Orders (${eqWorkOrders.length})` },
    { id: 'history', label: `Maintenance History (${eqHistory.length})` },
  ];

  return (
    <Layout>
      <Header
        title={eq.name}
        subtitle={`${eq.code} · ${eq.location}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/equipment')}>Back</Button>
            <Button variant="primary" leftIcon={<ClipboardList className="w-4 h-4" />} onClick={() => navigate('/work-orders')}>Create Work Order</Button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* Status Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className={`badge ${status.color} text-sm py-1 px-3`}>
            <span className={`status-dot ${status.dot}`} />{status.label}
          </span>
          <span className={`text-sm font-semibold ${health.color}`}>Health: {eq.healthScore}% ({health.label})</span>
          <span className="text-sm text-slate-500">Last maintained: {formatDate(eq.lastMaintenance)}</span>
          <span className="text-sm text-slate-500">Next due: {formatDate(eq.nextMaintenance)}</span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 gradient-blue rounded-lg">
                <Thermometer className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Temperature</p>
                <p className={`text-xl font-bold ${eq.currentTemperature > eq.temperatureThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                  {eq.status === 'OFFLINE' ? 'N/A' : `${eq.currentTemperature.toFixed(1)}°C`}
                </p>
                <p className="text-[10px] text-slate-400">Threshold: {eq.temperatureThreshold}°C</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 gradient-purple rounded-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Vibration</p>
                <p className={`text-xl font-bold ${eq.currentVibration > eq.vibrationThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                  {eq.status === 'OFFLINE' ? 'N/A' : `${eq.currentVibration.toFixed(1)} mm/s`}
                </p>
                <p className="text-[10px] text-slate-400">Threshold: {eq.vibrationThreshold} mm/s</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 gradient-green rounded-lg">
                <ClipboardList className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Work Orders</p>
                <p className="text-xl font-bold text-slate-900">{eq.workOrderCount || eqWorkOrders.length}</p>
                <p className="text-[10px] text-slate-400">Total created</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 gradient-amber rounded-lg">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Maintenance Events</p>
                <p className="text-xl font-bold text-slate-900">{eq.maintenanceCount}</p>
                <p className="text-[10px] text-slate-400">Total performed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Health Score */}
        <Card>
          <SectionHeader title="Equipment Health Score" />
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={eq.healthScore >= 90 ? '#10b981' : eq.healthScore >= 70 ? '#3b82f6' : eq.healthScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3" strokeDasharray={`${eq.healthScore} ${100 - eq.healthScore}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${health.color}`}>{eq.healthScore}%</span>
                <span className="text-xs text-slate-400">{health.label}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: 'Temperature Health', value: eq.status === 'OFFLINE' ? 0 : Math.max(0, 100 - (eq.currentTemperature / eq.temperatureThreshold) * 100), color: 'bg-blue-500' },
                { label: 'Vibration Health', value: eq.status === 'OFFLINE' ? 0 : Math.max(0, 100 - (eq.currentVibration / eq.vibrationThreshold) * 100), color: 'bg-purple-500' },
                { label: 'Maintenance Compliance', value: eq.status === 'OPERATIONAL' ? 90 : 50, color: 'bg-green-500' },
                { label: 'Overall Health', value: eq.healthScore, color: health.bar },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-800">{Math.round(value)}%</span>
                  </div>
                  <ProgressBar value={value} color={color} size="md" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <SectionHeader title="Equipment Details" />
              <div className="space-y-3">
                {[
                  ['Equipment Code', eq.code], ['Category', eq.category], ['Location', eq.location],
                  ['Manufacturer', eq.manufacturer || '—'], ['Model', eq.model || '—'],
                  ['Serial Number', eq.serialNumber || '—'], ['Installation Date', formatDate(eq.installationDate)],
                  ['Description', eq.description || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="text-slate-800 text-right max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionHeader title="Thresholds & Tags" />
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Temperature Threshold</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gradient-to-r from-blue-200 via-amber-300 to-red-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-700">{eq.temperatureThreshold}°C</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Vibration Threshold</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gradient-to-r from-blue-200 via-amber-300 to-red-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-700">{eq.vibrationThreshold} mm/s</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {eq.tags.map(tag => <span key={tag} className="badge-blue badge">{tag}</span>)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="space-y-4">
            <div className="alert-strip-blue">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">📊 <strong>Simulated Data:</strong> Sensor readings shown below are simulated for demonstration purposes. In production, these would connect to real IoT sensors via MQTT/REST APIs.</span>
            </div>
            <Card>
              <SectionHeader title="Temperature History (72h)" />
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <ReferenceLine y={eq.temperatureThreshold} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Max: ${eq.temperatureThreshold}°C`, fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionHeader title="Vibration History (72h)" />
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <ReferenceLine y={eq.vibrationThreshold} stroke="#ef4444" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="vibration" stroke="#7c3aed" strokeWidth={2} dot={false} name="Vibration (mm/s)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'workorders' && (
          <Card padding={false}>
            {eqWorkOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No work orders for this equipment</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Due Date</th></tr></thead>
                <tbody>
                  {eqWorkOrders.map(wo => (
                    <tr key={wo.id} className="cursor-pointer" onClick={() => navigate('/work-orders')}>
                      <td><p className="font-medium text-slate-800">{wo.title}</p><p className="text-xs text-slate-400">{wo.type}</p></td>
                      <td><span className="badge badge-blue">{wo.status}</span></td>
                      <td><span className={`badge ${wo.priority === 'CRITICAL' ? 'badge-red' : wo.priority === 'HIGH' ? 'badge-orange' : 'badge-blue'}`}>{wo.priority}</span></td>
                      <td className="text-sm">{wo.assignedToName}</td>
                      <td className="text-sm text-slate-500">{formatDate(wo.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {activeTab === 'history' && (
          <Card padding={false}>
            {eqHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No maintenance history found</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Performed By</th><th>Duration</th><th>Cost</th></tr></thead>
                <tbody>
                  {eqHistory.map(h => (
                    <tr key={h.id}>
                      <td className="text-sm text-slate-500">{formatDate(h.completedAt)}</td>
                      <td><span className="badge badge-blue">{h.type}</span></td>
                      <td><p className="text-sm text-slate-700">{h.description}</p>{h.notes && <p className="text-xs text-slate-400 mt-0.5">{h.notes}</p>}</td>
                      <td className="text-sm">{h.performedByName}</td>
                      <td className="text-sm">{h.duration}h</td>
                      <td className="text-sm font-medium">₹{h.cost.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
}
