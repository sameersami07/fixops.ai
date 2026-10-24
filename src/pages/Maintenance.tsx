import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Check, ChevronLeft, ChevronRight, Clock, Wrench, Play } from 'lucide-react';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, Modal, Input, Select, Textarea, EmptyState, Avatar, Badge } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { formatDate, daysUntil, getFrequencyLabel, generateId, timeAgo } from '../utils';
import type { MaintenancePlan, MaintenanceFrequency } from '../types';
import { USERS } from '../data/demoData';
import { useAuth } from '../contexts/AuthContext';

const FREQUENCIES: MaintenanceFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];

const FREQUENCY_TO_DAYS: Record<MaintenanceFrequency, number> = {
  DAILY: 1, WEEKLY: 7, MONTHLY: 30, QUARTERLY: 90, ANNUAL: 365
};

const defaultForm = {
  name: '', equipmentId: '', description: '', frequency: 'MONTHLY' as MaintenanceFrequency,
  assignedTechnician: '', estimatedDuration: 2, nextRun: '',
  checklist: 'Inspect equipment\nCheck lubrication\nTest operation\nLog readings',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MaintenancePage() {
  const { maintenancePlans, equipment, addMaintenancePlan, updateMaintenancePlan, addWorkOrder } = useApp();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [generatingWO, setGeneratingWO] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.equipmentId) e.equipmentId = 'Equipment is required';
    if (!form.nextRun) e.nextRun = 'Next run date is required';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const eq = equipment.find(e => e.id === form.equipmentId);
    const tech = USERS.find(u => u.id === form.assignedTechnician);
    const plan: MaintenancePlan = {
      id: generateId('mp'), name: form.name, equipmentId: form.equipmentId,
      equipmentName: eq?.name || '', description: form.description,
      frequency: form.frequency, intervalDays: FREQUENCY_TO_DAYS[form.frequency],
      nextRun: form.nextRun, isActive: true,
      estimatedDuration: form.estimatedDuration,
      assignedTechnician: form.assignedTechnician,
      assignedTechnicianName: tech?.name || 'Unassigned',
      checklist: form.checklist.split('\n').map(l => l.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    addMaintenancePlan(plan);
    setSaving(false); setShowModal(false);
  };

  const handleGenerateWO = async (plan: MaintenancePlan) => {
    setGeneratingWO(plan.id);
    await new Promise(r => setTimeout(r, 800));
    const eq = equipment.find(e => e.id === plan.equipmentId);
    addWorkOrder({
      id: generateId('wo'), title: `PM: ${plan.name}`, description: plan.description,
      equipmentId: plan.equipmentId, equipmentName: plan.equipmentName, equipmentCode: eq?.code || '',
      assignedTo: plan.assignedTechnician, assignedToName: plan.assignedTechnicianName,
      status: 'OPEN', priority: 'MEDIUM', createdBy: user?.id || 'u1',
      createdAt: new Date().toISOString(), dueDate: plan.nextRun,
      estimatedHours: plan.estimatedDuration, type: 'PREVENTIVE',
      location: eq?.location || '', comments: [], parts: [],
    });
    // Update plan's lastRun and nextRun
    const nextRun = new Date(plan.nextRun);
    nextRun.setDate(nextRun.getDate() + plan.intervalDays);
    updateMaintenancePlan(plan.id, {
      lastRun: plan.nextRun,
      nextRun: nextRun.toISOString().split('T')[0],
    });
    setGeneratingWO(null);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    updateMaintenancePlan(id, { isActive: !current });
  };

  // Calendar generation
  const calendarDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return cells;
  }, [currentDate]);

  const getMaintenanceForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return maintenancePlans.filter(p => p.nextRun === dateStr && p.isActive);
  };

  const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const sortedPlans = [...maintenancePlans].sort((a, b) => daysUntil(a.nextRun) - daysUntil(b.nextRun));

  return (
    <Layout>
      <Header
        title="Maintenance Calendar"
        subtitle={`${maintenancePlans.filter(p => p.isActive).length} active maintenance plans`}
        actions={
          <div className="flex gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>List</button>
              <button onClick={() => setView('calendar')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Calendar</button>
            </div>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setForm(defaultForm); setErrors({}); setShowModal(true); }}>
              Create Plan
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Plans', value: maintenancePlans.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Plans', value: maintenancePlans.filter(p => p.isActive).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Due This Week', value: maintenancePlans.filter(p => p.isActive && daysUntil(p.nextRun) <= 7).length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Overdue', value: maintenancePlans.filter(p => p.isActive && daysUntil(p.nextRun) < 0).length, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 border border-white`}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {view === 'calendar' ? (
          <Card>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <h3 className="text-base font-semibold text-slate-900">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDates.map((day, i) => {
                if (!day) return <div key={i} />;
                const plans = getMaintenanceForDay(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                return (
                  <div key={i} className={`min-h-[80px] rounded-lg p-1.5 border transition-colors ${isToday ? 'bg-blue-50 border-blue-200' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {plans.map(p => (
                        <div key={p.id} className="text-[9px] bg-blue-500 text-white rounded px-1 py-0.5 truncate leading-tight">{p.name}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedPlans.length === 0 && <EmptyState title="No maintenance plans" description="Create your first maintenance plan to get started" />}
            {sortedPlans.map(plan => {
              const days = daysUntil(plan.nextRun);
              const isOverdue = days < 0;
              return (
                <Card key={plan.id} className="!p-5 hover:shadow-card-hover transition-all" padding={false}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-lg flex-shrink-0 ${plan.isActive ? 'gradient-blue' : 'bg-slate-100'}`}>
                        <Calendar className={`w-4 h-4 ${plan.isActive ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">{plan.name}</h3>
                          <span className="badge badge-blue text-[10px]">{getFrequencyLabel(plan.frequency)}</span>
                          {!plan.isActive && <span className="badge badge-gray text-[10px]">Inactive</span>}
                          {isOverdue && plan.isActive && <span className="badge badge-red text-[10px]">Overdue</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.equipmentName}</p>
                        {plan.description && <p className="text-xs text-slate-400 mt-1">{plan.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plan.estimatedDuration}h estimated</span>
                          <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{plan.assignedTechnicianName}</span>
                          {plan.lastRun && <span>Last run: {formatDate(plan.lastRun)}</span>}
                          <span className={`font-medium ${isOverdue ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-blue-600'}`}>
                            Next: {isOverdue ? `${Math.abs(days)}d overdue` : `${days} days (${formatDate(plan.nextRun)})`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {plan.checklist.slice(0, 3).map((item, i) => (
                            <span key={i} className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{item}</span>
                          ))}
                          {plan.checklist.length > 3 && <span className="text-[10px] text-slate-400">+{plan.checklist.length - 3} more</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(plan.id, plan.isActive)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${plan.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {plan.isActive ? '● Active' : '○ Inactive'}
                      </button>
                      <Button
                        variant="primary" size="sm"
                        leftIcon={<Play className="w-3 h-3" />}
                        isLoading={generatingWO === plan.id}
                        onClick={() => handleGenerateWO(plan)}
                      >
                        Generate WO
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Maintenance Plan" size="2xl"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} isLoading={saving}>Create Plan</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Plan Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="Monthly Lubrication Schedule" id="mp-name" />
          </div>
          <Select label="Equipment *" value={form.equipmentId} onChange={e => setForm({ ...form, equipmentId: e.target.value })} error={errors.equipmentId} id="mp-equipment"
            options={[{ value: '', label: '— Select Equipment —' }, ...equipment.map(e => ({ value: e.id, label: `${e.code} · ${e.name}` }))]} />
          <Select label="Frequency" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as MaintenanceFrequency })} id="mp-freq"
            options={FREQUENCIES.map(f => ({ value: f, label: getFrequencyLabel(f) }))} />
          <Select label="Assigned Technician" value={form.assignedTechnician} onChange={e => setForm({ ...form, assignedTechnician: e.target.value })} id="mp-tech"
            options={[{ value: '', label: '— Unassigned —' }, ...USERS.filter(u => u.role === 'TECHNICIAN').map(u => ({ value: u.id, label: u.name }))]} />
          <Input label="Estimated Duration (hours)" type="number" value={form.estimatedDuration} onChange={e => setForm({ ...form, estimatedDuration: +e.target.value })} id="mp-duration" />
          <Input label="Next Run Date *" type="date" value={form.nextRun} onChange={e => setForm({ ...form, nextRun: e.target.value })} error={errors.nextRun} id="mp-next-run" />
          <div className="col-span-2">
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} id="mp-description" />
          </div>
          <div className="col-span-2">
            <Textarea label="Checklist (one item per line)" value={form.checklist} onChange={e => setForm({ ...form, checklist: e.target.value })} rows={5} placeholder="Check oil level&#10;Inspect filters&#10;Test operation..." id="mp-checklist" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
