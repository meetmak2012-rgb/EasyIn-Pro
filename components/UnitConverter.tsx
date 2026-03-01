
import React, { useState } from 'react';
import { Ruler, Maximize, RefreshCcw, Calculator, ArrowRightLeft } from 'lucide-react';

export const UnitConverter: React.FC = () => {
  // Simple Length States
  const [inches, setInches] = useState<string>('');
  const [feet, setFeet] = useState<string>('');

  // Area Calc States
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [dimUnit, setDimUnit] = useState<'inch' | 'feet'>('inch');
  
  const handleInchChange = (val: string) => {
    setInches(val);
    if (!val || isNaN(Number(val))) {
      setFeet('');
      return;
    }
    setFeet((Number(val) / 12).toFixed(3));
  };

  const handleFeetChange = (val: string) => {
    setFeet(val);
    if (!val || isNaN(Number(val))) {
      setInches('');
      return;
    }
    setInches((Number(val) * 12).toFixed(3));
  };

  const calculateSqFt = () => {
    const w = Number(width);
    const h = Number(height);
    if (isNaN(w) || isNaN(h)) return '0.00';
    
    if (dimUnit === 'inch') {
      return ((w * h) / 144).toFixed(2);
    }
    return (w * h).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900">Unit Converter</h1>
        <p className="text-slate-500">Fast calculations for dimensional printing and billing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Length Converter Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Ruler size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Length (Inch ↔ Feet)</h3>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Inches</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={inches}
                  onChange={(e) => handleInchChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">in</span>
              </div>
            </div>

            <div className="flex justify-center py-2">
              <div className="p-2 bg-slate-100 rounded-full text-slate-400">
                <ArrowRightLeft size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Feet</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={feet}
                  onChange={(e) => handleFeetChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ft</span>
              </div>
            </div>

            <div className="pt-4 text-[10px] text-slate-400 uppercase font-black tracking-tighter text-center">
              Formula: Feet = Inches ÷ 12
            </div>
          </div>
        </div>

        {/* Square Feet Helper Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Maximize size={20} className="text-purple-600" />
            <h3 className="font-bold text-slate-800">Area Helper (Sq. Feet)</h3>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setDimUnit('inch')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${dimUnit === 'inch' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Inches
              </button>
              <button 
                onClick={() => setDimUnit('feet')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${dimUnit === 'feet' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Feet
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Width</label>
                <input 
                  type="number" 
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Height</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
               <div className="bg-blue-600 rounded-xl p-6 text-white text-center shadow-lg shadow-blue-100">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Result</p>
                  <div className="text-4xl font-black">{calculateSqFt()}</div>
                  <p className="text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Square Feet</p>
               </div>
            </div>

            <button 
              onClick={() => { setWidth(''); setHeight(''); }}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase pt-2"
            >
              <RefreshCcw size={12} /> Clear Dimensions
            </button>
          </div>
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Calculator size={20} className="text-slate-600" />
          <h3 className="font-bold text-slate-800">Quick Reference Guide</h3>
        </div>
        <div className="p-0">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Conversion Type</th>
                  <th className="px-6 py-3">Factor</th>
                  <th className="px-6 py-3 text-right">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">Inch to Feet</td>
                  <td className="px-6 py-4 text-slate-500">Divide by 12</td>
                  <td className="px-6 py-4 text-right font-mono text-xs">12" = 1 ft</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">Sq. Inch to Sq. Feet</td>
                  <td className="px-6 py-4 text-slate-500">Divide by 144</td>
                  <td className="px-6 py-4 text-right font-mono text-xs">144 sqin = 1 sqft</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">Foot to Meter</td>
                  <td className="px-6 py-4 text-slate-500">Multiply by 0.3048</td>
                  <td className="px-6 py-4 text-right font-mono text-xs">10 ft = 3.048 m</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">Sq. Foot to Sq. Meter</td>
                  <td className="px-6 py-4 text-slate-500">Divide by 10.764</td>
                  <td className="px-6 py-4 text-right font-mono text-xs">10 sqft = 0.929 sqm</td>
                </tr>
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
