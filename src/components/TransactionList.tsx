
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, FileText, Download, Edit, Trash2, ClipboardCheck, XCircle, CheckCircle2, Clock, Tag
} from 'lucide-react';
import { Transaction, BusinessProfile } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator.ts';
import { exportTransactionsToCSV, copyTransactionsToClipboard } from '../utils/csvExporter.ts';

interface TransactionListProps {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  profile: BusinessProfile;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onAdd, onEdit, onDelete, profile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  const filtered = transactions.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = t.partyName.toLowerCase().includes(searchLower) || t.invoiceNumber.toLowerCase().includes(searchLower);
    if (!matchSearch) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  const clearFilters = () => {
    setDateFrom(''); setDateTo(''); setStatusFilter('ALL'); setSearchTerm('');
  };

  const handleDownload = async (e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    try { await generateInvoicePDF(t, profile); } catch (e) { alert("Failed to generate PDF."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="text-blue-600" />
            Sales Estimates
          </h1>
          <p className="text-slate-500 font-medium">History of all recorded sales transactions.</p>
        </div>
        <button 
          onClick={onAdd}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-black shadow-lg text-white uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 shadow-blue-200`}
        >
          <Plus size={18} />
          <span>New Estimate</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="relative flex-1 w-full md:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
             <input 
                type="text" 
                placeholder={`Search customer or number...`} 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-medium outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => copyTransactionsToClipboard(filtered)} className="flex-1 md:flex-none p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors" title="Copy for Sheets">
                <ClipboardCheck size={20} />
             </button>
             <button onClick={() => exportTransactionsToCSV(filtered, "Estimates_Export")} className="flex-1 md:flex-none p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors" title="Export CSV">
                <FileText size={20} />
             </button>
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showFilters || (dateFrom || dateTo || statusFilter !== 'ALL') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
             >
                <Filter size={14} /> Filter
             </button>
           </div>
        </div>

        {showFilters && (
          <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Range Selection</label>
                <div className="flex items-center gap-3">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                  <span className="text-slate-300 font-black">TO</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Filter</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none">
                  <option value="ALL">ALL RECORDS</option>
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">PENDING</option>
                </select>
              </div>
            </div>
            {(dateFrom || dateTo || statusFilter !== 'ALL') && (
              <div className="mt-4 flex justify-end">
                <button onClick={clearFilters} className="text-[10px] font-black text-rose-500 hover:text-rose-700 flex items-center gap-1 uppercase tracking-widest">
                  <XCircle size={14} /> Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-slate-200">
              <tr className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Number</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No records found.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-900">{t.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-900 font-bold">{t.partyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-900 text-right font-black">₹{Number(t.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${t.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {t.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {t.status === 'PAID' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleDownload(e, t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl" title="Download PDF"><Download size={16} /></button>
                        <button onClick={() => onEdit(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => window.confirm("Permanently delete this entry?") && onDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
