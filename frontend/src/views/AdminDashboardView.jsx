import React, { useState, useEffect } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  apiGetAdminDashboard, 
  apiAdminListStudents, 
  apiAdminDebitWallet,
  apiGetOrderList,
  apiAdminUpdateOrderStatus
} from '../services/api';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Wallet,
  LogOut,
  Search,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const AdminDashboardView = () => {
  const { adminUser, logout } = useCanteen();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'students', 'dashboard'
  
  const isSuperadmin = adminUser?.role === 'superadmin';
  const isAdmin = adminUser?.role === 'admin' || isSuperadmin;

  // Defaults to 'orders' for everyone (Staff, Admin, Superadmin)
  // Superadmin gets 'dashboard' by default
  useEffect(() => {
    if (isSuperadmin) setActiveTab('dashboard');
  }, [isSuperadmin]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-leaf-950 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-leaf-900 p-4 border-b border-gray-100 dark:border-leaf-800 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-lg font-bold">CRM Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-leaf-300 capitalize flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {adminUser?.name} ({adminUser?.role})
          </p>
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }} 
          className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-950/30 rounded-xl cursor-pointer hover:bg-rose-100 active:scale-95 transition-all relative z-50"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 p-3 bg-white dark:bg-leaf-900 shadow-xs z-10 border-b border-gray-100 dark:border-leaf-800">
        {isSuperadmin && (
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-leaf-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-leaf-950 text-gray-500 dark:text-leaf-400'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Metrics
          </button>
        )}
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'orders' ? 'bg-leaf-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-leaf-950 text-gray-500 dark:text-leaf-400'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Orders
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'menu' ? 'bg-leaf-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-leaf-950 text-gray-500 dark:text-leaf-400'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Menu
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'students' ? 'bg-leaf-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-leaf-950 text-gray-500 dark:text-leaf-400'}`}
          >
            <Users className="w-4 h-4" /> Students
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'dashboard' && isSuperadmin && <MetricsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'menu' && <MenuManagementTab />}
        {activeTab === 'students' && isAdmin && <StudentsTab />}
      </div>
    </div>
  );
};

/* --- TABS --- */

const MetricsTab = () => {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    apiGetAdminDashboard().then(res => {
      if (res.ok) setMetrics(res.data);
    });
  }, []);

  if (!metrics) return <div className="text-center p-10 text-xs text-gray-500 animate-pulse">Loading Metrics...</div>;

  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard title="Total Revenue" value={`₹${metrics.total_revenue || 0}`} icon={<TrendingUp className="w-5 h-5 text-gold-500" />} />
      <MetricCard title="Total Orders" value={metrics.total_orders || 0} icon={<ShoppingBag className="w-5 h-5 text-leaf-500" />} />
      <MetricCard title="Pending Orders" value={metrics.pending_orders || 0} icon={<LayoutDashboard className="w-5 h-5 text-amber-500" />} />
      <MetricCard title="Registered Students" value={metrics.total_students || 0} icon={<Users className="w-5 h-5 text-blue-500" />} />
    </div>
  );
};

const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-leaf-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-leaf-800">
    <div className="mb-2">{icon}</div>
    <h3 className="text-[10px] font-bold text-gray-400 dark:text-leaf-400 uppercase tracking-wider">{title}</h3>
    <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);

const MenuManagementTab = () => {
  const { showToast, syncBackendData } = useCanteen();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Snacks', daily_limit: '' });
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('price', formData.price);
      payload.append('category', formData.category);
      if (formData.daily_limit) payload.append('daily_limit', formData.daily_limit);
      if (imageFile) payload.append('image', imageFile);

      const { apiAdminCreateMenuItem } = await import('../services/api');
      const res = await apiAdminCreateMenuItem(payload);
      
      if (res.ok) {
        showToast('Success', 'Menu item added successfully!');
        setFormData({ name: '', price: '', category: 'Snacks', daily_limit: '' });
        setImageFile(null);
        await syncBackendData();
      } else {
        showToast('Error', res.error || 'Failed to add item', 'error');
      }
    } catch (err) {
      showToast('Error', 'Connection failed', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-leaf-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-leaf-800">
        <h2 className="text-sm font-bold mb-4">Add New Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Item Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Veg Cheese Sandwich" 
              value={formData.name}
              onChange={e => setFormData(p => ({...p, name: e.target.value}))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm placeholder-gray-900 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Price (₹)</label>
              <input 
                type="number" 
                required
                placeholder="45.00" 
                value={formData.price}
                onChange={e => setFormData(p => ({...p, price: e.target.value}))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm placeholder-gray-900 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Limit (Optional)</label>
              <input 
                type="number" 
                placeholder="Unlimited" 
                value={formData.daily_limit}
                onChange={e => setFormData(p => ({...p, daily_limit: e.target.value}))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm placeholder-gray-900 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData(p => ({...p, category: e.target.value}))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            >
              <option>Meals</option>
              <option>Snacks</option>
              <option>Beverages</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => setImageFile(e.target.files[0])}
              className="w-full text-xs"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all text-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    apiGetOrderList().then(res => {
      if (res.ok && res.data?.order_list) {
        setOrders(res.data.order_list);
      }
      setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="text-center p-10 text-xs text-gray-500 animate-pulse">Loading Orders...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-sm">Recent Orders</h2>
        <button onClick={fetchOrders} className="text-[10px] font-bold text-leaf-600 bg-leaf-50 px-3 py-1 rounded-full">Refresh</button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border text-sm text-gray-400">No active orders found.</div>
      ) : (
        orders.map(order => (
          <div key={order.order_id} className="bg-white dark:bg-leaf-900 p-3.5 rounded-2xl border border-gray-100 dark:border-leaf-800 shadow-sm flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold bg-gold-100 text-gold-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {order.order_status}
              </span>
              <p className="text-sm font-bold mt-1.5 dark:text-white">Order #{order.order_id}</p>
              <p className="text-xs text-gray-500 dark:text-leaf-300 mt-0.5">₹{order.grand_amount}</p>
            </div>
              <div className="flex flex-col items-end gap-2">
                 <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                 <div className="flex gap-2">
                   {order.order_status === 'pending' && (
                     <button
                       onClick={async () => {
                         const res = await apiAdminUpdateOrderStatus(order.order_id, 'accepted');
                         if (res.ok) fetchOrders();
                       }}
                       className="px-3 py-1 bg-leaf-600 hover:bg-leaf-700 text-white text-[10px] font-bold rounded-lg transition"
                     >
                       Accept
                     </button>
                   )}
                   {(order.order_status === 'accepted' || order.order_status === 'confirmed' || order.order_status === 'ready') && (
                     <button
                       onClick={async () => {
                         const res = await apiAdminUpdateOrderStatus(order.order_id, 'delivered');
                         if (res.ok) fetchOrders();
                       }}
                       className="px-3 py-1 bg-gold-500 hover:bg-gold-600 text-white text-[10px] font-bold rounded-lg transition"
                     >
                       Mark Delivered
                     </button>
                   )}
                 </div>
              </div>
          </div>
        ))
      )}
    </div>
  );
};

const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    apiAdminListStudents().then(res => {
      if (res.ok && res.data?.students) setStudents(res.data.students);
    });
  }, []);

  const handleDebit = async (studentId) => {
    if (!deductAmount || isNaN(deductAmount)) return alert("Enter valid amount");
    const res = await apiAdminDebitWallet(studentId, deductAmount, "Manual Counter Debit");
    if (res.ok) {
      alert("Amount debited successfully!");
      setDeductAmount('');
      setSelectedStudent(null);
      // Refresh students
      apiAdminListStudents().then(r => { if(r.ok) setStudents(r.data.students); });
    } else {
      alert(res.error || "Failed to debit wallet. Insufficient balance?");
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.phone.includes(search) ||
    s.roll?.toString().includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name, phone, or roll..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-leaf-900 border border-gray-200 dark:border-leaf-800 rounded-xl text-sm placeholder-gray-800 dark:placeholder-leaf-300 focus:outline-none focus:border-leaf-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-white dark:bg-leaf-900 p-3.5 rounded-2xl border border-gray-100 dark:border-leaf-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm dark:text-white">{s.name}</h3>
                <p className="text-[10px] text-gray-500 dark:text-leaf-300">Class {s.class}-{s.section} • Roll #{s.roll}</p>
                <p className="text-[10px] text-gray-500 dark:text-leaf-300">{s.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-leaf-700 dark:text-gold-300">₹{s.wallet_balance}</span>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Wallet</p>
              </div>
            </div>

            {selectedStudent === s.id ? (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-leaf-800 flex gap-2">
                <input 
                  type="number"
                  placeholder="Amount ₹"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  className="w-24 px-2 py-1.5 border rounded-lg text-xs"
                />
                <button 
                  onClick={() => handleDebit(s.id)}
                  className="bg-rose-600 text-white font-bold text-xs px-3 rounded-lg flex-1"
                >
                  Deduct
                </button>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="bg-gray-100 text-gray-600 font-bold text-xs px-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-3 pt-2">
                <button 
                  onClick={() => setSelectedStudent(s.id)}
                  className="w-full py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3.5 h-3.5" /> Deduct from Wallet
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
