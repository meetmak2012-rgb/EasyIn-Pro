
import React, { useState } from 'react';
import { User as UserIcon, LogIn, UserPlus, HardDrive, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const storedUsers: UserType[] = JSON.parse(localStorage.getItem('easyin_users') || '[]');

    if (isLogin) {
      const user = storedUsers.find(u => u.username === username && u.password === password);
      if (user) onLogin(user);
      else setError('Incorrect username or password');
    } else {
      if (storedUsers.some(u => u.username === username)) {
        setError('Username is already taken');
        return;
      }
      const newUser: UserType = {
        id: Date.now().toString(),
        username,
        password,
        businessName: businessName || `${username}'s Firm`,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('easyin_users', JSON.stringify([...storedUsers, newUser]));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white font-black text-3xl mb-4 shadow-xl shadow-blue-900/40 italic">E</div>
          <h1 className="text-4xl font-black text-white tracking-tighter">EasyIn <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Local Business Ledger & Billing</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-1">
          <div className="flex bg-slate-100 rounded-[2.2rem] p-1.5 mb-2">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.8rem] transition-all ${isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Log In</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.8rem] transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Sign Up</button>
          </div>

          <div className="p-8 space-y-6">
            {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / ID</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" placeholder="Enter identifier" />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                  <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" placeholder="E.g. Balvi Printing" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-4">
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Enter Dashboard' : 'Create My Business'}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Offline First • Data Stored Locally on this Device</p>
      </div>
    </div>
  );
};
