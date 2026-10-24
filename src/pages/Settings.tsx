import React, { useState } from 'react';
import { User, Bell, Shield, Database, Palette, Building, Save, CheckCircle } from 'lucide-react';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, Input, Select, Tabs, Avatar } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { USERS } from '../data/demoData';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'organization', label: 'Organization' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'users', label: 'Users' },
  { id: 'system', label: 'System' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91-9876543210',
    department: user?.department || '',
    timezone: 'Asia/Kolkata',
    language: 'en',
  });
  const [org, setOrg] = useState({
    name: 'FixOps Manufacturing Ltd.',
    address: '123 Industrial Area, Hyderabad, Telangana 500001',
    industry: 'Manufacturing',
    currency: 'INR',
    workingHours: '08:00-18:00',
    timezone: 'Asia/Kolkata',
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    criticalAlerts: true,
    maintenanceDue: true,
    workOrderUpdates: true,
    sensorThreshold: true,
    weeklyReport: false,
    smsAlerts: false,
  });
  const [system, setSystem] = useState({
    apiKey: '',
    aiProvider: 'gemini',
    sensorInterval: '30',
    alertRetentionDays: '90',
    maintenanceReminderDays: '7',
    backendUrl: 'http://localhost:8080',
  });

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) => (
    <button
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-5.5 h-[22px] items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <Layout>
      <Header
        title="Settings"
        subtitle="Manage your account and platform configuration"
        actions={
          <Button
            variant={saved ? 'success' : 'primary'}
            leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-52 flex-shrink-0">
            <Card className="!p-2">
              <nav className="space-y-0.5">
                {[
                  { id: 'profile', icon: User, label: 'Profile' },
                  { id: 'organization', icon: Building, label: 'Organization' },
                  { id: 'notifications', icon: Bell, label: 'Notifications' },
                  { id: 'users', icon: Shield, label: 'Users & Roles' },
                  { id: 'system', icon: Database, label: 'System Config' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            {activeTab === 'profile' && (
              <>
                <Card>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user?.name.split(' ').map(n => n[0]).join('') || 'SA'}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{user?.name}</h3>
                      <p className="text-sm text-slate-500">{user?.role} · {user?.department}</p>
                      <p className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">Change photo</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} id="settings-name" />
                    <Input label="Email Address" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} id="settings-email" />
                    <Input label="Phone Number" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} id="settings-phone" />
                    <Input label="Department" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} id="settings-dept" />
                    <Select label="Timezone" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })} id="settings-timezone"
                      options={[{ value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' }, { value: 'UTC', label: 'UTC' }, { value: 'America/New_York', label: 'Eastern Time' }]} />
                    <Select label="Language" value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })} id="settings-lang"
                      options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }]} />
                  </div>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Current Password" type="password" id="settings-cur-pwd" />
                    <div />
                    <Input label="New Password" type="password" id="settings-new-pwd" />
                    <Input label="Confirm Password" type="password" id="settings-confirm-pwd" />
                  </div>
                </Card>
              </>
            )}

            {activeTab === 'organization' && (
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Organization Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Organization Name" value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} id="org-name" />
                  <Select label="Industry" value={org.industry} onChange={e => setOrg({ ...org, industry: e.target.value })} id="org-industry"
                    options={[{ value: 'Manufacturing', label: 'Manufacturing' }, { value: 'Laboratory', label: 'Laboratory' }, { value: 'Facility Management', label: 'Facility Management' }, { value: 'Education', label: 'Education' }]} />
                  <div className="col-span-2">
                    <Input label="Address" value={org.address} onChange={e => setOrg({ ...org, address: e.target.value })} id="org-address" />
                  </div>
                  <Select label="Currency" value={org.currency} onChange={e => setOrg({ ...org, currency: e.target.value })} id="org-currency"
                    options={[{ value: 'INR', label: 'Indian Rupee (₹)' }, { value: 'USD', label: 'US Dollar ($)' }, { value: 'EUR', label: 'Euro (€)' }]} />
                  <Input label="Working Hours" value={org.workingHours} onChange={e => setOrg({ ...org, workingHours: e.target.value })} id="org-hours" placeholder="08:00-18:00" />
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 mb-5">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email for equipment issues' },
                    { key: 'criticalAlerts', label: 'Critical Alerts (Immediate)', desc: 'Get notified instantly for critical equipment failures' },
                    { key: 'maintenanceDue', label: 'Maintenance Due Reminders', desc: 'Reminder emails before scheduled maintenance dates' },
                    { key: 'workOrderUpdates', label: 'Work Order Updates', desc: 'Notifications for status changes in work orders' },
                    { key: 'sensorThreshold', label: 'Sensor Threshold Alerts', desc: 'Alert when sensor readings exceed configured thresholds' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly summary of maintenance activities' },
                    { key: 'smsAlerts', label: 'SMS Alerts (Critical Only)', desc: 'SMS notifications for critical failures' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <Toggle
                        id={`notif-${key}`}
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={v => setNotifications(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'users' && (
              <Card padding={false}>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Team Members</h3>
                    <p className="text-xs text-slate-500">{USERS.length} users</p>
                  </div>
                  <Button variant="primary" size="sm">Invite User</Button>
                </div>
                <table className="data-table">
                  <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {USERS.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-blue">{u.role}</span></td>
                        <td className="text-sm text-slate-600">{u.department}</td>
                        <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {activeTab === 'system' && (
              <>
                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">AI Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="AI Provider" value={system.aiProvider} onChange={e => setSystem({ ...system, aiProvider: e.target.value })} id="sys-ai-provider"
                      options={[{ value: 'gemini', label: 'Google Gemini' }, { value: 'openai', label: 'OpenAI GPT' }, { value: 'anthropic', label: 'Anthropic Claude' }]} />
                    <Input label="API Key" type="password" value={system.apiKey} onChange={e => setSystem({ ...system, apiKey: e.target.value })} placeholder="Configure in backend .env" id="sys-api-key" />
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800">⚠️ Never store API keys in frontend. Configure them as environment variables in the Spring Boot backend (.env file or system environment).</p>
                  </div>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">System Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Backend API URL" value={system.backendUrl} onChange={e => setSystem({ ...system, backendUrl: e.target.value })} id="sys-backend-url" />
                    <Select label="Sensor Update Interval (seconds)" value={system.sensorInterval} onChange={e => setSystem({ ...system, sensorInterval: e.target.value })} id="sys-sensor-interval"
                      options={[{ value: '10', label: '10 seconds' }, { value: '30', label: '30 seconds' }, { value: '60', label: '1 minute' }, { value: '300', label: '5 minutes' }]} />
                    <Input label="Alert Retention (days)" type="number" value={system.alertRetentionDays} onChange={e => setSystem({ ...system, alertRetentionDays: e.target.value })} id="sys-alert-retention" />
                    <Input label="Maintenance Reminder (days before)" type="number" value={system.maintenanceReminderDays} onChange={e => setSystem({ ...system, maintenanceReminderDays: e.target.value })} id="sys-maint-reminder" />
                  </div>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">System Information</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Application Version', 'FixOps AI v1.0.0 (MVP)'],
                      ['Frontend', 'React 18 + TypeScript + Vite'],
                      ['Styling', 'Tailwind CSS'],
                      ['Charts', 'Recharts'],
                      ['Backend (Planned)', 'Spring Boot 3 + Java 21'],
                      ['Database (Planned)', 'PostgreSQL + Spring Data JPA'],
                      ['Authentication', 'Demo Mode (JWT planned)'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
