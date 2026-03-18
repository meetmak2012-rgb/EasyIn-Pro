
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, ShieldCheck, History, RefreshCcw, Cloud } from 'lucide-react';
import { Transaction, BusinessProfile } from '../types';
import { syncToDrive, restoreFromDrive, initGapi } from '../services/googleDriveService';
import { syncToOneDrive, restoreFromOneDrive } from '../services/oneDriveService';

interface DataManagementProps {
  transactions: Transaction[];
  onImport: (data: Transaction[]) => void;
  profile: BusinessProfile;
}

export const DataManagement: React.FC<DataManagementProps> = ({ transactions, onImport, profile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOneDriveSyncing, setIsOneDriveSyncing] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem('easyin_last_autobackup');
    if (last) setLastAutoBackup(new Date(last).toLocaleString());
    
    // Initialize GAPI
    initGapi().catch(console.error);
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

  const handleCloudSync = async () => {
    if (!profile.googleClientId) {
      alert("Google Client ID not configured. Please set it in Settings.");
      return;
    }

    setIsSyncing(true);
    try {
      await syncToDrive(transactions, profile.googleClientId);
      alert('Data synced to Google Drive successfully!');
    } catch {
      alert('Failed to sync to Google Drive. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!profile.googleClientId) {
      alert("Google Client ID not configured. Please set it in Settings.");
      return;
    }

    if (!window.confirm('Restore from Google Drive? This will replace your current data.')) return;

    setIsSyncing(true);
    try {
      const data = await restoreFromDrive(profile.googleClientId);
      if (data) {
        onImport(data);
        alert('Data restored from Google Drive successfully!');
      } else {
        alert('No backup found on Google Drive.');
      }
    } catch {
      alert('Failed to restore from Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOneDriveSync = async () => {
    if (!profile.oneDriveClientId) {
      alert("OneDrive Client ID not configured. Please set it in Settings.");
      return;
    }

    setIsOneDriveSyncing(true);
    try {
      await syncToOneDrive(transactions, profile.oneDriveClientId);
      alert('Data synced to OneDrive successfully!');
    } catch {
      alert('Failed to sync to OneDrive. Check console for details.');
    } finally {
      setIsOneDriveSyncing(false);
    }
  };

  const handleOneDriveRestore = async () => {
    if (!profile.oneDriveClientId) {
      alert("OneDrive Client ID not configured. Please set it in Settings.");
      return;
    }

    if (!window.confirm('Restore from OneDrive? This will replace your current data.')) return;

    setIsOneDriveSyncing(true);
    try {
      const data = await restoreFromOneDrive(profile.oneDriveClientId);
      if (data) {
        onImport(data);
        alert('Data restored from OneDrive successfully!');
      } else {
        alert('No backup found on OneDrive.');
      }
    } catch {
      alert('Failed to restore from OneDrive.');
    } finally {
      setIsOneDriveSyncing(false);
    }
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
      } catch {
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
      } catch {
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

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
             <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                <Download size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Export JSON</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Download local database as a .json file.</p>
             </div>
             <button onClick={handleBackup} className="px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-50 font-black w-full shadow-sm uppercase tracking-widest text-[10px]">
                Download
             </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
             <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                <Upload size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Import JSON</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Restore data from a local .json file.</p>
             </div>
             <input type="file" accept=".json" ref={fileInputRef} onChange={handleRestore} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-50 font-black w-full shadow-sm uppercase tracking-widest text-[10px]">
                Upload
             </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 border-emerald-200">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <RefreshCcw size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wider">Restore Snapshot</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Recover from the last automatic backup.</p>
             </div>
             <button onClick={handleRestoreFromAutoBackup} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-black w-full shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]">
                Restore
             </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 border-blue-200">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Cloud size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider">Google Drive</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Sync your estimates to Google Drive.</p>
             </div>
             <div className="flex gap-2 w-full">
               <button 
                 disabled={isSyncing}
                 onClick={handleCloudSync} 
                 className="flex-1 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-black shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px] disabled:opacity-50"
               >
                  {isSyncing ? '...' : 'Sync'}
               </button>
               <button 
                 disabled={isSyncing}
                 onClick={handleCloudRestore} 
                 className="flex-1 px-2 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
               >
                  {isSyncing ? '...' : 'Load'}
               </button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 border-sky-200">
             <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Cloud size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-black text-sky-900 uppercase tracking-wider">OneDrive</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Sync your estimates to Microsoft OneDrive.</p>
             </div>
             <div className="flex gap-2 w-full">
               <button 
                 disabled={isOneDriveSyncing}
                 onClick={handleOneDriveSync} 
                 className="flex-1 px-2 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-black shadow-lg shadow-sky-100 uppercase tracking-widest text-[10px] disabled:opacity-50"
               >
                  {isOneDriveSyncing ? '...' : 'Sync'}
               </button>
               <button 
                 disabled={isOneDriveSyncing}
                 onClick={handleOneDriveRestore} 
                 className="flex-1 px-2 py-2 bg-white border border-sky-200 text-sky-600 rounded-lg hover:bg-sky-50 font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
               >
                  {isOneDriveSyncing ? '...' : 'Load'}
               </button>
             </div>
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
                   Your business records are stored strictly in your browser&apos;s private database. 
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
