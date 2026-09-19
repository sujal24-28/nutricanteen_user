import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { UtensilsCrossed, CalendarCheck, Wallet, Settings, ArrowRight } from 'lucide-react';

export const BottomNav = ({ onSettingsOpen }) => {
  const { activeTab, setActiveTab, orders, cart, cartTotal, setIsCartOpen } = useCanteen();

  const pendingOrdersCount = orders.filter((o) => o.status === 'Scheduled').length;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="px-3 sm:px-4 pb-2 w-full max-w-lg mx-auto pointer-events-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gold-200 hover:bg-gold-300 dark:bg-gold-800 dark:hover:bg-gold-700 text-gold-950 dark:text-gold-100 px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between font-bold active:scale-[0.99] transition-all border border-gold-300 dark:border-gold-700 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gold-900 text-gold-100 flex items-center justify-center text-xs font-black">
                {cartItemCount}
              </div>
              <span className="text-xs font-bold">View Pre-Order Basket</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-sm">₹{cartTotal}</span>
              <span className="text-[10px] bg-gold-900/10 dark:bg-gold-100/10 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                Wallet Pay
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-900 dark:text-gold-100" />
            </div>
          </button>
        </div>
      )}

      {/* Main Bottom Navigation */}
      <nav className="bg-white/95 dark:bg-[#141d16]/95 backdrop-blur-md border-t border-leaf-100 dark:border-leaf-900 shadow-lg px-2 sm:px-3 py-1.5 sm:py-2 pointer-events-auto flex items-center justify-around w-full max-w-lg mx-auto">

        {/* Menu Tab */}
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'menu'
              ? 'text-leaf-700 dark:text-leaf-300 font-bold'
              : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'menu' ? 'bg-leaf-100 dark:bg-leaf-900/80 text-leaf-700 dark:text-leaf-300' : ''}`}>
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>

        {/* Orders Tab */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'text-leaf-700 dark:text-leaf-300 font-bold'
              : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'orders' ? 'bg-leaf-100 dark:bg-leaf-900/80 text-leaf-700 dark:text-leaf-300' : ''}`}>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight">Pre-Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-gold-400 text-gold-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Wallet Tab */}
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'wallet'
              ? 'text-gold-700 dark:text-gold-300 font-bold'
              : 'text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'wallet' ? 'bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300' : ''}`}>
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight">Wallet</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={onSettingsOpen}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer text-gray-400 dark:text-leaf-300/50 hover:text-gray-600 font-medium"
        >
          <div className="p-1 rounded-lg">
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight">Settings</span>
        </button>

      </nav>
    </div>
  );
};
