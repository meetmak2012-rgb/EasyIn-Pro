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
  Cloud,
  LogOut,
  User as UserIcon,
  HardDrive
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  businessName: string;
  user?: User | null;
  onLogout?: () => void;
  cloudSyncStatus?: 'synced' | 'syncing' | 'local' | 'error';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onNavigate, 
  businessName,
  user,
  onLogout,
  cloudSyncStatus = 'local'
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'sales', label: 'Sales (Estimates)', icon: <ClipboardList size={18} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <FileText size={18} /> },
    { id: 'converter', label: 'Unit Converter', icon: <Ruler size={18} /> },
    { id: 'data', label: 'Backup & Cloud Sync', icon: <Database size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a192f] border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-800">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">
              E
            </div>
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
                <div className="flex items-center gap-1.5 mt-0.5">
                  {cloudSyncStatus === 'synced' ? (
                    <>
                      <Cloud size={10} className="text-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Cloud Online</span>
                    </>
                  ) : cloudSyncStatus === 'syncing' ? (
                    <>
                      <Cloud size={10} className="text-blue-400 animate-pulse" />
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tight">Syncing...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive size={10} className="text-amber-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Local Storage</span>
                    </>
                  )}
                </div>
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

          <div className="p-4 border-t border-slate-800 bg-[#071121] flex items-center justify-between">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Version 2.4.0-Online</span>
             {onLogout && (
               <button 
                 type="button"
                 onClick={() => setShowConfirmLogout(true)} 
                 className="text-[10px] font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                 title="Sign Out"
               >
                 <LogOut size={12} />
                 <span>Exit</span>
               </button>
             )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu size={20} />
            </button>
            
            {/* Header Cloud Sync Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold">
              {cloudSyncStatus === 'synced' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-slate-700">Firestore Cloud Synced</span>
                </>
              ) : cloudSyncStatus === 'syncing' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-spin"></span>
                  <span className="text-slate-700">Syncing to Cloud...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700">Local Device Ledger</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.username} 
                    className="w-7 h-7 rounded-full border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.username?.[0]?.toUpperCase() || <UserIcon size={14} />}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800 leading-none truncate max-w-[140px]">
                    {user.username}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 truncate max-w-[140px]">
                    {user.isGoogle ? 'Google Account' : (user.isAnonymous ? 'Guest' : (user.email || 'Online'))}
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={() => onNavigate('settings')} 
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>

            {onLogout && (
              <button 
                type="button"
                onClick={() => setShowConfirmLogout(true)} 
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f8fafc] p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        {/* Confirmation Modal for Sign Out */}
        {showConfirmLogout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Sign Out?</h3>
                  <p className="text-xs text-slate-500">Are you sure you want to exit?</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All saved estimates are securely saved on this device and synced with cloud storage.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmLogout(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Stay Logged In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmLogout(false);
                    if (onLogout) onLogout();
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-all"
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
