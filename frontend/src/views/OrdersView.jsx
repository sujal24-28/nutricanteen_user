import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { CalendarCheck, Clock, ShoppingBag, Utensils, ArrowRight, UserCheck } from 'lucide-react';

export const OrdersView = () => {
  const { orders, setActiveTab, student } = useCanteen();

  return (
    <div className="pb-28 pt-3 px-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            My Pre-Orders
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-leaf-300/70">
            Meals scheduled for school pickup at the Canteen Counter
          </p>
        </div>
        <span className="bg-leaf-50 dark:bg-leaf-900/60 border border-leaf-200 dark:border-leaf-800 text-leaf-800 dark:text-leaf-300 font-bold text-xs px-2.5 py-0.5 rounded-full">
          {orders.length} Orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-leaf-950/60 p-8 rounded-3xl border border-dashed border-leaf-200 dark:border-leaf-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-leaf-50 dark:bg-leaf-900/40 text-leaf-700 dark:text-gold-300 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-gray-800 dark:text-white">No active pre-orders</h3>
            <p className="text-[11px] text-gray-400 dark:text-leaf-300/60 mt-1 max-w-xs mx-auto">
              Pre-order your lunch or recess snacks 1 day in advance to avoid canteen queues!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('menu')}
            className="bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Browse Canteen Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isScheduled = order.status === 'Scheduled';
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-leaf-950/60 p-4 rounded-3xl border border-leaf-100 dark:border-leaf-800/80 shadow-xs space-y-2.5 relative overflow-hidden"
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

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      order.status.toLowerCase() === 'accepted' || order.status.toLowerCase() === 'ready'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-800'
                        : order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'collected / handed over'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-800'
                        : order.status === 'Scheduled' || order.status.toLowerCase() === 'pending'
                        ? 'bg-leaf-50 text-leaf-700 border-leaf-200 dark:bg-leaf-900/60 dark:text-leaf-300 dark:border-leaf-800'
                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-3 pt-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-base">
                      <span className="text-gray-900 dark:text-white flex items-center gap-2 font-bold capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>
                        {item.name} <span className="text-gray-500 font-bold ml-1 normal-case">x {item.quantity}</span>
                      </span>
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                {/* Pickup Instructions for Student */}
                <div className="p-2.5 rounded-2xl bg-leaf-50 dark:bg-leaf-900/40 border border-leaf-200/70 dark:border-leaf-800/60 flex items-start gap-2 text-[11px] text-leaf-800 dark:text-leaf-200">
                  <UserCheck className="w-4 h-4 text-leaf-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-bold block">Counter Pickup Instructions:</span>
                    <span className="text-gray-600 dark:text-leaf-300/80">
                      Show your Name & Roll #{student?.rollNo} ({student?.className}-{student?.section}) at Canteen Counter.
                    </span>
                  </div>
                </div>

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
        </div>
      )}
    </div>
  );
};
