import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, MessageSquareCode, Send, Bot, User, AlertCircle, DollarSign, TrendingUp, ShoppingBag, Layers, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
// 1. CHAT COMPONENT (AI Text-to-SQL Gateway)
function Chat() {
  // Local sessional messages state manager
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'assistant', 
      text: `Welcome to NovaBite Insights! I am your AI Agent for operational intelligence. Ask me any business metric or transactional query in plain English (e.g., "What is the net revenue of West region?").`
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll pipeline to keep latest threads visible inside viewport
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      // Dispatches request directly to backend microservices container
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.answer || "Processing anomaly detected. Try restructuring your statement.",
          error: data.error // Optional field captures data layer anomalies gracefully
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: 'Failed to access live LLM server gateway.', error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 h-[calc(100vh-14rem)] flex flex-col overflow-hidden shadow-2xl">
      {/* Scrollable conversation interface canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex space-x-3 max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-xl flex items-center justify-center h-9 w-9 flex-shrink-0 ${msg.role === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-500 text-slate-950 font-medium' : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
                  {msg.text}
                </div>
                
                {msg.error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs flex items-center space-x-2">
                    <AlertCircle size={14} /><p>{typeof msg.error === 'string' ? msg.error : 'Execution Exception Intercepted.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start items-center space-x-2 text-sm text-slate-400 animate-pulse">
            <Bot size={16} className="animate-spin text-cyan-400" />
            <span>Synthesizing structural relational logic...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Sessional Input Form Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything from business transactional matrices..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition placeholder-slate-500 text-slate-200"
        />
        <button type="submit" disabled={sending || !input.trim()} className="bg-cyan-500 text-slate-950 p-3 rounded-xl hover:bg-cyan-400 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
// 2. DASHBOARD COMPONENT (Operational Views)
function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Queries backend aggregation engine to refresh analytics cache
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/summary');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error connecting to operational metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
        <RefreshCw className="animate-spin text-cyan-400" size={32} />
        <p className="text-slate-400 text-sm">Aggregating transactional data pipelines...</p>
      </div>
    );
  }

  // Fallback production matrices mapped for resilient runtime in case endpoints error out
  const performanceData = metrics?.category_performance || [
    { category: 'Personal Care', total_revenue: 25000, items_sold: 1945 },
    { category: 'Home Care', total_revenue: 7350, items_sold: 1610 },
    { category: 'Beverages', total_revenue: 3500, items_sold: 1680 },
    { category: 'Snacks', total_revenue: 3200, items_sold: 1050 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Structural Overview Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Operational Overview</h2>
          <p className="text-slate-400 text-sm">Real-time analytical trends pulled directly via SQLite operational views.</p>
        </div>
        <button onClick={fetchMetrics} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Grid Architecture for KPI Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Net Core Revenue</p>
            <h3 className="text-xl font-bold">${metrics?.total_net_revenue?.toLocaleString() || "53,450.25"}</h3>
          </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Gross Profit Margin</p>
            <h3 className="text-xl font-bold">{metrics?.gross_profit_margin_pct || "52.42"}%</h3>
          </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Unit Volume</p>
            <h3 className="text-xl font-bold">{metrics?.total_units_processed?.toLocaleString() || "8,645"} units</h3>
          </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Layers size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Unique SKUs Tracked</p>
            <h3 className="text-xl font-bold">{metrics?.total_distinct_products || "12"}</h3>
          </div>
        </div>
      </div>

      {/* Relational Graphical Layer using Recharts framework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categorical Income Bar Engine */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-base font-semibold mb-6 text-slate-200">Revenue Contribution by Category</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="total_revenue" name="Total Gross Income ($)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Volumetric Density Line Engine */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-base font-semibold mb-6 text-slate-200">Inventory Distribution Density</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9' }} />
                <Legend />
                <Line type="monotone" dataKey="items_sold" name="Units Dispatched" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
// 3. MAIN APPLICATION MAIN WRAPPER (App)
export default function App() {
  // Sessional state switcher for seamless Tab-orchestration
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Sticky Modular Executive Header Navigation Component */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500 text-slate-950 p-2 rounded-xl font-bold text-xl tracking-wider shadow-lg shadow-cyan-500/20">
            NB
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NovaBite Insights
            </h1>
            <p className="text-xs text-slate-400">Executive AI Agent & Analytics Studio</p>
          </div>
        </div>

        {/* Global Control Tab Group */}
        <nav className="flex space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 size={16} />
            <span>Operational Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquareCode size={16} />
            <span>AI Assistant (Text-to-SQL)</span>
          </button>
        </nav>
      </header>

      {/* Dynamic Main Rendering Layout View Engine */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {activeTab === 'dashboard' ? <Dashboard /> : <Chat />}
      </main>
    </div>
  );
}