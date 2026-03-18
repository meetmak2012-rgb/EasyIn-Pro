
import React, { useState, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, WifiOff } from 'lucide-react';
import { Transaction } from '../types';
import { generateBusinessInsight } from '../services/geminiService';

interface AiAdvisorProps {
  transactions: Transaction[];
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ transactions }) => {
  const [query, setQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hello! I am your AI Business Advisor using Gemini. While your invoice data is strictly offline and private, AI processing requires a temporary internet connection.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSend = async () => {
    if (!query.trim() || !isOnline) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await generateBusinessInsight(transactions, userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "Connectivity issue. Please check your internet for AI features." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                <Sparkles size={20} />
            </div>
            <div>
                <h2 className="font-bold text-slate-800">Gemini Business Advisor</h2>
                <p className="text-xs text-slate-500 italic">Cloud intelligence for local data</p>
            </div>
         </div>
         {!isOnline && (
           <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 animate-pulse">
              <WifiOff size={14} />
              <span className="text-[10px] font-black uppercase">Offline</span>
           </div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }
              `}
            >
              {msg.role === 'ai' && <Bot size={16} className="mb-2 text-indigo-500" />}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-xs text-slate-400">Consulting Gemini...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        {!isOnline ? (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
            <WifiOff size={24} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-500">AI Advisor is paused in Offline Mode</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">All other features are fully functional</p>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your sales trends or customer activity..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
