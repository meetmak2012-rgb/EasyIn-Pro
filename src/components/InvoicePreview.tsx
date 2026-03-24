
import React from 'react';
import { Transaction, BusinessProfile } from '../types';

interface InvoicePreviewProps {
  transaction: Transaction;
  profile: BusinessProfile;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ transaction, profile }) => {
  const CURRENCY_SYMBOL = profile.currencySymbol || '₹';

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-12 shadow-2xl font-sans text-slate-900">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{profile.businessName}</h1>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Sales Estimate / Quotation</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estimate No.</p>
          <p className="text-xl font-black text-slate-900">{transaction.invoiceNumber}</p>
          <p className="text-xs font-bold text-slate-500 mt-2">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-12">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bill To:</h3>
          <p className="text-lg font-black text-slate-900">{transaction.partyName}</p>
          <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{transaction.billingAddress}</p>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status:</h3>
          <span className={`inline-block px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${transaction.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            {transaction.status}
          </span>
        </div>
      </div>

      <table className="w-full mt-12 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
            <th className="py-4">Description</th>
            <th className="py-4 text-center">Material</th>
            <th className="py-4 text-center">Size (WxH)</th>
            <th className="py-4 text-center">Qty</th>
            <th className="py-4 text-right">Rate</th>
            <th className="py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transaction.items.map((item, idx) => (
            <tr key={idx} className="text-sm">
              <td className="py-4">
                <p className="font-black text-slate-900">{item.description}</p>
                {item.details && <p className="text-[10px] text-slate-400 mt-0.5">{item.details}</p>}
              </td>
              <td className="py-4 text-center font-bold text-slate-600">{item.material || '-'}</td>
              <td className="py-4 text-center font-bold text-slate-600">{item.sizeA} x {item.sizeB}</td>
              <td className="py-4 text-center font-black text-slate-900">{item.quantity}</td>
              <td className="py-4 text-right font-bold text-slate-600">{CURRENCY_SYMBOL}{item.rate}</td>
              <td className="py-4 text-right font-black text-slate-900">{CURRENCY_SYMBOL}{item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 pt-8 border-t-2 border-slate-900 flex justify-between items-start">
        <div className="max-w-md">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes & Terms:</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{profile.pdfFooterNote}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex justify-end gap-8 text-sm">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Subtotal:</span>
            <span className="font-black text-slate-900 w-32">{CURRENCY_SYMBOL}{transaction.subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-end gap-8 text-xl pt-4 border-t border-slate-100">
            <span className="font-black text-slate-900 uppercase tracking-tighter">Total:</span>
            <span className="font-black text-primary w-32">{CURRENCY_SYMBOL}{transaction.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-24 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">This is a computer generated document</p>
      </div>
    </div>
  );
};
