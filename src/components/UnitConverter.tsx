
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
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Unit Converter</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inches & Feet Utility</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
            {mode === 'i2f' ? 'Inches' : 'Feet'}
          </label>
          <input 
            type="number" 
            value={mode === 'i2f' ? inches : feet}
            onChange={(e) => handleConvert(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-center">
          <button 
            onClick={toggleMode}
            className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200"
          >
            <RefreshCw size={20} className={mode === 'f2i' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>

        <div className="relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
            {mode === 'i2f' ? 'Feet' : 'Inches'}
          </label>
          <div className="w-full px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl text-3xl font-black text-blue-600 flex items-center justify-between">
            <span>{mode === 'i2f' ? feet : inches}</span>
            <span className="text-xs font-black uppercase tracking-widest opacity-50">
              {mode === 'i2f' ? 'FT' : 'IN'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold leading-relaxed text-center uppercase tracking-widest">
          Quickly convert measurements for your printing estimates.
        </p>
      </div>
    </div>
  );
};
