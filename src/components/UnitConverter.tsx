
import React, { useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';

export const UnitConverter: React.FC = () => {
  const [inches, setInches] = useState<string>('');
  const [feet, setFeet] = useState<string>('');
  const [mode, setMode] = useState<'i2f' | 'f2i'>('i2f');

  const handleConvert = (val: string) => {
    if (mode === 'i2f') {
      setInches(val);
      const f = parseFloat(val) / 12;
      setFeet(isNaN(f) ? '' : f.toFixed(2));
    } else {
      setFeet(val);
      const i = parseFloat(val) * 12;
      setInches(isNaN(i) ? '' : i.toFixed(2));
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'i2f' ? 'f2i' : 'i2f');
    setInches('');
    setFeet('');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Unit Converter</h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Inches & Feet Utility</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
            {mode === 'i2f' ? 'Inches' : 'Feet'}
          </label>
          <input 
            type="number" 
            value={mode === 'i2f' ? inches : feet}
            onChange={(e) => handleConvert(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-black text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-center">
          <button 
            onClick={toggleMode}
            className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-primary/10 hover:text-primary transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={20} className={mode === 'f2i' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>

        <div className="relative">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
            {mode === 'i2f' ? 'Feet' : 'Inches'}
          </label>
          <div className="w-full px-6 py-4 bg-primary/10 border border-primary/20 rounded-2xl text-3xl font-black text-primary flex items-center justify-between">
            <span>{mode === 'i2f' ? feet : inches}</span>
            <span className="text-xs font-black uppercase tracking-widest opacity-50">
              {mode === 'i2f' ? 'FT' : 'IN'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed text-center uppercase tracking-widest">
          Quickly convert measurements for your printing estimates.
        </p>
      </div>
    </div>
  );
};
