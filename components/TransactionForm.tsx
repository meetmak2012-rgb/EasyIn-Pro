
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, ArrowLeft, Eye, EyeOff, Save, Tag } from 'lucide-react';
import { LineItem, Transaction, TransactionType, BusinessProfile } from '../types';
import { InvoicePreview } from './InvoicePreview';

interface TransactionFormProps {
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
  initialData?: Transaction | null;
  profile: BusinessProfile;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onCancel, initialData, profile }) => {
  const [partyName, setPartyName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', material: '', details: '', sizeA: 0, sizeB: 0, quantity: 1, sqFt: 0, rate: 0, amount: 0 }
  ]);
  const [status, setStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [showPreview, setShowPreview] = useState(true);

  const themeColor = 'bg-blue-600';
  const themeText = 'text-blue-600';
  const themeShadow = 'shadow-blue-100';

  const CURRENCY_SYMBOL = profile.currencySymbol === '₹' ? '₹' : profile.currencySymbol;

  useEffect(() => {
    if (initialData) {
      setPartyName(initialData.partyName);
      setBillingAddress(initialData.billingAddress || '');
      setInvoiceNumber(initialData.invoiceNumber);
      setDate(initialData.date);
      setItems(initialData.items);
      setStatus(initialData.status);
    } else {
      setInvoiceNumber(`EST-${Math.floor(1000 + Math.random() * 9000)}`);
      setStatus(profile.defaultStatus || 'UNPAID');
    }
  }, [initialData, profile.defaultStatus]);

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const a = Number(updated.sizeA) || 0;
        const b = Number(updated.sizeB) || 0;
        const q = Number(updated.quantity) || 1;
        const r = Number(updated.rate) || 0;

        updated.sqFt = Number((a * b * q).toFixed(2));
        updated.amount = Number((updated.sqFt * r).toFixed(2));
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), description: '', material: '', details: '', sizeA: 0, sizeB: 0, quantity: 1, sqFt: 0, rate: 0, amount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id));
  };

  const totals = useMemo(() => {
    const subTotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    return { subTotal, grandTotal: subTotal };
  }, [items]);

  const handleSave = () => {
    if (!partyName) { alert("Please enter Customer Name"); return; }
    if (!invoiceNumber) { alert("Please enter Estimate Number"); return; }
    onSave({
      id: initialData?.id || Date.now().toString(),
      type: TransactionType.SALE,
      invoiceNumber,
      date,
      partyName,
      billingAddress,
      items,
      ...totals,
      status
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#f8fafc] flex flex-col overflow-hidden text-slate-900">
      <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-5">
          <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg text-white ${themeColor}`}>
                <Tag size={18} />
             </div>
             <div>
                <h2 className="text-sm font-black text-slate-900 leading-none">Record Sale Estimate</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {invoiceNumber}</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            {showPreview ? <EyeOff size={14}/> : <Eye size={14}/>}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button 
            onClick={handleSave} 
            className={`flex items-center gap-2 text-white px-8 py-2.5 rounded-xl transition-all font-black shadow-lg text-[10px] uppercase tracking-widest ${themeColor} hover:brightness-110 ${themeShadow}`}
          >
            <Save size={14} />
            Save Estimate
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full ${showPreview ? 'lg:w-[40%] xl:w-[30%]' : 'max-w-3xl mx-auto'} overflow-y-auto bg-white p-6 border-r border-slate-200 custom-scrollbar`}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Name</label>
                <input 
                  type="text" 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)} 
                  className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-current focus:bg-white transition-all outline-none text-sm font-bold ${themeText}`} 
                  placeholder="Customer Name" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimate No.</label>
                <input 
                  type="text" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-black" 
                  placeholder="EST-0000" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)} 
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-black outline-none transition-all ${status === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}
                  >
                    <option value="UNPAID">PENDING</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Billing Address / Notes</label>
              <textarea 
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm min-h-[60px] resize-none font-medium"
                placeholder="Optional address or terms..."
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Line Items</h3>
                <button onClick={addItem} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:underline ${themeText}`}>
                  <Plus size={14}/> Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 relative group hover:border-slate-300 transition-all">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    )}
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase">Item Description</label>
                        <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full bg-[#1e293b] text-white rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold" placeholder="Description..." />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Material</label>
                            <select value={item.material} onChange={(e) => handleItemChange(item.id, 'material', e.target.value)} className="w-full bg-[#1e293b] text-white rounded-lg px-3 py-2 text-xs outline-none font-bold">
                               <option value="">Select Material</option>
                               {profile.materials.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Remarks</label>
                            <input type="text" value={item.details} onChange={(e) => handleItemChange(item.id, 'details', e.target.value)} className="w-full bg-[#1e293b] text-white rounded-lg px-3 py-2 text-xs outline-none font-bold" placeholder="Notes..." />
                         </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Size (WxH)</label>
                          <div className="flex items-center gap-1">
                            <input type="number" value={item.sizeA} onChange={(e) => handleItemChange(item.id, 'sizeA', e.target.value)} className="w-full bg-[#1e293b] text-white rounded px-2 py-1.5 text-xs text-center font-bold" />
                            <input type="number" value={item.sizeB} onChange={(e) => handleItemChange(item.id, 'sizeB', e.target.value)} className="w-full bg-[#1e293b] text-white rounded px-2 py-1.5 text-xs text-center font-bold" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Qty</label>
                          <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full bg-[#1e293b] text-white rounded px-2 py-1.5 text-xs text-center font-black" />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[8px] font-bold uppercase ${themeText}`}>SqFt</label>
                          <div className={`w-full px-2 py-1.5 text-[10px] font-black text-center rounded border bg-blue-50 text-blue-600 border-blue-100`}>{item.sqFt}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Rate</label>
                          <input type="number" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full bg-[#1e293b] text-white rounded px-2 py-1.5 text-xs text-right font-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex flex-col items-end border-t border-slate-100">
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total</div>
               <div className="text-4xl font-black text-slate-900 flex items-center tracking-tighter">
                 <span className="text-slate-400 font-bold text-lg mr-2">{CURRENCY_SYMBOL}</span>
                 {Number(totals.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
               </div>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="flex-1 bg-slate-100 flex items-start justify-center p-8 overflow-y-auto">
             <div className="scale-[0.85] origin-top shadow-2xl">
                <InvoicePreview 
                  transaction={{
                    ...initialData, 
                    type: TransactionType.SALE,
                    partyName, 
                    billingAddress,
                    date, 
                    invoiceNumber, 
                    items, 
                    ...totals, 
                    status
                  } as any} 
                  profile={profile} 
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
