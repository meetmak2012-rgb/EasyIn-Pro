import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { Reports } from './components/Reports';
import { DataManagement } from './components/DataManagement';
import { Settings } from './components/Settings';
import { UnitConverter } from './components/UnitConverter';
import { Auth } from './components/Auth';
import { Transaction, BusinessProfile, TransactionType, User } from './types';
import { db, auth } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function isPermissionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return code === 'permission-denied' || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient');
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const DEFAULT_MATERIALS = [
  "Regular Flex", "B.B. Reg. Flex", "Star Flex", "Vinyl", "Vinyl + Lam",
  "Vinyl + Foamsheet", "One Way", "Retro Vinyl", "Transperant Vinyl",
  "Backlit", "Vinyl + Lam + Foamsheet", "Foamsheet"
];

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: 'My Printing Press',
  currencySymbol: '₹',
  defaultStatus: 'UNPAID',
  materials: DEFAULT_MATERIALS,
  pdfFooterNote: 'Thank you for your business!',
  showSqFtInPdf: true,
  showMaterialInPdf: true,
  pdfThemeColor: '#2563eb',
  pdfAccentColor: '#1e40af',
  minSqFtPerPiece: 0,
  minItemAmount: 0,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  oneDriveClientId: import.meta.env.VITE_ONEDRIVE_CLIENT_ID || ''
};

