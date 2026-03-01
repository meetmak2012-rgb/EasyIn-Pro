
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, ShieldCheck, History, RefreshCcw } from 'lucide-react';
import { Transaction } from '../types';

interface DataManagementProps {
  transactions: Transaction[];
  onImport: (data: Transaction[]) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ transactions, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);

  useEffect(() => {
    const last = localStorage.getItem('easyin_last_autobackup');
    if (last) setLastAutoBackup(new Date(last).toLocaleString());
  }, []);

  const handleBackup = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `easyin_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreFromAutoBackup = () => {
    const backup = localStorage.getItem('easyin_autobackup_v2');
    if (!backup) {
      alert("No auto-backup found.");
      return;
    }

    if (window.confirm('Restore from the latest automatic snapshot? This will replace your current data.')) {
      try {
        const data = JSON.parse(backup);
        onImport(data);
        alert('Data restored from snapshot successfully!');
      } catch (e) {
        alert('Snapshot corrupted.');
      }
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
            if (window.confirm('WARNING: This will replace ALL current data. Are you sure?')) {
                onImport(json);
                alert('Data restored successfully!');
            }
        } else {
            alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Management</h1>
            <p className="text-slate-500 font-medium">Manage your local database and portability.</p>
          </div>
          <div className="flex gap-2">
            {lastAutoBackup && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                 <ShieldCheck size={14} />
                 Auto-Save: {lastAutoBackup}
              </div>
            )}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6">
             <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl">
                <Download size={40} />
             </div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Manual JSON Export</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Download your complete database as a local JSON file for moving to another device.</p>
             </div>
             <button onClick={handleBackup} className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 font-black w-full shadow-sm uppercase tracking-widest text-xs">
                Download File
             </button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6">
             <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl">
                <Upload size={40} />
             </div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Import Local Backup</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Restore data from a previously downloaded .json file. Overwrites existing data.</p>
             </div>
             <input type="file" accept=".json" ref={fileInputRef} onChange={handleRestore} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 font-black w-full shadow-sm uppercase tracking-widest text-xs">
                Upload File
             </button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6 border-emerald-200">
             <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <RefreshCcw size={40} />
             </div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-emerald-900">Restore Snapshot</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Recover from the last automatic backup snapshot. Great for fixing accidental deletions.</p>
             </div>
             <button onClick={handleRestoreFromAutoBackup} className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-black w-full shadow-lg shadow-emerald-100 uppercase tracking-widest text-xs">
                Restore Latest
             </button>
          </div>
       </div>

       <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
             <div className="bg-white/10 p-4 rounded-2xl">
                <History size={48} className="text-blue-400" />
             </div>
             <div className="space-y-2 text-center md:text-left">
                <h4 className="text-lg font-black uppercase tracking-tight">Local-First Security</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                   Your business records are stored strictly in your browser's private database. 
                   We do not store your data on any central servers. Our <b>Auto-Backup</b> feature 
                   maintains a recovery snapshot, but you should still perform manual exports regularly.
                </p>
             </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <ShieldCheck size={120} />
          </div>
       </div>
    </div>
  );
};
