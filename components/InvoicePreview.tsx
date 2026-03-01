
import React from 'react';
import { Transaction, BusinessProfile } from '../types';

interface InvoicePreviewProps {
  transaction: Transaction;
  profile: BusinessProfile;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ transaction, profile }) => {
  const themeColor = profile.pdfThemeColor || '#2563eb';
  const currencySymbol = profile.currencySymbol === '₹' ? 'Rs.' : profile.currencySymbol;

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] flex flex-col font-sans text-slate-800 relative shadow-2xl">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-4xl font-black mb-1 uppercase tracking-tight" style={{ color: themeColor }}>ESTIMATE</h1>
        </div>
        <div className="text-right relative">
          <div className="text-6xl font-black text-slate-100 uppercase tracking-tighter absolute -top-4 right-0 select-none opacity-60">
            ESTIMATE
          </div>
          <div className="relative pt-8 z-10">
            <p className="text-[10pt] font-medium text-slate-600">Estimate #: <span className="font-bold text-slate-900">{transaction.invoiceNumber}</span></p>
            <p className="text-[10pt] font-medium text-slate-600">Date: <span className="font-bold text-slate-900">{transaction.date}</span></p>
            <div className="mt-4 flex justify-end">
              <span className={`px-8 py-1.5 rounded-md text-[9pt] font-black uppercase tracking-widest border-2 ${transaction.status === 'PAID' ? 'bg-white text-emerald-500 border-emerald-500/30' : 'bg-white text-rose-500 border-rose-500/30'}`}>
                {transaction.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 border-t border-slate-100 pt-8">
        <p className="text-[8.5pt] font-black text-slate-400 uppercase tracking-widest mb-3">BILLED TO</p>
        <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{transaction.partyName || "-"}</h3>
        <p className="text-[10pt] text-slate-500 max-w-[300px] whitespace-pre-wrap leading-relaxed">{transaction.billingAddress || "-"}</p>
      </div>

      {/* Items Table */}
      <div className="flex-1">
        <table className="w-full text-left text-[9pt] border-collapse">
          <thead>
            <tr style={{ backgroundColor: themeColor, color: '#ffffff' }}>
              <th className="p-3 w-10 text-center font-black">#</th>
              <th className="p-3 font-black uppercase">Description</th>
              <th className="p-3 font-black uppercase">Details</th>
              <th className="p-3 font-black uppercase">Material</th>
              <th className="p-3 font-black uppercase text-center">Size</th>
              <th className="p-3 font-black uppercase text-center">Qty</th>
              <th className="p-3 font-black uppercase text-center">Total SqFt</th>
              <th className="p-3 font-black uppercase text-right">Rate</th>
              <th className="p-3 font-black uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transaction.items.map((item, i) => (
              <tr key={i} className="align-middle">
                <td className="p-3 text-center text-slate-400 font-bold">{i + 1}</td>
                <td className="p-3 font-bold text-slate-900">{item.description || "-"}</td>
                <td className="p-3 text-slate-400">{item.details || "-"}</td>
                <td className="p-3 text-slate-600">{item.material || "-"}</td>
                <td className="p-3 text-center text-slate-500 font-medium">{item.sizeA}x{item.sizeB}</td>
                <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                <td className="p-3 text-center font-bold text-slate-700">{item.sqFt}</td>
                <td className="p-3 text-right text-slate-500">{Number(item.rate || 0).toFixed(2)}</td>
                <td className="p-3 text-right font-black text-slate-900">{Number(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Summary */}
        <div className="mt-12 flex justify-end">
          <div 
            className="flex items-center gap-12 px-10 py-5 rounded-lg text-white shadow-xl"
            style={{ backgroundColor: themeColor }}
          >
            <span className="uppercase text-[10pt] font-black tracking-widest opacity-90">TOTAL AMOUNT</span>
            <span className="text-2xl font-black whitespace-nowrap">
              {currencySymbol} {Number(transaction.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Terms Section */}
      <div className="mt-20">
        <h4 className="text-[9pt] font-black text-slate-400 uppercase tracking-widest mb-2">TERMS & CONDITIONS</h4>
        <p className="text-[9.5pt] text-slate-500 leading-relaxed max-w-lg italic">
          {profile.pdfFooterNote || "Thank you for your business! Goods once sold will not be taken back."}
        </p>
      </div>

      {/* Signature Section */}
      <div className="mt-auto pt-10 flex justify-end">
        <div className="text-center w-64">
          <div className="border-t border-slate-200 pt-3">
             <p className="text-[10pt] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[8pt] text-slate-300 font-bold uppercase tracking-widest border-t border-slate-50 pt-4">
        Generated using EasyIn Invoicing • Date: {new Date().toLocaleString()}
      </div>
    </div>
  );
};
