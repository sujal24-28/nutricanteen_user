'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  Utensils,
  ArrowRight,
  RefreshCw,
  FileText,
  Wallet,
  Calendar,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  PieChart
} from 'lucide-react';
import GrowthCharts from '@/components/dashboard/GrowthCharts';

interface MetricItem {
  id: number;
  name: string;
  category: string;
  price: string | number;
  image_url?: string;
  total_quantity: string | number;
  total_sales: string | number;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itemTimeframe, setItemTimeframe] = useState<'daily' | 'monthly' | 'yearly' | 'allTime'>('daily');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const deliveries = data?.deliveries || {};
  const recharges = data?.recharges || {};
  const students = data?.students || {};
  const schools = data?.schools || {};
  const itemsByTime = data?.items?.[itemTimeframe] || { mostOrdered: null, leastOrdered: null, all: [] };
  const mostOrdered: MetricItem | null = itemsByTime.mostOrdered;
  const leastOrdered: MetricItem | null = itemsByTime.leastOrdered;

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case 'daily': return 'Today';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      case 'allTime': return 'All Time';
      default: return 'Today';
    }
  };

  const getImageSrc = (img?: string) => {
    if (!img) return null;
    return img.startsWith('http') ? img : `http://localhost:5000${img}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-brown-dark tracking-tight">
            Canteen Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span>Live performance & canteen analytics</span>
            {lastRefreshed && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                Updated {lastRefreshed}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {loading && !data ? (
        <div className="py-24 text-center text-gray-400">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-3 text-brand-gold-dark" />
          <p className="text-base font-semibold text-gray-600">Loading comprehensive analytics...</p>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* SECTION 1: DELIVERIES & SALES (TODAY / MONTH / TOTAL)     */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-brown-dark flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-gold-dark" />
                Delivery & Revenue Performance
              </h2>
              <span className="text-xs text-gray-500 font-medium">Fulfilled student orders</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Today's Delivery */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today&apos;s Delivery</span>
                  <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Today</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mt-1">
                  {deliveries.today || 0} <span className="text-sm font-semibold text-gray-500">orders</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">Today&apos;s Revenue:</span>
                  <span className="font-bold text-green-600 text-sm">₹{deliveries.todayRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Monthly Delivery */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Delivery</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">This Month</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mt-1">
                  {deliveries.monthly || 0} <span className="text-sm font-semibold text-gray-500">orders</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">Month Revenue:</span>
                  <span className="font-bold text-blue-600 text-sm">₹{deliveries.monthlyRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Total Delivery */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Delivery</span>
                  <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">All-Time</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mt-1">
                  {deliveries.total || 0} <span className="text-sm font-semibold text-gray-500">orders</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500">Total Sales:</span>
                  <span className="font-bold text-purple-700 text-sm">₹{deliveries.totalRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: RECHARGES, STUDENTS & SCHOOLS REGISTRATIONS    */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Wallet Recharge Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-brand-brown-dark flex items-center gap-2">
                  <Wallet size={18} className="text-brand-gold-dark" />
                  Wallet Recharges
                </h3>
                <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  Cash Inflow
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">Today</p>
                  <p className="text-lg font-extrabold text-green-600 mt-1">
                    ₹{recharges.today?.toFixed(0) || 0}
                  </p>
                  <span className="text-[10px] text-gray-400">Recharged today</span>
                </div>
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">This Month</p>
                  <p className="text-lg font-extrabold text-brand-brown-dark mt-1">
                    ₹{recharges.monthly?.toFixed(0) || 0}
                  </p>
                  <span className="text-[10px] text-gray-400">Month to date</span>
                </div>
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">All-Time</p>
                  <p className="text-lg font-extrabold text-indigo-700 mt-1">
                    ₹{recharges.total?.toFixed(0) || 0}
                  </p>
                  <span className="text-[10px] text-gray-400">Total credited</span>
                </div>
              </div>
            </div>

            {/* Students Enrolled Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-brand-brown-dark flex items-center gap-2">
                  <Users size={18} className="text-brand-gold-dark" />
                  Student Registrations
                </h3>
                <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Campus Growth
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Today</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1">+{students.today || 0}</p>
                </div>
                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Month</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1">+{students.monthly || 0}</p>
                </div>
                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Year</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1">+{students.yearly || 0}</p>
                </div>
                <div className="bg-brand-gold/15 p-2.5 rounded-xl border border-brand-gold/30">
                  <p className="text-[10px] font-bold text-brand-brown-dark uppercase">Total</p>
                  <p className="text-base font-extrabold text-brand-brown-dark mt-1">{students.total || 0}</p>
                </div>
              </div>
            </div>

            {/* School / Branch Registrations Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-brand-brown-dark flex items-center gap-2">
                  <Building2 size={18} className="text-brand-gold-dark" />
                  School Registrations
                </h3>
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                  Branch Expansion
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Today</p>
                  <p className="text-base font-extrabold text-purple-700 mt-1">+{schools.today || 0}</p>
                </div>
                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Month</p>
                  <p className="text-base font-extrabold text-purple-700 mt-1">+{schools.monthly || 0}</p>
                </div>
                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Year</p>
                  <p className="text-base font-extrabold text-purple-700 mt-1">+{schools.yearly || 0}</p>
                </div>
                <div className="bg-purple-100/60 p-2.5 rounded-xl border border-purple-200">
                  <p className="text-[10px] font-bold text-purple-900 uppercase">Total</p>
                  <p className="text-base font-extrabold text-purple-900 mt-1">{schools.total || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: BUSINESS GROWTH & REVENUE CHARTS               */}
          {/* ========================================================= */}
          <GrowthCharts charts={data?.charts} loading={loading} />

          {/* ========================================================= */}
          {/* SECTION 3: PRODUCT ITEM ANALYTICS (MOST & LEAST ORDERED)   */}
          {/* ========================================================= */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-brown-dark flex items-center gap-2">
                  <Flame size={20} className="text-brand-gold-dark" />
                  Product Demand Analytics
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Analyze most ordered star items and least ordered items for <span className="font-semibold text-brand-brown-dark">{getTimeframeLabel(itemTimeframe)}</span>
                </p>
              </div>

              {/* Timeframe selector: Daily, Monthly, Yearly, All-Time */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                <button
                  onClick={() => setItemTimeframe('daily')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    itemTimeframe === 'daily'
                      ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                      : 'hover:text-gray-900'
                  }`}
                >
                  Daily (Today)
                </button>
                <button
                  onClick={() => setItemTimeframe('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    itemTimeframe === 'monthly'
                      ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                      : 'hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setItemTimeframe('yearly')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    itemTimeframe === 'yearly'
                      ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                      : 'hover:text-gray-900'
                  }`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setItemTimeframe('allTime')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    itemTimeframe === 'allTime'
                      ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                      : 'hover:text-gray-900'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Highlight Cards: Most vs Least */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Ordered Item */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-2xl border border-amber-200/80 flex items-center gap-4">
                <div className="relative">
                  {mostOrdered?.image_url ? (
                    <img
                      src={getImageSrc(mostOrdered.image_url) || ''}
                      alt={mostOrdered.name}
                      className="w-16 h-16 object-cover rounded-xl border border-amber-300 shadow-2xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-lg border border-amber-200">
                      ⭐
                    </div>
                  )}
                  <span className="absolute -top-2 -left-2 bg-amber-500 text-white rounded-full p-1 shadow-xs">
                    <Award size={13} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md">
                      Most Ordered ({getTimeframeLabel(itemTimeframe)})
                    </span>
                    {mostOrdered?.category && (
                      <span className="text-xs text-gray-500 capitalize">{mostOrdered.category}</span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 truncate mt-1">
                    {mostOrdered?.name || 'No orders in this period'}
                  </h4>
                  {mostOrdered ? (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Sold: <strong className="text-amber-800">{mostOrdered.total_quantity} units</strong>
                      {Number(mostOrdered.total_sales) > 0 && (
                        <span className="ml-2 text-gray-500">
                          (₹{Number(mostOrdered.total_sales).toFixed(0)} sales)
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">No product demand recorded for {getTimeframeLabel(itemTimeframe).toLowerCase()}</p>
                  )}
                </div>
              </div>

              {/* Least Ordered Item */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-2xl border border-gray-200 flex items-center gap-4">
                <div className="relative">
                  {leastOrdered?.image_url ? (
                    <img
                      src={getImageSrc(leastOrdered.image_url) || ''}
                      alt={leastOrdered.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-300 shadow-2xs opacity-80"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg border border-gray-200">
                      💤
                    </div>
                  )}
                  <span className="absolute -top-2 -left-2 bg-gray-500 text-white rounded-full p-1 shadow-xs">
                    <AlertTriangle size={13} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md">
                      Least Ordered ({getTimeframeLabel(itemTimeframe)})
                    </span>
                    {leastOrdered?.category && (
                      <span className="text-xs text-gray-500 capitalize">{leastOrdered.category}</span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 truncate mt-1">
                    {leastOrdered?.name || 'No data available'}
                  </h4>
                  {leastOrdered ? (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Sold: <strong className="text-gray-800">{leastOrdered.total_quantity} units</strong>
                      {Number(leastOrdered.total_sales) > 0 && (
                        <span className="ml-2 text-gray-500">
                          (₹{Number(leastOrdered.total_sales).toFixed(0)} sales)
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">No product demand recorded for {getTimeframeLabel(itemTimeframe).toLowerCase()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ranked Items Table */}
            {itemsByTime.all && itemsByTime.all.length > 0 && (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">Rank</th>
                      <th className="px-4 py-2.5">Menu Item</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-center">Quantity Sold</th>
                      <th className="px-4 py-2.5 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {itemsByTime.all.map((item: MetricItem, idx: number) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-center font-bold text-gray-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-gray-900 flex items-center gap-2">
                          {item.name}
                        </td>
                        <td className="px-4 py-2.5 capitalize text-gray-500">{item.category}</td>
                        <td className="px-4 py-2.5 text-right">₹{Number(item.price).toFixed(0)}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-brand-brown-dark">
                          {item.total_quantity}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-green-600">
                          ₹{Number(item.total_sales).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: KITCHEN QUEUE & QUICK SHORTCUTS                */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Queue Status */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-brand-brown-dark flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-brand-gold-dark" />
                    Kitchen Queue Status
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    {data?.queue?.totalActive || 0} active
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-yellow-50 rounded-xl text-yellow-900 font-medium">
                    <span>Pending Approval:</span>
                    <strong className="text-sm font-extrabold">{data?.queue?.pending || 0}</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-xl text-blue-900 font-medium">
                    <span>Being Prepared:</span>
                    <strong className="text-sm font-extrabold">{data?.queue?.preparing || 0}</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-green-50 rounded-xl text-green-900 font-medium">
                    <span>Ready for Pickup:</span>
                    <strong className="text-sm font-extrabold">{data?.queue?.ready || 0}</strong>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/orders"
                className="mt-4 flex items-center justify-center gap-2 py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark text-xs font-bold rounded-xl transition shadow-2xs"
              >
                Go to Active Orders Board <ArrowRight size={14} />
              </Link>
            </div>

            {/* Quick Links (2 columns) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/orders/sheet"
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-brand-gold hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-brown-dark">
                      Daily Order Sheet
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Filter by date and export PDF printout</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  Open Sheet <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/dashboard/students"
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-brand-gold hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                    <Users size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-brown-dark">
                      Students & Wallets
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Top-up wallets, inspect orders & ledger</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  Manage Wallets <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/dashboard/menu"
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-brand-gold hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <Utensils size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-brown-dark">
                      Menu Catalog
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Add dishes, set prices & upload photos</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  Edit Menu <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/dashboard/schools"
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-brand-gold hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-brown-dark">
                      Schools & Branches
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Configure campus locations and canteen access</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-blue-700 flex items-center gap-1">
                  Manage Schools <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// React Building2 helper import
import { Building2 } from 'lucide-react';
