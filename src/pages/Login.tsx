import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Activity, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { DEMO_CREDENTIALS } from '../data/demoData';

const FEATURES = [
  { icon: '📊', title: 'Real-time Monitoring', desc: 'Live equipment health dashboards' },
  { icon: '🤖', title: 'Google Gemini AI', desc: 'AI-powered diagnostics & troubleshooting' },
  { icon: '📅', title: 'Smart Scheduling', desc: 'Automated preventive maintenance' },
  { icon: '⚡', title: 'Instant Alerts', desc: 'Critical equipment notifications' },
  { icon: '🗄️', title: 'MongoDB Backend', desc: 'Persistent data storage & sync' },
];

const STATS = [
  { value: '10+', label: 'Equipment', icon: <Cpu className="w-4 h-4" /> },
  { value: '98%', label: 'Uptime', icon: <Activity className="w-4 h-4" /> },
  { value: 'AI', label: 'Powered', icon: <Zap className="w-4 h-4" /> },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@fixops.ai');
  const [password, setPassword] = useState('admin123');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields'); return; }
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Invalid email or password. Use the demo credentials below.');
  };

  const quickLogin = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #060b18 0%, #0a1628 40%, #0f0f2d 70%, #060b18 100%)' }}>
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)', top: '-20%', left: '-10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', bottom: '-10%', right: '5%' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)', top: '40%', right: '25%' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0 rounded-3xl overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}>
          
          {/* ── Left Panel ── */}
          <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #0f1b3d 0%, #0a1628 60%, #060b18 100%)' }}>
            
            {/* Glow blobs in left panel */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full"
              style={{ background: 'radial-gradient(circle, #2563eb, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 opacity-15 rounded-full"
              style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', transform: 'translate(-30%, 30%)' }} />

            {/* Top: Logo */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl tracking-tight">FixOps AI</p>
                  <p className="text-blue-400 text-xs font-medium">Intelligent Maintenance Platform</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-black text-white leading-tight mb-3">
                  Equipment<br />
                  <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}>
                    Made Smart
                  </span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  AI-powered platform with MongoDB persistence for proactive maintenance, real-time monitoring, and zero downtime.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2.5">
                {FEATURES.map((f, i) => (
                  <div key={i} className="feature-item">
                    <span className="text-xl flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-white text-xs font-semibold">{f.title}</p>
                      <p className="text-slate-500 text-[10px]">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Stats */}
            <div className="relative z-10 mt-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">System Status: All Systems Operational</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {STATS.map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex justify-center text-blue-400 mb-1">{s.icon}</div>
                    <p className="text-white font-bold text-lg">{s.value}</p>
                    <p className="text-slate-400 text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="p-8 lg:p-10 flex flex-col bg-white">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-slate-900 text-lg">FixOps AI</p>
            </div>

            <div className="mb-7">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
              </div>
              <p className="text-slate-500 text-sm">Sign in to your maintenance dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@fixops.ai"
                autoComplete="email"
                id="login-email"
              />
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                id="login-password"
                rightElement={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {error && (
                <div className="alert-strip-red">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" isLoading={loading} size="lg">
                {loading ? 'Signing in...' : 'Sign In →'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 p-4 rounded-2xl border border-slate-200 bg-slate-50/80">
              <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Demo Credentials — Click to auto-fill
              </p>
              <div className="space-y-2">
                {DEMO_CREDENTIALS.map((cred, i) => (
                  <button
                    key={i}
                    onClick={() => quickLogin(cred)}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs group shadow-sm"
                  >
                    <div>
                      <span className="font-semibold text-slate-700 group-hover:text-blue-700">{cred.role}</span>
                      <span className="text-slate-400 ml-2">{cred.email}</span>
                    </div>
                    <span className="text-slate-300 group-hover:text-blue-400 text-base">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tech stack badges */}
            <div className="mt-5 flex flex-wrap gap-1.5 justify-center">
              {['React + Vite', 'MongoDB', 'Express.js', 'Google Gemini AI', 'TypeScript'].map(t => (
                <span key={t} className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-medium">{t}</span>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              © 2026 FixOps AI · Intelligent Maintenance Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
