import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Wallet, Plus, Calendar, Clock, ChevronDown, GraduationCap, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { 
    student, 
    walletBalance, 
    setIsRechargeOpen, 
    preOrderDateLabel, 
    breakSlot, 
    setIsPreOrderModalOpen,
    setIsStudentIdModalOpen,
    cart,
    setIsCartOpen
  } = useCanteen();

  return (
    <header className="sticky top-0 z-30 bg-leaf-900/95 backdrop-blur-md text-white border-b border-leaf-800 shadow-md">
      {/* Top Identity Row */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        {/* Student Class / Sec / Roll Badge */}
        <button 
          onClick={() => setIsStudentIdModalOpen(true)}
          className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full border-2 border-gold-400 bg-leaf-800 p-0.5 overflow-hidden shadow-sm flex-shrink-0">
            <img 
              src={student?.avatar || 'https://ui-avatars.com/api/?name=User&background=f3f4f6&color=9ca3af&size=200'} 
              alt={student?.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white tracking-tight leading-tight">
                {student?.name || 'Student'}
              </span>
              <span className="bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                {student?.className?.replace('Class ', '') || '10'}-{student?.section || 'B'}
              </span>
            </div>
            <p className="text-[11px] text-leaf-200 truncate max-w-[160px] font-medium flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-gold-400 inline" />
              Roll #{student?.rollNo || '24'} • {student?.schoolName?.split('(')[0] || 'DPS'}
            </p>
          </div>
        </button>

        {/* Golden Wallet Chip */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRechargeOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-gold-600 via-gold-500 to-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-full shadow-gold-glow hover:brightness-105 active:scale-95 transition-all text-xs"
          >
            <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center">
              <Wallet className="w-3 h-3 text-slate-950" />
            </div>
            <span className="tracking-tight font-extrabold text-[13px]">₹{walletBalance}</span>
            <div className="w-4 h-4 rounded-full bg-white/40 flex items-center justify-center">
              <Plus className="w-3 h-3 text-slate-950 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* Pre-Order Slot Banner */}
      <div className="px-4 pb-2.5">
        <button
          onClick={() => setIsPreOrderModalOpen(true)}
          className="w-full flex items-center justify-between bg-leaf-800/80 hover:bg-leaf-800 border border-leaf-700/60 px-3 py-1.5 rounded-xl text-xs transition-colors"
        >
          <div className="flex items-center gap-2 text-leaf-100 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
            </span>
            <span className="text-leaf-300 text-[11px] font-semibold uppercase tracking-wider">Pre-Ordering for:</span>
            <span className="text-gold-300 font-bold">{preOrderDateLabel}</span>
            <span className="text-leaf-300 font-normal">|</span>
            <span className="text-white font-medium capitalize">
              {breakSlot === 'recess' ? 'Morning Recess' : 'Lunch Break'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gold-400" />
        </button>
      </div>
    </header>
  );
};
