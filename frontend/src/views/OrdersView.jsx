import React from 'react';
import { useCanteen } from '../context/useCanteen';
import {
  CalendarCheck,
  Clock,
  ShoppingBag,
  Utensils,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  History,
  ChevronRight
} from 'lucide-react';

export const OrdersView = () => {
  const { orders = [], setActiveTab, student, setIsOrderHistoryOpen } = useCanteen();

  // Show ONLY active orders in pre-order section (pending, preparing, ready, scheduled)
  const activeOrders = orders.filter((order) => {
    const st = (order.status || '').toLowerCase().trim();
    return st !== 'delivered' && st !== 'cancelled' && st !== 'completed';
  });

  const historyOrdersCount = orders.filter((order) => {
    const st = (order.status || '').toLowerCase().trim();
    return st === 'delivered' || st === 'cancelled' || st === 'completed';
  }).length;

  return (
    <div className="pb-32 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.5rem))] px-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Active Orders
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-leaf-300/70">
            Meals in progress or ready for school counter pickup
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-leaf-100 text-leaf-900 dark:bg-leaf-900/60 dark:text-leaf-200 border border-leaf-200 dark:border-leaf-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
            {activeOrders.length} Active
          </span>
          {historyOrdersCount > 0 && (
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-leaf-800 dark:text-leaf-300 bg-white dark:bg-leaf-950/70 border border-leaf-200 dark:border-leaf-800 px-2.5 py-0.5 rounded-full hover:bg-leaf-50 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="View Order History"
            >
              <History className="w-3 h-3 text-gold-500" />
              <span>History ({historyOrdersCount})</span>
            </button>
          )}
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white dark:bg-leaf-950/60 p-8 rounded-3xl border border-dashed border-leaf-200 dark:border-leaf-800 text-center space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-leaf-50 dark:bg-leaf-900/40 text-leaf-700 dark:text-gold-300 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-800 dark:text-white">No active orders right now</h3>
            <p className="text-xs text-gray-400 dark:text-leaf-300/60 mt-1 max-w-xs mx-auto leading-relaxed">
              When you pre-order meals for recess or lunch, active tokens will be tracked right here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('menu')}
              className="w-full sm:w-auto bg-leaf-600 hover:bg-leaf-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <span>Browse Canteen Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {historyOrdersCount > 0 && (
              <button
                onClick={() => setIsOrderHistoryOpen(true)}
                className="w-full sm:w-auto bg-leaf-50 hover:bg-leaf-100 dark:bg-leaf-900/40 dark:hover:bg-leaf-900/60 text-leaf-800 dark:text-leaf-200 border border-leaf-200 dark:border-leaf-700 font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <History className="w-3.5 h-3.5" />
                <span>View Order History ({historyOrdersCount})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => {
            const st = (order.status || '').toLowerCase();
            const isReady = st === 'ready';
            const isPreparing = st === 'preparing';

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-leaf-950/60 p-4 rounded-3xl border shadow-xs space-y-2.5 relative overflow-hidden transition-all duration-300 ${
                  isReady
                    ? 'border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/20'
                    : isPreparing
                    ? 'border-amber-300 dark:border-amber-700/80'
                    : 'border-leaf-100 dark:border-leaf-800/80'
                }`}
              >
                {/* Top Status & Token Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-leaf-100 dark:border-leaf-800/60">
                  <div className="flex items-center gap-2">
                    <span className="bg-gold-200 text-gold-950 border border-gold-300 font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                      {order.tokenNumber}
                    </span>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-leaf-400 block font-mono leading-none">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {order.breakSlot}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isReady ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      READY FOR PICKUP
                    </span>
                  ) : isPreparing ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      PREPARING
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-leaf-50 text-leaf-800 border border-leaf-200 dark:bg-leaf-900/60 dark:text-leaf-300 dark:border-leaf-800">
                      SCHEDULED
                    </span>
                  )}
                </div>

                {/* Items Breakdown */}
                <div className="space-y-2 pt-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-900 dark:text-white flex items-center gap-2 font-bold capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>
                        {item.name} <span className="text-gray-500 font-bold ml-1 normal-case">x {item.quantity}</span>
                      </span>
                      <span className="font-extrabold text-gray-900 dark:text-white">
                        ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Dynamic Status Instructions for Student */}
                {isReady ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span className="font-extrabold block text-emerald-800 dark:text-emerald-300">🔥 Ready at Counter!</span>
                      <span className="text-emerald-950 dark:text-emerald-100 font-medium">
                        Your meal is ready! Collect Token <strong>{order.tokenNumber}</strong> at the Canteen Counter.
                      </span>
                    </div>
                  </div>
                ) : isPreparing ? (
                  <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span className="font-bold block text-amber-800 dark:text-amber-300">Kitchen Preparing:</span>
                      <span className="text-amber-900 dark:text-amber-200/90 font-medium">
                        Canteen staff has started preparing your order fresh.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-leaf-50 dark:bg-leaf-900/40 border border-leaf-200/70 dark:border-leaf-800/60 flex items-start gap-2 text-[11px] text-leaf-800 dark:text-leaf-200">
                    <UserCheck className="w-4 h-4 text-leaf-600 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span className="font-bold block">Counter Pickup Instructions:</span>
                      <span className="text-gray-600 dark:text-leaf-300/80">
                        Show your Name & Roll #{student?.rollNo} ({student?.className}-{student?.section}) at Canteen Counter.
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Total */}
                <div className="pt-2 border-t border-gray-100 dark:border-leaf-800/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Scheduled for: <strong className="text-gray-800 dark:text-gray-200">{order.preOrderDate}</strong>
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-gray-400 font-medium">Total:</span>
                    <span className="text-sm font-extrabold text-leaf-800 dark:text-gold-300">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Past History Link Banner at bottom */}
          {historyOrdersCount > 0 && (
            <div className="pt-3 pb-1 text-center">
              <button
                onClick={() => setIsOrderHistoryOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-leaf-950/70 border border-leaf-100 dark:border-leaf-800/80 text-xs font-bold text-leaf-800 dark:text-leaf-200 hover:bg-leaf-50 dark:hover:bg-leaf-900/50 flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-leaf-100 dark:bg-leaf-900/60 text-leaf-800 dark:text-gold-300 flex items-center justify-center">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">Past Order History</p>
                    <p className="text-[10px] text-gray-500 dark:text-leaf-300/60 font-medium">View {historyOrdersCount} completed or cancelled {historyOrdersCount === 1 ? 'order' : 'orders'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-leaf-700 dark:text-leaf-300 font-bold">
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}
      <div className="h-8" aria-hidden="true" />
    </div>
  );
};
