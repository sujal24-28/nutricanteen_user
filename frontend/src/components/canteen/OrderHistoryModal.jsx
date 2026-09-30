import React, { useState } from 'react';
import { useCanteen } from '../../context/useCanteen';
import {
  ArrowLeft,
  X,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  Filter,
  Receipt
} from 'lucide-react';

export const OrderHistoryModal = () => {
  const { isOrderHistoryOpen, setIsOrderHistoryOpen, orders = [] } = useCanteen();
  const [filter, setFilter] = useState('all'); // 'all' | 'delivered' | 'cancelled'

  if (!isOrderHistoryOpen) return null;

  // Historical orders: Delivered (collected) or Cancelled (or completed)
  const historyOrders = orders.filter((o) => {
    const st = (o.status || '').toLowerCase().trim();
    return st === 'delivered' || st === 'cancelled' || st === 'completed';
  });

  const filteredOrders = historyOrders.filter((o) => {
    const st = (o.status || '').toLowerCase().trim();
    if (filter === 'delivered') return st === 'delivered' || st === 'completed';
    if (filter === 'cancelled') return st === 'cancelled';
    return true;
  });

  const completedCount = historyOrders.filter((o) => {
    const st = (o.status || '').toLowerCase().trim();
    return st === 'delivered' || st === 'completed';
  }).length;
  
  const cancelledCount = historyOrders.filter((o) => {
    const st = (o.status || '').toLowerCase().trim();
    return st === 'cancelled';
  }).length;

  const totalSpent = historyOrders
    .filter((o) => {
      const st = (o.status || '').toLowerCase().trim();
      return st === 'delivered' || st === 'completed';
    })
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f6f9f7] dark:bg-[#0c140e] w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:border border-leaf-200 dark:border-leaf-800">
        
        {/* Top Header Bar with Safe-Area Clearance */}
        <div className="bg-leaf-800 dark:bg-leaf-950 text-white px-4 pt-[max(0.85rem,calc(env(safe-area-inset-top,0px)+0.6rem))] pb-3.5 flex items-center justify-between border-b border-leaf-700/70 dark:border-leaf-900 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOrderHistoryOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-white"
              aria-label="Back"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                Order History
              </h2>
              <p className="text-[11px] text-leaf-200 font-medium">
                {historyOrders.length} Past Canteen {historyOrders.length === 1 ? 'Order' : 'Orders'} • Total ₹{totalSpent.toFixed(0)} spent
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOrderHistoryOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-leaf-200 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="bg-white dark:bg-leaf-950/70 px-4 py-2.5 border-b border-leaf-100 dark:border-leaf-900/60 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-leaf-700 text-white shadow-xs'
                : 'bg-leaf-50 dark:bg-leaf-900/40 text-leaf-800 dark:text-leaf-300 hover:bg-leaf-100'
            }`}
          >
            All History ({historyOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'delivered'
                ? 'bg-leaf-700 text-white shadow-xs'
                : 'bg-leaf-50 dark:bg-leaf-900/40 text-leaf-800 dark:text-leaf-300 hover:bg-leaf-100'
            }`}
          >
            Collected ({completedCount})
          </button>
          {cancelledCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'cancelled'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          )}
        </div>

        {/* Scrollable Order History Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400 dark:text-leaf-300/60">
              <div className="w-14 h-14 rounded-2xl bg-leaf-100 dark:bg-leaf-900/40 text-leaf-700 dark:text-gold-300 mx-auto flex items-center justify-center mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-white">
                {filter === 'all'
                  ? 'No past orders yet'
                  : filter === 'delivered'
                  ? 'No completed orders'
                  : 'No cancelled orders'}
              </p>
              <p className="text-xs mt-1 text-gray-500 dark:text-leaf-300/60 max-w-xs mx-auto">
                {filter === 'all'
                  ? 'Completed and collected canteen meals will be archived here.'
                  : 'No matching records in this category.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const st = (order.status || '').toLowerCase().trim();
              const isDelivered = st === 'delivered' || st === 'completed';
              const isCancelled = st === 'cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-leaf-950/70 p-4 rounded-3xl border border-leaf-100 dark:border-leaf-800/60 shadow-xs space-y-2.5 transition-all"
                >
                  {/* Top Row: Token & Status */}
                  <div className="flex items-center justify-between pb-2 border-b border-leaf-100 dark:border-leaf-800/60">
                    <div className="flex items-center gap-2">
                      <span className="bg-leaf-100 dark:bg-leaf-900/60 text-leaf-900 dark:text-leaf-200 border border-leaf-200 dark:border-leaf-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
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

                    {isDelivered ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        COLLECTED
                      </span>
                    ) : isCancelled ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        CANCELLED (REFUNDED)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300">
                        COMPLETED
                      </span>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 pt-0.5">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5 font-semibold capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-leaf-400"></span>
                          <span>{item.name}</span>
                          <span className="text-gray-400 font-bold">x {item.quantity}</span>
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer with Date & Total */}
                  <div className="pt-2 border-t border-gray-100 dark:border-leaf-800/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{order.preOrderDate}</span>
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-gray-400 font-medium">Paid:</span>
                      <span className="text-sm font-extrabold text-leaf-800 dark:text-gold-300">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
