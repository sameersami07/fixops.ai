import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, AlertTriangle, RefreshCw, Info, Sparkles, CheckCircle2, Key } from 'lucide-react';
import { Layout, Header } from '../components/layout/Layout';
import { Card, Button, Select } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { aiApi, healthApi } from '../services/api';
import { getPriorityConfig } from '../utils';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parsedResponse?: AIResponse;
  isDemo?: boolean;
  timestamp: Date;
}

interface AIResponse {
  possibleCauses?: string[];
  inspectionSteps?: string[];
  maintenanceHistory?: string;
  suggestedPriority?: string;
  safetyConsiderations?: string[];
  estimatedDowntime?: string;
  recommendedParts?: string[];
  disclaimer?: string;
}

function parseAIResponse(text: string): AIResponse | null {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function AIResponseCard({ response, isDemo }: { response: AIResponse; isDemo?: boolean }) {
  const priorityCfg = response.suggestedPriority ? getPriorityConfig(response.suggestedPriority as any) : null;
  return (
    <div className="space-y-4 text-sm">
      {/* Demo / Real AI badge */}
      {isDemo ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-800">Demo Mode — Configure GEMINI_API_KEY in your deployment environment for real AI</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs text-emerald-800 font-medium">Powered by Google Gemini AI ✨</span>
        </div>
      )}

      {response.disclaimer && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-800">{response.disclaimer}</span>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {response.suggestedPriority && priorityCfg && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Suggested Priority:</span>
            <span className={`badge ${priorityCfg.color} text-xs`}>{priorityCfg.label}</span>
          </div>
        )}
        {response.estimatedDowntime && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Est. Downtime:</span>
            <span className="text-xs font-semibold text-slate-700">{response.estimatedDowntime}</span>
          </div>
        )}
      </div>

      {response.possibleCauses && response.possibleCauses.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">🔍 Possible Causes</p>
          <ul className="space-y-1.5">
            {response.possibleCauses.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {response.inspectionSteps && response.inspectionSteps.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">🔧 Inspection Steps</p>
          <ol className="space-y-1.5">
            {response.inspectionSteps.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {response.maintenanceHistory && (
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-bold text-slate-700 mb-1">📋 Maintenance Context</p>
          <p className="text-xs text-slate-600">{response.maintenanceHistory}</p>
        </div>
      )}

      {response.safetyConsiderations && response.safetyConsiderations.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-bold text-amber-800 mb-2">⚠️ Safety Considerations</p>
          <ul className="space-y-1">
            {response.safetyConsiderations.map((s, i) => (
              <li key={i} className="text-xs text-amber-700">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {response.recommendedParts && response.recommendedParts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">🛒 Recommended Parts</p>
          <div className="flex flex-wrap gap-1.5">
            {response.recommendedParts.map(p => <span key={p} className="badge badge-blue text-xs">{p}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIAssistantPage() {
  const { equipment } = useApp();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome', role: 'assistant', timestamp: new Date(),
      content: "Hello! I'm the FixOps AI Maintenance Assistant powered by Google Gemini. Select equipment, describe the problem, and I'll provide expert diagnostic guidance.\n\n🔑 **API Key Setup**: Configure GEMINI_API_KEY in your backend environment to enable real AI responses.",
    }
  ]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [problem, setProblem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'configured' | 'demo-mode' | 'offline'>('checking');
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK_PROBLEMS = [
    'Equipment making unusual noise and vibrating excessively',
    'Temperature readings above normal threshold',
    'Equipment starts but shuts down unexpectedly',
    'Unusual oil leak detected near the base',
    'Performance output has decreased significantly',
  ];

  useEffect(() => {
    healthApi.check()
      .then(health => setBackendStatus(health.ai === 'configured' ? 'configured' : 'demo-mode'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!problem.trim() || isLoading) return;
    const eq = equipment.find(e => e.id === selectedEquipment);
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`, role: 'user', timestamp: new Date(),
      content: `Equipment: ${eq ? `${eq.name} (${eq.code})` : 'General Query'}\n\nProblem: ${problem}`,
    };
    setMessages(prev => [...prev, userMsg]);
    setProblem('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const result = await aiApi.diagnose({
        equipmentName: eq?.name,
        equipmentCode: eq?.code,
        equipmentCategory: eq?.category,
        problem: userMsg.content,
      });

      const parsed = parseAIResponse(result.response);
      const assistantMsg: AIMessage = {
        id: `msg-${Date.now()}-ai`, role: 'assistant', timestamp: new Date(),
        content: result.response,
        parsedResponse: parsed || undefined,
        isDemo: result.isDemo,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected request error occurred.';
      const invalidGeminiKey = errorMessage.includes('GEMINI_API_KEY_INVALID')
        || errorMessage.includes('Google rejected the Gemini API key');
      const setupGuidance = invalidGeminiKey
        ? import.meta.env.DEV
          ? 'Create a Gemini API key in Google AI Studio (not an OAuth/access token), update backend/.env, then restart the backend.'
          : 'Create a Gemini API key in Google AI Studio (not an OAuth/access token), replace GEMINI_API_KEY in Vercel Project Settings, then redeploy.'
        : import.meta.env.DEV
        ? 'Make sure the backend server is running: cd backend && npm run dev'
        : 'Check GEMINI_API_KEY in Vercel Project Settings → Environment Variables, then redeploy.';
      const errorMsg: AIMessage = {
        id: `msg-${Date.now()}-err`, role: 'assistant', timestamp: new Date(),
        content: `❌ Error: ${errorMessage}\n\n${setupGuidance}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleClearChat = () => setMessages([{
    id: 'welcome-new', role: 'assistant', timestamp: new Date(),
    content: 'Chat cleared. Start a new diagnostic session by selecting equipment and describing the problem.',
  }]);

  return (
    <Layout>
      <Header
        title="AI Maintenance Assistant"
        subtitle="Powered by Google Gemini AI — Real-time equipment diagnostics"
        actions={
          <div className="flex items-center gap-2">
            <span className={`badge ${backendStatus === 'configured' ? 'badge-green' : backendStatus === 'demo-mode' ? 'badge-yellow' : backendStatus === 'offline' ? 'badge-red' : 'badge-gray'}`}>
              {backendStatus === 'configured' ? '🟢 Gemini AI Ready' : backendStatus === 'demo-mode' ? '🟡 Demo Mode — API key needed' : backendStatus === 'offline' ? '🔴 Backend Offline' : '⚪ Checking...'}
            </span>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={handleClearChat}>Clear Chat</Button>
          </div>
        }
      />

      <div className="p-6 flex gap-4 h-[calc(100vh-130px)]">
        {/* Left Panel */}
        <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 gradient-blue rounded-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Diagnostic Setup</p>
                  <p className="text-xs text-slate-500">Configure your query</p>
                </div>
              </div>

              <Select
                label="Select Equipment"
                value={selectedEquipment}
                onChange={e => setSelectedEquipment(e.target.value)}
                id="ai-equipment"
                options={[
                  { value: '', label: '— General Query —' },
                  ...equipment.map(e => ({ value: e.id, label: `${e.code} · ${e.name}` }))
                ]}
              />

              <div>
                <label className="form-label">Quick Problem Templates</label>
                <div className="space-y-1.5">
                  {QUICK_PROBLEMS.map((p, i) => (
                    <button key={i} onClick={() => setProblem(p)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-100 hover:border-blue-200 transition-all text-slate-600">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* API Key Guide */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-semibold text-slate-700">Google Gemini API Setup</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-600">Go to <span className="font-semibold text-blue-600">aistudio.google.com</span></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-600">Sign in with Google account</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-600">Click <span className="font-semibold">"Get API key"</span> in left sidebar</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-600">Click <span className="font-semibold">"Create API key"</span></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-600">Set <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded">GEMINI_API_KEY</span> in your backend or Vercel environment variables:<br />
                  <span className="font-mono text-[9px] text-blue-700">GEMINI_API_KEY=your-key</span>
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 mt-2">
                <p className="text-[10px] text-blue-700 font-semibold">✨ Free tier available!</p>
                <p className="text-[10px] text-blue-600">A Gemini API key is required for real AI responses.</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold text-slate-700">Safety Disclaimer</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              ⚠️ AI recommendations are for guidance only. Always consult qualified maintenance technicians before performing repairs. FixOps AI cannot guarantee equipment safety.
            </p>
          </Card>
        </div>

        {/* Chat Panel */}
        <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">FixOps AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span className="text-[10px] text-blue-100">Google Gemini Flash · Industrial Maintenance Expert</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 gradient-blue rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : msg.parsedResponse ? (
                    <AIResponseCard response={msg.parsedResponse} isDemo={msg.isDemo} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 gradient-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="chat-assistant">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" /> Gemini is analyzing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <textarea
                value={problem}
                onChange={e => setProblem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSend(); } }}
                placeholder="Describe the equipment problem... (Enter to send, Shift+Enter for new line)"
                rows={2}
                className="form-input flex-1 resize-none text-sm"
                disabled={isLoading}
                id="ai-problem-input"
              />
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!problem.trim() || isLoading}
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
                className="self-end"
              >
                Analyze
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {backendStatus === 'configured' ? 'Gemini connected — Real AI active' : backendStatus === 'demo-mode' ? 'Demo mode — Configure GEMINI_API_KEY in your deployment environment' : backendStatus === 'offline' ? 'Backend offline — Check the API deployment and configuration' : 'Checking AI service status...'}
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
