
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2,
  Clock,
  ClipboardList
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  onAddInvoice: () => void;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddInvoice, onNavigate }) => {
  const stats = useMemo(() => {
    const sales = transactions.filter(t => t.type === TransactionType.SALE);
    
    const totalSales = sales.reduce((acc, t) => acc + Number(t.grandTotal || 0), 0);
    const collected = sales.filter(t => t.status === 'PAID').reduce((acc, t) => acc + Number(t.grandTotal || 0), 0);
    const pendingSales = sales.filter(t => t.status === 'UNPAID').reduce((acc, t) => acc + Number(t.grandTotal || 0), 0);

    return { totalSales, collected, pendingSales };
  }, [transactions]);

  const chartData = [
    { name: 'Total Estimates', amount: stats.totalSales, color: '#2563eb' },
    { name: 'Confirmed Sales', amount: stats.collected, color: '#10b981' },
    { name: 'Outstanding', amount: stats.pendingSales, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Dashboard</h1>
          <p className="text-slate-500 font-medium">Tracking your sales performance and collections.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onAddInvoice} className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-200 uppercase tracking-widest text-xs">
            New Estimate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Estimates" amount={stats.totalSales} icon={<TrendingUp size={20} />} color="blue" />
        <StatCard title="Confirmed Sales" amount={stats.collected} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard title="Outstanding" amount={stats.pendingSales} icon={<Clock size={20} />} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sales Snapshot</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#94a3b8', fontSize: 10 }} dy={10} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Collection Insights</h3>
           <div className="space-y-6">
              <StatusProgress label="Recovery Rate" value={stats.collected} total={stats.totalSales} color="bg-emerald-500" />
              <div className="pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Analysis</p>
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">Confirmed Portion:</span>
                       <span className="font-bold text-emerald-600">
                         {stats.totalSales > 0 ? ((stats.collected / stats.totalSales) * 100).toFixed(1) : 0}%
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, icon, color }: { title: string, amount: number, icon: any, color: 'blue' | 'emerald' | 'rose' }) => {
  const styles = {
    blue: 'bg-blue-600 text-white shadow-blue-200',
    emerald: 'bg-emerald-600 text-white shadow-emerald-200',
    rose: 'bg-rose-600 text-white shadow-rose-200',
  };
  return (
    <div className={`p-6 rounded-3xl ${styles[color]} shadow-xl transition-transform hover:scale-[1.02] relative overflow-hidden group`}>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{title}</h3>
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">{icon}</div>
        </div>
        <p className="text-2xl font-black tracking-tighter">
          ₹{Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
         {icon}
      </div>
    </div>
  );
};

const StatusProgress = ({ label, value, total, color }: any) => {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
          <span className="text-[10px] font-black text-slate-900">{percentage.toFixed(0)}%</span>
       </div>
       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
       </div>
    </div>
  );
};
