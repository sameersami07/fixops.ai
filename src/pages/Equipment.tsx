import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, LayoutGrid, List, QrCode, Thermometer, Zap, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, SearchInput, Badge, Modal, Input, Select, Textarea, EmptyState } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { getEquipmentStatusConfig, getHealthScoreConfig, formatDate, generateId, daysUntil } from '../utils';
import type { Equipment, EquipmentStatus } from '../types';

const CATEGORIES = ['', 'Manufacturing', 'Utilities', 'HVAC', 'Material Handling', 'Robotics', 'Power'];
const STATUSES: EquipmentStatus[] = ['OPERATIONAL', 'MAINTENANCE', 'OFFLINE', 'IDLE'];

const defaultForm = {
  name: '', code: '', category: 'Manufacturing', location: '',
  manufacturer: '', model: '', serialNumber: '', installationDate: '',
  status: 'OPERATIONAL' as EquipmentStatus, description: '',
  temperatureThreshold: 75, vibrationThreshold: 5.0,
  nextMaintenance: '', tags: '',
};

export default function EquipmentPage() {
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => equipment.filter(eq => {
    const q = search.toLowerCase();
    const matchSearch = !q || eq.name.toLowerCase().includes(q) || eq.code.toLowerCase().includes(q) || eq.location.toLowerCase().includes(q) || eq.category.toLowerCase().includes(q);
    const matchStatus = !filterStatus || eq.status === filterStatus;
    const matchCat = !filterCategory || eq.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  }), [equipment, search, filterStatus, filterCategory]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setErrors({}); setShowModal(true); };
  const openEdit = (eq: Equipment) => {
    setForm({ name: eq.name, code: eq.code, category: eq.category, location: eq.location,
      manufacturer: eq.manufacturer, model: eq.model, serialNumber: eq.serialNumber,
      installationDate: eq.installationDate, status: eq.status, description: eq.description,
      temperatureThreshold: eq.temperatureThreshold, vibrationThreshold: eq.vibrationThreshold,
      nextMaintenance: eq.nextMaintenance, tags: eq.tags.join(', ') });
    setEditId(eq.id); setErrors({}); setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Equipment name is required';
    if (!form.code.trim()) e.code = 'Equipment code is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.installationDate) e.installationDate = 'Installation date is required';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const data: Equipment = {
      id: editId || generateId('eq'), name: form.name, code: form.code, category: form.category,
      location: form.location, manufacturer: form.manufacturer, model: form.model,
      serialNumber: form.serialNumber, installationDate: form.installationDate, status: form.status,
      description: form.description, temperatureThreshold: form.temperatureThreshold,
      vibrationThreshold: form.vibrationThreshold, lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: form.nextMaintenance || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      currentTemperature: Math.random() * 40 + 30, currentVibration: Math.random() * 3 + 0.5,
      healthScore: form.status === 'OPERATIONAL' ? 85 : form.status === 'MAINTENANCE' ? 60 : 30,
      maintenanceCount: 0, workOrderCount: 0, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (editId) updateEquipment(editId, data);
    else addEquipment(data);
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete equipment "${name}"? This action cannot be undone.`)) {
      deleteEquipment(id);
    }
  };

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = equipment.filter(e => e.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <Header
        title="Equipment"
        subtitle={`${equipment.length} equipment registered`}
        actions={<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Equipment</Button>}
      />

      <div className="p-6 space-y-4">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATUSES.map(status => {
            const cfg = getEquipmentStatusConfig(status);
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
                className={`p-3 rounded-xl border text-left transition-all ${filterStatus === status ? 'border-blue-300 bg-blue-50' : 'bg-white border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${cfg.dot}`} />
                  <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
                </div>
                <p className={`text-2xl font-bold mt-1 ${cfg.text}`}>{statusCounts[status] || 0}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search equipment..." className="flex-1" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="form-select sm:w-48"
            >
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5">
              <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Results count */}
        <p className="text-xs text-slate-500">Showing {filtered.length} of {equipment.length} equipment</p>

        {viewMode === 'table' ? (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Health</th>
                    <th>Temperature</th>
                    <th>Next Maintenance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-slate-400">No equipment found</td></tr>
                  ) : filtered.map(eq => {
                    const status = getEquipmentStatusConfig(eq.status);
                    const health = getHealthScoreConfig(eq.healthScore);
                    const days = daysUntil(eq.nextMaintenance);
                    return (
                      <tr key={eq.id} className="cursor-pointer" onClick={() => navigate(`/equipment/${eq.id}`)}>
                        <td>
                          <div>
                            <p className="font-semibold text-slate-900">{eq.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{eq.code}</p>
                          </div>
                        </td>
                        <td><span className="badge-blue badge text-xs">{eq.category}</span></td>
                        <td>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />{eq.location}
                          </div>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <span className={`badge ${status.color}`}>
                            <span className={`status-dot ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${health.bar}`} style={{ width: `${eq.healthScore}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${health.color}`}>{eq.healthScore}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-xs">
                            <Thermometer className={`w-3 h-3 ${eq.currentTemperature > eq.temperatureThreshold ? 'text-red-500' : 'text-slate-400'}`} />
                            <span className={eq.currentTemperature > eq.temperatureThreshold ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                              {eq.currentTemperature.toFixed(1)}°C
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`text-xs font-medium ${days <= 7 ? 'text-red-600' : days <= 14 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {days <= 0 ? '⚠ Overdue' : `${days}d — ${formatDate(eq.nextMaintenance)}`}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/equipment/${eq.id}`)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors" title="View">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(eq)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(eq.id, eq.name)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(eq => {
              const status = getEquipmentStatusConfig(eq.status);
              const health = getHealthScoreConfig(eq.healthScore);
              return (
                <Card key={eq.id} className="cursor-pointer hover:shadow-card-hover !p-4 transition-all" padding={false} onClick={() => navigate(`/equipment/${eq.id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className={`badge ${status.color} text-[10px]`}>{status.label}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-tight">{eq.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{eq.code}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3" />{eq.location}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Health</span>
                      <span className={`font-bold ${health.color}`}>{eq.healthScore}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${health.bar}`} style={{ width: `${eq.healthScore}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Temp: {eq.currentTemperature.toFixed(1)}°C</span>
                      <span className="text-slate-500">Vib: {eq.currentVibration.toFixed(1)} mm/s</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(eq)} className="flex-1 text-xs py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors font-medium">Edit</button>
                    <button onClick={() => handleDelete(eq.id, eq.name)} className="px-3 text-xs py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors font-medium">Delete</button>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && <div className="col-span-full"><EmptyState title="No equipment found" description="Try adjusting your search or filters" /></div>}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Equipment' : 'Register New Equipment'}
        size="2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>
              {editId ? 'Update Equipment' : 'Register Equipment'}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Equipment Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="CNC Milling Machine #1" id="eq-name" />
          <Input label="Equipment Code *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} error={errors.code} placeholder="CNC-001" id="eq-code" />
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} id="eq-category"
            options={CATEGORIES.filter(Boolean).map(c => ({ value: c, label: c }))} />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as EquipmentStatus })} id="eq-status"
            options={STATUSES.map(s => ({ value: s, label: getEquipmentStatusConfig(s).label }))} />
          <Input label="Location *" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} error={errors.location} placeholder="Workshop A - Bay 1" id="eq-location" />
          <Input label="Manufacturer" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} placeholder="Haas Automation" id="eq-manufacturer" />
          <Input label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="VF-2SS" id="eq-model" />
          <Input label="Serial Number" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} placeholder="SN-2021-HA-001" id="eq-serial" />
          <Input label="Installation Date *" type="date" value={form.installationDate} onChange={e => setForm({ ...form, installationDate: e.target.value })} error={errors.installationDate} id="eq-install-date" />
          <Input label="Next Maintenance Date" type="date" value={form.nextMaintenance} onChange={e => setForm({ ...form, nextMaintenance: e.target.value })} id="eq-next-maintenance" />
          <Input label="Temperature Threshold (°C)" type="number" value={form.temperatureThreshold} onChange={e => setForm({ ...form, temperatureThreshold: +e.target.value })} id="eq-temp-threshold" />
          <Input label="Vibration Threshold (mm/s)" type="number" step="0.1" value={form.vibrationThreshold} onChange={e => setForm({ ...form, vibrationThreshold: +e.target.value })} id="eq-vib-threshold" />
          <div className="col-span-2">
            <Input label="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="CNC, Critical, Production" id="eq-tags" />
          </div>
          <div className="col-span-2">
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the equipment purpose and specifications..." rows={3} id="eq-description" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
