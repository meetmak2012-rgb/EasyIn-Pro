
import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Layers, Trash2, Plus, FileText, ToggleLeft, ToggleRight, Palette, ShieldAlert, Building2, Eye, EyeOff
} from 'lucide-react';
import { User, BusinessProfile } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface SettingsProps {
  profile: BusinessProfile;
  user: User;
  onUpdate: (updated: BusinessProfile) => void;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const THEME_COLORS = [
  '#2563eb', // Blue
  '#1e40af', // Dark Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0f172a', // Slate
  '#db2777', // Pink
];

export const Settings: React.FC<SettingsProps> = ({ profile, user, onUpdate, onUpdateUser, onLogout, onDeleteAccount }) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [userData, setUserData] = useState<User>({ ...user, password: user.password || '' });
  const [newMaterial, setNewMaterial] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'number' ? parseFloat(value) || 0 : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
    setFormData(prev => ({ ...prev, [name]: val }));
    setIsSaved(false);
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim() && !formData.materials.includes(newMaterial.trim())) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()]
      }));
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (m: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(item => item !== m)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-none">Settings & Customization</h1>
          <p className="text-slate-500 mt-2">Manage your business identity and visual PDF branding.</p>
        </div>
        {isSaved && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <FileCheck size={18} /> Settings Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Account */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Account Settings</h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Username</label>
                <input 
                  type="text" 
                  name="username"
                  value={userData.username} 
                  onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={userData.password || ''} 
                    onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
             </div>
             <button type="button" onClick={() => onUpdateUser(userData)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Update Account</button>
          </div>
        </div>

        {/* Business Profile */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Business Identity</h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Company / Business Name</label>
                <input 
                  type="text" 
                  name="businessName"
                  value={formData.businessName} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="e.g. Balvi Printing Press"
                />
                <p className="text-[10px] text-slate-500 italic">This name will appear on the top of your estimates and in the sidebar.</p>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">OneDrive Client ID (for Cloud Sync)</label>
                <input 
                  type="text" 
                  name="oneDriveClientId"
                  value={formData.oneDriveClientId || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="your_client_id_here"
                />
                <p className="text-[10px] text-slate-500 italic">Required for OneDrive backup. Get this from Azure Portal.</p>
             </div>
          </div>
        </div>

        {/* Visual Branding */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Palette size={20} className="text-pink-600" />
            <h3 className="font-bold text-slate-800">Visual Branding</h3>
          </div>
          <div className="p-6">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Invoice Primary Theme Color</label>
             <div className="flex flex-wrap gap-4">
                {THEME_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pdfThemeColor: color }))}
                    className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 ${
                      formData.pdfThemeColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white ring-1 ring-slate-100 shadow-sm'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="relative group">
                  <input 
                    type="color" 
                    name="pdfThemeColor" 
                    value={formData.pdfThemeColor} 
                    onChange={handleChange}
                    className="w-12 h-12 rounded-full overflow-hidden border-4 border-white ring-1 ring-slate-100 cursor-pointer shadow-sm"
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap text-[8pt] font-black text-slate-400 uppercase">Custom</div>
                </div>
             </div>
          </div>
        </div>

        {/* Business Logic Limits */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <ShieldAlert size={20} className="text-orange-600" />
            <h3 className="font-bold text-slate-800">Calculation Rules & Limits</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Min SqFt per Piece</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="minSqFtPerPiece"
                      step="0.1"
                      value={formData.minSqFtPerPiece} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      placeholder="e.g. 1.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">SQFT</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Example: If W*H = 0.5, it will charge for {formData.minSqFtPerPiece || 'X'}.</p>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Min Amount per Line</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="minItemAmount"
                      step="1"
                      value={formData.minItemAmount} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      placeholder="e.g. 50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{profile.currencySymbol}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Ensures no line item total is less than this value.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Material Manager */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Layers size={20} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">Materials Master</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newMaterial} 
                onChange={(e) => setNewMaterial(e.target.value)} 
                placeholder="New material (e.g. Star Flex)"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
              />
              <button type="button" onClick={handleAddMaterial} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-indigo-700 transition-colors">
                <Plus size={18} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.materials.map(m => (
                <div key={m} className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg group hover:bg-white hover:border-blue-200 transition-all">
                  <span className="text-sm font-bold text-slate-700">{m}</span>
                  <button type="button" onClick={() => handleRemoveMaterial(m)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Table & Footer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800">PDF Table & Footer</h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm">SqFt Column</h4>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, showSqFtInPdf: !prev.showSqFtInPdf }))} className={`transition-all p-1 rounded-full ${formData.showSqFtInPdf ? 'text-blue-600' : 'text-slate-300'}`}>
                    {formData.showSqFtInPdf ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm">Material Type</h4>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, showMaterialInPdf: !prev.showMaterialInPdf }))} className={`transition-all p-1 rounded-full ${formData.showMaterialInPdf ? 'text-blue-600' : 'text-slate-300'}`}>
                    {formData.showMaterialInPdf ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
             </div>
             <textarea name="pdfFooterNote" value={formData.pdfFooterNote} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none h-24 focus:bg-white focus:ring-2 focus:ring-blue-500" placeholder="Default footer terms..."/>
          </div>
        </div>

        <div className="flex justify-end gap-3 sticky bottom-6 z-10">
            <button type="button" onClick={() => setFormData(profile)} className="px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-600 font-bold transition-all shadow-lg">Reset</button>
            <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-200">Save All Settings</button>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden mt-10">
          <div className="p-4 border-b border-rose-200 bg-rose-50 flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-600" />
            <h3 className="font-bold text-rose-800">Danger Zone</h3>
          </div>
          <div className="p-6 flex gap-4">
            <button type="button" onClick={onLogout} className="bg-slate-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors">Logout</button>
            <button type="button" onClick={() => setShowDeleteModal(true)} className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-700 transition-colors">Delete Account</button>
          </div>
        </div>
      </form>
      <ConfirmationModal 
        isOpen={showDeleteModal}
        title="Delete Account"
        message="Are you sure? This will delete all your data and cannot be undone."
        onConfirm={onDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};