const sanitizeTxnForFirestore = (txn: Transaction, userId: string) => {
  return {
    id: txn.id || `EST_${Math.random().toString(36).slice(2, 9)}`,
    type: TransactionType.SALE,
    invoiceNumber: txn.invoiceNumber || 'EST-0000',
    date: txn.date || new Date().toISOString().split('T')[0],
    partyName: txn.partyName || 'Valued Customer',
    billingAddress: txn.billingAddress || '',
    items: (txn.items || []).map((item, idx) => ({
      id: item.id || `item_${idx}`,
      description: item.description || '',
      details: item.details || '',
      material: item.material || '',
      sizeA: Number(item.sizeA) || 0,
      sizeB: Number(item.sizeB) || 0,
      quantity: Number(item.quantity) || 1,
      sqFt: Number(item.sqFt) || 0,
      rate: Number(item.rate) || 0,
      amount: Number(item.amount) || 0,
    })),
    subTotal: Number(txn.subTotal) || 0,
    grandTotal: Number(txn.grandTotal) || 0,
    status: (txn.status === 'PAID' ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
    userId,
    attachments: (txn.attachments || []).map(a => ({
      id: a.id,
      name: a.name,
      url: a.url,
      contentType: a.contentType || 'application/octet-stream',
      size: Number(a.size) || 0,
      uploadedAt: a.uploadedAt || new Date().toISOString()
    })),
    createdAt: txn.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

function generateFallbackId(): string {
  return `EST_${Date.now()}`;
}

function generateFallbackInvoiceNumber(): string {
  return `EST-${Math.floor(1000 + Math.random() * 9000)}`;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const toastCounterRef = React.useRef(0);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('easyin_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [viewState, setViewState] = useState<'list' | 'form'>('list');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'local' | 'error'>('local');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    toastCounterRef.current += 1;
    const id = `toast_${toastCounterRef.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const isGoogle = !fbUser.isAnonymous && fbUser.providerData.some(p => p.providerId === 'google.com');
        const sessionUser: User = {
          id: fbUser.uid,
          username: fbUser.displayName || fbUser.email?.split('@')[0] || (fbUser.isAnonymous ? 'Guest User' : 'User'),
          email: fbUser.email || '',
          businessName: fbUser.displayName ? `${fbUser.displayName}'s Firm` : 'My Printing Press',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          isGoogle,
          isAnonymous: fbUser.isAnonymous,
          photoURL: fbUser.photoURL || undefined
        };
        setUser(sessionUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load local defaults on startup
  useEffect(() => {
    const savedTxns = localStorage.getItem('easyin_transactions_v2') || localStorage.getItem('easyin_autobackup_v2');
    if (savedTxns) {
      try {
        const parsed = JSON.parse(savedTxns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
        }
      } catch (e) {
        console.warn('Error reading local transactions:', e);
      }
    }

    const savedProfile = localStorage.getItem('easyin_profile_v2');
    if (savedProfile) {
      try {
        setBusinessProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
      } catch (e) {
        console.warn('Error reading local profile:', e);
      }
    }
  }, []);

  // Fetch Firestore transactions & profile settings when authenticated user logs in
  useEffect(() => {
    if (user) {
      let isMounted = true;

      // 1. Instantly load this specific user's cached ledger so UI is responsive immediately
      const userTxnKey = `easyin_txns_${user.id}`;
      const localCachedStr = localStorage.getItem(userTxnKey) || localStorage.getItem('easyin_transactions_v2') || localStorage.getItem('easyin_autobackup_v2');
      if (localCachedStr) {
        try {
          const parsed = JSON.parse(localCachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
          }
        } catch (e) {
          console.warn("Could not parse user cached transactions:", e);
        }
      }

      const loadFirestoreData = async () => {
        // If there's an active Firebase user matching this session
        if (auth.currentUser && auth.currentUser.uid === user.id) {
          setCloudSyncStatus('syncing');
          try {
            // 1. Fetch user settings profile
            const profilePath = `users/${user.id}/profile/settings`;
            const profileRef = doc(db, profilePath);
            const profileSnap = await getDoc(profileRef);
            if (!isMounted) return;

            if (profileSnap.exists()) {
              setBusinessProfile(profileSnap.data() as BusinessProfile);
            } else {
              const initialProfile = {
                ...DEFAULT_PROFILE,
                businessName: user.businessName
              };
              await setDoc(profileRef, initialProfile).catch(() => {});
              if (isMounted) setBusinessProfile(initialProfile);
            }

            // 2. Fetch user transactions
            const txnsPath = `users/${user.id}/transactions`;
            const txnsQuery = collection(db, txnsPath);
            const querySnapshot = await getDocs(txnsQuery);
            if (!isMounted) return;

            const loadedTxns: Transaction[] = [];
            querySnapshot.forEach((docSnap) => {
              loadedTxns.push(docSnap.data() as Transaction);
            });
            loadedTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Reconcile cloud items with any local items
            setTransactions((prev) => {
              const combinedMap = new Map<string, Transaction>();
              // Add Firestore documents first
              loadedTxns.forEach(t => combinedMap.set(t.id, t));
              // Merge local items that haven't synced to Firestore yet
              prev.forEach(t => {
                if (!combinedMap.has(t.id)) {
                  combinedMap.set(t.id, t);
                  // Push local item to Firestore in background
                  const clean = sanitizeTxnForFirestore(t, user.id);
                  setDoc(doc(db, 'users', user.id, 'transactions', clean.id), clean).catch(() => {});
                }
              });

              const merged = Array.from(combinedMap.values());
              merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              if (merged.length > 0) {
                localStorage.setItem(`easyin_txns_${user.id}`, JSON.stringify(merged));
                localStorage.setItem('easyin_transactions_v2', JSON.stringify(merged));
                localStorage.setItem('easyin_autobackup_v2', JSON.stringify(merged));
              }
              return merged;
            });

            if (isMounted) setCloudSyncStatus('synced');
          } catch (error: any) {
            if (isMounted) {
              setCloudSyncStatus('local');
              const localTxns = localStorage.getItem(`easyin_txns_${user.id}`) || localStorage.getItem('easyin_transactions_v2');
              if (localTxns) {
                try {
                  const parsed = JSON.parse(localTxns);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    setTransactions(parsed);
                  }
                } catch (e) {
                  console.warn('Could not parse local fallback:', e);
                }
              }
            }
            if (isPermissionError(error)) {
              handleFirestoreError(error, OperationType.GET, `users/${user.id}`);
            } else {
              console.warn("Firestore offline or unavailable (using local storage ledger):", error?.message || error);
            }
          }
        } else {
          setCloudSyncStatus('local');
        }
      };
      loadFirestoreData();
      return () => { isMounted = false; };
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('easyin_current_user', JSON.stringify(user));
    else localStorage.removeItem('easyin_current_user');
  }, [user]);

  useEffect(() => {
    // Only persist if transactions has items, so logging out (which clears state)
    // NEVER overwrites user storage with an empty array!
    if (transactions.length > 0) {
      if (user) {
        localStorage.setItem(`easyin_txns_${user.id}`, JSON.stringify(transactions));
      }
      localStorage.setItem('easyin_transactions_v2', JSON.stringify(transactions));
      localStorage.setItem('easyin_autobackup_v2', JSON.stringify(transactions));
      localStorage.setItem('easyin_last_autobackup', new Date().toISOString());
    }
  }, [transactions, user]);

  useEffect(() => {
    localStorage.setItem('easyin_profile_v2', JSON.stringify(businessProfile));
  }, [businessProfile]);

  const handleLogin = (u: User) => {
    setUser(u);
    // Immediately restore this user's transactions from localStorage
    const userTxnKey = `easyin_txns_${u.id}`;
    const saved = localStorage.getItem(userTxnKey) || localStorage.getItem('easyin_transactions_v2') || localStorage.getItem('easyin_autobackup_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
        }
      } catch (e) {
        console.warn("Could not load user transactions on login:", e);
      }
    }
    setBusinessProfile(prev => ({ ...prev, businessName: u.businessName }));
    showToast(`Welcome, ${u.username}!`, 'success');
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    const cleanId = transaction.id || generateFallbackId();
    const cleanTransaction: Transaction = {
      ...transaction,
      id: cleanId,
      partyName: transaction.partyName?.trim() || 'Walk-in Customer',
      invoiceNumber: transaction.invoiceNumber?.trim() || generateFallbackInvoiceNumber()
    };

    // 1. Immediately persist synchronously to local storage to guarantee 0 data loss
    let updatedTxns: Transaction[];
    if (editingTransaction) {
      updatedTxns = transactions.map(t => t.id === cleanTransaction.id ? cleanTransaction : t);
    } else {
      const exists = transactions.some(t => t.id === cleanTransaction.id);
      updatedTxns = exists
        ? transactions.map(t => t.id === cleanTransaction.id ? cleanTransaction : t)
        : [cleanTransaction, ...transactions];
    }

    if (user) {
      localStorage.setItem(`easyin_txns_${user.id}`, JSON.stringify(updatedTxns));
    }
    localStorage.setItem('easyin_transactions_v2', JSON.stringify(updatedTxns));
    localStorage.setItem('easyin_autobackup_v2', JSON.stringify(updatedTxns));
    localStorage.setItem('easyin_last_autobackup', new Date().toISOString());

    // 2. Immediately update in-memory state and switch view
    setTransactions(updatedTxns);
    setViewState('list');
    setEditingTransaction(null);
    showToast(`Estimate #${cleanTransaction.invoiceNumber} saved successfully!`, 'success');

    // 3. Background Cloud Sync (if connected to Firebase Auth)
    if (auth.currentUser && user && auth.currentUser.uid === user.id) {
      setCloudSyncStatus('syncing');
      try {
        const txnRef = doc(db, 'users', user.id, 'transactions', cleanTransaction.id);
        const completeTxn = sanitizeTxnForFirestore(cleanTransaction, user.id);
        await setDoc(txnRef, completeTxn);
        setCloudSyncStatus('synced');
      } catch (error: any) {
        setCloudSyncStatus('local');
        if (isPermissionError(error)) {
          console.warn("Cloud sync permission note:", error?.message || error);
        } else {
          console.warn("Firestore offline/unavailable during save, securely preserved in local ledger:", error?.message || error);
        }
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    if (user) {
      localStorage.setItem(`easyin_txns_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('easyin_transactions_v2', JSON.stringify(updated));
    localStorage.setItem('easyin_autobackup_v2', JSON.stringify(updated));
    setTransactions(updated);

    if (auth.currentUser && user && auth.currentUser.uid === user.id) {
      const path = `users/${user.id}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.id, 'transactions', id));
      } catch (error: any) {
        if (isPermissionError(error)) {
          handleFirestoreError(error, OperationType.DELETE, path);
        } else {
          console.warn("Firestore offline during delete, updated local ledger:", error?.message || error);
        }
      }
    }
    showToast('Estimate deleted successfully.', 'info');
  };

  const handleUpdateProfile = async (updatedProfile: BusinessProfile) => {
    setBusinessProfile(updatedProfile);

    if (auth.currentUser && user && auth.currentUser.uid === user.id) {
      const path = `users/${user.id}/profile/settings`;
      try {
        const profileRef = doc(db, 'users', user.id, 'profile', 'settings');
        await setDoc(profileRef, {
          ...updatedProfile,
          updatedAt: new Date().toISOString()
        });
        showToast('Settings saved to Cloud!', 'success');
      } catch (error: any) {
        if (isPermissionError(error)) {
          handleFirestoreError(error, OperationType.WRITE, path);
        } else {
          console.warn("Firestore offline during profile update, preserved in local storage:", error?.message || error);
        }
        showToast('Settings saved locally.', 'info');
      }
    } else {
      showToast('Settings saved locally.', 'info');
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    setViewState('list');
    setEditingTransaction(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    // Clear active session memory, but all user records remain securely stored in localStorage
    setUser(null);
    setTransactions([]);
    setBusinessProfile(DEFAULT_PROFILE);
    localStorage.removeItem('easyin_current_user');
    showToast('Signed out successfully.', 'info');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          transactions={transactions} 
          onAddInvoice={() => { setActiveTab('sales'); setViewState('form'); }} 
          onNavigate={handleNavigation} 
        />;
      
      case 'sales':
        if (viewState === 'form') {
          return (
            <TransactionForm 
              initialData={editingTransaction}
              profile={businessProfile}
              onSave={handleSaveTransaction}
              onCancel={() => {setViewState('list'); setEditingTransaction(null);}}
              user={user || undefined}
            />
          );
        }
        return (
          <TransactionList 
            transactions={transactions.filter(t => t.type === TransactionType.SALE)}
            onAdd={() => {setEditingTransaction(null); setViewState('form');}}
            onEdit={(t) => {setEditingTransaction(t); setViewState('form');}}
            onDelete={handleDeleteTransaction}
            profile={businessProfile}
          />
        );

      case 'reports': return <Reports transactions={transactions} />;
      case 'converter': return <UnitConverter />;
      case 'data': return <DataManagement transactions={transactions} onImport={setTransactions} profile={businessProfile} user={user} />;
      case 'settings': return <Settings 
        profile={businessProfile} 
        user={user!} 
        onUpdate={handleUpdateProfile} 
        onUpdateUser={(updatedUser) => {
            const storedUsers: User[] = JSON.parse(localStorage.getItem('easyin_users') || '[]');
            if (storedUsers.some(u => u.username === updatedUser.username && u.id !== updatedUser.id)) {
                showToast('Username is already taken', 'error');
                return;
            }
            setUser(updatedUser);
            setBusinessProfile(prev => ({ ...prev, businessName: updatedUser.businessName }));
            const updatedUsers = storedUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
            localStorage.setItem('easyin_users', JSON.stringify(updatedUsers));
            showToast('User profile updated', 'success');
        }}
        onLogout={handleLogout}
        onDeleteAccount={async () => {
            if (auth.currentUser && user) {
              try {
                await deleteDoc(doc(db, 'users', user.id, 'profile', 'settings'));
                for (const t of transactions) {
                  await deleteDoc(doc(db, 'users', user.id, 'transactions', t.id));
                }
                await signOut(auth);
              } catch (err) {
                console.warn('Could not purge cloud documents or offline:', err);
              }
            }
            setUser(null);
            setTransactions([]);
            setBusinessProfile(DEFAULT_PROFILE);
            localStorage.clear();
            showToast('Account data deleted', 'info');
        }}
      />;
      default: return <Dashboard transactions={transactions} onAddInvoice={() => { setActiveTab('sales'); setViewState('form'); }} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={handleNavigation} 
      businessName={businessProfile.businessName}
      user={user}
      onLogout={handleLogout}
      cloudSyncStatus={cloudSyncStatus}
    >
      {renderContent()}

      {/* Floating Toast Notification Center */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              toast.type === 'success' 
                ? 'bg-white dark:bg-slate-900 border-emerald-500/30 text-slate-800 dark:text-slate-100 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-white dark:bg-slate-900 border-rose-500/30 text-slate-800 dark:text-slate-100 shadow-rose-500/10'
                : 'bg-white dark:bg-slate-900 border-blue-500/30 text-slate-800 dark:text-slate-100 shadow-blue-500/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle size={18} className="text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-500 shrink-0" />}
            
            <p className="text-xs font-bold leading-tight flex-1">{toast.message}</p>
            
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
