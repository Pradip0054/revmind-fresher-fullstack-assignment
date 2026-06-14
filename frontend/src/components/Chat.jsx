import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'assistant', 
      text: "Welcome to NovaBite Insights! I am your AI Agent for operational intelligence. Ask me any business metric or transactional query in plain English (e.g., 'What is the net revenue of West region?')." 
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null);

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
          error: data.error
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
      {/* Chat Messages Area */}
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
                    <AlertCircle size={14} />
                    <p>{typeof msg.error === 'string' ? msg.error : 'Execution Exception Intercepted.'}</p>
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

      {/* Input Form Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything from business transactional matrices..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition placeholder-slate-500 text-slate-200"
        />
        <button 
          type="submit" 
          disabled={sending || !input.trim()} 
          className="bg-cyan-500 text-slate-950 p-3 rounded-xl hover:bg-cyan-400 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}