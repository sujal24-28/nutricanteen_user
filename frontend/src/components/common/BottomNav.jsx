import React from 'react';
import { useCanteen } from '../../context/useCanteen';
import { UtensilsCrossed, CalendarCheck, Wallet, Settings, ArrowRight } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab, orders, cart, cartTotal, setIsCartOpen } = useCanteen();

  const activeOrdersCount = orders.filter((o) => {
    const st = (o.status || '').toLowerCase().trim();
    return st !== 'delivered' && st !== 'cancelled' && st !== 'completed';
  }).length;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-xl z-40 pointer-events-none">
      {/* Floating Cart Button (Exclusively displayed on the Menu tab to avoid overlapping other sections) */}
      {cartItemCount > 0 && activeTab === 'menu' && (
        <div className="px-3.5 sm:px-4 pb-2 w-full pointer-events-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gold-200 hover:bg-gold-300 dark:bg-gold-800 dark:hover:bg-gold-700 text-gold-950 dark:text-gold-100 px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between font-bold active:scale-[0.99] transition-all border border-gold-300 dark:border-gold-700 cursor-pointer animate-fade-in"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gold-900 text-gold-100 flex items-center justify-center text-xs font-black">
                {cartItemCount}
              </div>
              <span className="text-xs font-bold">Cart</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-sm">₹{cartTotal}</span>
              <span className="text-[10px] bg-gold-900/10 dark:bg-gold-100/10 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                Go to cart
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-900 dark:text-gold-100" />
            </div>
          </button>
        </div>
      )}

      {/* Solid Bottom Navigation Bar (Constrained to mobile view range in white container) */}
      <div className="w-full bg-white dark:bg-[#101812] border-t sm:border-x border-gray-200 dark:border-leaf-900/80 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pointer-events-auto">
        <nav className="w-full flex items-center justify-around px-2 pt-2 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))]">

          {/* 1. Menu Tab */}
          <button
            onClick={() => setActiveTab('menu')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'text-leaf-700 dark:text-leaf-300 font-bold scale-105'
                : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'menu' ? 'bg-leaf-100 dark:bg-leaf-900/90 text-leaf-700 dark:text-leaf-300 shadow-xs' : ''}`}>
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Menu</span>
            {cartItemCount > 0 && activeTab !== 'menu' && (
              <span className="absolute top-0.5 right-2 bg-gold-400 text-gold-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* 2. Pre-Orders Tab */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'text-leaf-700 dark:text-leaf-300 font-bold scale-105'
                : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-leaf-100 dark:bg-leaf-900/90 text-leaf-700 dark:text-leaf-300 shadow-xs' : ''}`}>
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Pre-Orders</span>
            {activeOrdersCount > 0 && (
              <span className="absolute top-0.5 right-2 bg-gold-400 text-gold-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* 3. Wallet Tab */}
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'wallet'
                ? 'text-gold-700 dark:text-gold-300 font-bold scale-105'
                : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'wallet' ? 'bg-gold-100 dark:bg-gold-950/80 text-gold-700 dark:text-gold-300 shadow-xs' : ''}`}>
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Wallet</span>
          </button>

          {/* 4. Settings Tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-leaf-700 dark:text-leaf-300 font-bold scale-105'
                : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-leaf-100 dark:bg-leaf-900/90 text-leaf-700 dark:text-leaf-300 shadow-xs' : ''}`}>
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Settings</span>
          </button>

        </nav>
      </div>
    </div>
  );
};
