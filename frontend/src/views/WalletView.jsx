import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export const WalletView = () => {
  const { walletBalance, transactions, setIsRechargeOpen, student } = useCanteen();

  return (
    <div className="pb-28 pt-3 px-4 space-y-3.5">
      {/* 1. Soft Warm Champagne Student Prepaid Canteen Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-gold-200 via-gold-100 to-amber-50 dark:from-gold-950/80 dark:via-gold-900/60 dark:to-leaf-950 p-5 text-gold-950 dark:text-gold-100 shadow-sm border border-gold-300/80 dark:border-gold-800/80 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/40 dark:bg-gold-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gold-900 dark:bg-gold-400 text-gold-100 dark:text-gold-950 flex items-center justify-center font-bold text-xs shadow-xs">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold-800 dark:text-gold-300 block leading-tight">
                Canteen Wallet
              </span>
              <span className="text-xs font-semibold text-gold-950 dark:text-white line-clamp-1">
                {student?.schoolName?.split('(')[0] || 'School Canteen'}
              </span>
            </div>
          </div>
          <span className="bg-gold-900/10 dark:bg-gold-400/20 text-gold-900 dark:text-gold-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-gold-300 dark:border-gold-700">
            {student?.uniqueId || 'STU-10B-24'}
          </span>
        </div>

        {/* Balance Display */}
        <div className="my-2 relative z-10">
          <span className="text-[10px] font-semibold text-gold-800 dark:text-gold-300 uppercase tracking-wider block">
            Available Balance
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl font-extrabold text-gold-950 dark:text-white tracking-tight">
              ₹{walletBalance}
            </span>
            <span className="text-xs font-bold text-gold-800 dark:text-gold-300">INR</span>
          </div>
        </div>

        {/* Student Holder Footer */}
        <div className="pt-3 border-t border-gold-300/60 dark:border-gold-800/60 flex items-center justify-between relative z-10">
          <div>
            <span className="text-[9px] text-gold-800 dark:text-gold-300 font-semibold block uppercase tracking-wider">
              Card Holder
            </span>
            <span className="font-bold text-xs text-gold-950 dark:text-white">
              {student?.name} ({student?.className}-{student?.section} #{student?.rollNo})
            </span>
          </div>

          <button
            onClick={() => setIsRechargeOpen(true)}
            className="bg-gold-900 dark:bg-gold-400 hover:bg-gold-800 dark:hover:bg-gold-300 text-gold-50 dark:text-gold-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Top-Up</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Recharge Trigger Banner */}
      <div className="bg-white dark:bg-leaf-950/60 p-3.5 rounded-2xl border border-leaf-100 dark:border-leaf-800/80 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-xs text-gray-900 dark:text-white">Need more canteen credits?</h4>
          <p className="text-[11px] text-gray-500 dark:text-leaf-300/80">Recharge instantly via UPI (GPay/PhonePe) or Card.</p>
        </div>
        <button
          onClick={() => setIsRechargeOpen(true)}
          className="bg-leaf-600 hover:bg-leaf-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
        >
          Add Money
        </button>
      </div>

      {/* 3. Passbook & Transaction Ledger */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-gray-800 dark:text-white uppercase tracking-wider">
            Wallet Passbook & History
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-leaf-300/70 font-semibold uppercase">
            {transactions.length} Transactions
          </span>
        </div>

        <div className="space-y-2">
          {transactions.map((txn) => {
            const isCredit = txn.type === 'credit';
            return (
              <div
                key={txn.id}
                className="bg-white dark:bg-leaf-950/50 p-3 rounded-2xl border border-leaf-100/80 dark:border-leaf-800/60 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      isCredit
                        ? 'bg-leaf-50 text-leaf-700 dark:bg-leaf-900/60 dark:text-leaf-300'
                        : 'bg-gold-50 text-gold-700 dark:bg-gold-950/60 dark:text-gold-400'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{txn.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-leaf-300/70 truncate">{txn.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 dark:text-leaf-300/50 font-medium">
                      <span>{txn.date}</span>
                      <span>•</span>
                      <span>{txn.method}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-sm font-bold block ${
                      isCredit ? 'text-leaf-700 dark:text-leaf-300' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{txn.amount}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                      isCredit ? 'bg-leaf-50 text-leaf-700 dark:bg-leaf-900/50 dark:text-leaf-300' : 'bg-gray-100 text-gray-600 dark:bg-leaf-900/50 dark:text-leaf-300'
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
