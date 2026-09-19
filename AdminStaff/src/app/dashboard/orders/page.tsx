'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, Package } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-brown-dark">Active Orders</h1>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-brand-white border border-brand-brown-light/30 rounded shadow hover:bg-brand-offwhite text-brand-brown-dark transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-4 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold text-brand-brown-dark border-b pb-2 mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-gold-dark" /> Pending</h2>
          <div className="space-y-4">{orders.filter(o => o.status === 'pending').map(o => <OrderCard key={o.id} order={o} onUpdate={updateStatus} />)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold text-brand-brown-dark border-b pb-2 mb-4 flex items-center gap-2"><Package size={18} className="text-brand-gold-dark" /> Preparing</h2>
          <div className="space-y-4">{orders.filter(o => o.status === 'confirmed').map(o => <OrderCard key={o.id} order={o} onUpdate={updateStatus} />)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold text-brand-brown-dark border-b pb-2 mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-green-600" /> Ready</h2>
          <div className="space-y-4">{orders.filter(o => o.status === 'ready').map(o => <OrderCard key={o.id} order={o} onUpdate={updateStatus} />)}</div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: any, onUpdate: (id: number, status: string) => void }) {
  return (
    <div className="border border-brand-brown-light/20 p-4 rounded-lg bg-brand-offwhite">
      <div className="flex justify-between items-start mb-2">
        <div><span className="font-bold text-brand-brown-dark">Order #{order.id}</span><p className="text-sm text-brand-brown-light">{order.student?.name}</p></div>
        <span className="font-bold text-brand-gold-dark">?{order.total_amount}</span>
      </div>
      <div className="text-sm text-brand-brown-dark mb-4"><ul className="list-disc pl-4">{order.items?.map((item: any) => <li key={item.id}>{item.quantity}x {item.menuItem?.name}</li>)}</ul></div>
      <div className="flex gap-2 mt-2">
        {order.status === 'pending' && <button onClick={() => onUpdate(order.id, 'confirmed')} className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark text-sm font-bold py-1.5 rounded">Start</button>}
        {order.status === 'confirmed' && <button onClick={() => onUpdate(order.id, 'ready')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1.5 rounded">Ready</button>}
        {order.status === 'ready' && <button onClick={() => onUpdate(order.id, 'delivered')} className="flex-1 bg-brand-brown-dark hover:bg-brand-brown text-white text-sm font-bold py-1.5 rounded">Delivered</button>}
        <button onClick={() => onUpdate(order.id, 'cancelled')} className="px-3 bg-red-100 text-red-700 text-sm font-bold py-1.5 rounded">Cancel</button>
      </div>
    </div>
  );
}
