
import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { User as UserType } from '../types';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setGoogleAccessToken } from '../services/googleDriveService';

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

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
      }
      
      const sessionUser: UserType = {
        id: googleUser.uid,
        username: googleUser.displayName || googleUser.email?.split('@')[0] || 'Google User',
        businessName: googleUser.displayName ? `${googleUser.displayName}'s Firm` : 'My Printing Press',
        createdAt: googleUser.metadata.creationTime || new Date().toISOString(),
        isGoogle: true,
        email: googleUser.email || ''
      };
      
      onLogin(sessionUser);
    } catch (err: any) {
      console.error('Google Login Error:', err);
      setError(err.message || 'Failed to authenticate with Google');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-white font-black text-3xl mb-4 shadow-xl shadow-primary/40 italic">E</div>
          <h1 className="text-4xl font-black text-white tracking-tighter">EasyIn <span className="text-primary">Pro</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Local Business Ledger & Billing</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-1 border border-slate-200 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-[2.2rem] p-1.5 mb-2">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.8rem] transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>Log In</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.8rem] transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>Sign Up</button>
          </div>

          <div className="p-8 space-y-6">
            {error && <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username / ID</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-slate-900 dark:text-slate-100" placeholder="Enter identifier" />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                  <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-slate-900 dark:text-slate-100" placeholder="E.g. Balvi Printing" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Secret Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-slate-900 dark:text-slate-100" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-5 rounded-[1.5rem] hover:opacity-90 transition-all font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-4">
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Enter Dashboard' : 'Create My Business'}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[9px] font-black uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 py-4 rounded-[1.5rem] transition-all font-black flex items-center justify-center gap-3 uppercase tracking-widest text-xs border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.37 0 3.383 2.664 1.455 6.559l3.81 3.206z"
                />
                <path
                  fill="#4285F4"
                  d="M23.64 12.218c0-.79-.07-1.54-.19-2.27H12v4.51h6.55c-.29 1.48-1.14 2.73-2.4 3.56l3.7 2.87c2.16-1.98 3.79-4.9 3.79-8.67z"
                />
                <path
                  fill="#FBBC05"
                  d="M1.455 6.559c-.27.81-.425 1.68-.425 2.583 0 .93.16 1.83.455 2.66l3.81-3.21a6.6 6.6 0 010-4.066l-3.84-2.967H1.455z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.08.72-2.47 1.16-4.26 1.16-3.28 0-6.07-2.21-7.07-5.18l-3.83 2.97C3.04 21.05 7.15 24 12 24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
        <p className="text-center text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Offline First • Data Stored Locally on this Device</p>
      </div>
    </div>
  );
};
