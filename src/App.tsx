
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
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';

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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [viewState, setViewState] = useState<'list' | 'form'>('list');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Validate firestore connection initially
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration or internet connection.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('easyin_current_user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, password: parsedUser.password || '' });
    }

    const savedTxns = localStorage.getItem('easyin_transactions_v2');
    if (savedTxns) setTransactions(JSON.parse(savedTxns));

    const savedProfile = localStorage.getItem('easyin_profile_v2');
    if (savedProfile) {
      setBusinessProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
    }
  }, []);

  // Fetch Firestore transactions & profile settings when Google User logs in
  useEffect(() => {
    if (user && user.isGoogle) {
      const loadFirestoreData = async () => {
        try {
          // 1. Fetch user settings profile
          const profilePath = `users/${user.id}/profile/settings`;
          const profileRef = doc(db, profilePath);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setBusinessProfile(profileSnap.data() as BusinessProfile);
          } else {
            const initialProfile = {
              ...DEFAULT_PROFILE,
              businessName: user.businessName
            };
            await setDoc(profileRef, initialProfile);
            setBusinessProfile(initialProfile);
          }

          // 2. Fetch user transactions
          const txnsPath = `users/${user.id}/transactions`;
          const txnsQuery = collection(db, txnsPath);
          const querySnapshot = await getDocs(txnsQuery);
          const loadedTxns: Transaction[] = [];
          querySnapshot.forEach((doc) => {
            loadedTxns.push(doc.data() as Transaction);
          });
          loadedTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(loadedTxns);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.id}`);
        }
      };
      loadFirestoreData();
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('easyin_current_user', JSON.stringify(user));
    else localStorage.removeItem('easyin_current_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('easyin_transactions_v2', JSON.stringify(transactions));
    
    if (transactions.length > 0) {
      localStorage.setItem('easyin_autobackup_v2', JSON.stringify(transactions));
      localStorage.setItem('easyin_last_autobackup', new Date().toISOString());
    }
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('easyin_profile_v2', JSON.stringify(businessProfile));
  }, [businessProfile]);

  const handleLogin = (u: User) => {
    setUser(u);
    setBusinessProfile(prev => ({ ...prev, businessName: u.businessName }));
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    if (user?.isGoogle) {
      const path = `users/${user.id}/transactions/${transaction.id}`;
      try {
        const txnRef = doc(db, 'users', user.id, 'transactions', transaction.id);
        const completeTxn = {
          ...transaction,
          userId: user.id,
          updatedAt: new Date().toISOString()
        };
        await setDoc(txnRef, completeTxn);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions(prev => [transaction, ...prev]);
    }
    setViewState('list');
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user?.isGoogle) {
      const path = `users/${user.id}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.id, 'transactions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateProfile = async (updatedProfile: BusinessProfile) => {
    setBusinessProfile(updatedProfile);
    if (user?.isGoogle) {
      const path = `users/${user.id}/profile/settings`;
      try {
        const profileRef = doc(db, 'users', user.id, 'profile', 'settings');
        await setDoc(profileRef, {
          ...updatedProfile,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    setViewState('list');
    setEditingTransaction(null);
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
            console.log('Updating user:', updatedUser);
            const storedUsers: User[] = JSON.parse(localStorage.getItem('easyin_users') || '[]');
            if (storedUsers.some(u => u.username === updatedUser.username && u.id !== updatedUser.id)) {
                alert('Username is already taken');
                return;
            }
            setUser(updatedUser);
            setBusinessProfile(prev => ({ ...prev, businessName: updatedUser.businessName }));
            const updatedUsers = storedUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
            console.log('Updated users array:', updatedUsers);
            localStorage.setItem('easyin_users', JSON.stringify(updatedUsers));
        }}
        onLogout={() => {
            if (user?.isGoogle) {
                signOut(auth).catch(err => console.error('Sign out error:', err));
            }
            setUser(null);
            setTransactions([]);
            setBusinessProfile(DEFAULT_PROFILE);
        }}
        onDeleteAccount={async () => {
            if (user?.isGoogle) {
              try {
                // Delete setting profile
                await deleteDoc(doc(db, 'users', user.id, 'profile', 'settings'));
                // Delete all transactions from DB
                for (const t of transactions) {
                  await deleteDoc(doc(db, 'users', user.id, 'transactions', t.id));
                }
                await signOut(auth);
              } catch (err) {
                console.error('Failed to purge cloud documents:', err);
              }
            }
            setUser(null);
            setTransactions([]);
            setBusinessProfile(DEFAULT_PROFILE);
            localStorage.clear();
        }}
      />;
      default: return <Dashboard transactions={transactions} onAddInvoice={() => { setActiveTab('sales'); setViewState('form'); }} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigation} businessName={businessProfile.businessName}>
      {renderContent()}
    </Layout>
  );
};

export default App;
