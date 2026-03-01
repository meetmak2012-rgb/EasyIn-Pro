
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { Reports } from './components/Reports';
import { DataManagement } from './components/DataManagement';
import { Settings } from './components/Settings';
import { UnitConverter } from './components/UnitConverter';
import { Transaction, BusinessProfile, TransactionType } from './types';

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
  minItemAmount: 0
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [viewState, setViewState] = useState<'list' | 'form'>('list');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const savedTxns = localStorage.getItem('easyin_transactions_v2');
    if (savedTxns) setTransactions(JSON.parse(savedTxns));

    const savedProfile = localStorage.getItem('easyin_profile_v2');
    if (savedProfile) {
      setBusinessProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
    }
  }, []);

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

  const handleSaveTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions(prev => [transaction, ...prev]);
    }
    setViewState('list');
    setEditingTransaction(null);
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    setViewState('list');
    setEditingTransaction(null);
  };

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
            />
          );
        }
        return (
          <TransactionList 
            transactions={transactions.filter(t => t.type === TransactionType.SALE)}
            onAdd={() => {setEditingTransaction(null); setViewState('form');}}
            onEdit={(t) => {setEditingTransaction(t); setViewState('form');}}
            onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
            profile={businessProfile}
          />
        );

      case 'reports': return <Reports transactions={transactions} />;
      case 'converter': return <UnitConverter />;
      case 'data': return <DataManagement transactions={transactions} onImport={setTransactions} />;
      case 'settings': return <Settings profile={businessProfile} onUpdate={setBusinessProfile} />;
      default: return <Dashboard transactions={transactions} onAddInvoice={() => { setActiveTab('sales'); setViewState('form'); }} onNavigate={handleNavigation} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigation} businessName={businessProfile.businessName}>
      {renderContent()}
    </Layout>
  );
};

export default App;
