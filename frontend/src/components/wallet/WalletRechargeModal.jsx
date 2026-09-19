import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { X, Wallet, ShieldCheck, Check, Sparkles, CreditCard, Smartphone, Building, ArrowRight } from 'lucide-react';

export const WalletRechargeModal = () => {
  const { isRechargeOpen, setIsRechargeOpen, rechargeWallet, walletBalance } = useCanteen();

  const [amount, setAmount] = useState(200);
  const [method, setMethod] = useState('upi-gpay'); // 'upi-gpay', 'upi-phonepe', 'upi-paytm', 'card', 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isRechargeOpen) return null;

  const quickAmounts = [100, 200, 500, 1000];

  const handleRecharge = () => {
    if (amount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      let methodName = 'UPI (Google Pay)';
      if (method === 'upi-phonepe') methodName = 'UPI (PhonePe)';
      if (method === 'upi-paytm') methodName = 'UPI (Paytm)';
      if (method === 'card') methodName = 'Debit/Credit Card';
      if (method === 'netbanking') methodName = 'Net Banking';

      rechargeWallet(amount, methodName);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-leaf-950 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl border border-leaf-200 dark:border-leaf-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-leaf-800 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-3.5 bg-leaf-700 text-white flex items-center justify-between border-b border-leaf-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gold-200 text-gold-950 flex items-center justify-center font-bold">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Recharge Canteen Wallet</h3>
              <p className="text-[11px] text-leaf-100">Current Balance: ₹{walletBalance}</p>
            </div>
          </div>
          <button
            onClick={() => setIsRechargeOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Quick Amount Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-leaf-200 mb-2 uppercase tracking-wider">
              Select Recharge Amount
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    amount === amt
                      ? 'bg-leaf-600 text-white shadow-xs'
                      : 'bg-leaf-50 dark:bg-leaf-900/40 border border-leaf-200 dark:border-leaf-800 text-leaf-800 dark:text-leaf-200 hover:bg-leaf-100'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-gray-400">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
                max="5000"
                placeholder="Enter custom amount"
                className="w-full bg-leaf-50/50 dark:bg-leaf-900/30 border border-leaf-200 dark:border-leaf-800 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-leaf-400"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-leaf-200 mb-2 uppercase tracking-wider">
              Choose Payment Method
            </label>
            <div className="space-y-2">
              {/* UPI Options */}
              <button
                type="button"
                onClick={() => setMethod('upi-gpay')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  method === 'upi-gpay'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Google Pay (UPI)</h4>
                    <p className="text-[10px] text-gray-400 dark:text-leaf-300/70">Instant wallet credit</p>
                  </div>
                </div>
                {method === 'upi-gpay' && <Check className="w-4 h-4 text-leaf-600 dark:text-leaf-400 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => setMethod('upi-phonepe')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  method === 'upi-phonepe'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    Pe
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">PhonePe / BHIM UPI</h4>
                    <p className="text-[10px] text-gray-400 dark:text-leaf-300/70">UPI ID or QR scan</p>
                  </div>
                </div>
                {method === 'upi-phonepe' && <Check className="w-4 h-4 text-leaf-600 dark:text-leaf-400 stroke-[3]" />}
              </button>

              {/* Debit / Credit Card */}
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  method === 'card'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Debit / Credit Card</h4>
                    <p className="text-[10px] text-gray-400 dark:text-leaf-300/70">Visa, RuPay, Mastercard</p>
                  </div>
                </div>
                {method === 'card' && <Check className="w-4 h-4 text-leaf-600 dark:text-leaf-400 stroke-[3]" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-leaf-300/70 bg-leaf-50/60 dark:bg-leaf-900/40 p-2.5 rounded-xl border border-leaf-100 dark:border-leaf-800">
            <ShieldCheck className="w-4 h-4 text-leaf-600 dark:text-gold-400 flex-shrink-0" />
            <span>256-bit encrypted school payment gateway. Funds are instantly credited.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 dark:bg-leaf-900/60 border-t border-leaf-100 dark:border-leaf-800">
          <button
            onClick={handleRecharge}
            disabled={isProcessing || amount <= 0}
            className="w-full bg-gold-300 hover:bg-gold-200 text-gold-950 font-bold py-3 rounded-xl shadow-xs border border-gold-400 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <span>Processing Payment...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pay ₹{amount} & Top Up Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
