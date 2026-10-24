import React, { useState, useMemo } from 'react';
import { Plus, Filter, MessageSquare, CheckCircle, Clock, X } from 'lucide-react';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, SearchInput, Modal, Input, Select, Textarea, Tabs, EmptyState, Avatar } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import {
  getWorkOrderStatusConfig, getPriorityConfig, formatDate, timeAgo, generateId, daysUntil
} from '../utils';
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../types';
import { USERS } from '../data/demoData';
import { useAuth } from '../contexts/AuthContext';

const STATUSES: WorkOrderStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITIES: WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const WO_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'EMERGENCY', 'INSPECTION'];

const defaultForm = {
  title: '', description: '', equipmentId: '', assignedTo: '',
  status: 'OPEN' as WorkOrderStatus, priority: 'MEDIUM' as WorkOrderPriority,
  dueDate: '', estimatedHours: 4, type: 'CORRECTIVE', completionNotes: '', newComment: '',
};

export default function WorkOrdersPage() {
  const { workOrders, equipment, addWorkOrder, updateWorkOrder, deleteWorkOrder } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'ALL', label: 'All', count: workOrders.length },
    ...STATUSES.map(s => ({ id: s, label: getWorkOrderStatusConfig(s).label, count: workOrders.filter(wo => wo.status === s).length }))
  ];

  const filtered = useMemo(() => workOrders.filter(wo => {
    const q = search.toLowerCase();
    const matchSearch = !q || wo.title.toLowerCase().includes(q) || wo.equipmentName.toLowerCase().includes(q) || wo.assignedToName.toLowerCase().includes(q);
    const matchTab = activeTab === 'ALL' || wo.status === activeTab;
    const matchPriority = !filterPriority || wo.priority === filterPriority;
    return matchSearch && matchTab && matchPriority;
  }), [workOrders, search, activeTab, filterPriority]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.equipmentId) e.equipmentId = 'Equipment is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    return e;
  };

  const openNew = () => { setForm(defaultForm); setEditId(null); setErrors({}); setShowModal(true); };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const eq = equipment.find(e => e.id === form.equipmentId);
    const tech = USERS.find(u => u.id === form.assignedTo);
    const wo: WorkOrder = {
      id: generateId('wo'), title: form.title, description: form.description,
      equipmentId: form.equipmentId, equipmentName: eq?.name || '', equipmentCode: eq?.code || '',
      assignedTo: form.assignedTo, assignedToName: tech?.name || 'Unassigned',
      status: form.status, priority: form.priority,
      createdBy: user?.id || 'u1', createdAt: new Date().toISOString(),
      dueDate: form.dueDate, estimatedHours: form.estimatedHours,
      type: form.type as any, location: eq?.location || '',
      comments: [], parts: [],
    };
    addWorkOrder(wo);
    setSaving(false); setShowModal(false);
  };

  const handleStatusChange = (id: string, status: WorkOrderStatus) => {
    const update: Partial<WorkOrder> = { status };
    if (status === 'COMPLETED') update.completedAt = new Date().toISOString();
    updateWorkOrder(id, update);
    if (selectedWO?.id === id) setSelectedWO(prev => prev ? { ...prev, ...update } : null);
  };

  const handleAddComment = (id: string, text: string) => {
    if (!text.trim()) return;
    const wo = workOrders.find(w => w.id === id);
    if (!wo) return;
    const comment = { id: generateId('c'), text, author: user?.id || 'u1', authorName: user?.name || 'Unknown', createdAt: new Date().toISOString() };
    updateWorkOrder(id, { comments: [...wo.comments, comment] });
    setSelectedWO(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
    setForm(prev => ({ ...prev, newComment: '' }));
  };

  const openDetail = (wo: WorkOrder) => { setSelectedWO(wo); setForm(prev => ({ ...prev, newComment: '' })); setShowDetailModal(true); };

  return (
    <Layout>
      <Header
        title="Work Orders"
        subtitle={`${workOrders.filter(w => ['OPEN','ASSIGNED','IN_PROGRESS'].includes(w.status)).length} active work orders`}
        actions={<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>New Work Order</Button>}
      />

      <div className="p-6 space-y-4">
        {/* Priority Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterPriority('')} className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${!filterPriority ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>All Priorities</button>
          {PRIORITIES.map(p => {
            const cfg = getPriorityConfig(p);
            const count = workOrders.filter(w => w.priority === p).length;
            return (
              <button key={p} onClick={() => setFilterPriority(filterPriority === p ? '' : p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5 ${filterPriority === p ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                <span>{cfg.label}</span>
                <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder="Search work orders..." className="max-w-md" />

        {/* Work Orders Table */}
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Work Order</th>
                  <th>Equipment</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState title="No work orders found" description="Create a new work order or adjust your filters" /></td></tr>
                ) : filtered.map(wo => {
                  const status = getWorkOrderStatusConfig(wo.status);
                  const priority = getPriorityConfig(wo.priority);
                  const days = daysUntil(wo.dueDate);
                  const isOverdue = days < 0 && wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED';
                  return (
                    <tr key={wo.id} className="cursor-pointer" onClick={() => openDetail(wo)}>
                      <td>
                        <p className="font-semibold text-slate-800 text-sm">{wo.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{wo.id.toUpperCase()} · {wo.comments.length} comments</p>
                      </td>
                      <td>
                        <p className="text-sm text-slate-700">{wo.equipmentName}</p>
                        <p className="text-xs text-slate-400 font-mono">{wo.equipmentCode}</p>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <span className={`badge ${priority.color}`}>{priority.label}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          value={wo.status}
                          onChange={e => handleStatusChange(wo.id, e.target.value as WorkOrderStatus)}
                          className={`text-xs font-semibold border rounded-full px-2 py-1 cursor-pointer focus:outline-none ${status.color} bg-transparent`}
                          onClick={e => e.stopPropagation()}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{getWorkOrderStatusConfig(s).label}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={wo.assignedToName} size="sm" />
                          <span className="text-sm text-slate-700">{wo.assignedToName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : days <= 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {isOverdue ? '⚠ Overdue' : formatDate(wo.dueDate)}
                        </span>
                      </td>
                      <td><span className="badge badge-gray">{wo.type}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button onClick={() => { if (window.confirm('Delete this work order?')) deleteWorkOrder(wo.id); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Work Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Work Order" size="2xl"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} isLoading={saving}>Create Work Order</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} error={errors.title} placeholder="Describe the work to be done" id="wo-title" />
          </div>
          <Select label="Equipment *" value={form.equipmentId} onChange={e => setForm({ ...form, equipmentId: e.target.value })} error={errors.equipmentId} id="wo-equipment"
            options={[{ value: '', label: '— Select Equipment —' }, ...equipment.map(e => ({ value: e.id, label: `${e.code} · ${e.name}` }))]} />
          <Select label="Assigned Technician" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} id="wo-tech"
            options={[{ value: '', label: '— Unassigned —' }, ...USERS.filter(u => u.role === 'TECHNICIAN').map(u => ({ value: u.id, label: u.name }))]} />
          <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as WorkOrderPriority })} id="wo-priority"
            options={PRIORITIES.map(p => ({ value: p, label: getPriorityConfig(p).label }))} />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} id="wo-type"
            options={WO_TYPES.map(t => ({ value: t, label: t }))} />
          <Input label="Due Date *" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} error={errors.dueDate} id="wo-due" />
          <Input label="Estimated Hours" type="number" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: +e.target.value })} id="wo-hours" />
          <div className="col-span-2">
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description of the work to be performed..." rows={4} id="wo-description" />
          </div>
        </div>
      </Modal>

      {/* Work Order Detail Modal */}
      {selectedWO && (
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedWO.title} size="2xl">
          <div className="space-y-4">
            {/* Header Info */}
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${getPriorityConfig(selectedWO.priority).color}`}>{selectedWO.priority}</span>
              <span className={`badge ${getWorkOrderStatusConfig(selectedWO.status).color}`}>{selectedWO.status}</span>
              <span className="badge badge-gray">{selectedWO.type}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Equipment', `${selectedWO.equipmentCode} · ${selectedWO.equipmentName}`],
                ['Assigned To', selectedWO.assignedToName],
                ['Due Date', formatDate(selectedWO.dueDate)],
                ['Est. Hours', `${selectedWO.estimatedHours}h`],
                ['Created', timeAgo(selectedWO.createdAt)],
                ['Location', selectedWO.location],
              ].map(([k, v]) => (
                <div key={k}><span className="text-slate-500">{k}:</span> <span className="font-medium text-slate-800 ml-1">{v}</span></div>
              ))}
            </div>

            {selectedWO.description && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 mb-1">Description</p>
                <p className="text-sm text-slate-700">{selectedWO.description}</p>
              </div>
            )}

            {/* Status Change */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Update Status:</span>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => handleStatusChange(selectedWO.id, s)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${selectedWO.status === s ? getWorkOrderStatusConfig(s).color + ' border-current' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {getWorkOrderStatusConfig(s).label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parts */}
            {selectedWO.parts && selectedWO.parts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Required Parts</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWO.parts.map(part => <span key={part} className="badge badge-gray">{part}</span>)}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">Comments ({selectedWO.comments.length})</p>
              <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
                {selectedWO.comments.length === 0 ? <p className="text-xs text-slate-400 italic">No comments yet</p> : null}
                {selectedWO.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.authorName} size="sm" />
                    <div className="flex-1 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={form.newComment}
                  onChange={e => setForm(prev => ({ ...prev, newComment: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(selectedWO.id, form.newComment); } }}
                  placeholder="Add a comment (Enter to send)..."
                  className="form-input flex-1 text-sm"
                  id="wo-comment"
                />
                <Button variant="primary" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />} onClick={() => handleAddComment(selectedWO.id, form.newComment)}>Send</Button>
              </div>
            </div>

            {selectedWO.completionNotes && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Completion Notes</span>
                </div>
                <p className="text-xs text-emerald-800">{selectedWO.completionNotes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </Layout>
  );
}
