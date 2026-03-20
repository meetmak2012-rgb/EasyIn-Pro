
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Menu, 
  Database,
  Ruler,
  Settings as SettingsIcon,
  ChevronRight,
  ClipboardList,
  Sparkles
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  businessName: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, businessName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'sales', label: 'Sales (Estimates)', icon: <ClipboardList size={18} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <FileText size={18} /> },
    { id: 'ai', label: 'AI Advisor', icon: <Sparkles size={18} /> },
    { id: 'converter', label: 'Unit Converter', icon: <Ruler size={18} /> },
    { id: 'data', label: 'Backup & Restore', icon: <Database size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a192f] border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-800">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">E</div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white leading-none">EasyIn</span>
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Pro Business</span>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold uppercase shrink-0">
                {businessName?.[0] || 'B'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-white truncate">{businessName}</span>
                <span className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-tighter">Local Ledger Active</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} className="opacity-50" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-[#071121] text-center">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Version 2.3.0-Clean</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={() => onNavigate('settings')} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f8fafc] p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
