import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, ShieldAlert, Copy, Check, ExternalLink, RefreshCw, Cloud, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider 
} from 'firebase/auth';
import { setGoogleAccessToken } from '../services/googleDriveService';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const FIREBASE_PROJECT_ID = "gen-lang-client-0943858668";

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = error.toLowerCase().includes('unauthorized-domain') || 
                                error.toLowerCase().includes('auth/unauthorized-domain');

  // Handle redirect result if Google Auth was initiated via redirect
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
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
            email: googleUser.email || '',
            photoURL: googleUser.photoURL || undefined
          };
          onLogin(sessionUser);
        }
      })
      .catch((err) => {
        console.error('Redirect Auth Error:', err);
        setError(err.message || 'Google redirect sign-in failed');
      });
  }, [onLogin]);

  const handleCopyDomain = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const sanitizeEmail = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) {
      return trimmed;
    }
    // Fallback: convert username into a compliant email format for Firebase Auth
    const cleanUsername = trimmed.toLowerCase().replace(/[^a-z0-9_.-]/g, '') || 'user';
    return `${cleanUsername}@easyinpro.app`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = sanitizeEmail(emailOrUsername);

    try {
      if (isLogin) {
        // 1. Try Firebase Auth Online Login
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = cred.user;
          const userObj: UserType = {
            id: fbUser.uid,
            username: fbUser.displayName || emailOrUsername,
            businessName: `${emailOrUsername}'s Business`,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            email: fbUser.email || '',
            isGoogle: false
          };
          onLogin(userObj);
          return;
        } catch (firebaseErr: any) {
          // If offline or user exists locally, check localStorage fallback
          const storedUsers: UserType[] = JSON.parse(localStorage.getItem('easyin_users') || '[]');
          const localUser = storedUsers.find(u => 
            (u.username === emailOrUsername || u.email === emailOrUsername) && u.password === password
          );

          if (localUser) {
            onLogin(localUser);
            return;
          }
          throw firebaseErr;
        }
      } else {
        // Sign Up with Firebase Auth Online
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          const fbUser = cred.user;
          const newUser: UserType = {
            id: fbUser.uid,
            username: emailOrUsername,
            businessName: businessName || `${emailOrUsername}'s Firm`,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            email: fbUser.email || '',
            isGoogle: false
          };
          // Save local backup as well
          const storedUsers: UserType[] = JSON.parse(localStorage.getItem('easyin_users') || '[]');
          localStorage.setItem('easyin_users', JSON.stringify([...storedUsers, { ...newUser, password }]));
          onLogin(newUser);
          return;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === 'auth/email-already-in-use') {
            // Try signing in instead
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const fbUser = cred.user;
            const existingUser: UserType = {
              id: fbUser.uid,
              username: emailOrUsername,
              businessName: businessName || `${emailOrUsername}'s Firm`,
              createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
              email: fbUser.email || '',
              isGoogle: false
            };
            onLogin(existingUser);
            return;
          }
          throw firebaseErr;
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      let msg = err.message || 'Authentication failed';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect username/email or password.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this username/email. Please switch to "Sign Up".';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

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
        email: googleUser.email || '',
        photoURL: googleUser.photoURL || undefined
      };
      
      onLogin(sessionUser);
    } catch (err: any) {
      console.error('Google Login Error:', err);
      const errCode = err?.code || '';
      
      if (errCode === 'auth/popup-blocked') {
        // Try redirect flow if popup was blocked by browser
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirErr: any) {
          setError(redirErr.message || 'Popup was blocked and redirect failed. Please allow popups.');
        }
      } else if (errCode === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError(`Firebase Error: Domain '${currentHostname}' is not yet authorized for Google Sign-In in Firebase Console.`);
      } else {
        setError(err.message || 'Failed to authenticate with Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInstantCloudLogin = async () => {
    setError('');
    setGuestLoading(true);
    try {
      // 1. Try Firebase Anonymous Auth for real online cloud sync
      const cred = await signInAnonymously(auth);
      const fbUser = cred.user;
      const cloudUser: UserType = {
        id: fbUser.uid,
        username: "Cloud Guest",
        businessName: "My Printing Press",
        createdAt: new Date().toISOString(),
        isGoogle: false,
        isAnonymous: true
      };
      onLogin(cloudUser);
    } catch (e: any) {
      console.warn("Anonymous Cloud Auth fallback:", e);
      // 2. Offline fallback
      const guestUser: UserType = {
        id: "local_guest_" + Date.now(),
        username: "Guest User",
        businessName: "Guest Business",
        createdAt: new Date().toISOString(),
        isGoogle: false,
        isAnonymous: true
      };
      onLogin(guestUser);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white font-black text-3xl mb-3 shadow-xl shadow-blue-600/30">
            E
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            EasyIn <span className="text-blue-500">Pro</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px] mt-1.5">
            Cloud & Local Ledger • Printing & Invoicing
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden p-1 border border-slate-200 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-[1.75rem] p-1 mb-2">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }} 
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-[1.5rem] transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Log In
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }} 
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-[1.5rem] transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Domain Whitelist Interactive Diagnostic Assistant */}
            {isUnauthorizedDomain && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 text-xs space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                      Enable Google Authentication for this Domain
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Google OAuth requires this web domain to be listed under <strong>Authorized Domains</strong> in Firebase.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Your Domain:</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{currentHostname}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {copiedDomain ? <Check size={12} /> : <Copy size={12} />}
                    {copiedDomain ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 pl-1">
                  <p className="font-bold text-slate-700 dark:text-slate-200">How to authorize in 30 seconds:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-600 dark:text-slate-400">
                    <li>Click the link below to open Firebase Settings.</li>
                    <li>Under <strong>Authorized domains</strong>, click <strong>Add domain</strong>.</li>
                    <li>Paste <code className="text-amber-700 dark:text-amber-300 font-bold">{currentHostname}</code> and save.</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Open Firebase Settings</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={12} className={googleLoading ? "animate-spin" : ""} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {error && !isUnauthorizedDomain && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* Google Continue Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 py-3.5 rounded-2xl transition-all font-black flex items-center justify-center gap-3 uppercase tracking-wider text-xs shadow-md border border-slate-700 dark:border-transparent disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              )}
              <span>{googleLoading ? "Signing In with Google..." : "Continue with Google"}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                OR SIGN IN WITH EMAIL / PASSWORD
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  Email or Username
                </label>
                <input 
                  type="text" 
                  required 
                  value={emailOrUsername} 
                  onChange={(e) => setEmailOrUsername(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all text-slate-900 dark:text-slate-100" 
                  placeholder="e.g. printmaster or you@firm.com" 
                />
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                    Business / Press Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all text-slate-900 dark:text-slate-100" 
                    placeholder="e.g. Balvi Flex & Offset" 
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  Password
                </label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all text-slate-900 dark:text-slate-100" 
                  placeholder="••••••••" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl transition-all font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs mt-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLogin ? <LogIn size={16} /> : <UserPlus size={16} />
                )}
                <span>
                  {loading ? "Processing..." : (isLogin ? 'Sign In' : 'Create Account')}
                </span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={handleInstantCloudLogin}
                disabled={guestLoading}
                className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 py-3 rounded-xl transition-all font-black flex items-center justify-center gap-2 uppercase tracking-wider text-xs border border-emerald-200 dark:border-emerald-800/60"
              >
                {guestLoading ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                )}
                <span>Instant Cloud Guest Access</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          <Cloud size={14} className="text-blue-500" />
          <span>Firestore Cloud Database & Multi-Device Sync</span>
        </div>
      </div>
    </div>
  );
};
