
import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { IndianRupee, Download, ClipboardList, CheckCircle, TrendingUp } from 'lucide-react';
import { exportTransactionsToCSV } from '../utils/csvExporter.ts';

interface ReportsProps {
  transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    const sales = transactions.filter(t => t.type === TransactionType.SALE);

    const totalSales = sales.reduce((acc, t) => acc + Number(t.grandTotal || 0), 0);
    
    const collected = sales
      .filter(t => t.status === 'PAID')
      .reduce((acc, t) => acc + Number(t.grandTotal || 0), 0);
      
    const outstandingSales = sales
      .filter(t => t.status === 'UNPAID')
      .reduce((acc, t) => acc + Number(t.grandTotal || 0), 0);

    return { totalSales, collected, outstandingSales };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Reports</h1>
          <p className="text-slate-500 font-medium">Detailed analysis of your sales estimates and collections.</p>
        </div>
        <button 
          onClick={() => exportTransactionsToCSV(transactions, "Sales_Performance_Report")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-200 text-xs uppercase tracking-widest"
        >
          <Download size={18} />
          Export All (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard title="Total Estimates" value={stats.totalSales} color="blue" icon={<ClipboardList size={20} />} />
        <ReportCard title="Confirmed Revenue" value={stats.collected} color="emerald" icon={<CheckCircle size={20} />} />
        <ReportCard title="Outstanding" value={stats.outstandingSales} color="rose" icon={<IndianRupee size={20} />} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Performance Breakdown</h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <SummaryRow label="Total Estimates Count" value={transactions.filter(t => t.type === TransactionType.SALE).length.toString()} />
                    <SummaryRow label="Confirmed Collection" value={`₹${stats.collected.toFixed(2)}`} />
                </div>
                <div className="space-y-4">
                    <SummaryRow label="Outstanding Amount" value={`₹${stats.outstandingSales.toFixed(2)}`} />
                    <SummaryRow label="Recovery Efficiency" value={`${stats.totalSales > 0 ? ((stats.collected / stats.totalSales) * 100).toFixed(1) : '0'}%`} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({title, value, color, icon}: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return (
        <div className={`p-8 rounded-3xl border ${colors[color]} flex flex-col justify-between h-40`}>
            <div className="flex justify-between items-start">
                 <h4 className="text-xs font-black uppercase tracking-widest opacity-80">{title}</h4>
                 <div className="p-2 bg-white/50 rounded-xl">{icon}</div>
            </div>
            <p className="text-3xl font-black mt-2">₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
    );
}

const SummaryRow = ({label, value}: any) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
        <span className="text-sm font-bold text-slate-500">{label}</span>
        <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
);
