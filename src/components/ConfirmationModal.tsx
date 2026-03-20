
import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-4 text-rose-600">
          <ShieldAlert size={32} />
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
        </div>
        <p className="text-slate-600 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-lg font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};
