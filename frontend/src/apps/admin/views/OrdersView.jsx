import React, { useState, useEffect } from 'react';
import api from '../../../services/adminApi';
import { useCanteen } from '../../../context/CanteenContext';
import { RefreshCw, CheckCircle, Clock, Package } from 'lucide-react';

export default function OrdersView() {
  const { showToast } = useCanteen();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      showToast('Error', 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      showToast(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      showToast('Error', error.message || 'Failed to update order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Pending</span>;
      case 'ready': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1 w-max"><Package className="w-3 h-3"/> Ready for Pickup</span>;
      case 'delivered': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Delivered</span>;
      case 'cancelled': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 w-max">Cancelled</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 w-max">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and update student pre-orders</p>
        </div>
        <button onClick={fetchOrders} className="p-2 text-gray-500 hover:text-leaf-600 hover:bg-leaf-50 rounded-lg transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-leaf-200 border-t-leaf-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">#{order.id}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {order.items?.map(i => `${i.quantity}x ${i.menuItem?.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                    ₹{order.total_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {order.status === 'confirmed' && (
                      <button onClick={() => updateStatus(order.id, 'ready')} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 mr-2">Mark Ready</button>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => updateStatus(order.id, 'delivered')} className="text-green-600 hover:text-green-800 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">Hand Over</button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No active orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
