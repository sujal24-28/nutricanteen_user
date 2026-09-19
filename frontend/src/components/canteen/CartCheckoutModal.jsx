import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { X, Plus, Minus, Trash2, Wallet, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export const CartCheckoutModal = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    walletBalance,
    preOrderDateLabel,
    breakSlot,
    student,
    placePreOrder,
    setIsRechargeOpen
  } = useCanteen();

  if (!isCartOpen) return null;

  const hasEnoughBalance = walletBalance >= cartTotal;
  const remainingBalanceAfter = walletBalance - cartTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-leaf-950 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl border border-leaf-200 dark:border-leaf-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-leaf-800 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header (Soft Leaf Green) */}
        <div className="p-3.5 bg-leaf-700 text-white flex items-center justify-between border-b border-leaf-600 shrink-0">
          <div>
            <h3 className="font-bold text-sm text-white">Pre-Order Food Basket</h3>
            <p className="text-[11px] text-leaf-100">{preOrderDateLabel} • {breakSlot === 'recess' ? 'Morning Recess' : 'Lunch Break'}</p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-leaf-300/60">
              <p className="text-sm font-semibold">Your basket is empty.</p>
              <p className="text-xs mt-1">Add items from the canteen menu to pre-order.</p>
            </div>
          ) : (
            <>
              {/* Student Recipient Identity Card */}
              <div className="bg-leaf-50 dark:bg-leaf-900/50 border border-leaf-200/80 dark:border-leaf-800 p-2.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-leaf-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {student?.className?.replace('Class ', '')}{student?.section}
                  </div>
                  <div>
                    <span className="text-[10px] text-leaf-700 dark:text-leaf-300 font-bold uppercase tracking-wider block">
                      Student Address
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {student?.name} • Roll #{student?.rollNo}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-gold-100 dark:bg-gold-950/60 border border-gold-300 text-gold-900 dark:text-gold-200 font-bold px-2 py-0.5 rounded-md">
                  {student?.className}-{student?.section}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Selected Meals ({cart.length})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl border border-leaf-100 dark:border-leaf-800/80 flex items-center justify-between gap-3 bg-white dark:bg-leaf-950/50 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{item.name}</h4>
                        <span className="text-[11px] font-bold text-leaf-700 dark:text-gold-300 block">₹{item.price} each</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-leaf-50 dark:bg-leaf-900/60 border border-leaf-200 dark:border-leaf-700 rounded-xl p-0.5 text-xs font-bold">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded-lg bg-white dark:bg-leaf-800 text-leaf-800 dark:text-white flex items-center justify-center hover:bg-leaf-100 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded-lg bg-leaf-600 text-white flex items-center justify-center hover:bg-leaf-700 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <span className="font-bold text-xs text-gray-900 dark:text-white w-10 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill & Wallet Payment Summary */}
              <div className="bg-leaf-50/70 dark:bg-leaf-900/30 p-3 rounded-2xl border border-leaf-200/80 dark:border-leaf-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-leaf-200 flex items-center gap-1.5 font-medium">
                    <Wallet className="w-3.5 h-3.5 text-gold-600" />
                    Current Wallet Balance:
                  </span>
                  <span className="font-bold text-xs text-gray-900 dark:text-white">
                    ₹{walletBalance}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-leaf-200/60 dark:border-leaf-800">
                  <span className="font-bold text-gray-900 dark:text-white">Total Order Amount:</span>
                  <span className="font-extrabold text-sm text-leaf-800 dark:text-gold-300">
                    ₹{cartTotal}
                  </span>
                </div>

                {hasEnoughBalance ? (
                  <div className="flex items-center justify-between text-[11px] text-leaf-700 dark:text-leaf-300 pt-1 border-t border-dashed border-leaf-200/80 dark:border-leaf-800 font-medium">
                    <span>Balance after order:</span>
                    <span className="font-bold">₹{remainingBalanceAfter}</span>
                  </div>
                ) : (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div>
                      <span className="font-bold block text-rose-900 dark:text-rose-200">
                        Insufficient Wallet Balance!
                      </span>
                      Need ₹{cartTotal - walletBalance} more to complete checkout. Recharge via UPI or Card.
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-3.5 bg-gray-50 dark:bg-leaf-900/60 border-t border-leaf-100 dark:border-leaf-800">
            {hasEnoughBalance ? (
              <button
                onClick={placePreOrder}
                className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-3 rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Pay ₹{cartTotal} via Canteen Wallet</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRechargeOpen(true)}
                className="w-full bg-gold-300 hover:bg-gold-200 text-gold-950 font-bold py-3 rounded-xl shadow-xs border border-gold-400 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-gold-950" />
                <span>Recharge Wallet (UPI / Card)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
