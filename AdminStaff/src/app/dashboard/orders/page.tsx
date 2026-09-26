'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, Package, ChevronsRight } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchOrders();
    } catch (e) { console.error(e); }
  };

  // Bulk update all orders of a given current status → next status
  const bulkUpdateStatus = async (fromStatus: string, toStatus: string) => {
    const targets = orders.filter(o => o.status === fromStatus);
    if (targets.length === 0) return;
    setBulkLoading(fromStatus);
    try {
      await Promise.all(
        targets.map(o =>
          fetch(`/api/orders/${o.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: toStatus })
          })
        )
      );
      await fetchOrders();
    } catch (e) { console.error(e); }
    setBulkLoading(null);
  };

  const pendingOrders   = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'confirmed');
  const readyOrders     = orders.filter(o => o.status === 'ready');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-brown-dark">Active Orders</h1>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-brand-white border border-brand-brown-light/30 rounded shadow hover:bg-brand-offwhite text-brand-brown-dark transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Pending ── */}
        <div className="bg-white rounded-xl shadow p-4 border border-brand-brown-light/20">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h2 className="text-lg font-bold text-brand-brown-dark flex items-center gap-2">
              <Clock size={18} className="text-brand-gold-dark" />
              Pending
              <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 font-semibold">
                {pendingOrders.length}
              </span>
            </h2>
            {pendingOrders.length > 0 && (
              <button
                onClick={() => bulkUpdateStatus('pending', 'confirmed')}
                disabled={bulkLoading === 'pending'}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
              >
                <ChevronsRight size={14} />
                {bulkLoading === 'pending' ? 'Starting…' : 'Accept All'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {pendingOrders.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">No pending orders</p>
              : pendingOrders.map(o => <OrderCard key={o.id} order={o} onUpdate={updateStatus} />)
            }
          </div>
        </div>

        {/* ── Preparing ── */}
        <div className="bg-white rounded-xl shadow p-4 border border-brand-brown-light/20">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h2 className="text-lg font-bold text-brand-brown-dark flex items-center gap-2">
              <Package size={18} className="text-brand-gold-dark" />
              Preparing
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 font-semibold">
                {preparingOrders.length}
              </span>
            </h2>
            {preparingOrders.length > 0 && (
              <button
                onClick={() => bulkUpdateStatus('confirmed', 'ready')}
                disabled={bulkLoading === 'confirmed'}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
              >
                <ChevronsRight size={14} />
                {bulkLoading === 'confirmed' ? 'Marking…' : 'Ready All'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {preparingOrders.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">No orders being prepared</p>
              : preparingOrders.map(o => <OrderCard key={o.id} order={o} onUpdate={updateStatus} />)
            }
          </div>
        </div>

        {/* ── Ready ── */}
        <div className="bg-white rounded-xl shadow p-4 border border-brand-brown-light/20">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h2 className="text-lg font-bold text-brand-brown-dark flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              Ready
              <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 font-semibold">
                {readyOrders.length}
              </span>
            </h2>
            {readyOrders.length > 0 && (
              <button
                onClick={() => bulkUpdateStatus('ready', 'delivered')}
                disabled={bulkLoading === 'ready'}
                className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
              >
                <ChevronsRight size={14} />
                {bulkLoading === 'ready' ? 'Delivering…' : 'Deliver All'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {readyOrders.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">No orders ready</p>
              : readyOrders.map(o => <OrderCard key={o.id} order={o} onUpdate={updateStatus} />)
            }
          </div>
        </div>

      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: any, onUpdate: (id: number, status: string) => void }) {
  return (
    <div className="border border-brand-brown-light/20 p-4 rounded-lg bg-brand-offwhite">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-bold text-brand-brown-dark">Order #{order.id}</span>
          <p className="text-sm text-brand-brown-light">{order.student?.name}</p>
          <p className="text-xs text-gray-400">{order.student?.class} {order.student?.section} · Roll {order.student?.roll}</p>
        </div>
        <span className="font-bold text-brand-gold-dark">₹{order.total_amount}</span>
      </div>
      <div className="text-sm text-brand-brown-dark mb-4">
        <ul className="list-disc pl-4">
          {order.items?.map((item: any) => (
            <li key={item.id}>{item.quantity}x {item.menuItem?.name}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 mt-2">
        {order.status === 'pending'   && <button onClick={() => onUpdate(order.id, 'confirmed')} className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark text-sm font-bold py-1.5 rounded">Start</button>}
        {order.status === 'confirmed' && <button onClick={() => onUpdate(order.id, 'ready')}     className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1.5 rounded">Ready</button>}
        {order.status === 'ready'     && <button onClick={() => onUpdate(order.id, 'delivered')} className="flex-1 bg-brand-brown-dark hover:bg-brand-brown text-white text-sm font-bold py-1.5 rounded">Delivered</button>}
        <button onClick={() => onUpdate(order.id, 'cancelled')} className="px-3 bg-red-100 text-red-700 text-sm font-bold py-1.5 rounded">Cancel</button>
      </div>
    </div>
  );
}
